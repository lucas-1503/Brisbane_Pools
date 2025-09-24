// DOM Elements
const floatingForm = document.getElementById('floating-form');
const formContainer = document.getElementById('form-container');
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');

// Form state
let isFormOpen = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeScrollEffects();
    initializeFormValidation();
    
    // Add fade-in animation to sections
    observeElements();
});

// Event Listeners
function initializeEventListeners() {
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    
    // Close mobile menu when clicking overlay
    mobileMenu.addEventListener('click', function(e) {
        if (e.target === mobileMenu) {
            closeMobileMenu();
        }
    });
    
    // Form submission
    contactForm.addEventListener('submit', handleFormSubmission);
    
    // File input validation
    const photoInput = document.getElementById('photos');
    photoInput.addEventListener('change', validateFileUpload);
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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
    
    // Close form when clicking outside
    document.addEventListener('click', function(e) {
        if (isFormOpen && !floatingForm.contains(e.target)) {
            closeContactForm();
        }
    });
    
    // Escape key to close form and mobile menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (isFormOpen) closeContactForm();
            if (mobileMenu.classList.contains('active')) closeMobileMenu();
        }
    });
}

// Mobile Menu Functions
function toggleMobileMenu() {
    mobileMenu.classList.toggle('active');
}

function closeMobileMenu() {
    mobileMenu.classList.remove('active');
}

// Contact Form Functions
function openContactForm() {
    formContainer.classList.add('active');
    isFormOpen = true;
    
    // Focus on first input
    setTimeout(() => {
        const firstInput = contactForm.querySelector('input');
        if (firstInput) firstInput.focus();
    }, 300);
}

function closeContactForm() {
    formContainer.classList.remove('active');
    isFormOpen = false;
    hideFormMessage();
}

function toggleContactForm() {
    if (isFormOpen) {
        closeContactForm();
    } else {
        openContactForm();
    }
}

// Form Validation
function initializeFormValidation() {
    const inputs = contactForm.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Remove existing error styling
    clearFieldError(e);
    
    if (!value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Specific validation rules
    switch (field.type) {
        case 'email':
            if (!isValidEmail(value)) {
                showFieldError(field, 'Please enter a valid email address');
                return false;
            }
            break;
        case 'tel':
            if (!isValidPhone(value)) {
                showFieldError(field, 'Please enter a valid phone number');
                return false;
            }
            break;
    }
    
    return true;
}

function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    
    // Remove error message if exists
    const errorMsg = field.parentNode.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Add error styling
    field.style.borderColor = '#dc2626';
    
    // Add error message
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    errorMsg.style.color = '#dc2626';
    errorMsg.style.fontSize = '0.875rem';
    errorMsg.style.marginTop = '0.25rem';
    errorMsg.textContent = message;
    
    field.parentNode.appendChild(errorMsg);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Australian phone number validation (basic)
    const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone) || cleanPhone.length >= 10;
}

// File Upload Validation
function validateFileUpload(e) {
    const files = e.target.files;
    const maxFiles = 3;
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    if (files.length > maxFiles) {
        showFormMessage(`You can only upload up to ${maxFiles} files.`, 'error');
        e.target.value = '';
        return false;
    }
    
    for (let file of files) {
        if (!allowedTypes.includes(file.type)) {
            showFormMessage('Only JPG and PNG files are allowed.', 'error');
            e.target.value = '';
            return false;
        }
        
        if (file.size > maxSize) {
            showFormMessage('Each file must be smaller than 5MB.', 'error');
            e.target.value = '';
            return false;
        }
    }
    
    // Show selected files info
    if (files.length > 0) {
        const fileInfo = document.querySelector('.file-info small');
        const fileNames = Array.from(files).map(f => f.name).join(', ');
        fileInfo.textContent = `Selected: ${fileNames}`;
        fileInfo.style.color = '#059669';
    }
    
    return true;
}

// Form Submission
function handleFormSubmission(e) {
    e.preventDefault();
    
    // Validate all required fields
    const requiredFields = contactForm.querySelectorAll('input[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        const fieldValid = validateField({ target: field });
        if (!fieldValid) isValid = false;
    });
    
    // Check if at least one service is selected
    const serviceCheckboxes = contactForm.querySelectorAll('input[name="services"]:checked');
    if (serviceCheckboxes.length === 0) {
        showFormMessage('Please select at least one service.', 'error');
        isValid = false;
    }
    
    if (!isValid) {
        showFormMessage('Please correct the errors above.', 'error');
        return;
    }
    
    // Simulate form submission
    submitForm();
}

function submitForm() {
    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        showFormMessage('Thank you! Your quote request has been sent successfully. We\'ll contact you within 24 hours.', 'success');
        
        // Reset form
        contactForm.reset();
        
        // Reset file info
        const fileInfo = document.querySelector('.file-info small');
        fileInfo.textContent = 'Upload up to 3 photos of your pool (JPG, PNG, max 5MB each)';
        fileInfo.style.color = '';
        
        // Close form after delay
        setTimeout(() => {
            closeContactForm();
        }, 3000);
        
    }, 2000);
}

function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';
    
    // Auto-hide error messages after 5 seconds
    if (type === 'error') {
        setTimeout(hideFormMessage, 5000);
    }
}

function hideFormMessage() {
    formMessage.style.display = 'none';
    formMessage.className = 'form-message';
}

// Scroll Effects
function initializeScrollEffects() {
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Header hide/show on scroll
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
        
        // Add shadow to header when scrolled
        if (scrollTop > 50) {
            header.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
        } else {
            header.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
        }
    });
}

// Intersection Observer for animations
function observeElements() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const elementsToAnimate = document.querySelectorAll('.service-card, .step, .stat, .gallery-item');
    elementsToAnimate.forEach(el => observer.observe(el));
}

// Utility Functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Global functions for HTML onclick handlers
window.openContactForm = openContactForm;
window.closeContactForm = closeContactForm;
window.toggleContactForm = toggleContactForm;
window.closeMobileMenu = closeMobileMenu;
window.scrollToSection = scrollToSection;

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized scroll handler
const optimizedScrollHandler = debounce(function() {
    // Additional scroll-based functionality can be added here
}, 100);

window.addEventListener('scroll', optimizedScrollHandler);

// Accessibility improvements
document.addEventListener('keydown', function(e) {
    // Tab navigation for form
    if (e.key === 'Tab' && isFormOpen) {
        const focusableElements = formContainer.querySelectorAll(
            'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
});

// Form auto-save (optional enhancement)
function autoSaveForm() {
    const formData = new FormData(contactForm);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        if (key !== 'photos') { // Don't save file uploads
            data[key] = value;
        }
    }
    
    localStorage.setItem('poolRenovationForm', JSON.stringify(data));
}

function loadSavedForm() {
    const savedData = localStorage.getItem('poolRenovationForm');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        Object.keys(data).forEach(key => {
            const field = contactForm.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = data[key] === field.value;
                } else {
                    field.value = data[key];
                }
            }
        });
    }
}

// Load saved form data on page load
document.addEventListener('DOMContentLoaded', loadSavedForm);

// Auto-save form data on input (debounced)
const debouncedAutoSave = debounce(autoSaveForm, 1000);
contactForm.addEventListener('input', debouncedAutoSave);

// Clear saved data on successful submission
function clearSavedForm() {
    localStorage.removeItem('poolRenovationForm');
}

// Add to successful form submission
const originalSubmitForm = submitForm;
submitForm = function() {
    originalSubmitForm();
    clearSavedForm();
};

