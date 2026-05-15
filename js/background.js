const background = document.querySelector('.background');

function createBlob() {
    if (!background) return;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.classList.add("blob");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    
    // Initial random blob shape
    const d1 = createBlobPath();
    const d2 = createBlobPath();
    const d3 = createBlobPath();
    
    path.setAttribute("d", d1);
    
    // Add animation for morphing
    const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    animate.setAttribute("attributeName", "d");
    animate.setAttribute("dur", `${15 + Math.random() * 10}s`);
    animate.setAttribute("values", `${d1}; ${d2}; ${d3}; ${d1}`);
    animate.setAttribute("repeatCount", "indefinite");
    
    path.appendChild(animate);
    svg.appendChild(path);
    
    // Random position and size
    const size = 400 + Math.random() * 400; // Increased size
    svg.style.width = `${size}px`;
    svg.style.height = `${size}px`;
    
    // Position more toward the center or sides
    svg.style.left = `${Math.random() * 110 - 5}%`;
    svg.style.top = `${Math.random() * 110 - 5}%`;
    
    svg.style.animationDuration = `${30 + Math.random() * 30}s`;
    svg.style.animationDelay = `${-Math.random() * 30}s`;
    
    // More vibrant colors
    const hue = 80 + Math.random() * 40; // 80 to 120 (Greenish)
    path.setAttribute("fill", `hsla(${hue}, 70%, 75%, 0.6)`); // Increased opacity and saturation

    background.appendChild(svg);
}

function createBlobPath() {
    const points = [];
    const numPoints = 6;
    const angleStep = (Math.PI * 2) / numPoints;
    const radius = 35; // slightly smaller base to allow for more variance
    
    for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep;
        // More variance for "blobbier" look
        const r = radius + (Math.random() * 20 - 10);
        const x = 50 + Math.cos(angle) * r;
        const y = 50 + Math.sin(angle) * r;
        points.push({ x, y });
    }
    
    return solve(points, true);
}

function solve(data, closed) {
    if (data.length < 2) return "";
    let d = `M${data[0].x},${data[0].y}`;
    
    for (let i = 0; i < data.length; i++) {
        const p1 = data[i];
        const p2 = data[(i + 1) % data.length];
        
        // Use midpoint as control point for smoother curves
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        
        // Simplified smooth curve
        d += ` Q${p1.x},${p1.y} ${midX},${midY}`;
    }
    
    d += " Z"; // Close path
    return d;
}

// Create fewer but larger/more visible blobs
for (let i = 0; i < 6; i++) {
    createBlob();
}
