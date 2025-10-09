import { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import bgImg from '../assets/bg.jpg';
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
        // Get email from navigation state
        const stateEmail = location.state?.email;
        if (stateEmail) {
            setEmail(stateEmail);
        } else {
            toast.error('No email provided. Please register first.');
            navigate('/register');
        }
    }, [location, navigate]);

    // Countdown timer for resend
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
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
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
                setCountdown(60); // 60 seconds cooldown
                setOtp(''); // Clear current OTP
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

    return (
        <div className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat px-4 sm:px-6 lg:px-8" style={{ backgroundImage: `url(${bgImg})` }}>
            <form
                onSubmit={handleVerify}
                className="relative z-10 w-full max-w-[90%] xs:max-w-[400px] sm:max-w-md 
                text-center border border-white/20 rounded-2xl 
                px-6 py-8 sm:px-8 sm:py-10 
                backdrop-blur-md bg-white/10 dark:bg-zinc-900/40 shadow-xl"
            >
                <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#FFC400] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-zinc-900 dark:text-white text-2xl sm:text-3xl font-medium">
                        Verify Your Email
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-2">
                        We've sent a 6-digit verification code to
                    </p>
                    <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium mt-1">
                        {email}
                    </p>
                </div>

                {/* OTP Input */}
                <div className="mb-6">
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

                {/* Info Box */}
                <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-2">
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
                    bg-[#FFC400] hover:bg-[#b58a00] transition-all shadow-lg hover:shadow-xl
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
                        '✓ Verify Email'
                    )}
                </button>

                {/* Resend OTP */}
                <div className="mt-6">
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
                <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-6">
                    Already verified?{' '}
                    <Link to="/login" className="text-[#FFC400] hover:text-[#b58a00] hover:underline font-medium transition-colors">
                        Login here
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default VerifyEmail;