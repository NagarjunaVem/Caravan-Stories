import axios from "axios";
import { createContext, useEffect, useState, useCallback } from "react";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [ticketSummary, setTicketSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Fetch ticket summary (use useCallback to stabilize reference)
  const fetchTicketSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/tickets/summary`, {
        withCredentials: true,
      });
      if (data?.success) setTicketSummary(data.summary);
    } catch (err) {
      console.error("Failed to fetch summary", err);
      setTicketSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  }, [backendUrl]);

  // Check authentication once on mount
  const checkAuth = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`, {
        withCredentials: true,
      });

      if (data.success) {
        setIsLoggedIn(true);
        const userRes = await axios.get(`${backendUrl}/api/user/data`, {
          withCredentials: true,
        });
        if (userRes.data.success) setUserData(userRes.data.userData);
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setLoadingAuth(false);
    }
  }, [backendUrl]);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Fetch summary after successful authentication
  useEffect(() => {
    if (isLoggedIn && !loadingAuth) {
      fetchTicketSummary();
    }
  }, [isLoggedIn, loadingAuth, fetchTicketSummary]);

  const value = {
    backendUrl,
    isLoggedIn,
    userData,
    loadingAuth,
    ticketSummary,
    loadingSummary,
    refreshSummary: fetchTicketSummary,
    setIsLoggedIn,
    setUserData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};