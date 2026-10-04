const slug = (status = "") => status.toLowerCase().replace(/\s+/g, "-");

const StatusBadge = ({ status }) => (
  <span className={`status-badge status-badge-${slug(status)}`}>
    {status}
  </span>
);

export default StatusBadge;
