// pages/Profile.jsx
import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

// Helper function to get dashboard path based on role
const getDashboardPath = (role) => {
  const dashboardMap = {
    citizen: '/citizen-dashboard',
    employee: '/employee-dashboard',
    admin: '/admin-dashboard'
  };
  return dashboardMap[role] || '/';
};

const Profile = () => {
  const { backendUrl, userData, setUserData, setIsLoggedIn } = useContext(AppContext);
  const navigate = useNavigate();

  // User data state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    createdAt: '',
    newEmailPending: ''
  });

  // Form states
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState('');

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Email reset state
  const [emailResetForm, setEmailResetForm] = useState({
    email: ''
  });
  const [showEmailReset, setShowEmailReset] = useState(false);

  // Email change state
  const [emailChangeForm, setEmailChangeForm] = useState({
    newEmail: '',
    password: '',
    otp: ''
  });
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Fetch profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/profile`,
        { withCredentials: true }
      );

      if (data.success) {
        setProfile(data.user);
        setNewName(data.user.name);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      toast.error('Failed to load profile');
    } finally {
      setPageLoading(false);
    }
  };

  // Logout function
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/logout`,
        {},
        { withCredentials: true }
      );

      if (data.success) {
        // Clear user data
        setUserData(null);
        setIsLoggedIn(false);
        
        // Clear any stored tokens
        localStorage.removeItem('token');
        sessionStorage.clear();
        
        toast.success('Logged out successfully');
        navigate('/login');
      } else {
        toast.error(data.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
      // Even if logout fails on backend, clear local data
      setUserData(null);
      setIsLoggedIn(false);
      localStorage.removeItem('token');
      sessionStorage.clear();
      navigate('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  // Update name
  const handleUpdateName = async () => {
    if (!newName.trim() || newName === profile.name) {
      setEditName(false);
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/profile/update`,
        { name: newName },
        { withCredentials: true }
      );

      if (data.success) {
        setProfile(prev => ({ ...prev, name: data.user.name }));
        setUserData(prev => ({ ...prev, name: data.user.name }));
        setEditName(false);
        toast.success('Name updated successfully');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Update name error:', error);
      toast.error('Failed to update name');
    } finally {
      setLoading(false);
    }
  };

  // Change password with old password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/profile/change-password`,
        {
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success('Password changed successfully');
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Request password reset email
  const handleRequestReset = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/profile/request-reset`,
        { email: emailResetForm.email }
      );

      if (data.success) {
        toast.success(data.message);
        setEmailResetForm({ email: '' });
        setShowEmailReset(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Request reset error:', error);
      toast.error('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  // Request email change
  const handleRequestEmailChange = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/profile/change-email`,
        {
          newEmail: emailChangeForm.newEmail,
          password: emailChangeForm.password
        },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        setOtpSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Request email change error:', error);
      toast.error('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP for email change
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/profile/verify-email-otp`,
        { otp: emailChangeForm.otp },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        setProfile(prev => ({ ...prev, email: data.newEmail, newEmailPending: '' }));
        setUserData(prev => ({ ...prev, email: data.newEmail }));
        setEmailChangeForm({ newEmail: '', password: '', otp: '' });
        setShowEmailChange(false);
        setOtpSent(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error('Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  // Cancel email change
  const handleCancelEmailChange = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/profile/cancel-email-change`,
        {},
        { withCredentials: true }
      );

      if (data.success) {
        setProfile(prev => ({ ...prev, newEmailPending: '' }));
        setEmailChangeForm({ newEmail: '', password: '', otp: '' });
        setShowEmailChange(false);
        setOtpSent(false);
        toast.info('Email change cancelled');
      }
    } catch (error) {
      console.error('Cancel email change error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo/Home and Navigation */}
            <div className="flex items-center space-x-8">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-semibold text-lg">Home</span>
              </Link>
              
              <Link 
                to={getDashboardPath(profile.role || userData?.role)} 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              
              <span className="text-gray-400">|</span>
              
              <span className="text-gray-900 font-medium">Profile Settings</span>
            </div>

            {/* Right side - User info and Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                  {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-gray-700 text-sm font-medium hidden sm:block">
                  {profile.name}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loggingOut ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-4 text-sm">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link to="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                    Home
                  </Link>
                </li>
                <li className="text-gray-500">/</li>
                <li>
                  <Link to={getDashboardPath(profile.role || userData?.role)} className="text-gray-500 hover:text-gray-700 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li className="text-gray-500">/</li>
                <li className="text-gray-900 font-medium">Profile Settings</li>
              </ol>
            </nav>
          </div>

          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="mt-1 text-sm text-gray-600">Manage your account information and security settings</p>
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              
              <div className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  {editName ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={loading}
                      />
                      <button
                        onClick={handleUpdateName}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditName(false);
                          setNewName(profile.name);
                        }}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <p className="text-gray-900">{profile.name}</p>
                      <button
                        onClick={() => setEditName(true)}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium cursor-pointer transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-900">{profile.email}</p>
                      {profile.newEmailPending && (
                        <p className="text-sm text-amber-600 mt-1">
                          Pending change to: {profile.newEmailPending}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowEmailChange(!showEmailChange)}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium cursor-pointer transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <p className="text-gray-900 capitalize">{profile.role}</p>
                </div>

                {/* Department (if employee) */}
                {profile.department && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <p className="text-gray-900">{profile.department}</p>
                  </div>
                )}

                {/* Member Since */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                  <p className="text-gray-900">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
              
              <div className="space-y-4">
                {/* Change Password Button */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">Password</p>
                    <p className="text-sm text-gray-600">Last changed: Never tracked</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium cursor-pointer transition-colors"
                    >
                      Change Password
                    </button>
                    <button
                      onClick={() => setShowEmailReset(!showEmailReset)}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium cursor-pointer transition-colors"
                    >
                      Reset via Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          {showPasswordForm && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    minLength={6}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Email Reset Form */}
          {showEmailReset && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reset Password via Email</h3>
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={emailResetForm.email}
                    onChange={(e) => setEmailResetForm({ email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-600">
                    We'll send a password reset link to this email
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmailReset(false);
                      setEmailResetForm({ email: '' });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Email Change Form */}
          {showEmailChange && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Email Address</h3>
              
              {!otpSent ? (
                <form onSubmit={handleRequestEmailChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      value={emailChangeForm.newEmail}
                      onChange={(e) => setEmailChangeForm(prev => ({ ...prev, newEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={emailChangeForm.password}
                      onChange={(e) => setEmailChangeForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 cursor-pointer transition-colors"
                    >
                      {loading ? 'Sending...' : 'Send Verification Code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmailChange(false);
                        setEmailChangeForm({ newEmail: '', password: '', otp: '' });
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-sm text-blue-800">
                      We've sent a verification code to <strong>{emailChangeForm.newEmail}</strong>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      The code will expire in 10 minutes
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={emailChangeForm.otp}
                      onChange={(e) => setEmailChangeForm(prev => ({ ...prev, otp: e.target.value }))}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-2xl tracking-widest"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 cursor-pointer transition-colors"
                    >
                      {loading ? 'Verifying...' : 'Verify & Change Email'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEmailChange}
                      disabled={loading}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setEmailChangeForm(prev => ({ ...prev, otp: '' }));
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer transition-colors"
                  >
                    ← Back to email input
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h2>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">Delete Account</p>
                <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
              </div>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer transition-colors"
                onClick={() => toast.info('Account deletion not implemented yet')}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;