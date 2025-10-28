document.addEventListener('DOMContentLoaded', () => {
    // --- MOBILE MENU LOGIC ---
    const mobileMenu = document.getElementById('mobile-menu');
    const openMenuBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-mobile-menu-btn');

    if (mobileMenu && openMenuBtn && closeMenuBtn) {
        const mobileNavLinks = mobileMenu.querySelectorAll('a');

        const openMobileMenu = () => mobileMenu.classList.remove('hidden');
        const closeMobileMenu = () => mobileMenu.classList.add('hidden');

        openMenuBtn.addEventListener('click', openMobileMenu);
        closeMenuBtn.addEventListener('click', closeMobileMenu);
        
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }
});
