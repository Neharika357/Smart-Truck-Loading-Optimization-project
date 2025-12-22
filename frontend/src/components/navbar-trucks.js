import React from "react";
import axios from "axios";
import { Truck, LogOut, Bell, User, BarChart3, Leaf, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import '../styles/navbar-trucks.css'

const Navbar = ({username})=> {
    const navigate = useNavigate();
    const [verifyingShipment, setVerifyingShipment] = useState(null); 
    const [shipmentDetails, setShipmentDetails] = useState(null);
    const [truckDetails, setTruckDetails] = useState(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const [showNotifs, setShowNotifs] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notifRef = useRef(null);

    const activeDealer = username; 

    const fetchNotifs = async () => {
        try {
            const res = await axios.get(`https://smart-truck-loading-optimization-project.onrender.com/dealer-requests/${activeDealer}`);
            if (res.data) {
                setNotifications(res.data);
            }
        } catch (err) {
            console.log("Error fetching dealer notifications");
        }
    };

    useEffect(() => {
        fetchNotifs(); 
        const interval = setInterval(fetchNotifs, 30000);
        return () => clearInterval(interval);
    }, [activeDealer]);
    
    const handleVerifyClick = async (notif) => {
        try {
            const [shipmentRes, truckRes] = await Promise.all([
                axios.get(`https://smart-truck-loading-optimization-project.onrender.com/shipment-details/${notif.sid}`),
                axios.get(`https://smart-truck-loading-optimization-project.onrender.com/truck-details/${notif.tid}`)
            ]);
            
            setShipmentDetails(shipmentRes.data);
            setTruckDetails(truckRes.data);
            setVerifyingShipment(notif);
        } catch (err) {
            alert("Error fetching verification details");
        }
    };

    const handleAction = async (id, type, sid, tid) => {
        const endpoint = type === 'accept' ? '/accept-order' : '/decline-request';
        
        try {
            await axios.post(`https://smart-truck-loading-optimization-project.onrender.com${endpoint}`, { sid, tid });

            if (type === 'accept') setFeedbackMsg("Thank you for accepting!");
            else setFeedbackMsg("Will inform the shipment owner to find another truck.");
            
            setTimeout(() => {
                setNotifications([]); 
                setVerifyingShipment(null);
                setShipmentDetails(null);
                setTruckDetails(null);
                setFeedbackMsg("");
            }, 2000);
        } catch (err) {
            alert("Action failed. Please try again.");
        }
    };

    const handleDeleteOrder = async (sid, tid, status) => {
        const confirmDelete = window.confirm(`Are you sure you want to clear the record for Shipment ${sid}?`);
        if (!confirmDelete) return;

        try {
            const res = await axios.delete(`https://smart-truck-loading-optimization-project.onrender.com/delete-dealer-order-request`, {
                data: { sid, tid , status} 
            });

            if (res.status === 200) {
                setNotifications(prev => prev.filter(n => !(n.sid === sid && n.tid === tid)));
            }
        } catch (err) {
            console.error("Deletion failed", err);
            alert("Failed to delete record.");
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
        if (notifRef.current && !notifRef.current.contains(event.target)) {
            setShowNotifs(false);
        }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return(
        <>
            <nav className="glass-nav">
                <div className="nav-container">
                <div className="nav-brand" onClick={() => navigate(`/dealer/${username}`)} style={{cursor: 'pointer'}}>
                    <div className="logo-icon"><Truck size={24} color="white" /></div>
                    <span>OptiTruckConnect</span>
                </div>
                
                <div className="nav-actions">
                    {/* <button className="metric-badge eco"><Leaf size={16} />CO2 saved</button>
                    <button className="metric-badge stats"><BarChart3 size={16} /> Analytics</button> */}
                    <div className="nav-divider"></div>
                    <div className="icon-group">
                    <div className="notif-wrapper" ref={notifRef}>
                        <div className="bell-container" onClick={() => setShowNotifs(!showNotifs)}>
                            <Bell className={`action-icon ${showNotifs ? 'active' : ''}`} />
                            {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
                        </div>
                        
                        {showNotifs && (
                            <div className="notif-dropdown glass-card">
                            <div className="notif-header">
                                <h4>Notifications</h4>
                            </div>
                            <div className="notif-scroll-area">
                                {notifications.length === 0 ? (
                                    <div className="notif-empty">No active records</div>
                                ) : (
                                    notifications.map((n) => (
                                        <div key={n._id} className="notif-item">
                                            <div className={`status-badge-corner ${n.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                                {n.status}
                                            </div>
                                            <div className="notif-body">
                                                <div className="notif-text">
                                                    {n.status === "Requested" ? (
                                                        <p>Truck <strong>{n.tid}</strong> was requested by Shipment <strong>{n.sid}</strong></p>
                                                    ) : (
                                                        <>
                                                            <p>Shipment <strong>{n.sid}</strong> status updated to <strong>{n.status}</strong></p>
                                                            <span className="shipment-subtext">Truck: {n.tid}</span>
                                                        </>
                                                    )}
                                                </div>

                                                {n.status === "Requested" && (
                                                    <div className="notif-actions">
                                                        <button className="verify-btn" onClick={() => handleVerifyClick(n)}>Verify</button>
                                                    </div>
                                                )}

                                                {n.status === "Delivered" && (
                                                    <button 
                                                        className="delete-trigger" 
                                                        onClick={() => handleDeleteOrder(n.sid, n.tid, n.status)}
                                                        title="Clear Record"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            </div>
                        )}
                    </div>
                    <User size={20} className="action-icon" onClick={() => navigate(`/profile/${activeDealer}`)} />
                    {/* <button className="logout-pill"><LogOut size={16} /> Logout</button> */}
                    <button 
                        className="logout-pill" 
                        onClick={() => navigate('/')} 
                    >
                        <LogOut size={16} /> Logout
                    </button>
                    </div>
                </div>
                </div>
            </nav>
           {verifyingShipment && shipmentDetails && truckDetails && (
            <div className="modal-overlay blur-bg intense">
                <div className="verification-box glass-card">
                    {feedbackMsg ? (
                        <div className="feedback-view">
                            {feedbackMsg.includes("Thank") ? 
                                <CheckCircle color="#2d6a4f" size={48} /> : 
                                <AlertCircle color="#e53e3e" size={48} />
                            }
                            <p>{feedbackMsg}</p>
                        </div>
                    ) : (
                        <>
                            <h3>Verify Shipment {shipmentDetails.sid}</h3>
                            <div className="details-grid">
                                <div className="detail-col">
                                    <h4>Shipment Details</h4>
                                    <p>Weight: {shipmentDetails.weight}kg</p>
                                    <p>Volume: {shipmentDetails.volume}m³</p>
                                    <p>Origin: {shipmentDetails.origin}</p>
                                    <p>Destination: {shipmentDetails.destination}</p>
                                    <p>Deadline: {new Date(shipmentDetails.deadline).toLocaleDateString()}</p>
                                </div>
                                <div className="detail-col">
                                    <h4>Truck {truckDetails.truckId} Details</h4>
                                    <p>Capacity: {truckDetails.capacityWeight}kg</p>
                                    <p>Type: {truckDetails.truckType}</p>
                                    <p>Route: {truckDetails.route.from} → {truckDetails.route.to}</p>
                                    <p>Rate: ₹{truckDetails.pricePerKm}/km</p>
                                </div>
                            </div>
                            <div className="verify-actions">
                                <button 
                                    className="btn-decline" 
                                    onClick={() => handleAction(verifyingShipment._id, 'reject', shipmentDetails.sid, truckDetails.truckId)}
                                >
                                    Decline
                                </button>
                                <button 
                                    className="btn-confirm" 
                                    onClick={() => handleAction(verifyingShipment._id, 'accept', shipmentDetails.sid, truckDetails.truckId)}
                                >
                                    Accept
                                </button>
                            </div>
                        </>
                    )}
                </div>
             </div>
            )}
        </> 
    );
};

export default Navbar;