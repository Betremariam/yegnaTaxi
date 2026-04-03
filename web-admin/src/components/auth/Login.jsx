import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/useThemeStore';
import useToastStore from '../../store/useToastStore';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(phone, password);
    if (result.success) {
      useToastStore.getState().addToast('Welcome back!', 'success');
      navigate('/dashboard');
    } else {
      setError(result.error);
      useToastStore.getState().addToast(result.error || 'Login failed', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-nav-top">
        <button className="back-home-btn" onClick={() => navigate("/")}>
          ← Back to Home
        </button>
        <button
          className="theme-toggle-btn"
          onClick={toggleDarkMode}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </div>

      <div className="card login-card glass" style={{ border: '1px solid rgba(255, 255, 255, 0.1)', padding: '40px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Yegna Taxi</h1>
        <p style={{ textAlign: 'center', marginBottom: '40px', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>Admin Portal Access</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="e.g. 0912345678"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button 
            type="submit" 
            disabled={loading} 
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

