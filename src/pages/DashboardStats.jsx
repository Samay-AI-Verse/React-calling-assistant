import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DashboardStats = () => {
    const [stats, setStats] = useState({
        total_candidates: 0,
        active_candidates: 0,
        interviews_done: 0
    });
    const [activity, setActivity] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statsRes, activityRes] = await Promise.all([
                    axios.get('/api/dashboard-stats'),
                    axios.get('/api/dashboard/live-activity')
                ]);
                setStats(statsRes.data);
                setActivity(activityRes.data.activity || []);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            }
        };
        loadData();
    }, []);

    return (
        <div className="view-section active">
            <div className="banner-slider">
                <div className="slide active">
                    <img src="/image/chetanalabs.png" alt="ChetanaLabs Banner" className="slide-img" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }} />
                    <div className="slide-content" style={{ zIndex: 2, position: 'relative' }}>
                        <h2>Welcome to ChetanaLab's v2.0</h2>
                        <p>Our new AI Agent "Sarah" is now 30% faster at screening technical candidates.</p>
                    </div>
                </div>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Total Candidates</span>
                        <div className="kpi-icon"><i className="fa-solid fa-users"></i></div>
                    </div>
                    <div className="kpi-value">{stats.total_candidates}</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Active Processing</span>
                        <div className="kpi-icon"><i className="fa-solid fa-phone-volume"></i></div>
                    </div>
                    <div className="kpi-value">{stats.active_candidates}</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Interviews Done</span>
                        <div className="kpi-icon"><i className="fa-solid fa-clipboard-check"></i></div>
                    </div>
                    <div className="kpi-value">{stats.interviews_done}</div>
                </div>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <h3>Live Activity</h3>
                    <button className="btn btn-secondary btn-sm">View Archive</button>
                </div>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Duration</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activity.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '12px' }}>
                                            <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '10px' }}>
                                                {item.name ? item.name.substring(0, 2).toUpperCase() : 'NA'}
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{item.name}</span>
                                        </div>
                                    </td>
                                    <td>{item.role || 'Candidate'}</td>
                                    <td>
                                        <span className={`badge ${item.display_status === 'Active Session' ? 'badge-primary' : 'badge-neutral'}`}>
                                            {item.display_status}
                                        </span>
                                    </td>
                                    <td className="font-mono text-muted">{item.duration}</td>
                                    <td className="text-muted">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                </tr>
                            ))}
                            {activity.length === 0 && (
                                <tr><td colSpan="5" className="text-center p-4 text-muted">No live activity</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;
