import React from 'react';
import { FaLeaf, FaRupeeSign, FaRoute, FaTruck } from 'react-icons/fa';

const TruckSelectionModal = ({ shipmentData, onClose, onBook }) => {
  const suggestedTrucks = [
    { 
      id: '#T3003', dealer: '#T01', match: 98, cost: 12000, 
      co2: 'Low', rating: 4.8, capacity: '3000kg' 
    },
    { 
      id: 'T9530', dealer: 'Green Move', match: 85, cost: 9500, 
      co2: 'Very Low', rating: 4.5, capacity: '2500kg' 
    },
    { 
      id: 'T1497', dealer: 'FastTracks', match: 72, cost: 14500, 
      co2: 'Medium', rating: 4.2, capacity: '4000kg' 
    },
    { 
      id: 'T-305', dealer: 'Eco Trans', match: 65, cost: 11000, 
      co2: 'Low', rating: 4.0, capacity: '3500kg' 
    },
    { 
      id: 'T-410', dealer: 'City Cargo', match: 60, cost: 13200, 
      co2: 'High', rating: 3.8, capacity: '5000kg' 
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#111827' }}>Best Truck Options</h2>
          <p style={{ margin: '5px 0 0', color: '#6b7280', fontSize: '14px' }}>
            Optimized for shipment: <b>{shipmentData.origin} ➝ {shipmentData.destination}</b>
          </p>
        </div>

        <div style={styles.grid}>
          {suggestedTrucks.map((truck) => (
            
            <div key={truck.id} className="truck-card">
              
              <div style={styles.matchBadge}>
                {truck.match}% Match
              </div>

              <div>
                <h3 style={{ margin: '0 0 5px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaTruck color="#4b5563"/> {truck.id}
                </h3>
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '15px' }}>
                  by {truck.dealer} <span style={{ color: '#fbbf24' }}>★ {truck.rating}</span>
                </div>
              </div>

              <div style={styles.statsGrid}>
                <div style={styles.statItem}>
                  <FaRupeeSign color="#10b981"/> 
                  <span>₹{truck.cost}</span>
                </div>
                <div style={styles.statItem}>
                  <FaLeaf color="green"/> 
                  <span>{truck.co2} CO₂</span>
                </div>
                <div style={styles.statItem}>
                  <FaRoute color="gray"/> 
                  <span>{truck.capacity}</span>
                </div>
              </div>

              <button 
                className="btn-primary" 
                style={styles.actionButton}
                onClick={() => onBook(truck.id)}
              >
                Request Booking
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
    gap: '30px', 
    rowGap: '60px', 
    backgroundColor: '#f9fafb', 
    padding: '30px', 
    borderRadius: '8px',
    maxHeight: '60vh', 
    overflowY: 'auto',
    paddingRight: '15px'
  },
  matchBadge: {
    position: 'absolute', top: '12px', right: '12px',
    backgroundColor: '#d1fae5', color: '#065f46',
    padding: '4px 10px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '700',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
    fontSize: '14px', fontWeight: '500', color: '#374151',
    marginBottom: '20px'
  },
  statItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  
  actionButton: {
    width: '100%', 
    marginTop: 'auto' 
  }
};

export default TruckSelectionModal;