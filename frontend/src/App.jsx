// frontend/src/App.jsx - Fixed Routing
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import SitcaForm from "./pages/Signup/SitcaForm";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />                    {/* ← Home page at root */}
      <Route path="/sitca-form" element={<SitcaForm />} />     {/* ← Registration form */}
      <Route path="/login" element={<Login />} />

      {/* Protected Route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Optional: Redirect old path to new one */}
      <Route path="/SitcaForm" element={<Navigate to="/sitca-form" replace />} />

      {/* Catch-all: Redirect unknown paths to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;