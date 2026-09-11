import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import {
  Menu,
  Gift,
  Megaphone,
  User,
  Heart,
  ShieldCheck,
  CheckCircle,
  Info,
  TrendingUp,
  Award
} from 'lucide-react';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeModules = [
    {
      title: 'My Donations & History',
      icon: Gift,
      description: 'View your registered monetary gifts and in-kind contributions, check verification status, and download 80G tax receipts.',
      tag: 'Live V1.2',
      link: '/donor/history',
      actionText: 'My Donations',
      id: 'btn-my-donations'
    },
    {
      title: 'Active Campaigns',
      icon: Megaphone,
      description: 'Explore live, community-vetted relief campaigns, healthcare camps, and child education projects requiring urgent support.',
      tag: 'Live V1.2',
      link: '/campaigns',
      actionText: 'Browse Campaigns',
    },
    {
      title: 'Pledge Donation',
      icon: Heart,
      description: 'Register a new monetary donation or material aid (rations, medicines, books) towards any verified initiative.',
      tag: 'Live V1.2',
      link: '/donate',
      actionText: 'Make a Contribution',
    },
  ];

  const sampleFeaturedCauses = [
    {
      id: 1,
      title: 'Slum Child Nutrition & Evening School',
      ngo: 'Vidya Jyoti Trust',
      goal: '₹1,50,000',
      raised: '₹98,000',
      category: 'Education & Meals'
    },
    {
      id: 2,
      title: 'Clean Drinking Water Well in Drought Zone',
      ngo: 'Jal Seva Foundation',
      goal: '₹2,20,000',
      raised: '₹1,65,000',
      category: 'Water & Health'
    }
  ];

  return (
    <div className="min-h-screen bg-[#EAF6F3] flex">
      {/* Responsive Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role="Donor"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-[#17243A] hover:bg-gray-100 lg:hidden"
              aria-label="Open Sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Official Logo on Dashboard Header */}
            <div className="flex items-center gap-3">
              <img
                src="/assets/logo.png"
                alt="SevaConnect Official Logo"
                className="h-10 w-auto max-h-10 object-contain hidden sm:block"
              />
              <span className="h-6 w-px bg-gray-200 hidden sm:block"></span>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-[#17243A] leading-none">
                  Donor Portal
                </h1>
                <p className="text-[11px] text-[#667085] hidden sm:block mt-0.5">
                  NGO Donation & Resource Management
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/profile">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex items-center gap-1.5">
                <User className="w-4 h-4" /> Edit Profile
              </Button>
            </Link>
            <div className="w-9 h-9 rounded-full bg-[#087F73] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {user?.name?.charAt(0)?.toUpperCase() || 'D'}
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Welcome Giving Banner */}
          <div className="bg-gradient-to-r from-[#087F73] via-[#05665D] to-[#17243A] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/15 rounded-full text-xs font-bold backdrop-blur-xs">
                <Heart className="w-3.5 h-3.5 text-[#F7BA3E] fill-[#F7BA3E]" />
                Philanthropic Community Partner
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome to your Giving Portal, {user?.name}!
              </h2>
              <p className="text-sm text-[#EAF6F3] leading-relaxed">
                Thank you for your commitment to community welfare. SevaConnect connects your generosity directly with verified NGOs, transparent relief campaigns, and grassroots beneficiaries.
              </p>

              {/* Giving Impact Highlights */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                <span className="bg-white/20 px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#2EAD62]" /> 100% Vetted NGOs
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#F7BA3E]" /> 80G Tax Deductible Receipts
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-300" /> Transparent Fund Auditing
                </span>
              </div>
            </div>
          </div>

          {/* Profile Overview Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="text-base font-bold text-[#17243A] flex items-center gap-2">
                <User className="w-5 h-5 text-[#087F73]" />
                Donor Membership Profile
              </h3>
              <Link to="/profile" className="text-xs font-bold text-[#087F73] hover:underline">
                Manage Profile & Preferences →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-[#EAF6F3]/60 border border-gray-100">
                <p className="text-xs text-[#667085] font-medium">Donor Name</p>
                <p className="text-sm font-bold text-[#17243A] mt-0.5 truncate">{user?.name}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EAF6F3]/60 border border-gray-100">
                <p className="text-xs text-[#667085] font-medium">Registered Email</p>
                <p className="text-sm font-bold text-[#17243A] mt-0.5 truncate">{user?.email}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EAF6F3]/60 border border-gray-100">
                <p className="text-xs text-[#667085] font-medium">Contact Phone</p>
                <p className="text-sm font-bold text-[#17243A] mt-0.5 truncate">{user?.phone || 'Not set'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EAF6F3]/60 border border-gray-100">
                <p className="text-xs text-[#667085] font-medium">System Role</p>
                <span className="inline-block mt-0.5 text-xs font-extrabold text-[#05665D] bg-[#2EAD62]/20 px-2.5 py-0.5 rounded-full border border-[#2EAD62]">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* NGO Donation Management Cards (Active in V1.2) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-bold text-[#17243A]">Donation & Campaign Actions</h3>
                <p className="text-xs text-[#667085]">Explore active initiatives, make pledges, and track verification status</p>
              </div>
              <span className="text-xs font-semibold text-[#087F73] bg-white px-3 py-1 rounded-full border border-gray-200">
                Live V1.2 Operations
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeModules.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between hover:border-[#087F73]/40 hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-[#EAF6F3] text-[#087F73] group-hover:bg-[#087F73] group-hover:text-white transition-colors">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold text-[#087F73] bg-[#EAF6F3] px-2.5 py-0.5 rounded-full">
                          {card.tag}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#17243A] mb-2">{card.title}</h4>
                      <p className="text-xs text-[#667085] leading-relaxed">{card.description}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Enabled
                      </span>
                      <Link to={card.link}>
                        <Button variant="primary" size="sm">
                          {card.actionText} →
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sample Active Causes Spotlight (Preview) */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-[#17243A]">Verified NGO Campaigns in Need of Support</h3>
              <p className="text-xs text-[#667085]">Sample grassroots appeals currently hosted on the SevaConnect network</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {sampleFeaturedCauses.map((cause, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold text-[#087F73] bg-[#EAF6F3] px-2.5 py-0.5 rounded-full">
                      {cause.category}
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> NGO Verified
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#17243A]">{cause.title}</h4>
                  <p className="text-xs text-[#667085]">Partner NGO: <strong className="text-[#17243A]">{cause.ngo}</strong></p>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#087F73] rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#087F73]">{cause.raised} Raised</span>
                    <span className="text-gray-400">Target: {cause.goal}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <Link to={`/donate?campaignId=${cause.id}`}>
                      <Button variant="primary" size="sm" className="w-full">
                        Donate to Cause →
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NGO Giving Guidance Note */}
          <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex items-start gap-3 text-xs text-[#667085] leading-relaxed">
            <Info className="w-5 h-5 text-[#087F73] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#17243A]">Transparent NGO Giving:</strong> SevaConnect bridges the trust gap between donors and community welfare initiatives. All initiatives undergo administrative verification to ensure donations directly empower grassroots recipients.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
