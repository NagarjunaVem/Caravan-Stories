import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import bgLogin from '../assets/login-bg.jpeg'; // ✅ renamed background
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [department, setDepartment] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const DEPARTMENTS = [
    'IT', 'HR', 'Finance', 'Facilities', 'Management', 'Support',
    'Operations', 'Safety', 'Electrical', 'Mechanical', 'Civil',
    'Maintenance', 'Logistics', 'Procurement',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      axios.defaults.withCredentials = true;

      const res = await axios.post(`${backendUrl}/api/auth/register`, {
        name,
        email: email.toLowerCase().trim(),
        password,
        requestedRole: role,
        department: role === 'employee' ? department : undefined,
        reason: role !== 'citizen' ? reason : undefined,
      });

      const data = res.data;

      if (data.success) {
        if (data.autoApproved) {
          toast.success('🎉 ' + (data.message || 'Congratulations! You\'ve been approved as the first administrator.'), { autoClose: 5000 });
          setTimeout(() => navigate('/login'), 1500);
        } else if (data.requiresApproval) {
          toast.success(data.message || 'Registration request submitted. Please wait for admin approval.');
          setTimeout(() => navigate('/login'), 1500);
        } else if (data.needsVerification) {
          toast.success(data.message || 'Please check your email to verify your account.');
          navigate('/verify-email', { state: { email: data.email } });
        } else {
          toast.success(data.message || 'Registration successful!');
          navigate('/login');
        }
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: `url(${bgLogin})` }}
    >
      {/* Scrollbar + theme accents */}
      <style>{`
        /* WebKit scrollbars */
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.35); /* cyan-400 */
          border-radius: 9999px;
          border: 2px solid transparent;
          background-clip: padding-box;
          box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.25), 0 6px 16px rgba(56, 189, 248, 0.28);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(56, 189, 248, 0.55);
          box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.4), 0 10px 24px rgba(56, 189, 248, 0.4);
        }

        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(56, 189, 248, 0.6) transparent;
        }

        /* Input focus rings (fallback for browsers without Tailwind arbitrary rings) */
        .focus-accent:focus {
          border-color: rgba(56, 189, 248, 0.8) !important;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
        }
      `}</style>

      <form
        onSubmit={handleSubmit}
        className="
          relative z-10 w-full max-w-[90%] xs:max-w-[400px] sm:max-w-md text-center
          border border-white/10 rounded-2xl px-6 py-6 sm:px-8 sm:py-8
          backdrop-blur-xl bg-[rgba(8,14,28,0.55)] shadow-[0_10px_40px_rgba(0,0,0,0.45)]
          max-h-[90vh] overflow-y-auto custom-scrollbar
        "
      >
        <h1 className="text-white text-2xl sm:text-3xl mt-4 font-semibold tracking-tight">
          Create Account
        </h1>
        <p className="text-slate-300/80 text-xs sm:text-sm mt-2 pb-4">
          Sign up to get started
        </p>

        {/* Name */}
        <div className="flex items-center w-full mt-3 bg-white/5 dark:bg-white/5 border border-white/10 h-11 sm:h-12 rounded-full overflow-hidden pl-4 sm:pl-6 gap-2 backdrop-blur-lg focus-within:border-cyan-400/70 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300/70 flex-shrink-0" viewBox="0 0 24 24">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <input
            type="text"
            placeholder="Full Name"
            className="bg-transparent text-slate-100 placeholder-slate-400 outline-none text-sm w-full h-full pr-4 focus-accent"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div className="flex items-center w-full mt-3 bg-white/5 border border-white/10 h-11 sm:h-12 rounded-full overflow-hidden pl-4 sm:pl-6 gap-2 backdrop-blur-lg focus-within:border-cyan-400/70 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300/70 flex-shrink-0" viewBox="0 0 24 24">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <input
            type="email"
            placeholder="Email address"
            className="bg-transparent text-slate-100 placeholder-slate-400 outline-none text-sm w-full h-full pr-4 focus-accent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="flex items-center mt-3 w-full bg-white/5 border border-white/10 h-11 sm:h-12 rounded-full overflow-hidden pl-4 sm:pl-6 gap-2 backdrop-blur-lg focus-within:border-cyan-400/70 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300/70 flex-shrink-0" viewBox="0 0 24 24">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            className="bg-transparent text-slate-100 placeholder-slate-400 outline-none text-sm w-full h-full pr-4 focus-accent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {/* Role Selection */}
        <div className="flex items-center mt-3 w-full bg-white/5 border border-white/10 h-11 sm:h-12 rounded-full overflow-hidden pl-4 sm:pl-6 gap-2 backdrop-blur-lg focus-within:border-cyan-400/70 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300/70 flex-shrink-0" viewBox="0 0 24 24">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <select
            className="bg-transparent text-slate-100 outline-none text-sm w-full h-full pr-4 cursor-pointer"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              if (e.target.value === 'citizen') {
                setDepartment('');
                setReason('');
              }
            }}
            required
          >
            <option value="citizen" className="bg-[#0b0f1b] text-white">👤 Citizen (Instant Access)</option>
            <option value="employee" className="bg-[#0b0f1b] text-white">👔 Employee (Needs Approval)</option>
            <option value="admin" className="bg-[#0b0f1b] text-white">⚙️ Admin (Needs Approval)</option>
          </select>
        </div>

        {/* Department (Employee only) */}
        {role === 'employee' && (
          <div className="flex items-center mt-3 w-full bg-white/5 border border-white/10 h-11 sm:h-12 rounded-full overflow-hidden pl-4 sm:pl-6 gap-2 backdrop-blur-lg animate-fadeIn focus-within:border-cyan-400/70 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300/70 flex-shrink-0" viewBox="0 0 24 24">
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
            <select
              className="bg-transparent text-slate-100 outline-none text-sm w-full h-full pr-4 cursor-pointer"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            >
              <option value="" className="bg-[#0b0f1b] text-white">Select Department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} className="bg-[#0b0f1b] text-white">
                  {dept}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reason (Employee/Admin) */}
        {role !== 'citizen' && (
          <div className="mt-3 animate-fadeIn">
            <textarea
              placeholder={`Why do you need ${role} access? (Optional but recommended)`}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-400 outline-none text-sm backdrop-blur-lg resize-none focus:border-cyan-400/70 transition-colors"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
            />
            <p className="text-xs text-slate-400 mt-1 text-right">
              {reason.length}/500
            </p>
          </div>
        )}

        {/* Info Box */}
        {role !== 'citizen' && (
          <div className="mt-3 p-3 bg-cyan-400/10 border border-cyan-400/20 rounded-lg animate-fadeIn">
            <p className="text-xs text-slate-200 flex items-start gap-2">
              <span className="text-lg">ℹ️</span>
              <span>
                {role === 'admin' ? (
                  <>
                    <strong className="text-cyan-300">Admin Request:</strong>{' '}
                    If you're the first admin, you'll be approved automatically. Otherwise, your request will need admin approval. You'll receive an email notification once it's processed.
                  </>
                ) : (
                  <>
                    <strong className="text-cyan-300">Admin Approval Required:</strong>{' '}
                    Your {role} account request will be sent to administrators for review. You'll receive an email notification once it's processed.
                  </>
                )}
              </span>
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className={`
            mt-5 w-full h-11 sm:h-12 rounded-full text-white text-sm sm:text-base font-medium
            bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500
            hover:from-cyan-300 hover:via-sky-400 hover:to-indigo-400
            transition-all shadow-[0_10px_30px_rgba(56,189,248,0.35)]
            hover:shadow-[0_12px_40px_rgba(56,189,248,0.5)]
            ${loading ? 'opacity-60 cursor-not-allowed' : ''}
          `}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            role === 'citizen' ? 'Sign Up' : 'Submit Request'
          )}
        </button>

        {/* Login Link */}
        <p className="text-slate-300/80 text-xs sm:text-sm mt-4 mb-4">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline transition-colors"
          >
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;