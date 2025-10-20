// DOM Elements
const floatingForm = document.getElementById('floating-form');
const formContainer = document.getElementById('form-container');
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const header = document.querySelector('.header');

// Form state
let isFormOpen = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeScrollEffects();
    initializeFormValidation();
    initializeFloatingButton();
    
    // Add fade-in animation to sections
    observeElements();
});

// Event Listeners
function initializeEventListeners() {
    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when clicking overlay
    if (mobileMenu) {
        mobileMenu.addEventListener('click', function(e) {
            if (e.target === mobileMenu) {
                closeMobileMenu();
            }
        });
    }
    
    // Form submission
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmission);
    }
    
    // File input validation
    const photoInput = document.getElementById('photos');
    if (photoInput) {
        photoInput.addEventListener('change', validateFileUpload);
    }
    
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
        if (isFormOpen && floatingForm && !floatingForm.contains(e.target)) {
            closeContactForm();
        }
    });
    
    // Escape key to close form and mobile menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (isFormOpen) closeContactForm();
            if (mobileMenu && mobileMenu.classList.contains('active')) closeMobileMenu();
        }
    });
}

// Floating Button Visibility Control
function initializeFloatingButton() {
    if (!floatingForm) return;
    
    // Garante que o botão esteja sempre visível
    floatingForm.classList.add('show');
}

// Mobile Menu Functions
function toggleMobileMenu() {
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
    }
}

function closeMobileMenu() {
    if (mobileMenu) {
        mobileMenu.classList.remove('active');
    }
}

// Contact Form Functions
function openContactForm() {
    if (formContainer) {
        formContainer.classList.add('active');
        isFormOpen = true;
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = contactForm ? contactForm.querySelector('input') : null;
            if (firstInput) firstInput.focus();
        }, 300);
    }
}

