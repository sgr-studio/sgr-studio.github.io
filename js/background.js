const starsContainer = document.querySelector('.stars-container');
const themeToggle = document.getElementById('themeToggle');

let stars = [];
let starLines = [];
const MAX_DISTANCE = 15; // 接続する最大距離（％単位）
const STAR_COUNT = 100;   // 星の数

// --- Stars Logic ---
function createStars() {
    if (!starsContainer) return;
    
    starsContainer.innerHTML = '';
    stars = [];

    for (let i = 0; i < STAR_COUNT; i++) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = 1 + Math.random() * 2;
        
        const starEl = document.createElement('div');
        starEl.classList.add('star');
        starEl.style.width = `${size}px`;
        starEl.style.height = `${size}px`;
        
        // Random drift speed
        const driftX = (Math.random() - 0.5) * 0.01;
        const driftY = (Math.random() - 0.5) * 0.01;
        
        starsContainer.appendChild(starEl);
        
        stars.push({
            el: starEl,
            x: x,
            y: y,
            driftX: driftX,
            driftY: driftY,
            speed: 0.2 + Math.random() * 0.3 // Increased parallax speed
        });
    }
}

function updateConstellations() {
    // 既存の線を削除（パフォーマンスのため、毎回作り直すのではなく再利用する設計も可能ですが、まずは確実な表示を優先）
    starLines.forEach(line => line.remove());
    starLines = [];

    for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
            const s1 = stars[i];
            const s2 = stars[j];
            
            // 現在の表示上の座標を計算（パララックス込み）
            const scrollY = window.scrollY;
            const p1y = s1.y + (scrollY * s1.speed / window.innerHeight * 100);
            const p2y = s2.y + (scrollY * s2.speed / window.innerHeight * 100);
            
            const dx = s1.x - s2.x;
            const dy = p1y - p2y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < MAX_DISTANCE) {
                const line = document.createElement('div');
                line.classList.add('star-line');
                
                // 距離に応じて透明度を変える
                const opacity = 1 - (dist / MAX_DISTANCE);
                line.style.opacity = opacity * 0.5;

                const x1 = s1.x * window.innerWidth / 100;
                const y1 = p1y * window.innerHeight / 100;
                const x2 = s2.x * window.innerWidth / 100;
                const y2 = p2y * window.innerHeight / 100;
                
                const ldx = x2 - x1;
                const ldy = y2 - y1;
                const length = Math.sqrt(ldx * ldx + ldy * ldy);
                const angle = Math.atan2(ldy, ldx) * 180 / Math.PI;
                
                line.style.width = `${length}px`;
                line.style.left = `${x1}px`;
                line.style.top = `${y1}px`;
                line.style.transform = `rotate(${angle}deg)`;
                
                starsContainer.appendChild(line);
                starLines.push(line);
            }
        }
    }
}

// --- Animation Loop ---
function animate() {
    const scrollY = window.scrollY;

    stars.forEach(star => {
        // Slow constant drift
        star.x += star.driftX;
        star.y += star.driftY;

        // Wrap around
        if (star.x < -5) star.x = 105;
        if (star.x > 105) star.x = -5;
        if (star.y < -5) star.y = 105;
        if (star.y > 105) star.y = -5;

        // Update star position with parallax
        const moveY = scrollY * star.speed;
        star.el.style.left = `${star.x}%`;
        star.el.style.top = `${star.y}%`;
        star.el.style.transform = `translateY(${moveY}px)`;
    });
    
    updateConstellations();

    requestAnimationFrame(animate);
}

// --- Theme Logic ---
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    localStorage.setItem('theme', newTheme);
}

// Initial state
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
if (themeToggle) {
    themeToggle.textContent = savedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    themeToggle.addEventListener('click', toggleTheme);
}

// Initialize
window.addEventListener('load', () => {
    createStars();
    requestAnimationFrame(animate);
});
