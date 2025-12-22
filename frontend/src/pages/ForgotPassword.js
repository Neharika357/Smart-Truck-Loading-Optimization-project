import { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import '../styles/auth.css'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

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

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    try {
      forgotPasswordSchema.parse({ email });

      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(true);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        console.error(error);
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
            <h3 className="success-title">Check your Email</h3>
            <p className="auth-subtitle">
              We have sent a password reset link to <strong>{email}</strong>.
            </p>
            
            <div className="demo-note">
              <strong>Note:</strong> Since this is a demo, no real email was sent. 
              You can click the link below to simulate the reset page.
            </div>

            <Link to="/auth/reset-password?token=demo-token-123" className="full-link">
              <PrimaryButton type="button">Go to Reset Password</PrimaryButton>
            </Link>
            
            <div className="back-to-login">
              <Link to="/auth/login" className="link-secondary">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-subtitle">Enter your email to receive a reset token</p>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="auth-form">
            <TextInput
              id="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              error={errors.email}
            />

            <PrimaryButton type="submit" loading={loading} className="mt-6">
              Send Reset Link
            </PrimaryButton>
          </form>

          <div className="back-to-login">
            <Link to="/auth/login" className="link-primary">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;