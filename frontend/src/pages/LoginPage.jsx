import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
        // Redirect based on user role
        if (result.role === 'Admin') {
          navigate('/admin', { replace: true });
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
    <div className="min-h-screen bg-[#EAF6F3] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Official SevaConnect Logo Image (Preserving Aspect Ratio) */}
        <Link to="/" className="inline-block mb-4">
          <img
            src="/assets/logo.png"
            alt="SevaConnect Official Logo"
            className="h-16 w-auto max-h-16 mx-auto object-contain"
          />
        </Link>
        <h2 className="text-3xl font-extrabold text-[#17243A] tracking-tight">
          Sign In to SevaConnect
        </h2>
        <p className="mt-2 text-sm text-[#667085]">
          Access your Donor or Admin dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
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
              label="Email Address"
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

            <div className="flex items-center justify-end">
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
              >
                Sign In <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-[#667085]">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-bold text-[#087F73] hover:text-[#05665D] hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
