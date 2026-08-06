document.documentElement.classList.add('js');

const siteNav = document.querySelector('.site-nav');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.nav-links a');

if (siteNav && navToggle) {
    const closeMenu = () => {
        siteNav.classList.remove('is-menu-open');
        navToggle.setAttribute('aria-expanded', 'false');
    };

    navToggle.addEventListener('click', () => {
        const isOpen = siteNav.classList.toggle('is-menu-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.forEach(link => link.addEventListener('click', closeMenu));
    window.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeMenu();
    });
}
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');

if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('is-visible'));
} else {
    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('is-visible');
            currentObserver.unobserve(entry.target);
        });
    }, {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.08
    });

    revealItems.forEach(item => observer.observe(item));
}
