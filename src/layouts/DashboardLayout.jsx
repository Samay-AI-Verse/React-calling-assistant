import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const DashboardLayout = () => {
    const [user, setUser] = useState(null);
    const location = useLocation();

    // Mapping routes to titles
    const getPageTitle = (pathname) => {
        if (pathname === '/dashboard') return 'Dashboard Overview';
        if (pathname.includes('/candidates')) return 'Candidates & Call History';
        if (pathname.includes('/campaigns')) return 'AI Interview Campaign Builder';
        if (pathname.includes('/video-assistant')) return 'AI Video Assistant';
        if (pathname.includes('/settings')) return 'Account Settings';
        return 'Dashboard';
    };

    const isCampaignView = location.pathname.includes('/campaigns') || location.pathname.includes('/video-assistant');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get('/api/me');
                if (res.data && !res.data.error) {
                    setUser(res.data);
                } else {
                    // Redirect to login if not logged in?
                    // navigate('/');
                }
            } catch (err) {
                console.error("Failed to fetch user", err);
            }
        };
        fetchUser();
    }, []);

    const showHeader = location.pathname.includes('/candidates');

    return (
        <div className="app-container">
            <Sidebar user={user} />

            <main className="main-wrapper">
                {/* Header is ONLY visible for Candidates page */}
                {showHeader && (
                    <header className="top-header header-bordered">
                        <div className="page-header">
                            <h2 id="page-title" className="page-title">{getPageTitle(location.pathname)}</h2>
                        </div>
                        <div className="header-actions">
                            <div className="search-bar">
                                <i className="fa-solid fa-magnifying-glass"></i>
                                <input type="text" placeholder="Search..." />
                            </div>
                        </div>
                    </header>
                )}

                <div
                    className={`content-area hide-scrollbar ${isCampaignView ? 'campaigns-view-active' : ''}`}
                    id="content-area"
                >
                    <Outlet context={{ user }} />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
