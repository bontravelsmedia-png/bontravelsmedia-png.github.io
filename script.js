// CAPTCHA Generation and Validation
let currentCaptcha = '';

function generateCaptcha() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    currentCaptcha = captcha;
    
    const captchaDisplay = document.getElementById('captcha-display');
    if (captchaDisplay) {
        captchaDisplay.textContent = captcha;
    }
}

function validateCaptcha(userInput) {
    return userInput.toUpperCase() === currentCaptcha;
}

// Formspree Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    const successMessage = document.getElementById('success-message');
    
    // Set up logo click handler
    const logoLink = document.querySelector('.nav-logo a');
    if (logoLink) {
        logoLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Initialize CAPTCHA
    generateCaptcha();
    
    // Set up refresh CAPTCHA button
    const refreshCaptchaBtn = document.getElementById('refresh-captcha');
    if (refreshCaptchaBtn) {
        refreshCaptchaBtn.addEventListener('click', function() {
            generateCaptcha();
            const captchaInput = document.getElementById('captcha-input');
            if (captchaInput) {
                captchaInput.value = '';
                captchaInput.classList.remove('error');
            }
        });
    }
    
    // Check if form was successfully submitted (URL parameter)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        if (successMessage) {
            successMessage.style.display = 'block';
        }
        // Remove the success parameter from URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (contactForm) {
        // Set up reply-to field
        const emailInput = contactForm.querySelector('input[name="email"]');
        const replyToField = contactForm.querySelector('input[name="_replyto"]');
        
        if (emailInput && replyToField) {
            emailInput.addEventListener('input', function() {
                replyToField.value = this.value;
            });
        }
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate CAPTCHA
            const captchaInput = document.getElementById('captcha-input');
            if (!captchaInput || !validateCaptcha(captchaInput.value)) {
                showNotification('Please enter the correct CAPTCHA code.', 'error');
                if (captchaInput) {
                    captchaInput.classList.add('error');
                    captchaInput.focus();
                }
                return;
            }
            
            // Remove error styling
            if (captchaInput) {
                captchaInput.classList.remove('error');
            }
            
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            
            // Show loading state
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Get form data
            const formData = new FormData(contactForm);
            
            // Submit to Formspree
            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    // Success - show success message
                    if (successMessage) {
                        successMessage.style.display = 'block';
                        contactForm.style.display = 'none';
                    }
                    showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
                    // Generate new CAPTCHA after successful submission
                    generateCaptcha();
                } else {
                    // Error
                    showNotification('Failed to send message. Please try again.', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Failed to send message. Please try again.', 'error');
            })
            .finally(() => {
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    }
});

// Notification function
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    if (type === 'success') {
        notification.style.background = '#667eea';
    } else {
        notification.style.background = '#764ba2';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Center Focused Image Slider Functionality
class ImageSlider {
    constructor() {
        this.mainSlides = document.querySelectorAll('.main-slide');
        this.sideSlides = document.querySelectorAll('.side-slide');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.currentSlide = 0;
        this.slideInterval = null;
        this.init();
    }

    init() {
        this.showSlide(this.currentSlide);
        this.startAutoSlide();
        this.bindEvents();
    }

    showSlide(index) {
        // Hide all main slides
        this.mainSlides.forEach(slide => slide.classList.remove('active'));
        this.dots.forEach(dot => dot.classList.remove('active'));

        // Show current main slide
        this.mainSlides[index].classList.add('active');
        this.dots[index].classList.add('active');

        // Update slider position and images
        this.updateSliderPosition(index);
    }

    updateSliderPosition(currentIndex) {
        const totalSlides = this.mainSlides.length;
        const sideContainers = document.querySelectorAll('.side-container');
        
        // Remove active class from all side containers
        sideContainers.forEach(container => {
            container.classList.remove('active');
        });
        
        // Update left side image (previous slide)
        const leftIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        const leftContainer = document.querySelector('.left-container .side-slide img');
        if (leftContainer) {
            leftContainer.src = this.mainSlides[leftIndex].querySelector('img').src;
        }
        
        // Update right side image (next slide)
        const rightIndex = (currentIndex + 1) % totalSlides;
        const rightContainer = document.querySelector('.right-container .side-slide img');
        if (rightContainer) {
            rightContainer.src = this.mainSlides[rightIndex].querySelector('img').src;
        }
        
        // Update center container image
        const centerContainer = document.querySelector('.center-container .main-slide.active img');
        if (centerContainer) {
            centerContainer.src = this.mainSlides[currentIndex].querySelector('img').src;
        }
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.mainSlides.length;
        this.showSlide(this.currentSlide);
    }

    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.mainSlides.length) % this.mainSlides.length;
        this.showSlide(this.currentSlide);
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.showSlide(this.currentSlide);
    }

    startAutoSlide() {
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, 8000); // Change slide every 8 seconds - increased from 5 seconds for slower transitions
    }

    stopAutoSlide() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }
    }

    bindEvents() {
        // Previous button
        this.prevBtn.addEventListener('click', () => {
            this.prevSlide();
            this.restartAutoSlide();
        });

        // Next button
        this.nextBtn.addEventListener('click', () => {
            this.nextSlide();
            this.restartAutoSlide();
        });

        // Dot navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToSlide(index);
                this.restartAutoSlide();
            });
        });

        // Side container navigation
        const sideContainers = document.querySelectorAll('.side-container');
        sideContainers.forEach(container => {
            container.addEventListener('click', () => {
                const slideIndex = parseInt(container.getAttribute('data-slide'));
                this.goToSlide(slideIndex);
                this.restartAutoSlide();
            });
        });

        // Pause auto-slide on hover with extended pause
        const sliderContainer = document.querySelector('.slider-container');
        sliderContainer.addEventListener('mouseenter', () => {
            this.stopAutoSlide();
        });

        sliderContainer.addEventListener('mouseleave', () => {
            // Add a small delay before resuming to give users time to move away
            setTimeout(() => {
                this.startAutoSlide();
            }, 1000); // 1 second delay before resuming
        });
    }

    restartAutoSlide() {
        this.stopAutoSlide();
        this.startAutoSlide();
    }
}

