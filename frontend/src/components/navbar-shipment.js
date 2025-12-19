import React, { useState, useEffect, useRef } from "react";
import { Truck, LogOut, Bell, User, BarChart3, Leaf, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import '../styles/navbar-trucks.css'; // Make sure this path is correct

const Navbar = ({ notifications = [] }) => {
    const navigate = useNavigate();
    const [showNotifs, setShowNotifs] = useState(false);
    const notifRef = useRef(null);

    // Close dropdown when clicking outside
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
                
                {/* LOGO - Clicks to Home */}
                <div className="nav-brand" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
                    <div className="logo-icon"><Truck size={24} color="white" /></div>
                    <span>SmartTruck <small>Optimizer</small></span>
                </div>
                
                <div className="nav-actions">
                   
                    <div className="icon-group">
                        
                        {/* NOTIFICATIONS SECTION */}
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
                                            // YOUR NOTIFICATION LOGIC IN HER DESIGN
                                            notifications.map((notif, index) => (
                                                <div key={index} className="notif-item" style={{display:'flex', gap:'10px', alignItems:'start'}}>
                                                    {/* Icons based on type */}
                                                    <div style={{marginTop:'2px'}}>
                                                        {notif.type === 'accepted' ? 
                                                            <CheckCircle size={16} color="#10b981"/> : 
                                                            <Clock size={16} color="#f59e0b"/>
                                                        }
                                                    </div>
                                                    <div>
                                                        <p style={{margin:0, fontWeight:'bold', color:'#2d3748'}}>{notif.title}</p>
                                                        <p style={{margin:'2px 0 0 0', fontSize:'0.75rem', color:'#718096'}}>{notif.msg}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* PROFILE - Clicks to Your User Page */}
                        <User size={20} className="action-icon" onClick={() => navigate('/user')} />
                        
                        {/* LOGOUT */}
                        <button className="logout-pill"><LogOut size={16} /> Logout</button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;