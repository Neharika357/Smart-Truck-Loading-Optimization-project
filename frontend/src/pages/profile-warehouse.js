import React, { useState, useEffect } from 'react';
import { Warehouse, Package, TrendingUp, Clock, History, ChevronRight, ExternalLink, MapPin, Box } from 'lucide-react';
import '../styles/profile-warehouse.css'; 
import Navbar from '../components/navbar-shipment';

const CURRENT_USER = "Warehouse1"; // Make sure this matches your logged-in user

const WarehouseProfile = () => {
  const [showAllHistory, setShowAllHistory] = useState(false);

  // 1. Changed to allow updates (setUserInfo)
  const [userInfo, setUserInfo] = useState({
    name: "Central Hub Hyderabad",
    email: "manager.hyd@smarttruck.com",
    location: "Hyderabad, Telangana",
    totalCapacity: "15,000 m³",
    utilization: "82%",
    pendingRequests: 0 // We will update this dynamically
  });

  const [storageStats] = useState([
    { type: "Dry Goods Zone", count: "4,500 m³", category: "General" },
    { type: "Cold Storage A", count: "1,200 m³", category: "Perishable" },
    { type: "Secure Vault", count: "800 m³", category: "High Value" },
    { type: "Docking Bay", count: "12 Trucks", category: "Active" }
  ]);

  // 2. Changed to empty array initially, and added setShipmentHistory
  const [shipmentHistory, setShipmentHistory] = useState([]);

  // 3. New Effect to Fetch Real Data from Database
  useEffect(() => {
    fetchRealOrders();
  }, []);

  const fetchRealOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/get-shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: CURRENT_USER })
      });

      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        // Map Database fields to UI fields
        const formattedData = data.map(item => ({
          id: item.sid,
          type: "General Cargo", // Backend doesn't have 'type' yet, so we use a default
          route: `${item.origin} → ${item.destination}`,
          status: item.status,
          date: new Date(item.deadline).toLocaleDateString(), // displaying deadline or created date
          weight: `${item.weight} kg`
        }));

        setShipmentHistory(formattedData);

        // Update pending requests count based on real data
        setUserInfo(prev => ({
          ...prev,
          pendingRequests: formattedData.filter(s => s.status === 'Pending' || s.status === 'Requested').length
        }));
      }
    } catch (error) {
      console.error("Error fetching profile history:", error);
    }
  };

  const visibleHistory = showAllHistory ? shipmentHistory : shipmentHistory.slice(0, 4);

  return (
    <div className="profile-wrapper">
      <Navbar notifications={[]} /> 

      <main className="profile-main">
        <header className="profile-hero">
          <div className="hero-content">
            <div className="profile-avatar">
              <div className="avatar-inner" style={{ background: 'linear-gradient(135deg, #10b981, #064e3b)' }}>
                {userInfo.name.charAt(0)}
              </div>
              <div className="online-indicator"></div>
            </div>
            <div className="hero-details">
              <h1>{userInfo.name}</h1>
              <div className="hero-badges">
                <span className="badge-item"><MapPin size={14} /> {userInfo.location}</span>
                <span className="badge-item"><Box size={14} /> Warehouse ID: #WH-HYD-01</span>
              </div>
            </div>
          </div>
          <button className="edit-profile-btn">Edit Details</button>
        </header>

        <section className="dashboard-grid-row">
          <div className="stat-card-pro">
            <div className="stat-icon-wrap blue"><Warehouse size={24} /></div>
            <div className="stat-info">
              <label>Total Capacity</label>
              <h3>{userInfo.totalCapacity}</h3>
            </div>
          </div>
          <div className="stat-card-pro">
            <div className="stat-icon-wrap emerald"><TrendingUp size={24} /></div>
            <div className="stat-info">
              <label>Space Utilized</label>
              <h3>{userInfo.utilization}</h3>
            </div>
          </div>
          <div className="stat-card-pro">
            <div className="stat-icon-wrap forest"><Clock size={24} /></div>
            <div className="stat-info">
              <label>Pending Actions</label>
              <h3>{userInfo.pendingRequests}</h3>
            </div>
          </div>
        </section>

        <div className="content-split">
          <section className="glass-panel fleet-overview">
            <div className="panel-header">
              <h3>Storage Breakdown</h3>
              <Package size={18} className="header-icon" />
            </div>
            <div className="fleet-grid">
              {storageStats.map((item, i) => (
                <div key={i} className="fleet-item-pro">
                  <div className="fleet-info">
                    <span className="fleet-name">{item.type}</span>
                    <span className="fleet-cat">{item.category}</span>
                  </div>
                  <span className="fleet-badge" style={{ background: '#10b981' }}>{item.count}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel recent-orders">
            <div className="panel-header">
              <h3>Recent Activity Log</h3>
              <History size={18} className="header-icon" />
            </div>
            <div className="activity-timeline">
              {/* If history is empty, show a message */}
              {shipmentHistory.length === 0 ? (
                <p style={{padding:'20px', color:'#fff'}}>No recent activity found.</p>
              ) : (
                shipmentHistory.slice(0, 4).map((s) => (
                  <div key={s.id} className="timeline-item">
                    <div className="timeline-marker" style={{ background: '#10b981' }}></div>
                    <div className="timeline-content">
                      <p>Shipment <strong>#{s.id}</strong> marked as <strong>{s.status}</strong></p>
                      <span className="timeline-date">{s.date} • {s.route}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="glass-panel history-table-section">
          <div className="panel-header">
            <h3>Shipment Management History</h3>
            <button className="view-all-trigger" onClick={() => setShowAllHistory(!showAllHistory)}>
              {showAllHistory ? "Collapse View" : "View Full History"} 
              <ChevronRight size={16} className={showAllHistory ? "rotate-icon" : ""} />
            </button>
          </div>

          <div className="table-wrapper">
            <table className="pro-table">
              <thead>
                <tr>
                  <th>Shipment ID</th>
                  <th>Cargo Type</th>
                  <th>Route / Destination</th>
                  <th>Status</th>
                  <th>Log Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleHistory.map((s) => (
                  <tr key={s.id}>
                    <td className="bold">#{s.id}</td>
                    <td>
                        <div style={{display:'flex', flexDirection:'column'}}>
                            <span style={{fontWeight:'600'}}>{s.type}</span>
                            <span style={{fontSize:'11px', color:'#718096'}}>{s.weight}</span>
                        </div>
                    </td>
                    <td>{s.route}</td>
                    <td>
                      <div className="status-container">
                        <span className={`status-pill-pro ${s.status.toLowerCase().replace(/\s/g, '-')}`}>
                          {s.status}
                        </span>
                      </div>
                    </td>
                    <td className="date-cell">{s.date}</td>
                    <td className="action-cell">
                      <button className="row-action-btn" title="View Details">
                        <ExternalLink size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default WarehouseProfile;