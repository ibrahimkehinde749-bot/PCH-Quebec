/**
 * Admin Dashboard Main Script
 */

// ============================================
// INVITE CODE AUTHENTICATION SYSTEM
// ============================================

class AdminAuth {
    constructor() {
        this.ADMIN_EMAIL_KEY = 'adminEmail';
        this.apiBaseUrl = String(window.ADMIN_API_BASE_URL || window.location.origin).replace(/\/$/, '');
        this.setupAuthForm();
        this.checkSession();
    }

    apiUrl(path) {
        return `${this.apiBaseUrl}${path}`;
    }

    async checkSession() {
        try {
            const response = await fetch(this.apiUrl('/api/admin/me'), { credentials: 'include' });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'The authentication server is unavailable.');
            if (result.authenticated) this.unlockDashboard();
            if (new URLSearchParams(window.location.search).has('reset')) this.setupPasswordReset();
        } catch (error) {
            console.error('Unable to verify the administrator session:', error);
        }
    }

    setupAuthForm() {
        const form = document.getElementById('inviteCodeForm');
        const errorDiv = document.getElementById('inviteError');
        const emailInput = document.getElementById('adminLoginEmail');
        const passwordInput = document.getElementById('adminLoginPassword');
        if (!form) return;

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            try {
                const response = await fetch(this.apiUrl('/api/admin/login'), {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
                });
                const result = await response.json().catch(() => ({}));
                if (response.ok) {
                    errorDiv.style.display = 'none';
                    passwordInput.value = '';
                    this.unlockDashboard();
                } else {
                    errorDiv.textContent = result.code === 'INVALID_CREDENTIALS'
                        ? 'Invalid administrator email or password.'
                        : (result.error || 'The authentication server is unavailable. Please try again later.');
                    errorDiv.style.display = 'block';
                    passwordInput.value = '';
                    passwordInput.focus();
                }
            } catch (error) {
                errorDiv.textContent = 'The authentication server is unavailable. Please try again later.';
                errorDiv.style.display = 'block';
                passwordInput.value = '';
                passwordInput.focus();
            }
        });

        const resetLink = document.getElementById('resetCodeLink');
        const resetPrompt = document.getElementById('resetEmailPrompt');
        const resetEmailInput = document.getElementById('resetEmailInput');
        const resetEmailConfirm = document.getElementById('resetEmailConfirm');
        const resetEmailCancel = document.getElementById('resetEmailCancel');
        const resetEmailMessage = document.getElementById('resetEmailMessage');

        resetLink?.addEventListener('click', () => {
            resetPrompt.style.display = 'block';
            resetEmailInput.focus();
        });
        resetEmailCancel?.addEventListener('click', () => { resetPrompt.style.display = 'none'; });
        resetEmailConfirm?.addEventListener('click', async () => {
            try {
                const response = await fetch(this.apiUrl('/api/admin/recovery'), {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: resetEmailInput.value })
                });
                const result = await response.json();
                resetEmailMessage.textContent = result.error || result.message;
            } catch (error) {
                resetEmailMessage.textContent = 'The authentication server is unavailable. Please try again later.';
            }
            resetEmailMessage.style.display = 'block';
        });
    }

    setupPasswordReset() {
        const prompt = document.getElementById('resetPasswordPrompt');
        const submit = document.getElementById('resetPasswordSubmit');
        const message = document.getElementById('resetPasswordMessage');
        if (!prompt || !submit) return;
        prompt.style.display = 'block';
        submit.addEventListener('click', async () => {
            const password = document.getElementById('resetPasswordInput').value;
            const confirmation = document.getElementById('resetPasswordConfirm').value;
            if (password !== confirmation) {
                message.textContent = 'The passwords do not match.';
                message.style.display = 'block';
                return;
            }
            const response = await fetch(this.apiUrl('/api/admin/reset-password'), {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: new URLSearchParams(window.location.search).get('reset'), password })
            });
            const result = await response.json();
            message.textContent = result.error || 'Password reset successfully. You can now sign in.';
            message.style.display = 'block';
            if (response.ok) {
                window.history.replaceState({}, '', window.location.pathname);
                setTimeout(() => { prompt.style.display = 'none'; }, 1500);
            }
        });
    }

    unlockDashboard() {
        document.getElementById('inviteCodeModal').style.display = 'none';
        document.getElementById('dashboardContent').style.display = 'block';
        initializeDashboard();
    }

    async logout() {
        await fetch(this.apiUrl('/api/admin/logout'), { method: 'POST', credentials: 'include' });
        window.location.reload();
    }
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Initialize authentication and dashboard on page load
let authManager;

function initializeAdminApp() {
    authManager = new AdminAuth();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdminApp);
} else {
    initializeAdminApp();
}

// ============================================
// ADMIN DASHBOARD CLASS
// ============================================

