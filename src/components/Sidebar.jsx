import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = ({ user }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    // Mock toggle function, in real app might be button or auto-collapse
    const toggleSidebar = () => {
        // setCollapsed(!collapsed);
    };

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="brand" style={{ padding: '10px 12px', marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
                <div className="brand-text sidebar-logo-anim" style={{ fontSize: '22px', fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-main)' }}>
                    Chetana<span className="logo-accent">'Labs</span>
                </div>
            </div>

            <div className="nav-section">
                <div className="section-label">Main Menu</div>
                <ul className="nav-menu">
                    <li>
                        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                            <i className="fa-solid fa-layer-group"></i>
                            <span>Overview</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/dashboard/candidates" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-user-group"></i>
                            <span>Candidates</span>
                        </NavLink>
                    </li>
                </ul>
            </div>

            <div className="nav-section">
                <div className="section-label">AI Tools</div>
                <ul className="nav-menu">
                    <li>
                        <NavLink to="/dashboard/campaigns" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                            <span>Voice Assistant</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/dashboard/video-assistant" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-video"></i>
                            <span>Video Assistant</span>
                        </NavLink>
                    </li>
                </ul>
            </div>

            <div className="sidebar-footer">
                <div className="user-profile" onClick={() => navigate('/dashboard/settings')} style={{ cursor: 'pointer' }}>
                    <div className="avatar">
                        {user?.picture ? (
                            <img src={user.picture} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="Avatar" />
                        ) : (
                            user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                        )}
                    </div>
                    <div className="user-info" style={{ flex: 1 }}>
                        <h4>{user?.name || 'Loading...'}</h4>
                    </div>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}></i>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
