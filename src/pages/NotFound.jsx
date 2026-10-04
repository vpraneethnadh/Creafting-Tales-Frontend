import { Link } from "react-router-dom";

const NotFound = () => (
  <main className="simple-page">
    <section className="app-empty-card">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </section>
  </main>
);

export default NotFound;
