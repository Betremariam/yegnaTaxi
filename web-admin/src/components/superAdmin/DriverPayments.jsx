import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const DriverPayments = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/admin/drivers/payments');
      setDrivers(response.data.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setMessage('Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDriver = (driverId) => {
    setSelectedDrivers((prev) =>
      prev.includes(driverId)
        ? prev.filter((id) => id !== driverId)
        : [...prev, driverId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDrivers.length === drivers.length) {
      setSelectedDrivers([]);
    } else {
      setSelectedDrivers(drivers.map((d) => d.id));
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await api.get('/admin/drivers/payments/download', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `driver-payments-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage('Excel file downloaded successfully');
    } catch (error) {
      console.error('Error downloading Excel:', error);
      setMessage('Failed to download Excel file');
    }
  };

  const handleUpdateStatus = async (status) => {
    if (selectedDrivers.length === 0) {
      setMessage('Please select at least one driver');
      return;
    }

    try {
      await api.put('/admin/drivers/payments', {
        driverIds: selectedDrivers,
        status,
      });

      setMessage(`Payment status updated to ${status} successfully`);
      setSelectedDrivers([]);
      fetchDrivers();
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage('Failed to update payment status');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="driver-payments card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
        <h2 style={{ margin: 0, color: 'var(--accent-yellow)' }}>Driver Payment Management</h2>
        <button onClick={handleDownloadExcel} className="btn btn-primary">
          Download Excel
        </button>
      </div>

      {message && (
        <div
          className="card"
          style={{
            padding: '12px 20px',
            marginBottom: '20px',
            background: message.includes('success') ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
            borderColor: message.includes('success') ? '#4ade80' : '#f87171',
            color: message.includes('success') ? '#166534' : '#991b1b',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          {message}
        </div>
      )}

      <div className="bulk-actions">
        <button
          onClick={handleSelectAll}
          className="btn btn-secondary"
        >
          {selectedDrivers.length === drivers.length ? 'Deselect All' : 'Select All'}
        </button>
        {selectedDrivers.length > 0 && (
          <>
            <button
              onClick={() => handleUpdateStatus('PAID')}
              className="btn btn-primary"
              style={{ background: '#10b981', color: 'white' }}
            >
              Mark as Paid ({selectedDrivers.length})
            </button>
            <button
              onClick={() => handleUpdateStatus('PENDING')}
              className="btn btn-secondary"
              style={{ background: '#f59e0b', color: 'white', borderColor: '#f59e0b' }}
            >
              Mark as Pending ({selectedDrivers.length})
            </button>
          </>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectedDrivers.length === drivers.length && drivers.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Name</th>
              <th>User ID</th>
              <th>Phone</th>
              <th>Total Earnings</th>
              <th>Bank Account</th>
              <th>Status</th>
              <th>Last Paid</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedDrivers.includes(driver.id)}
                    onChange={() => handleSelectDriver(driver.id)}
                  />
                </td>
                <td style={{ fontWeight: '600' }}>{driver.name}</td>
                <td><code>{driver.userId}</code></td>
                <td>{driver.phone}</td>
                <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{Number(driver.totalEarnings).toFixed(2)} ETB</td>
                <td>
                  <div style={{ fontSize: '13px' }}>{driver.bankName || '-'}</div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>{driver.bankAccount || '-'}</div>
                </td>
                <td>
                  <span className={`status-badge ${driver.paymentStatus.toLowerCase()}`}>
                    {driver.paymentStatus}
                  </span>
                </td>
                <td>
                  {driver.lastPaidAt
                    ? new Date(driver.lastPaidAt).toLocaleDateString()
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {drivers.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No drivers found</div>
        )}
      </div>
    </div>
  );
};

export default DriverPayments;

