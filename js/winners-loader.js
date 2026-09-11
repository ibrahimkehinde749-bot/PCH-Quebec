/**
 * Winners Page Data Loader
 * Loads public winners through the Render backend. The backend owns the
 * JSONBin Master Key; this browser only receives the winners records.
 */

class WinnersDataLoader {
    constructor(apiBaseUrl = 'https://pch-quebec.onrender.com') {
        this.apiUrl = `${String(apiBaseUrl).replace(/\/$/, '')}/api/public/winners`;
    }

    async fetchWinners() {
        const response = await fetch(this.apiUrl, {
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

        let winners;
        try {
            winners = await this.fetchWinners();
        } catch (error) {
            console.error('Unable to load current winners:', error);
            return;
        }

        if (winners && winners.length > 0) {
            // Populate table with JSONBin data
            tableBody.innerHTML = winners.map(winner => `
                <tr>
                    <td>${this.escapeHtml(winner.claimCode || '')}</td>
                    <td>${this.escapeHtml(winner.winnerName || '')}</td>
                    <td>${this.escapeHtml(winner.prizeCategory || '')}</td>
                    <td class="status-${this.getStatusClass(winner.status || 'Pending')}">
                        ${this.escapeHtml(this.getLocalizedStatus(winner.status || 'Pending'))}
                    </td>
                </tr>
            `).join('');
        } else {
            // Keep existing table data if JSONBin fetch fails
            console.log('Using existing table data');
        }
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
});
