// src/pages/dashboards/CitizenDash.jsx
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
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