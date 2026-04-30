// Mouse Coordinates
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Custom Cursor and Glitter Trail
const customCursor = document.getElementById('custom-cursor');

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    customCursor.style.left = `${mouseX}px`;
    customCursor.style.top = `${mouseY}px`;

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
        this.element.style.pointerEvents = 'none'; // Ensure it doesn't block clicks
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

// Dashboard Logic
const currentUser = JSON.parse(localStorage.getItem('miniwrld_current_user'));
const userNameDisplay = document.getElementById('user-name-display');
const logoutBtn = document.getElementById('logout-btn');

if (!currentUser) {
    window.location.href = 'auth.html';
} else {
    userNameDisplay.innerText = currentUser.name;
}

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('miniwrld_current_user');
    window.location.href = 'auth.html';
});

// Chat Functionality
const groupItems = document.querySelectorAll('.group-item');
const currentGroupName = document.getElementById('current-group-name');
const currentGroupStatus = document.getElementById('current-group-status');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages-container');

const groupData = {
    general: {
        name: "General Community",
        baseCount: 2450
    }
};

let currentGroupKey = 'general';

function updateOnlineCount() {
    const data = groupData[currentGroupKey];
    if (!data) return;
    const fluctuation = Math.floor(Math.random() * 11) - 5;
    const finalCount = data.baseCount + fluctuation;
    currentGroupStatus.innerText = `${finalCount.toLocaleString()} members online`;
    setTimeout(updateOnlineCount, 3000 + Math.random() * 2000);
}

// Persisted Messages Storage
function getMessages(groupKey) {
    const allMessages = JSON.parse(localStorage.getItem('miniwrld_messages')) || {};
    return allMessages[groupKey] || [
        { sender: "System", content: `Welcome to the ${groupData[groupKey].name}!`, type: "received", time: "System" }
    ];
}

function saveMessage(groupKey, message) {
    const allMessages = JSON.parse(localStorage.getItem('miniwrld_messages')) || {};
    if (!allMessages[groupKey]) allMessages[groupKey] = [];
    allMessages[groupKey].push(message);
    localStorage.setItem('miniwrld_messages', JSON.stringify(allMessages));
}

function loadChatHistory(groupKey) {
    messagesContainer.innerHTML = '';
    const history = getMessages(groupKey);
    history.forEach(msg => {
        renderMessage(msg.sender, msg.content, msg.type, msg.time);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function renderMessage(sender, content, type, time) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <div class="message-sender">${sender}</div>
        <div class="message-content">${content}</div>
        <div class="message-time">${time}</div>
    `;
    messagesContainer.appendChild(messageDiv);
}

// Initial sequence
updateOnlineCount();
loadChatHistory(currentGroupKey);

groupItems.forEach(item => {
    item.addEventListener('click', () => {
        groupItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        currentGroupKey = item.dataset.group;
        const data = groupData[currentGroupKey];
        currentGroupName.innerText = data.name;
        
        loadChatHistory(currentGroupKey);
        
        const fluctuation = Math.floor(Math.random() * 11) - 5;
        currentGroupStatus.innerText = `${(data.baseCount + fluctuation).toLocaleString()} members online`;
    });
});

// Sync messages across tabs
window.addEventListener('storage', (e) => {
    if (e.key === 'miniwrld_messages') {
        loadChatHistory(currentGroupKey);
    }
});

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage = { sender: currentUser.name, content: text, type: 'sent', time: time };
    
    // Save first to ensure it's in storage
    saveMessage(currentGroupKey, newMessage);
    renderMessage(newMessage.sender, newMessage.content, newMessage.type, newMessage.time);
    
    messageInput.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});
