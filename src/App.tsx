import React, { useState, useEffect } from 'react';
import {
  Film,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowRight,
  Shield,
  Layers,
  Clock,
  Coins,
  Tag,
  Gift,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';

import { dataStore, AppState } from './services/store';
import { IdleToIdeaService } from './services/idleToIdeaService';
import { Resource, RequestRecord, Incident, Quiz } from './types';

// Components
import { OpeningScreen } from './components/OpeningScreen';
import { Navbar } from './components/Navbar';
import { JudgeWalkthrough } from './components/JudgeWalkthrough';
import { FindMyMatchBox } from './components/FindMyMatchBox';
import { ResourceCard } from './components/ResourceCard';
import { ResourceDetailModal } from './components/ResourceDetailModal';
import { SafetyQuizModal } from './components/SafetyQuizModal';
import { CheckoutReturnModal } from './components/CheckoutReturnModal';
import { IncidentModal } from './components/IncidentModal';
import { TransactionTimelineModal } from './components/TransactionTimelineModal';
import { CreateListingModal } from './components/CreateListingModal';
import { RequesterDashboard } from './components/RequesterDashboard';
import { OwnerDashboard } from './components/OwnerDashboard';
import { SupervisorDashboard } from './components/SupervisorDashboard';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  const [storeState, setStoreState] = useState<AppState>(dataStore.getState());

  // Screen & Navigation States
  const [showOpeningScreen, setShowOpeningScreen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('discover');
  const [showWalkthrough, setShowWalkthrough] = useState<boolean>(false);
  const [walkthroughStepIndex, setWalkthroughStepIndex] = useState<number>(0);

  // Discovery Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriceMode, setSelectedPriceMode] = useState<string>('all');
  const [selectedTransferMode, setSelectedTransferMode] = useState<string>('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');

  // Modal States
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [checkoutReturnModalData, setCheckoutReturnModalData] = useState<{
    mode: 'checkout' | 'return';
    request: RequestRecord;
    resource: Resource;
  } | null>(null);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [timelineRequest, setTimelineRequest] = useState<RequestRecord | null>(null);
  const [showCreateListing, setShowCreateListing] = useState<boolean>(false);

  // Feedback Notification Toast
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    // Subscribe to store updates
    const unsubscribe = dataStore.subscribe(() => {
      setStoreState({ ...dataStore.getState() });
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 6000);
  };

  const currentUser = IdleToIdeaService.getCurrentUser();

  // Filtered resources for Discovery
  const filteredResources = IdleToIdeaService.searchResources({
    query: searchQuery,
    category: selectedCategory,
    priceMode: selectedPriceMode,
    transferMode: selectedTransferMode,
    riskLevel: selectedRiskLevel,
  });

  const CATEGORIES = [
    { id: 'all', label: 'All Equipment & Spaces' },
    { id: '3D Printing & Additive', label: '3D Printing' },
    { id: 'Fabrication & CNC', label: 'Fabrication & CNC' },
    { id: 'Workspaces & Assembly', label: 'Workspaces' },
    { id: 'Hand Tools & Hardware', label: 'Hand Tools' },
    { id: 'Electronics & Test Equipment', label: 'Electronics & Test' },
  ];

  return (
    <div className="min-h-screen bg-[#080406] text-[#faedf1] flex flex-col font-sans selection:bg-[#8a1731] selection:text-[#fff]">
      {/* 1. Cinematic Cozy Opening Screen (Tap to Enter requirement) */}
      {showOpeningScreen && (
        <OpeningScreen onEnter={() => setShowOpeningScreen(false)} />
      )}

      {/* 2. Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        allUsers={storeState.users}
        demoClock={storeState.demoClock}
        notifications={storeState.notifications}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenWalkthrough={() => setShowWalkthrough(true)}
        onReopenIntro={() => setShowOpeningScreen(true)}
        onOpenCreateListing={() => setShowCreateListing(true)}
        onResetData={() => {
          if (confirm('Reset all demo data back to clean initial state?')) {
            dataStore.resetAllData();
            showToast('All demo data has been reset to initial seed state.');
          }
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-[#3b0914] via-[#5c0f20] to-[#3b0914] border border-[#f5b5c8] text-xs text-[#faedf1] shadow-2xl shadow-[#8a1731]/50 flex items-center space-x-3 animate-in slide-in-from-bottom duration-300">
          <Sparkles className="w-5 h-5 text-[#f5b5c8] shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-[#c4adb5] hover:text-[#fff] text-sm">
            ×
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* DISCOVER TAB */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            {/* Cinematic Hero */}
            <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-[#240812] via-[#1a060e] to-[#0c0407] border border-[#5c0f20] shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-bl from-[#f5b5c8]/10 via-[#8a1731]/10 to-transparent blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#3b0914]/80 border border-[#8a1731] text-[#f5b5c8] text-xs font-mono-film uppercase tracking-wider">
                  <Film className="w-3.5 h-3.5 text-[#f5b5c8]" />
                  <span>IDLETOIDEA • Makerspace Protocol</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-cinematic uppercase tracking-wide text-[#faedf1] leading-tight">
                  Unlock Underused Equipment & Spaces
                </h1>

                <p className="text-xs sm:text-sm text-[#d6c4ca] font-serif-cozy italic leading-relaxed">
                  Connect student inventors, researchers, and project teams with high-precision 3D printers,
                  laser cutters, electronics benches, and surplus gear under transparent safety and fair-use rules.
                </p>

                {/* Hero Search Input */}
                <div className="pt-2 flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#f5b5c8] absolute left-4 top-3.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search equipment, category, keywords (e.g. 3D printer, laser, CNC, bench)..."
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0e0509] border border-[#4a1220] focus:border-[#f5b5c8] text-xs sm:text-sm text-[#faedf1] placeholder-[#7a646c] outline-none shadow-inner"
                    />
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-3 py-3 rounded-2xl bg-[#1f0810] text-xs text-[#c4adb5] hover:text-[#fff] border border-[#42101b]"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* AI "Find My Match" Assistant Box */}
            <FindMyMatchBox
              currentUser={currentUser}
              onSelectResource={(r) => setSelectedResource(r)}
            />

            {/* Category Filter Chips */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/60 shadow-md shadow-[#8a1731]/30'
                        : 'bg-[#14060c] text-[#c4adb5] hover:text-[#faedf1] border border-[#300e19] hover:border-[#5c0f20]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Secondary Filter Controls */}
            <div className="p-3.5 rounded-2xl bg-[#12060b] border border-[#300e19] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-1.5 text-[#c4adb5]">
                  <Filter className="w-3.5 h-3.5 text-[#f5b5c8]" />
                  <span className="font-semibold text-[#fde8ef]">Filters:</span>
                </div>

                {/* Price Filter */}
                <select
                  value={selectedPriceMode}
                  onChange={(e) => setSelectedPriceMode(e.target.value)}
                  className="px-2.5 py-1 rounded-xl bg-[#0c0407] border border-[#3b0e19] text-xs text-[#faedf1] outline-none"
                >
                  <option value="all">Price: All</option>
                  <option value="free">Free Access</option>
                  <option value="paid">Paid (Fictional Fee)</option>
                </select>

                {/* Transfer Filter */}
                <select
                  value={selectedTransferMode}
                  onChange={(e) => setSelectedTransferMode(e.target.value)}
                  className="px-2.5 py-1 rounded-xl bg-[#0c0407] border border-[#3b0e19] text-xs text-[#faedf1] outline-none"
                >
                  <option value="all">Transfer: All</option>
                  <option value="temporary">Temporary (Borrow / Rent)</option>
                  <option value="permanent">Permanent (Giveaway / Sale)</option>
                </select>

                {/* Risk Filter */}
                <select
                  value={selectedRiskLevel}
                  onChange={(e) => setSelectedRiskLevel(e.target.value)}
                  className="px-2.5 py-1 rounded-xl bg-[#0c0407] border border-[#3b0e19] text-xs text-[#faedf1] outline-none"
                >
                  <option value="all">Risk: All Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk (Quiz)</option>
                  <option value="high">High Risk (Quiz + Supervisor)</option>
                </select>
              </div>

              <div className="text-[11px] font-mono-film text-[#f5b5c8]">
                Showing {filteredResources.length} matching resources
              </div>
            </div>

            {/* Resources Grid */}
            {filteredResources.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#14060c] border border-[#3b0e19] space-y-2">
                <HelpCircle className="w-8 h-8 text-[#f5b5c8] mx-auto opacity-70" />
                <h4 className="text-sm font-bold text-[#faedf1] font-cinematic uppercase">
                  No Matching Equipment or Spaces
                </h4>
                <p className="text-xs text-[#c4adb5]">
                  Try clearing your search filters or broadening your terms.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedPriceMode('all');
                    setSelectedTransferMode('all');
                    setSelectedRiskLevel('all');
                  }}
                  className="mt-2 px-4 py-1.5 rounded-xl bg-[#240812] text-xs text-[#f5b5c8] border border-[#5c0f20]"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((res) => (
                  <ResourceCard
                    key={res.id}
                    resource={res}
                    onSelect={(r) => setSelectedResource(r)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* REQUESTER DASHBOARD */}
        {activeTab === 'my-requests' && (
          <RequesterDashboard
            currentUser={currentUser}
            requests={storeState.requests}
            resources={storeState.resources}
            waitlists={storeState.waitlistEntries}
            handovers={storeState.handoverRecords}
            onOpenTimeline={(req) => setTimelineRequest(req)}
            onOpenResource={(r) => setSelectedResource(r)}
            onRefresh={() => setStoreState({ ...dataStore.getState() })}
          />
        )}

        {/* OWNER DASHBOARD */}
        {activeTab === 'owner-dashboard' && (
          <OwnerDashboard
            currentUser={currentUser}
            allUsers={storeState.users}
            resources={storeState.resources}
            requests={storeState.requests}
            incidents={storeState.incidents}
            handovers={storeState.handoverRecords}
            onOpenCreateListing={() => setShowCreateListing(true)}
            onOpenCheckoutReturn={(mode, req, res) =>
              setCheckoutReturnModalData({ mode, request: req, resource: res })
            }
            onOpenIncident={(inc) => setActiveIncident(inc)}
            onOpenTimeline={(req) => setTimelineRequest(req)}
            onRefresh={() => setStoreState({ ...dataStore.getState() })}
          />
        )}

        {/* SUPERVISOR DASHBOARD */}
        {activeTab === 'supervisor-dashboard' && (
          <SupervisorDashboard
            currentUser={currentUser}
            allUsers={storeState.users}
            resources={storeState.resources}
            requests={storeState.requests}
            eligibilityRecords={storeState.eligibilityRecords}
            incidents={storeState.incidents}
            handovers={storeState.handoverRecords}
            onOpenCheckoutReturn={(mode, req, res) =>
              setCheckoutReturnModalData({ mode, request: req, resource: res })
            }
            onOpenIncident={(inc) => setActiveIncident(inc)}
            onOpenTimeline={(req) => setTimelineRequest(req)}
            onRefresh={() => setStoreState({ ...dataStore.getState() })}
          />
        )}

        {/* ADMIN DASHBOARD */}
        {activeTab === 'admin-dashboard' && (
          <AdminDashboard
            currentUser={currentUser}
            allUsers={storeState.users}
            resources={storeState.resources}
            auditLogs={storeState.auditLogs}
            ownerVerifications={storeState.ownerVerifications}
            onRefresh={() => setStoreState({ ...dataStore.getState() })}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#0a0507] border-t border-[#3b0e19] py-6 px-4 text-center text-xs text-[#c4adb5] font-mono-film">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-cinematic text-[#f5b5c8] font-bold">IDLETOIDEA</span>
            <span>• Shared Resource & Makerspace Network</span>
          </div>
          <div>
            Fictional prototype for makerspaces • Simulated payments & verifications
          </div>
        </div>
      </footer>

      {/* MODALS */}

      {/* Guided Judge Walkthrough Panel */}
      <JudgeWalkthrough
        isOpen={showWalkthrough}
        onClose={() => setShowWalkthrough(false)}
        currentStepIndex={walkthroughStepIndex}
        onSelectStep={(idx) => setWalkthroughStepIndex(idx)}
        currentUser={currentUser}
        auditLogs={storeState.auditLogs}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenCreateListing={() => setShowCreateListing(true)}
        onResetData={() => {
          dataStore.resetAllData();
          showToast('Demo data reset to clean initial state.');
        }}
      />

      {/* Resource Details Modal */}
      {selectedResource && (
        <ResourceDetailModal
          resource={selectedResource}
          currentUser={currentUser}
          onClose={() => setSelectedResource(null)}
          onOpenQuiz={(quizId) => {
            const q = IdleToIdeaService.getQuiz(quizId);
            if (q) {
              setActiveQuiz(q);
              setSelectedResource(null);
            }
          }}
          onRequestSubmitted={(msg) => {
            showToast(msg);
            setStoreState({ ...dataStore.getState() });
          }}
        />
      )}

      {/* Safety Quiz Modal */}
      {activeQuiz && (
        <SafetyQuizModal
          quiz={activeQuiz}
          currentUser={currentUser}
          onClose={() => setActiveQuiz(null)}
          onQuizCompleted={(passed, score) => {
            showToast(
              passed
                ? `Safety Certification Passed with ${score}%! You are now eligible to book.`
                : `Quiz attempt scored ${score}%. Retake available.`
            );
            setStoreState({ ...dataStore.getState() });
          }}
        />
      )}

      {/* Check-Out & Return Modal */}
      {checkoutReturnModalData && (
        <CheckoutReturnModal
          mode={checkoutReturnModalData.mode}
          request={checkoutReturnModalData.request}
          resource={checkoutReturnModalData.resource}
          currentUser={currentUser}
          existingHandover={storeState.handoverRecords.find(
            (h) => h.requestId === checkoutReturnModalData.request.id
          )}
          onClose={() => setCheckoutReturnModalData(null)}
          onSuccess={(msg) => {
            showToast(msg);
            setStoreState({ ...dataStore.getState() });
          }}
        />
      )}

      {/* Incident & AI Summarizer Modal */}
      {activeIncident && (
        <IncidentModal
          incident={activeIncident}
          currentUser={currentUser}
          resource={storeState.resources.find((r) => r.id === activeIncident.resourceId)}
          request={storeState.requests.find((r) => r.id === activeIncident.requestId)}
          handover={storeState.handoverRecords.find((h) => h.requestId === activeIncident.requestId)}
          onClose={() => setActiveIncident(null)}
          onIncidentUpdated={() => {
            setStoreState({ ...dataStore.getState() });
            showToast('Incident record updated successfully.');
          }}
        />
      )}

      {/* Transaction Timeline Modal */}
      {timelineRequest && (
        <TransactionTimelineModal
          request={timelineRequest}
          resource={storeState.resources.find((r) => r.id === timelineRequest.resourceId)}
          currentUser={currentUser}
          onClose={() => setTimelineRequest(null)}
        />
      )}

      {/* Create Listing Modal */}
      {showCreateListing && (
        <CreateListingModal
          currentUser={currentUser}
          onClose={() => setShowCreateListing(false)}
          onListingCreated={(msg) => {
            showToast(msg);
            setStoreState({ ...dataStore.getState() });
          }}
        />
      )}
    </div>
  );
}
