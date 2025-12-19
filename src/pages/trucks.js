import React, { useState } from 'react';
import {  Plus, Search} from 'lucide-react';
import Navbar from '../components/navbar-trucks';
import '../styles/trucks.css';

const TruckDashboard = () => {
  
  const [trucks] = useState([
    { id: '#T101', capKg: 3000, capM3: 20, route: 'Hyderabad → Chennai', cost: 30, status: 'Available' },
    { id: '#T102', capKg: 3000, capM3: 20, route: 'Hyderabad → Chennai', cost: 30, status: 'In Use' },
    { id: '#T103', capKg: 3000, capM3: 10, route: 'Hyderabad → Chennai', cost: 30, status: 'Available' },
    { id: '#T104', capKg: 3000, capM3: 10, route: 'Hyderabad → Chennai', cost: 30, status: 'In Use' },
    { id: '#T105', capKg: 3000, capM3: 10, route: 'Hyderabad → Chennai', cost: 30, status: 'In Use' },
    { id: '#T106', capKg: 3000, capM3: 10, route: 'Hyderabad → Chennai', cost: 30, status: 'Available' },
    { id: '#T107', capKg: 3000, capM3: 10, route: 'Hyderabad → Chennai', cost: 30, status: 'Available' },
    { id: '#T108', capKg: 3000, capM3: 10, route: 'Hyderabad → Chennai', cost: 30, status: 'In Use' },
    { id: '#T109', capKg: 3000, capM3: 10, route: 'Hyderabad → Chennai', cost: 30, status: 'Available' },
    { id: '#T110', capKg: 3000, capM3: 10, route: 'Hyderabad → Chennai', cost: 30, status: 'Available' },
    { id: '#T111', capKg: 3000, capM3: 10, route: 'Hyderabad → Chennai', cost: 30, status: 'In Use' },
    { id: '#T112', capKg: 3000, capM3: 10, route: 'Hyderabad → Chennai', cost: 30, status: 'Available' },
    { id: '#T113', capKg: 3000, capM3: 10, route: 'Hyderabad → Chennai', cost: 30, status: 'Available' },
  ]);
  

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
                  <input type="number" placeholder="3000" />
                </div>
                <div className="input-field">
                  <label>Volume (M<sup>3</sup>)</label>
                  <input type="number" placeholder="20" />
                </div>
              </div>

              <div className="input-field">
                <label>Vehicle Type</label>
                <select>
                  <option>Box Truck</option>
                  <option>Refrigerated</option>
                  <option>Flatbed</option>
                </select>
              </div>

              <div className="input-field">
                <label>Primary Service Route </label>
                <div className="input-with-icon">
                  
                  <input type="text" placeholder="e.g. Hyderabad to Chennai" />
                </div>
              </div>

              <div className="input-field">
                <label>Price per KM (₹)</label>
                <input type="number" placeholder="30" />
              </div>

              <button className="submit-btn">
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
                <div key={truck.id} className="truck-wrapper">
                    <div  className={`truck-card-mini `} >
                    <div className="truck-card-top">
                        <span className="truck-tag">{truck.id}</span>
                        <span className={`status-pill ${truck.status.toLowerCase().replace(' ', '-')}`}>
                        {truck.status}
                        </span>
                    </div>
                    <div className="truck-card-details">
                        <p><strong>{truck.route}</strong></p>
                        <div className="specs">
                        <span>{truck.capKg}kg</span>
                        <span>{truck.capM3}m^3</span>
                        <span>₹{truck.cost}/km</span>
                        </div>
                    </div>
                    </div>    
                </div>   
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TruckDashboard;