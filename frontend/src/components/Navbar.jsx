import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, LayoutDashboard, Shield, HeartHandshake } from 'lucide-react';
import Button from './Button';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath = user?.role === 'Admin' ? '/admin' : '/donor';

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
            <a
              href="/#features"
              className="text-sm font-semibold text-[#17243A] hover:text-[#087F73] transition-colors"
            >
              Modules Preview
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
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="md">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="cta" size="md">
                    Register Now
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
          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-[#17243A] hover:bg-[#EAF6F3] hover:text-[#087F73]"
          >
            Modules Preview
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
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2.5 rounded-lg font-semibold border border-[#087F73] text-[#087F73]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2.5 rounded-lg font-semibold bg-[#F7BA3E] text-[#17243A]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
