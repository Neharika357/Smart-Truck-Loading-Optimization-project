import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {  Plus, Search, CheckCircle} from 'lucide-react';
import Navbar from '../components/navbar-trucks';
import '../styles/trucks.css';

const TruckDashboard = () => {
  const [trucks, setTrucks] = useState([]); 
  const [showSuccess, setShowSuccess] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All'); 
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [successMessage, setSuccessMessage] = useState({ title: "", sub: "" });
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    weight: '',
    volume: '',
    from: '',
    to: '',
    price: '',
    type: 'Box Truck'
  });

  const username = "TruckDealer1"
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

  useEffect(() => {   
    fetchTrucks();
  }, []);

  useEffect(() => {
      const interval = setInterval(() => {
        fetchTrucks();
      }, 30000); 
      return () => clearInterval(interval);
  }, []);

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:5000/create-truck', {
        ...formData,
        username: username
      });
      
      setTrucks([response.data.TrucksInfo, ...trucks]);
      setFormData({ weight: '', volume: '', from: '', to: '', price: '', type: 'Box Truck' });
      setSuccessMessage({ title: "Truck Registered!", sub: "Vehicle added to the active fleet" });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (err) {
      alert("Error: " + err);
    }
  };

  const filteredTrucks = trucks.filter(truck => {
    const matchesStatus = statusFilter === 'All' ? true : truck.status === statusFilter;

    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      truck.truckId.toLowerCase().includes(query) || 
      truck.route.from.toLowerCase().includes(query) || 
      truck.route.to.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const handleStatusUpdate = (truck) => {
    setSelectedTruck(truck);
    setIsStatusDialogOpen(true);
  };

  const handleStatusChange = async (newStatus) => {
  if (!selectedTruck) return;
  try {
    await axios.post('http://localhost:5000/update-truck-status', {
      tid: selectedTruck.truckId,
      sid: selectedTruck.assignedShipment, 
      status: newStatus
    });

    // Update local state
    setTrucks(trucks.map(t => 
      t.truckId === selectedTruck.truckId 
        ? { ...t, status: newStatus === "Delivered" ? "Available" : "In Use" } 
        : t
    ));

    // Set Dynamic Success Message
    setSuccessMessage({
      title: "Status Updated!",
      sub: `Truck ${selectedTruck.truckId} is now ${newStatus}`
    });
    
    setIsStatusDialogOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  } catch (err) {
    console.error(err);
    alert("Update failed.");
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
                <input type="text" placeholder="Search ID or Route..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
              </div>
            </div>
            <div className="filter-tabs">
              {['All', 'Available', 'In Use'].map(tab => (
                <button 
                  key={tab}
                  className={`filter-btn ${statusFilter === tab ? 'active' : ''}`}
                  onClick={() => setStatusFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
           <div className="truck-grid">
            {filteredTrucks.map((truck) => (
              <div key={truck._id} className="truck-wrapper">
                <div className={`truck-card-mini ${truck.status === 'In Use' ? 'in-use-layout' : ''}`}>
                  <div className="truck-card-top">
                    <span className="truck-tag">{truck.truckId}</span>
                    <span className={`status-pill ${truck.status.toLowerCase().replace(' ', '-')}`}>
                      {truck.status}
                    </span>
                  </div>
                  
                  <div className="truck-card-content-wrapper">
                    <div className="truck-card-details">
                      <p><strong>{truck.route.from} → {truck.route.to}</strong></p>
                      <div className="specs">
                        <span>{truck.capacityWeight}kg</span>
                        <span>{truck.capacityVolume}m³</span>
                        <span>₹{truck.pricePerKm}/km</span>
                      </div>
                    </div>

                    {truck.status === 'In Use' ? 
                      <button className="update-status-btn" onClick={() => handleStatusUpdate(truck)}>
                        Update Status
                      </button>
                    :<></>}
                  </div>
                </div>
              </div>
             ))}
            </div>
          </div>
        </section>
      </main>
      {isStatusDialogOpen && (
        <div className="modal-overlay blur-bg">
          <div className="glass-card status-dialog">
            <h3>Update Delivery Status</h3>
            <p>Current: <strong>{selectedTruck?.status}</strong></p>
            
            <div className="status-options">
              {['Assigned', 'Picked', 'In Transit', 'Delivered'].map(s => (
                <button 
                  key={s} 
                  className="status-opt-btn"
                  onClick={() => {
                    handleStatusChange(s)
                    setIsStatusDialogOpen(false);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <button className="close-btn" onClick={() => setIsStatusDialogOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
      {showSuccess && (
        <div className="modal-overlay blur-bg intense">
          <div className="verification-box glass-card feedback-popup">
            <div className="feedback-view">
              <div className="success-icon-animate">
                <CheckCircle color="#15803d" size={60} />
              </div>
              <h3 style={{ color: '#1e293b', fontSize: '1.5rem' }}>{successMessage.title}</h3>
              <p style={{ color: '#64748b', marginTop: '8px' }}>{successMessage.sub}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruckDashboard;