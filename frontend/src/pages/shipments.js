import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar-shipment'; // Ensure capitalized if your file is Navbar.js
import CreateShipment from '../components/createShipment';
import ShipmentList from '../components/shipmentList';
import TruckSelectionModal from '../components/truckSelectionModel';
import { CheckCircle } from 'lucide-react';
import '../styles/shipments.css';

// --- 1. USER CONSTANT (Must match a user in your MongoDB) ---
const CURRENT_USER = "Warehouse1"; 

const WarehouseDashboard = () => {
  const [shipments, setShipments] = useState([]); // Start empty, load from DB
  const [notifications, setNotifications] = useState([]);
  const [modalData, setModalData] = useState(null); 
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // --- 2. FETCH DATA FROM DB ON LOAD ---
  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await fetch('http://localhost:5000/get-shipments', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: CURRENT_USER }) 
      });
      
      const data = await response.json();

      if (response.ok) {
        // Map backend 'sid' to frontend 'id'
        const formattedData = data.map(item => ({
          ...item,
          id: item.sid, 
        }));
        setShipments(formattedData);
      } else {
        console.error("Error fetching shipments:", data.error);
      }
    } catch (error) {
      console.error("Server error:", error);
    }
  };

  // --- 3. ADD SHIPMENT (CONNECTS TO BACKEND) ---
  const handleAddShipment = async (formData) => {
    try {
      const response = await fetch('http://localhost:5000/create-shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          deadline: formData.date,
          username: CURRENT_USER 
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Success! Reload data and show your nice feedback UI
        fetchShipments(); 
        triggerFeedback("Shipment Created Successfully!");
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error adding shipment:", error);
      alert("Failed to connect to server.");
    }
  };

  // Helper to show your popup for 2.5 seconds
  const triggerFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleFindTruck = (shipment) => {
    setModalData(shipment); 
  };

  // --- 4. BOOK TRUCK LOGIC (Keeps your Optimistic UI) ---
  const handleBookTruck = (truckId) => {
    // Show your nice feedback UI
    triggerFeedback(`Booking Request Sent to ${truckId}!`);
    
    // Close modal
    setModalData(null); 

    // Update Local State (Visual only, until backend is fully integrated for bookings)
    const updatedShipments = shipments.map(s => {
      if (s.id === modalData.id) {
        return { ...s, status: 'Requested', requestedTruck: truckId };
      }
      return s;
    });
    setShipments(updatedShipments);

    // Add Notification
    const newNotif = { 
      title: 'Request Sent', 
      msg: `Waiting for approval on ${truckId} for ${modalData.id}`, 
      type: 'pending',
      time: 'Just now'
    };
    setNotifications([newNotif, ...notifications]);
  };

  return (
    <div className="dashboard-container">
      <Navbar notifications={notifications} />
      
      <div style={styles.mainContent}>
        <div style={styles.leftPanel}>
          <CreateShipment onAddShipment={handleAddShipment} />
        </div>

        <div style={styles.rightPanel}>
          <ShipmentList shipments={shipments} onFindTruck={handleFindTruck} />
        </div>
      </div>

      {modalData && (
        <TruckSelectionModal 
          shipmentData={modalData} 
          onClose={() => setModalData(null)}
          onBook={handleBookTruck}
        />
      )}

      {/* YOUR NICE FEEDBACK POPUP */}
      {feedbackMsg && (
        <div className="modal-overlay blur-bg intense animate-fade-in">
          <div className="verification-box glass-card feedback-popup">
            <div className="feedback-view">
              <div className="success-icon-animate">
                <CheckCircle color="#2d6a4f" size={80} strokeWidth={1.5} />
              </div>
              <h3>Action Confirmed</h3>
              <p>{feedbackMsg}</p>
              <span className="sub-text">The system has been updated.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- YOUR ORIGINAL STYLES (Preserved) ---
const styles = {
  mainContent: {
    minHeight: 'calc(100vh - 90px)',
    justifyContent: 'top',
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '2rem',
    maxWidth: '1400px',
    margin: '2rem auto',
    padding: '0 2rem',
  },
  leftPanel: { 
    flex: '0 0 380px', 
    position: 'sticky', 
    top: '30px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'top',
    height: 'calc(100vh - 120px)',
  },
  rightPanel: { 
    flex: '1' 
  }
};

export default WarehouseDashboard;