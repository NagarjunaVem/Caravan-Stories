// src/pages/dashboards/CitizenDash.jsx
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

// Components
import CitizenHeader from '../../components/citizen/CitizenHeader';
import CitizenTabNavigation from '../../components/citizen/CitizenTabNavigation';
import CitizenStatsCards from '../../components/citizen/CitizenStatsCards';
import RecentTickets from '../../components/citizen/RecentTickets';
import FilterButtons from '../../components/citizen/FilterButtons';
import TicketsList from '../../components/citizen/TicketsList';

// Modals
import CreateTicketModal from '../../components/citizen/modals/CreateTicketModal';
import TicketDetailsModal from '../../components/citizen/modals/TicketDetailsModal';

const CitizenDashboard = () => {
  const { backendUrl, isLoggedIn, userData, loading: authLoading } = useContext(AppContext);
  const navigate = useNavigate();
  
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Modal states
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ✅ FIXED: Wait for auth to be confirmed before fetching data
  useEffect(() => {
    // Only proceed if auth check is complete
    if (!authLoading) {
      if (isLoggedIn && userData) {
        // Check if user is citizen
        if (userData.role !== 'citizen') {
          toast.error('Access denied. This dashboard is for citizens only.');
          navigate('/');
        } else {
          // User is authenticated and is citizen, fetch data
          if (!initialLoadComplete) {
            initializeDashboard();
          }
        }
      } else {
        // Not logged in, redirect to login
        navigate('/login');
      }
    }
  }, [authLoading, isLoggedIn, userData, navigate, initialLoadComplete]);

  // ✅ Separate initialization function to prevent multiple calls
  const initializeDashboard = async () => {
    try {
      setLoading(true);
      
      // Ensure cookies are sent with requests
      axios.defaults.withCredentials = true;
      
      await Promise.all([
        fetchMyTickets(),
        fetchMyStats()
      ]);
      
      setInitialLoadComplete(true);
    } catch (error) {
      console.error('Dashboard initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTickets = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/tickets/my-submitted`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (data.success) {
        setMyTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Fetch tickets error:', error);
      
      // ✅ Handle auth errors silently (redirect handled in useEffect)
      if (error.response?.status === 401) {
        console.log('Authentication error detected');
        // Don't show toast for auth errors
      } else {
        toast.error(error.response?.data?.message || 'Failed to load tickets');
      }
      throw error; // Re-throw to be caught by initializeDashboard
    }
  };

  const fetchMyStats = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/tickets/my-summary`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (data.success) {
        setStats(data.summary);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
      
      // ✅ Only show error if it's not an auth error
      if (error.response?.status !== 401) {
        toast.error('Failed to load statistics');
      }
      throw error; // Re-throw to be caught by initializeDashboard
    }
  };

  const handleCreateTicket = async (ticketForm, resetForm) => {
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
        // Refresh data
        await Promise.all([
          fetchMyTickets(),
          fetchMyStats()
        ]);
      } else {
        toast.error(data.message || 'Failed to create complaint');
      }
    } catch (error) {
      console.error('Create ticket error:', error);
      toast.error(error.response?.data?.message || 'Failed to create complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewTicket = async (ticketId) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/tickets/details/${ticketId}`,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (data.success) {
        setSelectedTicket(data.ticket);
        setShowTicketDetails(true);
      } else {
        toast.error(data.message || 'Failed to load ticket details');
      }
    } catch (error) {
      console.error('View ticket error:', error);
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
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (data.success) {
        toast.success('Ticket reopened successfully!');
        setShowTicketDetails(false);
        setSelectedTicket(null);
        // Refresh data
        await Promise.all([
          fetchMyTickets(),
          fetchMyStats()
        ]);
      } else {
        toast.error(data.message || 'Failed to reopen ticket');
      }
    } catch (error) {
      console.error('Reopen ticket error:', error);
      toast.error(error.response?.data?.message || 'Failed to reopen ticket');
    }
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

  // ✅ Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // ✅ Show loading while fetching dashboard data
  if (loading && !authLoading && isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ✅ Don't render if not logged in or not citizen
  if (!isLoggedIn || !userData || userData.role !== 'citizen') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Navigation and User Dropdown */}
        <CitizenHeader 
          onCreateComplaint={() => setShowCreateTicket(true)}
        />

        {/* Tab Navigation */}
        <CitizenTabNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          ticketsCount={myTickets.length}
        />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Statistics Cards */}
            <CitizenStatsCards stats={stats} />
            
            {/* Recent Tickets Section */}
            <RecentTickets 
              tickets={myTickets}
              onTicketClick={handleViewTicket}
              onCreateComplaint={() => setShowCreateTicket(true)}
              backendUrl={backendUrl}
            />
          </>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <>
            {/* Filter Buttons */}
            <FilterButtons 
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
              stats={stats}
              totalTickets={myTickets.length}
            />
            
            {/* Filtered Tickets List */}
            <TicketsList 
              tickets={filteredTickets}
              onTicketClick={handleViewTicket}
              onCreateComplaint={() => setShowCreateTicket(true)}
              filterStatus={filterStatus}
              backendUrl={backendUrl}
            />
          </>
        )}
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal 
        isOpen={showCreateTicket}
        onClose={() => setShowCreateTicket(false)}
        onSubmit={handleCreateTicket}
        submitting={submitting}
      />

      {/* Ticket Details Modal */}
      <TicketDetailsModal 
        isOpen={showTicketDetails}
        onClose={() => {
          setShowTicketDetails(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
        onReopen={handleReopenTicket}
        backendUrl={backendUrl}
      />
    </div>
  );
};

export default CitizenDashboard;