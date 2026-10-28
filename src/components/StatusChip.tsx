import React from 'react';
import {
  CheckCircle2,
  Clock,
  Hourglass,
  Sparkles,
  Ban,
  XCircle,
  PlayCircle,
  RotateCcw,
  AlertTriangle,
  Wrench,
  ShieldAlert,
  Gift,
  Tag,
  ShieldCheck,
  Shield,
  Coins,
} from 'lucide-react';
import { BookingStatus, RiskLevel, PriceMode, TransferMode } from '../types';

interface StatusChipProps {
  status: BookingStatus | 'available' | 'maintenance' | 'restricted' | 'paused';
  size?: 'sm' | 'md';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'paused':
      return (
        <span className={`inline-flex items-center space-x-1.5 rounded-full bg-neutral-900/80 border border-neutral-700 text-neutral-400 font-medium ${sizeClasses}`}>
          <Ban className="w-3.5 h-3.5 text-neutral-400" />
          <span>Paused</span>
        </span>
      );
    case 'available':
      return (
        <span className={`inline-flex items-center space-x-1.5 rounded-full bg-emerald-950/70 border border-emerald-600/50 text-emerald-200 font-medium ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Available</span>
        </span>
      );
    case 'pending-review':
      return (
        <span className={`inline-flex items-center space-x-1.5 rounded-full bg-amber-950/70 border border-amber-600/50 text-amber-200 font-medium ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Pending review</span>
        </span>
      );
    case 'waitlisted':
      return (
        <span className={`inline-flex items-center space-x-1.5 rounded-full bg-[#3b1220]/80 border border-[#f5b5c8]/50 text-[#fde8ef] font-medium ${sizeClasses}`}>
          <Hourglass className="w-3.5 h-3.5 text-[#f5b5c8]" />
          <span>Waitlisted</span>
        </span>
      );
    case 'offered':
      return (
        <span className={`inline-flex items-center space-x-1.5 rounded-full bg-gradient-to-r from-[#5c0f20] to-[#8a1731] border border-[#f5b5c8] text-[#fff] font-medium ${sizeClasses} shadow-sm shadow-[#f5b5c8]/30 animate-pulse`}>
          <Sparkles className="w-3.5 h-3.5 text-[#f5b5c8]" />
          <span>Offered (24h)</span>
        </span>
      );
    case 'confirmed':
      return (
        <span className={`inline-flex items-center space-x-1.5 rounded-full bg-blue-950/70 border border-blue-500/50 text-blue-200 font-medium ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Confirmed</span>
        </span>
      );
    case 'in-use':
      return (
        <span className={`inline-flex items-center space-x-1.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-200 font-medium ${sizeClasses}`}>
          <PlayCircle className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>In use</span>
        </span>
      );
    case 'returned':
      return (
        <span className={`inline-flex items-center space-x-1.5 rounded-full bg-slate-900/80 border border-slate-600/50 text-slate-300 font-medium ${sizeClasses}`}>
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Returned</span>
        </span>
      );
    case 'transfer-complete':
      return (
        <span className={`inline-flex items-center space-x-1.5 rounded-full bg-[#4a1222]/80 border border-[#f5b5c8]/70 text-[#fde8ef] font-medium ${sizeClasses}`}>
          <Gift className="w-3.5 h-3.5 text-[#f5b5c8]" />
          <span>Transfer complete</span>
        </span>
      );
    case 'overdue':
      return (
        <span className={`inline-flex items-center space-x-1.5 rounded-full bg-red-950/90 border border-red-500 text-red-200 font-medium ${sizeClasses} animate-bounce`}>
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span>Overdue</span>
        </span>
      );
    case 'rejected':
      return (
        <span className={`inline-flex items-center space-x-1.5 rounded-full bg-neutral-900/80 border border-neutral-700 text-neutral-400 font-medium ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-neutral-400" />
          <span>Rejected</span>
        </span>
      );
    case 'cancelled':
      return (
        <span className={`inline-flex items-center space-x-1.5 rounded-full bg-neutral-900/80 border border-neutral-700 text-neutral-400 font-medium ${sizeClasses}`}>
          <Ban className="w-3.5 h-3.5 text-neutral-400" />
          <span>Cancelled</span>
        </span>
      );
    case 'maintenance':
      return (
        <span className={`inline-flex items-center space-x-1.5 rounded-full bg-amber-950/80 border border-amber-600/50 text-amber-200 font-medium ${sizeClasses}`}>
          <Wrench className="w-3.5 h-3.5 text-amber-400" />
          <span>Maintenance</span>
        </span>
      );
    case 'restricted':
      return (
        <span className={`inline-flex items-center space-x-1.5 rounded-full bg-red-950/80 border border-red-600/50 text-red-200 font-medium ${sizeClasses}`}>
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span>Restricted</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center space-x-1.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 font-medium ${sizeClasses}`}>
          <span>{status}</span>
        </span>
      );
  }
};

export const RiskChip: React.FC<{ risk: RiskLevel }> = ({ risk }) => {
  switch (risk) {
    case 'low':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 font-medium">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Low Risk (Auto-eligible)</span>
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs bg-amber-950/60 border border-amber-600/40 text-amber-300 font-medium">
          <Shield className="w-3 h-3 text-amber-400" />
          <span>Medium Risk (Safety Quiz)</span>
        </span>
      );
    case 'high':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs bg-rose-950/80 border border-rose-600/50 text-rose-300 font-medium">
          <ShieldAlert className="w-3 h-3 text-rose-400" />
          <span>High Risk (Quiz + Supervisor)</span>
        </span>
      );
  }
};

export const AccessModelChip: React.FC<{
  priceMode: PriceMode;
  transferMode: TransferMode;
  price: number;
  priceUnit?: string;
}> = ({ priceMode, transferMode, price, priceUnit }) => {
  if (priceMode === 'free' && transferMode === 'temporary') {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs bg-[#2b0c16]/80 border border-[#8a1731]/60 text-[#fde8ef] font-medium">
        <Clock className="w-3 h-3 text-[#f5b5c8]" />
        <span>Free • Borrow</span>
      </span>
    );
  }
  if (priceMode === 'paid' && transferMode === 'temporary') {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs bg-[#300e19]/80 border border-[#8a1731]/60 text-[#fde8ef] font-medium">
        <Coins className="w-3 h-3 text-[#f5b5c8]" />
        <span>₹{price} {priceUnit || '/hr'} • Rent</span>
      </span>
    );
  }
  if (priceMode === 'free' && transferMode === 'permanent') {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 font-medium">
        <Gift className="w-3 h-3 text-emerald-400" />
        <span>Free • Giveaway (Permanent)</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs bg-[#3a0f1d]/80 border border-[#f5b5c8]/50 text-[#fde8ef] font-medium">
      <Tag className="w-3 h-3 text-[#f5b5c8]" />
      <span>₹{price} • Sale (Permanent)</span>
    </span>
  );
};
