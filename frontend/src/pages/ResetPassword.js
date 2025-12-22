import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { z } from 'zod';
import '../styles/auth.css'

function TextInput({ label, id, type = 'text', value, onChange, placeholder, error }) {
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

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ['confirmPassword'],
});

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  // Auto-fill token from URL
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setErrors({});

    if (!token) {
      setApiError('Reset token is required.');
      return;
    }

    try {
      resetPasswordSchema.parse({ password, confirmPassword });

      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess(true);
      
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);

    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setApiError(error.response?.data?.message || error.message || 'Failed to reset password.');
      }
    } finally {
      setLoading(false);
    }
  };

 if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card success-card">
            <div className="success-icon-wrapper">
              <svg className="success-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="success-title">Password Reset Successful</h3>
            <p className="auth-subtitle">
              Your password has been updated. Redirecting to login page...
            </p>
            <Link to="/auth/login" className="full-link">
              <PrimaryButton type="button">Go to Login Now</PrimaryButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">Set a new password for your account</p>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          {apiError && <div className="api-error-alert">{apiError}</div>}

          <form onSubmit={handleSubmit} className="auth-form-spacing">
            <TextInput
              id="token"
              label="Reset Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste token here"
              error={errors.token}
            />

            <TextInput
              id="password"
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              error={errors.password}
            />

            <TextInput
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              error={errors.confirmPassword}
            />

            <PrimaryButton type="submit" loading={loading}>
              Reset Password
            </PrimaryButton>
          </form>

          <div className="back-to-login">
            <Link to="/auth/login" className="link-primary">
              Cancel and return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;