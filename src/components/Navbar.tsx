import React, { useState } from 'react';
import {
  Film,
  Sparkles,
  Clock,
  Bell,
  ChevronDown,
  UserCheck,
  CheckCircle,
  AlertCircle,
  Play,
  RotateCcw,
  Compass,
  PlusCircle,
  FileText,
  Shield,
  Layers,
  HelpCircle,
  Calendar,
} from 'lucide-react';
import { User, NotificationItem } from '../types';
import { IdleToIdeaService } from '../services/idleToIdeaService';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  demoClock: string;
  notifications: NotificationItem[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenWalkthrough: () => void;
  onReopenIntro: () => void;
  onOpenCreateListing: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  demoClock,
  notifications,
  activeTab,
  onSelectTab,
  onOpenWalkthrough,
  onReopenIntro,
  onOpenCreateListing,
  onResetData,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showClockMenu, setShowClockMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const formattedDemoTime = new Date(demoClock).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const userNotifications = notifications.filter((n) => n.recipientId === currentUser.id);
  const unreadCount = userNotifications.filter((n) => !n.readAt).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0507]/95 border-b border-[#3b0e19] backdrop-blur-md">
      {/* Persistent Slim Disclaimer Banner */}
      <div className="w-full bg-gradient-to-r from-[#29070f] via-[#4d0c1c] to-[#29070f] border-b border-[#5c0f20] px-4 py-1 text-center text-[11px] text-[#fde8ef]/90 font-mono-film flex items-center justify-center space-x-2">
        <Sparkles className="w-3 h-3 text-[#f5b5c8]" />
        <span>
          Prototype with fictional demo data. Payments, verification, notifications, and AI output are simulated or advisory.
        </span>
        <button
          onClick={onResetData}
          title="Reset demo data back to clean initial state"
          className="ml-3 underline hover:text-[#f5b5c8] text-[#e094aa] text-[10px] uppercase font-bold"
        >
          [Reset Demo Data]
        </button>
      </div>

      {/* Main Top Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Branding & Film Intro Link */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onSelectTab('discover')}
            className="flex items-center space-x-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8a1731] to-[#3b0914] border border-[#f5b5c8]/50 flex items-center justify-center shadow-md shadow-[#8a1731]/30 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-[#f5b5c8]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black font-cinematic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#faedf1] via-[#fcd5e0] to-[#f5b5c8]">
                  IDLETOIDEA
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#3b0914] text-[#f5b5c8] border border-[#5c0f20] font-mono-film">
                  DEMO
                </span>
              </div>
              <p className="text-[10px] text-[#c4adb5] tracking-wide font-serif-cozy italic hidden sm:block">
                Unlock underused makerspace equipment
              </p>
            </div>
          </button>

          <button
            onClick={onReopenIntro}
            title="View cozy cinema title screen"
            className="hidden md:inline-flex items-center space-x-1 text-[11px] font-mono-film text-[#c4adb5] hover:text-[#f5b5c8] px-2 py-1 rounded bg-[#1f0810] border border-[#42101b] transition-colors"
          >
            <Sparkles className="w-3 h-3 text-[#f5b5c8]" />
            <span>Cinema Title</span>
          </button>
        </div>

        {/* Center: Role-Aware Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 bg-[#14060c] p-1 rounded-xl border border-[#3b0e19]">
          <button
            onClick={() => onSelectTab('discover')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'discover'
                ? 'bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] shadow-sm shadow-[#f5b5c8]/20 border border-[#f5b5c8]/40'
                : 'text-[#c4adb5] hover:text-[#faedf1] hover:bg-[#200812]'
            }`}
          >
            Discover
          </button>

          {/* Requester Tabs */}
          {(currentUser.role === 'requester' || currentUser.role === 'admin') && (
            <>
              <button
                onClick={() => onSelectTab('my-requests')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'my-requests'
                    ? 'bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] shadow-sm shadow-[#f5b5c8]/20 border border-[#f5b5c8]/40'
                    : 'text-[#c4adb5] hover:text-[#faedf1] hover:bg-[#200812]'
                }`}
              >
                My Requests & Bookings
              </button>
            </>
          )}

          {/* Owner Tabs */}
          {(currentUser.role === 'owner' || currentUser.role === 'admin') && (
            <>
              <button
                onClick={() => onSelectTab('owner-dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'owner-dashboard'
                    ? 'bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] shadow-sm shadow-[#f5b5c8]/20 border border-[#f5b5c8]/40'
                    : 'text-[#c4adb5] hover:text-[#faedf1] hover:bg-[#200812]'
                }`}
              >
                Owner Dashboard
              </button>
              <button
                onClick={onOpenCreateListing}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#f5b5c8] hover:bg-[#200812] flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#f5b5c8]" />
                <span>New Listing</span>
              </button>
            </>
          )}

          {/* Supervisor Tabs */}
          {(currentUser.role === 'supervisor' || currentUser.role === 'admin') && (
            <button
              onClick={() => onSelectTab('supervisor-dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'supervisor-dashboard'
                  ? 'bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] shadow-sm shadow-[#f5b5c8]/20 border border-[#f5b5c8]/40'
                  : 'text-[#c4adb5] hover:text-[#faedf1] hover:bg-[#200812]'
              }`}
            >
              Supervisor Queue
            </button>
          )}

          {/* Admin Tabs */}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => onSelectTab('admin-dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'admin-dashboard'
                  ? 'bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] shadow-sm shadow-[#f5b5c8]/20 border border-[#f5b5c8]/40'
                  : 'text-[#c4adb5] hover:text-[#faedf1] hover:bg-[#200812]'
              }`}
            >
              Admin & Audit Log
            </button>
          )}
        </nav>

        {/* Right: Demo Controls (Clock, Role Switcher, Walkthrough) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Demo Clock Chip */}
          <div className="relative">
            <button
              onClick={() => setShowClockMenu(!showClockMenu)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-[#190810] border border-[#4a1220] hover:border-[#f5b5c8]/50 text-xs font-mono-film text-[#faedf1] shadow-inner transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-[#e6b87d]" />
              <span className="hidden sm:inline">{formattedDemoTime}</span>
              <span className="sm:hidden">Clock</span>
              <ChevronDown className="w-3 h-3 text-[#c4adb5]" />
            </button>

            {showClockMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#14060c] border border-[#4a1220] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2b0c16]">
                  <span className="text-xs font-semibold text-[#f5b5c8] font-mono-film">
                    DEMO SIMULATION CLOCK
                  </span>
                  <span className="text-[10px] text-[#c4adb5]">Triggers overdue & rules</span>
                </div>
                <div className="text-xs text-[#faedf1] font-mono-film mb-3 p-2 rounded-lg bg-[#0a0407] border border-[#3b0e19]">
                  {formattedDemoTime}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      IdleToIdeaService.advanceDemoClock(60);
                      setShowClockMenu(false);
                    }}
                    className="p-2 rounded-lg bg-[#240812] hover:bg-[#38101e] text-[#fde8ef] border border-[#4a1220] text-center font-medium"
                  >
                    +1 Hour
                  </button>
                  <button
                    onClick={() => {
                      IdleToIdeaService.advanceDemoClock(1440);
                      setShowClockMenu(false);
                    }}
                    className="p-2 rounded-lg bg-[#240812] hover:bg-[#38101e] text-[#fde8ef] border border-[#4a1220] text-center font-medium"
                  >
                    +1 Day
                  </button>
                  <button
                    onClick={() => {
                      IdleToIdeaService.jumpClockToAfterDueTime();
                      setShowClockMenu(false);
                    }}
                    className="col-span-2 p-2 rounded-lg bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/40 font-medium text-center shadow-md shadow-[#8a1731]/30"
                  >
                    Jump Past Due Time (Trigger Overdue)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Demo Role Switcher Dropdown (for judges) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1f0710] to-[#2e0b17] border border-[#5c0f20] hover:border-[#f5b5c8] text-xs transition-all shadow-sm"
              title="Demo role switcher (for judges)"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                className="w-5 h-5 rounded-full object-cover border border-[#f5b5c8]"
              />
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold text-[#faedf1] leading-none">
                  {currentUser.displayName}
                </div>
                <div className="text-[10px] text-[#f5b5c8] uppercase font-mono-film leading-tight">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-[#c4adb5]" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#14060c] border border-[#4a1220] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-[#2b0c16]">
                  <div className="text-xs font-semibold text-[#f5b5c8] font-mono-film">
                    DEMO ROLE SWITCHER (FOR JUDGES)
                  </div>
                  <div className="text-[11px] text-[#c4adb5]">
                    Instantly changes acting user, permissions & dashboards
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#220710] py-1">
                  {allUsers.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          IdleToIdeaService.setCurrentUser(u.id);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center space-x-3 p-2.5 rounded-xl text-left transition-colors ${
                          isSelected ? 'bg-[#2b0c16] border border-[#8a1731]' : 'hover:bg-[#1c0710]'
                        }`}
                      >
                        <img
                          src={u.avatarUrl}
                          alt={u.displayName}
                          className="w-8 h-8 rounded-full object-cover border border-[#5c0f20]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-semibold text-[#faedf1] truncate">
                              {u.displayName}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-mono-film uppercase ${
                                u.role === 'admin'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-700'
                                  : u.role === 'supervisor'
                                  ? 'bg-blue-950 text-blue-300 border border-blue-700'
                                  : u.role === 'owner'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              }`}
                            >
                              {u.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#c4adb5] truncate">{u.bio}</p>
                        </div>
                        {isSelected && <CheckCircle className="w-4 h-4 text-[#f5b5c8]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2 rounded-xl bg-[#190810] border border-[#4a1220] hover:border-[#f5b5c8]/50 text-[#c4adb5] hover:text-[#faedf1] relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#e63956] text-[#fff] text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#14060c] border border-[#4a1220] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2b0c16]">
                  <span className="text-xs font-semibold text-[#f5b5c8] font-mono-film">
                    NOTIFICATIONS ({userNotifications.length})
                  </span>
                  <span className="text-[10px] text-[#c4adb5] italic">Labelled: Demo notification</span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {userNotifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#c4adb5]">
                      No notifications for {currentUser.displayName} yet.
                    </div>
                  ) : (
                    userNotifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl bg-[#1c0812] border border-[#3b0e19] text-xs text-[#faedf1] relative"
                      >
                        <div className="flex items-center justify-between text-[10px] text-[#f5b5c8] mb-1 font-mono-film">
                          <span>{n.type}</span>
                          <span className="text-[#e094aa] text-[9px] bg-[#2d0a16] px-1 rounded">
                            Demo notification
                          </span>
                        </div>
                        <p className="text-xs text-[#e4ccd3]">{n.message}</p>
                        <div className="mt-1 text-[10px] text-[#c4adb5]">
                          {new Date(n.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Guided Judge Walkthrough Toggle Button */}
          <button
            onClick={onOpenWalkthrough}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#5c0f20] via-[#8a1731] to-[#5c0f20] text-[#fff] border border-[#f5b5c8] text-xs font-semibold shadow-lg shadow-[#8a1731]/30 hover:scale-105 transition-all"
          >
            <Compass className="w-3.5 h-3.5 text-[#f5b5c8] animate-spin" style={{ animationDuration: '10s' }} />
            <span className="hidden sm:inline">Judge Walkthrough</span>
            <span className="sm:hidden">Guide</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <div className="lg:hidden flex items-center justify-around px-2 py-2 border-t border-[#3b0e19] bg-[#0c0508] text-[11px]">
        <button
          onClick={() => onSelectTab('discover')}
          className={`px-2 py-1 rounded-md ${activeTab === 'discover' ? 'text-[#f5b5c8] font-bold' : 'text-[#c4adb5]'}`}
        >
          Discover
        </button>
        {(currentUser.role === 'requester' || currentUser.role === 'admin') && (
          <button
            onClick={() => onSelectTab('my-requests')}
            className={`px-2 py-1 rounded-md ${activeTab === 'my-requests' ? 'text-[#f5b5c8] font-bold' : 'text-[#c4adb5]'}`}
          >
            My Requests
          </button>
        )}
        {(currentUser.role === 'owner' || currentUser.role === 'admin') && (
          <button
            onClick={() => onSelectTab('owner-dashboard')}
            className={`px-2 py-1 rounded-md ${activeTab === 'owner-dashboard' ? 'text-[#f5b5c8] font-bold' : 'text-[#c4adb5]'}`}
          >
            Owner
          </button>
        )}
        {(currentUser.role === 'supervisor' || currentUser.role === 'admin') && (
          <button
            onClick={() => onSelectTab('supervisor-dashboard')}
            className={`px-2 py-1 rounded-md ${activeTab === 'supervisor-dashboard' ? 'text-[#f5b5c8] font-bold' : 'text-[#c4adb5]'}`}
          >
            Supervisor
          </button>
        )}
        {currentUser.role === 'admin' && (
          <button
            onClick={() => onSelectTab('admin-dashboard')}
            className={`px-2 py-1 rounded-md ${activeTab === 'admin-dashboard' ? 'text-[#f5b5c8] font-bold' : 'text-[#c4adb5]'}`}
          >
            Admin
          </button>
        )}
      </div>
    </header>
  );
};
