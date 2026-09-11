import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Users } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#17243A] text-white pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Logo */}
          <div className="space-y-4">
            <div className="bg-white/10 p-2.5 rounded-xl inline-block backdrop-blur-sm">
              <img
                src="/assets/logo.png"
                alt="SevaConnect Official Logo"
                className="h-12 w-auto max-h-12 object-contain"
              />
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              <strong>SevaConnect</strong> is an NGO Donation & Resource Management System dedicated to bridging the gap between generous donors, dedicated NGOs, and communities in need.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#2EAD62] font-semibold bg-[#2EAD62]/10 py-1.5 px-3 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-[#2EAD62] animate-pulse"></span>
              Verified NGO Transparency & Direct Impact
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-[#2EAD62] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a href="/#about" className="text-gray-300 hover:text-[#2EAD62] transition-colors">
                  About SevaConnect
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="text-gray-300 hover:text-[#2EAD62] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#features" className="text-gray-300 hover:text-[#2EAD62] transition-colors">
                  Modules Preview
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Access */}
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">
              User Access
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="text-gray-300 hover:text-[#2EAD62] transition-colors">
                  Donor Login
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-[#2EAD62] transition-colors">
                  Admin Portal
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-[#2EAD62] transition-colors">
                  Create New Account
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-300 hover:text-[#2EAD62] transition-colors">
                  Profile & Preferences
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Vision & Contact */}
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">
              Core Principles
            </h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#087F73] shrink-0 mt-0.5" />
                <span>Verified NGO Network & Transparent Giving</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Users className="w-5 h-5 text-[#F7BA3E] shrink-0 mt-0.5" />
                <span>Community-Centric Resource Distribution</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Heart className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span>Direct Impact for Every Contribution</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} SevaConnect NGO Donation & Resource Management System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with integrity for NGOs, Donors & Communities.
          </p>
        </div>
      </div>
    </footer>
  );
}
