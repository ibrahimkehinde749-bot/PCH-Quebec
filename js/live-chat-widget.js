/*
 * Live Chat Widget - JavaScript Controller
 * Handles widget initialization, interactions, and animations
 * 
 * Customization Guide:
 * 1. Update chatOptions array to add/modify contact channels
 * 2. Change colors by updating CSS gradient in live-chat-widget.css
 * 3. Modify animation speeds by adjusting transition values
 */

class LiveChatWidget {
    constructor(options = {}) {
        // Default configuration - CUSTOMIZE THESE VALUES
        this.config = {
            position: 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
            animationEnabled: true,
            pulseAnimation: false,
            showBadge: false,
            badgeCount: 0,
            headerTitle: 'Une chance de gagner', // Header text
            footerText: 'Choisissez votre mode de communication', // Footer text
            
            // Contact channels - EASILY CUSTOMIZABLE
            channels: [
                {
                    id: 'facebook',
                    label: 'Agent de livraison',
                    status: 'Discutez avec nous',
                    icon: '🚚',
                    url: 'https://www.facebook.com/share/1HVx3LrQuZ/?mibextid=wwXIfr',
                    color: '#1877f2',
                    className: 'facebook'
                },
                {
                    id: 'whatsapp',
                    label: 'Dave Sayer',
                    status: 'Soutien 24 h sur 24, 7 jours sur 7',
                    icon: '💬',
                    url: 'https://wa.me/+19109546520',
                    color: '#25d366',
                    className: 'whatsapp'
                }
            ],
            ...options
        };

        this.isOpen = false;
        this.init();
    }

    /**
     * Initialize widget - create DOM elements and attach event listeners
     */
    init() {
        // Create widget container
        this.widget = this.createWidgetHTML();
        document.body.appendChild(this.widget);

        // Get DOM references
        this.fabButton = this.widget.querySelector('.chat-fab-button');
        this.menuContainer = this.widget.querySelector('.chat-menu-container');
        this.options = this.widget.querySelectorAll('.chat-option');

        // Attach event listeners
        this.attachEventListeners();

        // Apply pulse animation if enabled
        if (this.config.pulseAnimation) {
            this.fabButton.classList.add('pulse');
        }

        // Keep the widget positioned above the Tawk.to container
        this.initLiveChatPosition();
    }

    /**
     * Create complete widget HTML structure
     */
    createWidgetHTML() {
        const container = document.createElement('div');
        container.className = 'live-chat-widget';

        // Build channel options HTML
        const optionsHTML = this.config.channels
            .map((channel, index) => `
                <li class="chat-menu-item">
                    <a href="${channel.url}" target="_blank" rel="noopener noreferrer" class="chat-option ${channel.className}" title="${channel.label}">
                        <div class="chat-option-icon">${channel.icon}</div>
                        <div class="chat-option-content">
                            <div class="chat-option-label">${channel.label}</div>
                            <div class="chat-option-status ${channel.status.includes('24/7') || channel.status.includes('Quick') ? 'online' : ''}">${channel.status}</div>
                        </div>
                        <div class="chat-option-arrow">→</div>
                    </a>
                </li>
                ${index < this.config.channels.length - 1 ? '<li class="chat-menu-divider"></li>' : ''}
            `)
            .join('');

        // Build complete widget HTML
        container.innerHTML = `
            <!-- Main floating button -->
            <button class="chat-fab-button" aria-label="Ouvrir le clavardage" title="Nous joindre">
                💬
                ${this.config.showBadge ? `<span class="badge">${this.config.badgeCount}</span>` : ''}
            </button>

            <!-- Menu container with options -->
            <div class="chat-menu-container">
                <!-- Header with title and close button -->
                <div class="chat-menu-header">
                    <span>${this.config.headerTitle}</span>
                    <button class="close-btn" aria-label="Fermer le menu" title="Fermer">✕</button>
                </div>

                <!-- Contact options list -->
                <ul class="chat-menu-options">
                    ${optionsHTML}
                </ul>

                <!-- Footer text -->
                <div class="chat-menu-footer">
                    ${this.config.footerText}
                </div>
            </div>
        `;

        return container;
    }

