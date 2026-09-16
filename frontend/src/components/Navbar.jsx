import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import Button from './Button';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalMenuOpen, setPortalMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath = user?.role === 'Admin' ? '/admin' : (user?.role === 'Volunteer' ? '/volunteer' : '/donor');

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo - Official SevaConnect Logo Image (Preserving Aspect Ratio) */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <img
              src="/assets/logo.png"
              alt="SevaConnect Official Logo"
              className="h-12 w-auto max-h-12 object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors hover:text-[#087F73] ${
                location.pathname === '/' ? 'text-[#087F73]' : 'text-[#17243A]'
              }`}
            >
              Home
            </Link>
            <Link
              to="/campaigns"
              className={`text-sm font-semibold transition-colors hover:text-[#087F73] ${
                location.pathname.startsWith('/campaigns') ? 'text-[#087F73]' : 'text-[#17243A]'
              }`}
            >
              Campaigns
            </Link>
            <Link
              to="/request-assistance"
              className={`text-sm font-semibold transition-colors hover:text-[#087F73] ${
                location.pathname === '/request-assistance' ? 'text-[#087F73]' : 'text-[#17243A]'
              }`}
            >
              Request Assistance
            </Link>
            <a
              href="/#about"
              className="text-sm font-semibold text-[#17243A] hover:text-[#087F73] transition-colors"
            >
              About
            </a>
            <a
              href="/#how-it-works"
              className="text-sm font-semibold text-[#17243A] hover:text-[#087F73] transition-colors"
            >
              How It Works
            </a>
            <Link
              to="/leaderboard"
              className={`text-sm font-semibold transition-colors hover:text-[#087F73] ${
                location.pathname === '/leaderboard' ? 'text-[#087F73]' : 'text-[#17243A]'
              }`}
            >
              Leaderboard
            </Link>
            <a
              href="/#features"
              className="text-sm font-semibold text-[#17243A] hover:text-[#087F73] transition-colors"
            >
              Modules
            </a>
          </div>

          {/* Desktop Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-[#EAF6F3] text-[#087F73] hover:bg-[#087F73] hover:text-white transition-all duration-200"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg text-[#17243A] hover:bg-gray-100 transition-colors"
                  title="My Profile"
                >
                  <User className="w-4 h-4 text-[#667085]" />
                  <span className="max-w-[120px] truncate">{user?.name}</span>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full ${
                    user?.role === 'Admin' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {user?.role}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-[#667085] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                {/* Dedicated Portal Sign-In Dropdown */}
                <div className="relative">
                  <div className="inline-flex rounded-lg border border-teal-200 bg-teal-50/60 p-0.5">
                    <Link
                      to="/login"
                      className="px-3 py-1.5 text-xs font-bold text-[#087F73] hover:bg-teal-100/70 rounded-md transition-colors flex items-center gap-1.5"
                    >
                      <span>Sign In</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPortalMenuOpen(!portalMenuOpen)}
                      className="px-1.5 py-1.5 text-[#087F73] hover:bg-teal-100/70 rounded-md transition-colors"
                      title="Select Portal"
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${portalMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  {portalMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setPortalMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                          Select Login Portal
                        </div>
                        <Link
                          to="/login/donor"
                          onClick={() => setPortalMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                        >
                          <span className="text-base">❤️</span>
                          <div>
                            <p className="font-bold text-gray-900">Donor Portal</p>
                            <p className="text-[10px] text-gray-500 font-normal">Contributions & Tax Receipts</p>
                          </div>
                        </Link>
                        <Link
                          to="/login/volunteer"
                          onClick={() => setPortalMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-sky-50 hover:text-sky-800 transition-colors"
                        >
                          <span className="text-base">🙋</span>
                          <div>
                            <p className="font-bold text-gray-900">Volunteer Portal</p>
                            <p className="text-[10px] text-gray-500 font-normal">Deliveries & Field Tasks</p>
                          </div>
                        </Link>
                        <Link
                          to="/login/admin"
                          onClick={() => setPortalMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-800 transition-colors"
                        >
                          <span className="text-base">🛡️</span>
                          <div>
                            <p className="font-bold text-gray-900">Admin Desk</p>
                            <p className="text-[10px] text-gray-500 font-normal">Operations & Inventory</p>
                          </div>
                        </Link>
                      </div>
                    </>
                  )}
                </div>

                <Link to="/register">
                  <Button variant="cta" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#17243A] hover:text-[#087F73] hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-[#17243A] hover:bg-[#EAF6F3] hover:text-[#087F73]"
          >
            Home
          </Link>
          <Link
            to="/campaigns"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-[#17243A] hover:bg-[#EAF6F3] hover:text-[#087F73]"
          >
            Campaigns
          </Link>
          <Link
            to="/request-assistance"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-[#17243A] hover:bg-[#EAF6F3] hover:text-[#087F73]"
          >
            Request Assistance
          </Link>
          <a
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-[#17243A] hover:bg-[#EAF6F3] hover:text-[#087F73]"
          >
            About
          </a>
          <a
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-[#17243A] hover:bg-[#EAF6F3] hover:text-[#087F73]"
          >
            How It Works
          </a>
          <Link
            to="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-[#17243A] hover:bg-[#EAF6F3] hover:text-[#087F73]"
          >
            Leaderboard
          </Link>
          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-[#17243A] hover:bg-[#EAF6F3] hover:text-[#087F73]"
          >
            Modules
          </a>

          <div className="pt-4 border-t border-gray-100 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 bg-[#EAF6F3] rounded-lg">
                  <p className="text-xs text-[#667085]">Signed in as</p>
                  <p className="text-sm font-bold text-[#17243A]">{user?.name} ({user?.role})</p>
                </div>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2.5 rounded-lg font-semibold bg-[#087F73] text-white hover:bg-[#05665D]"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 rounded-lg font-medium text-[#17243A] border border-gray-200"
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-center px-4 py-2 rounded-lg font-medium text-rose-600 bg-rose-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1">
                  Access Portal:
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  <Link
                    to="/login/donor"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col items-center justify-center p-2 rounded-lg font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs"
                  >
                    <span>❤️</span>
                    <span className="mt-0.5">Donor</span>
                  </Link>
                  <Link
                    to="/login/volunteer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col items-center justify-center p-2 rounded-lg font-semibold bg-sky-50 text-sky-800 border border-sky-200 text-xs"
                  >
                    <span>🙋</span>
                    <span className="mt-0.5">Volunteer</span>
                  </Link>
                  <Link
                    to="/login/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col items-center justify-center p-2 rounded-lg font-semibold bg-purple-50 text-purple-800 border border-purple-200 text-xs"
                  >
                    <span>🛡️</span>
                    <span className="mt-0.5">Admin</span>
                  </Link>
                </div>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2.5 rounded-lg font-semibold bg-[#F7BA3E] text-[#17243A] shadow-xs text-sm"
                >
                  Register New Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
