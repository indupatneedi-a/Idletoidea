import React from 'react';
import { MapPin, Calendar, CheckCircle2, ShieldCheck, ShieldAlert, Sparkles, User, Tag, Clock } from 'lucide-react';
import { Resource } from '../types';
import { StatusChip, RiskChip, AccessModelChip } from './StatusChip';

interface ResourceCardProps {
  resource: Resource;
  onSelect: (resource: Resource) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onSelect }) => {
  // Find next available slot for temporary resources
  const availableSlots = resource.availabilitySlots.filter((s) => s.state === 'available');
  const nextSlot = availableSlots[0];

  const formatSlotTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div
      onClick={() => onSelect(resource)}
      className="group rounded-3xl bg-[#12060b] border border-[#3b0e19] hover:border-[#f5b5c8]/70 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#8a1731]/20 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Photo with Overlay Badge */}
      <div className="relative h-48 w-full overflow-hidden bg-[#1f0912]">
        <img
          src={resource.photos[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'}
          alt={resource.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <AccessModelChip
            priceMode={resource.priceMode}
            transferMode={resource.transferMode}
            price={resource.price}
            priceUnit={resource.priceUnit}
          />
        </div>

        <div className="absolute top-3 right-3 z-10">
          <StatusChip status={resource.status} size="sm" />
        </div>

        {/* Owner Verification Tag on Image Bottom */}
        <div className="absolute bottom-2 left-3 z-10">
          <span
            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono-film backdrop-blur-md ${
              resource.ownerId === 'user_dev'
                ? 'bg-[#290c15]/90 border border-amber-600/70 text-amber-200'
                : 'bg-[#1a070f]/90 border border-emerald-500/70 text-emerald-200'
            }`}
          >
            {resource.ownerId === 'user_dev' ? (
              <>
                <ShieldAlert className="w-2.5 h-2.5 text-amber-400" />
                <span>Unverified owner</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                <span>Demo verified</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Location */}
          <div className="flex items-center justify-between text-[11px] text-[#e094aa] font-mono-film mb-1.5">
            <span className="uppercase tracking-wider">{resource.category}</span>
            <div className="flex items-center space-x-1 text-[#c4adb5] truncate max-w-[160px]">
              <MapPin className="w-3 h-3 text-[#f5b5c8] shrink-0" />
              <span className="truncate">{resource.location}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold font-cinematic uppercase tracking-wide text-[#faedf1] group-hover:text-[#f5b5c8] transition-colors line-clamp-1">
            {resource.title}
          </h3>

          {/* Short Description */}
          <p className="mt-2 text-xs text-[#c4adb5] line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        </div>

        {/* Footer Meta: Risk & Next Slot */}
        <div className="mt-4 pt-3 border-t border-[#260a12] space-y-2">
          <div className="flex items-center justify-between">
            <RiskChip risk={resource.riskLevel} />
            {resource.highDemand && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3b0914] text-[#f5b5c8] border border-[#5c0f20] font-mono-film">
                Cap: {resource.policies.bookingCap}
              </span>
            )}
          </div>

          {resource.transferMode === 'temporary' ? (
            <div className="flex items-center justify-between text-[11px] text-[#faedf1] bg-[#1a070f] px-3 py-1.5 rounded-xl border border-[#300e19]">
              <span className="text-[#c4adb5] flex items-center space-x-1">
                <Clock className="w-3 h-3 text-[#f5b5c8]" />
                <span>Next Slot:</span>
              </span>
              <span className="font-mono-film text-[#fde8ef] font-medium truncate ml-1">
                {nextSlot ? formatSlotTime(nextSlot.start) : 'No slots open'}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-[#faedf1] bg-[#1a070f] px-3 py-1.5 rounded-xl border border-[#300e19]">
              <span className="text-[#c4adb5] flex items-center space-x-1">
                <Tag className="w-3 h-3 text-[#f5b5c8]" />
                <span>Transfer:</span>
              </span>
              <span className="font-mono-film text-[#fde8ef] font-medium">
                Permanent Handover Flow
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