    /**
     * Attach event listeners to interactive elements
     */
    attachEventListeners() {
        // Toggle menu on FAB button click
        this.fabButton.addEventListener('click', () => this.toggleMenu());

        // Close menu on close button click
        const closeBtn = this.menuContainer.querySelector('.close-btn');
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.widget.contains(e.target) && this.isOpen) {
                this.closeMenu();
            }
        });

        // Handle option clicks (open links)
        this.options.forEach(option => {
            option.addEventListener('click', (e) => {
                // Link will open naturally, close menu after brief delay
                setTimeout(() => this.closeMenu(), 100);
            });

            // Keyboard support
            option.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    option.click();
                }
            });
        });

        // Close menu on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        // Handle menu hover for visual feedback
        this.options.forEach(option => {
            option.addEventListener('mouseenter', () => {
                // Optional: add additional hover effects here
            });
        });
    }

    /**
     * Initialize the dynamic position updater for the social widget.
     */
    initLiveChatPosition() {
        this.tawkSelectors = [
            '#tawkchat-container',
            '#tawk-minified-container',
            '#tawk-chat-container',
            '#tawk-chat-minified-container',
            '#tawkWidgetContainer',
            'iframe[title="chat widget"]',
            'iframe[src*="tawk.to"]',
            'iframe[src*="tawk.com"]'
        ];

        this.resizeListener = () => this.refreshLiveChatOffset();
        this.refreshLiveChatOffset();
        this.initTawkObservers();
    }

    /**
     * Find the first visible Tawk widget element in the DOM.
     */
    findTawkElement() {
        return this.tawkSelectors
            .map(selector => document.querySelector(selector))
            .find(el => el && el.getBoundingClientRect().height > 0);
    }

    /**
     * Refresh the social widget bottom offset based on the Tawk widget height.
     */
    refreshLiveChatOffset() {
        const tawkElement = this.findTawkElement();
        const gap = 16;
        let bottomOffset = 110;

        if (tawkElement) {
            const rect = tawkElement.getBoundingClientRect();
            if (rect.height > 0) {
                bottomOffset = Math.round((window.innerHeight - rect.top) + gap);
            }
        }

        document.documentElement.style.setProperty('--live-chat-bottom-offset', `${bottomOffset}px`);
    }

    /**
     * Watch for Tawk widget inserts and resizing.
     */
    initTawkObservers() {
        if (typeof window === 'undefined') return;

        window.addEventListener('resize', this.resizeListener, { passive: true });
        window.addEventListener('orientationchange', this.resizeListener);

        this.tawkMutationObserver = new MutationObserver(() => this.refreshLiveChatOffset());
        this.tawkMutationObserver.observe(document.body, { childList: true, subtree: true });

        if (typeof ResizeObserver !== 'undefined') {
            const tawkElement = this.findTawkElement();
            if (tawkElement) {
                this.tawkResizeObserver = new ResizeObserver(() => this.refreshLiveChatOffset());
                this.tawkResizeObserver.observe(tawkElement);
            }
        }

        this.tawkPollInterval = window.setInterval(() => {
            const tawkElement = this.findTawkElement();
            if (tawkElement) {
                this.refreshLiveChatOffset();
                if (this.tawkResizeObserver) {
                    this.tawkResizeObserver.observe(tawkElement);
                }
                window.clearInterval(this.tawkPollInterval);
                this.tawkPollInterval = null;
            }
        }, 500);
    }

    /**
     * Disconnect live observers and listeners.
     */
    disconnectTawkObservers() {
        window.removeEventListener('resize', this.resizeListener);
        window.removeEventListener('orientationchange', this.resizeListener);

        if (this.tawkResizeObserver) {
            this.tawkResizeObserver.disconnect();
            this.tawkResizeObserver = null;
        }

        if (this.tawkMutationObserver) {
            this.tawkMutationObserver.disconnect();
            this.tawkMutationObserver = null;
        }

        if (this.tawkPollInterval) {
            window.clearInterval(this.tawkPollInterval);
            this.tawkPollInterval = null;
        }
    }

    /**
     * Toggle menu open/closed state
     */
    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    /**
     * Open menu with animation
     */
    openMenu() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.menuContainer.classList.add('active');
        
        // Accessibility: set focus to prevent tab navigation issues
        this.menuContainer.querySelector('.close-btn')?.focus();
        
        // Emit custom event for external tracking
        this.dispatchEvent('chatWidgetOpen');
    }

    /**
     * Close menu with animation
     */
    closeMenu() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.menuContainer.classList.remove('active');
        this.fabButton.focus(); // Return focus to FAB button
        
        // Emit custom event
        this.dispatchEvent('chatWidgetClosed');
    }

    /**
     * Update badge count
     */
    setBadgeCount(count) {
        this.config.badgeCount = count;
        let badge = this.fabButton.querySelector('.badge');
        
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'badge';
                this.fabButton.appendChild(badge);
            }
            badge.textContent = count;
        } else if (badge) {
            badge.remove();
        }
    }

    /**
     * Add a new contact channel dynamically
     */
    addChannel(channel) {
        this.config.channels.push(channel);
        // Rebuild menu (simpler approach than DOM manipulation)
        const newWidget = this.createWidgetHTML();
        this.widget.replaceWith(newWidget);
        this.widget = newWidget;
        document.body.appendChild(this.widget);
        this.init();
    }

    /**
     * Remove a contact channel
     */
    removeChannel(channelId) {
        this.config.channels = this.config.channels.filter(c => c.id !== channelId);
        // Rebuild menu
        const newWidget = this.createWidgetHTML();
        this.widget.replaceWith(newWidget);
        this.widget = newWidget;
        document.body.appendChild(this.widget);
        this.init();
    }

    /**
     * Update channel properties
     */
    updateChannel(channelId, updates) {
        const channel = this.config.channels.find(c => c.id === channelId);
        if (channel) {
            Object.assign(channel, updates);
            // Rebuild menu
            const newWidget = this.createWidgetHTML();
            this.widget.replaceWith(newWidget);
            this.widget = newWidget;
            document.body.appendChild(this.widget);
            this.init();
        }
    }

    /**
     * Enable pulse animation
     */
    enablePulse() {
        this.config.pulseAnimation = true;
        this.fabButton.classList.add('pulse');
    }

    /**
     * Disable pulse animation
     */
    disablePulse() {
        this.config.pulseAnimation = false;
        this.fabButton.classList.remove('pulse');
    }

    /**
     * Enable bounce animation
     */
    enableBounce() {
        this.fabButton.classList.add('bounce');
    }

    /**
     * Disable bounce animation
     */
    disableBounce() {
        this.fabButton.classList.remove('bounce');
    }

    /**
     * Dispatch custom events for external integration
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(`liveChatWidget:${eventName}`, {
            detail: detail,
            bubbles: true
        });
        this.widget.dispatchEvent(event);
    }

    /**
     * Destroy widget (cleanup)
     */
    destroy() {
        this.disconnectTawkObservers();
        this.widget.remove();
    }

    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
}

