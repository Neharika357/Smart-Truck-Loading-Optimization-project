import React, { useState } from 'react';
import { Truck, BarChart3, Mail, Package, ClipboardList, ChevronRight, ExternalLink } from 'lucide-react';
import '../styles/profile-trucks.css';
import Navbar from '../components/navbar-trucks';

const Profile = () => {
  const [showAllOrders, setShowAllOrders] = useState(false);

  const [dealerInfo] = useState({
    name: "TruckDealer123",
    email: "dealer122@email.com",
    location: "Hyderabad, India",
    totalTrucks: 56,
    available: 34,
    totalOrders: 128
  });

  const [fleet] = useState([
    { type: "Freightliner Cascadia", count: 26, category: "Heavy Duty" },
    { type: "Kenworth T680", count: 8, category: "Long Haul" },
    { type: "Peterbilt 579", count: 6, category: "Medium Duty" },
    { type: "Volvo VNL", count: 4, category: "Heavy Duty" }
  ]);

  const [orderAssignments] = useState([
    { id: "127", trucks: 5, warehouse: "Warehouse A", status: "Dispatched", date: "18 Dec 2025" },
    { id: "126", trucks: 8, warehouse: "Warehouse B", status: "In Transit", date: "17 Dec 2025" },
    { id: "125", trucks: 12, warehouse: "Warehouse C", status: "Delivered", date: "15 Dec 2025" },
    { id: "124", trucks: 7, warehouse: "Warehouse D", status: "Dispatched", date: "14 Dec 2025" },
    { id: "123", trucks: 4, warehouse: "Warehouse A", status: "Delivered", date: "12 Dec 2025" },
    { id: "122", trucks: 6, warehouse: "Warehouse E", status: "In Transit", date: "10 Dec 2025" },
    { id: "122", trucks: 6, warehouse: "Warehouse E", status: "In Transit", date: "10 Dec 2025" },
    { id: "122", trucks: 6, warehouse: "Warehouse E", status: "In Transit", date: "10 Dec 2025" },
    { id: "122", trucks: 6, warehouse: "Warehouse E", status: "In Transit", date: "10 Dec 2025" },
    { id: "122", trucks: 6, warehouse: "Warehouse E", status: "In Transit", date: "10 Dec 2025" },
  ]);

  const visibleOrders = showAllOrders ? orderAssignments : orderAssignments.slice(0, 4);

  return (
    <div className="profile-wrapper">
     <Navbar />

      <main className="profile-main">
        {/* Header Profile Section */}
        <header className="profile-hero">
          <div className="hero-content">
            <div className="profile-avatar">
              <div className="avatar-inner">{dealerInfo.name.charAt(0)}</div>
              <div className="online-indicator"></div>
            </div>
            <div className="hero-details">
              <h1>{dealerInfo.name}</h1>
              <div className="hero-badges">
                <span className="badge-item"><Mail size={14} /> {dealerInfo.email}</span>
              </div>
            </div>
          </div>
          <button className="edit-profile-btn">Edit Profile</button>
        </header>

        {/* Stats Grid */}
        <section className="dashboard-grid-row">
          <div className="stat-card-pro">
            <div className="stat-icon-wrap blue"><Truck size={24} /></div>
            <div className="stat-info">
              <label>Total Fleet</label>
              <h3>{dealerInfo.totalTrucks}</h3>
            </div>
          </div>
          <div className="stat-card-pro">
            <div className="stat-icon-wrap emerald"><Package size={24} /></div>
            <div className="stat-info">
              <label>Available Trucks</label>
              <h3>{dealerInfo.available}</h3>
            </div>
          </div>
          <div className="stat-card-pro">
            <div className="stat-icon-wrap forest"><ClipboardList size={24} /></div>
            <div className="stat-info">
              <label>Orders Completed</label>
              <h3>{dealerInfo.totalOrders}</h3>
            </div>
          </div>
        </section>

        {/* Fleet and Activity Split */}
        <div className="content-split">
          <section className="glass-panel fleet-overview">
            <div className="panel-header">
              <h3>Fleet Composition</h3>
              <BarChart3 size={18} className="header-icon" />
            </div>
            <div className="fleet-grid">
              {fleet.map((f, i) => (
                <div key={i} className="fleet-item-pro">
                  <div className="fleet-info">
                    <span className="fleet-name">{f.type}</span>
                    <span className="fleet-cat">{f.category}</span>
                  </div>
                  <span className="fleet-badge">{f.count}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel recent-orders">
            <div className="panel-header">
              <h3>Recent Order Highlights</h3>
              <ClipboardList size={18} className="header-icon" />
            </div>
            <div className="activity-timeline">
              {orderAssignments.slice(0, 4).map((o) => (
                <div key={o.id} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <p>Order <strong>#{o.id}</strong> assigned to <strong>{o.warehouse}</strong></p>
                    <span className="timeline-date">{o.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Main Data Table */}
        <section className="glass-panel history-table-section">
          <div className="panel-header">
            <h3>Order Assignment History</h3>
            <button className="view-all-trigger" onClick={() => setShowAllOrders(!showAllOrders)}>
              {showAllOrders ? "Collapse View" : "View All History"} 
              <ChevronRight size={16} className={showAllOrders ? "rotate-icon" : ""} />
            </button>
          </div>

          <div className="table-wrapper">
            <table className="pro-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Fleet Size</th>
                  <th>Destination/Warehouse</th>
                  <th>Current Status</th>
                  <th>Log Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleOrders.map((o) => (
                  <tr>
                    <td className="bold">#{o.id}</td>
                    <td>{o.trucks} Vehicles</td>
                    <td>{o.warehouse}</td>
                    <td>
                      <div className="status-container">
                        <span className={`status-pill-pro ${o.status.toLowerCase().replace(/\s/g, '-')}`}>
                          {o.status}
                        </span>
                      </div>
                    </td>
                    <td className="date-cell">{o.date}</td>
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

export default Profile;