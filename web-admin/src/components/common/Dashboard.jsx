import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FaCreditCard,
  FaHandHoldingUsd,
  FaChartLine,
  FaUsers,
  FaClipboardList,
  FaTicketAlt,
  FaSync
} from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isSubAdmin = user?.role === "SUB_ADMIN";

  const quickActions = [
    ...(isSuperAdmin
      ? [
        {
          path: "/dashboard/driver-payments",
          label: "Driver Payments",
          icon: <FaCreditCard />,
        },
        {
          path: "/dashboard/agent-commissions",
          label: "Agent Commissions",
          icon: <FaHandHoldingUsd />,
        },
        { path: "/dashboard/users", label: "User Management", icon: <FaUsers /> },
        { path: "/dashboard/analytics", label: "Analytics", icon: <FaChartLine /> },
      ]
      : []),
    ...(isSubAdmin
      ? [
        {
          path: "/dashboard/register-user",
          label: "Register User",
          icon: <FaClipboardList />,
        },
        {
          path: "/dashboard/qr-codes",
          label: "QR Code Assignment",
          icon: <FaTicketAlt />,
        },
        {
          path: "/dashboard/qr-codes-reissue",
          label: "QR Code Reissue",
          icon: <FaSync />,
        },
        { path: "/dashboard/analytics", label: "Analytics", icon: <FaChartLine /> },
      ]
      : []),
  ];

  // Fake Data for Graphs
  const activityData = [
    { name: "Mon", active: 4000, new: 2400 },
    { name: "Tue", active: 3000, new: 1398 },
    { name: "Wed", active: 2000, new: 9800 },
    { name: "Thu", active: 2780, new: 3908 },
    { name: "Fri", active: 1890, new: 4800 },
    { name: "Sat", active: 2390, new: 3800 },
    { name: "Sun", active: 3490, new: 4300 },
  ];

  const revenueData = [
    { name: "Week 1", revenue: 25000 },
    { name: "Week 2", revenue: 35000 },
    { name: "Week 3", revenue: 15000 },
    { name: "Week 4", revenue: 45000 },
  ];

  return (
    <div className="dashboard-container">
      <h2 className="mb-4">Welcome Back, {user?.name?.split(" ")[0]}!</h2>

      <div style={{ marginBottom: "32px" }}>
        <h3 style={{ marginBottom: "16px", color: "var(--text-secondary)" }}>
          Quick Actions
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          {quickActions.map((action) => (
            <div
              key={action.path}
              className="stat-card"
              style={{
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "30px",
              }}
              onClick={() => navigate(action.path)}
            >
              <span style={{ fontSize: "40px", marginBottom: "10px" }}>
                {action.icon}
              </span>
              <h4 style={{ margin: 0, color: "var(--accent-yellow)" }}>
                {action.label}
              </h4>
            </div>
          ))}
        </div>
      </div>

      <div
        className="charts-grid"
        style={{ gridTemplateColumns: "1fr 1fr", marginBottom: "30px" }}
      >
        <div className="chart-card">
          <h3>Weekly Logic Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-color)"
              />
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface-color)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                  borderRadius: "12px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="active"
                stroke="var(--primary-color)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="new"
                stroke="var(--accent-yellow)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Revenue Projection</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-color)"
              />
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface-color)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                  borderRadius: "12px",
                }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Special Lorem Ipsum Card with TargetCursor */}
      {/* <div className="card cursor-target" style={{ padding: '40px', background: 'linear-gradient(135deg, #1e3a8a, #030712)', color: 'white', borderRadius: '24px', textAlign: 'center' }}>
                <h3 style={{ color: 'var(--accent-yellow)', fontSize: '2rem', marginBottom: '20px' }}>Lorem Ipsum Special Feature</h3>
                <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', opacity: 0.9 }}>
                    Hover over this card to see the special target cursor effect! Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
            </div> */}
    </div>
  );
};

export default Dashboard;
