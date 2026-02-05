import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Login = () => {
    const mountRef = useRef(null);
    const textRef = useRef(null);
    const leftPanelRef = useRef(null);

    useEffect(() => {
        // --- Three.js Setup ---
        const container = mountRef.current;
        if (!container) return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.005);

        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 10;
        camera.position.y = 0;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Geometry
        const geometry = new THREE.TorusKnotGeometry(1.3, 0.4, 150, 32);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x111111,
            metalness: 0.7,
            roughness: 0.2,
            transparent: true,
            opacity: 0.9,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });
        const knot = new THREE.Mesh(geometry, material);
        scene.add(knot);

        // Stars
        const particlesGeo = new THREE.BufferGeometry();
        const particleCount = 700;
        const posArray = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 40;
        }
        particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMat = new THREE.PointsMaterial({
            size: 0.05,
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
        });
        const starField = new THREE.Points(particlesGeo, particlesMat);
        scene.add(starField);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
        scene.add(ambientLight);
        const light1 = new THREE.PointLight(0xf97316, 2, 50);
        light1.position.set(5, 5, 5);
        scene.add(light1);
        const light2 = new THREE.PointLight(0x3b82f6, 2, 50);
        light2.position.set(-5, 0, 5);
        scene.add(light2);
        const light3 = new THREE.DirectionalLight(0xffffff, 1);
        light3.position.set(0, 5, -5);
        scene.add(light3);

        // Animation
        let reqId;
        const animate = () => {
            reqId = requestAnimationFrame(animate);
            const time = Date.now() * 0.0005;

            knot.rotation.x = Math.sin(time * 0.5) * 0.2;
            knot.rotation.y += 0.006;
            knot.position.y = -0.5 + Math.sin(time * 2) * 0.15;

            starField.rotation.y = time * 0.05;
            starField.rotation.x = time * 0.02;

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!container) return;
            const width = container.clientWidth;
            const height = container.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(reqId);
            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            particlesGeo.dispose();
            particlesMat.dispose();
        };
    }, []);

    // --- Text Scramble Effect ---
    useEffect(() => {
        const el = textRef.current;
        if (!el) return;

        const phrases = [
            "System Initialized",
            "Analyzing Talent Data",
            "Chetanalab's Online",
            "Optimizing Workflow",
            "Welcome, Commander"
        ];
        const chars = '!<>-_\\/[]{}—=+*^?#________';

        let frameRequest;
        let queue = [];
        let frame = 0;

        const update = (resolve) => {
            let output = '';
            let complete = 0;
            for (let i = 0, n = queue.length; i < n; i++) {
                let { from, to, start, end, char } = queue[i];
                if (frame >= end) {
                    complete++;
                    output += to;
                } else if (frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = chars[Math.floor(Math.random() * chars.length)];
                        queue[i].char = char;
                    }
                    output += `<span style="opacity: 0.3">${char}</span>`;
                } else {
                    output += from;
                }
            }
            el.innerHTML = output;
            if (complete === queue.length) {
                resolve();
            } else {
                frameRequest = requestAnimationFrame(() => update(resolve));
                frame++;
            }
        };

        const setText = (newText) => {
            const oldText = el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => {
                queue = [];
                for (let i = 0; i < length; i++) {
                    const from = oldText[i] || '';
                    const to = newText[i] || '';
                    const start = Math.floor(Math.random() * 40);
                    const end = start + Math.floor(Math.random() * 40);
                    queue.push({ from, to, start, end });
                }
                cancelAnimationFrame(frameRequest);
                frame = 0;
                update(resolve);
            });
            return promise;
        };

        let counter = 0;
        const next = () => {
            setText(phrases[counter]).then(() => {
                setTimeout(next, 2500);
            });
            counter = (counter + 1) % phrases.length;
        };
        next();

        return () => cancelAnimationFrame(frameRequest);
    }, []);

    // --- Mouse Move Effect on Left Panel ---
    const handleMouseMove = (e) => {
        if (!leftPanelRef.current) return;
        const rect = leftPanelRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        leftPanelRef.current.style.setProperty('--mouse-x', `${x}px`);
        leftPanelRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    return (
        <div className="container" style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', overflow: 'hidden' }}>
            <style>{`
            .container-box {
                width: 85%;
                max-width: 900px;
                height: 70vh;
                min-height: 500px;
                background-color: var(--card-bg);
                border-radius: 20px;
                border: 1px solid var(--border-color);
                display: flex;
                overflow: hidden;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
            }
            .left-panel {
                flex: 0.8;
                padding: 50px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                position: relative;
                z-index: 2;
                border-right: 1px solid rgba(255, 255, 255, 0.05);
                background: linear-gradient(180deg, rgba(20, 20, 23, 1) 0%, rgba(9, 9, 11, 1) 100%);
                /* Dynamic spotlight handled by inline style vars */
            }
             .left-panel:before {
                /* Replacement for the complex radial gradient if needed or just use JS to update style directly */
             }
            .right-panel {
                flex: 1;
                background: radial-gradient(circle at center, #1c100b 0%, #000000 100%);
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: center;
                padding-top: 60px;
                overflow: hidden;
            }
            .header { width: 100%; display: flex; align-items: center; }
            .logo { display: flex; align-items: center; font-weight: 700; font-size: 1.25rem; color: #fff; text-shadow: 0 0 20px rgba(249, 115, 22, 0.2); }
            .logo i { color: var(--accent-color); margin-right: 12px; font-size: 1.2rem; filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.6)); }
            .content-wrapper { display: flex; flex-direction: column; justify-content: center; width: 100%; max-width: 380px; margin: 0 auto; }
            .welcome-section { margin-bottom: 35px; text-align: left; }
            h1 { font-size: 2.2rem; font-weight: 700; margin-bottom: 10px; background: linear-gradient(to right, #fff, #a1a1aa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .subtitle { color: var(--text-muted); font-size: 0.95rem; line-height: 1.5; }
            .social-stack { display: flex; flex-direction: column; gap: 16px; }
            .btn-social { background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); color: #e4e4e7; padding: 14px 20px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; font-size: 0.9rem; font-weight: 500; transition: all 0.3s; position: relative; overflow: hidden; }
            .btn-social:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.2); transform: translateY(-2px); box-shadow: 0 10px 20px -10px rgba(0, 0, 0, 0.5); color: #fff; }
            .signup-footer { text-align: center; font-size: 0.8rem; color: var(--text-muted); opacity: 0.7; }
            .signup-footer a { color: var(--text-color); text-decoration: underline; text-underline-offset: 4px; }
            .signup-footer a:hover { color: var(--accent-color); }
            .decoder-container { z-index: 10; width: 100%; text-align: center; pointer-events: none; }
            .decoder-text { font-family: 'Courier New', monospace; font-weight: 700; font-size: 1.5rem; color: #ffffff; letter-spacing: 2px; text-transform: uppercase; text-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(249, 115, 22, 0.3); min-height: 40px; }
            #canvas-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; }
            @media (max-width: 900px) {
                .container-box { flex-direction: column; height: 100vh; width: 100%; border-radius: 0; border: none; }
                .right-panel { display: none; }
                .left-panel { flex: 1; padding: 30px; }
            }
            /* Animations */
            .animate-entry { opacity: 0; animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .delay-1 { animation-delay: 0.1s; }
            .delay-2 { animation-delay: 0.2s; }
            .delay-3 { animation-delay: 0.3s; }
            .delay-4 { animation-delay: 0.5s; }
            .delay-5 { animation-delay: 0.6s; }

            /* Dynamic spotlight */
            .left-panel {
                background: radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.06), transparent 40%), linear-gradient(180deg, rgba(20, 20, 23, 1) 0%, rgba(9, 9, 11, 1) 100%);
            }
        `}</style>

            <div className="container-box">
                <div
                    className="left-panel"
                    id="left-panel"
                    ref={leftPanelRef}
                    onMouseMove={handleMouseMove}
                >
                    <div className="header animate-entry delay-1">
                        <div className="logo">
                            <i className="fa-solid fa-bolt"></i> Chetanalab's
                        </div>
                    </div>

                    <div className="content-wrapper">
                        <div className="welcome-section">
                            <h1 className="animate-entry delay-2">Welcome Back</h1>
                            <p className="subtitle animate-entry delay-3">Log in to your command center.</p>
                        </div>

                        <div className="social-stack">
                            <a href="http://127.0.0.1:8000/login/google" className="btn-social btn-google animate-entry delay-4" style={{ textDecoration: 'none' }}>
                                <i className="fa-brands fa-google"></i> Continue with Google
                            </a>

                            <button className="btn-social btn-github animate-entry delay-4">
                                <i className="fa-brands fa-github"></i> Continue with GitHub
                            </button>
                            <button className="btn-social btn-apple animate-entry delay-5">
                                <i className="fa-brands fa-apple"></i> Continue with Apple
                            </button>
                            <button className="btn-social btn-facebook animate-entry delay-5">
                                <i className="fa-brands fa-facebook"></i> Continue with Facebook
                            </button>
                        </div>
                    </div>

                    <div className="signup-footer animate-entry delay-6">
                        <p>Don't have an account? <a href="#">Request Access</a></p>
                    </div>

                </div>

                <div className="right-panel">
                    <div className="decoder-container">
                        <div className="decoder-text" ref={textRef}></div>
                    </div>

                    <div id="canvas-container" ref={mountRef}></div>
                </div>
            </div>
        </div>
    );
};

export default Login;
