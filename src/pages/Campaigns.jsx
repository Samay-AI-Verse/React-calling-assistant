import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Campaigns.css'; // Import the new styles

const Campaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [activeTab, setActiveTab] = useState('source'); // Default tab for viewed campaign

    // Wizard State
    const [isCreating, setIsCreating] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [wizardData, setWizardData] = useState({
        name: '',
        source: [], // candidates
        mode: 'technical', // interview steps
        agent: 'aanya',
        voice: 'raju',
        lang: 'en-us',
        strict: 'balanced',
        script: '',
        company: '',
        industry: '',
        jobTitle: ''
    });

    // Launch Modal State
    const [showLaunchModal, setShowLaunchModal] = useState(false);
    const [blueprintData, setBlueprintData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    // Fetch campaigns from backend
    const fetchCampaigns = async () => {
        try {
            const res = await axios.get('/api/campaigns');
            if (res.data && res.data.campaigns) {
                setCampaigns(res.data.campaigns);

                let target = null;
                // If we have a selected campaign, refresh its data from the new list
                if (selectedCampaign) {
                    const found = res.data.campaigns.find(c => c.id === selectedCampaign.id);
                    if (found) target = found;
                }
                // Else select first if none selected and not creating
                else if (res.data.campaigns.length > 0 && !isCreating) {
                    target = res.data.campaigns[0];
                }

                if (target) {
                    setSelectedCampaign(target);
                    // UX IMPROVEMENT: If the default/selected campaign is "In Design", automatically open the wizard
                    // This fixes the confusing "uncomplete" state on refresh
                    if (target.status === 'In Design') {
                        setWizardData(target.config || {});
                        setCurrentStep(target.config?.currentStep || 2);
                        setIsCreating(true);
                    } else if (isCreating && target.status !== 'In Design') {
                        // If we were creating but now selected a completed one, stop creating
                        setIsCreating(false);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const startCreation = () => {
        setIsCreating(true);
        setSelectedCampaign(null);
        setCurrentStep(1);
        setWizardData({
            name: '', source: [], mode: 'technical', agent: 'aanya', voice: 'raju', lang: 'en-us', strict: 'balanced', script: '', company: '', industry: '', jobTitle: ''
        });
    };

    const handleDeleteCampaign = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this campaign? This cannot be undone.")) {
            try {
                await axios.delete(`/api/campaigns/${id}`);
                const updatedList = campaigns.filter(c => c.id !== id);
                setCampaigns(updatedList);
                if (selectedCampaign && selectedCampaign.id === id) {
                    setSelectedCampaign(updatedList.length > 0 ? updatedList[0] : null);
                }
            } catch (error) {
                console.error("Error deleting campaign:", error);
                showToast("Failed to delete campaign", "error");
            }
        }
    };

    const confirmLaunch = async () => {
        if (!selectedCampaign) return;

        try {
            // USER REQUEST: Call the actual launch endpoint to trigger Vapi calls
            await axios.post('/api/launch-campaign', {
                campaign_id: selectedCampaign.id,
                vapi_agent_id: wizardData.agent || 'aanya', // Pass the selected agent key
                vapi_voice_id: wizardData.voice || 'raju',  // Pass the selected voice key
                system_prompt: blueprintData?.system_prompt || wizardData.script,
                strictness: wizardData.strict,
                interview_mode: wizardData.mode
            });

            await fetchCampaigns();
            setIsCreating(false);
            setShowLaunchModal(false);
            setActiveTab('source');
            showToast("Campaign Launched! Calls are being initiated.", "success");

            // Force update local status immediately to avoid UI lag
            if (selectedCampaign) {
                setSelectedCampaign(prev => ({ ...prev, status: 'Active' }));
            }
        } catch (error) {
            console.error("Error launching campaign:", error);
            // Fallback
            try {
                await axios.put(`/api/campaigns/${selectedCampaign.id}`, {
                    config: wizardData,
                    status: 'Active'
                });
                setIsCreating(false);
                setShowLaunchModal(false);
                showToast("Campaign Marked Active (Call init failed)", "warning");
                if (selectedCampaign) {
                    setSelectedCampaign(prev => ({ ...prev, status: 'Active' }));
                }
            } catch (e) {
                showToast("Failed to update campaign status", "error");
            }
        }
    };

    // Validation Helper
    const isStepValid = () => {
        if (currentStep === 1) return !!wizardData.name.trim(); // Name required
        if (currentStep === 2) return wizardData.source && wizardData.source.length > 0; // At least 1 candidate
        if (currentStep === 3) return !!wizardData.mode; // Mode required (default is set, so usually true)
        if (currentStep === 4) return !!wizardData.agent && !!wizardData.voice; // Agent & Voice required
        if (currentStep === 5) {
            const s = wizardData.script || '';
            const c = wizardData.company || '';
            const j = wizardData.jobTitle || '';
            return !!s.trim() && !!c.trim() && !!j.trim();
        }
        return true;
    };

    const handleWizardNext = async () => {
        if (!isStepValid()) {
            showToast("Please complete the required fields.", "error");
            return;
        }

        if (currentStep === 1) {
            if (!wizardData.name) {
                showToast("Please enter a campaign name", "error");
                return;
            }

            // Check for duplicate name locally
            const existing = campaigns.find(c => c.name.toLowerCase() === wizardData.name.toLowerCase());
            if (existing) {
                // USER REQUEST: Resume/Edit existing campaign instead of blocking
                setSelectedCampaign(existing);
                // Load existing config if available to ensure continuity
                if (existing.config) {
                    setWizardData(prev => ({ ...prev, ...existing.config, name: existing.name }));
                }
                setCurrentStep(currentStep + 1);
                return;
            }

            // Create Campaign immediately
            try {
                // Determine status - 'In Design' for drafts
                const res = await axios.post('/api/campaigns/create', {
                    name: wizardData.name,
                    type: 'audio',
                    status: 'In Design',
                    config: { ...wizardData, currentStep: currentStep + 1 } // Save next step
                });

                if (res.data && res.data.campaign) {
                    await fetchCampaigns(); // Refresh list to show new campaign
                    setSelectedCampaign(res.data.campaign); // Select it
                    // Move to next step
                    setCurrentStep(currentStep + 1);
                }
            } catch (error) {
                console.error("Error creating campaign:", error);
                showToast("Failed to create campaign.", "error");
            }
            return;
        }

        if (currentStep < 5) {
            // Auto-save intermediate progress
            try {
                if (selectedCampaign) {
                    const nextStep = currentStep + 1;
                    const updatedConfig = { ...wizardData, currentStep: nextStep };

                    await axios.put(`/api/campaigns/${selectedCampaign.id}`, {
                        config: updatedConfig
                    });
                    // Update local state so if user exits, they see the new data
                    setSelectedCampaign(prev => ({ ...prev, config: updatedConfig }));
                }
            } catch (err) {
                console.warn("Auto-save failed", err);
            }
            setCurrentStep(currentStep + 1);
        } else {
            // FINISH - Generate Blueprint Call

            // 1. Validation
            if (!isStepValid()) {
                showToast("Please paste the JD or Script.", "error");
                return;
            }

            // Save the script to the campaign before generating
            try {
                if (selectedCampaign) {
                    await axios.put(`/api/campaigns/${selectedCampaign.id}`, {
                        config: { ...wizardData, currentStep: 5 }
                    });
                }
            } catch (err) {
                console.warn("Final save failed", err);
            }

            setIsGenerating(true);
            try {
                // 2. Call API to generate blueprint
                const res = await axios.post('/api/generate-blueprint', {
                    company_name: 'TechCompany', // You could add this to wizard if needed
                    job_role: wizardData.name,
                    description: wizardData.script,
                    candidate_count: wizardData.source.length,
                    agent_persona: wizardData.agent,
                    strictness: wizardData.strict,
                    interview_mode: wizardData.mode,
                    duration: 15
                });

                if (res.data) {
                    setBlueprintData(res.data);
                    setShowLaunchModal(true);
                }
            } catch (e) {
                console.error("Blueprint generation failed", e);
                // Fallback if API fails
                setBlueprintData({
                    system_prompt: wizardData.script,
                    estimated_duration: "15 mins"
                });
                setShowLaunchModal(true);
            } finally {
                setIsGenerating(false);
            }
        }
    };

    const handleWizardBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            setIsCreating(false); // Cancel creation
            if (campaigns.length > 0) setSelectedCampaign(campaigns[0]);
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

                <button className="btn-new-campaign" onClick={startCreation}>
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
                            onClick={() => {
                                setSelectedCampaign(camp);
                                setShowLaunchModal(false); // Ensure modal is closed
                                // Resume wizard if campaign is In Design
                                if (camp.status === 'In Design' || (camp.config && camp.config.currentStep && camp.config.currentStep < 5)) {
                                    setWizardData(camp.config || {});
                                    setCurrentStep(camp.config?.currentStep || 2); // Default to step 2 if In Design but no step saved
                                    setIsCreating(true);
                                } else {
                                    setIsCreating(false);
                                }
                            }}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}
                        >
                            <div style={{ overflow: 'hidden' }}>
                                <div className="nav-item-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{camp.name}</div>
                                {/* <div className="nav-item-meta">#{camp.id.substring(0, 8)}</div> */}
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
                {isCreating ? (
                    <div className="wizard-container">
                        {/* 1. Header */}
                        <div className="wizard-header">
                            <div className="wizard-title">
                                <h2>
                                    <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--primary-500)' }}></i>
                                    New Campaign
                                </h2>
                            </div>
                            <button className="btn-cancel" onClick={() => setIsCreating(false)}>
                                <i className="fa-solid fa-xmark"></i> Cancel
                            </button>
                        </div>

                        {/* 2. Progress Bar */}
                        <div className="wizard-progress-bar">
                            <div className="progress-track">
                                {[
                                    { num: 1, label: 'Campaign Details' },
                                    { num: 2, label: 'Source Data' },
                                    { num: 3, label: 'Interview Flow' },
                                    { num: 4, label: 'AI Persona' },
                                    { num: 5, label: 'Script & Context' }
                                ].map((step) => (
                                    <div key={step.num} className={`progress-step ${currentStep === step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}>
                                        <div className="step-circle">
                                            {currentStep > step.num ? <i className="fa-solid fa-check"></i> : step.num}
                                        </div>
                                        {step.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Scrollable Content Area */}
                        <div className="wizard-content-scroll">
                            <div className="wizard-step-anim">
                                {/* Step 1: Name */}
                                {currentStep === 1 && (
                                    <div style={{ maxWidth: '600px', margin: '100px auto' }}>
                                        <h2 style={{ marginBottom: '12px', fontSize: '24px' }}>Let's start with a name</h2>
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                                            What position or role are you hiring for? This helps categorize your interviews.
                                        </p>
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>CAMPAIGN NAME</label>
                                            <input
                                                type="text"
                                                className="input-dark"
                                                placeholder="e.g. Senior Backend Developer - Q1 2024"
                                                style={{ fontSize: '18px', padding: '20px' }}
                                                value={wizardData.name}
                                                onChange={(e) => setWizardData({ ...wizardData, name: e.target.value })}
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Source Data */}
                                {currentStep === 2 && (
                                    <>
                                        <div style={{ marginBottom: '24px', textAlign: 'center', marginLeft: '10px' }}>
                                            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Who should we call?</h2>
                                            <p style={{ color: 'var(--text-secondary)' }}>Upload a CSV list of candidates or add them manually.</p>
                                        </div>
                                        <SourceDataTab
                                            campaignId={selectedCampaign ? selectedCampaign.id : "temp"}
                                            isWizard={true}
                                            initialData={wizardData.source}
                                            setData={(data) => setWizardData({ ...wizardData, source: data })}
                                        />
                                    </>
                                )}

                                {/* Step 3: Flow */}
                                {currentStep === 3 && (
                                    <>
                                        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                                            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Configure the Interview</h2>
                                            <p style={{ color: 'var(--text-secondary)' }}>Choose the structure and strictness of the AI interviewer.</p>
                                        </div>
                                        <InterviewStepsTab
                                            isWizard={true}
                                            setData={(mode) => setWizardData({ ...wizardData, mode })}
                                            initialMode={wizardData.mode}
                                        />
                                    </>
                                )}

                                {/* Step 4: Persona */}
                                {currentStep === 4 && (
                                    <>
                                        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                                            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Select your AI Recruiter</h2>
                                            <p style={{ color: 'var(--text-secondary)' }}>Choose a persona and voice that matches your company culture.</p>
                                        </div>
                                        <AgentSelector
                                            isWizard={true}
                                            setData={(data) => setWizardData({ ...wizardData, ...data })}
                                            initialData={wizardData}
                                        />
                                    </>
                                )}

                                {/* Step 5: Script */}
                                {currentStep === 5 && (
                                    <>
                                        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                                            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Job Context & Script</h2>
                                            <p style={{ color: 'var(--text-secondary)' }}>Provide the Job Description so the AI knows what to look for.</p>
                                        </div>
                                        <ScriptTab
                                            isWizard={true}
                                            setData={(data) => setWizardData({ ...wizardData, ...data })}
                                            data={wizardData}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* 4. Footer Actions */}
                        <div className="wizard-footer">
                            {(currentStep !== 1 && currentStep !== 2) ? (
                                <button className="btn-back" onClick={handleWizardBack}>Back</button>
                            ) : <div></div>}

                            <div style={{ display: 'flex', gap: '12px' }}>
                                {currentStep < 5 ? (
                                    <button
                                        className="btn-next"
                                        onClick={handleWizardNext}
                                        disabled={!isStepValid()}
                                        style={{ opacity: isStepValid() ? 1 : 0.5, cursor: isStepValid() ? 'pointer' : 'not-allowed' }}
                                    >
                                        {currentStep === 1 ? 'Create Campaign' : 'Next Step'} <i className="fa-solid fa-arrow-right"></i>
                                    </button>
                                ) : (
                                    <button
                                        className="btn-next btn-launch"
                                        onClick={handleWizardNext}
                                        disabled={isGenerating || !isStepValid()}
                                        style={{ opacity: (!isGenerating && isStepValid()) ? 1 : 0.5, cursor: (!isGenerating && isStepValid()) ? 'pointer' : 'not-allowed' }}
                                    >
                                        {isGenerating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                                        {isGenerating ? ' Generating...' : ' Generate Professional Blueprint'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : selectedCampaign ? (
                    <>
                        {/* Header */}
                        <header className="vapi-header">
                            <div className="header-left" style={{ display: 'flex', alignItems: 'center' }}>
                                <h2>{selectedCampaign.name}</h2>
                                <span className={`status-badge ${selectedCampaign.status === 'Active' ? 'active-status' : ''}`}>● {selectedCampaign.status}</span>
                            </div>
                            {selectedCampaign.status === 'Active' ? (
                                <button className="btn-start stop-mode">
                                    <i className="fa-solid fa-stop"></i> Stop Campaign
                                </button>
                            ) : (
                                <button className="btn-start">
                                    <i className="fa-solid fa-rocket"></i> Start Campaign
                                </button>
                            )}
                        </header>

                        {/* Tabs - Consolidated */}
                        <div className="tabs-bar">
                            <button className={`tab-btn ${activeTab === 'source' ? 'active' : ''}`} onClick={() => setActiveTab('source')}>
                                <i className="fa-solid fa-database"></i> Source Data
                            </button>
                            <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                                <i className="fa-solid fa-chart-pie"></i> Reports
                            </button>
                            <button className={`tab-btn ${activeTab === 'cost' ? 'active' : ''}`} onClick={() => setActiveTab('cost')}>
                                <i className="fa-solid fa-coins"></i> Cost
                            </button>
                            <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                                <i className="fa-solid fa-sliders"></i> Edit Configuration
                            </button>
                        </div>

                        {/* Content */}
                        <div className="form-scroll-area">
                            {activeTab === 'source' && (
                                <SourceDataTab
                                    campaignId={selectedCampaign.id}
                                    initialData={selectedCampaign.config?.source || []}
                                />
                            )}
                            {activeTab === 'reports' && <ReportsTab />}
                            {activeTab === 'cost' && <CostTab />}
                            {activeTab === 'settings' && (
                                <div className="tab-content-wrapper">
                                    <div className="section-head">Interview Configuration</div>
                                    <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '32px' }}>
                                        <InterviewStepsTab />
                                    </div>

                                    <div className="section-head">AI Persona Settings</div>
                                    <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '32px' }}>
                                        <AgentSelector />
                                    </div>


                                </div>
                            )}
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

            {/* Launch Modal - Full Screen Blueprint */}
            {showLaunchModal && (
                <div className="modal-overlay fullscreen">
                    <div className="modal-content fullscreen-content">
                        {/* ... Modal Code ... */}
                        <div className="modal-header fullscreen-header">
                            <h3>
                                <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--primary-500)' }}></i>
                                Campaign Blueprint Verification
                            </h3>
                            <button className="btn-close-modal" onClick={() => setShowLaunchModal(false)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="modal-body fullscreen-body">
                            {/* Left: System Prompt */}
                            <div className="blueprint-preview">
                                <div style={{ marginBottom: '16px', color: 'var(--text-tertiary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    // GENERATED SYSTEM PROMPT
                                </div>
                                {blueprintData?.system_prompt || wizardData.script}
                            </div>

                            {/* Right: Stats & Action */}
                            <div className="blueprint-sidebar">
                                <div className="blueprint-stat-card">
                                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Campaign Name</label>
                                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '20px' }}>{wizardData.name}</div>

                                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Candidates</label>
                                    <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary-500)' }}>
                                        {wizardData.source ? wizardData.source.length : 0}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Ready to queue</div>
                                </div>

                                <div className="blueprint-stat-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Est. Duration</span>
                                        <span style={{ fontWeight: '600' }}>{blueprintData?.estimated_duration || "15 mins"} / call</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Agent Persona</span>
                                        <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{wizardData.agent}</span>
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontSize: '12px', color: '#ef4444' }}>
                                    <i className="fa-solid fa-triangle-exclamation"></i> Warning: Launching will immediately initiate calls to {wizardData.source ? wizardData.source.length : 0} candidates.
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer fullscreen-footer">
                            <button className="btn-cancel" onClick={() => setShowLaunchModal(false)} style={{ border: '1px solid var(--border-subtle)', padding: '12px 24px' }}>
                                Back to Edit
                            </button>
                            <button className="btn-next btn-launch" onClick={confirmLaunch} style={{ padding: '12px 32px', fontSize: '16px' }}>
                                <i className="fa-solid fa-rocket"></i> Launch Campaign
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div className={`toast-notification ${toast.type}`}>
                    <i className={`fa-solid ${toast.type === 'success' ? 'fa-check-circle' : toast.type === 'error' ? 'fa-triangle-exclamation' : 'fa-info-circle'}`}></i>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

// --- 1. Source Data Tab ---
const SourceDataTab = ({ campaignId, isWizard, setData, initialData }) => {
    const [candidates, setCandidates] = useState(initialData || []);

    // Manual State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    const handleAdd = () => {
        if (name && phone) {
            const newList = [...candidates, { name, phone, email }];
            setCandidates(newList);
            setName(''); setPhone(''); setEmail('');
            if (isWizard && setData) setData(newList);
        }
    };

    return (
        <div>
            {!isWizard && (
                <div className="upload-zone">
                    <i className="fa-solid fa-cloud-arrow-up upload-icon"></i>
                    <h3 style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '8px' }}>Bulk Import Candidates</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Drag & drop CSV or Excel files here</p>
                </div>
            )}

            {isWizard && (
                <div style={{ marginBottom: '24px', padding: '20px', border: '2px dashed var(--border-subtle)', borderRadius: '8px', textAlign: 'center' }}>
                    Click to upload CSV (Mock)
                </div>
            )}

            <div className="section-head" style={{ marginTop: '30px', marginBottom: '16px' }}>
                ADD CANDIDATE
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
const InterviewStepsTab = ({ isWizard, setData, initialData }) => {
    const [mode, setMode] = useState(initialData?.mode || 'technical');
    const [duration, setDuration] = useState(initialData?.duration || '15 Mins');

    const update = (key, val) => {
        if (key === 'mode') {
            setMode(val);
            if (isWizard && setData) setData({ mode: val, duration });
        }
        if (key === 'duration') {
            setDuration(val);
            if (isWizard && setData) setData({ mode, duration: val });
        }
    };

    return (
        <div>
            {!isWizard && <div className="section-head">1. INTERVIEW MODE</div>}
            <div className="grid-steps">
                {/* Technical */}
                <div className={`step-card ${mode === 'technical' ? 'active' : ''}`} onClick={() => update('mode', 'technical')}>
                    <div className="step-orb" style={{ background: 'conic-gradient(from 180deg, #ef4444, #7f1d1d)' }}></div>
                    <div style={{ fontWeight: 600, marginBottom: '6px' }}>Technical</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Coding & System Design</div>
                </div>
                {/* HR */}
                <div className={`step-card ${mode === 'hr' ? 'active' : ''}`} onClick={() => update('mode', 'hr')}>
                    <div className="step-orb" style={{ background: 'conic-gradient(from 180deg, #eab308, #713f12)' }}></div>
                    <div style={{ fontWeight: 600, marginBottom: '6px' }}>HR Round</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Culture & Soft Skills</div>
                </div>
                {/* Mixed */}
                <div className={`step-card ${mode === 'mixed' ? 'active' : ''}`} onClick={() => update('mode', 'mixed')}>
                    <div className="step-orb" style={{ background: 'conic-gradient(from 180deg, cyan, #0e7490)' }}></div>
                    <div style={{ fontWeight: 600, marginBottom: '6px' }}>Mixed</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>50% Tech + 50% HR</div>
                </div>
            </div>

            <div className="section-head">2. DURATION</div>
            <div style={{ display: 'flex', gap: '12px' }}>
                {['15 Mins', '20 Mins', '30 Mins', '45 Mins'].map(t => (
                    <button
                        key={t}
                        onClick={() => update('duration', t)}
                        className={`duration-btn ${duration === t ? 'active' : ''}`}
                    >
                        {t}
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- 3. Agent Selector (AI Persona) ---
const AgentSelector = ({ isWizard, setData, initialData }) => {
    const [persona, setPersona] = useState(initialData?.agent || 'aanya');
    const [voice, setVoice] = useState(initialData?.voice || 'raju');
    const [lang, setLang] = useState(initialData?.lang || 'en-us');
    const [strict, setStrict] = useState(initialData?.strict || 'balanced');

    // Helper to bubble up changes
    const update = (key, val) => {
        if (key === 'persona') setPersona(val);
        if (key === 'voice') setVoice(val);
        if (key === 'lang') setLang(val);
        if (key === 'strict') setStrict(val);

        if (isWizard && setData) {
            // We need current state but state updates are async, 
            // construct object based on what we know + change
            setData({
                agent: key === 'persona' ? val : persona,
                voice: key === 'voice' ? val : voice,
                lang: key === 'lang' ? val : lang,
                strict: key === 'strict' ? val : strict
            });
        }
    };

    return (
        <div>
            {/* 1. AI Persona */}
            <div className="section-head">1. Select AI Agent Persona</div>
            <div className="grid-personas">
                <div className={`persona-card ${persona === 'aanya' ? 'active' : ''}`} onClick={() => update('persona', 'aanya')}>
                    <div className="persona-avatar purple"></div>
                    <div className="persona-name">Aanya - HR Pro</div>
                    <div className="persona-desc">Polite & structured. Best for verification & screening.</div>
                </div>
                <div className={`persona-card ${persona === 'rohan' ? 'active' : ''}`} onClick={() => update('persona', 'rohan')}>
                    <div className="persona-avatar blue"></div>
                    <div className="persona-name">Rohan - Tech Lead</div>
                    <div className="persona-desc">Direct & technical. Drills down into logic and coding concepts.</div>
                </div>
                <div className={`persona-card ${persona === 'kavya' ? 'active' : ''}`} onClick={() => update('persona', 'kavya')}>
                    <div className="persona-avatar orange"></div>
                    <div className="persona-name">Kavya - Casual</div>
                    <div className="persona-desc">Warm, relaxed & conversational. Great for culture fit assessment.</div>
                </div>
            </div>

            {/* 2. Voice Model */}
            <div className="section-head">2. Select Voice Model</div>
            <div className="grid-voices">
                <div className={`voice-card ${voice === 'raju' ? 'active' : ''}`} onClick={() => update('voice', 'raju')}>
                    <div className="voice-orb" style={{ background: 'conic-gradient(#ea580c, #fdba74)' }}></div>
                    <div className="voice-info">
                        <h4>Raju <i className="fa-solid fa-circle-check" style={{ color: '#3b82f6', fontSize: '12px' }}></i></h4>
                        <div className="voice-tag">🇮🇳 Hindi + English</div>
                    </div>
                </div>
                <div className={`voice-card ${voice === 'priya' ? 'active' : ''}`} onClick={() => update('voice', 'priya')}>
                    <div className="voice-orb" style={{ background: 'conic-gradient(#dc2626, #fca5a5)' }}></div>
                    <div className="voice-info">
                        <h4>Priya</h4>
                        <div className="voice-tag">🇮🇳 English</div>
                    </div>
                </div>
                <div className={`voice-card ${voice === 'anjali' ? 'active' : ''}`} onClick={() => update('voice', 'anjali')}>
                    <div className="voice-orb" style={{ background: 'conic-gradient(#7c3aed, #d8b4fe)' }}></div>
                    <div className="voice-info">
                        <h4>Anjali <i className="fa-solid fa-circle-check" style={{ color: '#3b82f6', fontSize: '12px' }}></i></h4>
                        <div className="voice-tag">🇮🇳 Marathi (मराठी)</div>
                    </div>
                </div>
            </div>
            {/* Show "See More Voices" button if needed (from screenshot) */}
            {!isWizard && (
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <button style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '8px 16px', borderRadius: '20px', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' }}>
                        See More Voices <i className="fa-solid fa-chevron-down"></i>
                    </button>
                </div>
            )}


            {/* 3. Communication Language */}
            <div className="section-head">3. Communication Language</div>
            <div className="grid-langs">
                {/* Simplified view for creation flow, add full grid back if needed */}
                <div className={`lang-card ${lang === 'en-us' ? 'active' : ''}`} onClick={() => update('lang', 'en-us')}>
                    <img src="https://flagcdn.com/w40/us.png" alt="US" className="flag" />
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>English (US)</div>
                    {!isWizard && <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Professional</div>}
                </div>
                <div className={`lang-card ${lang === 'en-in' ? 'active' : ''}`} onClick={() => update('lang', 'en-in')}>
                    <img src="https://flagcdn.com/w40/in.png" alt="IN" className="flag" />
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>English (India)</div>
                    {!isWizard && <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Native Accent</div>}
                </div>
                <div className={`lang-card ${lang === 'hi' ? 'active' : ''}`} onClick={() => update('lang', 'hi')}>
                    <img src="https://flagcdn.com/w40/in.png" alt="IN" className="flag" />
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>Hindi {!isWizard && '(हिंदी)'}</div>
                    {!isWizard && <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Formal / Casual</div>}
                </div>
                <div className={`lang-card ${lang === 'mr' ? 'active' : ''}`} onClick={() => update('lang', 'mr')}>
                    <img src="https://flagcdn.com/w40/in.png" alt="IN" className="flag" />
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>Marathi {!isWizard && '(मराठी)'}</div>
                    {!isWizard && <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Regional</div>}
                </div>
            </div>

            {/* 4. Interview Strictness */}
            <div className="section-head">4. Interview Strictness {!isWizard && '& Behavior'}</div>
            <div className="grid-strict">
                <div className={`strict-card easy ${strict === 'friendly' ? 'active' : ''}`} onClick={() => update('strict', 'friendly')}>
                    <div className="strict-icon"><i className="fa-regular fa-face-smile"></i></div>
                    <div className="strict-title">Friendly {!isWizard && '(Easy)'}</div>
                    {!isWizard && <div className="strict-desc">Supportive, gives hints, focuses on comfort. Good for internships.</div>}
                </div>
                <div className={`strict-card medium ${strict === 'balanced' ? 'active' : ''}`} onClick={() => update('strict', 'balanced')}>
                    <div className="strict-icon"><i className="fa-solid fa-scale-balanced"></i></div>
                    <div className="strict-title">Balanced {!isWizard && '(Medium)'}</div>
                    {!isWizard && <div className="strict-desc">Professional but fair. Standard industry interview style.</div>}
                </div>
                <div className={`strict-card hard ${strict === 'strict' ? 'active' : ''}`} onClick={() => update('strict', 'strict')}>
                    <div className="strict-icon"><i className="fa-solid fa-gavel"></i></div>
                    <div className="strict-title">Strict {!isWizard && '(Hard)'}</div>
                    {!isWizard && <div className="strict-desc">Grills the candidate. Zero tolerance for vague answers. Stress test.</div>}
                </div>
            </div>

            <div style={{ height: '40px' }}></div>
        </div>
    );
};

// --- 4. Script Tab ---
const ScriptTab = ({ isWizard, setData, data }) => {
    const update = (key, val) => {
        if (isWizard && setData) setData({ [key]: val });
    };

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
                <input
                    type="text"
                    className="input-dark"
                    placeholder="Company Name (e.g. TechFlow)"
                    value={data?.company || ''}
                    onChange={(e) => update('company', e.target.value)}
                />
                <input
                    type="text"
                    className="input-dark"
                    placeholder="Industry (e.g. Fintech)"
                    value={data?.industry || ''}
                    onChange={(e) => update('industry', e.target.value)}
                />
            </div>

            <div className="section-head"><i className="fa-solid fa-user-tag"></i> Role Details</div>
            <input
                type="text"
                className="input-dark"
                placeholder="Job Title (e.g. Senior Backend Engineer)"
                style={{ marginBottom: '20px' }}
                value={data?.jobTitle || ''}
                onChange={(e) => update('jobTitle', e.target.value)}
            />

            <div className="section-head">Evaluation Context & Requirements</div>
            <textarea
                className="input-dark"
                style={{ minHeight: '120px', resize: 'vertical' }}
                placeholder="Paste the JD or key requirements here..."
                value={data?.script || ''}
                onChange={(e) => update('script', e.target.value)}
            ></textarea>
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