function closeContactForm() {
    if (formContainer) {
        formContainer.classList.remove('active');
        isFormOpen = false;
        hideFormMessage();
    }
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
    if (!contactForm) return;
    
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
    
    if (!contactForm) return;
    
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

async function submitForm() {
  if (!contactForm) return;

  const submitBtn = contactForm.querySelector('.submit-btn');
  if (!submitBtn) return;

  const originalText = submitBtn.innerHTML;

  // Loading state
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  submitBtn.disabled = true;

  try {
    // Usa todos os campos do form (inclui o csrf_token e os arquivos)
    const formData = new FormData(contactForm);

    // Envia para a view do Django (action do form já é /api/quote/)
    const resp = await fetch(contactForm.action || '/api/quote/', {
      method: 'POST',
      body: formData
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(errText || 'Failed to submit');
    }

    // Monta texto para WhatsApp (sem API)
    const fullName = contactForm.fullName?.value?.trim() || '';
    const phone    = contactForm.phone?.value?.trim() || '';
    const address  = contactForm.address?.value?.trim() || '';
    const number   = contactForm.address_number?.value?.trim() || '';
    const postal   = contactForm.postal_code?.value?.trim() || '';
    const poolSize = contactForm.poolSize?.value?.trim() || '—';
    const poolAge  = contactForm.poolAge?.value?.trim() || '—';
    const services = Array.from(
      contactForm.querySelectorAll('input[name="services"]:checked')
    ).map(i => i.value).join(', ') || '—';

    // ajuste seu número destino (DDI+DDD+número, sem "+")
    const WA_TO = '61452044521';

    const waText =
  `*Novo pedido de orçamento*\n` +
  `*Name:* ${fullName}\n` +
  `*Phone:* ${phone}\n` +
  `*Address:* ${address}, ${number} — *PostalCode:* ${postal}\n` +
  `*Size:* ${poolSize} | *Age:* ${poolAge}\n` +
  `*Services:* ${services}`;

    const waUrl = `https://wa.me/${WA_TO}?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank');

    // Sucesso (mantém seu comportamento original)
    showFormMessage(
      "Thank you! Your quote request has been sent successfully. We'll contact you within 24 hours.",
      'success'
    );

    contactForm.reset();

    const fileInfo = document.querySelector('.file-info small');
    if (fileInfo) {
      fileInfo.textContent = 'Upload up to 3 photos of your pool (JPG, PNG, max 5MB each)';
      fileInfo.style.color = '';
    }

    setTimeout(() => {
      closeContactForm();
    }, 3000);

  } catch (err) {
    console.error(err);
    showFormMessage('An error occurred while sending your request. Please try again.', 'error');
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

function showFormMessage(message, type) {
    if (!formMessage) return;
    
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';
    
    // Auto-hide error messages after 5 seconds
    if (type === 'error') {
        setTimeout(hideFormMessage, 5000);
    }
}

function hideFormMessage() {
    if (!formMessage) return;
    
    formMessage.style.display = 'none';
    formMessage.className = 'form-message';
}

// Scroll Effects
function initializeScrollEffects() {
    if (!header) return;
    
    let lastScrollTop = 0;
    
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
    const elementsToAnimate = document.querySelectorAll('.service-card, .step, .gallery-item');
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
    if (e.key === 'Tab' && isFormOpen && formContainer) {
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
    if (!contactForm) return;
    
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
    if (!contactForm) return;
    
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
if (contactForm) {
    contactForm.addEventListener('input', debouncedAutoSave);
}

// Clear saved data on successful submission
function clearSavedForm() {
    localStorage.removeItem('poolRenovationForm');
}

// Override submitForm to clear saved data
const originalSubmitForm = submitForm;
submitForm = function() {
    originalSubmitForm();
    clearSavedForm();
};

const MAX_FILES = 3;
const MAX_SIZE  = 5 * 1024 * 1024; // 5MB
const ALLOWED   = ['image/jpeg', 'image/jpg', 'image/png'];

function addPhotoInput() {
  const container = document.getElementById('photo-inputs');
  const current = container.querySelectorAll('input[type="file"]').length;
  if (current >= MAX_FILES) {
    showFormMessage(`You can only upload up to ${MAX_FILES} files.`, 'error');
    return;
  }

  const row = document.createElement('div');
  row.className = 'photo-row';

  const input = document.createElement('input');
  input.type = 'file';
  input.name = 'photos';              // MESMO name para todos
  input.accept = 'image/*';
  input.addEventListener('change', onSingleFileChange);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn-remove';
  removeBtn.textContent = '×';
  removeBtn.title = 'Remove';
  removeBtn.setAttribute('aria-label', 'Remove photo');
  removeBtn.onclick = () => removePhotoInput(removeBtn);

  row.appendChild(input);
  row.appendChild(removeBtn);
  container.appendChild(row);
}

function removePhotoInput(btn) {
  const row = btn.closest('.photo-row');
  if (row) row.remove();
  updateFileInfo();
}

function onSingleFileChange(e) {
  const f = e.target.files[0];
  if (!f) return;

  if (!ALLOWED.includes(f.type)) {
    showFormMessage('Only JPG and PNG files are allowed.', 'error');
    e.target.value = '';
    return;
  }
  if (f.size > MAX_SIZE) {
    showFormMessage('Each file must be smaller than 5MB.', 'error');
    e.target.value = '';
    return;
  }

  // reforça o limite total somando todos os inputs
  const total = totalSelectedFiles();
  if (total > MAX_FILES) {
    showFormMessage(`You can only upload up to ${MAX_FILES} files.`, 'error');
    e.target.value = '';
    return;
  }
  updateFileInfo();
}

function totalSelectedFiles() {
  const container = document.getElementById('photo-inputs');
  let count = 0;
  container.querySelectorAll('input[type="file"]').forEach(inp => {
    if (inp.files && inp.files.length) count += inp.files.length;
  });
  return count;
}

function updateFileInfo() {
  const fileInfo = document.querySelector('.file-info small');
  if (!fileInfo) return;
  const names = [];
  document.querySelectorAll('#photo-inputs input[type="file"]').forEach(inp => {
    if (inp.files && inp.files[0]) names.push(inp.files[0].name);
  });
  if (names.length) {
    fileInfo.textContent = `Selected: ${names.join(', ')}`;
    fileInfo.style.color = '#059669';
  } else {
    fileInfo.textContent = 'Upload up to 3 photos (JPG/PNG, max 5MB each)';
    fileInfo.style.color = '';
  }
}