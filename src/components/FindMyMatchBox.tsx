import React, { useState } from 'react';
import { Sparkles, Search, Compass, AlertCircle, CheckCircle2, ChevronRight, Coins, Calendar, MapPin } from 'lucide-react';
import { Resource, User } from '../types';
import { IdleToIdeaService } from '../services/idleToIdeaService';

interface FindMyMatchBoxProps {
  currentUser: User;
  onSelectResource: (resource: Resource) => void;
}

export const FindMyMatchBox: React.FC<FindMyMatchBoxProps> = ({ currentUser, onSelectResource }) => {
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<{ resourceId: string; reason: string }[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [isFallback, setIsFallback] = useState(false);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setStatusMessage('');
    setMatches([]);

    try {
      // Pre-filter candidate resources that are active & not permanently restricted
      const allResources = IdleToIdeaService.getResources();
      const eligibleCandidates = allResources.filter((r) => {
        if (r.listingState !== 'active') return false;
        if (budget && r.priceMode === 'paid' && r.price > Number(budget)) return false;
        return true;
      });

      const res = await fetch('/api/gemini/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectDescription: description,
          budget,
          location,
          resources: eligibleCandidates,
        }),
      });

      const data = await res.json();
      setMatches(data.matches || []);
      setIsFallback(!!data.isFallback);
      setStatusMessage(data.message || (data.isFallback ? 'Showing keyword matches' : 'AI-generated recommendation. Advisory only.'));
    } catch (err) {
      console.error('Match request error:', err);
      // Client-side fallback
      const allResources = IdleToIdeaService.getResources();
      const q = description.toLowerCase();
      const matched = allResources
        .filter((r) => r.listingState === 'active')
        .slice(0, 3)
        .map((r) => ({
          resourceId: r.id,
          reason: `Recommended based on equipment category (${r.category}) and available slots.`,
        }));
      setMatches(matched);
      setIsFallback(true);
      setStatusMessage('AI service unavailable. Showing keyword matches.');
    } finally {
      setLoading(false);
    }
  };

  const allResources = IdleToIdeaService.getResources();

  return (
    <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1a060e] via-[#240813] to-[#120409] border border-[#5c0f20] shadow-2xl relative overflow-hidden">
      {/* Decorative Film Glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#f5b5c8]/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#3b0e19]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#8a1731] to-[#3b0914] border border-[#f5b5c8]/40 shadow-md">
            <Sparkles className="w-5 h-5 text-[#f5b5c8]" />
          </div>
          <div>
            <h3 className="text-base font-black font-cinematic uppercase tracking-wider text-[#faedf1] flex items-center space-x-2">
              <span>Find My Match</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3b0914] text-[#f5b5c8] border border-[#5c0f20] font-mono-film font-normal">
                Gemini 3.8 Flash
              </span>
            </h3>
            <p className="text-xs text-[#c4adb5] font-serif-cozy italic">
              Describe your prototype or project needs. We rank eligible equipment and spaces.
            </p>
          </div>
        </div>
        <div className="mt-2 sm:mt-0 text-[10px] text-[#e094aa] font-mono-film">
          Advisory only • Never overrides safety rules
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleMatch} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[#fde8ef] mb-1">
            What are you building or looking to fabricate?
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. I need to slice and print a high-strength bionic gripper in PETG filament, or cut 5mm acrylic gears for a robotics thesis."
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] focus:border-[#f5b5c8] focus:ring-1 focus:ring-[#f5b5c8] text-xs text-[#faedf1] placeholder-[#7a646c] outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#c4adb5] mb-1 flex items-center space-x-1">
              <Coins className="w-3 h-3 text-[#f5b5c8]" />
              <span>Max Budget (₹ INR, optional)</span>
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 500"
              className="w-full px-3 py-1.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] focus:border-[#f5b5c8] text-xs text-[#faedf1] placeholder-[#7a646c] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#c4adb5] mb-1 flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-[#f5b5c8]" />
              <span>Preferred Zone / Bay (optional)</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Prototyping Bay or Room 204"
              className="w-full px-3 py-1.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] focus:border-[#f5b5c8] text-xs text-[#faedf1] placeholder-[#7a646c] outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-[#c4adb5] hidden sm:block">
            Pre-filters active listings before ranking
          </div>

          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5c0f20] via-[#8a1731] to-[#5c0f20] text-[#fff] border border-[#f5b5c8]/50 text-xs font-semibold shadow-lg shadow-[#8a1731]/30 hover:scale-[1.02] disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Compass className="w-4 h-4 animate-spin text-[#f5b5c8]" />
                <span>Consulting Model...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-[#f5b5c8]" />
                <span>Find My Match</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results View */}
      {statusMessage && (
        <div className="mt-4 pt-4 border-t border-[#3b0e19]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono-film text-[#f5b5c8]">
              {isFallback ? 'KEYWORD MATCH RESULTS' : 'AI MATCH RESULTS'}
            </span>
            <span className="text-[10px] text-[#c4adb5] bg-[#1a070f] px-2 py-0.5 rounded border border-[#3b0e19]">
              {statusMessage}
            </span>
          </div>

          {matches.length === 0 ? (
            <div className="p-3 text-center text-xs text-[#c4adb5] bg-[#0d0407] rounded-xl border border-[#3b0e19]">
              No direct matches found. Try broadening your project keywords.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {matches.map((m) => {
                const res = allResources.find((r) => r.id === m.resourceId);
                if (!res) return null;

                return (
                  <div
                    key={m.resourceId}
                    onClick={() => onSelectResource(res)}
                    className="p-3 rounded-2xl bg-[#14060c] border border-[#5c0f20] hover:border-[#f5b5c8] transition-all cursor-pointer group shadow-md"
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#e094aa] mb-1 font-mono-film">
                      <span>{res.category}</span>
                      <span className="text-[#f5b5c8] bg-[#290913] px-1.5 py-0.5 rounded">
                        AI Suggested
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#faedf1] group-hover:text-[#f5b5c8] transition-colors truncate">
                      {res.title}
                    </h4>

                    <p className="mt-1 text-[11px] text-[#c4adb5] line-clamp-2">
                      {m.reason}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#fde8ef] pt-2 border-t border-[#260810]">
                      <span className="font-semibold">
                        {res.priceMode === 'free' ? 'Free' : `₹${res.price}`}
                      </span>
                      <span className="inline-flex items-center space-x-1 text-[#f5b5c8] font-medium group-hover:translate-x-0.5 transition-transform">
                        <span>View</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
