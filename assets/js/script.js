// Dynamic package count (fetch from packages/index.json)
fetch('/packages/index.json')
    .then(res => res.json())
    .then(data => {
        const countElement = document.getElementById('package-count');
        if (countElement) countElement.textContent = data.count;
    });

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.createElement('button');
    menuBtn.innerHTML = '☰';
    menuBtn.classList.add('mobile-menu-btn');
    document.querySelector('header').appendChild(menuBtn);

    menuBtn.addEventListener('click', () => {
        document.querySelector('nav').classList.toggle('active');
    });
});
