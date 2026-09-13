import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import {
  Heart,
  Users,
  ShieldCheck,
  Megaphone,
  Gift,
  Package,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Clock,
  HeartHandshake,
  TrendingUp,
  BookOpen,
  Activity,
  Award,
  FileText,
  Truck
} from 'lucide-react';

export default function LandingPage() {
  // Interactive Donation Impact Calculator state for hero showcase
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');

  const impactEstimates = {
    500: { meals: '5 Nutritional Food Kits', impact: 'Provides dry ration kits to a vulnerable family for two weeks.' },
    1000: { meals: '10 School Learning Kits', impact: 'Supplies essential books, stationery, and uniforms for 2 rural students.' },
    2500: { meals: '1 Month Family Support', impact: 'Covers essential healthcare checkups and medicine for elderly community members.' },
    5000: { meals: 'Community Water Filter', impact: 'Helps install clean drinking water filtration for a primary rural school.' }
  };

  const activeAmount = customAmount ? parseInt(customAmount, 10) || 0 : selectedAmount;
  const currentImpact =
    impactEstimates[activeAmount] || {
      meals: 'Direct Humanitarian Aid',
      impact: 'Your pledge is pooled into verified NGO relief funds delivering immediate community assistance.'
    };

  const urgentCauses = [
    {
      category: 'Child Education',
      title: 'Back to School: Slum Education Drive',
      ngo: 'Vidya Jyoti Trust',
      goal: '₹1,50,000',
      raised: '₹98,000',
      donors: '142 Donors',
      icon: BookOpen,
      image: '/assets/campaigns/education.jpg',
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      category: 'Hunger Relief',
      title: 'Nutritious Meals for Underprivileged Children',
      ngo: 'Annapurna Seva Mission',
      goal: '₹2,00,000',
      raised: '₹1,45,000',
      donors: '280 Donors',
      icon: Gift,
      image: '/assets/campaigns/nutrition.jpg',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      category: 'Healthcare Access',
      title: 'Mobile Health Clinics for Remote Villages',
      ngo: 'Arogya Community Health',
      goal: '₹3,00,000',
      raised: '₹1,90,000',
      donors: '315 Donors',
      icon: Activity,
      image: '/assets/campaigns/medical.jpg',
      badgeColor: 'bg-teal-100 text-teal-800'
    }
  ];

  const featurePreviews = [
    {
      title: 'Donation Management',
      icon: Gift,
      tag: 'Donation Module',
      description: 'Facilitate secure monetary contributions and material donations with transparent fund allocation, automated 80G tax receipts, and complete donor auditability.',
      link: '/donate',
      actionText: 'Make a Contribution →'
    },
    {
      title: 'Campaign Management',
      icon: Megaphone,
      tag: 'Campaign Module',
      description: 'Create cause-driven appeals for disaster relief, girl-child education, health camps, and seasonal hunger alleviation with real-time progress tracking.',
      link: '/campaigns',
      actionText: 'Explore Campaigns →'
    },
    {
      title: 'Volunteer Operations',
      icon: Users,
      tag: 'Volunteer Module',
      description: 'Recruit passionate local volunteers, assign on-ground relief tasks, coordinate disaster response teams, and confirm real-time aid handovers.',
      link: '/login/volunteer',
      actionText: 'Volunteer Portal →'
    },
    {
      title: 'Beneficiary Registry',
      icon: HeartHandshake,
      tag: 'Beneficiary Module',
      description: 'Dignified beneficiary intake, direct identity verification, family ration distribution, and transparent community social welfare delivery.',
      link: '/request-assistance',
      actionText: 'Request Assistance →'
    },
    {
      title: 'Warehouse & Inventory',
      icon: Package,
      tag: 'Logistics Module',
      description: 'Real-time warehouse inventory for grain supplies, medicine kits, winter blankets, low-stock threshold alerts, and rapid disaster logistics.',
      link: '/donate',
      actionText: 'Pledge Supplies →'
    },
    {
      title: 'Assistance Pipeline & Dispatch',
      icon: FileText,
      tag: 'Aid Pipeline Module',
      description: 'Direct community request intake, priority urgency triage, verified relief dispatch, and real-time delivery confirmation by on-ground volunteers.',
      link: '/request-assistance',
      actionText: 'Submit Aid Request →'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#EAF6F3]">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION WITH NGO IMPACT CALCULATOR */}
        <section id="home" className="relative overflow-hidden py-12 lg:py-20 bg-gradient-to-b from-white via-white to-[#EAF6F3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: NGO Mission & Story */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF6F3] border border-[#087F73]/25 text-[#087F73] text-xs font-extrabold tracking-wide">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  NGO DONATION & RESOURCE MANAGEMENT SYSTEM
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#17243A] tracking-tight leading-[1.15]">
                  Connecting NGOs, <span className="text-[#087F73]">Donors</span> & Communities.
                </h1>

                <p className="text-lg text-[#667085] leading-relaxed max-w-xl">
                  SevaConnect is an NGO Donation & Resource Management System that helps connect NGOs, donors and communities while helping manage social initiatives and resources.
                </p>

                {/* Key NGO Trust Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-2xs">
                    <div className="p-2 rounded-lg bg-[#EAF6F3] text-[#087F73]">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#17243A]">Verified NGOs</p>
                      <p className="text-[11px] text-[#667085]">100% Vetted Trusts</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-2xs">
                    <div className="p-2 rounded-lg bg-[#EAF6F3] text-[#2EAD62]">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#17243A]">Transparent Aid</p>
                      <p className="text-[11px] text-[#667085]">Direct Fund Auditing</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-2xs">
                    <div className="p-2 rounded-lg bg-[#FFF4D6] text-[#F7BA3E]">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#17243A]">80G Tax Receipts</p>
                      <p className="text-[11px] text-[#667085]">Eligible Giving</p>
                    </div>
                  </div>
                </div>

                {/* Action CTA Buttons (TC-LP-04 / DEF-09) */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                  <Link to="/donate" className="w-full sm:w-auto">
                    <Button variant="cta" size="lg" className="w-full sm:w-auto shadow-md hover:shadow-lg">
                      Donate Now <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/campaigns" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Explore Causes
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column: Interactive Giving Impact Showcase Card */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-[#087F73]/15 relative">
                  {/* Decorative badge */}
                  <div className="absolute -top-3 right-6 bg-[#087F73] text-white text-[11px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
                    Interactive Impact Preview
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EAF6F3] text-[#087F73] flex items-center justify-center font-bold">
                        <Gift className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#17243A]">See What Your Giving Can Do</h3>
                        <p className="text-xs text-[#667085]">Choose an amount to see estimated community relief</p>
                      </div>
                    </div>

                    {/* Amount Selector Pills */}
                    <div>
                      <p className="text-xs font-semibold text-[#17243A] mb-2">Select Donation Amount</p>
                      <div className="grid grid-cols-4 gap-2">
                        {[500, 1000, 2500, 5000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => {
                              setSelectedAmount(amt);
                              setCustomAmount('');
                            }}
                            className={`py-2 rounded-xl text-xs font-bold transition-all ${
                              selectedAmount === amt && !customAmount
                                ? 'bg-[#087F73] text-white shadow-xs'
                                : 'bg-[#EAF6F3] text-[#087F73] hover:bg-[#087F73]/10'
                            }`}
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Impact Box */}
                    <div className="p-4 rounded-2xl bg-[#EAF6F3]/60 border border-[#087F73]/20 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#087F73]">
                        <Sparkles className="w-4 h-4 text-[#F7BA3E]" />
                        <span>Estimated Community Impact:</span>
                      </div>
                      <p className="text-base font-black text-[#17243A]">
                        {currentImpact.meals}
                      </p>
                      <p className="text-xs text-[#667085] leading-relaxed">
                        {currentImpact.impact}
                      </p>
                    </div>

                    {/* Direct CTA into Donate Flow */}
                    <Link to={`/donate?amount=${selectedAmount || 1000}`} className="block">
                      <Button variant="primary" size="lg" className="w-full">
                        Donate ₹{selectedAmount || 1000} Now <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>

                    <p className="text-center text-[11px] text-[#667085]">
                      100% of donations are audited and routed to verified grassroots NGO partners.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* URGENT CAUSES PREVIEW */}
        <section className="py-16 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <div className="inline-block px-3 py-1 bg-[#EAF6F3] text-[#087F73] text-xs font-bold rounded-md uppercase tracking-wider mb-2">
                  Verified Causes
                </div>
                <h2 className="text-3xl font-extrabold text-[#17243A]">
                  Active Community Initiatives
                </h2>
                <p className="text-sm text-[#667085] mt-1">
                  Sample causes and humanitarian appeals managed by vetted partner NGOs on SevaConnect.
                </p>
              </div>
              <Link to="/register">
                <Button variant="outline" size="sm" className="hidden md:inline-flex">
                  Support These Causes →
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {urgentCauses.map((cause, idx) => {
                const Icon = cause.icon;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Cause Header Image */}
                      <div className="h-44 relative overflow-hidden bg-gray-100">
                        <img
                          src={cause.image}
                          alt={cause.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs ${cause.badgeColor}`}>
                              <Icon className="w-3.5 h-3.5" />
                              {cause.category}
                            </span>
                            <span className="text-xs text-white/90 font-medium flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full">
                              <Users className="w-3.5 h-3.5 text-white" /> {cause.donors}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-lg font-bold text-[#17243A] leading-snug mb-2 group-hover:text-[#087F73] transition-colors">
                          {cause.title}
                        </h3>

                        <p className="text-xs text-[#667085] flex items-center gap-1.5 mb-4">
                          <HeartHandshake className="w-3.5 h-3.5 text-[#087F73]" />
                          Organized by: <strong className="text-[#17243A]">{cause.ngo}</strong>
                        </p>

                        {/* Mock Progress Bar */}
                        <div className="space-y-1.5 pt-2">
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#087F73] rounded-full" style={{ width: '68%' }}></div>
                          </div>
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-[#087F73]">{cause.raised} Raised</span>
                            <span className="text-gray-400">Goal: {cause.goal}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-0 flex items-center justify-between">
                      <span className="text-xs text-[#2EAD62] font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Verified Need
                      </span>
                      <Link to="/donate">
                        <button className="px-3.5 py-1.5 rounded-lg bg-[#087F73] text-white text-xs font-bold hover:bg-[#05665D] transition-colors cursor-pointer">
                          Contribute
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ABOUT SECTION (EXACT REQUIREMENT CONTENT) */}
        <section id="about" className="py-20 bg-[#EAF6F3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block px-3 py-1 bg-white text-[#087F73] text-xs font-bold rounded-md uppercase tracking-wider shadow-xs">
                  About SevaConnect
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17243A] leading-tight">
                  Transparent NGO Donation & Resource Management
                </h2>
                <p className="text-base text-[#667085] leading-relaxed">
                  SevaConnect is an <strong>NGO Donation & Resource Management System</strong> that helps connect NGOs, donors and communities while helping manage social initiatives and resources.
                </p>
                <p className="text-sm text-[#667085] leading-relaxed">
                  Millions of charitable contributions are made every year, yet grassroots organizations struggle with fragmented donor records, supply bottlenecks, and proving direct impact. SevaConnect solves this by providing a unified, secure platform where NGOs can coordinate relief drives and donors can follow their impact transparently.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-white text-[#087F73] mt-1 shrink-0 shadow-2xs">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#17243A]">Connecting Generous Donors</h4>
                      <p className="text-xs text-[#667085]">Empowering individuals and institutions with personalized portals to support vetted humanitarian causes.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-white text-[#087F73] mt-1 shrink-0 shadow-2xs">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#17243A]">Equipping Grassroots NGOs</h4>
                      <p className="text-xs text-[#667085]">Providing digital oversight tools for member records, community verification, and social initiative coordination.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-white text-[#087F73] mt-1 shrink-0 shadow-2xs">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#17243A]">Direct Community Impact</h4>
                      <p className="text-xs text-[#667085]">Ensuring resources reach real beneficiaries—delivering food, education, healthcare, and emergency aid.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Card / NGO Impact Metrics */}
              <div className="space-y-6">
                <div className="relative rounded-3xl overflow-hidden shadow-lg border border-gray-200 group">
                  <img
                    src="/assets/about_community.jpg"
                    alt="SevaConnect NGO Volunteers and Community Children"
                    className="w-full h-72 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#17243A]/85 via-black/20 to-transparent flex items-end p-6">
                    <div className="text-white">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#087F73] text-white inline-block mb-1.5 shadow-sm">
                        Grassroots Solidarity
                      </span>
                      <p className="text-sm sm:text-base font-bold text-white drop-shadow-sm">
                        Empowering grassroots initiatives across 15+ community districts
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-md space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#087F73] text-white">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#17243A]">Our Social Promise</h3>
                      <p className="text-xs text-[#667085]">Bridging the gap between intent and impact</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xl font-black text-[#087F73]">100%</p>
                      <p className="text-xs font-bold text-[#17243A] mt-0.5">Verified Trusts</p>
                      <p className="text-[10px] text-[#667085]">Strict NGO Due Diligence</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xl font-black text-[#F7BA3E]">Direct</p>
                      <p className="text-xs font-bold text-[#17243A] mt-0.5">Resource Delivery</p>
                      <p className="text-[10px] text-[#667085]">From Donors to Communities</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <div className="inline-block px-3 py-1 bg-[#EAF6F3] text-[#087F73] text-xs font-bold rounded-md uppercase tracking-wider">
                Three Simple Steps
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17243A]">
                How It Works
              </h2>
              <p className="text-sm text-[#667085]">
                How SevaConnect connects donors, charitable organizations, and communities in three seamless steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-[#EAF6F3]/50 p-8 rounded-2xl border border-gray-200 shadow-sm relative hover:border-[#087F73]/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#087F73] text-white flex items-center justify-center font-black text-lg mb-6 shadow-sm">
                  1
                </div>
                <h3 className="text-xl font-bold text-[#17243A] mb-3">Step 1: Register</h3>
                <p className="text-sm text-[#667085] leading-relaxed">
                  Sign up as a generous <strong>Donor</strong> or an authorized <strong>Admin</strong>. Enter your details with secure password hashing and verified credentials.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#EAF6F3]/50 p-8 rounded-2xl border border-gray-200 shadow-sm relative hover:border-[#087F73]/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#F7BA3E] text-[#17243A] flex items-center justify-center font-black text-lg mb-6 shadow-sm">
                  2
                </div>
                <h3 className="text-xl font-bold text-[#17243A] mb-3">Step 2: Connect</h3>
                <p className="text-sm text-[#667085] leading-relaxed">
                  Access your dedicated portal. Connect with verified charitable initiatives, review community drives, and manage your profile preferences.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-[#EAF6F3]/50 p-8 rounded-2xl border border-gray-200 shadow-sm relative hover:border-[#087F73]/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#2EAD62] text-white flex items-center justify-center font-black text-lg mb-6 shadow-sm">
                  3
                </div>
                <h3 className="text-xl font-bold text-[#17243A] mb-3">Step 3: Make an Impact</h3>
                <p className="text-sm text-[#667085] leading-relaxed">
                  Support vital causes with accountable donation management, coordinate essential supplies, and transform underserved communities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE PREVIEWS SECTION */}
        <section id="features" className="py-20 bg-[#EAF6F3] border-t border-gray-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF4D6] text-[#17243A] text-xs font-bold rounded-md uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-[#F7BA3E]" />
                NGO Management Capabilities
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17243A]">
                Platform Capabilities
              </h2>
              <p className="text-sm text-[#667085]">
                Integrated modules designed to empower NGOs, donors, and communities in managing social initiatives and relief resources.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featurePreviews.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <Link
                    key={idx}
                    to={feature.link}
                    className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#087F73] hover:shadow-lg transition-all duration-200 flex flex-col justify-between shadow-xs group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-[#EAF6F3] text-[#087F73] group-hover:bg-[#087F73] group-hover:text-white transition-colors">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold text-[#087F73] bg-[#EAF6F3] px-2.5 py-1 rounded-full">
                          {feature.tag}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#17243A] group-hover:text-[#087F73] transition-colors mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-[#667085] leading-relaxed">{feature.description}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end text-xs">
                      <span className="font-bold text-[#087F73] group-hover:translate-x-1 transition-transform inline-flex items-center">
                        {feature.actionText}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-16 bg-[#087F73] text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black">
              Ready to Be Part of SevaConnect?
            </h2>
            <p className="text-base text-[#EAF6F3] max-w-xl mx-auto">
              Join as a generous Donor or an NGO Administrator today to help connect NGOs, donors and communities while helping manage social initiatives and resources.
            </p>
            <div className="pt-2">
              <Link to="/register">
                <Button variant="cta" size="lg" className="shadow-lg hover:shadow-xl">
                  Create Your Account Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
