// Remove no-js class to enable animations
document.documentElement.classList.remove('no-js');

// Immediate language detection and application
(function() {
    const currentLang = localStorage.getItem('language') || 'tr';
    const elements = document.querySelectorAll('[data-tr][data-en]');
    elements.forEach(element => {
        if (currentLang === 'en') {
            element.textContent = element.getAttribute('data-en');
        } else {
            element.textContent = element.getAttribute('data-tr');
        }
    });
    
    // Update page title immediately
    if (currentLang === 'en') {
        document.title = 'EAGD - Electronic Waste Recycling Support Association';
    } else {
        document.title = 'EAGD - Elektronik Atıkların Geri Dönüşümünü Destekleme Derneği';
    }
})();

// Smooth scrolling for navigation links
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

// Add scroll effect to header
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = '#fff';
        header.style.backdropFilter = 'none';
    }
});

// Animate stats on scroll
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const finalNumber = stat.textContent;
                const number = parseInt(finalNumber.replace(/\D/g, ''));
                let current = 0;
                const increment = number / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= number) {
                        stat.textContent = finalNumber;
                        clearInterval(timer);
                    } else {
                        stat.textContent = Math.floor(current) + '+';
                    }
                }, 30);
            });
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - initializing...');
    
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        observer.observe(statsSection);
    }

    // Scroll animations for all sections
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    const scrollObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animateElements.forEach(element => {
        scrollObserver.observe(element);
    });

    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    if (navLinks) {
        navLinks.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                this.classList.remove('active');
                if (mobileMenuToggle) {
                    mobileMenuToggle.classList.remove('active');
                }
            }
        });
    }

    // Language switching functionality
    function initLanguageSwitcher() {
        try {
            console.log('Initializing language switcher...');
            const langButtons = document.querySelectorAll('.lang-btn');
            console.log('Found language buttons:', langButtons.length);
            
            const currentLang = localStorage.getItem('language') || 'tr';
            console.log('Current language from localStorage:', currentLang);
            
            // Set initial language immediately on page load
            setLanguage(currentLang);
            
            langButtons.forEach((button, index) => {
                console.log(`Setting up button ${index}:`, button);
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const lang = this.getAttribute('data-lang');
                    console.log('Language button clicked:', lang);
                    console.log('Button element:', this);
                    
                    setLanguage(lang);
                    localStorage.setItem('language', lang);
                    
                    // Trigger language change event for other pages
                    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
                });
            });
            
            // Listen for language changes from other pages
            window.addEventListener('languageChanged', function(event) {
                console.log('Language change event received:', event.detail.language);
                setLanguage(event.detail.language);
            });
        } catch (error) {
            console.error('Language switcher initialization error:', error);
        }
    }

    function setLanguage(lang) {
        try {
            console.log('Setting language to:', lang);
            const langButtons = document.querySelectorAll('.lang-btn');
            console.log('Found buttons for state update:', langButtons.length);
            
            // Update button states
            langButtons.forEach((btn, index) => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-lang') === lang) {
                    btn.classList.add('active');
                    console.log(`Button ${index} set to active for language:`, lang);
                }
            });

            // Update all elements with data attributes
            const elements = document.querySelectorAll('[data-tr][data-en]');
            console.log('Found elements to translate:', elements.length);
            
            let translatedCount = 0;
            elements.forEach((element, index) => {
                if (lang === 'en') {
                    const enText = element.getAttribute('data-en');
                    if (enText) {
                        element.textContent = enText;
                        translatedCount++;
                    }
                } else {
                    const trText = element.getAttribute('data-tr');
                    if (trText) {
                        element.textContent = trText;
                        translatedCount++;
                    }
                }
            });
            console.log('Translated elements:', translatedCount);

            // Update page title
            if (lang === 'en') {
                document.title = 'EAGD - Electronic Waste Recycling Support Association';
            } else {
                document.title = 'EAGD - Elektronik Atıkların Geri Dönüşümünü Destekleme Derneği';
            }
            
            console.log('Language successfully changed to:', lang);
        } catch (error) {
            console.error('Language change error:', error);
        }
    }
    
    // Initialize language switcher
    initLanguageSwitcher();

    // Form functionality
    const donationForm = document.getElementById('donationForm');
    const deviceDetails = document.getElementById('deviceDetails');
    const deviceCheckbox = document.querySelector('input[name="help_options"][value="donate_device"]');

    if (donationForm && deviceDetails) {
        // Device details are now always visible

        // Form submission
        donationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const fullName = this.querySelector('input[name="full_name"]').value.trim();
            const phone = this.querySelector('input[name="phone"]').value.trim();
            const email = this.querySelector('input[name="email"]').value.trim();
            const city = this.querySelector('input[name="city"]').value.trim();
            const message = this.querySelector('textarea[name="message"]').value.trim();
            const privacyPolicy = this.querySelector('input[name="privacy_policy"]').checked;
            
            // Get help options
            const helpOptions = Array.from(document.querySelectorAll('input[name="help_options"]:checked')).map(cb => cb.value);
            
            // Get device details if available
            const deviceType = this.querySelector('select[name="device_type"]')?.value || '';
            const deviceCondition = this.querySelector('select[name="device_condition"]')?.value || '';
            const deviceContent = this.querySelector('textarea[name="device_content"]')?.value || '';
            const deviceBrand = this.querySelector('input[name="device_brand"]')?.value || '';
            const deviceModel = this.querySelector('input[name="device_model"]')?.value || '';
            
            console.log('Device details from form:');
            console.log('Device Type:', deviceType);
            console.log('Device Condition:', deviceCondition);
            console.log('Device Content:', deviceContent);
            console.log('Device Brand:', deviceBrand);
            console.log('Device Model:', deviceModel);
            
            // Basic validation
            if (!fullName || fullName.length < 2) {
                alert('Ad Soyad en az 2 karakter olmalıdır');
                return;
            }
            
            if (!phone || phone.length < 10) {
                alert('Telefon numarası en az 10 karakter olmalıdır');
                return;
            }
            
            if (!privacyPolicy) {
                alert('Gizlilik politikasını kabul etmelisiniz');
                return;
            }
            
            // Prepare data
            const data = {
                full_name: fullName,
                phone: phone,
                email: email || undefined,
                city: city || undefined,
                message: message || undefined,
                privacy_policy: privacyPolicy,
                help_options: helpOptions,
                device_type: deviceType,
                device_condition: deviceCondition,
                device_content: deviceContent,
                device_brand: deviceBrand,
                device_model: deviceModel
            };
            
            console.log('Form data being sent:', JSON.stringify(data, null, 2));
            
            try {
                const response = await fetch('/api/donations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    alert('Bağış formunuz başarıyla gönderildi! En kısa sürede sizinle iletişime geçeceğiz.');
                    this.reset();
                } else {
                    console.error('Server response:', JSON.stringify(result, null, 2));
                    alert(result.error || 'Form gönderilirken hata oluştu');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('Form gönderilirken hata oluştu. Lütfen tekrar deneyin.');
            }
        });
    }
});
