import React from 'react';

const VideoAssistant = () => {
    return (
        <div id="video-assistant" className="view-section active" style={{
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--bg-body)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
        }}>

            {/* Background Decoration */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, var(--primary-100) 0%, transparent 70%)',
                opacity: 0.5,
                zIndex: 0
            }}></div>

            <div style={{ position: 'relative', zIndex: 10, maxWidth: '600px', padding: '0 20px' }}>
                <div style={{
                    fontSize: '64px',
                    marginBottom: '24px',
                    color: 'var(--primary-500)',
                    background: 'var(--primary-50)',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px auto',
                    boxShadow: '0 0 0 8px var(--bg-card)'
                }}>
                    <i className="fa-solid fa-video"></i>
                </div>

                <h1 style={{
                    fontSize: '32px',
                    marginBottom: '12px',
                    fontWeight: 700,
                    color: 'var(--text-main)'
                }}>Video Assistant</h1>

                <p style={{
                    fontSize: '16px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                    marginBottom: '32px'
                }}>
                    Our high-fidelity visual AI interviewer is currently in the lab. <br />
                    We are fine-tuning realtime emotion analysis and avatar responsiveness.
                </p>

                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '20px',
                    color: 'var(--primary-600)',
                    fontWeight: 600,
                    fontSize: '13px',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <span style={{
                        width: '8px',
                        height: '8px',
                        background: 'var(--primary-500)',
                        borderRadius: '50%',
                        display: 'block',
                        boxShadow: '0 0 0 2px var(--primary-100)'
                    }}></span>
                    Coming Soon
                </div>
            </div>
        </div>
    );
};

export default VideoAssistant;
