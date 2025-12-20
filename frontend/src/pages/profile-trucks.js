import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, BarChart3, Mail, Package, ClipboardList, ChevronRight, ExternalLink, MapPin, X, Weight, Ruler, Calendar } from 'lucide-react';
import '../styles/profile-trucks.css';
import Navbar from '../components/navbar-trucks';

const Profile = () => {
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // State for dynamic data
  const [dealerInfo, setDealerInfo] = useState({
    name: "Loading...",
    email: "...",
    location: "Fetching location...",
    totalTrucks: 0,
    available: 0,
    totalOrders: 0
  });

  const [fleetStats, setFleetStats] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);

  const CURRENT_USER = "TruckDealer1"; // This should ideally come from Auth context

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const truckRes = await axios.get(`http://localhost:5000/truck?username=${CURRENT_USER}`);
        const trucks = truckRes.data;

        const orderRes = await axios.get(`http://localhost:5000/accepted-orders/dealer/${CURRENT_USER}`);
        const orders = orderRes.data;

        const composition = trucks.reduce((acc, truck) => {
          const type = truck.truckType || "Standard";
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});

        const fleetArray = Object.keys(composition).map(key => ({
          type: key,
          count: composition[key],
          category: key === "Box Truck" ? "Medium Duty" : "Heavy Duty"
        }));

        setDealerInfo({
          name: CURRENT_USER,
          email: `${CURRENT_USER.toLowerCase()}@smarttruck.com`,
          location: trucks.length > 0 ? trucks[0].route.from : "Remote",
          totalTrucks: trucks.length,
          available: trucks.filter(t => t.status === "Available").length,
          totalOrders: orders.length
        });

        setFleetStats(fleetArray);
        setOrderHistory(orders);
        setLoading(false);
      } catch (err) {
        console.error("Error loading profile:", err);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [CURRENT_USER]);

  const handleOpenModal = async (order) => {
    setModalLoading(true);
    try {
      const [shipRes, truckRes] = await Promise.all([
        axios.get(`http://localhost:5000/shipment-details/${order.sid}`),
        axios.get(`http://localhost:5000/truck-details/${order.tid}`)
      ]);
      setSelectedOrder({
        ...order,
        shipmentDetails: shipRes.data,
        truckDetails: truckRes.data
      });
    } catch (err) {
      alert("Could not fetch original details");
    } finally {
      setModalLoading(false);
    }
  };

  const visibleOrders = showAllOrders ? orderHistory : orderHistory.slice(0, 4);

  if (loading) return <div className="loading-screen">Loading Profile...</div>;

  return (
    <div className="profile-wrapper">
      <Navbar />

      <main className="profile-main">
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
                <span className="badge-item"><MapPin size={14} /> {dealerInfo.location}</span>
              </div>
            </div>
          </div>
          <button className="edit-profile-btn">Edit Profile</button>
        </header>

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
              <label>Total Assignments</label>
              <h3>{dealerInfo.totalOrders}</h3>
            </div>
          </div>
        </section>

        <div className="content-split">
          <section className="glass-panel fleet-overview">
            <div className="panel-header">
              <h3>Fleet Composition</h3>
              <BarChart3 size={18} className="header-icon" />
            </div>
            <div className="fleet-grid">
              {fleetStats.map((f, i) => (
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
              <h3>Recent Activity</h3>
              <ClipboardList size={18} className="header-icon" />
            </div>
            <div className="activity-timeline">
              {orderHistory.length === 0 ? <p className="empty-msg">No recent activity</p> : 
               orderHistory.slice(0, 4).map((o) => (
                <div key={o._id} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <p>Shipment <strong>{o.sid}</strong> linked to Truck <strong>{o.tid}</strong></p>
                    <span className="timeline-date">{new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

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
                  <th>Shipment ID</th>
                  <th>Truck ID</th>
                  <th>Current Status</th>
                  <th>Assignment Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleOrders.map((o) => (
                  <tr key={o._id}>
                    <td className="bold">#{o.sid}</td>
                    <td>{o.tid}</td>
                    <td>
                      <div className="status-container">
                        <span className={`status-pill-pro ${o.status.toLowerCase().replace(/\s/g, '-')}`}>
                          {o.status}
                        </span>
                      </div>
                    </td>
                    <td className="date-cell">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="action-cell">
                      <button className="row-action-btn" onClick={() => handleOpenModal(o)}>
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
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assignment Detailed View</h3>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}><X size={20}/></button>
            </div>
            
            <div className="modal-body">
              {/* Shipment Section */}
              <div className="detail-section">
                <div className="section-title"><Package size={16}/> Shipment Data</div>
                <div className="data-grid">
                  <div className="data-item"><label>Route</label><p>{selectedOrder.shipmentDetails?.origin} → {selectedOrder.shipmentDetails?.destination}</p></div>
                  <div className="data-item"><label>Weight</label><p><Weight size={12}/> {selectedOrder.shipmentDetails?.weight} kg</p></div>
                  <div className="data-item"><label>Volume</label><p><Ruler size={12}/> {selectedOrder.shipmentDetails?.volume} m³</p></div>
                  <div className="data-item"><label>Deadline</label><p><Calendar size={12}/> {new Date(selectedOrder.shipmentDetails?.deadline).toLocaleDateString()}</p></div>
                </div>
              </div>

              <div className="modal-divider"><span>LINKED TO</span></div>

              {/* Truck Section */}
              <div className="detail-section">
                <div className="section-title"><Truck size={16}/> Truck Data</div>
                <div className="data-grid">
                  <div className="data-item"><label>Truck ID</label><p>#{selectedOrder.truckDetails?.truckId}</p></div>
                  <div className="data-item"><label>Type</label><p>{selectedOrder.truckDetails?.truckType}</p></div>
                  <div className="data-item"><label>Max Load</label><p>{selectedOrder.truckDetails?.capacityWeight} kg</p></div>
                  <div className="data-item"><label>Rate</label><p>₹{selectedOrder.truckDetails?.pricePerKm}/km</p></div>
                </div>
              </div>

              <div className="current-status-bar">
                 Current Lifecycle Status: <strong>{selectedOrder.status}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;