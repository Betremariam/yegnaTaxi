import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { FaChartBar, FaUsers, FaExchangeAlt, FaArrowUp } from 'react-icons/fa';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/admin/analytics', { params });
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setLoading(true);
    fetchAnalytics();
  };

  if (loading) return <LoadingSpinner />;

  if (!analytics) return <div>No data available</div>;

  const userCountsData = Object.entries(analytics.userCounts || {}).map(([role, count]) => ({
    role: role.replace('_', ' '),
    count,
  }));

  const transactionTrendData = (analytics.dailyTransactions || []).map(item => ({
    date: new Date(item.createdAt).toLocaleDateString(),
    amount: Number(item._sum.amount || 0),
    count: item._count.id || 0,
  })).reverse();

  const registrationTrendData = (analytics.registrationTrends || []).reduce((acc, item) => {
    const date = new Date(item.date).toLocaleDateString();
    let existing = acc.find(a => a.date === date);
    if (!existing) {
      existing = { date };
      acc.push(existing);
    }
    existing[item.role] = item.count;
    return acc;
  }, []).reverse();

  const chartTooltipStyle = {
    backgroundColor: 'var(--surface-color)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-primary)',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  };

  return (
    <div className="analytics">
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Analytics Dashboard</h2>
          </div>
          <div className="date-filters">
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto' }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button onClick={handleFilter} className="btn btn-primary">
              Filter
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Total Transactions</h3>
            <FaExchangeAlt style={{ color: 'var(--primary-color)', opacity: 0.5 }} />
          </div>
          <p className="stat-value">{analytics.totals?.totalCount || 0}</p>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Total Users</h3>
            <FaUsers style={{ color: 'var(--primary-color)', opacity: 0.5 }} />
          </div>
          <p className="stat-value">
            {Object.values(analytics.userCounts || {}).reduce((a, b) => a + b, 0)}
          </p>
        </div>
      </div>

      <div className="charts-grid" style={{ marginTop: '20px' }}>
        <div className="chart-card">
          <h3>Transaction Volume Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={transactionTrendData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend />
              <Area type="monotone" dataKey="count" stroke="var(--primary-color)" fillOpacity={1} fill="url(#colorCount)" name="Transactions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>User Registration Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={registrationTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="PASSENGER" stroke="#8884d8" name="Passengers" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="DRIVER" stroke="#82ca9d" name="Drivers" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="AGENT" stroke="#ffc658" name="Agents" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>User Distribution by Role</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userCountsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="role" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend />
              <Bar dataKey="count" fill="var(--primary-color)" radius={[8, 8, 0, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Recent Growth</h3>
          <div style={{ padding: '20px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>Total distribution by user type</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              {Object.entries(analytics.userCounts || {}).map(([role, count]) => (
                <div key={role} style={{ background: 'var(--surface-color)', padding: '15px', borderRadius: '12px', flex: 1, border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.7 }}>{role}</span>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '5px 0 0 0' }}>{count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

