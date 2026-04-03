import { useState, useEffect } from 'react';
import api from '../../services/api';
import useToastStore from '../../store/useToastStore';
import { ETHIOPIAN_BANKS } from '../../utils/constants';

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    role: 'DRIVER',
    name: '',
    phone: '',
    nationalId: '',
    bankAccount: '',
    bankName: '',
    accountName: '',
    licensePlate: '',
    carModel: '',
    fermataId: '',
  });
  const [fermatas, setFermatas] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFermatas = async () => {
      try {
        const response = await api.get('/fermatas');
        setFermatas(response.data.data);
      } catch (err) {
        console.error('Failed to fetch fermatas');
      }
    };
    fetchFermatas();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const endpoint =
        formData.role === 'DRIVER'
          ? '/users/register-driver'
          : '/users/register-passenger';

      const payload = {
        name: formData.name,
        phone: formData.phone,
        nationalId: formData.role === 'DRIVER' ? undefined : (formData.nationalId || undefined),
      };

      if (formData.role === 'DRIVER') {
        payload.bankAccount = formData.bankAccount || undefined;
        payload.bankName = formData.bankName || undefined;
        payload.accountName = formData.accountName || undefined;
        payload.licensePlate = formData.licensePlate || undefined;
        payload.carModel = formData.carModel || undefined;
        payload.fermataId = formData.fermataId || undefined;
      }

      const response = await api.post(endpoint, payload);
      
      const responseData = response.data.data;
      const userObj = formData.role === 'DRIVER' ? responseData.driver : responseData.passenger;
      const tempPass = userObj.tempPassword;

      const msg = `${formData.role} registered successfully! ${tempPass ? `Temporary password: ${tempPass}` : ''}`;
      setMessage(msg);
      useToastStore.getState().addToast(`User registered successfully`, 'success');

      // Reset form
      setFormData({
        role: formData.role,
        name: '',
        phone: '',
        nationalId: '',
        bankAccount: '',
        bankName: '',
        accountName: '',
        licensePlate: '',
        carModel: '',
        fermataId: '',
      });
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Registration failed';
      setMessage(errMsg);
      useToastStore.getState().addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%' }}>
      <div className="card" style={{ maxWidth: '100%', width: '100%' }}>
        <div style={{ marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
          <h2 style={{ margin: 0, color: 'var(--accent-yellow)' }}>Register New User</h2>
        </div>

        {message && (
          <div
            className="card"
            style={{
              padding: '12px 20px',
              marginBottom: '20px',
              background: message.includes('successfully') ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
              borderColor: message.includes('successfully') ? '#4ade80' : '#f87171',
              color: message.includes('successfully') ? '#166534' : '#991b1b',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Role *</label>
            <select
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="DRIVER">Driver</option>
              <option value="PASSENGER">Passenger</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter full name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="text"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="e.g. 0911001122"
            />
          </div>

          {formData.role !== 'DRIVER' && (
            <div className="form-group">
              <label className="form-label">National ID *</label>
              <input
                type="text"
                name="nationalId"
                className="form-input"
                value={formData.nationalId}
                onChange={handleChange}
                required={formData.role !== 'DRIVER'}
                placeholder="Enter unique National ID"
              />
            </div>
          )}

          {formData.role === 'DRIVER' && (
            <>
              <div style={{ borderTop: '1px solid var(--border-color)', margin: '20px 0', paddingTop: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: 'var(--accent-yellow)' }}>Bank Details (Optional)</h4>
                <div className="form-group">
                  <label className="form-label">Bank Account</label>
                  <input
                    type="text"
                    name="bankAccount"
                    className="form-input"
                    value={formData.bankAccount}
                    onChange={handleChange}
                    placeholder="Enter bank account number"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bank Name</label>
                  <select
                    name="bankName"
                    className="form-select"
                    value={formData.bankName}
                    onChange={handleChange}
                  >
                    <option value="">Select a Bank</option>
                    {ETHIOPIAN_BANKS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Account Holder Name</label>
                  <input
                    type="text"
                    name="accountName"
                    className="form-input"
                    value={formData.accountName}
                    onChange={handleChange}
                    placeholder="Enter account holder name"
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', margin: '20px 0', paddingTop: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: 'var(--accent-yellow)' }}>Vehicle Details</h4>
                <div className="form-group">
                  <label className="form-label">License Plate *</label>
                  <input
                    type="text"
                    name="licensePlate"
                    className="form-input"
                    value={formData.licensePlate}
                    onChange={handleChange}
                    required={formData.role === 'DRIVER'}
                    placeholder="e.g. AA 2-12345"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Car Model *</label>
                  <input
                    type="text"
                    name="carModel"
                    className="form-input"
                    value={formData.carModel}
                    onChange={handleChange}
                    required={formData.role === 'DRIVER'}
                    placeholder="e.g. Toyota Vitz"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Station (Fermata) *</label>
                  <select
                    name="fermataId"
                    className="form-select"
                    value={formData.fermataId}
                    onChange={handleChange}
                    required={formData.role === 'DRIVER'}
                  >
                    <option value="">Select a Station</option>
                    {fermatas.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.fare} ETB)</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>
            {loading ? 'Registering...' : 'Register User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserRegistration;

