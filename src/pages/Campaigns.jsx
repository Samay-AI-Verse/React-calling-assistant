import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Campaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('candidates');

    // Fetch campaigns
    const loadCampaigns = async () => {
        try {
            const res = await axios.get('/api/campaigns');
            // Filter for audio type if needed, or backend handles it
            setCampaigns(res.data.campaigns || []);
        } catch (err) {
            console.error("Failed to fetch campaigns", err);
        }
    };

    useEffect(() => {
        loadCampaigns();
    }, []);

    const handleCreateCampaign = async () => {
        const name = prompt("Enter name for new Audio Campaign:");
        if (!name) return;
        try {
            await axios.post('/api/campaigns/create', { name, type: 'audio' });
            loadCampaigns();
        } catch (err) {
            alert("Error creating campaign");
        }
    };

    return (
        <div className="vapi-builder-wrapper" style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            {/* Inner Sidebar */}
            <aside className="vapi-sub-sidebar">
                <div className="vapi-sub-header">
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>
                        <i className="fa-solid fa-wand-magic-sparkles"></i> Voice Assistant
                    </span>
                </div>

                <button className="btn-vapi-create" onClick={handleCreateCampaign}>
                    <i className="fa-solid fa-plus"></i> New Campaign
                </button>

                <div className="vapi-search">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input type="text" placeholder="Filter..." />
                </div>

                <div className="campaign-list" style={{ flex: 1, overflowY: 'auto' }}>
                    {campaigns.length === 0 ? (
                        <div style={{ padding: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            No campaigns found.
                        </div>
                    ) : (
                        campaigns.map(camp => (
                            <div
                                key={camp.id}
                                className={`vapi-list-item ${selectedCampaign?.id === camp.id ? 'active' : ''}`}
                                onClick={() => setSelectedCampaign(camp)}
                            >
                                <div>
                                    <span className="vapi-item-name">{camp.name}</span>
                                    <span className="vapi-item-id">#{camp.id.substring(0, 8)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="vapi-main-content" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {!selectedCampaign ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                        <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: '50px', color: 'var(--primary-500)', marginBottom: '20px' }}></i>
                        <h2 style={{ fontSize: '20px', color: 'white', marginBottom: '10px' }}>Welcome to the AI Campaign Builder</h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>Get started by selecting or creating a campaign.</p>
                    </div>
                ) : (
                    <>
                        <header className="vapi-content-header">
                            <div className="vapi-title">
                                <h1>{selectedCampaign.name}</h1>
                                <p>Status: <span style={{ color: 'var(--vapi-yellow)' }}>● {selectedCampaign.status || 'In Design'}</span></p>
                            </div>
                            <div className="vapi-header-actions">
                                <button className="btn-vapi-ghost"><i className="fa-solid fa-rocket"></i> Launch</button>
                            </div>
                        </header>

                        <div className="vapi-tabs">
                            <div className={`vapi-tab ${activeTab === 'candidates' ? 'active' : ''}`} onClick={() => setActiveTab('candidates')}>
                                <i className="fa-solid fa-database"></i> Source Data
                            </div>
                            <div className={`vapi-tab ${activeTab === 'interview_steps' ? 'active' : ''}`} onClick={() => setActiveTab('interview_steps')}>
                                <i className="fa-solid fa-network-wired"></i> Interview Steps
                            </div>
                            <div className={`vapi-tab ${activeTab === 'agent' ? 'active' : ''}`} onClick={() => setActiveTab('agent')}>
                                <i className="fa-solid fa-brain"></i> AI Persona
                            </div>
                            <div className={`vapi-tab ${activeTab === 'script' ? 'active' : ''}`} onClick={() => setActiveTab('script')}>
                                <i className="fa-solid fa-file-pen"></i> Script
                            </div>
                            <div className={`vapi-tab ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                                <i className="fa-solid fa-chart-pie"></i> Reports
                            </div>
                            <div className={`vapi-tab ${activeTab === 'cost' ? 'active' : ''}`} onClick={() => setActiveTab('cost')}>
                                <i className="fa-solid fa-coins"></i> Cost
                            </div>
                        </div>

                        <div className="vapi-form-area" style={{ padding: '30px' }}>
                            {activeTab === 'candidates' && <CandidatesTab campaignId={selectedCampaign.id} />}
                            {activeTab === 'interview_steps' && <InterviewStepsTab />}
                            {activeTab === 'agent' && <AgentTab />}
                            {activeTab === 'script' && <ScriptTab />}
                            {activeTab === 'reports' && <ReportsTab />}
                            {activeTab === 'cost' && <CostTab />}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

// --- Sub-components (Tabs) ---

const CandidatesTab = ({ campaignId }) => {
    const [candidates, setCandidates] = useState([]);

    // Manual Entry State
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newEmail, setNewEmail] = useState('');

    const fetchCandidates = async () => {
        try {
            const res = await axios.get(`/api/campaigns/${campaignId}/candidates`);
            setCandidates(res.data.candidates || []);
        } catch (err) {
            console.error("Error", err);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, [campaignId]);

    const handleAddCandidate = async () => {
        if (!newName || !newPhone) {
            alert("Name and Phone are required");
            return;
        }
        try {
            // Mock API or Real API call for manual add
            // await axios.post('/api/candidates/save', ...);
            // Refresh list
            setCandidates([...candidates, { name: newName, phone: newPhone, email: newEmail }]);
            setNewName(''); setNewPhone(''); setNewEmail('');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div>
            <div className="hr-upload-zone">
                <div className="upload-icon"><i className="fa-solid fa-file-import"></i></div>
                <h3>Bulk Import Candidates</h3>
                <p className="text-muted">Drag & drop CSV or Excel files here</p>
                <button className="btn btn-secondary mt-2">Browse Files</button>
            </div>

            <div className="vapi-section-head" style={{ marginTop: '30px', marginBottom: '20px' }}>
                <span style={{ color: 'white', fontWeight: 600 }}> or Add Individually</span>
            </div>

            <div className="hr-manual-grid">
                <input className="form-control" placeholder="Full Name" value={newName} onChange={e => setNewName(e.target.value)} />
                <input className="form-control" placeholder="Phone Number" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                <input className="form-control" placeholder="Email Address" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                <button className="hr-btn-add" onClick={handleAddCandidate}><i className="fa-solid fa-plus"></i> Add</button>
            </div>

            <h3 style={{ marginTop: '30px', fontSize: '15px' }}>Target Candidates ({candidates.length})</h3>
            <table className="sd-table" style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-tertiary)' }}>
                        <th style={{ padding: '10px' }}>Name</th>
                        <th style={{ padding: '10px' }}>Phone</th>
                        <th style={{ padding: '10px' }}>Email</th>
                    </tr>
                </thead>
                <tbody>
                    {candidates.map((c, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '12px' }}>{c.name}</td>
                            <td style={{ padding: '12px' }}>{c.phone}</td>
                            <td style={{ padding: '12px' }}>{c.email}</td>
                        </tr>
                    ))}
                    {candidates.length === 0 && (
                        <tr><td colSpan="3" className="text-center p-4 text-muted">No candidates added yet.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const InterviewStepsTab = () => {
    // Dummy state usage if needed for toggling
    const [selectedMode, setSelectedMode] = useState('technical');
    const [selectedDuration, setSelectedDuration] = useState('15');

    return (
        <div>
            {/* Section 1: MODE */}
            <div className="vapi-section-head" style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>
                    1. SELECT INTERVIEW MODE
                </span>
            </div>

            {/* Custom Grid for 3 Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>

                {/* Technical Card */}
                <div
                    className={`step-card-compact theme-red ${selectedMode === 'technical' ? 'selected' : ''}`}
                    onClick={() => setSelectedMode('technical')}
                    style={{
                        background: '#121212',
                        border: selectedMode === 'technical' ? '1px solid var(--danger)' : '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        padding: '24px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div className="step-avatar-small" style={{
                        width: '60px', height: '60px', margin: '0 auto 16px',
                        background: 'conic-gradient(from 180deg, #ef4444, #7f1d1d)',
                        borderRadius: '50%',
                        boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'
                    }}></div>
                    <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Technical</h3>
                    <p className="text-muted" style={{ fontSize: '12px', marginBottom: '12px' }}>Coding & System Design</p>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: '1.4' }}>
                        Agent drills down into logic, syntax errors, and code optimization.
                    </div>
                </div>

                {/* HR Round Card */}
                <div
                    className={`step-card-compact theme-yellow ${selectedMode === 'hr' ? 'selected' : ''}`}
                    onClick={() => setSelectedMode('hr')}
                    style={{
                        background: '#121212',
                        border: selectedMode === 'hr' ? '1px solid var(--warning)' : '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        padding: '24px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    <div className="step-avatar-small" style={{
                        width: '60px', height: '60px', margin: '0 auto 16px',
                        background: 'conic-gradient(from 180deg, #eab308, #713f12)',
                        borderRadius: '50%',
                        boxShadow: '0 0 20px rgba(234, 179, 8, 0.3)'
                    }}></div>
                    <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>HR Round</h3>
                    <p className="text-muted" style={{ fontSize: '12px', marginBottom: '12px' }}>Culture & Soft Skills</p>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: '1.4' }}>
                        Agent verifies background, career gaps, and company culture fit.
                    </div>
                </div>

                {/* Mixed Card */}
                <div
                    className={`step-card-compact theme-cyan ${selectedMode === 'mixed' ? 'selected' : ''}`}
                    onClick={() => setSelectedMode('mixed')}
                    style={{
                        background: '#121212',
                        border: selectedMode === 'mixed' ? '1px solid cyan' : '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        padding: '24px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    <div className="step-avatar-small" style={{
                        width: '60px', height: '60px', margin: '0 auto 16px',
                        background: 'conic-gradient(from 180deg, cyan, #0e7490)',
                        borderRadius: '50%',
                        boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
                    }}></div>
                    <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Mixed</h3>
                    <p className="text-muted" style={{ fontSize: '12px', marginBottom: '12px' }}>50% Tech + 50% HR</p>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: '1.4' }}>
                        Agent dynamically switches between coding questions and behavioral traits.
                    </div>
                </div>

            </div>

            {/* Section 2: DURATION */}
            <div className="vapi-section-head" style={{ marginTop: '40px', marginBottom: '20px' }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>
                    2. SELECT DURATION
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {['15', '20', '25', '30'].map((time) => {
                    const colors = {
                        '15': 'cyan',
                        '20': '#10b981', // green
                        '25': '#6366f1', // indigo
                        '30': '#ef4444'  // red
                    };
                    const color = colors[time];
                    const isSelected = selectedDuration === time;

                    return (
                        <div
                            key={time}
                            onClick={() => setSelectedDuration(time)}
                            style={{
                                background: '#121212',
                                border: isSelected ? `1px solid ${color}` : '1px solid var(--border-subtle)',
                                borderRadius: '8px',
                                padding: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: `conic-gradient(${color}, transparent)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: isSelected ? `0 0 15px ${color}40` : 'none'
                            }}>
                                <i className="fa-solid fa-clock" style={{ fontSize: '14px', color: 'white' }}></i>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '14px', marginBottom: '2px' }}>{time} Mins</h3>
                                <p className="text-muted" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                                    {time === '15' ? 'Quick Screen' : time === '20' ? 'Standard' : time === '25' ? 'Deep Dive' : 'Full Test'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ScriptTab = () => {
    return (
        <div>
            <div className="script-context-banner" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--primary-500)', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="fa-solid fa-link" style={{ color: 'var(--primary-500)' }}></i>
                <div>
                    <div style={{ fontSize: '11px', color: 'var(--primary-500)', fontWeight: 700, textTransform: 'uppercase' }}>Linked Configuration</div>
                    <div style={{ fontSize: '13px', color: 'white', fontWeight: 500 }}>Targeting: <span style={{ opacity: 0.7 }}>(Select Domain in Steps)</span></div>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label"><i className="fa-solid fa-building"></i> Company Identity</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <input type="text" className="form-control" placeholder="Company Name (e.g. TechFlow)" />
                    <input type="text" className="form-control" placeholder="Industry (e.g. Fintech)" />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label"><i className="fa-solid fa-user-tag"></i> Role Details</label>
                <input type="text" className="form-control" placeholder="Job Title (e.g. Senior Backend Engineer)" />
            </div>

            <div className="form-group">
                <label className="form-label">Evaluation Context & Requirements</label>
                <textarea className="form-control" style={{ minHeight: '120px' }} placeholder="Paste the JD or key requirements here..."></textarea>
            </div>

            <div className="mt-4">
                <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '14px' }}>
                    <i className="fa-solid fa-bolt"></i> Generate Professional Blueprint
                </button>
            </div>
        </div>
    );
};

const AgentTab = () => {
    return (
        <div>
            <div className="vapi-section-head">
                <span style={{ color: 'white', fontWeight: 600 }}>1. Select AI Agent Persona</span>
            </div>

            <div className="round-selection-grid">
                <div className="round-option-card selected" style={{ borderColor: 'var(--vapi-purple)' }}>
                    <h3 className="card-title">Aanya - HR Pro</h3>
                    <p className="card-desc text-muted">Polite & structured. Best for verification & screening.</p>
                </div>
                <div className="round-option-card">
                    <h3 className="card-title">Rohan - Tech Lead</h3>
                    <p className="card-desc text-muted">Direct & technical. Drills down into logic and coding concepts.</p>
                </div>
                <div className="round-option-card">
                    <h3 className="card-title">Kavya - Casual</h3>
                    <p className="card-desc text-muted">Warm, relaxed & conversational.</p>
                </div>
            </div>

            <div className="vapi-section-head" style={{ marginTop: '30px' }}>
                <span style={{ color: 'white', fontWeight: 600 }}>2. Select Voice Model</span>
            </div>
            <div className="round-selection-grid">
                <div className="round-option-card selected">
                    <h4>Raju</h4>
                    <p className="text-muted">🇮🇳 Hindi + English</p>
                </div>
                <div className="round-option-card">
                    <h4>Sarah</h4>
                    <p className="text-muted">🇺🇸 English US</p>
                </div>
            </div>
        </div>
    );
};

const ReportsTab = () => {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 className="rep-title">Campaign Performance</h3>
                <button className="btn btn-secondary btn-sm"><i className="fa-solid fa-download"></i> Export CSV</button>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-value text-success">12</div>
                    <div className="kpi-label">Shortlisted</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-value text-danger">5</div>
                    <div className="kpi-label">Rejected</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-value">42</div>
                    <div className="kpi-label">Under Review</div>
                </div>
            </div>

            <h4 className="mt-4 mb-2">Recent Interviews</h4>
            <table className="data-table">
                <thead><tr><th>Name</th><th>Status</th><th>Score</th><th>Date</th></tr></thead>
                <tbody>
                    <tr><td>Sarah Jenkins</td><td><span className="badge badge-success">Selected</span></td><td>9.2/10</td><td>Oct 24</td></tr>
                    <tr><td>Michael Chen</td><td><span className="badge badge-danger">Rejected</span></td><td>4.5/10</td><td>Oct 23</td></tr>
                </tbody>
            </table>
        </div>
    );
};

const CostTab = () => {
    return (
        <div>
            <div className="card" style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <span className="text-muted text-uppercase text-xs font-bold">Estimated Total Cost</span>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--primary-500)' }}>2,450 <span style={{ fontSize: '16px', color: 'white' }}>Credits</span></div>
                    <div className="text-muted text-sm"><i className="fa-solid fa-users"></i> Based on 150 Candidates</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span className="text-muted text-uppercase text-xs font-bold">Cost Per Interview</span>
                    <div style={{ fontSize: '20px', color: 'white' }}>~16.3 Credits</div>
                </div>
            </div>

            <div className="mt-4 card p-4">
                <h4>Invoice Breakdown</h4>
                <div className="d-flex justify-content-between my-2 border-bottom py-2">
                    <span>Voice Intelligence (LLM)</span>
                    <span>1,500</span>
                </div>
                <div className="d-flex justify-content-between my-2 border-bottom py-2">
                    <span>Telephony</span>
                    <span>750</span>
                </div>
                <div className="d-flex justify-content-between my-2 pt-2">
                    <span style={{ fontWeight: 700 }}>Total</span>
                    <span style={{ color: 'var(--primary-500)', fontWeight: 700 }}>2,450</span>
                </div>
            </div>
        </div>
    );
};

export default Campaigns;
