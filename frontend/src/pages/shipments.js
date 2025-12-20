import React, { useState, useEffect,useRef } from 'react';
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

  const [filterStatus, setFilterStatus] = useState('All'); 

  useEffect(() => {
    fetchShipments();
    fetchNotifications();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); 
    return () => clearInterval(interval);
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

  const shipmentsRef = useRef([]);

  useEffect(() => {
    shipmentsRef.current = shipments;
  }, [shipments]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkForUpdates();
    }, 5000); 

    return () => clearInterval(interval); 
  }, []);

  const checkForUpdates = async () => {
    try {
      const response = await fetch('http://localhost:5000/get-shipments', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: CURRENT_USER }) 
      });
      const newData = await response.json();

      if (response.ok) {
        // Check for status changes
        newData.forEach(newItem => {
          // Find the same shipment in our previous data
          const oldItem = shipmentsRef.current.find(old => old.sid === newItem.sid);

          // IF it existed before AND status changed from 'Requested' to 'Assigned'
          if (oldItem && oldItem.status === 'Requested' && newItem.status === 'Assigned') {
            
            // Add to Notifications
            const newNotif = { 
              title: 'Request Accepted!', 
              msg: `Truck Dealer has accepted shipment ${newItem.sid}`, 
              type: 'success', // Green color
              time: 'Just now'
            };
            
            setNotifications(prev => [newNotif, ...prev]);
            triggerFeedback(`Shipment ${newItem.sid} is now Assigned!`);
          }
        });

        // Update the dashboard with new data
        setShipments(newData.map(item => ({ ...item, id: item.sid })));
      }
    } catch (error) {
      console.error("Polling error:", error);
    }
  };

  // --- END OF NEW CODE ---
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
         
          <ShipmentList 
            shipments={filteredShipments} 
            onFindTruck={handleFindTruck} 
            filterStatus={filterStatus}     
            setFilterStatus={setFilterStatus} 
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