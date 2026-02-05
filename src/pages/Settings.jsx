import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const Settings = () => {
    const { user } = useOutletContext();
    const [activeTab, setActiveTab] = useState('profile');

    // Mock data if user is loading or null
    const displayUser = user || {
        name: 'Samay Powade',
        email: 'samaypowade1@gmail.com',
        picture: null,
        role: 'Senior Recruiter',
        location: 'Mumbai, India'
    };

    return (
        <div style={{ maxWidth: '100%', height: '100%', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s ease' }}>

            {/* --- Hero Profile Header --- */}
            <div style={{
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-subtle)',
                padding: '40px 40px 0 40px'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px', marginBottom: '32px' }}>
                        {/* Avatar */}
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                border: '4px solid var(--bg-card)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                overflow: 'hidden',
                                background: 'var(--bg-hover)'
                            }}>
                                {displayUser.picture ? (
                                    <img src={displayUser.picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: 'var(--text-secondary)' }}>
                                        {displayUser.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div style={{
                                position: 'absolute',
                                bottom: '6px',
                                right: '6px',
                                width: '24px',
                                height: '24px',
                                background: '#10b981',
                                borderRadius: '50%',
                                border: '3px solid var(--bg-card)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}></div>
                        </div>

                        {/* Info */}
                        <div style={{ paddingTop: '16px' }}>
                            <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                                {displayUser.name}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                <span><i className="fa-solid fa-briefcase" style={{ marginRight: '6px' }}></i> {displayUser.role}</span>
                                <span><i className="fa-solid fa-location-dot" style={{ marginRight: '6px' }}></i> {displayUser.location}</span>
                                <span style={{ padding: '2px 8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                                    Verified Account
                                </span>
                            </div>
                        </div>

                        {/* Action */}
                        <div style={{ marginLeft: 'auto', paddingTop: '20px' }}>
                            <button className="btn" style={{
                                background: '#fff0f0',
                                color: '#e02424',
                                border: '1px solid #fecaca',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontWeight: 600
                            }}>
                                <i className="fa-solid fa-arrow-right-from-bracket" style={{ marginRight: '8px' }}></i>
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid transparent' }}>
                        {['Profile Settings', 'Billing & Usage', 'Notifications'].map((tab) => {
                            const key = tab.split(' ')[0].toLowerCase();
                            const isActive = activeTab === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    style={{
                                        padding: '16px 0',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: isActive ? '2px solid var(--primary-500)' : '2px solid transparent',
                                        color: isActive ? 'var(--primary-500)' : 'var(--text-secondary)',
                                        fontWeight: isActive ? 600 : 500,
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        marginBottom: '-1px'
                                    }}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* --- Main Content Area --- */}
            <div style={{ flex: 1, background: 'var(--bg-body)', padding: '40px', overflowY: 'auto' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                                    Basic Information
                                </h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                    <div className="form-group">
                                        <label className="form-label">First Name</label>
                                        <input type="text" className="form-control" value={displayUser.name.split(' ')[0]} disabled />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Last Name</label>
                                        <input type="text" className="form-control" value={displayUser.name.split(' ')[1] || ''} disabled />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <i className="fa-solid fa-envelope" style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-tertiary)' }}></i>
                                        <input type="text" className="form-control" value={displayUser.email} disabled style={{ paddingLeft: '36px' }} />
                                        <span style={{ position: 'absolute', right: '12px', top: '10px', color: '#10b981', fontSize: '13px' }}><i className="fa-solid fa-check-circle"></i> Verified</span>
                                    </div>
                                    <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        This email is linked to your Google Account.
                                    </p>
                                </div>
                            </div>

                            <div className="card" style={{ padding: '32px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-main)' }}>
                                    System Preferences
                                </h3>
                                <div className="form-group">
                                    <label className="form-label">Default Timezone</label>
                                    <select className="form-control">
                                        <option>(GMT+05:30) India Standard Time - Kolkata</option>
                                        <option>(GMT-07:00) Pacific Daylight Time - Los Angeles</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                                    <button className="btn btn-primary">Save Changes</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BILLING TAB */}
                    {activeTab === 'billing' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            {/* Credit Balance Card */}
                            <div style={{
                                background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-500) 100%)',
                                borderRadius: '16px',
                                padding: '32px',
                                color: 'white',
                                marginBottom: '32px',
                                boxShadow: '0 10px 25px -5px rgba(43, 120, 197, 0.4)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Balance</div>
                                        <div style={{ fontSize: '48px', fontWeight: 700, marginBottom: '8px' }}>2,450 <span style={{ fontSize: '20px', fontWeight: 400, opacity: 0.8 }}>Credits</span></div>
                                        <div style={{ fontSize: '14px', opacity: 0.9 }}><i className="fa-solid fa-clock-rotate-left"></i> Renews on Oct 1, 2026</div>
                                    </div>
                                    <button style={{
                                        background: 'white',
                                        color: 'var(--primary-600)',
                                        border: 'none',
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}>
                                        <i className="fa-solid fa-plus"></i> Add Credits
                                    </button>
                                </div>
                            </div>

                            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Transaction History</h3>
                                    <button style={{ background: 'none', border: 'none', color: 'var(--primary-500)', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>Download All</button>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'var(--bg-hover)' }}>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Date</th>
                                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Description</th>
                                            <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Amount</th>
                                            <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { date: 'Oct 24, 2025', desc: 'Monthly Subscription - Pro Plan', amt: '$49.00', status: 'Paid' },
                                            { date: 'Sep 24, 2025', desc: 'Credit Top-up (500 Credits)', amt: '$25.00', status: 'Paid' },
                                            { date: 'Sep 24, 2025', desc: 'Monthly Subscription - Pro Plan', amt: '$49.00', status: 'Paid' },
                                        ].map((row, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '13px' }}>{row.date}</td>
                                                <td style={{ padding: '16px 24px', color: 'var(--text-main)', fontSize: '14px', fontWeight: 500 }}>{row.desc}</td>
                                                <td style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--text-main)', fontSize: '14px' }}>{row.amt}</td>
                                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                    <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '11px', fontWeight: 600 }}>{row.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* NOTIFICATIONS TAB */}
                    {activeTab === 'notifications' && (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}><i className="fa-solid fa-bell-slash"></i></div>
                            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No User Notifications</h3>
                            <p>You're up to date with all system alerts.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Settings;
