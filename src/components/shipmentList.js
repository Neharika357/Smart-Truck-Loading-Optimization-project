import React from 'react';
import { FaTruck, FaHourglassHalf, FaSearch, FaArrowRight, FaWeightHanging, FaBox } from 'react-icons/fa';
import { Search } from 'lucide-react';

const ShipmentList = ({ shipments, onFindTruck }) => {
  return (
    <div className="fleet-box">
      
      {/* HEADER */}
      <div className="fleet-header">
        <div>
          <h3 style={{ margin: 0, fontSize: '20px', color: '#111827' }}>Active Shipments</h3>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>
            Real-time logistics management
          </p>
        </div>

        <div className="search-box">
              <Search size={18} />
                <input type="text" placeholder="Search ID or Route..." />
              </div>
        </div>

      {/* LIST CONTENT */}
      <div style={{ overflowY: 'auto', flex: 1, paddingBottom: '20px' }}>
        {shipments.map((s) => (
          
          <div key={s.id} className="shipment-card">
            
            {/* LEFT SIDE: Stacked Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              
              {/* Row 1: ID & Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#2d6a4f' }}>{s.id}</span>
                <StatusBadge status={s.status} />
              </div>

              {/* Row 2: Route with GREEN ARROW */}
              <div style={{ color: '#6b7280', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                {s.origin} 
                 <strong>→</strong>
                {s.destination}
              </div>

              {/* Row 3: Colorful Stats Boxes */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                
                {/* Weight: Golden Icon */}
                <div className="stat-badge">
                  <FaWeightHanging color="#000000" size={14} /> 
                  <span style={{ color: '#374151' , padding: '2px',}}>{s.weight} kg</span>
                </div>

                {/* Volume: Brown Icon */}
                <div className="stat-badge">
                  <FaBox color="#000000" size={14} /> 
                  <span style={{ color: '#374151' }}>{s.volume} m³</span>
                </div>

              </div>
            </div>

            {/* RIGHT SIDE: Action Button */}
            <div>
              {s.status === 'Pending' && (
                <button className="btn-primary" onClick={() => onFindTruck(s)}>
                  Find Best Truck
                </button>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

// Status Badge Component (Matches Reference Colors)
const StatusBadge = ({ status }) => {
  const styles = {
    Pending: { color: '#b45309', bg: '#fff7ed', icon: <FaHourglassHalf size={10} /> }, // Orange
    Requested: { color: '#7e22ce', bg: '#f3e8ff', icon: <FaHourglassHalf size={10} /> }, // Purple
    Assigned: { color: '#15803d', bg: '#dcfce7', icon: <FaTruck size={10} /> }, // Green
  };
  const s = styles[status] || styles.Pending;

  return (
    <span style={{ 
      color: s.color, backgroundColor: s.bg,
      fontSize: '11px', fontWeight: '700', 
      padding: '4px 10px', borderRadius: '20px',
      display: 'flex', alignItems: 'center', gap: '5px'
    }}>
      {s.icon} {status}
    </span>
  );
};

export default ShipmentList;