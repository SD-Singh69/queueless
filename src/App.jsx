import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { QueueProvider } from "./context/QueueContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Customer from "./pages/Customer";
import Owner from "./pages/Owner";
import Profile from "./pages/Profile";
function Protected({ children, role }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="center-screen">Loading QueueLess…</div>;
  return user && (!role || user.role === role) ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}
function Shell() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route
            path="/dashboard"
            element={
              <Protected role="customer">
                <Customer />
              </Protected>
            }
          />
          <Route
            path="/owner"
            element={
              <Protected role="owner">
                <Owner />
              </Protected>
            }
          />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueueProvider>
          <Shell />
          <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        </QueueProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
