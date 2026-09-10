/**
 * Formspree integration client (browser-side)
 * Fetches submissions from a backend proxy at /api/formspree/submissions
 */

class FormspreeClient {
    constructor(basePath) {
        const origin = typeof window !== 'undefined' ? (window.ADMIN_API_BASE_URL || window.location.origin) : '';
        this.basePath = basePath || `${String(origin).replace(/\/$/, '')}/api/formspree`;
    }

    async fetchSubmissions() {
        try {
            const resp = await fetch(`${this.basePath}/submissions`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Failed fetching submissions: ${resp.status} ${text}`);
            }

            const data = await resp.json();
            console.log('FormspreeClient received', data);
            // Expecting { submissions: [...] }
            return data.submissions || [];
        } catch (err) {
            console.error('FormspreeClient.fetchSubmissions error:', err);
            throw err;
        }
    }
}

// Export for Node bundlers / tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormspreeClient;
}
