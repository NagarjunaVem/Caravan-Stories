import { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import bgLogin from '../assets/login-bg.jpeg'; // ✅ starry background
import axios from 'axios';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { backendUrl } = useContext(AppContext);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const stateEmail = location.state?.email;
    if (stateEmail) {
      setEmail(stateEmail);
    } else {
      toast.error('No email provided. Please register first.');
      navigate('/register');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      axios.defaults.withCredentials = true;

      const res = await axios.post(`${backendUrl}/api/auth/verify-email`, {
        email: email.toLowerCase(),
        otp: otp.trim()
      });

      const data = res.data;

      if (data.success) {
        toast.success(data.message || 'Email verified successfully! You can now login.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        toast.error(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error.response?.data?.message || 'An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) {
      toast.info(`Please wait ${countdown} seconds before requesting a new OTP`);
      return;
    }

    setResending(true);

    try {
      axios.defaults.withCredentials = true;

      const res = await axios.post(`${backendUrl}/api/auth/resend-otp`, {
        email: email.toLowerCase()
      });

      const data = res.data;

      if (data.success) {
        toast.success(data.message || 'A new OTP has been sent to your email');
        setCountdown(60);
        setOtp('');
      } else {
        toast.error(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) setOtp(value);
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: `url(${bgLogin})` }}
    >
      {/* Optional cyan scrollbar if the form overflows */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.35);
          border-radius: 9999px;
          border: 2px solid transparent;
          background-clip: padding-box;
          box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.25), 0 6px 16px rgba(56, 189, 248, 0.28);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(56, 189, 248, 0.55);
          box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.4), 0 10px 24px rgba(56, 189, 248, 0.4);
        }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(56, 189, 248, 0.6) transparent; }
      `}</style>

      <form
        onSubmit={handleVerify}
        className="
          relative z-10 w-full max-w-[90%] xs:max-w-[400px] sm:max-w-md
          text-center border border-white/10 rounded-2xl
          px-6 py-8 sm:px-8 sm:py-10
          backdrop-blur-xl bg-[rgba(8,14,28,0.55)] shadow-[0_10px_40px_rgba(0,0,0,0.45)]
          max-h-[90vh] overflow-y-auto custom-scrollbar
        "
      >
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_10px_30px_rgba(56,189,248,0.35)]">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-white text-2xl sm:text-3xl font-semibold">
            Verify Your Email
          </h1>
          <p className="text-slate-300/80 text-xs sm:text-sm mt-2">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-slate-200 text-sm font-medium mt-1">
            {email}
          </p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <label className="block text-left text-slate-300/80 text-sm mb-2">
            Enter OTP Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            className="w-full bg-white/5 border border-white/10
            rounded-xl px-4 py-4 text-slate-100 placeholder-slate-400
            outline-none text-center text-2xl font-bold tracking-[0.5em]
            focus:border-cyan-400/70 transition-colors"
            value={otp}
            onChange={handleOtpChange}
            required
            autoFocus
          />
          <p className="text-xs text-slate-400 mt-2 text-left">
            {otp.length}/6 digits entered
          </p>
        </div>

        {/* Info Box */}
        <div className="mb-6 p-3 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
          <p className="text-xs text-slate-200 flex items-start gap-2">
            <span className="text-base">💡</span>
            <span className="text-left">
              Check your email inbox (and spam folder) for the verification code. The code is valid for 24 hours.
            </span>
          </p>
        </div>

        {/* Verify Button */}
        <button
          type="submit"
          className={`w-full h-12 rounded-full text-white text-base font-medium
          bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500
          hover:from-cyan-300 hover:via-sky-400 hover:to-indigo-400
          transition-all shadow-[0_10px_30px_rgba(56,189,248,0.35)]
          hover:shadow-[0_12px_40px_rgba(56,189,248,0.5)]
          ${loading || otp.length !== 6 ? 'opacity-60 cursor-not-allowed' : ''}`}
          disabled={loading || otp.length !== 6}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </span>
          ) : (
            'Verify Email'
          )}
        </button>

        {/* Resend OTP */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resending || countdown > 0}
            className={`text-sm font-medium transition-colors ${
              resending || countdown > 0
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-cyan-300 hover:text-cyan-2 00 underline-offset-4 hover:underline'
            }`}
          >
            {resending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : countdown > 0 ? (
              `Resend OTP in ${countdown}s`
            ) : (
              '🔄 Resend OTP'
            )}
          </button>
        </div>

        {/* Back to Login */}
        <p className="text-slate-300/80 text-xs sm:text-sm mt-6">
          Already verified?{' '}
          <Link to="/login" className="text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline font-medium transition-colors">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default VerifyEmail;