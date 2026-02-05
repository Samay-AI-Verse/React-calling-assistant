import React, { useEffect, useRef } from 'react';

const VideoAssistant = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const createStars = (numStars, minSpeed, maxSpeed) => {
            const container = containerRef.current;
            if (!container) return;
            container.innerHTML = ''; // Clear

            for (let i = 0; i < numStars; i++) {
                const star = document.createElement('div');
                star.className = 'star';

                // Random position
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                star.style.left = `${x}%`;
                star.style.top = `${y}%`;
                star.style.position = 'absolute';
                star.style.backgroundColor = 'white';
                star.style.borderRadius = '50%';

                // Random size
                const size = Math.random() * 3 + 1;
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;

                // Animation
                const duration = Math.random() * (maxSpeed - minSpeed) + minSpeed;
                const delay = Math.random() * (minSpeed * 0.5);

                star.style.animation = `twinkle ${duration}s infinite ${delay}s ease-in-out alternate`;
                star.style.opacity = Math.random();

                container.appendChild(star);
            }
        };

        createStars(200, 2, 5);
    }, []);

    return (
        <div id="video-assistant" className="view-section active" style={{ height: '100%', position: 'relative', overflow: 'hidden', background: 'radial-gradient(circle at center, #1b0f19 0%, #000000 100%)' }}>
            <style>{`
                @keyframes twinkle {
                    0% { opacity: 0.2; transform: scale(0.8); }
                    100% { opacity: 1; transform: scale(1.2); }
                }
            `}</style>

            <div className="stars-background" ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
                {/* Stars injected here */}
            </div>

            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white', textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px', color: 'var(--primary-500)' }}>
                    <i className="fa-solid fa-video"></i>
                </div>
                <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Video Assistant</h1>
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '500px' }}>
                    Visual AI Interviewer capabilities are currently under development.
                    Expect high-fidelity avatars and realtime emotion analysis soon.
                </p>
                <div className="badge badge-primary" style={{ marginTop: '20px', padding: '8px 16px', fontSize: '14px' }}>
                    Coming Soon
                </div>
            </div>
        </div>
    );
};

export default VideoAssistant;
