import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Candidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const res = await axios.get('/api/candidates/all');
                setCandidates(res.data.candidates || []);
            } catch (err) {
                console.error("Failed to load candidates", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCandidates();
    }, []);

    const showToast = (msg) => {
        // Implement global toast or local alert
        alert(msg);
    };

    return (
        <div className="view-section active">
            <div className="table-container">
                <div className="table-header">
                    <h3>All Candidates</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-secondary btn-sm"><i className="fa-solid fa-filter"></i> Filter</button>
                        <button className="btn btn-primary btn-sm" onClick={() => showToast('Add Candidate modal would open here')}>
                            <i className="fa-solid fa-plus"></i> Import CSV
                        </button>
                    </div>
                </div>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Campaign</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                                        <i className="fa-solid fa-circle-notch fa-spin"></i> Loading candidates...
                                    </td>
                                </tr>
                            ) : candidates.length > 0 ? (
                                candidates.map((c, i) => (
                                    <tr key={i}>
                                        <td><strong>{c.name}</strong></td>
                                        <td className="text-muted">{c.email || c.phone}</td>
                                        <td><span className="badge badge-neutral">{c.campaign_name || 'N/A'}</span></td>
                                        <td><span className="badge badge-warning">{c.status}</span></td>
                                        <td>
                                            <button className="icon-btn btn-sm ghost"><i className="fa-solid fa-ellipsis"></i></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center p-4">No candidates found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Candidates;
