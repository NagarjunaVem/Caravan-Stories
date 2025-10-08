// src/pages/dashboards/EmployeeDash.jsx
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

// Components
import EmployeeHeader from '../../components/employee/EmployeeHeader';
import EmployeeTabNavigation from '../../components/employee/EmployeeTabNavigation';
import EmployeeStatsCards from '../../components/employee/EmployeeStatsCards';
import RecentTicketsList from '../../components/employee/RecentTicketsList';
import QuickActions from '../../components/employee/QuickActions';
import TicketFilters from '../../components/employee/TicketFilters';
import AssignedTicketsTable from '../../components/employee/AssignedTicketsTable';
import MyTicketsGrid from '../../components/employee/MyTicketsGrid';

// Modals
import CreateTicketModal from '../../components/employee/modals/CreateTicketModal';
import TicketDetailsModal from '../../components/employee/modals/TicketDetailsModal';

// Utils
import { filterAndSortTickets, exportTicketsToCSV } from '../../components/employee/utils/helpers';

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
  const [activeTab, setActiveTab] = useState(isEmployee ? 'overview' : 'overview');
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Modal states
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (isEmployee) {
        const assignedRes = await axios.get(`${backendUrl}/api/tickets/my-assigned`, {
          withCredentials: true
        });
        
        if (assignedRes.data.success) {
          setAssignedTickets(assignedRes.data.tickets || []);
        }

        const assignedSummaryRes = await axios.get(`${backendUrl}/api/tickets/my-assigned-summary`, {
          withCredentials: true
        });
        
        if (assignedSummaryRes.data.success) {
          setAssignedStats(assignedSummaryRes.data.summary);
        }
      }

      const submittedRes = await axios.get(`${backendUrl}/api/tickets/my-submitted`, {
        withCredentials: true
      });
      
      if (submittedRes.data.success) {
        setMyTickets(submittedRes.data.tickets || []);
      }

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
        toast.success('Ticket created successfully!');
        setShowCreateTicket(false);
        resetForm();
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

  const handleAddComment = async (text) => {
    if (!selectedTicket) return;
    
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/tickets/comment`,
        { 
          ticketId: selectedTicket.ticketId,
          text 
        },
        { withCredentials: true }
      );
      
      if (data.success) {
        toast.success('Comment added successfully!');
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
          ticketId,
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
          ticketId,
          reason 
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

  const handleExport = () => {
    const ticketsToExport = activeTab === 'my-tickets' ? myTickets : assignedTickets;
    exportTicketsToCSV(ticketsToExport, `tickets_export`);
    toast.success('Tickets exported successfully!');
  };

  const primaryStats = isEmployee ? assignedStats : stats;
  const primaryTickets = isEmployee ? assignedTickets : myTickets;

  const filteredAssignedTickets = filterAndSortTickets(assignedTickets, filterStatus, sortBy);
  const filteredMyTickets = filterAndSortTickets(myTickets, filterStatus, sortBy);

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
        <EmployeeHeader onCreateTicket={() => setShowCreateTicket(true)} />

        <EmployeeTabNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isEmployee={isEmployee}
          assignedCount={assignedTickets.length}
          myTicketsCount={myTickets.length}
        />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <EmployeeStatsCards stats={primaryStats} isEmployee={isEmployee} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentTicketsList 
                tickets={primaryTickets}
                onTicketClick={fetchTicketDetails}
                isEmployee={isEmployee}
              />
              
              <QuickActions 
                isEmployee={isEmployee}
                onViewAssigned={() => setActiveTab('assigned')}
                onCreateTicket={() => setShowCreateTicket(true)}
                onViewMyTickets={() => setActiveTab('my-tickets')}
                onExport={handleExport}
              />
            </div>
          </>
        )}

        {/* Assigned Tickets Tab */}
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

            <TicketFilters 
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            <AssignedTicketsTable 
              tickets={filteredAssignedTickets}
              onTicketClick={fetchTicketDetails}
              onStatusChange={handleStatusChange}
            />
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

            <TicketFilters 
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onExport={handleExport}
            />

            <MyTicketsGrid 
              tickets={filteredMyTickets}
              onViewDetails={fetchTicketDetails}
              onReopen={handleReopenTicket}
              onCreateTicket={() => setShowCreateTicket(true)}
              backendUrl={backendUrl}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTicketModal 
        isOpen={showCreateTicket}
        onClose={() => setShowCreateTicket(false)}
        onSubmit={handleCreateTicket}
        submitting={submitting}
      />

      <TicketDetailsModal 
        isOpen={showTicketDetails}
        onClose={() => {
          setShowTicketDetails(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
        onAddComment={handleAddComment}
        onReopen={handleReopenTicket}
        backendUrl={backendUrl}
      />
    </div>
  );
};

export default EmployeeDashboard;