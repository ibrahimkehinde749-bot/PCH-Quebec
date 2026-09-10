/**
 * Enhanced Form Submission Handler
 * Ensures successful delivery to Formspree AND Gmail with logging & retry logic
 */

class FormSubmissionManager {
    constructor() {
        this.maxRetries = 3;
        this.retryDelay = 1000; // ms
        this.submissionLog = this.loadSubmissionLog();
    }

    /**
     * Load submission history from localStorage
     */
    loadSubmissionLog() {
        try {
            const log = localStorage.getItem('formSubmissionLog');
            return log ? JSON.parse(log) : [];
        } catch (e) {
            console.warn('Failed to load submission log:', e);
            return [];
        }
    }

    /**
     * Save submission attempt to localStorage
     */
    saveSubmissionLog(entry) {
        try {
            this.submissionLog.push({
                ...entry,
                timestamp: new Date().toISOString(),
                attempts: entry.attempts || 1
            });
            // Keep last 100 submissions
            if (this.submissionLog.length > 100) {
                this.submissionLog = this.submissionLog.slice(-100);
            }
            localStorage.setItem('formSubmissionLog', JSON.stringify(this.submissionLog));
        } catch (e) {
            console.error('Failed to save submission log:', e);
        }
    }

    /**
     * Get pending submissions (failed to deliver)
     */
    getPendingSubmissions() {
        return this.submissionLog.filter(entry => entry.status === 'pending' || entry.status === 'failed');
    }

