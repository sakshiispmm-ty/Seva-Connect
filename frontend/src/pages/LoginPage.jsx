import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { Mail, Lock, ArrowRight, Heart, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';

const PORTAL_CONFIG = {
  donor: {
    key: 'donor',
    label: 'Donor Portal',
    shortLabel: 'Donor',
    icon: Heart,
    badge: '❤️ Community Supporter',
    title: 'Donor Sign In',
    subtitle: 'Track your donations, active campaigns, and download official 80G tax receipts',
    themeBg: 'bg-[#EAF6F3]',
    accentColor: '#087F73',
    activeTabBg: 'bg-[#087F73] text-white shadow-md',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    demoEmail: 'donor@gmail.com',
    demoPassword: 'Donor123'
  },
  volunteer: {
    key: 'volunteer',
    label: 'Volunteer Portal',
    shortLabel: 'Volunteer',
    icon: Users,
    badge: '🙋 Field Force & Relief Operations',
    title: 'Volunteer Portal Sign In',
    subtitle: 'Access assigned assistance deliveries, record distributions, and update field status',
    themeBg: 'bg-cyan-50/60',
    accentColor: '#0284C7',
    activeTabBg: 'bg-[#0284C7] text-white shadow-md',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    demoEmail: 'volunteer@gmail.com',
    demoPassword: 'Password123'
  },
  admin: {
    key: 'admin',
    label: 'Admin Desk',
    shortLabel: 'Admin',
    icon: ShieldCheck,
    badge: '🛡️ NGO Management & Operations',
    title: 'Admin Desk Sign In',
    subtitle: 'Verify campaigns, manage inventory allocations, and coordinate humanitarian relief',
    themeBg: 'bg-purple-50/50',
    accentColor: '#7C3AED',
    activeTabBg: 'bg-[#7C3AED] text-white shadow-md',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    demoEmail: 'pateljiaa16@gmail.com',
    demoPassword: 'Admin123'
  }
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { role: urlRole } = useParams();

  // Determine active portal based on URL parameter or query param
  const queryRole = new URLSearchParams(location.search).get('role');
  const initialPortal = (urlRole || queryRole || 'donor').toLowerCase();
  const validPortalKey = PORTAL_CONFIG[initialPortal] ? initialPortal : 'donor';

  const [activePortal, setActivePortal] = useState(validPortalKey);

  // Sync state if URL param changes
  useEffect(() => {
    if (urlRole && PORTAL_CONFIG[urlRole.toLowerCase()]) {
      setActivePortal(urlRole.toLowerCase());
    } else if (queryRole && PORTAL_CONFIG[queryRole.toLowerCase()]) {
      setActivePortal(queryRole.toLowerCase());
    }
  }, [urlRole, queryRole]);

  const currentPortal = PORTAL_CONFIG[activePortal];

  // Pick up flash messages from registration or expired session
  const flashMessage = location.state?.flashMessage;
  const initialEmail = location.state?.registeredEmail || '';
  const isSessionExpired = new URLSearchParams(location.search).get('expired') === '1';

  const [formData, setFormData] = useState({
    email: initialEmail,
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successInfo, setSuccessInfo] = useState(
    isSessionExpired ? 'Your session has expired. Please sign in again.' : (flashMessage || '')
  );

  const handlePortalSwitch = (portalKey) => {
    setActivePortal(portalKey);
    setServerError('');
    navigate(`/login/${portalKey}`, { replace: true });
  };

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    }
    if (!formData.password) {
      errs.password = 'Password is required.';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setServerError('');
    setSuccessInfo('');

    try {
      const result = await login(formData.email.trim().toLowerCase(), formData.password);

      if (result.success) {
        // If user is Admin, direct them to whichever workspace they selected!
        if (result.role === 'Admin') {
          if (activePortal === 'donor') {
            navigate('/donor', { replace: true });
          } else if (activePortal === 'volunteer') {
            navigate('/volunteer', { replace: true });
          } else {
            navigate('/admin', { replace: true });
          }
        } else if (result.role === 'Volunteer') {
          navigate('/volunteer', { replace: true });
        } else {
          navigate('/donor', { replace: true });
        }
      } else {
        setServerError(result.message || 'Invalid email or password.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Network error: Cannot reach the backend API server. Please check your connection.'
          : 'Invalid credentials or server unavailable. Please try again.');
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${currentPortal.themeBg} transition-colors duration-300 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Official SevaConnect Logo */}
        <Link to="/" className="inline-block mb-3">
          <img
            src="/assets/logo.png"
            alt="SevaConnect Official Logo"
            className="h-16 w-auto max-h-16 mx-auto object-contain"
          />
        </Link>
        <h2 className="text-3xl font-extrabold text-[#17243A] tracking-tight">
          {currentPortal.title}
        </h2>
        <p className="mt-1.5 text-sm text-[#667085] max-w-sm mx-auto">
          {currentPortal.subtitle}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Distinct Role Selection Tabs */}
        <div className="bg-white/90 backdrop-blur p-1.5 rounded-2xl shadow-sm border border-gray-200/80 mb-5">
          <div className="grid grid-cols-3 gap-1.5">
            {Object.values(PORTAL_CONFIG).map((portal) => {
              const Icon = portal.icon;
              const isActive = activePortal === portal.key;
              return (
                <button
                  key={portal.key}
                  type="button"
                  onClick={() => handlePortalSwitch(portal.key)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? portal.activeTabBg
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{portal.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Portal Info Badge */}
        <div className="mb-4 flex items-center justify-center">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${currentPortal.badgeClass}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {currentPortal.badge}
          </span>
        </div>

        {/* Login Form Card */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          {successInfo && (
            <Alert
              type={isSessionExpired ? 'warning' : 'success'}
              message={successInfo}
              className="mb-6"
              onClose={() => setSuccessInfo('')}
            />
          )}

          {serverError && (
            <Alert
              type="error"
              title="Sign In Failed"
              message={serverError}
              className="mb-6"
              onClose={() => setServerError('')}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <Input
              id="email"
              name="email"
              label={`${currentPortal.shortLabel} Email Address`}
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={Mail}
              required
              disabled={loading}
              autoComplete="email"
            />

            {/* Password */}
            <Input
              id="password"
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={Lock}
              required
              disabled={loading}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-gray-500">
                Logging in as <span className="font-bold text-gray-700 capitalize">{activePortal}</span>
              </span>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-[#087F73] hover:text-[#05665D] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
                disabled={loading}
                style={{ backgroundColor: currentPortal.accentColor }}
              >
                Sign In to {currentPortal.shortLabel} Workspace <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm sm:text-base text-[#475467]">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-bold text-[#087F73] hover:text-[#05665D] hover:underline transition-colors ml-1"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
