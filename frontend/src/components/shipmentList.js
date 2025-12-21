import React, { useState } from 'react';
import { FaTruck, FaHourglassHalf, FaWeightHanging, FaBox, FaEdit, FaTrash } from 'react-icons/fa'; 
import { Search } from 'lucide-react';
import axios from 'axios'; 
import '../styles/shipments.css'; 

const ShipmentList = ({ shipments, onFindTruck, filterStatus, setFilterStatus }) => {
  // --- STATE FOR EDITING ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // --- DELETE FUNCTION ---
  const handleDelete = async (sid) => {
    if (!window.confirm("Are you sure? This will delete the shipment and cancel any requests.")) return;
    try {
      await axios.delete(`http://localhost:5000/delete-shipment/${sid}`);
      window.location.reload(); 
    } catch (err) {
      alert("Failed to delete shipment");
      console.error(err);
    }
  };

  // --- EDIT FUNCTIONS ---
  const openEdit = (shipment) => {
    setEditData({ ...shipment }); 
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/update-shipment/${editData.sid}`, editData);
      setIsEditOpen(false);
      window.location.reload(); 
    } catch (err) {
      alert("Failed to update shipment");
      console.error(err);
    }
  };

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

      <div style={{ overflowY: 'auto', flex: 1, paddingBottom: '20px' }}>
        {shipments.length === 0 ? (
           <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
              <p>No shipments found.</p>
           </div>
        ) : (
          shipments.map((s) => (
            <div key={s.id} className="shipment-card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#2d6a4f' }}>{s.sid}</span>
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

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                
                {s.status === 'Pending' && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button className="btn-primary" onClick={() => onFindTruck(s)}>
                      Find Best Truck
                    </button>
                    
                    {/* EDIT BUTTON */}
                    <button 
                        onClick={() => openEdit(s)}
                        style={{ background: '#f3f4f6', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', color: '#4b5563' }}
                        title="Edit Shipment"
                    >
                        <FaEdit size={14} />
                    </button>

                    {/* DELETE BUTTON */}
                    <button 
                        onClick={() => handleDelete(s.sid)}
                        style={{ background: '#fee2e2', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }}
                        title="Delete Shipment"
                    >
                        <FaTrash size={14} />
                    </button>
                  </div>
                )}
                
                {s.status === 'Requested' && (
                   <span style={{ fontSize: '12px', color: '#7e22ce', fontWeight: '600', display:'flex', alignItems:'center', gap:'5px' }}>
                      <FaHourglassHalf /> Waiting
                   </span>
                )}

                {s.status === 'Assigned' && (
                   <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '600', display:'flex', alignItems:'center', gap:'5px' }}>
                      <FaTruck /> Confirmed
                   </span>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      {/* --- EDIT MODAL (Click Outside to Close) --- */}
      {isEditOpen && editData && (
        <div 
            style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}
            onClick={() => setIsEditOpen(false)} // CLOSE ON CLICK OUTSIDE
        >
            <div 
                style={{ 
                    backgroundColor: 'white', padding: '25px', borderRadius: '12px', width: '350px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)' 
                }}
                onClick={(e) => e.stopPropagation()} // PREVENT CLOSE ON CLICK INSIDE
            >
                <h3 style={{ margin: '0 0 15px 0', color: '#111827' }}>Edit Shipment</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Weight (kg)</label>
                        <input 
                            type="number" 
                            value={editData.weight} 
                            onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Volume (m³)</label>
                        <input 
                            type="number" 
                            value={editData.volume} 
                            onChange={(e) => setEditData({ ...editData, volume: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Origin</label>
                        <input 
                            type="text" 
                            value={editData.origin} 
                            onChange={(e) => setEditData({ ...editData, origin: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Destination</label>
                        <input 
                            type="text" 
                            value={editData.destination} 
                            onChange={(e) => setEditData({ ...editData, destination: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button 
                        onClick={handleSaveEdit}
                        style={{ flex: 1, backgroundColor: '#15803d', color: 'white', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                    >
                        Save
                    </button>
                    <button 
                        onClick={() => setIsEditOpen(false)}
                        style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: { color: '#b45309', bg: '#fff7ed', icon: <FaHourglassHalf size={10} /> }, 
    Requested: { color: '#7e22ce', bg: '#f3e8ff', icon: <FaHourglassHalf size={10} /> }, 
    Assigned: { color: '#15803d', bg: '#dcfce7', icon: <FaTruck size={10} /> }, 
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