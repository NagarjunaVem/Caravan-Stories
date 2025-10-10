const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    axios.defaults.withCredentials = true;
    const { data } = await axios.post(
      `${backendUrl}/api/auth/login`,
      {
        email: email.toLowerCase().trim(),
        password
      },
      { withCredentials: true }
    );

    if (data.success) {
      // ✅ Use user data directly from login response
      if (data.user) {
        setIsLoggedIn(true);
        setUserData(data.user);
        toast.success('Login successful!');
        navigate('/');
      } else {
        // ✅ Fallback: fetch user data if not included
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
        } catch (fetchError) {
          console.error('Fetch user error:', fetchError);
          toast.error('Login successful but failed to fetch user data. Please refresh.');
          // Still navigate - the main page will check auth
          navigate('/');
        }
      }
    } else {
      // Handle email verification case
      if (data.needsVerification) {
        toast.info(data.message || 'Please verify your email first');
        navigate('/verify-email', { 
          state: { email: data.email || email.toLowerCase() } 
        });
        return;
      }
      toast.error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error.response?.data?.message || 'An error occurred during login';
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};