import React from 'react';
import { Link } from 'react-router-dom';
import './Nav.css';

const Nav = () => {
  return (
    <nav className="nav">
      <ul className="nav-items">
        <li><Link to="/register" className="nav-link">Register</Link></li>
        <li><Link to="/login" className="nav-link">Login</Link></li>
      </ul>
    </nav>
  );
};

export default Nav;