// Smooth Scrolling for Navigation Links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Form Handling
function initFormHandling() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = contactForm.querySelector('input[type="text"]').value;
            const email = contactForm.querySelector('input[type="email"]').value;
            const phone = contactForm.querySelector('input[type="tel"]').value;
            const message = contactForm.querySelector('textarea').value;
            
            // Simple validation
            if (!name || !email || !message) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            // Simulate form submission
            showNotification('Thank you for your message! We will get back to you soon.', 'success');
            contactForm.reset();
        });
    }
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#462c61'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        removeNotification(notification);
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        removeNotification(notification);
    });
}

function removeNotification(notification) {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Scroll animations disabled for better performance
function initScrollAnimations() {
    // Scroll animations removed to prevent performance issues
}

// CSS animations removed for better performance

// Navbar scroll effect
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
        
        lastScrollTop = scrollTop;
    });
}

// Book button functionality
function initBookButtons() {
    const bookButtons = document.querySelectorAll('.book-btn');
    
    bookButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Scroll to book flight section
            const bookFlightSection = document.querySelector('#book-flight');
            if (bookFlightSection) {
                const offsetTop = bookFlightSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Loading animation
function initLoadingAnimation() {
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // Add loading class to elements
        const loadingElements = document.querySelectorAll('.destination-card, .departure-card, .service-card, .blog-card, .team-member');
        loadingElements.forEach(el => {
            el.classList.add('loading');
        });
        
        // Trigger animations after a short delay
        setTimeout(() => {
            loadingElements.forEach(el => {
                el.classList.add('loaded');
            });
        }, 100);
    });
}

// Mobile menu toggle (for future mobile menu implementation)
function initMobileMenu() {
    // This can be expanded for mobile menu functionality
    const navbar = document.querySelector('.navbar');
    
    // Add mobile menu button if needed
    if (window.innerWidth <= 768) {
        // Mobile menu logic can be added here
    }
}

