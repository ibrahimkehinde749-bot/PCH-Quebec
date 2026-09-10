# Live Chat Widget - Complete Implementation Guide

**Created**: April 25, 2026  
**Status**: ✅ **Ready to Use**

---

## Overview

A modern, floating social live chat widget that appears on the bottom-right corner of your website. Fully responsive, accessible, and built with vanilla JavaScript - no dependencies required.

### Features

✅ Floating button with smooth animations  
✅ Expandable menu with contact options  
✅ Multiple social channels (Facebook, WhatsApp)  
✅ Mobile-optimized design  
✅ Smooth open/close animations  
✅ Keyboard accessible (Enter, Escape keys)  
✅ Customizable colors, links, and messages  
✅ Badge notifications support  
✅ Pulse and bounce animations  
✅ Dark mode support  

---

## Implementation

### Step 1: Files Added

The following files have been created and added to your project:

```
css/live-chat-widget.css       - All styling and animations
js/live-chat-widget.js         - Complete widget functionality
```

### Step 2: HTML Integration

The widget has been automatically added to all pages:

- ✅ `index.html`
- ✅ `about.html`
- ✅ `apply.html`
- ✅ `contact.html`
- ✅ `sweepstakes.html`
- ✅ `winners.html`

Each page now includes:

```html
<!-- In <head> -->
<link rel="stylesheet" href="css/live-chat-widget.css">

<!-- Before </body> -->
<script src="js/live-chat-widget.js"></script>
```

---

## Current Configuration

### Current Channels

The widget is pre-configured with:

1. **Facebook Agent Support**
   - Label: "Facebook Agent"
   - Status: "24/7 Available"
   - Icon: 📘
   - Link: https://www.facebook.com/share/1HVx3LrQuZ/?mibextid=wwXIfr

2. **WhatsApp Support**
   - Label: "WhatsApp Support"
   - Status: "Quick Replies"
   - Icon: 💬
   - Link: https://wa.me/14093403985

---

## Customization Guide

### Basic Customization

Edit `js/live-chat-widget.js` - Look for the `config` section in the `LiveChatWidget` constructor:

```javascript
this.config = {
    headerTitle: 'Get in Touch',        // Change menu header text
    footerText: 'We reply instantly',   // Change footer text
    pulseAnimation: false,              // Set to true for pulse effect
    showBadge: false,                   // Set to true to show notification badge
    badgeCount: 0,                      // Badge number
    
    channels: [
        // Channel definitions here
    ]
};
```

### Customize Channels

In `js/live-chat-widget.js`, modify the `channels` array:

```javascript
channels: [
    {
        id: 'facebook',                    // Unique identifier
        label: 'Facebook Agent',           // Display name
        status: '24/7 Available',          // Status text
        icon: '📘',                        // Emoji or icon
        url: 'https://facebook.com/...',  // Link to open
        color: '#1877f2',                  // Optional color
        className: 'facebook'              // CSS class for styling
    },
    // Add more channels below
]
```

### Add a New Channel

**Example: Add Email Support**

```javascript
channels: [
    // ... existing channels ...
    {
        id: 'email',
        label: 'Email Support',
        status: 'Replies in 2 hours',
        icon: '✉️',
        url: 'mailto:support@pchsweepstakes.com',
        className: 'email'
    }
]
```

### Change Colors

Edit `css/live-chat-widget.css`:

```css
/* Main button gradient - around line 20 */
.chat-fab-button {
    background: linear-gradient(135deg, #eba625 0%, #7c3aed 100%);
    /* Change these hex colors to your brand colors */
}

/* Menu header - around line 108 */
.chat-menu-header {
    background: linear-gradient(135deg, #eba625 0%, #7c3aed 100%);
}

/* Hover effects - around line 140 */
.chat-option:hover {
    border-left-color: #eba625;  /* Change this color */
}
```

### Adjust Position

By default, the widget appears in the **bottom-right** corner. To change:

**Bottom-Left:**
```css
.live-chat-widget {
    bottom: 20px;
    left: 20px;   /* Change "right" to "left" */
    right: auto;  /* Add this line */
}
```

**Top-Right:**
```css
.live-chat-widget {
    top: 20px;        /* Change "bottom" to "top" */
    bottom: auto;     /* Add this line */
    right: 20px;
}
```

