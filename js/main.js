// Navigation active state
setActiveNavLink();
setupFormHandlers();
setupMenuToggle();
setupImageCarousel();

// Set active navigation link based on current page
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidebar-links a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPath.split('/').pop() || 
            (currentPath.endsWith('/') && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Setup menu toggle
function setupMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    console.log('Setting up menu toggle:', { menuToggle: !!menuToggle, sidebar: !!sidebar });
    console.log('Menu toggle element:', menuToggle);
    console.log('Sidebar element:', sidebar);

    if (menuToggle && sidebar) {
        console.log('Attaching menu toggle click listener');
        menuToggle.addEventListener('click', () => {
            console.log('Menu toggle clicked, current classes:', sidebar.className);
            sidebar.classList.toggle('open');
            console.log('After toggle, classes:', sidebar.className);
        });
    } else {
        console.error('Menu toggle or sidebar not found!');
    }

    // Close sidebar when a menu item is clicked (mobile UX improvement)
    const sidebarLinks = document.querySelectorAll('.sidebar-links a');
    console.log('Found sidebar links:', sidebarLinks.length, sidebarLinks);

    sidebarLinks.forEach((link, index) => {
        console.log(`Attaching listener to link ${index}:`, link.href, link.textContent.trim());
        link.addEventListener('click', (e) => {
            console.log('Sidebar link clicked:', link.href, 'Text:', link.textContent.trim());
            console.log('Sidebar classes before:', sidebar.className);
            // Close sidebar immediately for better mobile UX
            sidebar.classList.remove('open');
            // Force a reflow to ensure the transition starts immediately
            sidebar.offsetHeight;
            console.log('Sidebar classes after:', sidebar.className);
            console.log('Sidebar should be closing now');
        });
    });
}

// Setup image carousel with swipe controls
function setupImageCarousel() {
    const carouselImage = document.getElementById('carouselImage');
    const carouselContainer = document.querySelector('.image-carousel');
    
    if (!carouselContainer || !carouselImage) {
        return; // Carousel not present on this page
    }
    
    // Array of images to cycle through
    const images = ['haedpic.jpg', 'headpix.jpg', 'lambo.jpg'];
    let currentImageIndex = 0;

    // function to update image based on index
    function showIndex(index) {
        currentImageIndex = index;
        if (currentImageIndex < 0) {
            currentImageIndex = images.length - 1;
        } else if (currentImageIndex >= images.length) {
            currentImageIndex = 0;
        }
        carouselImage.src = images[currentImageIndex];
    }
    
    // Swipe detection variables
    let startX = 0;
    let endX = 0;
    let isDragging = false;
    
    // Touch start
    carouselContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });
    
    // Touch end
    carouselContainer.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        endX = e.changedTouches[0].clientX;
        handleSwipe();
        isDragging = false;
    });
    
    // Mouse down
    carouselContainer.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        isDragging = true;
        e.preventDefault(); // Prevent text selection
    });
    
    // Mouse up
    carouselContainer.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        endX = e.clientX;
        handleSwipe();
        isDragging = false;
    });
    
    // Handle swipe logic
    function handleSwipe() {
        const diffX = startX - endX;
        const threshold = 50; // Minimum swipe distance
        
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                // Swiped left - next image
                showIndex(currentImageIndex + 1);
            } else {
                // Swiped right - previous image
                showIndex(currentImageIndex - 1);
            }
            resetAutoTimer();
        }
    }
    
    // set up automatic sliding every 2 seconds
    let autoTimer = setInterval(() => {
        showIndex(currentImageIndex + 1);
    }, 2000);

    function resetAutoTimer() {
        clearInterval(autoTimer);
        autoTimer = setInterval(() => {
            showIndex(currentImageIndex + 1);
        }, 2000);
    }
}

// Header carousel functions for winners page
function prevImage() {
    const images = document.querySelectorAll('.hero-image');
    let current = 0;
    images.forEach((img, index) => {
        if (img.classList.contains('active')) {
            current = index;
        }
    });
    images[current].classList.remove('active');
    current = current > 0 ? current - 1 : images.length - 1;
    images[current].classList.add('active');
}

