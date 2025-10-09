import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const RoleRequests = () => {
    const { backendUrl, userData, setIsLoggedIn, setUserData } = useContext(AppContext);
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
    const [stats, setStats] = useState({});
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showUserDropdown && !event.target.closest('.user-dropdown-container')) {
                setShowUserDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUserDropdown]);

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
                setShowUserDropdown(false);
                navigate('/');
                toast.success('Logged out successfully');
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


    // Fetch role requests
    const fetchRequests = async () => {
        setLoading(true);
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.get(`${backendUrl}/api/role-requests/all`, {
                params: filter !== 'all' ? { status: filter } : {}
            });

            if (res.data.success) {
                setRequests(res.data.requests);
                setFilteredRequests(res.data.requests);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error('Fetch requests error:', error);
            toast.error('Failed to fetch role requests');
        } finally {
            setLoading(false);
        }
    };

    // Fetch statistics
    const fetchStats = async () => {
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.get(`${backendUrl}/api/role-requests/stats`);
            if (res.data.success) {
                setStats(res.data.stats);
            }
        } catch (error) {
            console.error('Fetch stats error:', error);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchStats();
    }, [filter]);

    // Approve request
    const handleApprove = async (requestId) => {
        if (!window.confirm('Are you sure you want to approve this request?')) return;

        setActionLoading(true);
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${backendUrl}/api/role-requests/approve`, {
                requestId
            });

            if (res.data.success) {
                toast.success('Request approved successfully!');
                fetchRequests();
                fetchStats();
                setShowModal(false);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error('Approve error:', error);
            toast.error('Failed to approve request');
        } finally {
            setActionLoading(false);
        }
    };

    // Reject request
    const handleReject = async (requestId) => {
        if (!rejectReason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        setActionLoading(true);
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${backendUrl}/api/role-requests/reject`, {
                requestId,
                reason: rejectReason
            });

            if (res.data.success) {
                toast.success('Request rejected');
                fetchRequests();
                fetchStats();
                setShowModal(false);
                setRejectReason('');
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error('Reject error:', error);
            toast.error('Failed to reject request');
        } finally {
            setActionLoading(false);
        }
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30';
            case 'approved': return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
            case 'rejected': return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30';
        }
    };

    // Get role badge color
    const getRoleColor = (role) => {
        return role === 'admin' 
            ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30'
            : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-900 dark:to-zinc-800 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Navigation Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                        title="Go to Home"
                    >
                        <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hidden sm:inline">Home</span>
                    </Link>

                    <div className="relative user-dropdown-container">
                        <button
                            onClick={() => setShowUserDropdown(!showUserDropdown)}
                            className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                                    {userData?.name?.charAt(0).toUpperCase() || 'A'}
                                </span>
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                    {userData?.name || 'Admin'}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Administrator
                                </p>
                            </div>
                            <svg className={`w-4 h-4 text-zinc-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {showUserDropdown && (
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl z-50">
                                <div className="p-3 border-b border-zinc-200 dark:border-zinc-700">
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                        {userData?.name || 'Admin'}
                                    </p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                        {userData?.email || 'admin@example.com'}
                                    </p>
                                </div>
                                <div className="p-1">
                                    <Link
                                        to="/profile"
                                        onClick={() => setShowUserDropdown(false)}
                                        className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        disabled={loggingOut}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                                    >
                                        {loggingOut ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Logging out...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                                Logout
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-2">
                        Role Requests
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Manage employee and admin role requests
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-lg border border-zinc-200 dark:border-zinc-700">
                        <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.total || 0}</div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">Total</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 shadow-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending || 0}</div>
                        <div className="text-sm text-yellow-700 dark:text-yellow-500">Pending</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 shadow-lg border border-green-200 dark:border-green-800">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved || 0}</div>
                        <div className="text-sm text-green-700 dark:text-green-500">Approved</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 shadow-lg border border-red-200 dark:border-red-800">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected || 0}</div>
                        <div className="text-sm text-red-700 dark:text-red-500">Rejected</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 shadow-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.employeeRequests || 0}</div>
                        <div className="text-sm text-blue-700 dark:text-blue-500">Employee</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 shadow-lg border border-purple-200 dark:border-purple-800">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.adminRequests || 0}</div>
                        <div className="text-sm text-purple-700 dark:text-purple-500">Admin</div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 p-1 mb-6 inline-flex gap-1">
                    {['all', 'pending', 'approved', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                filter === status
                                    ? 'bg-[#FFC400] text-white shadow-md'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Requests List */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC400]"></div>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 p-12 text-center">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                            No Requests Found
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            There are no {filter !== 'all' ? filter : ''} role requests at the moment.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredRequests.map((request) => (
                            <div
                                key={request._id}
                                className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 p-6 hover:shadow-xl transition-all"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    {/* Request Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFC400] to-[#FFD700] flex items-center justify-center text-white font-bold text-lg">
                                                {request.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                                    {request.name}
                                                </h3>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                    {request.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(request.requestedRole)}`}>
                                                {request.requestedRole.toUpperCase()}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                                                {request.status.toUpperCase()}
                                            </span>
                                            {request.department && (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-600">
                                                    {request.department}
                                                </span>
                                            )}
                                        </div>

                                        {request.reason && (
                                            <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-3 mb-3">
                                                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                                    <strong>Reason:</strong> {request.reason}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                                            <span>📅 Requested: {formatDate(request.createdAt)}</span>
                                            {request.reviewedAt && (
                                                <span>✅ Reviewed: {formatDate(request.reviewedAt)}</span>
                                            )}
                                        </div>

                                        {request.status === 'rejected' && request.rejectionReason && (
                                            <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                                <p className="text-sm text-red-700 dark:text-red-400">
                                                    <strong>Rejection Reason:</strong> {request.rejectionReason}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {request.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApprove(request._id)}
                                                disabled={actionLoading}
                                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                ✓ Approve
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setShowModal(true);
                                                }}
                                                disabled={actionLoading}
                                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                ✗ Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
                            Reject Request
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                            Rejecting <strong>{selectedRequest?.name}</strong>'s {selectedRequest?.requestedRole} role request.
                        </p>
                        <textarea
                            className="w-full bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-500 outline-none focus:border-[#FFC400] transition-colors resize-none"
                            rows="4"
                            placeholder="Reason for rejection (required)..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            required
                        />
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => handleReject(selectedRequest._id)}
                                disabled={actionLoading || !rejectReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setRejectReason('');
                                    setSelectedRequest(null);
                                }}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleRequests;