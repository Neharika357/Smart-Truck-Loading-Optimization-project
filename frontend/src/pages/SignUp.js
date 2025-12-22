import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import '../styles/auth.css'

const register = async (userData) => {
  // 🔥 IMPORTANT FIX:
  // Convert single serviceArea string → array for backend
  const payload = {
      ...userData
    };

  const response = await fetch(`http://localhost:5000/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  return data;
};

function StepIndicator({ currentStep }) {
  return (
    <div className="step-indicator-container">
      {[1, 2, 3].map((s) => (
        <div key={s} className="step-wrapper">
          <div className={`step-number ${currentStep >= s ? 'active' : ''}`}>
            {s}
          </div>
          {s < 3 && <div className={`step-line ${currentStep > s ? 'active' : ''}`} />}
        </div>
      ))}
    </div>
  );
}

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

const step2Schema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

const warehouseSchema = z.object({
  companyName: z.string().min(2, 'Company name required'),
  managerName: z.string().min(2, 'Manager name required'),
  location: z.string().min(2, 'Location required'),
});

const dealerSchema = z.object({
  companyName: z.string().min(2, 'Company name required'),
  contactNumber: z.string().min(10, 'Valid contact number required'),
  serviceArea: z.string().min(2, 'Service area required'),
});

/* ---------------- COMPONENT ---------------- */

function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const [formData, setFormData] = useState({
    role: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    managerName: '',
    location: '',
    contactNumber: '',
    serviceArea: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (errors[e.target.id]) {
      setErrors({ ...errors, [e.target.id]: '' });
    }
  };

const handleNextStep = (e) => {
  e.preventDefault();
  setErrors({});
  setApiError('');

  const result = step2Schema.safeParse(formData);

  if (!result.success) {
    const fieldErrors = {};
    
    result.error.issues.forEach((issue) => {
      fieldErrors[issue.path[0]] = issue.message;
    });

    setErrors(fieldErrors);
    return; 
  }
  setStep(3);
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({});
  setApiError('');

  // 1. Validate the specific schema based on role
  const schema = formData.role === 'warehouse' ? warehouseSchema : dealerSchema;
  const result = schema.safeParse(formData);

  if (!result.success) {
    const fieldErrors = {};
    result.error.issues.forEach((issue) => {
      fieldErrors[issue.path[0]] = issue.message;
    });
    setErrors(fieldErrors);
    return; // Stop here if validation fails
  }

  // 2. Prepare Payload
  const payload = {
    fullName: formData.fullName,
    email: formData.email,
    password: formData.password,
    role: formData.role,
    companyName: formData.companyName,
    ...(formData.role === 'warehouse' 
      ? { managerName: formData.managerName, location: formData.location }
      : { contactNumber: formData.contactNumber, serviceArea: formData.serviceArea }
    )
  };

  try {
    setLoading(true);
    const response = await register(payload);
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('role', formData.role);
    navigate(formData.role === 'warehouse' ? `/warehouse/${formData.fullName}` :`/dealer/${formData.fullName}`);
  } catch (err) {
    setApiError(err.message || 'Signup failed');
  } finally {
    setLoading(false);
  }
};
  /* ---------------- UI STEPS ---------------- */

  

  return (
    <div className="auth-page">
      <div className="signup-container">
        {/* Global Heading */}
        <div className="auth-header">
          <h1 className="system-title">OptiTruckConnect</h1>
          <p className="system-subtitle">Connect warehouses and truck dealers for efficient logistics</p>
        </div>

        <div className="auth-card">
          <StepIndicator currentStep={step} />

          {apiError && <div className="api-error-alert">{apiError}</div>}

          {step === 1 && (
            <div className="step-content">
              <h2 className="step-title">Select Your Role</h2>
              <div className="role-grid">
                <button type="button" onClick={() => { setFormData({ ...formData, role: 'warehouse' }); setStep(2); }} className="role-card">
                  <div className="role-icon">🏬</div>
                  <h3 className="role-name">Warehouse User</h3>
                  <p className="role-desc">Upload shipments and get optimized truck matches.</p>
                </button>
                <button type="button" onClick={() => { setFormData({ ...formData, role: 'dealer' }); setStep(2); }} className="role-card">
                  <div className="role-icon">🚚</div>
                  <h3 className="role-name">Truck Dealer</h3>
                  <p className="role-desc">Register trucks and accept booking requests.</p>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="auth-form-spacing">
              <h2 className="step-title">Personal Details</h2>
              <TextInput id="fullName" label="Full Name" value={formData.fullName} onChange={handleChange} error={errors.fullName} />
              <TextInput id="email" label="Email" value={formData.email} onChange={handleChange} error={errors.email} />
              <TextInput id="password" label="Password" type="password" value={formData.password} onChange={handleChange} error={errors.password} />
              <TextInput id="confirmPassword" label="Confirm Password" type="password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
              <PrimaryButton type="button" onClick={handleNextStep}>Next</PrimaryButton>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="auth-form-spacing">
              <h2 className="step-title">Business Details</h2>
              <TextInput id="companyName" label="Company Name" value={formData.companyName} onChange={handleChange} error={errors.companyName} />
              {formData.role === 'warehouse' ? (
                <>
                  <TextInput id="managerName" label="Manager Name" value={formData.managerName} onChange={handleChange} error={errors.managerName} />
                  <TextInput id="location" label="Location" value={formData.location} onChange={handleChange} error={errors.location} />
                </>
              ) : (
                <>
                  <TextInput id="contactNumber" label="Contact Number" value={formData.contactNumber} onChange={handleChange} error={errors.contactNumber} />
                  <TextInput id="serviceArea" label="Service Area" value={formData.serviceArea} onChange={handleChange} error={errors.serviceArea} />
                </>
              )}
              <PrimaryButton type="submit" loading={loading}>Complete Signup</PrimaryButton>
            </form>
          )}

          {step === 1 && (
            <div className="auth-footer">
              Already have an account? <Link to="/login" className="link-bold">Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Signup;
