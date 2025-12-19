import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import '../styles/trucks.css';

const CreateShipment = ({ onAddShipment }) => {
  const [form, setForm] = useState({
    weight: '',
    volume: '',
    origin: '',
    destination: '',
    date: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    // Now this check will pass because state is actually updating!
    if (!form.origin || !form.destination || !form.weight || !form.date) {
        return alert("Please fill all details");
    }
    onAddShipment(form);
    setForm({ weight: '', volume: '', origin: '', destination: '', date: '' });
  };

  return (
    <aside className="form-sidebar">
      <div className="glass-card">
        <div className="card-header-main">
          <h3>Create New Shipment</h3>
          <p>Register Shipment to the fleet</p>
        </div>

        <div className="form-body">
          <div className="input-row">
            <div className="input-field">
              <label>Weight (KG)</label>
              {/* FIXED: Added name, value, onChange */}
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                placeholder="3000"
              />
            </div>
            <div className="input-field">
              <label>Volume (M<sup>3</sup>)</label>
              {/* FIXED: Added name, value, onChange */}
              <input
                type="number"
                name="volume"
                value={form.volume}
                onChange={handleChange}
                placeholder="20"
              />
            </div>
          </div>

          <div className="input-field">
            <label>Origin</label>
            {/* FIXED: Changed type to 'text' AND added connections */}
            <input
              type="text"
              name="origin"
              value={form.origin}
              onChange={handleChange}
              placeholder="e.g. Hyderabad"
            />
          </div>

          <div className="input-field">
            <label>Destination</label>
            <div className="input-with-icon">
              {/* FIXED: Added name, value, onChange */}
              <input
                type="text"
                name="destination"
                value={form.destination}
                onChange={handleChange}
                placeholder="e.g. Chennai"
              />
            </div>
          </div>

          <div className="input-field">
            <label>Deadline</label>
            {/* FIXED: Added name, value, onChange */}
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>

          <button className="submit-btn" onClick={handleSubmit}>
            <Plus size={20} /> Register Shipment
          </button>
        </div>
      </div>
    </aside>
  );
};

export default CreateShipment;