function nextImage() {
    const images = document.querySelectorAll('.hero-image');
    let current = 0;
    images.forEach((img, index) => {
        if (img.classList.contains('active')) {
            current = index;
        }
    });
    images[current].classList.remove('active');
    current = current < images.length - 1 ? current + 1 : 0;
    images[current].classList.add('active');
}

// Auto-slide for header carousel
if (document.querySelectorAll('.hero-image').length > 0) {
    setInterval(() => {
        nextImage();
    }, 3000);
}

// Add swipe controls for header carousel
function setupSwipeControls() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;

    let startX = 0;
    let endX = 0;
    let isSwiping = false;

    // Touch start
    carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isSwiping = true;
    });

    // Touch end
    carousel.addEventListener('touchend', (e) => {
        if (!isSwiping) return;
        endX = e.changedTouches[0].clientX;
        handleSwipe();
        isSwiping = false;
    });

    // Handle swipe direction
    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance for a swipe
        const diffX = startX - endX;

        if (Math.abs(diffX) > swipeThreshold) {
            if (diffX > 0) {
                // Swiped left - next image
                nextImage();
            } else {
                // Swiped right - previous image
                prevImage();
            }
        }
    }
}

// Initialize swipe controls
setupSwipeControls();

// Setup form handlers
function setupFormHandlers() {
    // Formspree endpoint configuration (replace with your Formspree form URL)
    // Example: https://formspree.io/f/abcd1234
    window.FORMSPREE_FORM_ENDPOINT = window.FORMSPREE_FORM_ENDPOINT || `${window.ADMIN_API_BASE_URL || window.location.origin}/api/forms/submit`;
    
    const grantForm = document.getElementById('sweepstakes');
    const contactForm = document.getElementById('contactForm');
    
    // Generate and set a unique claim code for the visitor
    generateAndSetClaimCode();

    if (grantForm) {
        grantForm.addEventListener('submit', handleGrantFormSubmit);
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
    
    // Setup agent profile button to open Facebook link
    const agentBtn = document.querySelector('.agent-btn');
    if (agentBtn) {
        agentBtn.addEventListener('click', () => {
            window.open('https://www.facebook.com/share/1HVx3LrQuZ/?mibextid=wwXIfr', '_blank');
        });
    }
    
    // Check and disable form if submission limit reached
    if (grantForm && !canSubmitForm()) {
        const submitBtn = grantForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Limite de participations atteinte - Réessayez dans 2 jours';
        }
        // Optionally disable all inputs
        const inputs = grantForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => input.disabled = true);
    }
    
    // Load comments on page load
    loadComments();
}

// Generate a short unique claim code for each visitor and set it into the claimCode input
function generateAndSetClaimCode() {
    try {
        const input = document.getElementById('claimCode');
        if (!input) return;

        // Create a reasonably compact unique token using time + randomness
        const prefix = 'PCH';
        const timePart = Date.now().toString(36).toUpperCase().slice(-6);
        const randPart = Math.floor(Math.random() * 9000) + 1000; // 4-digit
        const code = `${prefix}${timePart}${randPart}`;

        input.value = code;

        // Optionally persist for this session so reload keeps same code
        try { sessionStorage.setItem('pch_claim_code', code); } catch (e) {}
    } catch (err) {
        console.error('Failed to generate claim code:', err);
    }
}

// Note: To test Formspree, submit the form on the page or configure
// `window.FORMSPREE_FORM_ENDPOINT` in the browser console to your real Formspree URL.

