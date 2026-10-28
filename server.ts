import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client setup
let ai: GoogleGenAI | null = null;
const isRealKey = process.env.GEMINI_API_KEY && 
  process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' && 
  process.env.GEMINI_API_KEY.length > 10;

if (isRealKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// 1. AI Resource Matching Endpoint
app.post('/api/gemini/match', async (req, res) => {
  const { projectDescription, budget, location, date, resources } = req.body;

  if (!resources || !Array.isArray(resources) || resources.length === 0) {
    return res.json({ matches: [], isFallback: true, message: 'No eligible resources provided.' });
  }

  // If Gemini API is not configured or placeholder, perform rule-based matching fallback immediately
  if (!ai || !isRealKey) {
    const fallbackMatches = performKeywordFallback(projectDescription, resources);
    return res.json({
      matches: fallbackMatches,
      isFallback: true,
      message: 'AI unavailable (no API key configured). Showing keyword & eligibility matches.',
    });
  }

  try {
    const candidateSummary = resources.map((r: any) => ({
      id: r.id,
      title: r.title,
      type: r.resourceType,
      category: r.category,
      price: r.priceMode === 'free' ? 'Free' : `₹${r.price} ${r.priceUnit || ''}`,
      riskLevel: r.riskLevel,
      location: r.location,
      description: r.description,
    }));

    const prompt = `You are an expert resource matcher for IDLETOIDEA (a shared makerspace & equipment platform).
A user is describing a project:
"${projectDescription || 'Makerspace project work'}"
User budget preference: ${budget ? `₹${budget}` : 'Any'}
User preferred date/timeline: ${date || 'Anytime'}
User preferred location: ${location || 'Any'}

Here are the pre-screened eligible resources available in the institution:
${JSON.stringify(candidateSummary, null, 2)}

Instructions:
1. Recommend up to 3 best matching resources from the given candidates.
2. Only use IDs from the provided list. Do NOT invent new IDs.
3. Return a STRICT JSON ARRAY of objects, where each object has:
   - "resourceId": string (must match an id from the list)
   - "reason": string (short 1-2 sentence explanation of why this equipment/workspace matches the project description)
4. Do not include markdown codeblocks or quotes outside the JSON array. Output raw valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '[]';
    let parsed: any[] = [];
    try {
      // Clean possible markdown code fences if present
      const cleanJson = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      console.warn('Could not parse Gemini JSON response, using fallback:', text);
      parsed = performKeywordFallback(projectDescription, resources);
      return res.json({
        matches: parsed,
        isFallback: true,
        message: 'AI formatting error. Showing keyword matches.',
      });
    }

    // Validate that IDs exist in resources
    const validIds = new Set(resources.map((r: any) => r.id));
    const validatedMatches = (Array.isArray(parsed) ? parsed : [])
      .filter((m: any) => m && validIds.has(m.resourceId))
      .slice(0, 3);

    if (validatedMatches.length === 0) {
      const fallback = performKeywordFallback(projectDescription, resources);
      return res.json({
        matches: fallback,
        isFallback: true,
        message: 'AI suggested matches were outside available inventory. Showing keyword matches.',
      });
    }

    return res.json({
      matches: validatedMatches,
      isFallback: false,
      message: 'AI-generated recommendation. Advisory only.',
    });
  } catch (error: any) {
    console.error('Gemini match error:', error);
    const fallback = performKeywordFallback(projectDescription, resources);
    return res.json({
      matches: fallback,
      isFallback: true,
      message: 'AI unavailable. Showing keyword & attribute matches.',
    });
  }
});

// 2. AI Incident Summarization Endpoint
app.post('/api/gemini/summarize-incident', async (req, res) => {
  const { reportText, timelineEvents, conditionRecords, userResponse } = req.body;

  // Build fallback summary
  const fallbackSummary = {
    reportedAllegations: [reportText || 'Incident reported regarding resource condition during session.'],
    verifiedFacts: [
      conditionRecords?.beforeCondition ? `Check-out condition noted: "${conditionRecords.beforeCondition}"` : 'Check-out condition logged in audit timeline.',
      conditionRecords?.returnCondition ? `Return condition recorded: "${conditionRecords.returnCondition}"` : 'Return timestamp recorded.',
    ].filter(Boolean),
    missingInformation: [
      'Awaiting formal inspection photos verification.',
      userResponse ? 'Requester response submitted and logged.' : 'Requester statement pending.',
    ],
    timeline: (timelineEvents || []).slice(0, 5).map((e: any) => `${e.time || 'Timestamp'}: ${e.action || e.summary}`),
  };

  if (!ai || !process.env.GEMINI_API_KEY) {
    return res.json({
      summary: fallbackSummary,
      isFallback: true,
      message: 'AI unavailable (no API key configured). Showing rule-based structured incident summary.',
    });
  }

  try {
    const prompt = `You are a neutral incident summarizer for IDLETOIDEA (makerspace shared resource system).
You must analyze this incident report with strict neutrality. Do NOT take sides, assign blame, or suggest penalties.
An incident report is an allegation until formally reviewed.

Reported details (names replaced by roles):
- Report text: "${reportText || 'No description provided'}"
- Check-out condition logged: "${conditionRecords?.beforeCondition || 'None'}"
- Return condition logged: "${conditionRecords?.returnCondition || 'None'}"
- Requester Response: "${userResponse || 'No response provided yet'}"
- System timeline events: ${JSON.stringify(timelineEvents || [])}

Instructions:
1. Separate reported allegations (claims made by the reporter) from verified facts (recorded timestamps, documented conditions).
2. Note any missing information or unanswered questions.
3. Keep the tone completely neutral and advisory.
4. Return a STRICT JSON object in this exact structure:
{
  "reportedAllegations": ["string", "string"],
  "verifiedFacts": ["string", "string"],
  "missingInformation": ["string", "string"],
  "timeline": ["string", "string"]
}
5. Do NOT output markdown code blocks or conversational text. Output pure JSON only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '{}';
    let parsed: any = null;
    try {
      const cleanJson = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      console.warn('Could not parse Gemini incident summary JSON:', text);
      return res.json({
        summary: fallbackSummary,
        isFallback: true,
        message: 'AI formatting error. Showing rule-based summary.',
      });
    }

    return res.json({
      summary: {
        reportedAllegations: Array.isArray(parsed.reportedAllegations) ? parsed.reportedAllegations : fallbackSummary.reportedAllegations,
        verifiedFacts: Array.isArray(parsed.verifiedFacts) ? parsed.verifiedFacts : fallbackSummary.verifiedFacts,
        missingInformation: Array.isArray(parsed.missingInformation) ? parsed.missingInformation : fallbackSummary.missingInformation,
        timeline: Array.isArray(parsed.timeline) ? parsed.timeline : fallbackSummary.timeline,
      },
      isFallback: false,
      message: 'AI-generated summary. Advisory only.',
    });
  } catch (error: any) {
    console.error('Gemini summarize incident error:', error);
    return res.json({
      summary: fallbackSummary,
      isFallback: true,
      message: 'AI service unavailable. Showing rule-based incident summary.',
    });
  }
});

function performKeywordFallback(description: string, resources: any[]) {
  const query = (description || '').toLowerCase();
  const scored = resources.map((r) => {
    let score = 0;
    const combined = `${r.title} ${r.description} ${r.category} ${r.resourceType}`.toLowerCase();

    if (query) {
      const words = query.split(/\s+/).filter((w) => w.length > 2);
      for (const w of words) {
        if (combined.includes(w)) score += 3;
      }
      if (query.includes('3d') || query.includes('print') || query.includes('prototype') || query.includes('plastic')) {
        if (combined.includes('3d') || combined.includes('printer')) score += 5;
      }
      if (query.includes('laser') || query.includes('cut') || query.includes('acrylic') || query.includes('wood')) {
        if (combined.includes('laser')) score += 5;
      }
      if (query.includes('workspace') || query.includes('room') || query.includes('desk') || query.includes('bench') || query.includes('meeting')) {
        if (r.resourceType === 'workspace') score += 5;
      }
      if (query.includes('tool') || query.includes('hand') || query.includes('screwdriver') || query.includes('pliers')) {
        if (combined.includes('tool')) score += 5;
      }
      if (query.includes('circuit') || query.includes('electronic') || query.includes('oscilloscope') || query.includes('signal')) {
        if (combined.includes('oscilloscope')) score += 5;
      }
    } else {
      score = 1;
    }

    return { resource: r, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((item) => ({
    resourceId: item.resource.id,
    reason: `Matched based on equipment category (${item.resource.category}) and availability.`,
  }));
}

// Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`IDLETOIDEA server running on port ${port}`);
  });
}

startServer();
