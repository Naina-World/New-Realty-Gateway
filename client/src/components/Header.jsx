import { NavLink, Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" aria-label="New Realty Gateway home"><Logo /></Link>
        <nav className="nav" aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/property">Property</NavLink>
        </nav>
      </div>
    </header>
  );
}
