import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Warehouse, Package, TrendingUp, Clock, History, 
  ChevronRight, ExternalLink, MapPin, Box, Mail, 
  X, Weight, Ruler, Calendar, Truck 
} from 'lucide-react';
import '../styles/profile-warehouse.css'; 
import Navbar from '../components/navbar-shipment';
import { useParams } from 'react-router-dom';



const WarehouseProfile = () => {
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const {username} = useParams();
  const CURRENT_USER = username; 

  // User details state
  const [userInfo, setUserInfo] = useState({
    name: CURRENT_USER,
    email: "Loading...",
    pending: 0,
    delivered: 0,
    confirmed: 0
  });

  const [shipmentHistory, setShipmentHistory] = useState([]);
  const [storageStats, setStorageStats] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Warehouse User Details (Email)
        const userRes = await axios.get(`http://localhost:5000/user/${CURRENT_USER}`);
        const userData = userRes.data[0];

        // 2. Fetch All Shipments for Stats
        const shipmentRes = await axios.post('http://localhost:5000/get-shipments', { username: CURRENT_USER });
        const shipments = shipmentRes.data;

        // 3. Fetch Accepted Orders for Activity Logs
        const logsRes = await axios.get(`http://localhost:5000/accepted-orders/warehouse/${CURRENT_USER}`);
        const logs = logsRes.data;

        // --- Logic: Calculate Stat Boxes ---
        const pending = shipments.filter(s => s.status === 'Pending' || s.status === 'Requested').length;
        const delivered = shipments.filter(s => s.status === 'Delivered').length;
        const confirmed = logs.length; // Accepted/Assigned orders

        // --- Logic: Storage Breakdown (Weight based) ---
        const breakdown = [
          { type: "Lightweight", range: "0 - 100kg", count: shipments.filter(s => s.weight <= 100).length },
          { type: "Mid-Range", range: "101 - 500kg", count: shipments.filter(s => s.weight > 100 && s.weight <= 500).length },
          { type: "Heavy Load", range: "501 - 1000kg", count: shipments.filter(s => s.weight > 500 && s.weight <= 1000).length },
          { type: "Industrial", range: "> 1000kg", count: shipments.filter(s => s.weight > 1000).length },
        ];

        setUserInfo({
          name: userData?.username || CURRENT_USER,
          email: userData?.email || "N/A",
          pending,
          delivered,
          confirmed
        });

        setStorageStats(breakdown);
        setShipmentHistory(shipments);
        setRecentLogs(logs);
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
      alert("Could not fetch details");
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) return <div className="loading-screen">Synchronizing Warehouse Data...</div>;

  const visibleHistory = showAllHistory ? shipmentHistory : shipmentHistory.slice(0, 5);

  return (
    <div className="profile-wrapper">
      <Navbar notifications={[]} /> 

      <main className="profile-main">
        <header className="profile-hero">
          <div className="hero-content">
            <div className="profile-avatar">
              <div className="avatar-inner">{userInfo.name.charAt(0)}</div>
              <div className="online-indicator"></div>
            </div>
            <div className="hero-details">
              <h1>{userInfo.name}</h1>
              <div className="hero-badges">
                <span className="badge-item"><Mail size={14} /> {userInfo.email}</span>
                <span className="badge-item"><Box size={14} /> Warehouse Partner</span>
              </div>
            </div>
          </div>
          <button className="edit-profile-btn">Manage Account</button>
        </header>

        {/* 3 STAT BOXES */}
        <section className="dashboard-grid-row">
          <div className="stat-card-pro">
            <div className="stat-icon-wrap orange"><Clock size={24} /></div>
            <div className="stat-info">
              <label>Pending Actions</label>
              <h3>{userInfo.pending}</h3>
            </div>
          </div>
          <div className="stat-card-pro">
            <div className="stat-icon-wrap emerald"><Package size={24} /></div>
            <div className="stat-info">
              <label>Delivered Goods</label>
              <h3>{userInfo.delivered}</h3>
            </div>
          </div>
          <div className="stat-card-pro">
            <div className="stat-icon-wrap blue"><TrendingUp size={24} /></div>
            <div className="stat-info">
              <label>Confirmed Orders</label>
              <h3>{userInfo.confirmed}</h3>
            </div>
          </div>
        </section>

        <div className="content-split">
          {/* STORAGE BREAKDOWN */}
          <section className="glass-panel fleet-overview">
            <div className="panel-header">
              <h3>Cargo Weight Distribution</h3>
              <Package size={18} className="header-icon" />
            </div>
            <div className="fleet-grid">
              {storageStats.map((item, i) => (
                <div key={i} className="fleet-item-pro">
                  <div className="fleet-info">
                    <span className="fleet-name">{item.type}</span>
                    <span className="fleet-cat">{item.range}</span>
                  </div>
                  <span className="fleet-badge">{item.count}</span>
                </div>
              ))}
            </div>
          </section>

          {/* RECENT ACTIVITY LOG (From Accepted Orders) */}
          <section className="glass-panel recent-orders">
            <div className="panel-header">
              <h3>Recent Logicstics Log</h3>
              <History size={18} className="header-icon" />
            </div>
            <div className="activity-timeline">
              {recentLogs.length === 0 ? (
                <p className="empty-msg">No accepted orders yet.</p>
              ) : (
                recentLogs.slice(0, 4).map((log) => (
                  <div key={log._id} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <p>Shipment <strong>#{log.sid}</strong> assigned to Truck <strong>{log.tid}</strong></p>
                      <span className="timeline-date">{new Date(log.createdAt).toLocaleDateString()} • Status: {log.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* SHIPMENT HISTORY TABLE */}
        <section className="glass-panel history-table-section">
          <div className="panel-header">
            <h3>Shipment Management History</h3>
            <button className="view-all-trigger" onClick={() => setShowAllHistory(!showAllHistory)}>
              {showAllHistory ? "Collapse" : "View All"} 
              <ChevronRight size={16} className={showAllHistory ? "rotate-icon" : ""} />
            </button>
          </div>

          <div className="table-wrapper">
            <table className="pro-table">
              <thead>
                <tr>
                  <th>Shipment ID</th>
                  <th>Load Detials</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Deadline</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleHistory.map((s) => (
                  <tr key={s._id}>
                    <td className="bold">#{s.sid}</td>
                    <td>
                        <div className="cell-stack">
                            <span className="main-text">General Cargo</span>
                            <span className="sub-text">{s.weight} kg | {s.volume} m³</span>
                        </div>
                    </td>
                    <td>{s.origin} → {s.destination}</td>
                    <td>
                      <span className={`status-pill-pro ${s.status.toLowerCase().replace(/\s/g, '-')}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="date-cell">{new Date(s.deadline).toLocaleDateString()}</td>
                    <td className="action-cell">
                      {/* Only allow detail view for items that have orders */}
                      <button 
                        className="row-action-btn" 
                        onClick={() => {
                            const order = recentLogs.find(log => log.sid === s.sid);
                            if(order) handleOpenModal(order);
                            else alert("No truck assigned to this shipment yet.");
                        }}
                      >
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

      {/* DETAIL MODAL (Matching Truck Profile Style) */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Shipment & Truck Pairing</h3>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <div className="section-title"><Package size={16}/> Shipment Details</div>
                <div className="data-grid">
                  <div className="data-item"><label>Origin</label><p>{selectedOrder.shipmentDetails?.origin}</p></div>
                  <div className="data-item"><label>Destination</label><p>{selectedOrder.shipmentDetails?.destination}</p></div>
                  <div className="data-item"><label>Load</label><p>{selectedOrder.shipmentDetails?.weight} kg / {selectedOrder.shipmentDetails?.volume} m³</p></div>
                  <div className="data-item"><label>Deadline</label><p>{new Date(selectedOrder.shipmentDetails?.deadline).toLocaleDateString()}</p></div>
                </div>
              </div>

              <div className="modal-divider"><span>TRANSPORTED BY</span></div>

              <div className="detail-section">
                <div className="section-title"><Truck size={16}/> Truck Details</div>
                <div className="data-grid">
                  <div className="data-item"><label>ID</label><p>#{selectedOrder.truckDetails?.truckId}</p></div>
                  <div className="data-item"><label>Type</label><p>{selectedOrder.truckDetails?.truckType}</p></div>
                  <div className="data-item"><label>Price/KM</label><p>₹{selectedOrder.truckDetails?.pricePerKm}</p></div>
                  <div className="data-item"><label>Status</label><p>{selectedOrder.status}</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseProfile;