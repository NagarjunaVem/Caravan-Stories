import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const CATEGORIES = [
  "IT", "HR", "Finance", "Facilities", "Management", "Support",
  "Operations", "Safety", "Electrical", "Mechanical", "Civil",
  "Maintenance", "Logistics", "Procurement", "Other"
];

const PRIORITY_LEVELS = ["Low", "Medium", "High", "Urgent"];

const CitizenDashboard = () => {
    const { backendUrl, userData } = useContext(AppContext);
    
    // State
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        reopened: 0
    });
    const [myTickets, setMyTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [filterStatus, setFilterStatus] = useState('all');
    
    // Modal states
    const [showCreateTicket, setShowCreateTicket] = useState(false);
    const [showTicketDetails, setShowTicketDetails] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    
    // Create ticket form
    const [ticketForm, setTicketForm] = useState({
        title: '',
        description: '',
        category: '',
        priority: 'Medium',
        location: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchMyTickets();
        fetchMyStats();
    }, []);

    const fetchMyTickets = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/tickets/my-submitted`, {
                withCredentials: true
            });
            
            if (data.success) {
                setMyTickets(data.tickets || []);
            }
        } catch (error) {
            console.error('Fetch tickets error:', error);
            toast.error(error.response?.data?.message || 'Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyStats = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/tickets/my-summary`, {
                withCredentials: true
            });
            
            if (data.success) {
                setStats(data.summary);
            }
        } catch (error) {
            console.error('Fetch stats error:', error);
        }
    };

    const getCurrentLocation = () => {
        setLoadingLocation(true);
        
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            setLoadingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();
                    const address = data.display_name || `${latitude}, ${longitude}`;
                    
                    setTicketForm({ ...ticketForm, location: address });
                    toast.success('Location detected successfully!');
                } catch (error) {
                    setTicketForm({ ...ticketForm, location: `${latitude}, ${longitude}` });
                    toast.info('Location coordinates set');
                }
                
                setLoadingLocation(false);
            },
            (error) => {
                toast.error('Unable to retrieve your location');
                setLoadingLocation(false);
            }
        );
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            
            setTicketForm({ ...ticketForm, image: file });
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        
        if (!ticketForm.category) {
            toast.error('Please select a category');
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('title', ticketForm.title);
            formData.append('description', ticketForm.description);
            formData.append('category', ticketForm.category);
            formData.append('priority', ticketForm.priority);
            formData.append('location', ticketForm.location || '');
            
            if (ticketForm.image) {
                formData.append('image', ticketForm.image);
            }

            const { data } = await axios.post(
                `${backendUrl}/api/tickets/create`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            if (data.success) {
                toast.success('Complaint submitted successfully!');
                setShowCreateTicket(false);
                resetForm();
                fetchMyTickets();
                fetchMyStats();
            } else {
                toast.error(data.message || 'Failed to create complaint');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create complaint');
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewTicket = async (ticketId) => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/tickets/details/${ticketId}`,
                { withCredentials: true }
            );
            
            if (data.success) {
                setSelectedTicket(data.ticket);
                setShowTicketDetails(true);
            } else {
                toast.error(data.message || 'Failed to load ticket details');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load ticket details');
        }
    };

    const handleReopenTicket = async (ticketId) => {
        const reason = prompt('Please provide a reason for reopening this ticket:');
        
        if (!reason || !reason.trim()) {
            toast.error('Reason is required to reopen ticket');
            return;
        }

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/tickets/reopen`,
                { ticketId, reason },
                { withCredentials: true }
            );
            
            if (data.success) {
                toast.success('Ticket reopened successfully!');
                setShowTicketDetails(false);
                setSelectedTicket(null);
                fetchMyTickets();
                fetchMyStats();
            } else {
                toast.error(data.message || 'Failed to reopen ticket');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reopen ticket');
        }
    };

    const resetForm = () => {
        setTicketForm({
            title: '',
            description: '',
            category: '',
            priority: 'Medium',
            location: '',
            image: null
        });
        setImagePreview(null);
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
            'Open': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'Closed': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
            'Reopened': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'Low': 'text-green-600 dark:text-green-400',
            'Medium': 'text-yellow-600 dark:text-yellow-400',
            'High': 'text-orange-600 dark:text-orange-400',
            'Urgent': 'text-red-600 dark:text-red-400'
        };
        return colors[priority] || 'text-gray-600';
    };

    const getStatusSteps = (currentStatus) => {
        const steps = [
            { name: 'Submitted', status: 'Pending', icon: '📝' },
            { name: 'Acknowledged', status: 'Open', icon: '👁️' },
            { name: 'In Progress', status: 'In Progress', icon: '🔧' },
            { name: 'Resolved', status: 'Resolved', icon: '✅' },
            { name: 'Closed', status: 'Closed', icon: '🔒' }
        ];

        const statusOrder = ['Pending', 'Open', 'In Progress', 'Resolved', 'Closed'];
        let currentIndex = statusOrder.indexOf(currentStatus);
        
        // Handle Reopened status
        if (currentStatus === 'Reopened') {
            currentIndex = 2; // Show as In Progress
        }
        
        return steps.map((step, index) => ({
            ...step,
            completed: index <= currentIndex,
            current: index === currentIndex
        }));
    };

    const filteredTickets = filterStatus === 'all' 
        ? myTickets 
        : myTickets.filter(t => {
            if (filterStatus === 'active') {
                return ['Pending', 'Open', 'In Progress', 'Reopened'].includes(t.status);
            }
            if (filterStatus === 'completed') {
                return ['Resolved', 'Closed'].includes(t.status);
            }
            return t.status === filterStatus;
        });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            My Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Welcome back, {userData?.name || 'Citizen'}!
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateTicket(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Submit New Complaint
                    </button>
                </div>

                {/* Tabs */}
                <div className="mb-8 border-b border-gray-200 dark:border-zinc-800">
                    <nav className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'overview'
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('tickets')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'tickets'
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            My Complaints ({myTickets.length})
                        </button>
                    </nav>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Total Complaints
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                            {stats.total}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Pending
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                            {stats.pending}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900/30 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Awaiting review
                                </p>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            In Progress
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                            {stats.open + stats.inProgress + stats.reopened}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Being worked on
                                </p>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Resolved
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                            {stats.resolved + stats.closed}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Successfully completed
                                </p>
                            </div>
                        </div>

                        {/* Recent Tickets */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
                            <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Recent Complaints
                                </h2>
                            </div>
                            
                            <div className="p-6">
                                {myTickets.slice(0, 5).length > 0 ? (
                                    <div className="space-y-4">
                                        {myTickets.slice(0, 5).map((ticket) => (
                                            <div
                                                key={ticket._id}
                                                onClick={() => handleViewTicket(ticket.ticketId)}
                                                className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                                {ticket.ticketId}
                                                            </span>
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                                                {ticket.status}
                                                            </span>
                                                        </div>
                                                        <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                                                            {ticket.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                            {ticket.description}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                            <span className="flex items-center gap-1">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                                </svg>
                                                                {ticket.category}
                                                            </span>
                                                            {ticket.location && (
                                                                <span className="flex items-center gap-1 truncate max-w-xs">
                                                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    </svg>
                                                                    {ticket.location}
                                                                </span>
                                                            )}
                                                            <span className="flex items-center gap-1">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {ticket.image && (
                                                        <img
                                                            src={`${backendUrl}${ticket.image}`}
                                                            alt="Complaint"
                                                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No complaints yet
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                                            Get started by submitting your first complaint
                                        </p>
                                        <button
                                            onClick={() => setShowCreateTicket(true)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
                                        >
                                            Submit Complaint
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Tickets Tab */}
                {activeTab === 'tickets' && (
                    <div className="space-y-4">
                        {/* Filter Buttons */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filterStatus === 'all'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
                                }`}
                            >
                                All ({myTickets.length})
                            </button>
                            <button
                                onClick={() => setFilterStatus('active')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filterStatus === 'active'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
                                }`}
                            >
                                Active ({stats.pending + stats.open + stats.inProgress + stats.reopened})
                            </button>
                            <button
                                onClick={() => setFilterStatus('completed')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filterStatus === 'completed'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
                                }`}
                            >
                                Completed ({stats.resolved + stats.closed})
                            </button>
                        </div>

                        {/* Tickets List */}
                        {filteredTickets.length > 0 ? (
                            filteredTickets.map((ticket) => (
                                <div
                                    key={ticket._id}
                                    onClick={() => handleViewTicket(ticket.ticketId)}
                                    className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-md transition-all cursor-pointer"
                                >
                                    <div className="flex items-start gap-4">
                                        {ticket.image && (
                                            <img
                                                src={`${backendUrl}${ticket.image}`}
                                                alt="Complaint"
                                                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                                            />
                                        )}
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <span className="font-semibold text-gray-900 dark:text-white">
                                                            {ticket.ticketId}
                                                        </span>
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                                            {ticket.status}
                                                        </span>
                                                        <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                                                            {ticket.priority} Priority
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                        {ticket.title}
                                                    </h3>
                                                </div>
                                                <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex-shrink-0">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                            
                                            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                {ticket.description}
                                            </p>
                                            
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                    </svg>
                                                    {ticket.category}
                                                </span>
                                                {ticket.location && (
                                                    <span className="flex items-center gap-1 max-w-xs truncate">
                                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {ticket.location}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Created {new Date(ticket.createdAt).toLocaleDateString()}
                                                </span>
                                                {ticket.assignedTo && (
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        {ticket.assignedTo.department}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No complaints found
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    {filterStatus === 'all' 
                                        ? 'Get started by submitting your first complaint'
                                        : 'No complaints in this category'}
                                </p>
                                {filterStatus === 'all' && (
                                    <button
                                        onClick={() => setShowCreateTicket(true)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
                                    >
                                        Submit Complaint
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

           {/* Create Ticket Modal - Optimized for no scroll */}
{showCreateTicket && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Submit New Complaint
                    </h2>
                    <button
                        onClick={() => {
                            setShowCreateTicket(false);
                            resetForm();
                        }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        disabled={submitting}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <form onSubmit={handleCreateTicket} className="p-4 space-y-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Complaint Title *
                    </label>
                    <input
                        type="text"
                        value={ticketForm.title}
                        onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                        placeholder="Brief description of the issue"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                        maxLength={200}
                    />
                </div>
                
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description *
                    </label>
                    <textarea
                        value={ticketForm.description}
                        onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                        placeholder="Provide detailed information about the complaint..."
                        rows="3"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        required
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Category *
                        </label>
                        <select
                            value={ticketForm.category}
                            onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        >
                            <option value="">Select Category</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Priority *
                        </label>
                        <select
                            value={ticketForm.priority}
                            onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        >
                            {PRIORITY_LEVELS.map((priority) => (
                                <option key={priority} value={priority}>{priority}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={ticketForm.location}
                            onChange={(e) => setTicketForm({ ...ticketForm, location: e.target.value })}
                            placeholder="Enter address or use current location"
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={loadingLocation}
                            className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                            title="Use current location"
                        >
                            {loadingLocation ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                            ) : (
                                <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
                
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Upload Image (Optional)
                    </label>
                    <div className="flex items-center gap-3 p-3 border-2 border-gray-300 dark:border-zinc-700 border-dashed rounded-lg hover:border-indigo-500 transition-colors">
                        {imagePreview ? (
                            <div className="flex items-center gap-3 w-full">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="h-16 w-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900 dark:text-white">Image selected</p>
                                    <p className="text-xs text-gray-500">Click remove to delete</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTicketForm({ ...ticketForm, image: null });
                                        setImagePreview(null);
                                    }}
                                    className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 w-full">
                                <svg className="h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex-1">
                                    <label htmlFor="image-upload" className="cursor-pointer text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                                        Click to upload
                                        <input
                                            id="image-upload"
                                            name="image-upload"
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        PNG, JPG, GIF up to 5MB
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => {
                            setShowCreateTicket(false);
                            resetForm();
                        }}
                        disabled={submitting}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors shadow-lg shadow-indigo-600/50 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Submitting...
                            </>
                        ) : (
                            'Submit Complaint'
                        )}
                    </button>
                </div>
            </form>
        </div>
    </div>
)}
            {/* Ticket Details Modal */}
            {showTicketDetails && selectedTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-3xl w-full my-8">
                        <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Complaint Details
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {selectedTicket.ticketId}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowTicketDetails(false);
                                        setSelectedTicket(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Status Timeline */}
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                                    Complaint Status
                                </h3>
                                <div className="relative">
                                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-zinc-700"></div>
                                    
                                    <div className="space-y-8">
                                        {getStatusSteps(selectedTicket.status).map((step, index) => (
                                            <div key={index} className="relative flex items-start gap-4">
                                                <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full text-xl ${
                                                    step.completed 
                                                        ? 'bg-green-500 text-white' 
                                                        : 'bg-gray-200 dark:bg-zinc-700 text-gray-400'
                                                }`}>
                                                    {step.completed ? (
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex-1 pt-2">
                                                    <h4 className={`font-semibold ${
                                                        step.current 
                                                            ? 'text-indigo-600 dark:text-indigo-400' 
                                                            : step.completed 
                                                            ? 'text-gray-900 dark:text-white' 
                                                            : 'text-gray-400 dark:text-gray-500'
                                                    }`}>
                                                        {step.name}
                                                    </h4>
                                                    {step.current && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            Currently at this stage
                                                        </p>
                                                    )}
                                                    {step.completed && !step.current && (
                                                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                                            Completed
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Category</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{selectedTicket.category}</p>
                                </div>
                                <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Priority</p>
                                    <p className={`font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                                        {selectedTicket.priority}
                                    </p>
                                </div>
                                <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Submitted On</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {new Date(selectedTicket.createdAt).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                </div>
                                <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Assigned To</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedTicket.assignedTo?.department || 'Not assigned yet'}
                                    </p>
                                </div>
                            </div>

                            {/* Title and Description */}
                            <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    {selectedTicket.title}
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                    {selectedTicket.description}
                                </p>
                            </div>

                            {/* Location */}
                            {selectedTicket.location && (
                                <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{selectedTicket.location}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Image */}
                            {selectedTicket.image && (
                                <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Attached Image</p>
                                    <img
                                        src={`${backendUrl}${selectedTicket.image}`}
                                        alt="Complaint"
                                        className="w-full h-auto rounded-lg"
                                    />
                                </div>
                            )}

                            {/* Comments */}
                            {selectedTicket.comments && selectedTicket.comments.length > 0 && (
                                <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                                        Updates & Comments
                                    </h4>
                                    <div className="space-y-4">
                                        {selectedTicket.comments.map((comment, index) => (
                                            <div key={index} className="border-l-2 border-indigo-500 pl-4">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {comment.user?.name || 'System'}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    {comment.text}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reopen Button */}
                            {['Resolved', 'Closed'].includes(selectedTicket.status) && (
                                <div className="border-t border-gray-200 dark:border-zinc-800 pt-4">
                                    <button
                                        onClick={() => handleReopenTicket(selectedTicket.ticketId)}
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                    >
                                        Reopen Complaint
                                    </button>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                                        Not satisfied with the resolution? Click to reopen
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CitizenDashboard;