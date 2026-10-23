export default function Logo({ size = 40 }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="22" fill="#fff" stroke="#1d5fd6" strokeWidth="3" />
        <path d="M10 30 L24 12 L38 30 Z" fill="#1d5fd6" />
        <rect x="16" y="26" width="16" height="12" fill="#f5a623" />
        <rect x="21" y="30" width="6" height="8" fill="#0f2a5c" />
      </svg>
      <span className="logo-text">New Realty<br />Gateway</span>
    </span>
  );
}