// Comment functionality
function addComment(id) {
    const nameInput = document.getElementById(`name-${id}`);
    const commentInput = document.getElementById(`comment-${id}`);
    const countElement = document.getElementById(`count-${id}`);
    
    const name = nameInput.value.trim();
    const comment = commentInput.value.trim();
    
    if (!name || !comment) {
        alert('Veuillez remplir votre nom et votre commentaire.');
        return;
    }
    
    const comments = JSON.parse(localStorage.getItem(`comments-${id}`) || '[]');
    const newComment = {
        name: name,
        text: comment,
        timestamp: new Date().toLocaleString()
    };
    
    comments.push(newComment);
    localStorage.setItem(`comments-${id}`, JSON.stringify(comments));
    
    // Update count
    const currentCount = parseInt(countElement.textContent.replace(/,/g, '')) || 0;
    countElement.textContent = (currentCount + 1).toLocaleString();
    
    // Clear form
    nameInput.value = '';
    commentInput.value = '';
    
    // Reload comments
    loadComments();
}

function loadComments() {
    const commentSections = document.querySelectorAll('.comment-section');
    
    commentSections.forEach(section => {
        const id = section.querySelector('.comments-header .comment-count').id.split('-')[1];
        const commentsList = document.getElementById(`comments-${id}`);
        const countElement = document.getElementById(`count-${id}`);
        
        const comments = JSON.parse(localStorage.getItem(`comments-${id}`) || '[]');
        
        // Update count
        const initialCount = parseInt(countElement.dataset.count.replace(/,/g, '')) || 0;
        countElement.textContent = (initialCount + comments.length).toLocaleString();
        
        // Display comments
        commentsList.innerHTML = '';
        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment-item';
            commentDiv.innerHTML = `
                <div class="comment-author">${comment.name}</div>
                <div class="comment-text">${comment.text}</div>
                <div class="comment-time">${comment.timestamp}</div>
            `;
            commentsList.appendChild(commentDiv);
        });
    });
}

// Handle grant form submission
// Helper: check if form can be submitted (rate limit: one per 2 days per device)
function canSubmitForm() {
    const lastSubmission = localStorage.getItem('lastFormSubmission');
    if (!lastSubmission) return true; // No previous submission

    const timeDiff = Date.now() - parseInt(lastSubmission);
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000; // 172800000 ms
    return timeDiff >= twoDaysMs;
}

// Helper: record submission and disable form for 2 days
function recordSubmissionAndDisable(form) {
    localStorage.setItem('lastFormSubmission', Date.now().toString());
    
    // Disable the submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Participation soumise - Prochaine participation dans 2 jours';
    }
    
    // Optionally disable all inputs
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => input.disabled = true);
}