// Search Functionality
class SearchBar {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.searchSuggestions = document.getElementById('searchSuggestions');
        this.searchData = this.getSearchData();
        this.currentFocus = -1;
        this.filteredResults = [];
        this.searchHistory = this.loadSearchHistory();
        this.init();
    }

    init() {
        this.bindEvents();
        console.log('SearchBar initialized successfully');
        
        // Test the search functionality
        this.testSearch();
    }

    testSearch() {
        console.log('Testing search functionality...');
        console.log('Search input element:', this.searchInput);
        console.log('Search button element:', this.searchBtn);
        console.log('Search suggestions element:', this.searchSuggestions);
        console.log('Search data loaded:', this.searchData);
        
        // Test if elements exist
        if (!this.searchInput) console.error('Search input not found!');
        if (!this.searchBtn) console.error('Search button not found!');
        if (!this.searchSuggestions) console.error('Search suggestions not found!');
        
        console.log('Search test completed');
    }

    loadSearchHistory() {
        try {
            const history = localStorage.getItem('searchHistory');
            return history ? JSON.parse(history) : [];
        } catch (e) {
            return [];
        }
    }

    saveSearchHistory(query) {
        if (!query.trim()) return;
        
        try {
            let history = this.loadSearchHistory();
            history = history.filter(item => item !== query.trim());
            history.unshift(query.trim());
            history = history.slice(0, 10);
            localStorage.setItem('searchHistory', JSON.stringify(history));
        } catch (e) {
            console.warn('Could not save search history');
        }
    }

    showSearchHistory() {
        if (this.searchHistory.length === 0) return;
        
        const historyHtml = `
            <div class="suggestion-category">Recent Searches</div>
            ${this.searchHistory.map(query => `
                <div class="suggestion-item history-item" data-query="${query}">
                    <i class="fas fa-history"></i>
                    <div class="suggestion-content">
                        <span class="suggestion-name">${query}</span>
                        <span class="suggestion-meta">Click to search again</span>
                    </div>
                </div>
            `).join('')}
        `;
        
        this.searchSuggestions.innerHTML = historyHtml;
        this.showSuggestions();
        
        // Add click events to history items
        const historyItems = this.searchSuggestions.querySelectorAll('.history-item');
        historyItems.forEach(item => {
            item.addEventListener('click', () => {
                const query = item.dataset.query;
                this.searchInput.value = query;
                this.handleSearch(query);
                this.searchInput.focus();
            });
        });
    }

    getSearchData() {
        return {
            destinations: [
                { name: 'Bangkok, Thailand', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/bangkok.html', category: 'Asia', country: 'Thailand' },
                { name: 'Phuket, Thailand', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/phuket.html', category: 'Asia', country: 'Thailand' },
                { name: 'Chiang Mai, Thailand', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/chiang-mai.html', category: 'Asia', country: 'Thailand' },
                { name: 'Singapore City', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/singapore-city.html', category: 'Asia', country: 'Singapore' },
                { name: 'Tokyo, Japan', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/tokyo.html', category: 'Asia', country: 'Japan' },
                { name: 'Kyoto, Japan', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/kyoto.html', category: 'Asia', country: 'Japan' },
                { name: 'Osaka, Japan', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/osaka.html', category: 'Asia', country: 'Japan' },
                { name: 'Sydney, Australia', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/sydney.html', category: 'Oceania', country: 'Australia' },
                { name: 'Melbourne, Australia', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/melbourne.html', category: 'Oceania', country: 'Australia' },
                { name: 'New York, United States', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/new-york.html', category: 'North America', country: 'United States' },
                { name: 'Los Angeles, United States', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/los-angeles.html', category: 'North America', country: 'United States' },
                { name: 'San Francisco, United States', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/san-francisco.html', category: 'North America', country: 'United States' },
                { name: 'London, United Kingdom', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/london.html', category: 'Europe', country: 'United Kingdom' },
                { name: 'Edinburgh, United Kingdom', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/edinburgh.html', category: 'Europe', country: 'United Kingdom' },
                { name: 'Dubai, United Arab Emirates', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/dubai.html', category: 'Middle East', country: 'United Arab Emirates' },
                { name: 'Abu Dhabi, United Arab Emirates', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/abu-dhabi.html', category: 'Middle East', country: 'United Arab Emirates' },
                { name: 'Seoul, South Korea', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/seoul.html', category: 'Asia', country: 'South Korea' },
                { name: 'Busan, South Korea', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/busan.html', category: 'Asia', country: 'South Korea' },
                { name: 'Toronto, Canada', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/toronto.html', category: 'North America', country: 'Canada' },
                { name: 'Vancouver, Canada', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/vancouver.html', category: 'North America', country: 'Canada' },
                { name: 'Montreal, Canada', type: 'destination', icon: 'fas fa-map-marker-alt', url: 'destinations/montreal.html', category: 'North America', country: 'Canada' }
            ],
            flights: [
                { name: 'Flight to Bangkok', type: 'flight', icon: 'fas fa-plane', url: '#book-flight', category: 'Flights', country: 'Thailand' },
                { name: 'Flight to Singapore', type: 'flight', icon: 'fas fa-plane', url: '#book-flight', category: 'Flights', country: 'Singapore' },
                { name: 'Flight to Tokyo', type: 'flight', icon: 'fas fa-plane', url: '#book-flight', category: 'Flights', country: 'Japan' },
                { name: 'Flight to Sydney', type: 'flight', icon: 'fas fa-plane', url: '#book-flight', category: 'Flights', country: 'Australia' },
                { name: 'Flight to New York', type: 'flight', icon: 'fas fa-plane', url: '#book-flight', category: 'Flights', country: 'United States' },
                { name: 'Flight to London', type: 'flight', icon: 'fas fa-plane', url: '#book-flight', category: 'Flights', country: 'United Kingdom' },
                { name: 'Flight to Dubai', type: 'flight', icon: 'fas fa-plane', url: '#book-flight', category: 'Flights', country: 'United Arab Emirates' }
            ],
            hotels: [
                { name: 'Hotel in Bangkok', type: 'hotel', icon: 'fas fa-bed', url: '#book-flight', category: 'Accommodation', country: 'Thailand' },
                { name: 'Hotel in Singapore', type: 'hotel', icon: 'fas fa-bed', url: '#book-flight', category: 'Accommodation', country: 'Singapore' },
                { name: 'Hotel in Tokyo', type: 'hotel', icon: 'fas fa-bed', url: '#book-flight', category: 'Accommodation', country: 'Japan' },
                { name: 'Hotel in Sydney', type: 'hotel', icon: 'fas fa-bed', url: '#book-flight', category: 'Accommodation', country: 'Australia' },
                { name: 'Hotel in New York', type: 'hotel', icon: 'fas fa-bed', url: '#book-flight', category: 'Accommodation', country: 'United States' }
            ],
            services: [
                { name: 'Visa Services', type: 'service', icon: 'fas fa-passport', url: '#services', category: 'Travel Services', country: 'Global' },
                { name: 'Tour Packages', type: 'service', icon: 'fas fa-suitcase', url: '#services', category: 'Travel Services', country: 'Global' },
                { name: 'Hotel Reservations', type: 'service', icon: 'fas fa-hotel', url: '#services', category: 'Travel Services', country: 'Global' },
                { name: 'Flight Booking', type: 'service', icon: 'fas fa-ticket-alt', url: '#book-flight', category: 'Travel Services', country: 'Global' }
            ]
        };
    }

    bindEvents() {
        // Input event for search
        this.searchInput.addEventListener('input', (e) => {
            console.log('Search input:', e.target.value);
            this.handleSearch(e.target.value);
        });

        // Focus event
        this.searchInput.addEventListener('focus', () => {
            console.log('Search input focused');
            if (this.searchInput.value.trim().length < 2) {
                this.showSearchHistory();
            } else {
                this.showSuggestions();
            }
            this.searchInput.parentElement.classList.add('focused');
        });

        // Search button click
        this.searchBtn.addEventListener('click', () => {
            console.log('Search button clicked');
            this.performSearch();
        });

        // Keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.searchSuggestions.contains(e.target)) {
                this.hideSuggestions();
            }
        });

        // Blur event
        this.searchInput.addEventListener('blur', () => {
            if (!this.searchInput.value) {
                this.searchInput.parentElement.classList.remove('focused');
            }
        });

        // Simple fallback search for testing
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('Enter key pressed, performing fallback search');
                this.simpleSearch();
            }
        });

        console.log('Search events bound successfully');
    }

    simpleSearch() {
        const query = this.searchInput.value.trim();
        if (query) {
            console.log('Simple search for:', query);
            
            // Show a simple result
            this.searchSuggestions.innerHTML = `
                <div class="suggestion-item">
                    <i class="fas fa-search"></i>
                    <div class="suggestion-content">
                        <span class="suggestion-name">Searching for: ${query}</span>
                        <span class="suggestion-meta">Click to see results</span>
                    </div>
                </div>
            `;
            this.showSuggestions();
        }
    }

    handleKeydown(e) {
        const suggestions = this.searchSuggestions.querySelectorAll('.suggestion-item');
        
        if (e.key === 'Enter') {
            e.preventDefault();
            if (this.currentFocus > -1 && suggestions[this.currentFocus]) {
                suggestions[this.currentFocus].click();
            } else {
                this.performSearch();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.currentFocus = (this.currentFocus + 1) % suggestions.length;
            this.updateFocus(suggestions);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.currentFocus = this.currentFocus <= 0 ? suggestions.length - 1 : this.currentFocus - 1;
            this.updateFocus(suggestions);
        } else if (e.key === 'Escape') {
            this.hideSuggestions();
            this.searchInput.blur();
        }
    }

    updateFocus(suggestions) {
        suggestions.forEach((item, index) => {
            item.classList.toggle('focused', index === this.currentFocus);
        });
        
        if (this.currentFocus > -1 && suggestions[this.currentFocus]) {
            suggestions[this.currentFocus].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }

    handleSearch(query) {
        console.log('Handling search for:', query);
        
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }

        this.filteredResults = this.searchData.destinations
            .concat(this.searchData.flights)
            .concat(this.searchData.hotels)
            .concat(this.searchData.services)
            .filter(item => 
                item.name.toLowerCase().includes(query.toLowerCase()) ||
                item.country.toLowerCase().includes(query.toLowerCase()) ||
                item.category.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 12);

        console.log('Filtered results:', this.filteredResults);
        this.displaySuggestions(this.filteredResults);
    }

    displaySuggestions(results) {
        console.log('Displaying suggestions:', results);
        
        if (results.length === 0) {
            this.searchSuggestions.innerHTML = `
                <div class="suggestion-item no-results">
                    <i class="fas fa-search"></i>
                    <span>No results found for "${this.searchInput.value}"</span>
                </div>
            `;
        } else {
            // Group results by category
            const groupedResults = this.groupResultsByCategory(results);
            this.searchSuggestions.innerHTML = this.renderGroupedSuggestions(groupedResults);
        }

        this.showSuggestions();
        this.currentFocus = -1;

        // Add click events to suggestions
        const suggestionItems = this.searchSuggestions.querySelectorAll('.suggestion-item');
        suggestionItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                console.log('Suggestion clicked:', item.dataset.name);
                this.searchInput.value = item.dataset.name;
                this.navigateToResult(item.dataset.url);
                this.hideSuggestions();
            });

            item.addEventListener('mouseenter', () => {
                this.currentFocus = index;
                this.updateFocus(suggestionItems);
            });
        });
    }

    groupResultsByCategory(results) {
        const groups = {};
        results.forEach(item => {
            if (!groups[item.category]) {
                groups[item.category] = [];
            }
            groups[item.category].push(item);
        });
        return groups;
    }

    renderGroupedSuggestions(groupedResults) {
        let html = '';
        Object.keys(groupedResults).forEach(category => {
            html += `<div class="suggestion-category">${category}</div>`;
            groupedResults[category].forEach(item => {
                html += `
                    <div class="suggestion-item" data-type="${item.type}" data-name="${item.name}" data-url="${item.url}">
                        <i class="${item.icon}"></i>
                        <div class="suggestion-content">
                            <span class="suggestion-name">${item.name}</span>
                            <span class="suggestion-meta">${item.country}</span>
                        </div>
                    </div>
                `;
            });
        });
        return html;
    }

    showSuggestions() {
        console.log('Showing suggestions');
        this.searchSuggestions.classList.add('active');
    }

    hideSuggestions() {
        console.log('Hiding suggestions');
        this.searchSuggestions.classList.remove('active');
        this.currentFocus = -1;
    }

    performSearch() {
        const query = this.searchInput.value.trim();
        console.log('Performing search for:', query);
        
        if (query) {
            // Find the best match
            const allResults = this.searchData.destinations
                .concat(this.searchData.flights)
                .concat(this.searchData.hotels)
                .concat(this.searchData.services);
            
            const bestMatch = allResults.find(item => 
                item.name.toLowerCase() === query.toLowerCase()
            );
            
            if (bestMatch) {
                this.navigateToResult(bestMatch.url);
            } else {
                this.showNotification(`Searching for: ${query}`);
            }
            
            this.hideSuggestions();
            this.saveSearchHistory(query);
        }
    }

    navigateToResult(url) {
        console.log('Navigating to:', url);
        
        if (url.startsWith('#')) {
            // Internal link - scroll to section
            const targetSection = document.querySelector(url);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        } else {
            // External link - navigate to page
            window.location.href = url;
        }
    }

    showNotification(message) {
        console.log('Showing notification:', message);
        
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'search-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
            z-index: 10000;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize image slider
    new ImageSlider();
    
    // Initialize search bar
    new SearchBar();
    
    // Initialize other features
    initSmoothScrolling();
    initFormHandling();
    initScrollAnimations();
    initNavbarScroll();
    initBookButtons();
    initLoadingAnimation();
    initMobileMenu();
    
    // Add some interactive features
    addHoverEffects();
});

// Additional hover effects
function addHoverEffects() {
    // Hero section parallax effect removed for better performance
    
    // Add click effects to buttons
    const buttons = document.querySelectorAll('button, .cta-button, .sasto-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Add ripple animation to CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Performance optimization: Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Scroll-based animations removed for better performance
