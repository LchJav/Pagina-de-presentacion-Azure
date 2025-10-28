document.addEventListener('DOMContentLoaded', () => {
    // --- SVG ANIMATION SETUP ---
    const svgCloudsContainer = document.getElementById('svg-clouds-container');
    const wavePatternContainer = document.getElementById('wave-pattern-svg-container');
    let svgClouds, wavePatternSVG;
    let cloudPath, waveEllipses = [];
    let width, height;
    let cloudPhaseOffsets = [];
    const numCloudLobes = 15;
    const horizontalMovementSpeed = 0; // Eliminamos el movimiento horizontal
    
    let cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let smoothCursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const easingFactor = 0.1;

    function setupAnimations() {
        width = window.innerWidth;
        height = svgCloudsContainer.offsetHeight;

        // 1. Setup Cloud SVG
        svgCloudsContainer.innerHTML = '';
        svgClouds = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgClouds.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svgClouds.setAttribute('preserveAspectRatio', 'none');
        
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        gradient.id = 'deezerGradient';
        gradient.setAttribute('x1', '0%'); gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '0%'); gradient.setAttribute('y2', '100%');
        const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop1.setAttribute('offset', '0%'); stop1.setAttribute('stop-color', '#9000FF'); stop1.setAttribute('stop-opacity', '0.2');
        const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop2.setAttribute('offset', '100%'); stop2.setAttribute('stop-color', '#9000FF'); stop2.setAttribute('stop-opacity', '0');
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        svgClouds.appendChild(defs);

        cloudPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        cloudPath.setAttribute('fill', 'url(#deezerGradient)');
        svgClouds.appendChild(cloudPath);
        svgCloudsContainer.appendChild(svgClouds);

        cloudPhaseOffsets = [];
        for (let i = 0; i < numCloudLobes; i++) {
            cloudPhaseOffsets.push(Math.random() * 2 * Math.PI);
        }

        // 2. Setup Wave SVG
        wavePatternContainer.innerHTML = '';
        wavePatternSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        wavePatternSVG.setAttribute('id', 'wave-pattern-svg');
        wavePatternSVG.setAttribute('viewBox', `0 0 ${width} ${wavePatternContainer.offsetHeight}`);
        wavePatternSVG.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        wavePatternContainer.appendChild(wavePatternSVG);

        waveEllipses = [];
        for (let i = 0; i < 10; i++) {
            const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
            ellipse.setAttribute('stroke', '#9000FF');
            ellipse.setAttribute('fill', 'none');
            wavePatternSVG.appendChild(ellipse);
            waveEllipses.push(ellipse);
        }
        
        animateSvgClouds();
    }

    function animateSvgClouds() {
        const time = performance.now() * 0.001;
        let d = `M -100 ${height}`; // Punto de inicio fijo

        for (let i = 0; i < numCloudLobes; i++) {
            const phase = time + cloudPhaseOffsets[i];
            const verticalMovementSpeed = 0.7 + Math.sin(cloudPhaseOffsets[i] * 5) * 0.4;
            const sizeMultiplier = 180 + Math.cos(cloudPhaseOffsets[i] * 3) * 100; // Aumentamos aún más el rango de tamaño

            const x = (i / (numCloudLobes - 1)) * (width + 200) - 100; // Eliminamos el componente de tiempo para el movimiento horizontal
            // Aumentamos drásticamente la amplitud del movimiento vertical para un efecto más pronunciado
            const y = height - 140 - (Math.sin(phase * verticalMovementSpeed) * 50) + (Math.cos(time * 0.5 + cloudPhaseOffsets[i]) * 20);
            const rx = (width / (numCloudLobes - 1)) * 1.2;
            const ry = Math.abs(Math.cos(phase * 0.6)) * sizeMultiplier + 50;
            d += ` A ${rx},${ry} 0 0,1 ${x},${y}`;
        }
        d += ` L ${width + 100} ${height} Z`;
        cloudPath.setAttribute('d', d);

        animateWavePattern(); // Call wave animation in the same loop
        requestAnimationFrame(animateSvgClouds);
    }

    function animateWavePattern() {
        if (!wavePatternSVG) return;
        const waveHeight = wavePatternContainer.offsetHeight;
        
        // LERP for smooth cursor following
        smoothCursor.x += (cursor.x - smoothCursor.x) * easingFactor;
        smoothCursor.y += (cursor.y - smoothCursor.y) * easingFactor;

        const centerX = width / 2;
        const centerY = waveHeight / 2;
        const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

        waveEllipses.forEach((ellipse, i) => {
            const baseRadius = (maxRadius / 10) * (i + 1);
            
            const dx = smoothCursor.x - centerX;
            const dy = smoothCursor.y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            let currentRadiusX = baseRadius;
            let currentRadiusY = baseRadius;
            let rotation = 0;

            const distortionRadius = 300;
            const distortionStrength = 0.2;

            if (dist < baseRadius + distortionRadius) {
                const proximity = 1 - Math.max(0, dist - baseRadius) / distortionRadius;
                const distortionAmount = proximity * baseRadius * distortionStrength;
                
                currentRadiusX += distortionAmount;
                
                const angle = Math.atan2(dy, dx);
                rotation = angle * (180 / Math.PI);
            }

            ellipse.setAttribute('cx', centerX);
            ellipse.setAttribute('cy', centerY);
            ellipse.setAttribute('rx', currentRadiusX);
            ellipse.setAttribute('ry', currentRadiusY);
            ellipse.setAttribute('stroke-opacity', 1 - (i / 10));
            ellipse.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
        });
    }
    
    window.addEventListener('mousemove', (e) => {
        const rect = wavePatternContainer.getBoundingClientRect();
        cursor.x = e.clientX;
        cursor.y = e.clientY - rect.top;
    });

    window.addEventListener('resize', setupAnimations);
    setupAnimations();


    // --- MODAL LOGIC ---
    const modal = document.getElementById('diagnosis-modal');
    const openModalBtns = [
        document.getElementById('open-diagnosis-btn-header'),
        document.getElementById('open-diagnosis-btn-hero'),
        document.getElementById('open-diagnosis-btn-cta')
    ];
    const closeModalBtn = document.getElementById('close-modal-btn');
    const diagnosisForm = document.getElementById('diagnosis-form');
    const problemDescription = document.getElementById('problem-description');
    const submitBtn = document.getElementById('submit-diagnosis-btn');
    const submitText = document.getElementById('submit-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    const diagnosisResult = document.getElementById('diagnosis-result');
    const resultContent = document.getElementById('result-content');

    const openModal = () => {
        modal.classList.remove('hidden');
        problemDescription.value = '';
        diagnosisResult.classList.add('hidden');
    };
    const closeModal = () => modal.classList.add('hidden');

    openModalBtns.forEach(btn => btn.addEventListener('click', openModal));
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    diagnosisForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const description = problemDescription.value.trim();
        if (description) {
            handleDiagnosis(description);
        }
    });

    async function handleDiagnosis(description) {
        setLoading(true);
        diagnosisResult.classList.add('hidden');

        // Usamos el proxy local (no exponer la API key en el cliente)
        const apiEndpoint = 'https://bbrnprdokqkiyofpsaxr.supabase.co/functions/v1/gemini-proxy';

        const systemInstruction = "Actúa como un técnico de software experto y amable. Analiza la descripción del problema de hardware o software del usuario. Devuelve un diagnóstico preliminar conciso y una sugerencia de qué servicio de la lista (Limpieza y Mantenimiento, Instalación de Antivirus, Optimización del Sistema, Instalación y Configuración) es el más apropiado para resolverlo. Mantén la respuesta en español y no más de 50 palabras. Inicia la respuesta con 'Basado en tu descripción,'.";

        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: description }]
            }],
            systemInstruction: { parts: [{ text: systemInstruction }] }
        };

        try {
            const responseData = await fetchWithExponentialBackoff(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const text = responseData.candidates[0].content.parts[0].text;
            resultContent.textContent = text;
            diagnosisResult.classList.remove('hidden');
        } catch (error) {
            console.error('Error fetching diagnosis:', error);
            resultContent.textContent = 'Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.';
            diagnosisResult.classList.remove('hidden');
        } finally {
            setLoading(false);
        }
    }
    
    async function fetchWithExponentialBackoff(url, options, maxRetries = 3, initialDelay = 1000) {
        let delay = initialDelay;
        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    // Si es un error del cliente (4xx), no reintentar
                    if (response.status >= 400 && response.status < 500) {
                        throw new Error(`Error del cliente: ${response.status} ${response.statusText}`);
                    }
                    // Si es un error del servidor (5xx), reintentar
                    throw new Error(`Error del servidor: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                if (i === maxRetries - 1) throw error; // Último intento, lanzar error
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Duplicar el retraso
            }
        }
    }

    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitText.classList.add('hidden');
            loadingSpinner.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            submitText.classList.remove('hidden');
            loadingSpinner.classList.add('hidden');
        }
    }

    // --- MOBILE MENU LOGIC ---
    const mobileMenu = document.getElementById('mobile-menu');
    const openMenuBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-mobile-menu-btn');
    const mobileNavLinks = mobileMenu.querySelectorAll('a');

    const openMobileMenu = () => mobileMenu.classList.remove('hidden');
    const closeMobileMenu = () => mobileMenu.classList.add('hidden');

    if (openMenuBtn) {
        openMenuBtn.addEventListener('click', openMobileMenu);
    }
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', closeMobileMenu);
    }
    // Cierra el menú al hacer clic en un enlace (para navegar a una sección)
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
});