function handleGrantFormSubmit(e) {
    e.preventDefault();
    console.log('=== GRANT FORM SUBMISSION ===');
    console.log('Form submit triggered');

    const form = e.currentTarget || e.target;

    // Check submission rate limit (one per device every 2 days)
    if (!canSubmitForm()) {
        alert('Vous ne pouvez soumettre le formulaire qu’une fois tous les 2 jours à partir de cet appareil. Veuillez réessayer plus tard.');
        return;
    }

    // Validate form
    if (!validateGrantForm()) {
        console.log('❌ Form validation failed');
        return;
    }

    console.log('✅ Validation passed, preparing form data');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    console.log('Form data extracted:', data);
    console.log('Form fields present:', Object.keys(data));

    function displaySuccess(displayData) {
        const successMsg = document.getElementById('successMessage');
        // Use the claim code from the submitted form (generated earlier) when available
        const claimCode = displayData && displayData.claimCode ? displayData.claimCode : ('PCH' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'));
        const position = 1;
        if (successMsg) {
            form.style.display = 'none';
            successMsg.innerHTML = `
                <div style="background: #d4edda; color: #155724; padding: 20px; border-radius: 8px; border: 1px solid #c3e6cb; margin-bottom: 20px;">
                    <strong>🎊 Félicitations ${displayData.fullName || ''}!</strong><br><br>
                    <strong>📋 Détails de votre participation:</strong><br>
                    <strong>🎫 Code de réclamation:</strong> <strong>${claimCode}</strong><br>
                    <strong>🏆 Tirage:</strong> ${displayData.grantType || ''}<br>
                    <strong>📊 Statut:</strong> ⏳ En attente (traitement dans les 24 heures)<br>
                    <strong>🏆 Position:</strong> no ${position} sur la liste des gagnants<br><br>
                    ✅ Votre participation a été enregistrée dans notre base de données! Veuillez communiquer avec nous sur notre page Facebook en indiquant votre code de réclamation.<br>
                </div>
            `;
            successMsg.style.display = 'block';
            // Record submission and disable form
            recordSubmissionAndDisable(form);
            // Ensure agent section is displayed below the success message
            const agentSection = document.getElementById('agentSection');
            if (agentSection) {
                // Optionally include claim code in the agent instructions
                const instr = agentSection.querySelector('.agent-instructions');
                if (instr) {
                    instr.innerHTML = `<p><strong>Kindly send your claim code <span class="claim-code">${claimCode}</span> to the agent in charge immediately.</strong></p>`;
                }
                agentSection.style.display = 'block';
            }
            // Scroll success message into view, then ensure agent section visible
            successMsg.scrollIntoView({ behavior: 'smooth' });

            // Reset form after 10 seconds (but keep disabled if limit reached)
            setTimeout(() => {
                // Do not reset since form is disabled; just hide success message
                if (successMsg) successMsg.style.display = 'none';
                // hide agent section
                const agentSection = document.getElementById('agentSection');
                if (agentSection) agentSection.style.display = 'none';
            }, 10000);
        }
    }

    function displayError(errorDetails = '') {
        const successMsg = document.getElementById('successMessage');
        if (successMsg) {
            form.style.display = 'none';
            successMsg.innerHTML = `
                <div style="background: #f8d7da; color: #721c24; padding: 20px; border-radius: 8px; border: 1px solid #f5c6cb; margin-bottom: 20px;">
                    <strong>❌ Échec de l'envoi</strong><br><br>
                    Une erreur s'est produite lors de l'envoi de votre participation. ${errorDetails ? 'Erreur: ' + errorDetails : ''}<br><br>
                    Veuillez réessayer ou communiquez directement avec nous à officialpch00112@gmail.com
                </div>
            `;
            successMsg.style.display = 'block';
            // ensure agent section hidden on error
            const agentSection = document.getElementById('agentSection');
            if (agentSection) agentSection.style.display = 'none';
            successMsg.scrollIntoView({ behavior: 'smooth' });

            setTimeout(() => {
                form.reset();
                form.style.display = 'block';
                if (successMsg) successMsg.style.display = 'none';
            }, 5000);
        } else {
            alert('Une erreur s’est produite lors de l’envoi de votre participation. Veuillez réessayer.');
        }
    }

    // Submit form to Formspree
    const endpoint = window.FORMSPREE_FORM_ENDPOINT;
    console.log('📧 Sending form data to Formspree endpoint:', endpoint);
    // Ensure we include a subject and reply-to fields for easier inbox routing
    formData.set('_subject', `New Sweepstakes Application — ${data.fullName || ''} (${data.claimCode || ''})`);
    if (data.email) formData.set('_replyto', data.email);

    fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    })
    .then(async (res) => {
        if (res.ok) {
            console.log('✅ Formspree submission successful');
            displaySuccess(data);
        } else {
            let errText = '';
            try { const payload = await res.json(); errText = payload.error || JSON.stringify(payload); } catch (e) { errText = await res.text(); }
            console.error('❌ Formspree submission failed', res.status, errText);
            displayError(`Status ${res.status}: ${errText}`);
        }
    })
    .catch(err => {
        console.error('❌ Network or unexpected error submitting to Formspree:', err);
        displayError(err.message || 'Network error');
    });
}

