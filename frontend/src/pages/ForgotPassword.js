import { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

function PrimaryButton({ children, loading, disabled, type = 'button', className = '', ...rest }) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`w-full inline-flex items-center justify-center px-4 py-3 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {loading && (
        <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
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
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-lg outline-none transition-all focus:ring-2 focus:border-green-500 focus:ring-green-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
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
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-green-500 text-center">
            <h3 className="text-lg font-bold text-green-800 mb-2">Check your Email</h3>
            <p className="text-sm text-gray-600 mb-6">
              We have sent a password reset link to <strong>{email}</strong>.
            </p>
            
            <div className="p-3 bg-gray-100 rounded mb-4 text-xs text-gray-500 text-left">
              <strong>Note:</strong> Since this is a demo, no real email was sent. 
              You can click the link below to simulate the reset page.
            </div>

            <Link to="/auth/reset-password?token=demo-token-123">
              <PrimaryButton type="button">Go to Reset Password</PrimaryButton>
            </Link>
            
            <div className="mt-4">
              <Link to="/auth/login" className="text-sm text-gray-500 hover:text-gray-900 underline">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Forgot Password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Enter your email to receive a reset token
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextInput
              id="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              error={errors.email}
            />

            <PrimaryButton type="submit" loading={loading}>
              Send Reset Link
            </PrimaryButton>
          </form>

          <div className="mt-6 text-center">
            <Link to="/auth/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;