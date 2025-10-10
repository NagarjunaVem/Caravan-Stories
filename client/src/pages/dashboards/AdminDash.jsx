// src/pages/dashboards/AdminDash.jsx
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

// Components
import AdminHeader from '../../components/admin/AdminHeader';
import TabNavigation from '../../components/admin/TabNavigation';
import StatsCards from '../../components/admin/StatsCards';
import CategoryBreakdown from '../../components/admin/CategoryBreakdown';
import TicketsTable from '../../components/admin/TicketsTable';
import DepartmentFilter from '../../components/admin/DepartmentFilter';
import EmployeesGrid from '../../components/admin/EmployeesGrid';

// Modals
import CreateTicketModal from '../../components/admin/modals/CreateTicketModal';
import CreateEmployeeModal from '../../components/admin/modals/CreateEmployeeModal';
import AssignTicketModal from '../../components/admin/modals/AssignTicketModal';
import EmployeeDetailsModal from '../../components/admin/modals/EmployeeDetailsModal';

const AdminDash = () => {
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
    reopened: 0,
    overdue: 0,
    byCategory: []
  });
  const [allTickets, setAllTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Modal states
  const [showCreateEmployee, setShowCreateEmployee] = useState(false);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [showAssignTicket, setShowAssignTicket] = useState(false);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ✅ FIXED: Wait for auth to be confirmed before fetching data
  useEffect(() => {
    // Only proceed if auth check is complete
    if (!authLoading) {
      if (isLoggedIn && userData) {
        // Check if user is admin
        if (userData.role !== 'admin') {
          toast.error('Access denied. Admin privileges required.');
          navigate('/');
        } else {
          // User is authenticated and is admin, fetch data
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
        fetchDashboardData(),
        fetchEmployees()
      ]);
      
      setInitialLoadComplete(true);
    } catch (error) {
      console.error('Dashboard initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // ✅ Ensure withCredentials is set for each request
      const [summaryRes, ticketsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/tickets/summary`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }),
        axios.get(`${backendUrl}/api/tickets/all`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        })
      ]);
      
      if (summaryRes.data.success) {
        setStats(summaryRes.data.summary);
      }
      
      if (ticketsRes.data.success) {
        setAllTickets(ticketsRes.data.tickets || []);
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

  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/employees`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (data.success) {
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error('Fetch employees error:', error);
      
      // ✅ Only show error if it's not an auth error
      if (error.response?.status !== 401) {
        toast.error('Failed to load employees');
      }
      throw error; // Re-throw to be caught by initializeDashboard
    }
  };

  const handleCreateEmployee = async (employeeForm) => {
    try {
      setSubmitting(true);
      
      const { data } = await axios.post(
        `${backendUrl}/api/admin/create-user`,
        employeeForm,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (data.success) {
        toast.success('Employee created successfully!');
        setShowCreateEmployee(false);
        // Refresh data
        await Promise.all([
          fetchEmployees(),
          fetchDashboardData()
        ]);
      } else {
        toast.error(data.message || 'Failed to create employee');
      }
    } catch (error) {
      console.error('Create employee error:', error);
      toast.error(error.response?.data?.message || 'Failed to create employee');
      throw error;
    } finally {
      setSubmitting(false);
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

  const handleAssignTicket = async (department) => {
    if (!selectedTicket) return;
    
    try {
      setSubmitting(true);
      
      const { data } = await axios.post(
        `${backendUrl}/api/tickets/assign`,
        { 
          ticketId: selectedTicket.ticketId, 
          department 
        },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (data.success) {
        toast.success('Ticket assigned to department successfully!');
        setShowAssignTicket(false);
        setSelectedTicket(null);
        // Refresh dashboard data
        await fetchDashboardData();
      } else {
        toast.error(data.message || 'Failed to assign ticket');
      }
    } catch (error) {
      console.error('Assign ticket error:', error);
      toast.error(error.response?.data?.message || 'Failed to assign ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDepartment = async (employeeId, newDepartment) => {
    try {
      setSubmitting(true);
      
      const { data } = await axios.post(
        `${backendUrl}/api/admin/assign-department`,
        { 
          employeeId, 
          department: newDepartment 
        },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (data.success) {
        toast.success('Department updated successfully!');
        await fetchEmployees();
        setShowEmployeeDetails(false);
        setSelectedEmployee(null);
      } else {
        toast.error(data.message || 'Failed to update department');
      }
    } catch (error) {
      console.error('Update department error:', error);
      toast.error(error.response?.data?.message || 'Failed to update department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setShowAssignTicket(true);
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetails(true);
  };

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

  // ✅ Don't render if not logged in or not admin
  if (!isLoggedIn || !userData || userData.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto">
        <AdminHeader 
          onCreateTicket={() => setShowCreateTicket(true)}
          onCreateEmployee={() => setShowCreateEmployee(true)}
        />

        <TabNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          ticketsCount={allTickets.length}
          employeesCount={employees.length}
        />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <StatsCards stats={stats} />
            <CategoryBreakdown stats={stats} allTickets={allTickets} />
          </>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <TicketsTable 
            tickets={allTickets}
            onAssignTicket={handleAssignTicketClick}
          />
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <>
            <DepartmentFilter 
              selectedDepartment={selectedDepartment}
              onDepartmentChange={setSelectedDepartment}
              employees={employees}
            />
            <EmployeesGrid 
              employees={employees}
              selectedDepartment={selectedDepartment}
              onEmployeeClick={handleEmployeeClick}
            />
          </>
        )}
      </div>

      {/* Modals */}
      <CreateTicketModal 
        isOpen={showCreateTicket}
        onClose={() => setShowCreateTicket(false)}
        onSubmit={handleCreateTicket}
        submitting={submitting}
      />

      <CreateEmployeeModal 
        isOpen={showCreateEmployee}
        onClose={() => setShowCreateEmployee(false)}
        onSubmit={handleCreateEmployee}
        submitting={submitting}
      />

      <AssignTicketModal 
        isOpen={showAssignTicket}
        onClose={() => {
          setShowAssignTicket(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
        onAssign={handleAssignTicket}
        submitting={submitting}
      />

      <EmployeeDetailsModal 
        isOpen={showEmployeeDetails}
        onClose={() => {
          setShowEmployeeDetails(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        onUpdateDepartment={handleUpdateDepartment}
        submitting={submitting}
      />
    </div>
  );
};

export default AdminDash;