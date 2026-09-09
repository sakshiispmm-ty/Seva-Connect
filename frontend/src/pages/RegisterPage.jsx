import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { User, Mail, Phone, Lock, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Donor'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+\s\-()]{7,20}$/;

    if (!formData.name.trim()) {
      errs.name = 'Full Name is required.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Full Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid phone number (7-20 digits/symbols).';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters long.';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.role || !['Donor', 'Admin'].includes(formData.role)) {
      errs.role = 'Please select a valid role.';
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
    setSuccessMessage('');

    try {
      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role
      });

      if (result && result.success) {
        setSuccessMessage('Registration successful! Redirecting you to login...');
        setTimeout(() => {
          navigate('/login', {
            state: {
              registeredEmail: formData.email,
              flashMessage: 'Account created successfully! Please sign in with your credentials.'
            }
          });
        }, 1500);
      } else {
        setServerError(result?.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Network error: Cannot reach the backend API server. Please ensure the server is running.'
          : 'An unexpected error occurred. Please try again.');
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
          Create Your Account
        </h2>
        <p className="mt-2 text-sm text-[#667085]">
          Join SevaConnect as a Donor or Administrator to start collaborating.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          {serverError && (
            <Alert
              type="error"
              title="Registration Error"
              message={serverError}
              className="mb-6"
              onClose={() => setServerError('')}
            />
          )}

          {successMessage && (
            <Alert
              type="success"
              title="Welcome to SevaConnect!"
              message={successMessage}
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <Input
              id="name"
              name="name"
              label="Full Name"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              icon={User}
              required
              disabled={loading}
            />

            {/* Email Address */}
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
            />

            {/* Phone Number */}
            <Input
              id="phone"
              name="phone"
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              icon={Phone}
              required
              disabled={loading}
            />

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-[#17243A] mb-1.5">
                Registering As <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.role === 'Donor'
                      ? 'border-[#087F73] bg-[#EAF6F3] text-[#087F73]'
                      : 'border-gray-200 hover:border-gray-300 text-[#17243A]'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="Donor"
                    checked={formData.role === 'Donor'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <HeartHandshake className="w-5 h-5 shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-bold leading-none">Donor</p>
                    <p className="text-[11px] text-[#667085] mt-1">Community Contributor</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.role === 'Admin'
                      ? 'border-[#087F73] bg-[#EAF6F3] text-[#087F73]'
                      : 'border-gray-200 hover:border-gray-300 text-[#17243A]'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="Admin"
                    checked={formData.role === 'Admin'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-bold leading-none">Admin</p>
                    <p className="text-[11px] text-[#667085] mt-1">System & NGO Oversight</p>
                  </div>
                </label>
              </div>
              {errors.role && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.role}</p>
              )}
            </div>

            {/* Password */}
            <Input
              id="password"
              name="password"
              label="Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={Lock}
              required
              disabled={loading}
            />

            {/* Confirm Password */}
            <Input
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              icon={Lock}
              required
              disabled={loading}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-[#667085]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-[#087F73] hover:text-[#05665D] hover:underline"
            >
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
