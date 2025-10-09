import { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketSummary, setTicketSummary] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`, {
        withCredentials: true
      });

      if (data.success && data.user) {
        setIsLoggedIn(true);
        setUserData(data.user);
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      // ✅ Handle 401 gracefully - user is just not logged in
      if (error.response?.status === 401) {
        console.log('User not authenticated');
        setIsLoggedIn(false);
        setUserData(null);
      } else {
        console.error('Auth check error:', error);
        setIsLoggedIn(false);
        setUserData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch ticket summary (only if logged in)
  useEffect(() => {
    fetchTicketSummary();
  }, []);

  const fetchTicketSummary = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/tickets/summary`, {
        withCredentials: true
      });

      if (data.success) {
        setTicketSummary(data.summary);
      }
    } catch (error) {
      console.error('Fetch ticket summary error:', error);
    }
  };

  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    loading,
    ticketSummary,
    checkAuth,
    fetchTicketSummary
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};