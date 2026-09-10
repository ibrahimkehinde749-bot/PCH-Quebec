/**
 * Winners Page Data Loader
 * Keeps the public table static because private JSONBin access is not safe
 * from visitor browsers.
 */

class WinnersDataLoader {
    constructor(binId, masterKey) {
        this.apiUrl = null;
    }

    async fetchWinners() {
        return null;
    }

    async loadWinnersTable() {
        const tableBody = document.querySelector('.winners-table tbody');
        if (!tableBody) {
            console.error('Winners table not found');
            return;
        }

        // Try to fetch from JSONBin
        const winners = await this.fetchWinners();

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

// Auto-initialize when page loads
let winnersLoader;
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Public winners table uses static data; private JSONBin access is disabled in the browser.');
});