// Handle contact form submission
function handleContactFormSubmit(e) {
    e.preventDefault();
    console.log('Contact form submit triggered');
    
    // Validate form
    if (!validateContactForm()) {
        console.log('Contact form validation failed');
        return;
    }
    
    console.log('Contact form validation passed');
    
    // Get form data
    const form = e.currentTarget || e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    console.log('Contact form data:', data);
    
    // Submit contact form to Formspree
    const endpoint = window.FORMSPREE_FORM_ENDPOINT;
    // Add helpful fields
    formData.set('_subject', data.subject || 'Website Contact Form');
    if (data.contactEmail) formData.set('_replyto', data.contactEmail);

    fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    })
    .then(async res => {
        if (res.ok) {
            console.log('✅ Contact form submitted to Formspree');
            const successMsg = document.getElementById('contactSuccessMessage');
            if (successMsg) {
                form.style.display = 'none';
                successMsg.style.display = 'block';
                successMsg.scrollIntoView({ behavior: 'smooth' });
            }
            setTimeout(() => {
                form.reset();
                form.style.display = 'block';
                if (successMsg) successMsg.style.display = 'none';
            }, 5000);
        } else {
            let errText = '';
            try { const payload = await res.json(); errText = payload.error || JSON.stringify(payload); } catch (e) { errText = await res.text(); }
            console.error('❌ Contact submission failed', res.status, errText);
            alert('Une erreur s’est produite lors de l’envoi de votre message. Veuillez réessayer plus tard.');
        }
    })
    .catch(err => {
        console.error('❌ Network error submitting contact form:', err);
        alert('Une erreur de réseau s’est produite. Veuillez réessayer plus tard.');
    });
}

// Validate grant form
function validateGrantForm() {
    const claimCode = document.getElementById('claimCode').value.trim();
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const grantType = document.getElementById('grantType').value;
    const idNumber = document.getElementById('idNumber').value.trim();
    const terms = document.getElementById('terms').checked;
    
    let isValid = true;
    let errorMessage = 'Veuillez corriger les erreurs suivantes:\n\n';
    
    if (!claimCode) {
        errorMessage += '• Le code de réclamation est obligatoire\n';
        isValid = false;
    }
    
    if (!fullName) {
        errorMessage += '• Le nom complet est obligatoire\n';
        isValid = false;
    }
    
    if (!email || !isValidEmail(email)) {
        errorMessage += '• Une adresse courriel valide est obligatoire\n';
        isValid = false;
    }
    
    if (!phone || !isValidPhone(phone)) {
        errorMessage += '• Un numéro de téléphone valide est obligatoire\n';
        isValid = false;
    }
    
    if (!address) {
        errorMessage += '• L’adresse est obligatoire\n';
        isValid = false;
    }
    
    if (!grantType) {
        errorMessage += '• Veuillez sélectionner un type de tirage\n';
        isValid = false;
    }
    
    if (!idNumber) {
        errorMessage += '• La carte de livraison est obligatoire\n';
        isValid = false;
    }
    
    if (!terms) {
        errorMessage += '• Vous devez accepter les modalités et conditions\n';
        isValid = false;
    }
    
    if (!isValid) {
        alert(errorMessage);
    }
    
    return isValid;
}

// Validate contact form
function validateContactForm() {
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    
    let isValid = true;
    let errorMessage = 'Veuillez corriger les erreurs suivantes:\n\n';
    
    if (!name) {
        errorMessage += '• Le nom est obligatoire\n';
        isValid = false;
    }
    
    if (!email || !isValidEmail(email)) {
        errorMessage += '• Une adresse courriel valide est obligatoire\n';
        isValid = false;
    }
    
    if (!subject) {
        errorMessage += '• L’objet est obligatoire\n';
        isValid = false;
    }
    
    if (!message || message.length < 10) {
        errorMessage += '• Le message est obligatoire (au moins 10 caractères)\n';
        isValid = false;
    }
    
    if (!isValid) {
        alert(errorMessage);
    }
    
    return isValid;
}

// Email validation utility
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation utility
function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
    return phoneRegex;
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') {
            e.preventDefault();
        }
    });
});

// Manual Image Slider
function changeSlide(direction, sliderId) {
  const slider = document.getElementById(sliderId);
  const slides = slider.querySelectorAll('.slide');
  
  let currentSlide = 0;
  slides.forEach((slide, i) => {
    if (slide.classList.contains('active')) {
      currentSlide = i;
    }
  });
  
  slides[currentSlide].classList.remove('active');
  currentSlide += direction;
  if (currentSlide < 0) {
    currentSlide = slides.length - 1;
  } else if (currentSlide >= slides.length) {
    currentSlide = 0;
  }
  slides[currentSlide].classList.add('active');
}