class AdminDashboard {
    constructor(binId, masterKey) {
        this.jsonBin = new JSONBinManager(binId, masterKey);
        this.winners = [];
        this.currentView = 'manage';
        this.authManager = authManager;  // Store reference to auth manager
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadWinners();
        this.render();
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('btnManage')?.addEventListener('click', (e) => this.switchView('manage', e.currentTarget));
        document.getElementById('btnAdd')?.addEventListener('click', (e) => this.switchView('add', e.currentTarget));
        document.getElementById('btnStats')?.addEventListener('click', (e) => this.switchView('stats', e.currentTarget));
        document.getElementById('btnSettings')?.addEventListener('click', (e) => this.switchView('settings', e.currentTarget));

        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                this.authManager.logout();
            }
        });

        // Form submission
        document.getElementById('addWinnerForm')?.addEventListener('submit', (e) => this.handleAddWinner(e));

        // Search
        document.getElementById('searchInput')?.addEventListener('input', (e) => this.filterWinners(e.target.value));

        // Modal close button
        document.getElementById('modalClose')?.addEventListener('click', () => this.closeModal());

        // Modal form submission
        document.getElementById('editWinnerForm')?.addEventListener('submit', (e) => this.handleEditWinner(e));

        // Settings form submission and generate code button
        const settingsForm = document.getElementById('settingsForm');
        const generateBtn = document.getElementById('generateCode');

        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => this.handleUpdateSettings(e));
        }

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateRandomCode());
        }
    }

    switchView(view, clickedButton) {
        this.currentView = view;
        // Update button states
        document.querySelectorAll('.admin-nav button').forEach(btn => {
            btn.classList.remove('active');
        });
        // mark clicked button active or find by view id
        if (clickedButton) {
            clickedButton.classList.add('active');
        } else {
            const btn = document.getElementById(`btn${view.charAt(0).toUpperCase() + view.slice(1)}`);
            if (btn) btn.classList.add('active');
        }

        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        const sectionId = `section-${view}`;
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
        }

        if (view === 'stats') {
            this.renderStats();
        } else if (view === 'manage') {
            this.renderWinnersTable();
        } else if (view === 'settings') {
            this.renderSettings();
        }
    }

    async loadWinners() {
        try {
            this.showAlert('Loading winners...', 'info');
            console.log('Fetching winners from JSONBin...');
            console.log('Bin ID:', this.jsonBin.binId);
            this.winners = await this.jsonBin.fetchWinners();
            console.log('Winners loaded successfully:', this.winners);
            console.log('Number of winners:', this.winners.length);
            this.hideAlert();
        } catch (error) {
            console.error('Error fetching winners:', error);
            console.error('Error message:', error.message);
            console.error('Full error:', error);
            this.showAlert(`Error loading winners: ${error.message}`, 'error');
        }
    }

    async handleAddWinner(e) {
        e.preventDefault();

        const formData = {
            claimCode: document.getElementById('claimCode').value.trim(),
            winnerName: document.getElementById('winnerName').value.trim(),
            prizeCategory: document.getElementById('prizeCategory').value.trim(),
            status: document.getElementById('status').value,
            dateAdded: new Date().toISOString()
        };

        if (!this.validateForm(formData)) {
            this.showAlert('Please fill in all required fields', 'error');
            return;
        }

        try {
            this.showAlert('Adding winner...', 'info');
            await this.jsonBin.addWinner(formData);
            await this.loadWinners();
            this.showAlert('Winner added successfully!', 'success');
            document.getElementById('addWinnerForm').reset();
            this.renderWinnersTable();
        } catch (error) {
            this.showAlert(`Error adding winner: ${error.message}`, 'error');
            console.error(error);
        }
    }

    async handleEditWinner(e) {
        e.preventDefault();

        const winnerId = document.getElementById('editWinnerId').value;
        const updatedData = {
            claimCode: document.getElementById('editClaimCode').value.trim(),
            winnerName: document.getElementById('editWinnerName').value.trim(),
            prizeCategory: document.getElementById('editPrizeCategory').value.trim(),
            status: document.getElementById('editStatus').value
        };

        if (!this.validateForm(updatedData)) {
            this.showAlert('Please fill in all required fields', 'error');
            return;
        }

        try {
            this.showAlert('Updating winner...', 'info');
            await this.jsonBin.updateWinner(winnerId, updatedData);
            await this.loadWinners();
            this.showAlert('Winner updated successfully!', 'success');
            this.closeModal();
            this.renderWinnersTable();
        } catch (error) {
            this.showAlert(`Error updating winner: ${error.message}`, 'error');
            console.error(error);
        }
    }

    async deleteWinner(winnerId) {
        if (!confirm('Are you sure you want to delete this winner?')) {
            return;
        }

        try {
            this.showAlert('Deleting winner...', 'info');
            await this.jsonBin.deleteWinner(winnerId);
            await this.loadWinners();
            this.showAlert('Winner deleted successfully!', 'success');
            this.renderWinnersTable();
        } catch (error) {
            this.showAlert(`Error deleting winner: ${error.message}`, 'error');
            console.error(error);
        }
    }

    editWinner(winnerId) {
        const winner = this.winners.find(w => w.id === winnerId);
        if (!winner) return;

        document.getElementById('editWinnerId').value = winner.id;
        document.getElementById('editClaimCode').value = winner.claimCode;
        document.getElementById('editWinnerName').value = winner.winnerName;
        document.getElementById('editPrizeCategory').value = winner.prizeCategory;
        document.getElementById('editStatus').value = winner.status;

        this.openModal();
    }

    renderWinnersTable() {
        const tableBody = document.getElementById('winnersTableBody');
        if (!tableBody) return;

        if (this.winners.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No winners found</td></tr>';
            return;
        }

        tableBody.innerHTML = this.winners.map(winner => `
            <tr>
                <td>${this.escapeHtml(winner.claimCode)}</td>
                <td>${this.escapeHtml(winner.winnerName)}</td>
                <td>${this.escapeHtml(winner.prizeCategory)}</td>
                <td>
                    <span class="status-badge status-${winner.status.toLowerCase()}">
                        ${this.escapeHtml(winner.status)}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-warning" onclick="dashboard.editWinner('${winner.id}')">Edit</button>
                        <button class="btn-danger" onclick="dashboard.deleteWinner('${winner.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderStats() {
        const statsContainer = document.getElementById('statsContainer');
        if (!statsContainer) return;

        const totalWinners = this.winners.length;
        const delivered = this.winners.filter(w => w.status === 'Delivered').length;
        const pending = this.winners.filter(w => w.status === 'Pending').length;
        const processing = this.winners.filter(w => w.status === 'Processing').length;

        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total Winners</h3>
                    <div class="stat-number">${totalWinners}</div>
                </div>
                <div class="stat-card">
                    <h3>Delivered</h3>
                    <div class="stat-number">${delivered}</div>
                </div>
                <div class="stat-card">
                    <h3>Pending</h3>
                    <div class="stat-number">${pending}</div>
                </div>
                <div class="stat-card">
                    <h3>Processing</h3>
                    <div class="stat-number">${processing}</div>
                </div>
            </div>
        `;
    }

    async renderSettings() {
        const currentEmailElement = document.getElementById('currentEmail');
        const adminEmailInput = document.getElementById('adminEmail');
        const response = await fetch(this.authManager.apiUrl('/api/admin/me'), { credentials: 'include' });
        const result = await response.json();
        if (currentEmailElement) currentEmailElement.textContent = result.email || 'Not configured';
        if (adminEmailInput) adminEmailInput.value = result.email || '';
    }

    async handleUpdateSettings(e) {
        e.preventDefault();
        const newEmail = document.getElementById('adminEmail').value.trim().toLowerCase();
        const newPassword = document.getElementById('adminPassword').value;

        if (!newEmail || !this.isValidEmail(newEmail)) {
            this.showAlert('Please enter a valid Gmail address.', 'error');
            return;
        }

        if (newPassword && newPassword.length < 12) {
            this.showAlert('The password must be at least 12 characters long.', 'error');
            return;
        }

        const response = await fetch(this.authManager.apiUrl('/api/admin/settings'), {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: newEmail, password: newPassword })
        });
        const result = await response.json();
        if (!response.ok) {
            this.showAlert(result.error || 'Unable to save settings.', 'error');
            return;
        }
        document.getElementById('settingsForm').reset();
        document.getElementById('currentEmail').textContent = result.email;
        this.showAlert('Dashboard settings saved. Please sign in again.', 'success');
        setTimeout(() => this.authManager.logout(), 800);
    }

    isValidEmail(email) {
        const emailRegex = /^[\w.-]+@gmail\.com$/i;
        return emailRegex.test(email);
    }

    generateRandomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 10; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        document.getElementById('inviteCode').value = code;
    }

    filterWinners(searchTerm) {
        const filtered = this.winners.filter(winner =>
            winner.claimCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            winner.winnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            winner.prizeCategory.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const tableBody = document.getElementById('winnersTableBody');
        if (!tableBody) return;

        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No results found</td></tr>';
            return;
        }

        tableBody.innerHTML = filtered.map(winner => `
            <tr>
                <td>${this.escapeHtml(winner.claimCode)}</td>
                <td>${this.escapeHtml(winner.winnerName)}</td>
                <td>${this.escapeHtml(winner.prizeCategory)}</td>
                <td>
                    <span class="status-badge status-${winner.status.toLowerCase()}">
                        ${this.escapeHtml(winner.status)}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-warning" onclick="dashboard.editWinner('${winner.id}')">Edit</button>
                        <button class="btn-danger" onclick="dashboard.deleteWinner('${winner.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    validateForm(data) {
        return data.claimCode && data.winnerName && data.prizeCategory && data.status;
    }

    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) return;

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <span>${this.escapeHtml(message)}</span>
        `;

        alertContainer.innerHTML = '';
        alertContainer.appendChild(alert);
    }

    hideAlert() {
        const alertContainer = document.getElementById('alertContainer');
        if (alertContainer) {
            alertContainer.innerHTML = '';
        }
    }

    openModal() {
        document.getElementById('editModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('editModal').classList.remove('active');
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    render() {
        this.renderWinnersTable();
        this.renderStats();
    }
}

// Initialize dashboard after server authentication succeeds
let dashboard;
function initializeDashboard() {
    dashboard = new AdminDashboard();
}

