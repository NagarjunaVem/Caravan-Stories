import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import bgLogin from '../assets/login-bg.jpeg';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn, setUserData } = useContext(AppContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      axios.defaults.withCredentials = true;

      const loginRes = await axios.post(`${backendUrl}/api/auth/login`, {
        email: email.toLowerCase().trim(),
        password
      });

      const loginData = loginRes.data;

      if (loginData.success) {
        try {
          const userRes = await axios.get(`${backendUrl}/api/auth/is-auth`, {
            withCredentials: true
          });

          if (userRes.data.success && userRes.data.user) {
            setIsLoggedIn(true);
            setUserData(userRes.data.user);
            toast.success('Login successful!');
            navigate('/');
          } else {
            toast.error('Failed to fetch user data');
          }
        } catch (userError) {
          console.error('Fetch user error:', userError);
          toast.error('Failed to fetch user data');
        }
      } else {
        if (loginData.needsVerification) {
          toast.info(loginData.message || 'Please verify your email first');
          navigate('/verify-email', { state: { email: loginData.email || email.toLowerCase() } });
          return;
        }
        toast.error(loginData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred during login';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: `url(${bgLogin})` }}
    >
      {/* Cyan/Indigo accent focus helper (fallback) */}
      <style>{`
        .focus-accent:focus {
          border-color: rgba(56, 189, 248, 0.8) !important; /* cyan-400 */
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
        }
      `}</style>

      <form
        onSubmit={handleSubmit}
        className="
          relative z-10 w-full max-w-[90%] xs:max-w-[350px] sm:max-w-md text-center
          border border-white/10 rounded-2xl
          px-6 py-6 sm:px-8 sm:py-8
          backdrop-blur-xl bg-[rgba(8,14,28,0.55)] shadow-[0_10px_40px_rgba(0,0,0,0.45)]
        "
      >
        <h1 className="text-white text-2xl sm:text-3xl mt-6 font-semibold tracking-tight">
          Login
        </h1>
        <p className="text-slate-300/80 text-xs sm:text-sm mt-2 pb-6">
          Please login to continue
        </p>

        {/* Email */}
        <div className="flex items-center w-full mt-4 bg-white/5 border border-white/10 h-11 sm:h-12 rounded-full overflow-hidden pl-4 sm:pl-6 gap-2 backdrop-blur-lg focus-within:border-cyan-400/70 transition-colors">
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
        <div className="flex items-center mt-4 w-full bg-white/5 border border-white/10 h-11 sm:h-12 rounded-full overflow-hidden pl-4 sm:pl-6 gap-2 backdrop-blur-lg focus-within:border-cyan-400/70 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300/70 flex-shrink-0" viewBox="0 0 24 24">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            type="password"
            placeholder="Password"
            className="bg-transparent text-slate-100 placeholder-slate-400 outline-none text-sm w-full h-full pr-4 focus-accent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {/* Forgot Password */}
        <div className="text-right mt-2">
          <Link
            to="/forgot-password"
            className="text-xs sm:text-sm text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline transition-colors font-medium"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className={`
            mt-6 w-full h-11 sm:h-12 rounded-full text-white text-sm sm:text-base font-medium
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
              Logging in...
            </span>
          ) : (
            'Login'
          )}
        </button>

        {/* Register link */}
        <p className="text-slate-300/80 text-xs sm:text-sm mt-4 mb-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline transition-colors font-medium"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;