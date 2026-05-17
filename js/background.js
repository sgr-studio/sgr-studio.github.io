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
        const data = await response.json();
        
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const mmdd = `${month}-${day}`;
        
        let displayMessage = "";
        let displaySubtitle = "";
        let currentEventTheme = "";

        // 1. ビッグイベント（期間指定）のチェック
        if (data.seasonal_events) {
            for (const event of data.seasonal_events) {
                if (mmdd >= event.start && mmdd <= event.end) {
                    displayMessage = event.message;
                    displaySubtitle = event.subtitle;
                    currentEventTheme = event.theme;
                    break;
                }
            }
        }

        // 2. 特定の日（記念日）のチェック
        if (!displayMessage && data.special_days) {
            const specials = data.special_days.filter(d => d.date === mmdd);
            if (specials.length > 0) {
                const special = specials[Math.floor(Math.random() * specials.length)];
                displayMessage = special.message;
                displaySubtitle = special.subtitle;
            }
        }

        // 3. デフォルト（ランダム）
        if (!displayMessage) {
            const randomEntry = data.defaults[Math.floor(Math.random() * data.defaults.length)];
            displayMessage = randomEntry.message;
            displaySubtitle = randomEntry.subtitle;
        }

        if (loaderCopy) loaderCopy.textContent = displayMessage;
        const loaderSubtitle = document.getElementById('loader-subtitle');
        if (loaderSubtitle) loaderSubtitle.textContent = displaySubtitle;
        
        // イベントテーマがあればbodyにクラス付与
        if (currentEventTheme) {
            document.body.classList.add(`theme-event-${currentEventTheme}`);
        }

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

    // Theme visibility and color follow
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const accentColor = getComputedStyle(document.body).getPropertyValue('--accent').trim();
    
    if (stars && stars.material) {
        stars.material.opacity = isDark ? 0.8 : 0.0;
        if (accentColor) stars.material.color.set(accentColor);
    }
    if (starLines && starLines.material) {
        starLines.material.opacity = isDark ? 0.15 : 0.0;
        if (accentColor) starLines.material.color.set(accentColor);
    }

    renderer.render(scene, camera);
}

// Internationalization (i18n)
let currentLang = localStorage.getItem('lang') || 'ja';
let translations = null;

async function setLanguage(lang) {
    try {
        const response = await fetch(`lang/${lang}.json`);
        translations = await response.json();
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const keys = key.split('.');
            let value = translations;
            keys.forEach(k => {
                value = value ? value[k] : null;
            });
            if (value) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = value;
                } else {
                    scrambleText(el, value); // スクランブル演出を適用
                }
            }
        });
        
        currentLang = lang;
        localStorage.setItem('lang', lang);
        document.documentElement.lang = lang;
        
        // Update language label in dropdown
        const langLabel = document.getElementById('current-lang-label');
        if (langLabel) {
            const labels = { 'ja': 'JP', 'en': 'EN', 'zh': 'ZH', 'ko': 'KO' };
            langLabel.textContent = labels[lang] || lang.toUpperCase();
        }
        
        // Update theme toggle text
        updateThemeToggleText();
    } catch (e) {
        console.error('Failed to load language file:', e);
    }
}

// Text Scramble Effect
function scrambleText(element, finalValue) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    const iterations = 10;
    let currentIteration = 0;
    
    const interval = setInterval(() => {
        element.textContent = finalValue
            .split('')
            .map((char, index) => {
                if (index < (currentIteration / iterations) * finalValue.length) {
                    return finalValue[index];
                }
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');
        
        if (currentIteration >= iterations) {
            clearInterval(interval);
            element.textContent = finalValue;
        }
        currentIteration++;
    }, 40);
}

function updateThemeToggleText() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    const themeIcon = document.getElementById('theme-icon-active');
    const themeLabel = document.getElementById('current-theme-label');
    
    if (themeIcon) {
        themeIcon.className = isDark ? 'bx bx-moon' : 'bx bx-sun';
    }
    if (themeLabel) {
        themeLabel.textContent = isDark ? 'Dark' : 'Light';
    }
}

// --- Theme Logic ---
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeToggleText();
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Event Listeners for onclick replacement
document.addEventListener('DOMContentLoaded', () => {
    // Theme selection
    document.querySelectorAll('.theme-options li').forEach(el => {
        el.addEventListener('click', (e) => {
            const theme = el.getAttribute('data-theme-value');
            if (typeof setTheme === 'function') setTheme(theme);
        });
    });

    // Theme toggle
    document.querySelectorAll('.theme-toggle-btn').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof toggleTheme === 'function') toggleTheme();
        });
    });
});

// Initial state
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

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

// Hamburger Menu Toggle
const hamburger = document.getElementById('hamburger');
const nav = document.querySelector('.header-navigation');

if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
        const isActive = hamburger.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = isActive ? 'hidden' : 'auto';
    });

    // Close menu when a link is clicked
    const navLinks = nav.querySelectorAll('li');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });
}

// Menu Background SVG Animation
const blobPath = document.getElementById('menu-blob-path');
const menuItems = document.querySelectorAll('.header-navigation ul li');
let targetX = -100;
let targetY = -100;
let targetW = 0;
let targetH = 0;
let currentX = -100;
let currentY = -100;
let currentW = 0;
let currentH = 0;
let time = 0;

function updateMenuBlob() {
    time += 0.03; // 少しゆっくりにして柔らかさを出す
    
    // Smoothly follow target parameters
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;
    currentW += (targetW - currentW) * 0.12;
    currentH += (targetH - currentH) * 0.12;
    
    if (currentY > -50 && currentX > -50) {
        const centerX = currentX;
        const centerY = currentY;
        const baseW = currentW * 0.8;
        const baseH = currentH * 0.8;
        
        // 有機的な形状を作成（ベジェ曲線で柔らかく）
        let points = [];
        const numPoints = 8;
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const wobble = Math.sin(time + i * 1.5) * 3;
            const rX = baseW + wobble;
            const rY = baseH + wobble;
            points.push({
                x: centerX + Math.cos(angle) * rX,
                y: centerY + Math.sin(angle) * rY
            });
        }
        
        // ポイントを滑らかに繋ぐ
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length; i++) {
            const next = points[(i + 1) % points.length];
            const xc = (points[i].x + next.x) / 2;
            const yc = (points[i].y + next.y) / 2;
            d += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
        }
        d += ' Z';
        
        blobPath.setAttribute('d', d);
        blobPath.style.opacity = 0.15;
    } else {
        blobPath.style.opacity = 0;
    }
    
    requestAnimationFrame(updateMenuBlob);
}

if (menuItems.length > 0) {
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', (e) => {
            const rect = e.target.getBoundingClientRect();
            const containerRect = document.querySelector('.header-navigation').getBoundingClientRect();
            
            targetX = ((rect.left + rect.width / 2 - containerRect.left) / containerRect.width) * 100;
            targetY = ((rect.top + rect.height / 2 - containerRect.top) / containerRect.height) * 100;
            // ターゲットのサイズをパーセンテージで計算
            targetW = (rect.width / containerRect.width) * 60; // 少し余裕を持たせる
            targetH = (rect.height / containerRect.height) * 80;
        });
    });
    
    const navContainer = document.querySelector('.header-navigation');
    navContainer.addEventListener('mouseleave', () => {
        targetX = -100;
        targetY = -100;
    });
}

updateMenuBlob();

// Initialize
initLoader();
initThree();
setLanguage(currentLang);