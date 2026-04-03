import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { ROLE_LABELS } from '../../utils/constants';
import { ETHIOPIAN_BANKS } from '../../utils/constants';
import useToastStore from '../../store/useToastStore';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [userTransactions, setUserTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [fermatas, setFermatas] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Top-up states
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpUser, setTopUpUser] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  useEffect(() => {
    fetchFermatas();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserTransactions(selectedUser.id);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;

      const response = await api.get('/users', { params });
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFermatas = async () => {
    try {
      const response = await api.get('/fermatas');
      setFermatas(response.data.data);
    } catch (error) {
      console.error('Error fetching fermatas:', error);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      const userData = response.data.data;
      setSelectedUser(userData);
      setEditData({
        ...userData,
        bankName: userData.driverEarnings?.bankName || '',
        bankAccount: userData.driverEarnings?.bankAccount || '',
        accountName: userData.driverEarnings?.accountName || '',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleUpdate = async () => {
    setUpdateLoading(true);
    try {
      const response = await api.put(`/users/${selectedUser.id}`, editData);
      setSelectedUser(response.data.data);
      setIsEditing(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      addToast(error.response?.data?.message || 'Update failed', 'error');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleTopUp = async () => {
    if (!topUpAmount || isNaN(topUpAmount) || topUpAmount <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }

    setTopUpLoading(true);
    try {
      await api.post('/transactions/manual-top-up', {
        passengerId: topUpUser.id,
        amount: parseFloat(topUpAmount)
      });
      setShowSuccessModal(true);
      setShowTopUpModal(false);
      setTopUpAmount('');
      fetchUsers(); // Refresh to show new balance
      if (selectedUser?.id === topUpUser.id) {
        handleViewUser(topUpUser.id);
      }
    } catch (error) {
      console.error('Top-up failed:', error);
      addToast(error.response?.data?.message || 'Top-up failed', 'error');
    } finally {
      setTopUpLoading(false);
    }
  };

  const fetchUserTransactions = async (userId) => {
    setTransactionsLoading(true);
    try {
      const response = await api.get('/transactions/history', {
        params: { userId, limit: 10 }
      });
      setUserTransactions(response.data.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const getUserBalance = (user) => {
    if (user.role === 'DRIVER') {
      return user.driverEarnings?.totalEarnings
        ? Number(user.driverEarnings.totalEarnings).toFixed(2)
        : '0.00';
    } else {
      return user.balance?.currentBalance
        ? Number(user.balance.currentBalance).toFixed(2)
        : '0.00';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="user-management card">
      <div style={{ marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
        <h2 style={{ margin: 0, color: 'var(--accent-yellow)' }}>User Management</h2>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name, phone, or National ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{ flex: 1 }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="form-select"
          style={{ width: '200px' }}
        >
          <option value="">All Roles</option>
          <option value="PASSENGER">Passenger</option>
          <option value="DRIVER">Driver</option>
          <option value="SUB_ADMIN">Sub Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>National ID</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Balance</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ fontWeight: '600' }}>{user.name}</td>
                <td><code>{user.nationalId || '-'}</code></td>
                <td>{user.phone}</td>
                <td>
                  <span className="role-badge">{ROLE_LABELS[user.role]}</span>
                </td>
                <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>
                  {getUserBalance(user)} <span style={{ fontSize: '12px', opacity: 0.7 }}>ETB</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {user.role === 'PASSENGER' && (
                      <button
                        onClick={() => { setTopUpUser(user); setShowTopUpModal(true); }}
                        className="btn btn-sm btn-primary"
                        style={{ padding: '4px 12px' }}
                      >
                        Top Up
                      </button>
                    )}
                    <button
                      onClick={() => handleViewUser(user.id)}
                      className="btn btn-sm btn-secondary"
                      style={{ padding: '4px 12px' }}
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No users found</div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-container" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>User Details</h3>
              <button onClick={() => { setSelectedUser(null); setIsEditing(false); }} className="close-btn">
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                <button
                  className={`btn btn-sm ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel Edit' : 'Edit User'}
                </button>
              </div>
              <div className="user-info-grid">
                <div className="detail-row">
                  <strong>Name</strong>
                  {isEditing ? (
                    <input type="text" className="form-input" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                  ) : selectedUser.name}
                </div>
                {editData.role !== 'DRIVER' && (
                  <div className="detail-row">
                    <strong>National ID</strong>
                    {isEditing ? (
                      <input type="text" className="form-input" value={editData.nationalId || ''} onChange={e => setEditData({ ...editData, nationalId: e.target.value })} />
                    ) : (<code>{selectedUser.nationalId || '-'}</code>)}
                  </div>
                )}
                <div className="detail-row">
                  <strong>Phone</strong>
                  {isEditing ? (
                    <input type="text" className="form-input" value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
                  ) : selectedUser.phone}
                </div>
                <div className="detail-row">
                  <strong>Role</strong>
                  {isEditing ? (
                    <select className="form-select" value={editData.role} onChange={e => setEditData({ ...editData, role: e.target.value })}>
                      <option value="PASSENGER">Passenger</option>
                      <option value="DRIVER">Driver</option>
                      <option value="SUB_ADMIN">Sub Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  ) : ROLE_LABELS[selectedUser.role]}
                </div>

                {selectedUser.role === 'DRIVER' && (
                  <>
                    <div className="detail-row">
                      <strong>License Plate</strong>
                      {isEditing ? (
                        <input type="text" className="form-input" value={editData.licensePlate || ''} onChange={e => setEditData({ ...editData, licensePlate: e.target.value })} />
                      ) : (selectedUser.licensePlate || '-')}
                    </div>
                    <div className="detail-row">
                      <strong>Car Model</strong>
                      {isEditing ? (
                        <input type="text" className="form-input" value={editData.carModel || ''} onChange={e => setEditData({ ...editData, carModel: e.target.value })} />
                      ) : (selectedUser.carModel || '-')}
                    </div>
                    <div className="detail-row">
                      <strong>Station</strong>
                      {isEditing ? (
                        <select className="form-select" value={editData.fermataId || ''} onChange={e => {
                          const val = e.target.value;
                          setEditData({
                            ...editData,
                            fermataId: val,
                            fermataIds: val ? [val] : []
                          });
                        }}>
                          <option value="">No Station Assigned</option>
                          {fermatas.map(f => (
                            <option key={f.id} value={f.id}>{f.name} ({f.fare} ETB)</option>
                          ))}
                        </select>
                      ) : (selectedUser.fermatas?.[0]?.name || '-')}
                    </div>

                    <div className="detail-row">
                      <strong>Bank Name</strong>
                      {isEditing ? (
                        <select className="form-select" value={editData.bankName} onChange={e => setEditData({ ...editData, bankName: e.target.value })}>
                          <option value="">Select a Bank</option>
                          {ETHIOPIAN_BANKS.map(bank => (
                            <option key={bank} value={bank}>{bank}</option>
                          ))}
                          <option value="Other">Other</option>
                        </select>
                      ) : (selectedUser.driverEarnings?.bankName || '-')}
                    </div>

                    <div className="detail-row">
                      <strong>Bank Account</strong>
                      {isEditing ? (
                        <input type="text" className="form-input" value={editData.bankAccount} onChange={e => setEditData({ ...editData, bankAccount: e.target.value })} />
                      ) : (selectedUser.driverEarnings?.bankAccount || '-')}
                    </div>

                    <div className="detail-row">
                      <strong>Account Holder</strong>
                      {isEditing ? (
                        <input type="text" className="form-input" value={editData.accountName} onChange={e => setEditData({ ...editData, accountName: e.target.value })} />
                      ) : (selectedUser.driverEarnings?.accountName || '-')}
                    </div>
                  </>
                )}

                <div className="detail-row">
                  <strong>{selectedUser.role === 'DRIVER' ? 'Total Earnings' : 'Balance'}</strong>
                  <span style={{ fontWeight: '700', color: 'var(--primary-color)' }}>
                    {getUserBalance(selectedUser)} ETB
                  </span>
                </div>
              </div>

              {isEditing && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <button className="btn btn-primary" onClick={handleUpdate} disabled={updateLoading}>
                    {updateLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}

              <div className="transactions-section">
                <h4 style={{ marginBottom: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Recent Transactions</h4>
                {transactionsLoading ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}><LoadingSpinner /></div>
                ) : (
                  <div className="table-container" style={{ borderRadius: '12px' }}>
                    <table style={{ fontSize: '13px' }}>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Date</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userTransactions.map((tx) => (
                          <tr key={tx.id}>
                            <td style={{ textTransform: 'capitalize' }}>{tx.type.replace(/_/g, ' ').toLowerCase()}</td>
                            <td className={tx.amount < 0 ? 'text-danger' : 'text-success'}>
                              {tx.amount > 0 ? '+' : ''}{Number(tx.amount).toFixed(2)}
                            </td>
                            <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                            <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{tx.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {userTransactions.length === 0 && !transactionsLoading && (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>No transactions found</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Top Up Modal */}
      {showTopUpModal && (
        <div className="modal-overlay" onClick={() => setShowTopUpModal(false)}>
          <div className="modal-container" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Manual Top-up</h3>
              <button onClick={() => setShowTopUpModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '20px', fontSize: '14px' }}>
                Adding funds for <strong>{topUpUser?.name}</strong> (National ID: {topUpUser?.nationalId})
              </p>
              <div className="form-group">
                <label className="form-label">Top-up Amount (ETB) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Enter amount"
                  autoFocus
                />
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowTopUpModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={topUpLoading}
                  onClick={handleTopUp}
                >
                  {topUpLoading ? 'Processing...' : 'Confirm Top-up'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="modal-container" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 20px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              background: 'rgba(74, 222, 128, 0.1)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '2px solid #4ade80',
              color: '#4ade80',
              fontSize: '40px'
            }}>
              ✓
            </div>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>Top-up Successful!</h3>
            <p style={{ margin: '0 0 30px 0', color: 'var(--text-secondary)', fontSize: '15px' }}>
              The balance has been updated successfully.
            </p>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px' }}
              onClick={() => setShowSuccessModal(false)}
            >
              Great!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
