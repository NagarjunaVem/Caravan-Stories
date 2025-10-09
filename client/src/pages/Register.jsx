import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import bgImg from '../assets/bg.jpg';
import axios from 'axios';

const Register = () => {
    const navigate = useNavigate();
    const { backendUrl } = useContext(AppContext);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('citizen');
    const [department, setDepartment] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const DEPARTMENTS = [
        "IT", "HR", "Finance", "Facilities", "Management", "Support",
        "Operations", "Safety", "Electrical", "Mechanical", "Civil",
        "Maintenance", "Logistics", "Procurement",
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            axios.defaults.withCredentials = true;

            const res = await axios.post(`${backendUrl}/api/auth/register`, {
                name,
                email,
                password,
                role,
                department: role === 'employee' ? department : undefined,
                reason: role !== 'citizen' ? reason : undefined,
            });

            const data = res.data;

            if (data.success) {
                if (data.requiresApproval) {
                    toast.success(data.message);
                    navigate('/login');
                } else if (data.needsVerification) {
                    toast.success(data.message);
                    navigate('/verify-email', { state: { email: data.email } });
                }
            } else {
                toast.error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat px-4 sm:px-6 lg:px-8" style={{ backgroundImage: `url(${bgImg})` }}>
            <form
                onSubmit={handleSubmit}
                className="relative z-10 w-full max-w-[90%] xs:max-w-[400px] sm:max-w-md 
                text-center border border-white/20 rounded-2xl 
                px-6 py-6 sm:px-8 sm:py-8 
                backdrop-blur-md bg-white/10 dark:bg-zinc-900/40 shadow-xl
                max-h-[90vh] overflow-y-auto"
            >
                <h1 className="text-zinc-900 dark:text-white text-2xl sm:text-3xl mt-4 font-medium">
                    Create Account
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-2 pb-4">
                    Sign up to get started
                </p>

                {/* Name */}
                <div className="flex items-center w-full mt-3 bg-white/5 dark:bg-zinc-800/50 border border-zinc-300/80 dark:border-zinc-700 h-11 sm:h-12 rounded-full overflow-hidden pl-4 sm:pl-6 gap-2 backdrop-blur-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500 dark:text-zinc-400 flex-shrink-0" viewBox="0 0 24 24">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="bg-transparent text-zinc-900 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none text-sm w-full h-full pr-4"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                {/* Email */}
                <div className="flex items-center w-full mt-3 bg-white/5 dark:bg-zinc-800/50 border border-zinc-300/80 dark:border-zinc-700 h-11 sm:h-12 rounded-full overflow-hidden pl-4 sm:pl-6 gap-2 backdrop-blur-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500 dark:text-zinc-400 flex-shrink-0" viewBox="0 0 24 24">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <input
                        type="email"
                        placeholder="Email address"
                        className="bg-transparent text-zinc-900 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none text-sm w-full h-full pr-4"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* Password */}
                <div className="flex items-center mt-3 w-full bg-white/5 dark:bg-zinc-800/50 border border-zinc-300/80 dark:border-zinc-700 h-11 sm:h-12 rounded-full overflow-hidden pl-4 sm:pl-6 gap-2 backdrop-blur-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500 dark:text-zinc-400 flex-shrink-0" viewBox="0 0 24 24">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                        type="password"
                        placeholder="Password (min 6 characters)"
                        className="bg-transparent text-zinc-900 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none text-sm w-full h-full pr-4"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>

                {/* Role Selection */}
                <div className="flex items-center mt-3 w-full bg-white/5 dark:bg-zinc-800/50 border border-zinc-300/80 dark:border-zinc-700 h-11 sm:h-12 rounded-full overflow-hidden pl-4 sm:pl-6 gap-2 backdrop-blur-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500 dark:text-zinc-400 flex-shrink-0" viewBox="0 0 24 24">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <select
                        className="bg-transparent text-zinc-900 dark:text-zinc-200 outline-none text-sm w-full h-full pr-4 cursor-pointer"
                        value={role}
                        onChange={(e) => {
                            setRole(e.target.value);
                            if (e.target.value === 'citizen') {
                                setDepartment('');
                                setReason('');
                            }
                        }}
                        required
                    >
                        <option value="citizen" className="bg-zinc-800 text-white">👤 Citizen (Instant Access)</option>
                        <option value="employee" className="bg-zinc-800 text-white">👔 Employee (Needs Approval)</option>
                        <option value="admin" className="bg-zinc-800 text-white">⚙️ Admin (Needs Approval)</option>
                    </select>
                </div>

                {/* Department (Employee only) */}
                {role === 'employee' && (
                    <div className="flex items-center mt-3 w-full bg-white/5 dark:bg-zinc-800/50 border border-zinc-300/80 dark:border-zinc-700 h-11 sm:h-12 rounded-full overflow-hidden pl-4 sm:pl-6 gap-2 backdrop-blur-lg animate-fadeIn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500 dark:text-zinc-400 flex-shrink-0" viewBox="0 0 24 24">
                            <rect width="7" height="9" x="3" y="3" rx="1" />
                            <rect width="7" height="5" x="14" y="3" rx="1" />
                            <rect width="7" height="9" x="14" y="12" rx="1" />
                            <rect width="7" height="5" x="3" y="16" rx="1" />
                        </svg>
                        <select
                            className="bg-transparent text-zinc-900 dark:text-zinc-200 outline-none text-sm w-full h-full pr-4 cursor-pointer"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            required
                        >
                            <option value="" className="bg-zinc-800 text-white">Select Department</option>
                            {DEPARTMENTS.map((dept) => (
                                <option key={dept} value={dept} className="bg-zinc-800 text-white">
                                    {dept}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Reason (Employee/Admin) */}
                {role !== 'citizen' && (
                    <div className="mt-3 animate-fadeIn">
                        <textarea
                            placeholder={`Why do you need ${role} access? (Optional but recommended)`}
                            className="w-full bg-white/5 dark:bg-zinc-800/50 border border-zinc-300/80 dark:border-zinc-700 
                            rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 
                            placeholder-zinc-500 dark:placeholder-zinc-400 
                            outline-none text-sm backdrop-blur-lg resize-none
                            focus:border-[#FFC400] transition-colors"
                            rows="3"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            maxLength={500}
                        />
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 text-right">
                            {reason.length}/500
                        </p>
                    </div>
                )}

                {/* Info Box */}
                {role !== 'citizen' && (
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg animate-fadeIn">
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-2">
                            <span className="text-lg">ℹ️</span>
                            <span>
                                <strong className="text-blue-600 dark:text-blue-400">Admin Approval Required:</strong>
                                {' '}Your {role} account request will be sent to administrators for review. 
                                You'll receive an email notification once it's processed.
                            </span>
                        </p>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    className={`mt-5 w-full h-11 sm:h-12 rounded-full text-white text-sm sm:text-base font-medium 
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
                            Processing...
                        </span>
                    ) : (
                        role === 'citizen' ? '✓ Sign Up' : '📤 Submit Request'
                    )}
                </button>

                {/* Login Link */}
                <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-4 mb-4">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#FFC400] hover:text-[#b58a00] hover:underline font-medium transition-colors">
                        Login here
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Register;