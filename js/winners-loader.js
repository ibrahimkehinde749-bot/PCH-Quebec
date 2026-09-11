/**
 * Winners Page Data Loader
 * Loads public winners through the Render backend. The backend owns the
 * JSONBin Master Key; this browser only receives the winners records.
 */

class WinnersDataLoader {
    constructor(apiBaseUrl = 'https://pch-quebec.onrender.com', refreshInterval = 7000) {
        this.apiUrl = `${String(apiBaseUrl).replace(/\/$/, '')}/api/public/winners`;
        this.refreshInterval = refreshInterval;
        this.isLoading = false;
    }

    async fetchWinners() {
        const response = await fetch(`${this.apiUrl}?t=${Date.now()}`, {
            headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error(`Winners request failed with status ${response.status}.`);
        const data = await response.json();
        return Array.isArray(data.winners) ? data.winners : [];
    }

    async loadWinnersTable() {
        const tableBody = document.querySelector('.winners-table tbody');
        if (!tableBody) {
            console.error('Winners table not found');
            return;
        }

        if (this.isLoading) return;
        this.isLoading = true;
        let winners;
        try {
            tableBody.innerHTML = '<tr><td colspan="4">Chargement des gagnants...</td></tr>';
            winners = await this.fetchWinners();
        } catch (error) {
            console.error('Unable to load current winners:', error);
            tableBody.innerHTML = '<tr><td colspan="4">Impossible de charger les gagnants. Veuillez réessayer plus tard.</td></tr>';
            this.isLoading = false;
            return;
        }

        tableBody.innerHTML = winners.length > 0 ? winners.map(winner => `
                <tr>
                    <td>${this.escapeHtml(winner.claimCode || '')}</td>
                    <td>${this.escapeHtml(winner.winnerName || '')}</td>
                    <td>${this.escapeHtml(winner.prizeCategory || '')}</td>
                    <td class="status-${this.getStatusClass(winner.status || 'Pending')}">
                        ${this.escapeHtml(this.getLocalizedStatus(winner.status || 'Pending'))}
                    </td>
                </tr>
            `).join('') : '<tr><td colspan="4">Aucun gagnant disponible.</td></tr>';
        this.isLoading = false;
    }

    startAutoRefresh() {
        window.setInterval(() => this.loadWinnersTable(), this.refreshInterval);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) this.loadWinnersTable();
        });
        window.addEventListener('focus', () => this.loadWinnersTable());
    }

    getStatusClass(status) {
        const statusMap = {
            'Delivered': 'delivered',
            'Pending': 'pending',
            'Processing': 'processing',
            'Claimed': 'claimed'
        };
        return statusMap[status] || 'pending';
    }

    getLocalizedStatus(status) {
        const statusMap = {
            'Delivered': 'Livré',
            'Pending': 'En attente',
            'Processing': 'En traitement',
            'Claimed': 'Réclamé'
        };
        return statusMap[status] || status;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
}

// Keep the existing static table visible if the public API is unavailable.
document.addEventListener('DOMContentLoaded', async () => {
    const winnersLoader = new WinnersDataLoader();
    await winnersLoader.loadWinnersTable();
    winnersLoader.startAutoRefresh();
});
