// Mobile Menu and Language Switcher Script for all pages

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });

        // Close mobile menu when clicking on nav links
        const navLinkItems = navLinks.querySelectorAll('a');
        navLinkItems.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            });
        });
    }

    // Language switcher functionality
    const langButtons = document.querySelectorAll('.lang-btn');
    
    // Set initial language
    const currentLang = localStorage.getItem('language') || 'tr';
    setLanguage(currentLang);
    
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
            localStorage.setItem('language', lang);
            
            // Update page title based on current page
            updatePageTitle(lang);
        });
    });

    function setLanguage(lang) {
        // Update button states
        langButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }
        });

        // Update all elements with data-tr and data-en attributes
        const elements = document.querySelectorAll('[data-tr], [data-en]');
        elements.forEach(element => {
            if (lang === 'en') {
                if (element.getAttribute('data-en')) {
                    element.textContent = element.getAttribute('data-en');
                }
            } else {
                if (element.getAttribute('data-tr')) {
                    element.textContent = element.getAttribute('data-tr');
                }
            }
        });
    }

    function updatePageTitle(lang) {
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('dernektuzugu')) {
            document.title = lang === 'en' ? 'Association Charter - EAGD' : 'Dernek Tüzüğü - EAGD';
        } else if (currentPage.includes('organizasyon')) {
            document.title = lang === 'en' ? 'Organization Structure - EAGD' : 'Organizasyon Yapısı - EAGD';
        } else if (currentPage.includes('prensiplerimiz')) {
            document.title = lang === 'en' ? 'Our Principles - EAGD' : 'Prensiplerimiz - EAGD';
        } else if (currentPage.includes('e-atik')) {
            document.title = lang === 'en' ? 'E-Waste - EAGD' : 'E-Atık - EAGD';
        } else {
            document.title = lang === 'en' ? 'EAGD - Electronic Waste Recycling Support Association' : 'EAGD - Elektronik Atıkların Geri Dönüşümünü Destekleme Derneği';
        }
    }
});

