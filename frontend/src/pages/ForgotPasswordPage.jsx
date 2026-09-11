import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Request Code, 2 = Verify Code & Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await authService.forgotPassword({ email: email.trim().toLowerCase() });
      if (res.data?.success) {
        setGeneratedCode(res.data.otp || '');
        setSuccess('Verification OTP has been generated! Enter the OTP and your new password below.');
        setStep(2);
      } else {
        setError(res.data?.message || 'Unable to generate password recovery code.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to initiate password reset. Please verify your email or try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit verification code / OTP.');
      return;
    }
    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Password must contain at least 1 uppercase and 1 number.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authService.resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
        confirmPassword
      });

      if (res.data?.success) {
        navigate('/login', {
          state: { flashMessage: 'Password successfully reset! You can now sign in with your new password.' }
        });
      } else {
        setError(res.data?.message || 'Password reset failed.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to reset password. The code might have expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAF6F3] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block mb-4">
          <img
            src="/assets/logo.png"
            alt="SevaConnect Official Logo"
            className="h-16 w-auto max-h-16 mx-auto object-contain"
          />
        </Link>
        <h2 className="text-3xl font-extrabold text-[#17243A] tracking-tight">
          Reset Your Password
        </h2>
        <p className="mt-2 text-sm text-[#667085]">
          Recover access to your SevaConnect account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          {error && (
            <Alert
              type="error"
              title="Error"
              message={error}
              className="mb-6"
              onClose={() => setError('')}
            />
          )}

          {success && (
            <Alert
              type="success"
              title="Code Generated"
              message={success}
              className="mb-6"
              onClose={() => setSuccess('')}
            />
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-5">
              <p className="text-xs text-[#667085] leading-relaxed">
                Enter the email address associated with your SevaConnect account. We will issue a secure verification code to reset your password.
              </p>

              <Input
                id="reset-email"
                name="email"
                label="Registered Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                required
                disabled={loading}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                Send Recovery OTP <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {generatedCode && (
                <div className="p-3.5 rounded-xl bg-[#EAF6F3] border border-[#087F73]/30 text-xs text-[#087F73]">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-[#2EAD62]" /> Security Verification Code:
                  </p>
                  <p className="text-base font-mono font-bold tracking-widest text-[#17243A]">
                    {generatedCode}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    In production, this is emailed. Use the code above to complete your reset.
                  </p>
                </div>
              )}

              <Input
                id="otp"
                name="otp"
                label="6-Digit Verification Code / OTP"
                type="text"
                placeholder="e.g. 123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                icon={KeyRound}
                required
                disabled={loading}
              />

              <Input
                id="newPassword"
                name="newPassword"
                label="New Password"
                type="password"
                placeholder="At least 8 chars, 1 uppercase & 1 number"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon={Lock}
                required
                disabled={loading}
              />

              <Input
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                  Set New Password <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[#087F73] font-semibold hover:underline"
                >
                  Request a different verification code
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-[#667085]">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 font-bold text-[#087F73] hover:text-[#05665D] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
