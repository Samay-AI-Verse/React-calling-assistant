import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const Settings = () => {
    const { user } = useOutletContext();
    const [agentName, setAgentName] = useState('HR - Sarah');
    const [timezone, setTimezone] = useState('IST');

    // Mock data if user is loading or null
    const displayUser = user || {
        name: 'Samay Powade',
        email: 'samaypowade1@gmail.com',
        picture: null,
        role: 'Senior Recruiter'
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>

            {/* Top Profile Card */}
            <div className="card" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '30px',
                padding: '30px',
                background: '#121212' // Darker contrast
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div className="profile-avatar-large" style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        border: '3px solid var(--bg-body)',
                        boxShadow: '0 0 0 2px var(--primary-500)',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        {displayUser.picture ? (
                            <img src={displayUser.picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: 'var(--text-secondary)' }}>
                                {displayUser.name.charAt(0)}
                            </div>
                        )}
                        <div style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            width: '16px',
                            height: '16px',
                            background: '#10b981',
                            borderRadius: '50%',
                            border: '2px solid #121212'
                        }}></div>
                    </div>

                    <div>
                        <h2 style={{ fontSize: '24px', marginBottom: '4px' }}>{displayUser.name}</h2>
                        <p className="text-muted" style={{ fontSize: '14px', marginBottom: '12px' }}>{displayUser.email}</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span className="badge badge-warning" style={{ fontSize: '11px', padding: '4px 10px' }}>Administrator</span>
                            <span className="badge badge-success" style={{ fontSize: '11px', padding: '4px 10px' }}>Verified</span>
                        </div>
                    </div>

                </div>

                <button className="btn" style={{
                    border: '1px solid var(--danger)',
                    color: 'var(--danger)',
                    background: 'transparent',
                    padding: '10px 20px',
                    borderRadius: '8px'
                }}>
                    <i className="fa-solid fa-power-off"></i> Secure Logout
                </button>
            </div>

            {/* Grid Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>

                {/* Personal Information (Left) */}
                <div className="card" style={{ padding: '30px' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                        Personal Information
                    </h3>

                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input type="text" className="form-control" value={displayUser.name} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="text" className="form-control" value={displayUser.email} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Role</label>
                        <input type="text" className="form-control" value={displayUser.role || "Administrator"} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                    </div>
                </div>

                {/* System Configuration (Right) */}
                <div className="card" style={{ padding: '30px' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                        System Configuration
                    </h3>

                    <div className="form-group">
                        <label className="form-label">Default Agent Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={agentName}
                            onChange={(e) => setAgentName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Timezone</label>
                        <select
                            className="form-control"
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                        >
                            <option value="IST">India Standard Time (IST)</option>
                            <option value="PST">Pacific Standard Time (PST)</option>
                            <option value="EST">Eastern Standard Time (EST)</option>
                            <option value="UTC">Coordinated Universal Time (UTC)</option>
                        </select>
                    </div>

                    <div style={{ marginTop: '40px' }}>
                        <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '14px' }}>
                            <i className="fa-solid fa-save"></i> Save Changes
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Settings;
