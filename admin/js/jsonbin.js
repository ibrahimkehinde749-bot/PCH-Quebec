/**
 * JSONBin.io Integration Module
 * Handles all communication with JSONBin.io API for winners data
 */

class JSONBinManager {
    constructor(binId, masterKey) {
        const baseUrl = String(window.ADMIN_API_BASE_URL || window.location.origin).replace(/\/$/, '');
        this.apiUrl = `${baseUrl}/api/admin/winners`;
    }

    /**
     * Fetch winners data from JSONBin
     */
    async fetchWinners() {
        try {
            const response = await fetch(this.apiUrl, { credentials: 'include' });

            console.log('Response status:', response.status);
            console.log('Response OK:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response error text:', errorText);
                throw new Error(`Failed to fetch winners: ${response.statusText}`);
            }

            const data = await response.json();
            return data.winners || [];
        } catch (error) {
            console.error('Error fetching winners:', error);
            throw error;
        }
    }

    /**
     * Update winners data in JSONBin
     */
    async updateWinners(winnersData) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ winners: winnersData })
            });

            if (!response.ok) {
                throw new Error(`Failed to update winners: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating winners:', error);
            throw error;
        }
    }

    /**
     * Add a new winner
     */
    async addWinner(winner) {
        try {
            const winners = await this.fetchWinners();
            winners.push({
                id: Date.now().toString(),
                ...winner
            });
            await this.updateWinners(winners);
            return winners;
        } catch (error) {
            console.error('Error adding winner:', error);
            throw error;
        }
    }

    /**
     * Update an existing winner
     */
    async updateWinner(winnerId, updatedData) {
        try {
            const winners = await this.fetchWinners();
            const index = winners.findIndex(w => w.id === winnerId);
            
            if (index === -1) {
                throw new Error('Winner not found');
            }

            winners[index] = {
                ...winners[index],
                ...updatedData
            };

            await this.updateWinners(winners);
            return winners[index];
        } catch (error) {
            console.error('Error updating winner:', error);
            throw error;
        }
    }

    /**
     * Delete a winner
     */
    async deleteWinner(winnerId) {
        try {
            const winners = await this.fetchWinners();
            const filteredWinners = winners.filter(w => w.id !== winnerId);
            await this.updateWinners(filteredWinners);
            return filteredWinners;
        } catch (error) {
            console.error('Error deleting winner:', error);
            throw error;
        }
    }
}

// Export for use in both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JSONBinManager;
}
