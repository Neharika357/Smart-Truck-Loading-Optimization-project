import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';

const register = async (userData) => {
  // 🔥 IMPORTANT FIX:
  // Convert single serviceArea string → array for backend
  const payload = {
    ...userData,
    serviceAreas: userData.serviceArea
      ? [userData.serviceArea]
      : undefined,
  };

  // Remove frontend-only field
  delete payload.serviceArea;

  const response = await fetch(`${API_URL}/register`, {
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

function TextInput({ label, id, type = 'text', value, onChange, placeholder, error }) {
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

/* ---------------- VALIDATION SCHEMAS ---------------- */

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
    try {
      step2Schema.parse(formData);
      setStep(3);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = {};
        err.errors.forEach((e) => (fieldErrors[e.path[0]] = e.message));
        setErrors(fieldErrors);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setApiError('');

    try {
      const basePayload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      let payload;

      if (formData.role === 'warehouse') {
        warehouseSchema.parse(formData);
        payload = {
          ...basePayload,
          companyName: formData.companyName,
          managerName: formData.managerName,
          location: formData.location,
        };
      } else {
        dealerSchema.parse(formData);
        payload = {
          ...basePayload,
          companyName: formData.companyName,
          contactNumber: formData.contactNumber,
          serviceArea: formData.serviceArea,
        };
      }

      setLoading(true);
      const response = await register(payload);

      localStorage.setItem('authToken', response.token);
      localStorage.setItem('role', formData.role);

      navigate(
        formData.role === 'warehouse'
          ? '/warehouse/dashboard'
          : '/dealer/dashboard'
      );
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = {};
        err.errors.forEach((e) => (fieldErrors[e.path[0]] = e.message));
        setErrors(fieldErrors);
      } else {
        setApiError(err.message || 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI STEPS ---------------- */

  const renderStep1 = () => (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">Choose Your Role</h2>
        <p className="text-gray-500 mt-2">
          Select how you want to use SmartLoad Logistics
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <button
          type="button"
          onClick={() => {
            setFormData({ ...formData, role: 'warehouse' });
            setStep(2);
          }}
          className="border-2 rounded-2xl p-8 text-left bg-white hover:border-green-600 hover:shadow-xl transition-all"
        >
          <div className="text-2xl mb-3">🏬</div>
          <h3 className="text-xl font-semibold">Warehouse Manager</h3>
          <p className="text-gray-500 mt-2">
            Manage shipments and book trucks easily.
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setFormData({ ...formData, role: 'dealer' });
            setStep(2);
          }}
          className="border-2 rounded-2xl p-8 text-left bg-white hover:border-green-600 hover:shadow-xl transition-all"
        >
          <div className="text-2xl mb-3">🚚</div>
          <h3 className="text-xl font-semibold">Truck Dealer</h3>
          <p className="text-gray-500 mt-2">
            Find freight loads and grow your business.
          </p>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <TextInput id="fullName" label="Full Name" value={formData.fullName} onChange={handleChange} error={errors.fullName} />
      <TextInput id="email" label="Email" value={formData.email} onChange={handleChange} error={errors.email} />
      <TextInput id="password" label="Password" type="password" value={formData.password} onChange={handleChange} error={errors.password} />
      <TextInput id="confirmPassword" label="Confirm Password" type="password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />

      <PrimaryButton type="button" onClick={handleNextStep}>
        Next
      </PrimaryButton>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
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

      <PrimaryButton type="submit" loading={loading}>
        Complete Signup
      </PrimaryButton>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
      {apiError && <p className="text-red-600 mb-4">{apiError}</p>}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      {step === 1 && (
        <p className="text-center mt-6">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-green-600 font-bold">
            Login
          </Link>
        </p>
      )}
    </form>
  );
}

export default Signup;
