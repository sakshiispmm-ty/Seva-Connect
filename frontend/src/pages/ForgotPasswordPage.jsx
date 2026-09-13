import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft, CheckCircle2, Inbox, X, RefreshCw, Copy, Check, Sparkles } from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Request Code, 2 = Verify Code & Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Live Webmail preview state
  const [mailboxOpen, setMailboxOpen] = useState(false);
  const [mailboxEmails, setMailboxEmails] = useState([]);
  const [mailboxLoading, setMailboxLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchMailbox = async () => {
    setMailboxLoading(true);
    try {
      const res = await authService.getVirtualMailbox(email.trim().toLowerCase());
      if (res.data?.success) {
        setMailboxEmails(res.data.emails || []);
      }
    } catch (err) {
      console.error('Failed to load mailbox:', err);
    } finally {
      setMailboxLoading(false);
    }
  };

  const openMailbox = () => {
    setMailboxOpen(true);
    fetchMailbox();
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const autoFillOtp = (code) => {
    setOtp(code);
    setMailboxOpen(false);
  };

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
        setSuccess(res.data.message || 'Verification OTP sent! Enter the code and your new password below.');
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
    if (!email || !email.trim()) {
      setError('Please start from step 1 and enter your registered email address.');
      setStep(1);
      return;
    }

    const cleanOtp = otp.trim().replace(/\s+/g, '');
    if (!cleanOtp) {
      setError('Please enter the 6-digit verification code / OTP.');
      return;
    }
    if (cleanOtp.length !== 6) {
      setError('Please enter a complete 6-digit verification code.');
      return;
    }
    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Password must contain at least 1 uppercase letter and 1 number (e.g. Admin1234!).');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both password fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authService.resetPassword({
        email: email.trim().toLowerCase(),
        otp: cleanOtp,
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
      console.error('Password reset request failed:', err);
      setError(
        err.response?.data?.message ||
        'Failed to reset password. The code might have expired or is incorrect.'
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
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex flex-col gap-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-emerald-900 mb-0.5">Verification Code Dispatched</p>
                    <p className="text-emerald-700 leading-relaxed">
                      A 6-digit verification code has been dispatched to <strong>{email}</strong>.
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-emerald-200/80 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-emerald-800">Check incoming mail:</span>
                  <button
                    type="button"
                    onClick={openMailbox}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#087F73] hover:bg-[#066359] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>Open Webmail Inbox</span>
                  </button>
                </div>
              </div>

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

      {/* Webmail Inbox Modal */}
      {mailboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#17243A] text-white px-5 py-3.5 flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#087F73] flex items-center justify-center text-white font-bold">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight flex items-center gap-2">
                    Webmail Inbox Preview
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                      Live Delivery
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 truncate max-w-sm">
                    Inbox for: <span className="font-mono text-gray-200">{email}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={fetchMailbox}
                  disabled={mailboxLoading}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                  title="Refresh Inbox"
                >
                  <RefreshCw className={`w-4 h-4 ${mailboxLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setMailboxOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 bg-gray-50/70">
              {mailboxLoading && mailboxEmails.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#087F73] mb-3" />
                  <p className="text-sm font-semibold">Checking mail server...</p>
                </div>
              ) : mailboxEmails.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <Inbox className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-semibold text-gray-700">No emails received yet</p>
                  <p className="text-xs text-gray-500 mt-1">Please request an OTP first</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mailboxEmails.slice(0, 1).map((msg) => (
                    <div key={msg.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      {/* Email Envelope Summary */}
                      <div className="p-4 bg-gray-50/80 border-b border-gray-200 text-xs flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-gray-900">{msg.subject}</span>
                          <span className="text-[11px] text-gray-500">
                            {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span>
                            <strong>From:</strong> {msg.from}
                          </span>
                          <span>
                            <strong>To:</strong> <span className="font-mono text-gray-800">{msg.to}</span>
                          </span>
                        </div>
                      </div>

                      {/* Quick Auto-Fill Action Banner */}
                      <div className="p-3 bg-[#EAF6F3] border-b border-[#087F73]/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#087F73]" />
                          <span className="text-xs font-semibold text-gray-800">
                            Extracted OTP: <strong className="font-mono text-sm text-[#087F73] tracking-widest">{msg.otp}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(msg.otp)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors shadow-2xs cursor-pointer"
                          >
                            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => autoFillOtp(msg.otp)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md bg-[#087F73] hover:bg-[#066359] text-white transition-colors shadow-xs cursor-pointer"
                          >
                            <span>Insert & Close</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Full HTML Rendered Letter */}
                      <div className="p-4 max-h-[420px] overflow-y-auto">
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: msg.html }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-white border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>SevaConnect Development Webmail Service</span>
              <button
                type="button"
                onClick={() => setMailboxOpen(false)}
                className="px-4 py-1.5 font-bold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
