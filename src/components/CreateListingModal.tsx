import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Sparkles,
  Shield,
  ShieldAlert,
  Coins,
  Clock,
  Layers,
  Wrench,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { Resource, User as UserType, RiskLevel, PriceMode, TransferMode, ApprovalMode } from '../types';
import { IdleToIdeaService } from '../services/idleToIdeaService';

interface CreateListingModalProps {
  currentUser: UserType;
  onClose: () => void;
  onListingCreated: (message: string) => void;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  currentUser,
  onClose,
  onListingCreated,
}) => {
  const [title, setTitle] = useState('');
  const [resourceType, setResourceType] = useState<'equipment' | 'workspace'>('equipment');
  const [category, setCategory] = useState('Fabrication & CNC');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Makerspace Bay 2 - Precision Machining');
  const [priceMode, setPriceMode] = useState<PriceMode>('free');
  const [transferMode, setTransferMode] = useState<TransferMode>('temporary');
  const [price, setPrice] = useState<number>(0);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('medium');
  const [trainingRequired, setTrainingRequired] = useState(true);
  const [supervisedAccess, setSupervisedAccess] = useState(false);
  const [safetyNotes, setSafetyNotes] = useState('');
  const [ppeText, setPpeText] = useState('Safety glasses, ear protection');
  const [prohibitedUses, setProhibitedUses] = useState('');
  const [conditionSummary, setConditionSummary] = useState('Well calibrated, tooling sharp');
  const [accessoriesText, setAccessoriesText] = useState('Collet wrench set, emergency stop key, dust boot');
  const [collectionPoint, setCollectionPoint] = useState('Bay 2 CNC station');
  const [setupNotes, setSetupNotes] = useState('Zero Z-axis using touch probe block');
  const [returnInstructions, setReturnInstructions] = useState('Vacuum MDF bed, clean collet, return endmills to index box');
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>('supervisor-review');
  const [highDemand, setHighDemand] = useState(true);

  // Policy Settings
  const [bookingCap, setBookingCap] = useState(2);
  const [cancellationNoticeHours, setCancellationNoticeHours] = useState(4);
  const [graceMinutes, setGraceMinutes] = useState(15);
  const [autoExtendEnabled, setAutoExtendEnabled] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // "Fill with Example" helper for judges
  const handleFillWithExample = () => {
    setTitle('Demo 3-Axis Desktop CNC Mill');
    setResourceType('equipment');
    setCategory('Fabrication & CNC');
    setDescription(
      'Precision 3-axis CNC router with 400x400mm aluminum T-slot bed and 1.5kW air-cooled spindle. Cuts aluminum sheet, hardwoods, Delrin, and carbon fiber plates with active mist lubrication.'
    );
    setLocation('Makerspace Bay 2 - Machining Cell');
    setPriceMode('free');
    setTransferMode('temporary');
    setPrice(0);
    setRiskLevel('high');
    setTrainingRequired(true);
    setSupervisedAccess(true);
    setSafetyNotes(
      'High rotational inertia. Flying debris hazard. NEVER operate without full enclosure and eye protection. Tie back hair and remove jewelry.'
    );
    setPpeText('Impact-rated ANSI Z87.1 safety glasses, Hearing protection (NRR 25+), Closed-toe shoes');
    setProhibitedUses('Hardened tool steels, glass, unverified hazardous composite laminates');
    setConditionSummary('Factory calibrated, ER11 collet system verified, spindle runout < 0.01mm.');
    setAccessoriesText('ER11 1/8" and 1/4" collets, collet wrenches, Z-touch probe, hold-down clamp kit');
    setCollectionPoint('Bay 2 Safety Station. Key issued by Supervisor Sam Iyer.');
    setSetupNotes('Generate G-code using Autodesk Fusion 360 with Grbl post-processor. Run air-cut simulation first.');
    setReturnInstructions('Vacuum aluminum swarf, brush T-slots, wipe spindle shaft with light mineral oil.');
    setApprovalMode('supervisor-review');
    setHighDemand(true);
    setBookingCap(2);
    setCancellationNoticeHours(4);
    setGraceMinutes(15);
    setAutoExtendEnabled(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please provide title and description.');
      return;
    }

    try {
      setSubmitting(true);
      const ppe = ppeText.split(',').map((s) => s.trim()).filter(Boolean);
      const accessories = accessoriesText.split(',').map((s) => s.trim()).filter(Boolean);

      // Generate 5 slots for this new equipment
      const demoNow = new Date(IdleToIdeaService.getDemoClock());
      const slots = [];
      for (let h = 10; h < 15; h++) {
        const start = new Date(demoNow);
        start.setUTCHours(h, 0, 0, 0);
        const end = new Date(demoNow);
        end.setUTCHours(h + 1, 0, 0, 0);
        slots.push({
          id: `slot_new_${Date.now()}_h${h}`,
          resourceId: '',
          start: start.toISOString(),
          end: end.toISOString(),
          state: 'available' as const,
        });
      }

      const result = IdleToIdeaService.createListing(
        currentUser,
        {
          title,
          resourceType,
          category,
          description,
          photos: [
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
          ],
          location,
          status: 'available',
          priceMode,
          transferMode,
          price,
          priceUnit: priceMode === 'paid' ? '/ hour (simulated)' : undefined,
          riskLevel,
          trainingRequired,
          supervisedAccess,
          allowedUsers: 'Enrolled students, researchers, makerspace members with verified training',
          safetyNotes,
          ppe,
          prohibitedUses,
          conditionSummary,
          accessories,
          collectionPoint,
          setupNotes,
          returnInstructions,
          approvalMode,
          highDemand,
          policies: {
            bookingCap,
            waitlistOfferHours: 24,
            pendingExpiryHours: 48,
            minNoticeHours: 1,
            cancellationNoticeHours,
            noShowMinutes: 15,
            repeatedNoShowThreshold: 2,
            simulatedCancellationFeePercent: 0,
            graceMinutes,
            autoExtendEnabled,
            maxExtensionMinutes: 60,
          },
          assignedSupervisorIds: ['user_sam'],
        },
        slots
      );

      onListingCreated(result.message);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0f050a] border border-[#5c0f20] shadow-2xl p-5 sm:p-6 flex flex-col text-[#faedf1] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3b0e19]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#8a1731] to-[#3b0914] border border-[#f5b5c8]/50">
              <PlusCircle className="w-5 h-5 text-[#f5b5c8]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-cinematic uppercase tracking-wide text-[#faedf1]">
                Publish Underused Resource
              </h3>
              <p className="text-xs text-[#c4adb5] font-mono-film">
                Owner: {currentUser.displayName} ({currentUser.verificationLabel})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleFillWithExample}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#260810] hover:bg-[#3d0f1c] text-[#f5b5c8] border border-[#731627] text-xs font-semibold shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#f5b5c8]" />
              <span>Fill with Example (for Judges)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#c4adb5] hover:text-[#fff] hover:bg-[#3b0e19] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="py-4 space-y-5 text-xs">
          {/* Core Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#fde8ef] mb-1">
                Resource Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Precision Desktop CNC Mill"
                className="w-full px-3 py-2 rounded-xl bg-[#0c0407] border border-[#3b0e19] focus:border-[#f5b5c8] text-xs text-[#faedf1] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c4adb5] mb-1">
                Resource Classification
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#0c0407] border border-[#3b0e19] focus:border-[#f5b5c8] text-xs text-[#faedf1] outline-none"
              >
                <option value="equipment">Physical Equipment / Tool</option>
                <option value="workspace">Workspace / Dedicated Room</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c4adb5] mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0c0407] border border-[#3b0e19] focus:border-[#f5b5c8] text-xs text-[#faedf1] outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#c4adb5] mb-1">
                Description & Capabilities
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0c0407] border border-[#3b0e19] focus:border-[#f5b5c8] text-xs text-[#faedf1] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c4adb5] mb-1">
                Physical Location / Bay
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0c0407] border border-[#3b0e19] focus:border-[#f5b5c8] text-xs text-[#faedf1] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c4adb5] mb-1">
                Collection & Check-in Point
              </label>
              <input
                type="text"
                value={collectionPoint}
                onChange={(e) => setCollectionPoint(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0c0407] border border-[#3b0e19] focus:border-[#f5b5c8] text-xs text-[#faedf1] outline-none"
              />
            </div>
          </div>

          {/* Access Model Matrix: Price & Transfer */}
          <div className="p-4 rounded-2xl bg-[#14060c] border border-[#3b0e19] space-y-3">
            <h4 className="text-xs font-semibold text-[#f5b5c8] uppercase font-mono-film">
              Transaction & Access Model
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-[#c4adb5] mb-1">Price Mode</label>
                <select
                  value={priceMode}
                  onChange={(e) => setPriceMode(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] text-xs text-[#faedf1]"
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid (Fictional)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#c4adb5] mb-1">Transfer Mode</label>
                <select
                  value={transferMode}
                  onChange={(e) => setTransferMode(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] text-xs text-[#faedf1]"
                >
                  <option value="temporary">Temporary (Borrow/Rent)</option>
                  <option value="permanent">Permanent (Giveaway/Sale)</option>
                </select>
              </div>

              {priceMode === 'paid' && (
                <div>
                  <label className="block text-[11px] text-[#c4adb5] mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] text-xs text-[#faedf1]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] text-[#c4adb5] mb-1">Approval Mode</label>
                <select
                  value={approvalMode}
                  onChange={(e) => setApprovalMode(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] text-xs text-[#faedf1]"
                >
                  <option value="supervisor-review">Supervisor Review</option>
                  <option value="owner-review">Owner Review</option>
                  <option value="auto-if-low-risk">Auto-confirm (Low risk)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Conditional Safety & Risk Controls */}
          <div className="p-4 rounded-2xl bg-[#17060e] border border-[#5c0f20] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#f5b5c8] uppercase font-mono-film">
                Risk Classification & Safety Gates
              </h4>
              <span className="text-[10px] text-[#e094aa] font-mono-film">
                {currentUser.verificationLabel === 'Unverified owner' && riskLevel === 'high'
                  ? 'High risk + Unverified = Requires Admin Spot-check'
                  : 'Self-governed safety gates'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-[#c4adb5] mb-1">Risk Level</label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] text-xs text-[#faedf1]"
                >
                  <option value="low">Low Risk (Table, Hand Tools)</option>
                  <option value="medium">Medium Risk (3D Printer)</option>
                  <option value="high">High Risk (Laser Cutter, CNC, Lathe)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="chk_train"
                  checked={trainingRequired}
                  onChange={(e) => setTrainingRequired(e.target.checked)}
                  className="rounded bg-[#0c0407] border-[#3b0e19]"
                />
                <label htmlFor="chk_train" className="text-xs text-[#faedf1] cursor-pointer">
                  Mandatory Safety Quiz
                </label>
              </div>

              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="chk_sup"
                  checked={supervisedAccess}
                  onChange={(e) => setSupervisedAccess(e.target.checked)}
                  className="rounded bg-[#0c0407] border-[#3b0e19]"
                />
                <label htmlFor="chk_sup" className="text-xs text-[#faedf1] cursor-pointer">
                  Supervisor Physical Sign-off
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#c4adb5] mb-1">Safety Notes & Hazards</label>
              <textarea
                rows={2}
                value={safetyNotes}
                onChange={(e) => setSafetyNotes(e.target.value)}
                placeholder="High heat, rotating tools, or optical radiation warnings..."
                className="w-full px-3 py-1.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] text-xs text-[#faedf1]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#c4adb5] mb-1">Required PPE (comma separated)</label>
                <input
                  type="text"
                  value={ppeText}
                  onChange={(e) => setPpeText(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] text-xs text-[#faedf1]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#c4adb5] mb-1">Prohibited Materials / Uses</label>
                <input
                  type="text"
                  value={prohibitedUses}
                  onChange={(e) => setProhibitedUses(e.target.value)}
                  placeholder="e.g. PVC, Vinyl, toxic resins"
                  className="w-full px-3 py-1.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] text-xs text-[#faedf1]"
                />
              </div>
            </div>
          </div>

          {/* Allocation Policies */}
          <div className="p-4 rounded-2xl bg-[#14060c] border border-[#3b0e19] space-y-3">
            <h4 className="text-xs font-semibold text-[#f5b5c8] uppercase font-mono-film">
              Fair Allocation Policies
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-[#c4adb5] mb-1">Active Booking Cap</label>
                <input
                  type="number"
                  value={bookingCap}
                  onChange={(e) => setBookingCap(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] text-xs text-[#faedf1]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#c4adb5] mb-1">Cancel Notice (Hrs)</label>
                <input
                  type="number"
                  value={cancellationNoticeHours}
                  onChange={(e) => setCancellationNoticeHours(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] text-xs text-[#faedf1]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#c4adb5] mb-1">Overdue Grace (Mins)</label>
                <input
                  type="number"
                  value={graceMinutes}
                  onChange={(e) => setGraceMinutes(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] text-xs text-[#faedf1]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="chk_ext"
                  checked={autoExtendEnabled}
                  onChange={(e) => setAutoExtendEnabled(e.target.checked)}
                  className="rounded bg-[#0c0407] border-[#3b0e19]"
                />
                <label htmlFor="chk_ext" className="text-xs text-[#faedf1] cursor-pointer">
                  Auto-Extend Enabled
                </label>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-700 text-xs text-rose-200">
              {errorMessage}
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-3 border-t border-[#3b0e19] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1f0710] text-xs text-[#c4adb5] hover:text-[#faedf1]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5c0f20] via-[#8a1731] to-[#5c0f20] text-[#fff] border border-[#f5b5c8]/60 text-xs font-semibold shadow-lg shadow-[#8a1731]/40 hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
            >
              Publish Resource Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