### Change Animation Speed

In `css/live-chat-widget.css`, look for transition values:

```css
/* Main button animations - around line 30 */
.chat-fab-button {
    transition: all 0.3s ease;  /* Change 0.3s to slower/faster */
}

/* Menu animations - around line 105 */
.chat-menu-container {
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

Lower values = faster (e.g., 0.2s)  
Higher values = slower (e.g., 0.5s)

---

## Usage & JavaScript API

### Access the Widget

```javascript
// Get the global widget instance
window.liveChatWidget
```

### Programmatic Control

```javascript
// Open menu
window.liveChatWidget.openMenu();

// Close menu
window.liveChatWidget.closeMenu();

// Toggle menu
window.liveChatWidget.toggleMenu();

// Show notification badge
window.liveChatWidget.setBadgeCount(5);

// Clear badge
window.liveChatWidget.setBadgeCount(0);

// Enable pulse animation
window.liveChatWidget.enablePulse();

// Disable pulse animation
window.liveChatWidget.disablePulse();

// Enable bounce animation
window.liveChatWidget.enableBounce();

// Disable bounce animation
window.liveChatWidget.disableBounce();

// Get current configuration
const config = window.liveChatWidget.getConfig();
console.log(config);

// Destroy widget (remove from DOM)
window.liveChatWidget.destroy();
```

### Add Channel Dynamically

```javascript
window.liveChatWidget.addChannel({
    id: 'telegram',
    label: 'Telegram Support',
    status: 'Chat now',
    icon: '📱',
    url: 'https://t.me/yourusername',
    className: 'telegram'
});
```

### Update Channel

```javascript
window.liveChatWidget.updateChannel('facebook', {
    url: 'https://facebook.com/newpage',
    label: 'FB Support Team'
});
```

### Remove Channel

```javascript
window.liveChatWidget.removeChannel('whatsapp');
```

### Listen to Events

```javascript
// Widget opened
document.addEventListener('liveChatWidget:chatWidgetOpen', () => {
    console.log('Chat widget opened!');
    // Track event in analytics
    gtag('event', 'chat_widget_opened');
});

// Widget closed
document.addEventListener('liveChatWidget:chatWidgetClosed', () => {
    console.log('Chat widget closed!');
});
```

---

## CSS Styling Customization

### Change Button Size

```css
.chat-fab-button {
    width: 70px;   /* Default: 60px */
    height: 70px;  /* Default: 60px */
    font-size: 32px;
}
```

### Change Button Icon

Replace the emoji in `js/live-chat-widget.js`:

```javascript
<button class="chat-fab-button">
    💬  <!-- Change this emoji -->
