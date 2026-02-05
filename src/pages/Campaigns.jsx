import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Campaigns.css'; // Import the new styles

const Campaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [activeTab, setActiveTab] = useState('agent'); // Default can be agent

    // Fetch campaigns from backend
    const fetchCampaigns = async () => {
        try {
            const res = await axios.get('/api/campaigns');
            if (res.data && res.data.campaigns) {
                setCampaigns(res.data.campaigns);
                // Select first if none selected
                if (!selectedCampaign && res.data.campaigns.length > 0) {
                    setSelectedCampaign(res.data.campaigns[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleCreateCampaign = async () => {
        const name = prompt("Enter Campaign Name:");
        if (name) {
            try {
                // Optimistic update or refetch
                await axios.post('/api/campaigns/create', { name, type: 'audio' });
                fetchCampaigns();
            } catch (error) {
                console.error("Error creating campaign:", error);
                alert("Failed to create campaign");
            }
        }
    };

    const handleDeleteCampaign = async (e, id) => {
        e.stopPropagation(); // Prevent selecting the campaign while deleting
        if (window.confirm("Are you sure you want to delete this campaign? This cannot be undone.")) {
            try {
                await axios.delete(`/api/campaigns/${id}`);

                // Update local state
                const updatedList = campaigns.filter(c => c.id !== id);
                setCampaigns(updatedList);

                // If currently selected was deleted, select another one
                if (selectedCampaign && selectedCampaign.id === id) {
                    setSelectedCampaign(updatedList.length > 0 ? updatedList[0] : null);
                }
            } catch (error) {
                console.error("Error deleting campaign:", error);
                alert("Failed to delete campaign");
            }
        }
    };

    return (
        <div className="vapi-builder-wrapper">
            {/* Sidebar */}
            <aside className="vapi-sub-sidebar">
                <div className="vapi-sub-header">
                    <div className="vapi-brand">
                        <i className="fa-solid fa-wand-magic-sparkles"></i> Voice Assistant
                    </div>
                </div>

                <button className="btn-new-campaign" onClick={handleCreateCampaign}>
                    <i className="fa-solid fa-plus"></i> New Campaign
                </button>

                <div className="sidebar-search">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input type="text" placeholder="Filter..." />
                </div>

                <div className="campaign-nav-list">
                    {campaigns.map(camp => (
                        <div
                            key={camp.id}
                            className={`nav-item ${selectedCampaign?.id === camp.id ? 'active' : ''}`}
                            onClick={() => setSelectedCampaign(camp)}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}
                        >
                            <div style={{ overflow: 'hidden' }}>
                                <div className="nav-item-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{camp.name}</div>
                                <div className="nav-item-meta">#{camp.id.substring(0, 8)}</div>
                            </div>

                            <button
                                className="btn-delete-camp"
                                onClick={(e) => handleDeleteCampaign(e, camp.id)}
                                title="Delete Campaign"
                            >
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <main className="vapi-main">
                {selectedCampaign ? (
                    <>
                        {/* Header */}
                        <header className="vapi-header">
                            <div className="header-left" style={{ display: 'flex', alignItems: 'center' }}>
                                <h2>{selectedCampaign.name}</h2>
                                <span className="status-badge">● {selectedCampaign.status}</span>
                            </div>
                            <button className="btn-start">
                                <i className="fa-solid fa-rocket"></i> Start Campaign
                            </button>
                        </header>

                        {/* Tabs */}
                        <div className="tabs-bar">
                            <button className={`tab-btn ${activeTab === 'source' ? 'active' : ''}`} onClick={() => setActiveTab('source')}>
                                <i className="fa-solid fa-database"></i> Source Data
                            </button>
                            <button className={`tab-btn ${activeTab === 'steps' ? 'active' : ''}`} onClick={() => setActiveTab('steps')}>
                                <i className="fa-solid fa-network-wired"></i> Interview Steps
                            </button>
                            <button className={`tab-btn ${activeTab === 'agent' ? 'active' : ''}`} onClick={() => setActiveTab('agent')}>
                                <i className="fa-solid fa-brain"></i> AI Persona
                            </button>
                            <button className={`tab-btn ${activeTab === 'script' ? 'active' : ''}`} onClick={() => setActiveTab('script')}>
                                <i className="fa-solid fa-file-pen"></i> Script
                            </button>
                            <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                                <i className="fa-solid fa-chart-pie"></i> Reports
                            </button>
                            <button className={`tab-btn ${activeTab === 'cost' ? 'active' : ''}`} onClick={() => setActiveTab('cost')}>
                                <i className="fa-solid fa-coins"></i> Cost
                            </button>
                        </div>

                        {/* Content */}
                        <div className="form-scroll-area">
                            {activeTab === 'source' && <SourceDataTab campaignId={selectedCampaign.id} />}
                            {activeTab === 'steps' && <InterviewStepsTab />}
                            {activeTab === 'agent' && <AgentSelector />}
                            {activeTab === 'script' && <ScriptTab />}
                            {activeTab === 'reports' && <ReportsTab />}
                            {activeTab === 'cost' && <CostTab />}
                        </div>
                    </>
                ) : (
                    <div className="empty-state-container">
                        <div className="empty-state-icon-wrapper">
                            <div className="empty-state-blob"></div>
                            <div className="empty-state-icon">
                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                            </div>
                        </div>
                        <h2 className="empty-state-title">No Campaign Selected</h2>
                        <p className="empty-state-desc">
                            Select a campaign from the sidebar to view details, or create a new one to start your AI calling journey.
                        </p>
                        <div className="empty-state-arrow">
                            <i className="fa-solid fa-arrow-left-long"></i> Select from sidebar
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

// --- 1. Source Data Tab ---
const SourceDataTab = ({ campaignId }) => {
    const [candidates, setCandidates] = useState([]);

    // Manual State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    const handleAdd = () => {
        if (name && phone) {
            setCandidates([...candidates, { name, phone, email }]);
            setName(''); setPhone(''); setEmail('');
        }
    };

    return (
        <div>
            <div className="upload-zone">
                <i className="fa-solid fa-cloud-arrow-up upload-icon"></i>
                <h3 style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '8px' }}>Bulk Import Candidates</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Drag & drop CSV or Excel files here</p>
            </div>

            <div className="section-head" style={{ marginTop: '30px', marginBottom: '16px' }}>
                OR ADD INDIVIDUALLY
            </div>

            <div className="manual-grid">
                <input className="input-dark" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
                <input className="input-dark" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
                <input className="input-dark" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} />
                <button className="btn-add" onClick={handleAdd}><i className="fa-solid fa-plus"></i> Add</button>
            </div>

            <div className="section-head">TARGET CANDIDATES ({candidates.length})</div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    {candidates.length === 0 ? (
                        <tr><td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#52525b' }}>No candidates added yet.</td></tr>
                    ) : (
                        candidates.map((c, i) => (
                            <tr key={i}>
                                <td>{c.name}</td>
                                <td>{c.phone}</td>
                                <td>{c.email}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

// --- 2. Interview Steps Tab ---
const InterviewStepsTab = () => {
    const [mode, setMode] = useState('technical');

    return (
        <div>
            <div className="section-head">1. SELECT INTERVIEW MODE</div>
            <div className="grid-steps">
                {/* Technical */}
                <div className={`step-card ${mode === 'technical' ? 'active' : ''}`} onClick={() => setMode('technical')}>
                    <div className="step-orb" style={{ background: 'conic-gradient(from 180deg, #ef4444, #7f1d1d)' }}></div>
                    <div style={{ fontWeight: 600, marginBottom: '6px' }}>Technical</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Coding & System Design</div>
                </div>
                {/* HR */}
                <div className={`step-card ${mode === 'hr' ? 'active' : ''}`} onClick={() => setMode('hr')}>
                    <div className="step-orb" style={{ background: 'conic-gradient(from 180deg, #eab308, #713f12)' }}></div>
                    <div style={{ fontWeight: 600, marginBottom: '6px' }}>HR Round</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Culture & Soft Skills</div>
                </div>
                {/* Mixed */}
                <div className={`step-card ${mode === 'mixed' ? 'active' : ''}`} onClick={() => setMode('mixed')}>
                    <div className="step-orb" style={{ background: 'conic-gradient(from 180deg, cyan, #0e7490)' }}></div>
                    <div style={{ fontWeight: 600, marginBottom: '6px' }}>Mixed</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>50% Tech + 50% HR</div>
                </div>
            </div>

            <div className="section-head">2. DURATION</div>
            <div style={{ display: 'flex', gap: '12px' }}>
                {['15 Mins', '20 Mins', '30 Mins', '45 Mins'].map(t => (
                    <button key={t} style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)',
                        padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
                    }}>{t}</button>
                ))}
            </div>
        </div>
    );
};

// --- 3. Agent Selector (AI Persona) ---
const AgentSelector = () => {
    const [persona, setPersona] = useState('aanya');
    const [voice, setVoice] = useState('raju');
    const [lang, setLang] = useState('en-us');
    const [strict, setStrict] = useState('balanced');

    return (
        <div>
            {/* 1. AI Persona */}
            <div className="section-head">1. Select AI Agent Persona</div>
            <div className="grid-personas">
                <div className={`persona-card ${persona === 'aanya' ? 'active' : ''}`} onClick={() => setPersona('aanya')}>
                    <div className="persona-avatar purple"></div>
                    <div className="persona-name">Aanya - HR Pro</div>
                    <div className="persona-desc">Polite & structured. Best for verification & screening.</div>
                </div>
                <div className={`persona-card ${persona === 'rohan' ? 'active' : ''}`} onClick={() => setPersona('rohan')}>
                    <div className="persona-avatar blue"></div>
                    <div className="persona-name">Rohan - Tech Lead</div>
                    <div className="persona-desc">Direct & technical. Drills down into logic and coding concepts.</div>
                </div>
                <div className={`persona-card ${persona === 'kavya' ? 'active' : ''}`} onClick={() => setPersona('kavya')}>
                    <div className="persona-avatar orange"></div>
                    <div className="persona-name">Kavya - Casual</div>
                    <div className="persona-desc">Warm, relaxed & conversational. Great for culture fit assessment.</div>
                </div>
            </div>

            {/* 2. Voice Model */}
            <div className="section-head">2. Select Voice Model</div>
            <div className="grid-voices">
                <div className={`voice-card ${voice === 'raju' ? 'active' : ''}`} onClick={() => setVoice('raju')}>
                    <div className="voice-orb" style={{ background: 'conic-gradient(#ea580c, #fdba74)' }}></div>
                    <div className="voice-info">
                        <h4>Raju <i className="fa-solid fa-circle-check" style={{ color: '#3b82f6', fontSize: '12px' }}></i></h4>
                        <div className="voice-tag">🇮🇳 Hindi + English</div>
                    </div>
                </div>
                <div className={`voice-card ${voice === 'priya' ? 'active' : ''}`} onClick={() => setVoice('priya')}>
                    <div className="voice-orb" style={{ background: 'conic-gradient(#dc2626, #fca5a5)' }}></div>
                    <div className="voice-info">
                        <h4>Priya</h4>
                        <div className="voice-tag">🇮🇳 English</div>
                    </div>
                </div>
                <div className={`voice-card ${voice === 'anjali' ? 'active' : ''}`} onClick={() => setVoice('anjali')}>
                    <div className="voice-orb" style={{ background: 'conic-gradient(#7c3aed, #d8b4fe)' }}></div>
                    <div className="voice-info">
                        <h4>Anjali <i className="fa-solid fa-circle-check" style={{ color: '#3b82f6', fontSize: '12px' }}></i></h4>
                        <div className="voice-tag">🇮🇳 Marathi (मराठी)</div>
                    </div>
                </div>
            </div>
            {/* Show "See More Voices" button if needed (from screenshot) */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <button style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '8px 16px', borderRadius: '20px', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' }}>
                    See More Voices <i className="fa-solid fa-chevron-down"></i>
                </button>
            </div>


            {/* 3. Communication Language */}
            <div className="section-head">3. Communication Language</div>
            <div className="grid-langs">
                <div className={`lang-card ${lang === 'en-us' ? 'active' : ''}`} onClick={() => setLang('en-us')}>
                    <img src="https://flagcdn.com/w40/us.png" alt="US" className="flag" />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>English (US)</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Professional</div>
                    </div>
                </div>
                <div className={`lang-card ${lang === 'en-in' ? 'active' : ''}`} onClick={() => setLang('en-in')}>
                    <img src="https://flagcdn.com/w40/in.png" alt="IN" className="flag" />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>English (India)</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Native Accent</div>
                    </div>
                </div>
                <div className={`lang-card ${lang === 'hi' ? 'active' : ''}`} onClick={() => setLang('hi')}>
                    <img src="https://flagcdn.com/w40/in.png" alt="IN" className="flag" />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>Hindi (हिंदी)</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Formal / Casual</div>
                    </div>
                </div>
                <div className={`lang-card ${lang === 'mr' ? 'active' : ''}`} onClick={() => setLang('mr')}>
                    <img src="https://flagcdn.com/w40/in.png" alt="IN" className="flag" />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>Marathi (मराठी)</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Regional</div>
                    </div>
                </div>
            </div>

            {/* 4. Interview Strictness */}
            <div className="section-head">4. Interview Strictness & Behavior</div>
            <div className="grid-strict">
                <div className={`strict-card easy ${strict === 'friendly' ? 'active' : ''}`} onClick={() => setStrict('friendly')}>
                    <div className="strict-icon"><i className="fa-regular fa-face-smile"></i></div>
                    <div className="strict-title">Friendly (Easy)</div>
                    <div className="strict-desc">Supportive, gives hints, focuses on comfort. Good for internships.</div>
                </div>
                <div className={`strict-card medium ${strict === 'balanced' ? 'active' : ''}`} onClick={() => setStrict('balanced')}>
                    <div className="strict-icon"><i className="fa-solid fa-scale-balanced"></i></div>
                    <div className="strict-title">Balanced (Medium)</div>
                    <div className="strict-desc">Professional but fair. Standard industry interview style.</div>
                </div>
                <div className={`strict-card hard ${strict === 'strict' ? 'active' : ''}`} onClick={() => setStrict('strict')}>
                    <div className="strict-icon"><i className="fa-solid fa-gavel"></i></div>
                    <div className="strict-title">Strict (Hard)</div>
                    <div className="strict-desc">Grills the candidate. Zero tolerance for vague answers. Stress test.</div>
                </div>
            </div>

            <div style={{ height: '40px' }}></div>
        </div>
    );
};

// --- 4. Script Tab ---
const ScriptTab = () => {
    return (
        <div>
            <div className="script-banner">
                <i className="fa-solid fa-link" style={{ color: '#3b82f6' }}></i>
                <div>
                    <div style={{ fontSize: '11px', color: 'var(--primary-500)', fontWeight: 700, textTransform: 'uppercase' }}>Linked Configuration</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 500 }}>Targeting: <span style={{ opacity: 0.7 }}>(Selected Domain)</span></div>
                </div>
            </div>

            <div className="section-head"><i className="fa-solid fa-building"></i> Company Identity</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <input type="text" className="input-dark" placeholder="Company Name (e.g. TechFlow)" />
                <input type="text" className="input-dark" placeholder="Industry (e.g. Fintech)" />
            </div>

            <div className="section-head"><i className="fa-solid fa-user-tag"></i> Role Details</div>
            <input type="text" className="input-dark" placeholder="Job Title (e.g. Senior Backend Engineer)" style={{ marginBottom: '20px' }} />

            <div className="section-head">Evaluation Context & Requirements</div>
            <textarea className="input-dark" style={{ minHeight: '120px', resize: 'vertical' }} placeholder="Paste the JD or key requirements here..."></textarea>

            <button className="btn-gen-script">
                <i className="fa-solid fa-bolt"></i> Generate Professional Blueprint
            </button>
        </div>
    );
};

// --- 5. Reports Tab ---
const ReportsTab = () => {
    return (
        <div>
            <div className="kpi-row">
                <div className="kpi-box">
                    <div className="kpi-val" style={{ color: '#10b981' }}>12</div>
                    <div className="kpi-lbl">Shortlisted</div>
                </div>
                <div className="kpi-box">
                    <div className="kpi-val" style={{ color: '#ef4444' }}>5</div>
                    <div className="kpi-lbl">Rejected</div>
                </div>
                <div className="kpi-box">
                    <div className="kpi-val">42</div>
                    <div className="kpi-lbl">Under Review</div>
                </div>
            </div>

            <div className="section-head">RECENT INTERVIEWS</div>
            <table className="data-table">
                <thead><tr><th>Name</th><th>Status</th><th>Score</th><th>Date</th></tr></thead>
                <tbody>
                    <tr><td>Sarah Jenkins</td><td><span style={{ color: '#10b981' }}>Selected</span></td><td>9.2/10</td><td>Oct 24</td></tr>
                    <tr><td>Michael Chen</td><td><span style={{ color: '#ef4444' }}>Rejected</span></td><td>4.5/10</td><td>Oct 23</td></tr>
                </tbody>
            </table>
        </div>
    );
};

// --- 6. Cost Tab ---
const CostTab = () => {
    return (
        <div>
            <div className="cost-card">
                <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Estimated Total Cost</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--primary-500)', margin: '4px 0' }}>2,450 <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>Credits</span></div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}><i className="fa-solid fa-users"></i> Based on 150 Candidates</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Cost Per Interview</div>
                    <div style={{ fontSize: '16px', color: 'var(--text-main)', marginTop: '4px' }}>~16.3 Credits</div>
                </div>
            </div>

            <div className="cost-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <div className="section-head" style={{ marginBottom: '10px' }}>INVOICE BREAKDOWN</div>
                <div className="breakdown-row">
                    <span>Voice Intelligence (LLM)</span>
                    <span>1,500</span>
                </div>
                <div className="breakdown-row">
                    <span>Telephony Charges</span>
                    <span>750</span>
                </div>
                <div className="breakdown-row" style={{ borderBottom: 'none', paddingTop: '16px', color: 'var(--text-main)', fontWeight: 600 }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--warning)' }}>2,450</span>
                </div>
            </div>
        </div>
    );
};

export default Campaigns;
