// Mouse Coordinates (Initialize at top to avoid ReferenceErrors)
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Loading Screen Logic
window.addEventListener('load', () => {
    const loader = document.getElementById('loading-screen');
    const particleCanvas = document.getElementById('particle-canvas');
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Immediate show on mobile
        if (loader) {
            loader.style.display = 'none';
        }
        particleCanvas.style.zIndex = '0';
        document.body.style.overflow = 'auto';
        document.body.style.overflowX = 'hidden';
        const mainContent = document.querySelector('main');
        if (mainContent) mainContent.classList.add('visible');
    } else {
        // Delayed show on desktop/tablet
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            particleCanvas.style.zIndex = '0'; 
            document.body.style.overflow = 'auto';
            document.body.style.overflowX = 'hidden';
            
            const mainContent = document.querySelector('main');
            if (mainContent) mainContent.classList.add('visible');
        }, 2000); // Reduced a bit for better UX
    }
});

// Particle System
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = window.innerWidth <= 768 ? 50 : 150; // Reduced on mobile for performance

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.init();
    }

    init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.size = Math.random() * 3 + 1;
        this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
        // Attraction/Repulsion logic
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceThreshold = 150;
        
        if (distance > 0 && distance < forceThreshold) {
            const force = (forceThreshold - distance) / forceThreshold;
            const directionX = dx / distance;
            const directionY = dy / distance;
            
            // Move away from cursor
            this.x -= directionX * force * 5;
            this.y -= directionY * force * 5;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(182, 186, 197, ${this.alpha})`;
        ctx.fill();
    }
}

function initParticles() {
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animate);
}

initParticles();
animate();

// Intersection Observer for Reveal Animations
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            if (entry.target.classList.contains('scramble-trigger')) {
                // Only scramble on non-mobile devices
                if (window.innerWidth > 768) {
                    scrambleText(entry.target);
                }
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in, .scramble-trigger').forEach(el => {
    observer.observe(el);
});

// Text Scramble Effect
function scrambleText(element) {
    if (element.dataset.scrambling === 'true') return;
    
    const originalText = element.dataset.value || element.innerText;
    if (!element.dataset.value) {
        element.dataset.value = originalText;
    }
    
    element.dataset.scrambling = 'true';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let iteration = 0;
    
    const interval = setInterval(() => {
        element.innerText = originalText
            .split("")
            .map((char, index) => {
                if (index < iteration) {
                    return originalText[index];
                }
                if (originalText[index] === " ") {
                    return " ";
                }
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");

        if (iteration >= originalText.length) {
            clearInterval(interval);
            element.dataset.scrambling = 'false';
            element.innerText = originalText; // Ensure final text is exact
        }

        iteration += 1 / 3;
    }, 30);
}

// Smooth Scroll for Navigation
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        document.querySelector(targetId).scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    });
});

// Custom Cursor and Glitter Trail
const customCursor = document.getElementById('custom-cursor');

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Update cursor position
    customCursor.style.left = `${mouseX}px`;
    customCursor.style.top = `${mouseY}px`;

    // Create glitter trail
    createGlitter(mouseX, mouseY);
});

class Glitter {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 1;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = Math.random() * 2 + 1;
        this.opacity = 1;
        this.color = `rgba(255, 255, 255, ${this.opacity})`;
        
        this.element = document.createElement('div');
        this.element.className = 'glitter-particle';
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        document.body.appendChild(this.element);
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= 0.02;
        
        if (this.opacity <= 0) {
            this.element.remove();
            return false;
        }

        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.opacity = this.opacity;
        return true;
    }
}

let glitters = [];

function createGlitter(x, y) {
    if (Math.random() > 0.5) { // Control spawning rate
        glitters.push(new Glitter(x, y));
    }
}

function updateGlitters() {
    glitters = glitters.filter(glitter => glitter.update());
    requestAnimationFrame(updateGlitters);
}

updateGlitters();

// Scrolling Penguin Logic
const penguin = document.getElementById('scrolling-penguin');
const penguinImg = penguin.querySelector('img');
const penguinDialog = penguin.querySelector('.penguin-dialog');

let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPosition = window.scrollY;
    const scrollPercentage = Math.min(Math.max(scrollPosition / scrollHeight, 0), 1);
    
    // Calculate movement: from left to right across the screen
    const range = window.innerWidth + 300;
    const currentX = scrollPercentage * range;
    
    penguin.style.transform = `translateX(${currentX}px)`;
    
    // Flip penguin based on scroll direction
    if (scrollPosition > lastScrollY) {
        penguinImg.style.transform = 'scaleX(1)'; // Moving right (down)
    } else if (scrollPosition < lastScrollY) {
        penguinImg.style.transform = 'scaleX(-1)'; // Moving left (up)
    }
    
    lastScrollY = scrollPosition;

    // Project Card Focus Logic (Small devices only)
    const cards = document.querySelectorAll('.project-card');
    if (window.innerWidth <= 768) {
        let closestCard = null;
        let minDistance = Infinity;

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardCenter = rect.top + rect.height / 2;
            const screenCenter = window.innerHeight / 2;
            const distance = Math.abs(cardCenter - screenCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestCard = card;
            }
            card.classList.remove('focused');
        });

        if (closestCard && minDistance < window.innerHeight * 0.3) {
            closestCard.classList.add('focused');
        }
    } else {
        cards.forEach(card => card.classList.remove('focused'));
    }
});

// Initial position
window.dispatchEvent(new Event('scroll'));

// Penguin Interactivity
let isJumping = false;
const messages = [
    "Woot!",
    "Onchain is better!",
    "Waddle waddle...",
    "Freaky Flame is here!",
    "Check out Freaky Flame!",
    "Stay Cool! ❄️"
];

penguin.addEventListener('click', () => {
    if (isJumping) return;
    
    isJumping = true;
    penguin.classList.add('active');
    penguinImg.classList.add('penguin-jump');
    
    // Random message
    penguinDialog.innerText = messages[Math.floor(Math.random() * messages.length)];
    
    setTimeout(() => {
        penguin.classList.remove('active');
        penguinImg.classList.remove('penguin-jump');
        isJumping = false;
    }, 1500);
});
