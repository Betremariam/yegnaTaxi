import { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import useAuthStore from "./store/authStore";
import useThemeStore from "./store/useThemeStore";
import { useLocation } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Layout from "./components/common/Layout";
import Login from "./components/auth/Login";
import LandingPage from "./components/landing/LandingPage";
import ToastContainer from "./components/common/ToastContainer";

import Dashboard from "./components/common/Dashboard";

// Super Admin Components
import DriverPayments from "./components/superAdmin/DriverPayments";
import Analytics from "./components/superAdmin/Analytics";
import UserManagement from "./components/superAdmin/UserManagement";
import FermataManagement from "./components/superAdmin/FermataManagement";
import SubAdminManagement from "./components/superAdmin/SubAdminManagement";
import TrafficRecommendations from "./components/superAdmin/TrafficRecommendations";

// Sub Admin Components
import UserRegistration from "./components/subAdmin/UserRegistration";
import ChatAssistant from "./components/AI/ChatAssistant";

function App() {
  const { token } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light"
    );
  }, [isDarkMode]);


  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard Home */}
          <Route path="home" element={<Dashboard />} />

          {/* Super Admin Routes */}
          <Route
            path="driver-payments"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <DriverPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="fermatas"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <FermataManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="sub-admins"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SubAdminManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="traffic-ai"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <TrafficRecommendations />
              </ProtectedRoute>
            }
          />

          {/* Sub Admin Routes */}
          <Route
            path="register-user"
            element={
              <ProtectedRoute allowedRoles={["SUB_ADMIN", "SUPER_ADMIN"]}>
                <UserRegistration />
              </ProtectedRoute>
            }
          />

          {/* Default redirect within dashboard */}
          <Route index element={<Navigate to="home" replace />} />
        </Route>
        {/* Global Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {token && <ChatAssistant />}
    </>
  );
}

export default App;
