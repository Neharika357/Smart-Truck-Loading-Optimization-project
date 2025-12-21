import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Truck, LogOut, Bell, User, Trash2 } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import '../styles/navbar-shipments.css'; 

const Navbar = () => {
    const navigate = useNavigate();
    const [showNotifs, setShowNotifs] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notifRef = useRef(null);

    const CURRENT_USER = "Warehouse1";

    const fetchNotifications = async () => {
        try {
        const response = await fetch(`http://localhost:5000/warehouse-orders/${CURRENT_USER}`);
        const data = await response.json();
        if (response.ok) {
            const formattedNotifs = data.map(order => ({
            id: order._id,
            sid: order.sid,
            tid: order.tid,
            status: order.status, // Requested, Assigned, In Transit, etc.
            time: new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setNotifications(formattedNotifs);
        }
        } catch (error) {
        console.error("Error fetching notifications:", error);
        }
    };

    const handleDeleteOrder = async (sid, tid) => {
        const confirmDelete = window.confirm(`Are you sure you want to clear the record for Shipment ${sid}?`);
        if (!confirmDelete) return;

        try {
            const res = await axios.delete(`http://localhost:5000/delete-warehouse-order-request`, {
                data: { sid, tid } 
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

    useEffect(() => {
        fetchNotifications();
      }, []);

    useEffect(() => {
        const interval = setInterval(() => {
        fetchNotifications();
        }, 30000); 
        return () => clearInterval(interval);
    }, []);

    return (
        <nav className="glass-nav">
            <div className="nav-container">
                
                <div className="nav-brand" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
                    <div className="logo-icon"><Truck size={24} color="white" /></div>
                    <span>SmartTruck <small>Optimizer</small></span>
                </div>
                
                <div className="nav-actions">
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
                                            <div className="notif-item"><p>No new notifications</p></div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div key={n.id} className="notif-item">
                                                    <div className={`status-badge-corner ${n.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                                        {n.status}
                                                    </div>

                                                    <div className="notif-content">
                                                        <p>Shipment <strong>{n.sid}</strong> status updated for Truck <strong>{n.tid}</strong></p>
                                                        <span className="shipment-subtext">Last update: {n.time}</span>
                                                    </div>

                                                    {(n.status === "Accepted" || n.status === "Delivered") && (
                                                        <button 
                                                            className="delete-trigger-btn"
                                                            onClick={() => handleDeleteOrder(n.sid, n.tid)}
                                                            title="Dismiss"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <User size={20} className="action-icon" onClick={() => navigate('/user')} />
                        
                        <button className="logout-pill"><LogOut size={16} /> Logout</button>
                    </div>
                </div>
            </div>
        </nav>
    );
};


export default Navbar;