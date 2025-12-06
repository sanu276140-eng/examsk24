// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Sticky header
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    header.classList.toggle('sticky', window.scrollY > 0);
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Test category click handler
document.querySelectorAll('.test-list a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const testName = link.textContent;
        alert(`Starting ${testName}...\nThis would redirect to the test page in a real implementation.`);
        // In real implementation, this would redirect to the specific test page
    });
});

// Exam card click handler
document.querySelectorAll('.exam-card').forEach(card => {
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.exam-link')) {
            const examName = card.querySelector('h3').textContent;
            alert(`Loading ${examName} materials...\nThis would redirect to the exam category page.`);
        }
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});