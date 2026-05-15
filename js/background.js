/**
 * Three.js Constellation Background
 */
const container = document.getElementById('canvas-container');
const themeToggle = document.getElementById('themeToggle');
const loader = document.getElementById('loader');
const loaderCopy = document.getElementById('loader-copy');

let scene, camera, renderer, stars, starLines;
let starPoints = [];
const STAR_COUNT = 150;
const MAX_DISTANCE = 200;

// キャッチコピーの読み込みと表示
async function initLoader() {
    try {
        const response = await fetch('catchcopy.json');
        const copies = await response.json();
        const randomCopy = copies[Math.floor(Math.random() * copies.length)];
        if (loaderCopy) loaderCopy.textContent = randomCopy;
    } catch (e) {
        console.error('Failed to load catchcopies:', e);
        if (loaderCopy) loaderCopy.textContent = '理屈より、創作欲を。';
    }
}

function initThree() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 800;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // ... (existing star/line creation code)
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(STAR_COUNT * 3);
    
    for (let i = 0; i < STAR_COUNT; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 1000;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        starPoints.push({
            pos: new THREE.Vector3(x, y, z),
            drift: new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, 0),
            speed: 0.15 + Math.random() * 0.4
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 8,
        map: createCircleTexture(),
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    stars = new THREE.Points(geometry, material);
    scene.add(stars);

    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending
    });
    const lineGeometry = new THREE.BufferGeometry();
    starLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(starLines);

    animate();

    setTimeout(() => {
        if (loader) loader.classList.add('loaded');
    }, 2500);
}

function animate() {
    requestAnimationFrame(animate);

    const positions = stars.geometry.attributes.position.array;
    const scrollY = window.scrollY;
    
    // Update Stars
    for (let i = 0; i < STAR_COUNT; i++) {
        const s = starPoints[i];
        
        // Constant drift
        s.pos.x += s.drift.x;
        s.pos.y += s.drift.y;

        // Boundary check (Loop)
        if (s.pos.x > 1000) s.pos.x = -1000;
        if (s.pos.x < -1000) s.pos.x = 1000;
        if (s.pos.y > 1000) s.pos.y = -1000;
        if (s.pos.y < -1000) s.pos.y = 1000;

        // Set visual position with scroll parallax
        positions[i * 3] = s.pos.x;
        positions[i * 3 + 1] = s.pos.y - (scrollY * s.speed);
        positions[i * 3 + 2] = s.pos.z;
    }
    stars.geometry.attributes.position.needsUpdate = true;

    // Update Lines (Dynamic connection)
    const linePositions = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        for (let j = i + 1; j < STAR_COUNT; j++) {
            const p1 = starPoints[i].pos;
            const p2 = starPoints[j].pos;
            
            // パララックスを考慮した見かけの距離ではなく、空間上の距離で接続判定
            const dist = p1.distanceTo(p2);

            if (dist < MAX_DISTANCE) {
                linePositions.push(
                    p1.x, p1.y - (scrollY * starPoints[i].speed), p1.z,
                    p2.x, p2.y - (scrollY * starPoints[j].speed), p2.z
                );
            }
        }
    }
    
    starLines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

    // Theme visibility
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    stars.material.opacity = isDark ? 0.8 : 0.0;
    starLines.material.opacity = isDark ? 0.15 : 0.0;

    renderer.render(scene, camera);
}

// --- Theme Logic ---
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    localStorage.setItem('theme', newTheme);
}

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initial state
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
if (themeToggle) {
    themeToggle.textContent = savedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    themeToggle.addEventListener('click', toggleTheme);
}

// 丸い星のためのテクスチャ作成
function createCircleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Initialize
initLoader();
initThree();
