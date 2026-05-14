import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLoginClick = () => {
    navigate('/Auth');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo">Career Gen</div>

      {/* Hamburger button — only visible on mobile */}
      <button
        className={`hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(prev => !prev)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Nav links */}
      <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <li><a href="/"                    onClick={closeMenu}>Home</a></li>
        <li><a href="/Careers"             onClick={closeMenu}>Careers</a></li>
        <li><a href="/CareerAptitudeTest"  onClick={closeMenu}>Career Aptitude Test</a></li>
        <li><a href="/MagazinePage"        onClick={closeMenu}>Magazine</a></li>
        <li><a href="/ContactPage"         onClick={closeMenu}>Contact</a></li>
        <li>
          <button className="nav-btn" onClick={handleLoginClick}>
            Login and Signup
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;