/**
 * Initialize widget on page load
 * This runs automatically when the script loads
 */
document.addEventListener('DOMContentLoaded', () => {
    // Create widget with default settings
    window.liveChatWidget = new LiveChatWidget({
        headerTitle: 'Une chance de gagner',
        footerText: 'Nous répondons instantanément',
        pulseAnimation: false, // Set to true to add pulse effect
        showBadge: false // Set to true with badgeCount to show notification
    });
});

/**
 * USAGE EXAMPLES:
 * 
 * // Access the global instance
 * window.liveChatWidget
 * 
 * // Open menu programmatically
 * window.liveChatWidget.openMenu();
 * 
 * // Close menu programmatically
 * window.liveChatWidget.closeMenu();
 * 
 * // Update badge count
 * window.liveChatWidget.setBadgeCount(5);
 * 
 * // Add a new channel
 * window.liveChatWidget.addChannel({
 *     id: 'email',
 *     label: 'Email Support',
 *     status: 'Replies in 2 hours',
 *     icon: '✉️',
 *     url: 'mailto:support@example.com',
 *     className: 'email'
 * });
 * 
 * // Update existing channel
 * window.liveChatWidget.updateChannel('facebook', {
 *     url: 'https://facebook.com/newpage'
 * });
 * 
 * // Enable animations
 * window.liveChatWidget.enablePulse();
 * window.liveChatWidget.enableBounce();
 * 
 * // Listen to events
 * document.addEventListener('liveChatWidget:chatWidgetOpen', () => {
 *     console.log('Widget opened!');
 * });
 * 
 * document.addEventListener('liveChatWidget:chatWidgetClosed', () => {
 *     console.log('Widget closed!');
 * });
 */
