// src/pages/dashboards/EmployeeDash.jsx
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
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
  const { backendUrl, isLoggedIn, userData, loading: authLoading } = useContext(AppContext);
  const navigate = useNavigate();
  
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const isEmployee = userData?.role === 'employee';
  const [activeTab, setActiveTab] = useState('overview');
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
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
        // Check if user is employee
        if (userData.role !== 'employee') {
          toast.error('Access denied. This dashboard is for employees only.');
          navigate('/');
        } else {
          // User is authenticated and is employee, fetch data
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
      
      await fetchDashboardData();
      
      setInitialLoadComplete(true);
    } catch (error) {
      console.error('Dashboard initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const requests = [];

      // Fetch assigned tickets and stats for employees
      if (isEmployee) {
        requests.push(
          axios.get(`${backendUrl}/api/tickets/my-assigned`, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            }
          }),
          axios.get(`${backendUrl}/api/tickets/my-assigned-summary`, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            }
          })
        );
      }

      // Fetch submitted tickets and stats (for everyone)
      requests.push(
        axios.get(`${backendUrl}/api/tickets/my-submitted`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }),
        axios.get(`${backendUrl}/api/tickets/my-summary`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        })
      );

      const responses = await Promise.all(requests);

      // Parse responses based on employee status
      if (isEmployee) {
        const [assignedRes, assignedSummaryRes, submittedRes, summaryRes] = responses;
        
        if (assignedRes.data.success) {
          setAssignedTickets(assignedRes.data.tickets || []);
        }
        
        if (assignedSummaryRes.data.success) {
          setAssignedStats(assignedSummaryRes.data.summary);
        }
        
        if (submittedRes.data.success) {
          setMyTickets(submittedRes.data.tickets || []);
        }
        
        if (summaryRes.data.success) {
          setStats(summaryRes.data.summary);
        }
      } else {
        const [submittedRes, summaryRes] = responses;
        
        if (submittedRes.data.success) {
          setMyTickets(submittedRes.data.tickets || []);
        }
        
        if (summaryRes.data.success) {
          setStats(summaryRes.data.summary);
        }
      }
      
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      
      // ✅ Handle auth errors silently (redirect handled in useEffect)
      if (error.response?.status === 401) {
        console.log('Authentication error detected');
        // Don't show toast for auth errors
      } else {
        toast.error(error.response?.data?.message || 'Failed to load dashboard data');
      }
      throw error; // Re-throw to be caught by initializeDashboard
    }
  };

  const fetchTicketDetails = async (ticketId) => {
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
      console.error('Fetch ticket details error:', error);
      toast.error(error.response?.data?.message || 'Failed to load ticket details');
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
        // Refresh dashboard data
        await fetchDashboardData();
      } else {
        toast.error(data.message || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Create ticket error:', error);
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
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (data.success) {
        toast.success('Comment added successfully!');
        setSelectedTicket(data.ticket);
      } else {
        toast.error(data.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Add comment error:', error);
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
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (data.success) {
        toast.success('Status updated successfully!');
        // Refresh dashboard data
        await fetchDashboardData();
        
        if (selectedTicket?.ticketId === ticketId) {
          setSelectedTicket(data.ticket);
        }
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Status change error:', error);
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
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (data.success) {
        toast.success('Ticket reopened successfully!');
        // Refresh dashboard data
        await fetchDashboardData();
        
        if (selectedTicket?.ticketId === ticketId) {
          setSelectedTicket(data.ticket);
        }
      } else {
        toast.error(data.message || 'Failed to reopen ticket');
      }
    } catch (error) {
      console.error('Reopen ticket error:', error);
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

  // ✅ Don't render if not logged in or not employee
  if (!isLoggedIn || !userData || userData.role !== 'employee') {
    return null;
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