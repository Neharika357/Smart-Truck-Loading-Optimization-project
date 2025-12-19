import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {  Plus, Search, CheckCircle} from 'lucide-react';
import Navbar from '../components/navbar-trucks';
import '../styles/trucks.css';

const TruckDashboard = () => {
  const [trucks, setTrucks] = useState([]); 
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    weight: '',
    volume: '',
    from: '',
    to: '',
    price: '',
    type: 'Box Truck'
  });

  const username = "#T01"

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/truck`, {
            params: { username: username }
        });
        setTrucks(response.data);
      } catch (err) {
        console.error("Error fetching trucks:", err);
      }
    };
    fetchTrucks();
  }, []);

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:5000/create-truck', {
        ...formData,
        username: username
      });
      
      setTrucks([response.data.TrucksInfo, ...trucks]);
      setFormData({ weight: '', volume: '', from: '', to: '', price: '', type: 'Box Truck' });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (err) {
      alert("Error: " + err);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <main className="dashboard-grid">
        <aside className="form-sidebar">
          <div className="glass-card">
            <div className="card-header-main">
              <h3>Add New Truck</h3>
              <p>Register vehicle to the fleet</p>
            </div>  
            <div className="form-body">
              <div className="input-row">
                <div className="input-field">
                  <label>Weight (KG)</label>
                  <input 
                    type="number" value={formData.weight} 
                    onChange={(e) => setFormData({...formData, weight: e.target.value})} 
                    placeholder="3000" 
                  />
                </div>
                <div className="input-field">
                  <label>Volume (M<sup>3</sup>)</label>
                  <input 
                    type="number"  value= {formData.volume}
                    onChange={(e) =>setFormData({...formData, volume: e.target.value})} placeholder="20" 
                  />
                </div>
              </div>
              <div 
                className="input-field" 
              >
                <label>Vehicle Type</label>
                <select value={formData.type}
                onChange={(e) => setFormData({...formData, type : e.target.value})}>
                  <option>Box Truck</option>
                  <option>Refrigerated</option>
                  <option>Flatbed</option>
                </select>
              </div>
              <div className="input-field2">
                <div className="input-field">
                  <label>From</label>
                  <input type="string" value={formData.from}
                onChange={(e) => setFormData({...formData, from : e.target.value})}placeholder="e.g. Hyderabad" />
                </div>
                 <div className="input-field">
                  <label>To</label>
                  <input type="String" value={formData.to}
                onChange={(e) => setFormData({...formData, to : e.target.value})}placeholder="e.g. Chennai" />
                </div>
              </div>
              <div className="input-field">
                <label>Price per KM (₹)</label>
                <input type="number" value={formData.price}
                onChange={(e) => setFormData({...formData, price : e.target.value})} placeholder="30" />
              </div>
              <button className="submit-btn" onClick={handleRegister}>
                <Plus size={20} /> Register Truck
              </button>
            </div>
          </div>
        </aside>
        
        <section className="display-area">
          <div className="glass-card">
            <div className="list-header">
              <h3>Active Fleet</h3>
              <div className="search-box">
                <Search size={18} />
                <input type="text" placeholder="Search ID or Route..." />
              </div>
            </div>
            <div className="truck-grid">
              {trucks.map((truck) => (
                <div key={truck._id} className="truck-wrapper">
                    <div  className={`truck-card-mini `} >
                    <div className="truck-card-top">
                        <span className="truck-tag">{truck.truckId}</span>
                        <span className={`status-pill ${truck.status.toLowerCase().replace(' ', '-')}`}>
                        {truck.status}
                        </span>
                    </div>
                    <div className="truck-card-details">
                        <p><strong>{truck.route.from} → {truck.route.to}</strong></p>
                        <div className="specs">
                        <span>{truck.capacityWeight}kg</span>
                        <span>{truck.capacityVolume}m^3</span>
                        <span>₹{truck.pricePerKm}/km</span>
                        </div>
                    </div>
                    </div>    
                </div>   
              ))}
            </div>
          </div>
        </section>
      </main>
      {showSuccess && (
        <div className="modal-overlay blur-bg intense animate-fade-in">
          <div className="verification-box glass-card feedback-popup">
            <div className="feedback-view">
              <div className="success-icon-animate">
                <CheckCircle color="#2d6a4f" size={80} strokeWidth={1.5} />
              </div>
              <h3>Truck Registered!</h3>
              <p>Vehicle has been added to the active fleet.</p>
              <span className="sub-text">Updating your dashboard...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruckDashboard;