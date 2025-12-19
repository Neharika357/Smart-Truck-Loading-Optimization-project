import React, { useState } from 'react';
import { Warehouse, Package, TrendingUp, Clock, History, ChevronRight, ExternalLink, MapPin, Box } from 'lucide-react';
import '../styles/profile-warehouse.css'; // Uses the same CSS file as the truck page
import Navbar from '../components/navbar-shipment';

const WarehouseProfile = () => {
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Warehouse specific user info
  const [userInfo] = useState({
    name: "Central Hub Hyderabad",
    email: "manager.hyd@smarttruck.com",
    location: "Hyderabad, Telangana",
    totalCapacity: "15,000 m³",
    utilization: "82%",
    pendingRequests: 14
  });

  // Storage Type Breakdown (Replaces Fleet Composition)
  const [storageStats] = useState([
    { type: "Dry Goods Zone", count: "4,500 m³", category: "General" },
    { type: "Cold Storage A", count: "1,200 m³", category: "Perishable" },
    { type: "Secure Vault", count: "800 m³", category: "High Value" },
    { type: "Docking Bay", count: "12 Trucks", category: "Active" }
  ]);

  // Shipment History Data
  const [shipmentHistory] = useState([
    { id: "S124", type: "Electronics", route: "Hyd → Mumbai", status: "Processing", date: "19 Dec 2025", weight: "750 kg" },
    { id: "S123", type: "Textiles", route: "Hyd → Delhi", status: "Dispatched", date: "18 Dec 2025", weight: "1200 kg" },
    { id: "S119", type: "Perishables", route: "Chennai → Hyd", status: "Stored", date: "17 Dec 2025", weight: "500 kg" },
    { id: "S115", type: "Auto Parts", route: "B'lore → Hyd", status: "Inbound", date: "16 Dec 2025", weight: "2100 kg" },
    { id: "S112", type: "Furniture", route: "Hyd → Pune", status: "Dispatched", date: "15 Dec 2025", weight: "900 kg" },
    { id: "S108", type: "Chemicals", route: "Hyd → Vizag", status: "Processing", date: "14 Dec 2025", weight: "1400 kg" },
    { id: "S108", type: "Chemicals", route: "Hyd → Vizag", status: "Processing", date: "14 Dec 2025", weight: "1400 kg" },
  ]);

  const visibleHistory = showAllHistory ? shipmentHistory : shipmentHistory.slice(0, 4);

  return (
    <div className="profile-wrapper">
      <Navbar notifications={[]} /> 

      <main className="profile-main">
        {/* Header Profile Section */}
        <header className="profile-hero">
          <div className="hero-content">
            <div className="profile-avatar">
              {/* Changed color gradient to match Green theme more closely if desired */}
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

        {/* Stats Grid - Adapted for Warehouse */}
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

        {/* Split Section: Storage Breakdown & Recent Activity */}
        <div className="content-split">
          
          {/* Left Panel: Storage Types */}
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

          {/* Right Panel: Recent Activity Timeline */}
          <section className="glass-panel recent-orders">
            <div className="panel-header">
              <h3>Recent Activity Log</h3>
              <History size={18} className="header-icon" />
            </div>
            <div className="activity-timeline">
              {shipmentHistory.slice(0, 4).map((s) => (
                <div key={s.id} className="timeline-item">
                  <div className="timeline-marker" style={{ background: '#10b981' }}></div>
                  <div className="timeline-content">
                    <p>Shipment <strong>#{s.id}</strong> marked as <strong>{s.status}</strong></p>
                    <span className="timeline-date">{s.date} • {s.route}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Main Data Table: Shipment History */}
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