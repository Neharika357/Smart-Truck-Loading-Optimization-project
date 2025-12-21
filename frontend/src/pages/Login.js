import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import '../styles/auth.css'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const login = async (email, password) => {
  const response = await fetch(`http://localhost:5000/api/auth/login`, {
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
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Sign In</h3>
      {apiError && <p className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{apiError}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <TextInput id="login-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <TextInput id="login-password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        
        <div className="text-right">
            <Link to="/auth/forgot-password" className="text-sm text-green-600 hover:underline">Forgot Password?</Link>
        </div>
        
        <PrimaryButton type="submit" loading={loading}>Login</PrimaryButton>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-600">
        Don't have an account? <Link to="/" className="text-green-600 font-bold hover:underline">Sign up</Link>
      </div>
    </div>
  );
}

export default Login;