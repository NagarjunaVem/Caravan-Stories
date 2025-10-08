// src/pages/dashboards/AdminDash.jsx
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
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

const AdminDashboard = () => {
  const { backendUrl } = useContext(AppContext);

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

  // Modal states
  const [showCreateEmployee, setShowCreateEmployee] = useState(false);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [showAssignTicket, setShowAssignTicket] = useState(false);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleCreateEmployee = async (employeeForm) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/create-user`,
        employeeForm,
        { withCredentials: true }
      );
      
      if (data.success) {
        toast.success('Employee created successfully!');
        setShowCreateEmployee(false);
        fetchEmployees();
        fetchDashboardData();
      } else {
        toast.error(data.message || 'Failed to create employee');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create employee');
      throw error;
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

  const handleAssignTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setShowAssignTicket(true);
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetails(true);
  };

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
      />

      <AssignTicketModal 
        isOpen={showAssignTicket}
        onClose={() => {
          setShowAssignTicket(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
        onAssign={handleAssignTicket}
      />

      <EmployeeDetailsModal 
        isOpen={showEmployeeDetails}
        onClose={() => {
          setShowEmployeeDetails(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        onUpdateDepartment={handleUpdateDepartment}
      />
    </div>
  );
};

export default AdminDashboard;