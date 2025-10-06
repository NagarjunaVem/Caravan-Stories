import { useContext, useState } from 'react';
import { AppContext } from "../context/AppContext";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify'; // Optional: install with npm i react-toastify

// Helper function outside component
const getDashboardPath = (role) => {
    const dashboardMap = {
        citizen: '/citizen-dashboard',
        employee: '/employee-dashboard',
        admin: '/admin-dashboard'
    };
    return dashboardMap[role] || '/login';
};

const Header = () => {
    const { isLoggedIn, userData, setIsLoggedIn, setUserData, backendUrl } = useContext(AppContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/auth/logout`,
                {},
                { withCredentials: true }
            );

            if (data.success) {
                setIsLoggedIn(false);
                setUserData(null);
                setDropdownOpen(false);
                navigate('/');
                toast.success('Logged out successfully'); // Optional
            } else {
                toast.error(data.message || 'Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout. Please try again.');
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <nav className="h-[70px] relative w-full px-6 md:px-16 lg:px-24 xl:px-32 flex items-center justify-between z-20 bg-white text-gray-700 shadow-[0px_4px_25px_0px_#0000000D] transition-all">

            <Link to="/" className="text-indigo-600 flex items-center gap-2">
                <svg
                    width="40"
                    height="40"
                    viewBox="0 0 120 120"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0"
                >
                    <defs>
                        <linearGradient id="stackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#8b5cf6' }} />
                            <stop offset="100%" style={{ stopColor: '#6366f1' }} />
                        </linearGradient>
                    </defs>
                    <rect width="120" height="120" fill="url(#stackGrad)" rx="24" />
                    <rect x="20" y="25" width="40" height="12" fill="white" rx="2" opacity="0.9" />
                    <rect x="20" y="42" width="40" height="12" fill="white" rx="2" opacity="0.9" />
                    <rect x="20" y="59" width="40" height="12" fill="white" rx="2" opacity="0.9" />
                    <rect x="20" y="76" width="40" height="12" fill="white" rx="2" opacity="0.9" />
                    <line x1="60" y1="20" x2="60" y2="93" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
                    <text x="75" y="70" fontFamily="Arial, sans-serif" fontSize="32" fontWeight="bold" fill="white" opacity="0.3">HS</text>
                </svg>
                <span className="font-bold text-xl hidden sm:inline">HalfStack</span>
            </Link>

            <div className="flex items-center gap-4">
                {isLoggedIn ? (
                    <>
                        <Link
                            to={getDashboardPath(userData?.role)}
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden md:inline"
                        >
                            Dashboard
                        </Link>

                        {/* User Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                                    {userData?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className="text-sm font-medium hidden lg:inline">
                                    {userData?.name || 'User'}
                                </span>
                                <svg
                                    className={`w-4 h-4 text-gray-600 transition-transform hidden lg:block ${dropdownOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <>
                                    {/* Backdrop */}
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setDropdownOpen(false)}
                                    />

                                    {/* Menu */}
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-100 overflow-hidden">
                                        {/* User Info */}
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-800">
                                                {userData?.name || 'User'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {userData?.email || ''}
                                            </p>
                                            <p className="text-xs text-indigo-600 mt-1 capitalize">
                                                {userData?.role || 'User'}
                                            </p>
                                        </div>

                                        {/* Menu Items */}
                                        <Link
                                            to={getDashboardPath(userData?.role)}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors md:hidden"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                </svg>
                                                Dashboard
                                            </div>
                                        </Link>

                                        {/* <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Profile Settings
                                            </div>
                                        </Link> */}

                                        <Link
                                            to="/tickets"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                                </svg>
                                                My Tickets
                                            </div>
                                        </Link>

                                        {/* Logout Button */}
                                        <button
                                            onClick={handleLogout}
                                            disabled={loggingOut}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="flex items-center gap-2">
                                                {loggingOut ? (
                                                    <>
                                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Logging out...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                        </svg>
                                                        Logout
                                                    </>
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <Link
                        to="/register"
                        className="bg-white text-gray-600 border border-gray-300 text-sm hover:bg-gray-50 active:scale-95 transition-all px-6 h-11 rounded-full flex items-center justify-center"
                    >
                        Get started
                    </Link>
                )}
            </div>
        </nav>
    );
}

export default Header;