import React, { useState } from 'react';
import Navbar from '../components/navbar-shipment';
import CreateShipment from '../components/createShipment';
import ShipmentList from '../components/shipmentList';
import TruckSelectionModal from '../components/truckSelectionModel';
import { CheckCircle } from 'lucide-react';
import '../styles/shipments.css'

const WarehouseDashboard = () => {
  const [shipments, setShipments] = useState([
    { 
      id: '#S124', 
      origin: 'Hyderabad', 
      destination: 'Mumbai', 
      weight: '750', 
      volume: '8', 
      status: 'Pending' 
    },
    { 
      id: '#S123', 
      origin: 'Hyderabad', 
      destination: 'Delhi', 
      weight: '1200', 
      volume: '15', 
      status: 'Assigned', 
      assignedTruck: 'T-104' 
    },
    { 
      id: '#S124', 
      origin: 'Hyderabad', 
      destination: 'Mumbai', 
      weight: '750', 
      volume: '8', 
      status: 'Pending' 
    },
    { 
      id: '#S124', 
      origin: 'Hyderabad', 
      destination: 'Mumbai', 
      weight: '750', 
      volume: '8', 
      status: 'Pending' 
    },
    { 
      id: '#S124', 
      origin: 'Hyderabad', 
      destination: 'Mumbai', 
      weight: '750', 
      volume: '8', 
      status: 'Pending' 
    },
    { 
      id: '#S124', 
      origin: 'Hyderabad', 
      destination: 'Mumbai', 
      weight: '750', 
      volume: '8', 
      status: 'Pending' 
    },
  ]);

  const [notifications, setNotifications] = useState([
    { title: 'Truck Assigned', msg: 'Dealer approved Truck T-104 for #S123', type: 'accepted' },
    { title: 'Truck Assigned', msg: 'Dealer approved Truck T-104 for #S123', type: 'accepted' },
    { title: 'Truck Assigned', msg: 'Dealer approved Truck T-104 for #S123', type: 'accepted' },
    { title: 'Truck Assigned', msg: 'Dealer approved Truck T-104 for #S123', type: 'accepted' },
    { title: 'Truck Assigned', msg: 'Dealer approved Truck T-104 for #S123', type: 'accepted' },
    { title: 'Truck Assigned', msg: 'Dealer approved Truck T-104 for #S123', type: 'accepted' },
    { title: 'Truck Assigned', msg: 'Dealer approved Truck T-104 for #S123', type: 'accepted' },
    { title: 'Truck Assigned', msg: 'Dealer approved Truck T-104 for #S123', type: 'accepted' },
    { title: 'Truck Assigned', msg: 'Dealer approved Truck T-104 for #S123', type: 'accepted' },
    { title: 'Truck Assigned', msg: 'Dealer approved Truck T-104 for #S123', type: 'accepted' },
    { title: 'Truck Assigned', msg: 'Dealer approved Truck T-104 for #S123', type: 'accepted' }

  ]);

  const [modalData, setModalData] = useState(null); 

  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // --- LOGIC FUNCTIONS ---

  const handleAddShipment = (formData) => {
    const newShipment = {
      id: `#S${Math.floor(Math.random() * 1000)}`,
      origin: formData.origin,
      destination: formData.destination,
      weight: formData.weight,
      volume: formData.volume,
      status: 'Pending'
    };
    setShipments([newShipment, ...shipments]);
  };

  const handleFindTruck = (shipment) => {
    setModalData(shipment); 
  };

  // --- THE FIXED LOGIC IS HERE ---
  const handleBookTruck = (truckId) => {
    // 1. Show the persistent feedback UI
    setFeedbackMsg(`Booking Request Sent for ${truckId}!`);
    
    // 2. Close the selection modal immediately so it doesn't overlap
    setModalData(null); 

    // 3. Update the Shipment List status
    const updatedShipments = shipments.map(s => {
      if (s.id === modalData.id) {
        return { ...s, status: 'Requested', requestedTruck: truckId };
      }
      return s;
    });
    setShipments(updatedShipments);

    // 4. Update Notifications
    const newNotif = { 
      title: 'Request Sent', 
      msg: `Waiting for dealer approval on ${truckId} for shipment ${modalData.id}`, 
      type: 'pending',
      time: 'Just now'
    };
    setNotifications([newNotif, ...notifications]);

    // 5. Auto-dismiss the feedback overlay after 2.5 seconds
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 2500);
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
      {feedbackMsg && (
        <div className="modal-overlay blur-bg intense animate-fade-in">
          <div className="verification-box glass-card feedback-popup">
            <div className="feedback-view">
              <div className="success-icon-animate">
                <CheckCircle color="#2d6a4f" size={80} strokeWidth={1.5} />
              </div>
              <h3>Request Confirmed</h3>
              <p>{feedbackMsg}</p>
              <span className="sub-text">The truck dealer has been notified.</span>
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