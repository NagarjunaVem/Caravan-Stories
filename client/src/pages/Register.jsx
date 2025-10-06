import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import bgImg from '../assets/bg.jpg';

import axios from 'axios';

const Register = () => {
    const navigate = useNavigate();
    const { backendUrl, setIsLoggedIn, setUserData } = useContext(AppContext);

    // Form input states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            axios.defaults.withCredentials = true;

            const res = await axios.post(`${backendUrl}/api/auth/register`, {
                name,
                email,
                password
            });

            const data = res.data;

            if (data.success && data.user?.role) {
                setIsLoggedIn(true);
                setUserData(data.user);
                toast.success('Registration successful!');
                navigate('/');
            } else {
                toast.error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.response?.data?.message || 'An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat px-4 sm:px-6 lg:px-8" style={{ backgroundImage: `url(${bgImg})` }}>
            <form
                onSubmit={handleSubmit}
                className="relative z-10 w-full max-w-[90%] xs:max-w-[350px] sm:max-w-md md:max-w-lg lg:max-w-xl 
                sm:w-[350px] text-center border border-white/20 rounded-2xl 
                px-6 py-6 sm:px-8 sm:py-8 
                backdrop-blur-md bg-white/10 dark:bg-zinc-900/40 shadow-xl"
            >
                <h1 className="text-zinc-900 dark:text-white text-2xl sm:text-3xl mt-6 sm:mt-10 font-medium">
                    Create Account
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-2 pb-4 sm:pb-6">
                    Sign up to get started
                </p>

                {/* Name input */}
                <div className="flex items-center w-full mt-3 sm:mt-4 bg-white/5 dark:bg-zinc-800/50 border border-zinc-300/80 dark:border-zinc-700 h-11 sm:h-12 rounded-full overflow-hidden pl-4 sm:pl-6 gap-2 backdrop-blur-lg">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-zinc-500 dark:text-zinc-400 flex-shrink-0"
                        viewBox="0 0 24 24"
                    >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="bg-transparent text-zinc-900 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none text-sm w-full h-full pr-4"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                {/* Email input */}
                <div className="flex items-center w-full mt-3 sm:mt-4 bg-white/5 dark:bg-zinc-800/50 border border-zinc-300/80 dark:border-zinc-700 h-11 sm:h-12 rounded-full overflow-hidden pl-4 sm:pl-6 gap-2 backdrop-blur-lg">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-zinc-500 dark:text-zinc-400 flex-shrink-0"
                        viewBox="0 0 24 24"
                    >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <input
                        type="email"
                        placeholder="Email id"
                        className="bg-transparent text-zinc-900 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none text-sm w-full h-full pr-4"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* Password input */}
                <div className="flex items-center mt-3 sm:mt-4 w-full bg-white/5 dark:bg-zinc-800/50 border border-zinc-300/80 dark:border-zinc-700 h-11 sm:h-12 rounded-full overflow-hidden pl-4 sm:pl-6 gap-2 backdrop-blur-lg">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-zinc-500 dark:text-zinc-400 flex-shrink-0"
                        viewBox="0 0 24 24"
                    >
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                        type="password"
                        placeholder="Password"
                        className="bg-transparent text-zinc-900 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none text-sm w-full h-full pr-4"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    className={`mt-4 sm:mt-6 w-full h-11 sm:h-12 rounded-full text-white text-sm sm:text-base font-medium bg-indigo-500 hover:bg-indigo-600 transition-all ${loading ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                    disabled={loading}
                >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>

                {/* Toggle to login */}
                <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-3 sm:mt-4 mb-6 sm:mb-11">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="text-indigo-500 dark:text-indigo-400 hover:underline font-medium"
                    >
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Register;