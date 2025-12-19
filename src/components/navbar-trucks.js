import React from "react";
import {Truck, LogOut, Bell, User, BarChart3, Leaf, CheckCircle, AlertCircle } from 'lucide-react'
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import '../styles/navbar-trucks.css'

const Navbar = ()=> {
    const navigate = useNavigate();
    const [verifyingShipment, setVerifyingShipment] = useState(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const [showNotifs, setShowNotifs] = useState(false);
    const notifRef = useRef(null);

    const [notifications, setNotifications] = useState([
        { id: 1, shipment: 'S104', truck: 'T101', weight: 800, vol: 10, dest: 'Chennai', deadline: '20-Dec', boxes: 45 },
        { id: 2, shipment: 'S105', truck: 'T103', weight: 1200, vol: 15, dest: 'Bangalore', deadline: '21-Dec', boxes: 60 },
        { id: 3, shipment: 'S106', truck: 'T101', weight: 500, vol: 5, dest: 'Mumbai', deadline: '22-Dec', boxes: 20 },
        { id: 4, shipment: 'S107', truck: 'T102', weight: 900, vol: 12, dest: 'Delhi', deadline: '23-Dec', boxes: 50 },
        { id: 5, shipment: 'S104', truck: 'T101', weight: 800, vol: 10, dest: 'Chennai', deadline: '20-Dec', boxes: 45 },
        { id: 6, shipment: 'S104', truck: 'T101', weight: 800, vol: 10, dest: 'Chennai', deadline: '20-Dec', boxes: 45 },
        { id: 7, shipment: 'S104', truck: 'T101', weight: 800, vol: 10, dest: 'Chennai', deadline: '20-Dec', boxes: 45 },
        { id: 8, shipment: 'S104', truck: 'T101', weight: 800, vol: 10, dest: 'Chennai', deadline: '20-Dec', boxes: 45 },
        { id: 9, shipment: 'S104', truck: 'T101', weight: 800, vol: 10, dest: 'Chennai', deadline: '20-Dec', boxes: 45 },
    ]);

    const handleAction = (id, type) => {
        if (type === 'accept') setFeedbackMsg("Thank you for accepting!");
        else setFeedbackMsg("Will inform the shipment owner to find another truck.");
        
        setTimeout(() => {
        setNotifications(notifications.filter(n => n.id !== id));
        setVerifyingShipment(null);
        setFeedbackMsg("");
        }, 2000);
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
                <div className="nav-brand">
                    <div className="logo-icon"><Truck size={24} color="white" /></div>
                    <span>SmartTruck <small>Optimizer</small></span>
                </div>
                
                <div className="nav-actions">
                    <button className="metric-badge eco"><Leaf size={16} />CO2 saved</button>
                    <button className="metric-badge stats"><BarChart3 size={16} /> Analytics</button>
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
                                {notifications.map((n) => (
                                <div key={n.id} className="notif-item">
                                    <p>Shipment <strong>{n.shipment}</strong> requested truck <strong>{n.truck}</strong></p>
                                    <button className="verify-btn" onClick={() => setVerifyingShipment(n)}>Verify</button>
                                </div>
                                ))}
                            </div>
                            </div>
                        )}
                    </div>
                    <User size={20} className="action-icon" onClick={() => navigate('/profile')} />
                    <button className="logout-pill"><LogOut size={16} /> Logout</button>
                    </div>
                </div>
                </div>
            </nav>
            {verifyingShipment && (
                <div className="modal-overlay blur-bg intense">
                <div className="verification-box glass-card">
                    {feedbackMsg ? (
                    <div className="feedback-view">
                        {feedbackMsg.includes("Thank") ? <CheckCircle color="#2d6a4f" size={48} /> : <AlertCircle color="#e53e3e" size={48} />}
                        <p>{feedbackMsg}</p>
                    </div>
                    ) : (
                    <>
                        <h3>Verify Shipment {verifyingShipment.shipment}</h3>
                        <div className="details-grid">
                        <div className="detail-col">
                            <h4>Shipment Details</h4>
                            <p>Weight: {verifyingShipment.weight}kg</p>
                            <p>Volume: {verifyingShipment.vol}m³</p>
                            <p>Destination: {verifyingShipment.dest}</p>
                            <p>Boxes: {verifyingShipment.boxes}</p>
                            <p>Deadline: {verifyingShipment.deadline}</p>
                        </div>
                        <div className="detail-col">
                            <h4>Truck {verifyingShipment.truck} Details</h4>
                            <p>Capacity: 3000kg</p>
                            <p>Route: Hyderabad → {verifyingShipment.dest}</p>
                        </div>
                        </div>
                        <div className="verify-actions">
                        <button className="btn-decline" onClick={() => handleAction(verifyingShipment.id, 'reject')}>Decline</button>
                        <button className="btn-confirm" onClick={() => handleAction(verifyingShipment.id, 'accept')}>Accept</button>
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