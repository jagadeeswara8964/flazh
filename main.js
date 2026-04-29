// Particle System
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 100;

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
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2;
        this.alpha = Math.random();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
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
                scrambleText(entry.target);
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in, .scramble-trigger').forEach(el => {
    observer.observe(el);
});

// Text Scramble Effect
function scrambleText(element) {
    const originalText = element.innerText;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let iteration = 0;
    
    const interval = setInterval(() => {
        element.innerText = originalText
            .split("")
            .map((char, index) => {
                if (index < iteration) {
                    return originalText[index];
                }
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");

        if (iteration >= originalText.length) {
            clearInterval(interval);
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
            behavior: 'smooth'
        });
    });
});

// Custom Cursor and Glitter Trail
const customCursor = document.getElementById('custom-cursor');
let mouseX = 0;
let mouseY = 0;

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
