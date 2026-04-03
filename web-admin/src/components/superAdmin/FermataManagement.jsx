import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';
import useToastStore from '../../store/useToastStore';

const FermataManagement = () => {
  const [fermatas, setFermatas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFermata, setEditingFermata] = useState(null);
  const [formData, setFormData] = useState({ name: '', fare: '' });

  useEffect(() => {
    fetchFermatas();
  }, []);

  const fetchFermatas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/fermatas');
      setFermatas(response.data.data);
    } catch (err) {
      setError('Failed to fetch fermatas');
      useToastStore.getState().addToast('Failed to load fermatas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFermata) {
        await api.put(`/fermatas/${editingFermata.id}`, formData);
      } else {
        await api.post('/fermatas', formData);
      }
      setIsModalOpen(false);
      setEditingFermata(null);
      setFormData({ name: '', fare: '' });
      useToastStore.getState().addToast(
        `Fermata ${editingFermata ? 'updated' : 'created'} successfully`, 
        'success'
      );
      fetchFermatas();
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed';
      setError(msg);
      useToastStore.getState().addToast(msg, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fermata?')) {
      try {
        await api.delete(`/fermatas/${id}`);
        useToastStore.getState().addToast('Fermata deleted successfully', 'success');
        fetchFermatas();
      } catch (err) {
        useToastStore.getState().addToast('Failed to delete fermata', 'error');
      }
    }
  };

  const openModal = (fermata = null) => {
    if (fermata) {
      setEditingFermata(fermata);
      setFormData({ name: fermata.name, fare: fermata.fare });
    } else {
      setEditingFermata(null);
      setFormData({ name: '', fare: '' });
    }
    setIsModalOpen(true);
  };

  if (loading && fermatas.length === 0) return <div className="loading">Loading...</div>;

  return (
    <div className="fermata-management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--accent-yellow)', margin: 0 }}>Fermata Management</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <FaPlus style={{ marginRight: '8px' }} /> Add Fermata
        </button>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '20px' }}>{error}</div>}

      {fermatas.length === 0 ? (
        <div className="card" style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{ 
            fontSize: '48px', 
            opacity: 0.2,
            color: 'var(--accent-yellow)'
          }}>
            <FaMapMarkerAlt />
          </div>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>No fermata data available</p>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>Click the button above to add your first station.</p>
        </div>
      ) : (
        <div className="grid">
          {fermatas.map((f) => (
            <div key={f.id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  background: 'rgba(234, 179, 8, 0.1)', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-yellow)'
                }}>
                  <FaMapMarkerAlt />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0 }}>{f.name}</h3>
                  <p style={{ margin: '5px 0 0', color: 'var(--text-secondary)' }}>Fare: {f.fare} ETB</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-secondary" onClick={() => openModal(f)} title="Edit">
                    <FaEdit />
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(f.id)} title="Delete">
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content card" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', width: '90%' }}>
            <h3 style={{ marginBottom: '20px' }}>{editingFermata ? 'Edit Fermata' : 'Add New Fermata'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Station Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fare (ETB)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={formData.fare}
                  onChange={e => setFormData({ ...formData, fare: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingFermata ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FermataManagement;
