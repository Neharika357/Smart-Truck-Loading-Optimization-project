import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import '../styles/login.css'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const login = async (email, password) => {
  const response = await fetch(`https://smart-truck-loading-optimization-project.onrender.com/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data; 
};

function PrimaryButton({ children, loading, disabled, type = 'button', className = '', ...rest }) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`btn-primary-custom ${className}`}
      {...rest}
    >
      {loading && <span className="spinner-icon" />}
      {children}
    </button>
  );
}

function TextInput({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
}) {
  return (
    <div className="input2-group">
      <label htmlFor={id} className="input2-label">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input2-field ${error ? 'input2-error' : ''}`}
      />
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setErrors({});

    try {
      loginSchema.parse({ email, password });
      setLoading(true);
      
      const response = await login(email, password);
      
      const { token, role, user } = response;
      const fullName = user.fullName; // This is the 'username' you need

      // 3. Save to storage
      localStorage.setItem('authToken', token);
      localStorage.setItem('role', role);

      // 4. Navigate using the fullName variable
      if (role === 'warehouse') {
        navigate(`/warehouse/${fullName}`);
      } else {
        navigate(`/dealer/${fullName}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {};
        error.errors.forEach((err) => { fieldErrors[err.path[0]] = err.message; });
        setErrors(fieldErrors);
      } else {
        setApiError(error.message || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Main System Heading */}
        <div className="auth-header">
          <h1 className="system-title">OptiTruckConnect</h1>
          <p className="system-subtitle">Connect warehouses and truck dealers for efficient logistics</p>
        </div>

        {/* Login Card */}
        <div className="auth-card">
          <h2 className="auth-title">Login</h2>
          
          {apiError && <div className="api-error-alert">{apiError}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form-spacing">
            <TextInput 
              id="login-email" 
              label="Email" 
              type="email" 
              placeholder="you@company.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              error={errors.email} 
            />
            
            <TextInput 
              id="login-password" 
              label="Password" 
              type="password" 
              placeholder="Enter your password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              error={errors.password} 
            />
            
            <div className="forgot-password-link">
              <Link to="/auth/forgot-password">Forgot Password?</Link>
            </div>
            
            <PrimaryButton type="submit" loading={loading}>Login</PrimaryButton>
          </form>
          
          <div className="auth-footer">
            Don't have an account? <Link to="/" className="link-bold">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;