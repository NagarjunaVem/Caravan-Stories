import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const DEPARTMENTS = [
  "IT", "HR", "Finance", "Facilities", "Management", "Support", 
  "Operations", "Safety", "Electrical", "Mechanical", "Civil", 
  "Maintenance", "Logistics", "Procurement"
];

const CATEGORIES = [
  "IT", "HR", "Finance", "Facilities", "Management", "Support",
  "Operations", "Safety", "Electrical", "Mechanical", "Civil",
  "Maintenance", "Logistics", "Procurement", "Other"
];

const PRIORITY_LEVELS = ["Low", "Medium", "High", "Urgent"];

const AdminDashboard = () => {
    const { backendUrl, userData } = useContext(AppContext);
    
    // State
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        reopened: 0,
        overdue: 0,
        byCategory: []
    });
    const [allTickets, setAllTickets] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'tickets', 'employees'
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    
    // Modal states
    const [showCreateEmployee, setShowCreateEmployee] = useState(false);
    const [showCreateTicket, setShowCreateTicket] = useState(false);
    const [showAssignTicket, setShowAssignTicket] = useState(false);
    const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    
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
    
    // Employee form
    const [employeeForm, setEmployeeForm] = useState({
        name: '',
        email: '',
        password: '',
        department: ''
    });

    useEffect(() => {
        fetchDashboardData();
        fetchEmployees();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [summaryRes, ticketsRes] = await Promise.all([
                axios.get(`${backendUrl}/api/tickets/summary`, {
                    withCredentials: true
                }),
                axios.get(`${backendUrl}/api/tickets/all`, {
                    withCredentials: true
                })
            ]);
            
            if (summaryRes.data.success) {
                setStats(summaryRes.data.summary);
            }
            
            if (ticketsRes.data.success) {
                setAllTickets(ticketsRes.data.tickets || []);
            }
        } catch (error) {
            console.error('Dashboard error:', error);
            toast.error(error.response?.data?.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/employees`, {
                withCredentials: true
            });
            
            if (data.success) {
                setEmployees(data.employees || []);
            }
        } catch (error) {
            console.error('Fetch employees error:', error);
        }
    };

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        
        if (!employeeForm.department) {
            toast.error('Please select a department');
            return;
        }
        
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/admin/create-user`,
                employeeForm,
                { withCredentials: true }
            );
            
            if (data.success) {
                toast.success('Employee created successfully!');
                setShowCreateEmployee(false);
                setEmployeeForm({ name: '', email: '', password: '', department: '' });
                fetchEmployees();
                fetchDashboardData();
            } else {
                toast.error(data.message || 'Failed to create employee');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create employee');
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

    const handleAssignTicket = async (department) => {
        if (!selectedTicket) return;
        
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/tickets/assign`,
                { 
                    ticketId: selectedTicket.ticketId, 
                    department 
                },
                { withCredentials: true }
            );
            
            if (data.success) {
                toast.success('Ticket assigned to department successfully!');
                setShowAssignTicket(false);
                setSelectedTicket(null);
                fetchDashboardData();
            } else {
                toast.error(data.message || 'Failed to assign ticket');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign ticket');
        }
    };

    const handleUpdateDepartment = async (employeeId, newDepartment) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/admin/assign-department`,
                { 
                    employeeId, 
                    department: newDepartment 
                },
                { withCredentials: true }
            );
            
            if (data.success) {
                toast.success('Department updated successfully!');
                fetchEmployees();
                setShowEmployeeDetails(false);
                setSelectedEmployee(null);
            } else {
                toast.error(data.message || 'Failed to update department');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update department');
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
        // Prepare CSV data
        const csvHeaders = [
            'Ticket ID',
            'Title',
            'Description',
            'Category',
            'Priority',
            'Status',
            'Submitted By',
            'Assigned To',
            'Location',
            'Created Date',
            'Due Date',
            'Is Overdue'
        ];

        const csvData = allTickets.map(ticket => {
            const isOverdue = new Date(ticket.dueDate) < new Date() && 
                           !['Resolved', 'Closed'].includes(ticket.status);
            
            return [
                ticket.ticketId,
                `"${ticket.title.replace(/"/g, '""')}"`, // Escape quotes
                `"${ticket.description.replace(/"/g, '""')}"`,
                ticket.category,
                ticket.priority,
                ticket.status,
                ticket.submittedBy?.name || 'Unknown',
                ticket.assignedTo?.name || ticket.assignedTo?.department || 'Unassigned',
                `"${(ticket.location || '').replace(/"/g, '""')}"`,
                new Date(ticket.createdAt).toLocaleDateString(),
                new Date(ticket.dueDate).toLocaleDateString(),
                isOverdue ? 'Yes' : 'No'
            ];
        });

        // Create CSV content
        const csvContent = [
            csvHeaders.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `tickets_summary_${new Date().toISOString().split('T')[0]}.csv`);
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

    const getCategoryColor = (category) => {
        const colors = {
            'IT': 'text-blue-600',
            'HR': 'text-purple-600',
            'Finance': 'text-green-600',
            'Facilities': 'text-orange-600',
            'Management': 'text-red-600',
            'Support': 'text-indigo-600',
        };
        return colors[category] || 'text-gray-600';
    };

    // Group employees by department
    const employeesByDepartment = employees.reduce((acc, emp) => {
        const dept = emp.department || 'Unassigned';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(emp);
        return acc;
    }, {});

    // Filter employees by selected department
    const filteredEmployees = selectedDepartment === 'all' 
        ? employees 
        : employees.filter(emp => emp.department === selectedDepartment);

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
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Welcome back, {userData?.name || 'Admin'}!
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowCreateTicket(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Create Ticket
                        </button>
                        <button
                            onClick={() => setShowCreateEmployee(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Employee
                        </button>
                    </div>
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
                            Tickets ({allTickets.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('employees')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'employees'
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            Employees ({employees.length})
                        </button>
                    </nav>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Total Tickets */}
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Total Tickets
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
                                <div className="mt-4 flex items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {stats.pending} pending
                                    </span>
                                </div>
                            </div>

                            {/* Open Tickets */}
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Open & In Progress
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                            {stats.open + stats.inProgress}
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
                                        {stats.open} open
                                    </span>
                                    <span className="text-gray-400 mx-2">•</span>
                                    <span className="text-yellow-600 dark:text-yellow-400">
                                        {stats.inProgress} in progress
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
                                            {stats.resolved}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {stats.closed} closed
                                    </span>
                                </div>
                            </div>

                            {/* Overdue & Reopened */}
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Overdue
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                            {stats.overdue}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <span className="text-orange-600 dark:text-orange-400">
                                        {stats.reopened} reopened
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Category Breakdown */}
                        {stats.byCategory && stats.byCategory.length > 0 && (
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Tickets by Category
                                    </h2>
                                    <button
                                        onClick={exportToCSV}
                                        className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Export to CSV
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {stats.byCategory.map((cat, index) => (
                                        <div key={index} className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
                                            <p className={`text-sm font-medium ${getCategoryColor(cat.category)}`}>
                                                {cat.category}
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                                {cat.count}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Tickets Tab */}
                {activeTab === 'tickets' && (
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
                        <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    All Tickets ({allTickets.length})
                                </h2>
                                <button
                                    onClick={exportToCSV}
                                    className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export to CSV
                                </button>
                            </div>
                        </div>
                        
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
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Submitted By
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Assigned To
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
                                    {allTickets.length > 0 ? (
                                        allTickets.map((ticket) => {
                                            const isOverdue = new Date(ticket.dueDate) < new Date() && 
                                                             !['Resolved', 'Closed'].includes(ticket.status);
                                            
                                            return (
                                                <tr 
                                                    key={ticket._id}
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
                                                        <span className={`text-sm font-medium ${getCategoryColor(ticket.category)}`}>
                                                            {ticket.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                                            {ticket.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                        {ticket.submittedBy?.name || 'Unknown'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                        {ticket.assignedTo?.name || (
                                                            <span className="text-gray-400 italic">Unassigned</span>
                                                        )}
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
                                                            onClick={() => {
                                                                setSelectedTicket(ticket);
                                                                setShowAssignTicket(true);
                                                            }}
                                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                                                        >
                                                            {ticket.assignedTo ? 'Reassign' : 'Assign'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                                No tickets found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Employees Tab */}
                {activeTab === 'employees' && (
                    <>
                        {/* Department Filter */}
                        <div className="mb-6 flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedDepartment('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    selectedDepartment === 'all'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
                                }`}
                            >
                                All Departments ({employees.length})
                            </button>
                            {DEPARTMENTS.map((dept) => {
                                const count = employees.filter(e => e.department === dept).length;
                                return (
                                    <button
                                        key={dept}
                                        onClick={() => setSelectedDepartment(dept)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            selectedDepartment === dept
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
                                        }`}
                                    >
                                        {dept} ({count})
                                    </button>
                                );
                            })}
                        </div>

                        {/* Employees Grid */}
                        {selectedDepartment === 'all' ? (
                            // Show by department when "All" is selected
                            <div className="space-y-6">
                                {Object.entries(employeesByDepartment)
                                    .sort(([a], [b]) => a.localeCompare(b))
                                    .map(([dept, emps]) => (
                                        <div key={dept} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
                                            <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {dept}
                                                    </h3>
                                                    <span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-sm font-medium">
                                                        {emps.length} {emps.length === 1 ? 'employee' : 'employees'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {emps.map((employee) => (
                                                        <div 
                                                            key={employee._id}
                                                            onClick={() => {
                                                                setSelectedEmployee(employee);
                                                                setShowEmployeeDetails(true);
                                                            }}
                                                            className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-lg">
                                                                    {employee.name?.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                                                        {employee.name}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                                        {employee.email}
                                                                    </p>
                                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                                        Joined {new Date(employee.createdAt).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            // Show filtered employees
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
                                <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {selectedDepartment} Department ({filteredEmployees.length})
                                    </h3>
                                </div>
                                <div className="p-6">
                                    {filteredEmployees.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {filteredEmployees.map((employee) => (
                                                <div 
                                                    key={employee._id}
                                                    onClick={() => {
                                                        setSelectedEmployee(employee);
                                                        setShowEmployeeDetails(true);
                                                    }}
                                                    className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-lg">
                                                            {employee.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                                                {employee.name}
                                                            </h4>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                                {employee.email}
                                                            </p>
                                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                                Joined {new Date(employee.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                            No employees in this department
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Create Ticket Modal - Compact Version */}
            {showCreateTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-2xl w-full">
                        <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
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

            {/* Create Employee Modal */}
            {showCreateEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Create New Employee
                                </h2>
                                <button
                                    onClick={() => setShowCreateEmployee(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <form onSubmit={handleCreateEmployee} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={employeeForm.name}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={employeeForm.email}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    value={employeeForm.password}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                    minLength={6}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Department *
                                </label>
                                <select
                                    value={employeeForm.department}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {DEPARTMENTS.map((dept) => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateEmployee(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                                >
                                    Create Employee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Ticket Modal */}
            {showAssignTicket && selectedTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Assign Ticket
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowAssignTicket(false);
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
                        
                        <div className="p-6">
                            <div className="mb-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Ticket ID</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTicket.ticketId}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{selectedTicket.title}</p>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Select a department to assign this ticket:
                            </p>
                            
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {DEPARTMENTS.map((dept) => (
                                    <button
                                        key={dept}
                                        onClick={() => handleAssignTicket(dept)}
                                        className="w-full text-left p-4 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {dept}
                                            </span>
                                            {selectedTicket.category === dept && (
                                                <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded">
                                                    Current Category
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Employee Details Modal */}
            {showEmployeeDetails && selectedEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Employee Details
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowEmployeeDetails(false);
                                        setSelectedEmployee(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-2xl">
                                    {selectedEmployee.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {selectedEmployee.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {selectedEmployee.email}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 dark:border-zinc-800 pt-4 space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Current Department
                                    </label>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {selectedEmployee.department || 'Unassigned'}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Joined Date
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {new Date(selectedEmployee.createdAt).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Change Department
                                    </label>
                                    <select
                                        defaultValue={selectedEmployee.department}
                                        onChange={(e) => {
                                            if (window.confirm(`Change department to ${e.target.value}?`)) {
                                                handleUpdateDepartment(selectedEmployee._id, e.target.value);
                                            }
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        {DEPARTMENTS.map((dept) => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;