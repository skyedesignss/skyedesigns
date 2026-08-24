// Page loader
window.addEventListener('load', () => {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 400);
    }
});

// Dark mode
const toggle = document.getElementById('darkModeToggle');
const body = document.body;
const icon = toggle.querySelector('i');

// Persist preference
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    icon.classList.replace('bx-moon', 'bx-sun');
}

toggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        icon.classList.replace('bx-moon', 'bx-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        icon.classList.replace('bx-sun', 'bx-moon');
        localStorage.setItem('theme', 'light');
    }
});