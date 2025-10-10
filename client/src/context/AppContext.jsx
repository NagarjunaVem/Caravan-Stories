// src/context/AppContext.jsx
import { createContext, useEffect, useState } from 'react';
import axios from 'axios';

export const AppContext = createContext();

axios.defaults.withCredentials = true;

export const AppContextProvider = ({ children }) => {
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

  useEffect(() => {
    checkAuth();
    fetchTicketSummary();
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

  const fetchTicketSummary = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/tickets/summary`, {
        withCredentials: true
      });
      if (data.success) {
        setTicketSummary(data.summary);
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Fetch ticket summary error:', error);
      }
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