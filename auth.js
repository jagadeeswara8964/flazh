// Mouse Coordinates
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Custom Cursor and Glitter Trail
const customCursor = document.getElementById('custom-cursor');

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Update cursor position
    customCursor.style.left = `${mouseX}px`;
    customCursor.style.top = `${mouseY}px`;

    // Create glitter trail
    if (Math.random() > 0.5) {
        new Glitter(mouseX, mouseY);
    }
});

class Glitter {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 1;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = Math.random() * 2 + 1;
        this.opacity = 1;
        
        this.element = document.createElement('div');
        this.element.className = 'glitter-particle';
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        document.body.appendChild(this.element);
        
        this.animate();
    }

    animate() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= 0.02;
        
        if (this.opacity <= 0) {
            this.element.remove();
            return;
        }

        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.opacity = this.opacity;
        
        requestAnimationFrame(() => this.animate());
    }
}

// Particle System
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = window.innerWidth <= 768 ? 50 : 150;

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
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceThreshold = 150;
        
        if (distance > 0 && distance < forceThreshold) {
            const force = (forceThreshold - distance) / forceThreshold;
            const directionX = dx / distance;
            const directionY = dy / distance;
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

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// Form Toggling Logic
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const toSignup = document.getElementById('to-signup');
const toLogin = document.getElementById('to-login');

toSignup.addEventListener('click', () => {
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
    authTitle.innerText = "Join MiniWRLD";
    authSubtitle.innerText = "Create an account to get started.";
});

toLogin.addEventListener('click', () => {
    signupForm.classList.remove('active');
    loginForm.classList.add('active');
    authTitle.innerText = "Welcome Back";
    authSubtitle.innerText = "Login to access your onchain world.";
});

// Form Submission & Persistence
[loginForm, signupForm].forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('.submit-btn');
        const originalText = btn.innerText;
        
        btn.innerText = "Processing...";
        btn.disabled = true;
        
        // Simulate a small delay for premium feel
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('miniwrld_users')) || [];
            
            if (form.id === 'signup-form') {
                const name = document.getElementById('signup-name').value;
                const userId = document.getElementById('signup-id').value;
                const password = document.getElementById('signup-password').value;
                
                // Validation: Must start with 'user_' and contain only alphanumeric characters
                const userIdRegex = /^user_[a-zA-Z0-9]+$/;
                if (!userIdRegex.test(userId)) {
                    alert("User ID must start with 'user_' and contain only letters and numbers.");
                    btn.innerText = originalText;
                    btn.disabled = false;
                    return;
                }

                // Validation: Length check
                if (userId.length > 20) {
                    alert("User ID must be 20 characters or less.");
                    btn.innerText = originalText;
                    btn.disabled = false;
                    return;
                }
                
                // Check if User ID already exists
                if (users.find(u => u.userId === userId)) {
                    alert("This User ID is already taken. Please choose another.");
                    btn.innerText = originalText;
                    btn.disabled = false;
                    return;
                }
                
                // Store new user
                users.push({ name, userId, password });
                localStorage.setItem('miniwrld_users', JSON.stringify(users));
                
                alert("Account created successfully! You can now login.");
                // Switch to login form
                toLogin.click();
            } else {
                const userId = document.getElementById('login-id').value;
                const password = document.getElementById('login-password').value;
                
                // Verify credentials
                const user = users.find(u => u.userId === userId && u.password === password);
                
                if (user) {
                    alert(`Welcome back, ${user.name}! Login successful.`);
                    // Store current user in session
                    localStorage.setItem('miniwrld_current_user', JSON.stringify(user));
                    window.location.href = 'dashboard.html';
                } else {
                    alert("Invalid User ID or Password. Please try again.");
                }
            }
            
            btn.innerText = originalText;
            btn.disabled = false;
        }, 1200);
    });
});
