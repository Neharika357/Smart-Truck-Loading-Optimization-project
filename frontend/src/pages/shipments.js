import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar-shipment';
import CreateShipment from '../components/createShipment';
import ShipmentList from '../components/shipmentList';
import TruckSelectionModal from '../components/truckSelectionModel';
import { CheckCircle } from 'lucide-react';
import '../styles/shipments.css';

const CURRENT_USER = "Warehouse1"; 

const WarehouseDashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [modalData, setModalData] = useState(null); 
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Filter State
  const [filterStatus, setFilterStatus] = useState('All'); 

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
        setShipments(data.map(item => ({ ...item, id: item.sid })));
      }
    } catch (error) {
      console.error("Server error:", error);
    }
  };

  const handleAddShipment = async (formData) => {
    // ... (Your existing Add Shipment Logic)
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
  
        if (response.ok) {
          fetchShipments(); 
          triggerFeedback("Shipment Created Successfully!");
        } else {
            alert("Error adding shipment");
        }
      } catch (error) {
        console.error("Error adding shipment:", error);
      }
  };

  const handleBookTruck = async (truckId) => {
    // ... (Your existing Book Truck Logic)
     // 1. Prepare Data
     const bookingData = { sid: modalData.id, tid: truckId };

     try {
       const response = await fetch('http://localhost:5000/request-truck', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(bookingData)
       });
 
       if (response.ok) {
         triggerFeedback(`Booking Request Sent to ${truckId}!`);
         setModalData(null); 
         fetchShipments(); 
 
         const newNotif = { 
           title: 'Request Sent', 
           msg: `Waiting for approval on ${truckId} for ${modalData.id}`, 
           type: 'pending',
           time: 'Just now'
         };
         setNotifications([newNotif, ...notifications]);
 
       } else {
         alert("Failed to send booking request.");
       }
     } catch (error) {
       console.error("Booking Error:", error);
     }
  };

  const triggerFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleFindTruck = (shipment) => {
    setModalData(shipment); 
  };

  // Filter Logic
  const filteredShipments = shipments.filter(shipment => {
    if (filterStatus === 'All') return true;
    return shipment.status === filterStatus;
  });

  return (
    <div className="dashboard-container">
      <Navbar notifications={notifications} />
      
      <div style={styles.mainContent}>
        <div style={styles.leftPanel}>
          <CreateShipment onAddShipment={handleAddShipment} />
        </div>

        <div style={styles.rightPanel}>
          
          {/* WE MOVED THE BUTTONS INSIDE THIS COMPONENT */}
          <ShipmentList 
            shipments={filteredShipments} 
            onFindTruck={handleFindTruck} 
            filterStatus={filterStatus}      // Passing state down
            setFilterStatus={setFilterStatus} // Passing "set" function down
          />
        
        </div>
      </div>

      {modalData && (
        <TruckSelectionModal 
          shipmentData={modalData} 
          onClose={() => setModalData(null)}
          onBook={handleBookTruck}
        />
      )}

      {feedbackMsg && (
        <div className="modal-overlay blur-bg intense animate-fade-in">
            {/* ... (Your existing popup logic) */}
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