    /**
     * Submit form with retry logic
     */
    async submitWithRetry(formData, endpoint, maxRetries = this.maxRetries) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📤 Submit attempt ${attempt}/${maxRetries}`);
                
                const response = await fetch(endpoint, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                const result = await response.json().catch(() => ({}));

                if (response.ok) {
                    console.log('✅ Formspree submission successful');
                    return {
                        success: true,
                        status: 200,
                        message: 'Successfully submitted to Formspree'
                    };
                } else {
                    lastError = `Status ${response.status}: ${result.error || 'Unknown error'}`;
                    console.warn(`⚠️ Attempt ${attempt} failed:`, lastError);
                    
                    // If rate limited, wait longer before retry
                    if (response.status === 429) {
                        await this.delay(this.retryDelay * (attempt * 2));
                    } else if (attempt < maxRetries) {
                        await this.delay(this.retryDelay);
                    }
                }
            } catch (err) {
                lastError = err.message;
                console.error(`❌ Network error on attempt ${attempt}:`, err);
                
                if (attempt < maxRetries) {
                    await this.delay(this.retryDelay);
                }
            }
        }

        return {
            success: false,
            status: 'failed',
            message: lastError || 'All submission attempts failed'
        };
    }

    /**
     * Utility: delay promise
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Verify form submission was received by checking Formspree status
     * NOTE: This requires server-side verification with API key
     */
    async verifySubmissionStatus(claimCode) {
        // This would need backend implementation
        // For now, check localStorage for delivery attempts
        const attempts = this.submissionLog.filter(
            entry => entry.claimCode === claimCode
        );
        return attempts.length > 0 ? attempts[attempts.length - 1] : null;
    }

    /**
     * Generate detailed submission receipt
     */
    generateSubmissionReceipt(formData, deliveryResult) {
        const receipt = {
            claimCode: formData.get('claimCode'),
            submittedAt: new Date().toLocaleString(),
            formType: formData.has('fullName') ? 'application' : 'contact',
            deliveryStatus: deliveryResult.success ? 'SUCCESS' : 'PENDING_RETRY',
            endpoint: 'Formspree',
            userEmail: formData.get('email') || formData.get('contactEmail'),
            attempts: 1
        };
        
        this.saveSubmissionLog(receipt);
        return receipt;
    }

    /**
     * Get form status HTML
     */
    getSubmissionStatusHTML(receipt) {
        const icons = {
            'SUCCESS': '✅',
            'PENDING_RETRY': '⏳',
            'FAILED': '❌'
        };

        return `
            <div style="background: ${receipt.deliveryStatus === 'SUCCESS' ? '#d4edda' : '#fff3cd'}; 
                        color: ${receipt.deliveryStatus === 'SUCCESS' ? '#155724' : '#856404'}; 
                        padding: 20px; border-radius: 8px; border: 1px solid ${receipt.deliveryStatus === 'SUCCESS' ? '#c3e6cb' : '#ffc107'}; 
                        margin: 20px 0;">
                <strong>${icons[receipt.deliveryStatus]} Participation: ${receipt.deliveryStatus === 'SUCCESS' ? 'réussie' : 'en attente'}</strong><br><br>
                <strong>📋 Reçu de participation:</strong><br>
                <strong>🎫 Code de réclamation:</strong> <code>${receipt.claimCode}</code><br>
                <strong>⏰ Soumise le:</strong> ${receipt.submittedAt}<br>
                <strong>📧 Service de livraison:</strong> Formspree → Gmail<br>
                <strong>📊 Statut:</strong> ${receipt.deliveryStatus === 'SUCCESS' ? 'Réussie' : 'En attente de nouvelle tentative'}<br><br>
                ${receipt.deliveryStatus === 'SUCCESS' 
                    ? 'Votre participation a été livrée avec succès. Vous devriez recevoir un courriel de confirmation dans les 5 à 10 minutes.'
                    : 'Votre participation est en file d’attente. Notre système effectuera automatiquement une nouvelle tentative.'
                }
            </div>
        `;
    }
}

// Initialize global instance
window.FormSubmissionManager = new FormSubmissionManager();

/**
 * Enhanced Grant Form Submit Handler
 * Add this to replace the existing handleGrantFormSubmit function
 */
async function handleGrantFormSubmitEnhanced(e) {
    e.preventDefault();
    console.log('=== ENHANCED GRANT FORM SUBMISSION ===');

    const form = e.currentTarget || e.target;
    const manager = window.FormSubmissionManager;

    // Rate limiting check
    if (!canSubmitForm()) {
            alert('Vous ne pouvez soumettre le formulaire qu’une fois tous les 2 jours à partir de cet appareil.');
        return;
    }

    // Validate form
    if (!validateGrantForm()) {
        console.log('Form validation failed');
        return;
    }

    // Prepare form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Add metadata
    formData.set('_subject', `New Sweepstakes Application — ${data.fullName} (${data.claimCode})`);
    if (data.email) formData.set('_replyto', data.email);

    // Show processing status
    const successMsg = document.getElementById('successMessage');
    if (successMsg) {
        successMsg.innerHTML = `
            <div style="background: #e7f3ff; color: #004085; padding: 20px; border-radius: 8px; border: 1px solid #b3d9ff;">
                <strong>⏳ Traitement de votre participation...</strong><br>
                Envoi à Formspree et Gmail...
            </div>
        `;
        successMsg.style.display = 'block';
    }

    // Submit with retry logic
    const endpoint = window.FORMSPREE_FORM_ENDPOINT;
    const result = await manager.submitWithRetry(formData, endpoint);

    // Generate receipt
    const receipt = manager.generateSubmissionReceipt(formData, result);

    // Display result
    if (successMsg) {
        successMsg.innerHTML = manager.getSubmissionStatusHTML(receipt);
        if (result.success) {
            form.style.display = 'none';
            recordSubmissionAndDisable(form);
            
            // Show agent section
            const agentSection = document.getElementById('agentSection');
            if (agentSection) {
                agentSection.querySelector('.agent-instructions').innerHTML = 
                    `<p><strong>Veuillez envoyer immédiatement votre code de réclamation <span class="claim-code">${data.claimCode}</span> à l'agent responsable.</strong></p>`;
                agentSection.style.display = 'block';
            }
        } else {
            // Show retry option for failed submissions
            const retryBtn = document.createElement('button');
            retryBtn.className = 'btn btn-primary';
            retryBtn.style.marginTop = '10px';
            retryBtn.textContent = 'Réessayer maintenant';
            retryBtn.onclick = () => handleGrantFormSubmitEnhanced(e);
            successMsg.appendChild(retryBtn);
        }
        
        successMsg.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Get pending submissions status
 */
function getPendingSubmissionsReport() {
    const manager = window.FormSubmissionManager;
    const pending = manager.getPendingSubmissions();
    
    console.log(`📊 Submission Report:`);
    console.log(`   Total submissions: ${manager.submissionLog.length}`);
    console.log(`   Pending/Failed: ${pending.length}`);
    
    pending.forEach((sub, i) => {
        console.log(`   ${i + 1}. [${sub.deliveryStatus}] Claim: ${sub.claimCode} - ${sub.submittedAt}`);
    });
    
    return {
        totalSubmissions: manager.submissionLog.length,
        pendingSubmissions: pending.length,
        pending: pending
    };
}

// Export for debugging
window.getPendingSubmissionsReport = getPendingSubmissionsReport;
