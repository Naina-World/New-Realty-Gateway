import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <Logo size={48} />
          <p>One Gateway. A World of Property Opportunities.</p>
        </div>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/property">Property</Link>
        </div>
        <div className="footer-bottom">© 2026 NRG. All Rights Reserved.</div>
      </div>
    </footer>
  );
}