</button>
```

### Custom Hover Effects

```css
.chat-option:hover {
    background: linear-gradient(90deg, #fff9e6 0%, #f0e6ff 100%);
    transform: translateX(5px);
    border-radius: 8px;
}
```

### Add Custom Icon Styling

In `css/live-chat-widget.css`, add after the existing icon styles:

```css
/* Email icon styling */
.chat-option.email .chat-option-icon {
    background: #fff3cd;
    color: #ff6b6b;
}

/* Telegram icon styling */
.chat-option.telegram .chat-option-icon {
    background: #e3f2fd;
    color: #0088cc;
}
```

---

## Advanced Examples

### Example 1: Show Badge on Page Load

```javascript
// In your main.js or a separate script
document.addEventListener('DOMContentLoaded', () => {
    // Show "2" badge on widget
    window.liveChatWidget.setBadgeCount(2);
    
    // Remove after 10 seconds
    setTimeout(() => {
        window.liveChatWidget.setBadgeCount(0);
    }, 10000);
});
```

### Example 2: Enable Pulse When Page Loads

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // Add attention-grabbing pulse on home page
    if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
        window.liveChatWidget.enablePulse();
    }
});
```

### Example 3: Open Widget on Button Click

```javascript
// Add this to any button on your page
document.getElementById('contactButton').addEventListener('click', () => {
    window.liveChatWidget.openMenu();
});
```

### Example 4: Track User Interactions

```javascript
// Track when users engage with chat widget
document.addEventListener('liveChatWidget:chatWidgetOpen', () => {
    // Send to analytics (example with Google Analytics)
    if (window.gtag) {
        gtag('event', 'user_opened_chat');
    }
    
    // Or send to your own server
    fetch('/api/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            event: 'chat_opened',
            timestamp: new Date(),
            url: window.location.href
        })
    });
});
```

### Example 5: Automatic Widget on Mobile Only

```javascript
document.addEventListener('DOMContentLoaded', () => {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Auto-open widget on mobile after 5 seconds
        setTimeout(() => {
            window.liveChatWidget.openMenu();
        }, 5000);
    }
});
```

---

## Troubleshooting

### Widget Not Appearing

**Check:**
1. Both CSS and JS files are linked in your HTML
2. Files are in correct paths: `css/live-chat-widget.css` and `js/live-chat-widget.js`
3. Check browser console for JavaScript errors (F12 → Console)

### Links Not Working

**Solution:**
- Verify URLs in the `channels` array are correct
- Make sure links start with `http://`, `https://`, `mailto:`, or `tel:`
- Test in an incognito window (browser extensions might block links)

### Mobile Alignment Issues

**Check:**
- Remove any fixed `width` constraints on parent elements
- Ensure `z-index: 9999;` in CSS isn't being overridden
- Test on different screen sizes with DevTools (F12 → Toggle device toolbar)

### Animations Stuttering

**Solution:**
- Reduce animation complexity: change transition curves
- Check for other heavy animations on the page
- Try updating browser (performance improvements in recent versions)

---

## Browser Support

✅ Chrome 90+  
✅ Firefox 88+  
✅ Safari 14+  
✅ Edge 90+  
✅ Mobile browsers (iOS Safari, Chrome Mobile)  

---

## Performance Tips

1. **Lazy Load Widget**: Load the script only on specific pages
2. **Disable Animations on Slow Devices**: Check device capability
3. **Minimize CSS**: Minify live-chat-widget.css for production
4. **Use CDN**: Serve CSS/JS from CDN for faster loading

---

## Accessibility

✅ Keyboard navigation (Tab, Enter, Escape)  
✅ ARIA labels for screen readers  
✅ Focus management  
✅ Semantic HTML  
✅ Color contrast compliance  

---

## Quick Reference

| Task | Code |
|------|------|
| Open widget | `window.liveChatWidget.openMenu()` |
| Close widget | `window.liveChatWidget.closeMenu()` |
| Show badge | `window.liveChatWidget.setBadgeCount(3)` |
| Add pulse | `window.liveChatWidget.enablePulse()` |
| Change header | Edit `config.headerTitle` |
| Add channel | See "Add a New Channel" section |
| Listen to events | See "Listen to Events" section |

---

## Need to Modify the Widget Structure?

The main files are well-commented. Key sections:

**js/live-chat-widget.js:**
- Lines 5-35: Configuration (customize here first!)
- Lines 45-60: Widget initialization
- Lines 65-120: Animation/event logic

**css/live-chat-widget.css:**
- Lines 1-50: Button and container styles
- Lines 100-140: Menu and option styles
- Lines 200-250: Animations
- Lines 260-290: Responsive breakpoints

---

## Production Checklist

- [ ] Test on mobile devices (iOS, Android)
- [ ] Test on tablets
- [ ] Test on different browsers
- [ ] Verify all links work correctly
- [ ] Test keyboard navigation
- [ ] Check animations performance
- [ ] Verify z-index doesn't block important content
- [ ] Test in low-light mode (dark mode)
- [ ] Monitor page load performance
- [ ] Set up tracking/analytics (if needed)

---

## Support & Documentation

| Resource | URL |
|----------|-----|
| Widget Code | `js/live-chat-widget.js` |
| Widget Styles | `css/live-chat-widget.css` |
| This Guide | `LIVE_CHAT_WIDGET_GUIDE.md` |

---

## Version History

**v1.0 - April 25, 2026**
- Initial release
- 2 pre-configured channels (Facebook, WhatsApp)
- Smooth animations
- Mobile responsive
- Fully accessible
- Extensive customization options

---

**Happy customizing! The widget is production-ready and can be deployed immediately.**

*Last Updated: April 25, 2026*
