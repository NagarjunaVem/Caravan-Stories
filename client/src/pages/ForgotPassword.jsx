import { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import bgImg from '../assets/bg.jpg';
import axios from 'axios';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { backendUrl } = useContext(AppContext);

    const [step, setStep] = useState(1); // 1 = email, 2 = otp + new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Step 1: Request OTP
    const handleRequestOTP = async (e) => {
        e.preventDefault();
        
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setLoading(true);

        try {
            axios.defaults.withCredentials = true;

            const res = await axios.post(`${backendUrl}/api/auth/forgot-password`, {
                email: email.toLowerCase()
            });

            const data = res.data;

            if (data.success) {
                toast.success(data.message || 'OTP sent to your email');
                setStep(2); // Move to OTP + password step
                setCountdown(60); // Set cooldown
            } else {
                toast.error(data.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Reset Password with OTP
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!otp || otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        if (!newPassword || newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            axios.defaults.withCredentials = true;

            const res = await axios.post(`${backendUrl}/api/auth/reset-password`, {
                email: email.toLowerCase(),
                otp: otp.trim(),
                newPassword
            });

            const data = res.data;

            if (data.success) {
                toast.success(data.message || 'Password reset successfully!');
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                toast.error(data.message || 'Password reset failed');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error(error.response?.data?.message || 'An error occurred');
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

            const res = await axios.post(`${backendUrl}/api/auth/resend-reset-otp`, {
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
        const value = e.target.value.replace(/\D/g, ''); // Only digits
        if (value.length <= 6) {
            setOtp(value);
        }
    };

    const handleBackToEmail = () => {
        setStep(1);
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat px-4 sm:px-6 lg:px-8" style={{ backgroundImage: `url(${bgImg})` }}>
            <form
                onSubmit={step === 1 ? handleRequestOTP : handleResetPassword}
                className="relative z-10 w-full max-w-[90%] xs:max-w-[400px] sm:max-w-md 
                text-center border border-white/20 rounded-2xl 
                px-6 py-8 sm:px-8 sm:py-10 
                backdrop-blur-md bg-white/10 dark:bg-zinc-900/40 shadow-xl"
            >
                {/* Header */}
                <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#FFC400] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-zinc-900 dark:text-white text-2xl sm:text-3xl font-medium">
                        {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-2">
                        {step === 1 
                            ? "Enter your email to receive a password reset OTP"
                            : "Enter the OTP and your new password"}
                    </p>
                    {step === 2 && (
                        <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium mt-2">
                            {email}
                        </p>
                    )}
                </div>

                {/* Step 1: Email Input */}
                {step === 1 && (
                    <>
                        <div className="mb-6">
                            <label className="block text-left text-zinc-600 dark:text-zinc-400 text-sm mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="your.email@example.com"
                                className="w-full bg-white/5 dark:bg-zinc-800/50 border border-zinc-300/80 dark:border-zinc-700 
                                rounded-xl px-4 py-3 text-zinc-900 dark:text-white 
                                placeholder-zinc-500 dark:placeholder-zinc-400 
                                outline-none focus:border-[#FFC400] transition-colors"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <p className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-2">
                                <span className="text-base">💡</span>
                                <span className="text-left">
                                    We'll send a 6-digit verification code to your email. The code will be valid for 15 minutes.
                                </span>
                            </p>
                        </div>

                        <button
                            type="submit"
                            className={`w-full h-12 rounded-full text-white text-base font-medium 
                            bg-[#FFC400] hover:bg-[#b58a00] transition-all shadow-lg hover:shadow-xl
                            ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending OTP...
                                </span>
                            ) : (
                                '📧 Send Reset OTP'
                            )}
                        </button>
                    </>
                )}

                {/* Step 2: OTP + New Password */}
                {step === 2 && (
                    <>
                        {/* OTP Input */}
                        <div className="mb-4">
                            <label className="block text-left text-zinc-600 dark:text-zinc-400 text-sm mb-2">
                                Enter OTP Code
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                placeholder="000000"
                                className="w-full bg-white/5 dark:bg-zinc-800/50 border border-zinc-300/80 dark:border-zinc-700 
                                rounded-xl px-4 py-4 text-zinc-900 dark:text-white 
                                placeholder-zinc-500 dark:placeholder-zinc-400 
                                outline-none text-center text-2xl font-bold tracking-[0.5em] 
                                focus:border-[#FFC400] transition-colors"
                                value={otp}
                                onChange={handleOtpChange}
                                required
                                autoFocus
                            />
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-left">
                                {otp.length}/6 digits entered
                            </p>
                        </div>

                        {/* New Password */}
                        <div className="mb-4">
                            <label className="block text-left text-zinc-600 dark:text-zinc-400 text-sm mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter new password (min. 6 characters)"
                                    className="w-full bg-white/5 dark:bg-zinc-800/50 border border-zinc-300/80 dark:border-zinc-700 
                                    rounded-xl px-4 py-3 pr-12 text-zinc-900 dark:text-white 
                                    placeholder-zinc-500 dark:placeholder-zinc-400 
                                    outline-none focus:border-[#FFC400] transition-colors"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-4">
                            <label className="block text-left text-zinc-600 dark:text-zinc-400 text-sm mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Re-enter new password"
                                    className="w-full bg-white/5 dark:bg-zinc-800/50 border border-zinc-300/80 dark:border-zinc-700 
                                    rounded-xl px-4 py-3 pr-12 text-zinc-900 dark:text-white 
                                    placeholder-zinc-500 dark:placeholder-zinc-400 
                                    outline-none focus:border-[#FFC400] transition-colors"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                >
                                    {showConfirmPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-xs text-red-500 dark:text-red-400 mt-1 text-left">
                                    Passwords do not match
                                </p>
                            )}
                        </div>

                        {/* Info Box */}
                        <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <p className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-2">
                                <span className="text-base">⏰</span>
                                <span className="text-left">
                                    OTP expires in 15 minutes. Make sure your new password is at least 6 characters long.
                                </span>
                            </p>
                        </div>

                        {/* Reset Button */}
                        <button
                            type="submit"
                            className={`w-full h-12 rounded-full text-white text-base font-medium 
                            bg-[#FFC400] hover:bg-[#b58a00] transition-all shadow-lg hover:shadow-xl
                            ${loading || otp.length !== 6 || newPassword.length < 6 || newPassword !== confirmPassword 
                                ? 'opacity-60 cursor-not-allowed' : ''}`}
                            disabled={loading || otp.length !== 6 || newPassword.length < 6 || newPassword !== confirmPassword}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Resetting Password...
                                </span>
                            ) : (
                                '🔒 Reset Password'
                            )}
                        </button>

                        {/* Resend OTP */}
                        <div className="mt-4 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={resending || countdown > 0}
                                className={`text-sm font-medium transition-colors
                                ${resending || countdown > 0 
                                    ? 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed' 
                                    : 'text-[#FFC400] hover:text-[#b58a00] hover:underline'}`}
                            >
                                {resending ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </span>
                                ) : countdown > 0 ? (
                                    `Resend in ${countdown}s`
                                ) : (
                                    '🔄 Resend OTP'
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleBackToEmail}
                                className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:underline transition-colors"
                            >
                                ← Change Email
                            </button>
                        </div>
                    </>
                )}

                {/* Back to Login */}
                <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-6">
                    Remember your password?{' '}
                    <Link to="/login" className="text-[#FFC400] hover:text-[#b58a00] hover:underline font-medium transition-colors">
                        Login here
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default ForgotPassword;