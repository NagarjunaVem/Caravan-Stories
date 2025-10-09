import { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import bgImg from '../assets/bg.jpg';
import axios from 'axios';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { backendUrl, setIsLoggedIn, setUserData } = useContext(AppContext);

    // Get email from navigation state or query params
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        // Get email from location state (from register page)
        const stateEmail = location.state?.email;
        // Or from query params
        const params = new URLSearchParams(location.search);
        const queryEmail = params.get('email');
        
        const userEmail = stateEmail || queryEmail;
        
        if (!userEmail) {
            toast.error('No email provided. Please register again.');
            navigate('/register');
            return;
        }
        
        setEmail(userEmail);
    }, [location, navigate]);

    // Countdown timer for resend button
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Handle OTP verification
    const handleVerify = async (e) => {
        e.preventDefault();
        
        if (otp.length !== 6) {
            toast.error('Please enter a 6-digit verification code');
            return;
        }

        setLoading(true);

        try {
            axios.defaults.withCredentials = true;

            const res = await axios.post(`${backendUrl}/api/auth/verify-registration`, {
                email,
                otp
            });

            const data = res.data;

            if (data.success && data.user) {
                setIsLoggedIn(true);
                setUserData(data.user);
                toast.success('Email verified successfully!');
                navigate('/');
            } else {
                toast.error(data.message || 'Verification failed');
            }
        } catch (error) {
            console.error('Verification error:', error);
            toast.error(error.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    // Handle resend OTP
    const handleResend = async () => {
        if (countdown > 0) return;

        setResendLoading(true);

        try {
            axios.defaults.withCredentials = true;

            const res = await axios.post(`${backendUrl}/api/auth/resend-verification`, {
                email
            });

            const data = res.data;

            if (data.success) {
                toast.success('Verification code sent! Check your email.');
                setCountdown(60); // 60 seconds cooldown
                setOtp(''); // Clear OTP input
            } else {
                toast.error(data.message || 'Failed to resend code');
            }
        } catch (error) {
            console.error('Resend error:', error);
            toast.error(error.response?.data?.message || 'Failed to resend code');
        } finally {
            setResendLoading(false);
        }
    };

    // Handle OTP input (only numbers, max 6 digits)
    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setOtp(value);
    };

    return (
        <div 
            className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat px-4 sm:px-6 lg:px-8" 
            style={{ backgroundImage: `url(${bgImg})` }}
        >
            <form
                onSubmit={handleVerify}
                className="relative z-10 w-full max-w-[90%] xs:max-w-[350px] sm:max-w-md md:max-w-lg lg:max-w-xl 
                sm:w-[350px] text-center border border-white/20 rounded-2xl 
                px-6 py-6 sm:px-8 sm:py-8 
                backdrop-blur-md bg-white/10 dark:bg-zinc-900/40 shadow-xl"
            >
                {/* Icon */}
                <div className="flex justify-center mt-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FFC400]/20 flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-[#FFC400]"
                            viewBox="0 0 24 24"
                        >
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-zinc-900 dark:text-white text-2xl sm:text-3xl mt-4 sm:mt-6 font-medium">
                    Verify Your Email
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-2 px-4">
                    We've sent a 6-digit verification code to
                </p>
                <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium mt-1 mb-6">
                    {email}
                </p>

                {/* OTP Input */}
                <div className="flex items-center justify-center w-full mt-4 sm:mt-6">
                    <input
                        type="text"
                        inputMode="numeric"
                        placeholder="000000"
                        className="w-full max-w-[200px] h-14 sm:h-16 text-center text-2xl sm:text-3xl font-bold 
                        tracking-[0.5em] bg-white/5 dark:bg-zinc-800/50 
                        border-2 border-zinc-300/80 dark:border-zinc-700 
                        rounded-xl text-zinc-900 dark:text-zinc-200 
                        placeholder-zinc-400 dark:placeholder-zinc-500 
                        outline-none focus:border-[#FFC400] transition-colors
                        backdrop-blur-lg"
                        value={otp}
                        onChange={handleOtpChange}
                        maxLength={6}
                        required
                        autoFocus
                    />
                </div>

                {/* Verify Button */}
                <button
                    type="submit"
                    className={`mt-6 sm:mt-8 w-full h-11 sm:h-12 rounded-full text-white text-sm sm:text-base font-medium 
                    bg-[#FFC400] hover:bg-[#b58a00b4] transition-all 
                    ${loading || otp.length !== 6 ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={loading || otp.length !== 6}
                >
                    {loading ? 'Verifying...' : 'Verify Email'}
                </button>

                {/* Resend Code */}
                <div className="mt-6">
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">
                        Didn't receive the code?
                    </p>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendLoading || countdown > 0}
                        className={`mt-2 text-[#FFC400] hover:text-[#b58a00] font-medium text-sm transition-colors
                        ${resendLoading || countdown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {resendLoading ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                    </button>
                </div>

                {/* Back to Register */}
                <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-6 mb-4">
                    Wrong email?{' '}
                    <Link
                        to="/register"
                        className="text-[#FFC400] dark:text-[#FFC400] hover:underline font-medium"
                    >
                        Register again
                    </Link>
                </p>

                {/* Help Text */}
                <div className="mt-6 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        💡 <strong>Tip:</strong> Check your spam folder if you don't see the email. 
                        The code expires in 10 minutes.
                    </p>
                </div>
            </form>
        </div>
    );
};

export default VerifyEmail;