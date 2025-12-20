import React, { useState, useEffect, useRef } from "react";
import { Truck, LogOut, Bell, User } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import '../styles/navbar-shipments.css'; 

const Navbar = ({ notifications = [] }) => {
    const navigate = useNavigate();
    const [showNotifs, setShowNotifs] = useState(false);
    const notifRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifs(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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
                                                    {/* Absolute badge pinned to corner */}
                                                    <div className={`status-badge-corner ${n.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                                        {n.status}
                                                    </div>

                                                    <div className="notif-content">
                                                        <p>Shipment <strong>{n.sid}</strong> status updated for Truck <strong>{n.tid}</strong></p>
                                                        <span className="shipment-subtext">Last update: {n.time}</span>
                                                    </div>
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