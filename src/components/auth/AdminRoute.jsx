import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "../common/Loader";

// Only users with a document at admins/{uid} get through.
// (The real protection is in firestore.rules - this just hides the UI.)
const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader label="Checking permissions..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return (
      <main className="simple-page">
        <section className="app-empty-card">
          <p className="eyebrow">RESTRICTED</p>
          <h1>Admins only</h1>
          <p>You don't have permission to view this page.</p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </section>
      </main>
    );
  }

  return children;
};

export default AdminRoute;
