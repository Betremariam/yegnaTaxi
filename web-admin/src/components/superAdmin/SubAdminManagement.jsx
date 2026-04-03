import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaTrash, FaUserPlus, FaKey } from 'react-icons/fa';

const SubAdminManagement = () => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubAdmin, setNewSubAdmin] = useState({ name: '', phone: '', email: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  const fetchSubAdmins = async () => {
    try {
      const response = await api.get('/admin/sub-admins');
      setSubAdmins(response.data.data);
    } catch (error) {
      console.error('Error fetching sub-admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const response = await api.post('/admin/sub-admins', newSubAdmin);
      setCreatedCredentials(response.data.data.subAdmin);
      fetchSubAdmins();
      setNewSubAdmin({ name: '', phone: '', email: '' });
    } catch (error) {
      console.error('Error creating sub-admin:', error);
      alert(error.response?.data?.message || 'Failed to create sub-admin');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sub-admin?')) return;
    try {
      await api.delete(`/admin/sub-admins/${id}`);
      fetchSubAdmins();
    } catch (error) {
      console.error('Error deleting sub-admin:', error);
      alert(error.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="sub-admin-management card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
        <h2 style={{ margin: 0, color: 'var(--accent-yellow)' }}>Sub-admin Management</h2>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaUserPlus /> Create Sub-admin
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>User ID</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Created At</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subAdmins.map((admin) => (
              <tr key={admin.id}>
                <td style={{ fontWeight: '600' }}>{admin.name}</td>
                <td><code>{admin.userId}</code></td>
                <td>{admin.phone}</td>
                <td>{admin.email || '-'}</td>
                <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{new Date(admin.createdAt).toLocaleDateString()}</td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => handleDelete(admin.id)}
                    className="btn btn-sm btn-danger"
                    title="Delete Sub-admin"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subAdmins.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No sub-admins found</div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); setCreatedCredentials(null); }}>
          <div className="modal-container" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{createdCredentials ? 'Account Created' : 'Create New Sub-admin'}</h3>
              <button onClick={() => { setShowAddModal(false); setCreatedCredentials(null); }} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              {createdCredentials ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ background: 'var(--primary-color-light)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                    <FaKey style={{ fontSize: '40px', color: 'var(--primary-color)', marginBottom: '15px' }} />
                    <p style={{ margin: '0 0 10px 0' }}>Credentials for <strong>{createdCredentials.name}</strong></p>
                    <div style={{ textAlign: 'left', background: 'var(--surface-color)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <p style={{ margin: '0 0 5px 0' }}><strong>User ID:</strong> <code>{createdCredentials.userId}</code></p>
                      <p style={{ margin: 0 }}><strong>Temp Password:</strong> <code>{createdCredentials.tempPassword}</code></p>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Please share these credentials with the sub-admin. They will be required to change their password upon first login.
                  </p>
                  <button className="btn btn-primary" onClick={() => { setShowAddModal(false); setCreatedCredentials(null); }} style={{ width: '100%' }}>
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreate}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={newSubAdmin.name}
                      onChange={(e) => setNewSubAdmin({ ...newSubAdmin, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      required
                      value={newSubAdmin.phone}
                      onChange={(e) => setNewSubAdmin({ ...newSubAdmin, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      required
                      value={newSubAdmin.email}
                      onChange={(e) => setNewSubAdmin({ ...newSubAdmin, email: e.target.value })}
                    />
                  </div>
                  <div style={{ marginTop: '20px' }}>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={createLoading}>
                      {createLoading ? 'Creating...' : 'Create Sub-admin'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdminManagement;
