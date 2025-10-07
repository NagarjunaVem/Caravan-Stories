import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CATEGORIES = [
  "IT", "HR", "Finance", "Facilities", "Management", "Support",
  "Operations", "Safety", "Electrical", "Mechanical", "Civil",
  "Maintenance", "Logistics", "Procurement", "Other"
];

const PRIORITY_LEVELS = ["Low", "Medium", "High", "Urgent"];

const STATUS_OPTIONS = ["Pending", "Open", "In Progress", "Resolved", "Closed", "Reopened"];

const EmployeeDashboard = () => {
    const { backendUrl, userData } = useContext(AppContext);
    
    // State
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        pending: 0,
        overdue: 0,
        reopened: 0
    });
    const [assignedStats, setAssignedStats] = useState({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        pending: 0,
        reopened: 0
    });
    const [myTickets, setMyTickets] = useState([]);
    const [assignedTickets, setAssignedTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const isEmployee = userData?.role === 'employee';
    // Set default tab based on role
    const [activeTab, setActiveTab] = useState(isEmployee ? 'overview' : 'assigned');
    
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    
    // Modal states
    const [showCreateTicket, setShowCreateTicket] = useState(false);
    const [showTicketDetails, setShowTicketDetails] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    
    // Comments
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    
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
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch assigned tickets FIRST if user is an employee
            if (isEmployee) {
                const assignedRes = await axios.get(`${backendUrl}/api/tickets/my-assigned`, {
                    withCredentials: true
                });
                
                if (assignedRes.data.success) {
                    setAssignedTickets(assignedRes.data.tickets || []);
                }

                // Fetch assigned ticket summary
                const assignedSummaryRes = await axios.get(`${backendUrl}/api/tickets/my-assigned-summary`, {
                    withCredentials: true
                });
                
                if (assignedSummaryRes.data.success) {
                    setAssignedStats(assignedSummaryRes.data.summary);
                }
            }

            // Fetch user's submitted tickets
            const submittedRes = await axios.get(`${backendUrl}/api/tickets/my-submitted`, {
                withCredentials: true
            });
            
            if (submittedRes.data.success) {
                const tickets = submittedRes.data.tickets || [];
                setMyTickets(tickets);
            }

            // Fetch summary statistics for submitted tickets
            const summaryRes = await axios.get(`${backendUrl}/api/tickets/my-summary`, {
                withCredentials: true
            });
            
            if (summaryRes.data.success) {
                setStats(summaryRes.data.summary);
            }
            
        } catch (error) {
            console.error('Dashboard error:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to load dashboard data');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketDetails = async (ticketId) => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/tickets/details/${ticketId}`,
                { withCredentials: true }
            );
            
            if (data.success) {
                setSelectedTicket(data.ticket);
                setShowTicketDetails(true);
            }
        } catch (error) {
            console.error('Fetch ticket details error:', error);
            toast.error('Failed to load ticket details');
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
                toast.success('Ticket created successfully!');
                setShowCreateTicket(false);
                resetTicketForm();
                fetchDashboardData();
            } else {
                toast.error(data.message || 'Failed to create ticket');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create ticket');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !selectedTicket) return;
        
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/tickets/comment`,
                { 
                    ticketId: selectedTicket.ticketId,
                    text: newComment 
                },
                { withCredentials: true }
            );
            
            if (data.success) {
                toast.success('Comment added successfully!');
                setNewComment('');
                // Update the selected ticket with new comments
                setSelectedTicket(data.ticket);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add comment');
        }
    };

    const handleStatusChange = async (ticketId, newStatus) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/tickets/status`,
                { 
                    ticketId: ticketId,
                    status: newStatus 
                },
                { withCredentials: true }
            );
            
            if (data.success) {
                toast.success('Status updated successfully!');
                fetchDashboardData();
                if (selectedTicket?.ticketId === ticketId) {
                    setSelectedTicket(data.ticket);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleReopenTicket = async (ticketId, reason = '') => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/tickets/reopen`,
                { 
                    ticketId: ticketId,
                    reason: reason 
                },
                { withCredentials: true }
            );
            
            if (data.success) {
                toast.success('Ticket reopened successfully!');
                fetchDashboardData();
                if (selectedTicket?.ticketId === ticketId) {
                    setSelectedTicket(data.ticket);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reopen ticket');
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

    const resetTicketForm = () => {
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

    const exportToCSV = () => {
        const ticketsToExport = activeTab === 'my-tickets' ? myTickets : assignedTickets;
        
        const csvHeaders = [
            'Ticket ID', 'Title', 'Description', 'Category', 'Priority',
            'Status', 'Location', 'Created Date', 'Due Date'
        ];

        const csvData = ticketsToExport.map(ticket => [
            ticket.ticketId,
            `"${ticket.title.replace(/"/g, '""')}"`,
            `"${ticket.description.replace(/"/g, '""')}"`,
            ticket.category,
            ticket.priority,
            ticket.status,
            `"${(ticket.location || '').replace(/"/g, '""')}"`,
            new Date(ticket.createdAt).toLocaleDateString(),
            new Date(ticket.dueDate).toLocaleDateString()
        ]);

        const csvContent = [
            csvHeaders.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `tickets_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Tickets exported successfully!');
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
            'Low': 'text-gray-600 dark:text-gray-400',
            'Medium': 'text-yellow-600 dark:text-yellow-400',
            'High': 'text-orange-600 dark:text-orange-400',
            'Urgent': 'text-red-600 dark:text-red-400'
        };
        return colors[priority] || 'text-gray-600';
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'IT': '💻',
            'HR': '👥',
            'Finance': '💰',
            'Facilities': '🏢',
            'Management': '📊',
            'Support': '🤝',
            'Operations': '⚙️',
            'Safety': '🛡️',
            'Electrical': '⚡',
            'Mechanical': '🔧',
            'Civil': '🏗️',
            'Maintenance': '🔨',
            'Logistics': '📦',
            'Procurement': '🛒',
            'Other': '📋'
        };
        return icons[category] || '📋';
    };

    // Filter and sort tickets
    const getFilteredTickets = (tickets) => {
        let filtered = [...tickets];
        
        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(t => t.status === filterStatus);
        }
        
        // Sort tickets
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'priority':
                    const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'dueDate':
                    return new Date(a.dueDate) - new Date(b.dueDate);
                default:
                    return 0;
            }
        });
        
        return filtered;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Use appropriate stats based on user role
    const primaryStats = isEmployee ? assignedStats : stats;
    const primaryTickets = isEmployee ? assignedTickets : myTickets;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Employee Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Welcome back, {userData?.name || 'User'}!
                            {userData?.department && (
                                <span className="ml-2 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded">
                                    {userData.department} Department
                                </span>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateTicket(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Ticket
                    </button>
                </div>

                {/* Tabs - Reordered for employees */}
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
                        {isEmployee && (
                            <button
                                onClick={() => setActiveTab('assigned')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'assigned'
                                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Assigned to Me ({assignedTickets.length})
                                </span>
                            </button>
                        )}
                        
                        <button
                            onClick={() => setActiveTab('my-tickets')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'my-tickets'
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            My Submitted Tickets ({myTickets.length})
                        </button>
                    </nav>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <>
                        {/* Stats Cards - Show assigned stats for employees */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Total Tickets */}
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {isEmployee ? 'Assigned Tickets' : 'Total Tickets'}
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                            {primaryStats.total}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {primaryStats.pending} pending review
                                    </span>
                                </div>
                            </div>

                            {/* Active Tickets */}
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Active Tickets
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                            {primaryStats.open + primaryStats.inProgress + primaryStats.reopened}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                                        {primaryStats.open} open
                                    </span>
                                    <span className="text-gray-400 mx-2">•</span>
                                    <span className="text-yellow-600 dark:text-yellow-400">
                                        {primaryStats.inProgress} in progress
                                    </span>
                                </div>
                            </div>

                            {/* Resolved */}
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Resolved
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                            {primaryStats.resolved}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <span className="text-green-600 dark:text-green-400">
                                        {((primaryStats.resolved / (primaryStats.total || 1)) * 100).toFixed(0)}% resolution rate
                                    </span>
                                </div>
                            </div>

                            {/* Status Summary */}
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Closed
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                            {primaryStats.closed}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900/30 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Successfully completed
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Tickets and Quick Actions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Tickets - Show assigned tickets for employees */}
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
                                <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {isEmployee ? 'Recent Assigned Tickets' : 'Recent Tickets'}
                                    </h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    {primaryTickets.slice(0, 5).map((ticket) => (
                                        <div 
                                            key={ticket.ticketId}
                                            onClick={() => fetchTicketDetails(ticket.ticketId)}
                                            className="flex items-start gap-4 p-4 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                                        >
                                            <div className="text-2xl">{getCategoryIcon(ticket.category)}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                                            {ticket.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            {ticket.ticketId}
                                                            {isEmployee && ticket.submittedBy && (
                                                                <span className="ml-2 text-xs">
                                                                    by {ticket.submittedBy.name}
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                                        {ticket.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                                                        {ticket.priority} Priority
                                                    </span>
                                                    <span>
                                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {primaryTickets.length === 0 && (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            {isEmployee ? 'No tickets assigned to you yet.' : 'No tickets yet. Create your first ticket!'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
                                <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Quick Actions
                                    </h2>
                                </div>
                                <div className="p-6 space-y-3">
                                    {isEmployee && (
                                        <button
                                            onClick={() => setActiveTab('assigned')}
                                            className="w-full p-4 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors text-left flex items-center gap-3"
                                        >
                                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">View Assigned Tickets</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Manage tickets assigned to you</p>
                                            </div>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => setShowCreateTicket(true)}
                                        className="w-full p-4 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors text-left flex items-center gap-3"
                                    >
                                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">Create New Ticket</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Report an issue or request</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('my-tickets')}
                                        className="w-full p-4 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors text-left flex items-center gap-3"
                                    >
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">My Submitted Tickets</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Track tickets you've created</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={exportToCSV}
                                        className="w-full p-4 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors text-left flex items-center gap-3"
                                    >
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">Export Tickets</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Download tickets as CSV</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Assigned Tickets Tab (for Employees) - SHOWN FIRST */}
                {activeTab === 'assigned' && isEmployee && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Tickets Assigned to Me
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage and update tickets assigned to you for resolution
                            </p>
                        </div>

                        {/* Filters */}
                        <div className="mb-6 flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 flex flex-wrap gap-2">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="all">All Status</option>
                                    {STATUS_OPTIONS.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="priority">Priority</option>
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="dueDate">Due Date</option>
                                </select>
                            </div>
                        </div>

                        {/* Assigned Tickets Table */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-zinc-800/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Ticket ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Priority
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Submitted By
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Due Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                        {getFilteredTickets(assignedTickets).length > 0 ? (
                                            getFilteredTickets(assignedTickets).map((ticket) => {
                                                const isOverdue = new Date(ticket.dueDate) < new Date() && 
                                                                 !['Resolved', 'Closed'].includes(ticket.status);
                                                
                                                return (
                                                    <tr 
                                                        key={ticket.ticketId}
                                                        className={`hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors ${
                                                            isOverdue ? 'bg-red-50 dark:bg-red-900/10' : ''
                                                        }`}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {ticket.ticketId}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                            <div className="max-w-xs truncate" title={ticket.title}>
                                                                {ticket.title}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                {ticket.category}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                                                                {ticket.priority}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <select
                                                                value={ticket.status}
                                                                onChange={(e) => handleStatusChange(ticket.ticketId, e.target.value)}
                                                                className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(ticket.status)}`}
                                                            >
                                                                {STATUS_OPTIONS.map(status => (
                                                                    <option key={status} value={status}>{status}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                            {ticket.submittedBy?.name || 'Unknown'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <div className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                                                                {new Date(ticket.dueDate).toLocaleDateString()}
                                                                {isOverdue && (
                                                                    <div className="text-xs">Overdue</div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <button
                                                                onClick={() => fetchTicketDetails(ticket.ticketId)}
                                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                                                            >
                                                                View Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                                    {filterStatus !== 'all' 
                                                        ? `No tickets with status "${filterStatus}"`
                                                        : 'No tickets assigned to you'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* My Tickets Tab */}
                {activeTab === 'my-tickets' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                My Submitted Tickets
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Track all tickets you have created
                            </p>
                        </div>

                        {/* Filters and Actions */}
                        <div className="mb-6 flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 flex flex-wrap gap-2">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="all">All Status</option>
                                    {STATUS_OPTIONS.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="priority">Priority</option>
                                    <option value="dueDate">Due Date</option>
                                </select>
                            </div>

                            <button
                                onClick={exportToCSV}
                                className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export CSV
                            </button>
                        </div>

                        {/* Tickets Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {getFilteredTickets(myTickets).map((ticket) => {
                                const isOverdue = new Date(ticket.dueDate) < new Date() && 
                                                 !['Resolved', 'Closed'].includes(ticket.status);
                                const canReopen = ['Resolved', 'Closed'].includes(ticket.status);
                                
                                return (
                                    <div 
                                        key={ticket.ticketId}
                                        className={`bg-white dark:bg-zinc-900 rounded-xl shadow-sm border ${
                                            isOverdue ? 'border-red-300 dark:border-red-900' : 'border-gray-200 dark:border-zinc-800'
                                        } hover:shadow-md transition-shadow`}
                                    >
                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{getCategoryIcon(ticket.category)}</span>
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {ticket.ticketId}
                                                        </p>
                                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                            {ticket.category}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status}
                                                </span>
                                            </div>

                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                                {ticket.title}
                                            </h3>

                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                {ticket.description}
                                            </p>

                                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                                                <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                                                    {ticket.priority} Priority
                                                </span>
                                                <span>
                                                    Due: {new Date(ticket.dueDate).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {isOverdue && (
                                                <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                                        ⚠️ This ticket is overdue
                                                    </p>
                                                </div>
                                            )}

                                            {ticket.assignedTo && (
                                                <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
                                                    Assigned to: <span className="font-medium">{ticket.assignedTo.name}</span>
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => fetchTicketDetails(ticket.ticketId)}
                                                    className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
                                                >
                                                    View Details
                                                </button>
                                                {canReopen && (
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt('Please provide a reason for reopening:');
                                                            if (reason) {
                                                                handleReopenTicket(ticket.ticketId, reason);
                                                            }
                                                        }}
                                                        className="px-3 py-2 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-sm rounded-lg transition-colors"
                                                    >
                                                        Reopen
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {getFilteredTickets(myTickets).length === 0 && (
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-12 text-center">
                                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No tickets found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {filterStatus !== 'all' 
                                        ? `No tickets with status "${filterStatus}"`
                                        : "You haven't created any tickets yet"}
                                </p>
                                <button
                                    onClick={() => setShowCreateTicket(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Create Your First Ticket
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Ticket Modal - Same as before */}
            {showCreateTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    {/* Modal content remains the same */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-gray-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Create New Ticket
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowCreateTicket(false);
                                        resetTicketForm();
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
                                    Ticket Title *
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
                                    placeholder="Provide detailed information about the issue..."
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
                                        resetTicketForm();
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
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Ticket'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Ticket Details Modal - Same as before */}
            {showTicketDetails && selectedTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    {/* Modal content remains the same */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{getCategoryIcon(selectedTicket.category)}</span>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Ticket Details
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {selectedTicket.ticketId}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowTicketDetails(false);
                                        setSelectedTicket(null);
                                        setNewComment('');
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {/* Ticket Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        {selectedTicket.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        {selectedTicket.description}
                                    </p>
                                    
                                    {selectedTicket.image && (
                                        <div className="mb-4">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Attached Image
                                            </p>
                                            <img
                                                src={`${backendUrl}${selectedTicket.image}`}
                                                alt="Ticket attachment"
                                                className="rounded-lg border border-gray-200 dark:border-zinc-800 max-w-full"
                                            />
                                        </div>
                                    )}
                                    
                                    {selectedTicket.location && (
                                        <div className="mb-4">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Location
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                📍 {selectedTicket.location}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTicket.status)}`}>
                                                {selectedTicket.status}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Priority</span>
                                            <span className={`font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                                                {selectedTicket.priority}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Category</span>
                                            <span className="text-gray-900 dark:text-white font-medium">
                                                {selectedTicket.category}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                                            <span className="text-gray-900 dark:text-white">
                                                {new Date(selectedTicket.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Due Date</span>
                                            <span className="text-gray-900 dark:text-white">
                                                {new Date(selectedTicket.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        
                                        {selectedTicket.assignedTo && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Assigned To</span>
                                                <span className="text-gray-900 dark:text-white">
                                                    {selectedTicket.assignedTo.name}
                                                </span>
                                            </div>
                                        )}
                                        
                                        {selectedTicket.submittedBy && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Submitted By</span>
                                                <span className="text-gray-900 dark:text-white">
                                                    {selectedTicket.submittedBy.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    {['Resolved', 'Closed'].includes(selectedTicket.status) && (
                                        <button
                                            onClick={() => {
                                                const reason = prompt('Please provide a reason for reopening:');
                                                if (reason) {
                                                    handleReopenTicket(selectedTicket.ticketId, reason);
                                                }
                                            }}
                                            className="w-full px-4 py-2 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                        >
                                            Reopen Ticket
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Comments Section */}
                            <div className="border-t border-gray-200 dark:border-zinc-800 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Comments & Updates
                                </h3>
                                
                                {/* Add Comment */}
                                <div className="mb-4">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment or update..."
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                    />
                                    <button
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim()}
                                        className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Add Comment
                                    </button>
                                </div>
                                
                                {/* Comments List */}
                                <div className="space-y-3">
                                    {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                                        selectedTicket.comments.map((comment, index) => (
                                            <div key={index} className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                                                            {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {comment.user?.name || 'Unknown User'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {new Date(comment.createdAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {comment.text}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                            No comments yet. Be the first to add one!
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeDashboard;