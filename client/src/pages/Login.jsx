import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const { backendUrl, setIsLoggedIn, setUserData } = useContext(AppContext);

    // State: login or register
    const [state, setState] = useState('login');

    // Form input states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Navigate based on role
    const navigateByRole = (role) => {
        const r = role?.toLowerCase();
        if (r === 'citizen') navigate('/citizen-dashboard');
        else if (r === 'employee') navigate('/employee-dashboard');
        else if (r === 'admin') navigate('/admin-dashboard');
        else navigate('/');
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            axios.defaults.withCredentials = true;

            const res =
                state === 'login'
                    ? await axios.post(`${backendUrl}/api/auth/login`, { email, password })
                    : await axios.post(`${backendUrl}/api/auth/register`, { name, email, password });

            const data = res.data;

            if (data.success && data.user?.role) {
                setIsLoggedIn(true);
                setUserData(data.user);
                navigateByRole(data.user.role);
            } else {
                toast.error(data.message || 'Login/Register failed');
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-950">
            <form
                onSubmit={handleSubmit}
                className="w-full sm:w-[350px] text-center border border-zinc-300/60 dark:border-zinc-700 rounded-2xl px-8 bg-white dark:bg-zinc-900"
            >
                <h1 className="text-zinc-900 dark:text-white text-3xl mt-10 font-medium">
                    {state === 'login' ? 'Login' : 'Register'}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 pb-6">
                    Please {state === 'login' ? 'sign in' : 'sign up'} to continue
                </p>

                {/* Name input for registration */}
                {state !== 'login' && (
                    <div className="flex items-center w-full mt-4 bg-white dark:bg-zinc-800 border border-zinc-300/80 dark:border-zinc-700 h-12 rounded-full overflow-hidden pl-6 gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-zinc-500 dark:text-zinc-400"
                            viewBox="0 0 24 24"
                        >
                            <path d="M20 21a8 8 0 0 0-16 0" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Name"
                            className="bg-transparent text-zinc-600 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none text-sm w-full h-full"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                )}

                {/* Email input */}
                <div className="flex items-center w-full mt-4 bg-white dark:bg-zinc-800 border border-zinc-300/80 dark:border-zinc-700 h-12 rounded-full overflow-hidden pl-6 gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-zinc-500 dark:text-zinc-400"
                        viewBox="0 0 24 24"
                    >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <input
                        type="email"
                        placeholder="Email id"
                        className="bg-transparent text-zinc-600 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none text-sm w-full h-full"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* Password input */}
                <div className="flex items-center mt-4 w-full bg-white dark:bg-zinc-800 border border-zinc-300/80 dark:border-zinc-700 h-12 rounded-full overflow-hidden pl-6 gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-zinc-500 dark:text-zinc-400"
                        viewBox="0 0 24 24"
                    >
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                        type="password"
                        placeholder="Password"
                        className="bg-transparent text-zinc-600 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none text-sm w-full h-full"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    className={`mt-2 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity cursor-pointer ${loading ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : state === 'login' ? 'Login' : 'Create Account'}
                </button>

                {/* Toggle login/register */}
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-3 mb-11">
                    {state === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        type="button"
                        className="text-indigo-500 dark:text-indigo-400 cursor-pointer"
                        onClick={() => setState((prev) => (prev === 'login' ? 'register' : 'login'))}
                    >
                        {state === 'login' ? 'Register' : 'Login'}
                    </button>
                </p>
            </form>
        </div>
    );
};

export default Login;
