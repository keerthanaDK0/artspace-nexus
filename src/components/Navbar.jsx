import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const navLinks = [
        { path: '/', name: 'Home', icon: '🏠' },
        { path: '/add', name: 'Add Artwork', icon: '🖼️' },
        { path: '/gallery', name: 'Gallery', icon: '✨' },
    ];

    return (
        <nav className="nexus-navbar">
            <div className="nav-container">
                <div className="logo">
                    <div className="logo-icon">🎭</div>
                    <div className="logo-text">
                        <span className="logo-main">ArtSpace</span>
                        <span className="logo-sub">Nexus</span>
                    </div>
                </div>

                <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`nav-link ${location.pathname === link.path ? 'active-link' : ''}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <span className="nav-icon">{link.icon}</span>
                            <span>{link.name}</span>
                        </Link>
                    ))}
                </div>

                <div className="mobile-menu-btn" onClick={toggleMobileMenu}>
                    <div className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;