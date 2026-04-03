import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useThemeStore from "../../store/useThemeStore";
import {
  FaHome,
  FaCreditCard,
  FaChartLine,
  FaUsers,
  FaClipboardList,
  FaBars,
  FaChevronLeft,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaMapMarkerAlt,
  FaUserShield,
  FaRobot
} from "react-icons/fa";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light"
    );
  }, [isDarkMode]);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isSubAdmin = user?.role === "SUB_ADMIN";

  const menuItems = [
    ...(isSuperAdmin
      ? [
        { path: "/dashboard/home", label: "Dashboard", icon: <FaHome /> },
        { path: "/dashboard/driver-payments", label: "Driver Payments", icon: <FaCreditCard /> },
        { path: "/dashboard/analytics", label: "Analytics", icon: <FaChartLine /> },
        { path: "/dashboard/users", label: "User Management", icon: <FaUsers /> },
        { path: "/dashboard/sub-admins", label: "Sub-admins", icon: <FaUserShield /> },
        { path: "/dashboard/fermatas", label: "Fermata Management", icon: <FaMapMarkerAlt /> },
        { path: "/dashboard/traffic-ai", label: "Traffic AI", icon: <FaRobot /> },
      ]
      : []),
    ...(isSubAdmin
      ? [
        { path: "/dashboard/home", label: "Dashboard", icon: <FaHome /> },
        { path: "/dashboard/register-user", label: "Register User", icon: <FaClipboardList /> },
        { path: "/dashboard/users", label: "User Management", icon: <FaUsers /> },
        { path: "/dashboard/analytics", label: "Analytics", icon: <FaChartLine /> },
        { path: "/dashboard/traffic-ai", label: "Traffic AI", icon: <FaRobot /> },
      ]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className={`layout ${isCollapsed ? "collapsed" : ""}`}>
      <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {!isCollapsed && <h2 className="gradient-text">Yegna Taxi</h2>}
            <button
              className="collapse-btn"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                fontSize: '20px',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: isCollapsed ? 'auto' : '0',
                marginRight: isCollapsed ? 'auto' : '0',
                width: isCollapsed ? '100%' : 'auto'
              }}
            >
              {isCollapsed ? <FaBars /> : <FaChevronLeft />}
            </button>
          </div>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? "active" : ""
                }`}
              onClick={() => navigate(item.path)}
              title={isCollapsed ? item.label : ""}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          {!isCollapsed && (
            <div className="user-info">
              <p>{user?.name}</p>
              <p className="user-role">{user?.role?.replace("_", " ")}</p>
            </div>
          )}
          <button className="btn btn-danger" style={{ width: '100%', padding: isCollapsed ? '10px 0' : '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleLogout} title="Logout">
            {isCollapsed ? <FaSignOutAlt /> : <> <FaSignOutAlt /> <span>Logout</span> </>}
          </button>
        </div>
      </div>
      <div className="main-content">
        <div className="header">
          <h1>
            {menuItems.find((item) => item.path === location.pathname)?.label ||
              "Dashboard"}
          </h1>
          <button
            className="btn btn-secondary"
            style={{ width: "40px", height: "40px", padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={toggleDarkMode}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
