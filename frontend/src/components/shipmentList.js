import React from 'react';
import { FaTruck, FaHourglassHalf, FaWeightHanging, FaBox } from 'react-icons/fa';
import { Search } from 'lucide-react';
import '../styles/shipments.css'; // Ensure this is imported

const ShipmentList = ({ shipments, onFindTruck, filterStatus, setFilterStatus }) => {
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

      {/* --- NEW: FILTER BUTTONS (Inserted Here) --- */}
      <div className="filter-tabs-row">
        {['All', 'Pending', 'Requested', 'Assigned'].map(status => (
            <button 
              key={status}
              className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status}
            </button>
        ))}
      </div>

      {/* LIST */}
      <div style={{ overflowY: 'auto', flex: 1, paddingBottom: '20px' }}>
        {shipments.length === 0 ? (
           <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
              <p>No shipments found.</p>
           </div>
        ) : (
          shipments.map((s) => (
            <div key={s.id} className="shipment-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#2d6a4f' }}>{s.id}</span>
                  <StatusBadge status={s.status} />
                </div>

                <div style={{ color: '#6b7280', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                  {s.origin} 
                  <strong>→</strong>
                  {s.destination}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  <div className="stat-badge">
                    <FaWeightHanging color="#000000" size={14} /> 
                    <span style={{ color: '#374151' , padding: '2px'}}>{s.weight} kg</span>
                  </div>
                  <div className="stat-badge">
                    <FaBox color="#000000" size={14} /> 
                    <span style={{ color: '#374151' }}>{s.volume} m³</span>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE ACTIONS */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                
                {/* Pending: Show Button */}
                {s.status === 'Pending' && (
                  <button className="btn-primary" onClick={() => onFindTruck(s)}>
                    Find Best Truck
                  </button>
                )}

                {/* Requested: Show Text */}
                {s.status === 'Requested' && (
                   <span style={{ fontSize: '12px', color: '#7e22ce', fontWeight: '600', display:'flex', alignItems:'center', gap:'5px' }}>
                      <FaHourglassHalf /> Waiting: {s.assignedTruck || s.requestedTruck}
                   </span>
                )}

                {/* Assigned: Show Confirmed */}
                {s.status === 'Assigned' && (
                   <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '600', display:'flex', alignItems:'center', gap:'5px' }}>
                      <FaTruck /> Confirmed: {s.assignedTruck || s.requestedTruck}
                   </span>
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: { color: '#b45309', bg: '#fff7ed', icon: <FaHourglassHalf size={10} /> }, 
    Requested: { color: '#7e22ce', bg: '#f3e8ff', icon: <FaHourglassHalf size={10} /> }, 
    Assigned: { color: '#15803d', bg: '#dcfce7', icon: <FaTruck size={10} /> }, 
  };
  // Fallback to Pending if status doesn't match
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