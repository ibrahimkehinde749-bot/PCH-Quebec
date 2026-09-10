# Grant Program Website

A modern, responsive static website for managing and promoting a grant program. Built with HTML, CSS, and vanilla JavaScript—no frameworks or build tools required.

## Features

- **Home Page**: Welcome section with program highlights and quick navigation
- **About Page**: Information about the grant program mission and history
- **Grants Page**: Detailed listing of available grant opportunities with eligibility criteria
- **Application Form**: Comprehensive grant application form with client-side validation
- **Contact Page**: Contact information and message form for inquiries
- **Responsive Design**: Mobile-friendly layout that works on all device sizes
- **Form Validation**: Real-time validation for all form submissions
- **Local Storage**: Applications and messages are stored in browser's local storage (demo feature)

## Project Structure

```
grant-program-website/
├── index.html           # Home page
├── about.html           # About the program
├── grants.html          # Available grants
├── apply.html           # Grant application form
├── contact.html         # Contact information & form
├── css/
│   └── styles.css       # Main stylesheet
├── js/
│   └── main.js          # JavaScript functionality
├── assets/              # Images and media (placeholder)
└── README.md            # This file
```

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional but recommended)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd grant-program-website
   ```

2. **Option A: Using Python (if installed)**
   ```bash
   # Python 3.x
   python -m http.server 8000
   
   # Python 2.x
   python -m SimpleHTTPServer 8000
   ```

3. **Option B: Using Node.js (if installed)**
   ```bash
   npx http-server
   ```

4. **Option C: Direct file access**
   - Open `index.html` directly in your browser (some features may be limited)

5. **Open in browser**
   - Navigate to `http://localhost:8000` (or the port shown in terminal)

## Usage

### Navigating the Site
- Use the navigation bar to switch between different pages
- Click "Apply Now" buttons to go to the application form
- Fill out forms with valid information and submit

### Form Features
- **Grant Application**: Collect applicant info, project details, and funding requests
- **Contact Form**: Allow users to send messages and inquiries
- **Validation**: Forms validate all required fields before submission
- **Success Feedback**: Confirmation messages appear after successful submission
- **Local Storage**: Data is saved in browser (for demo purposes)

### Customization

#### Modify Grant Information
Edit the grant cards in `grants.html` to update:
- Grant names and descriptions
- Funding amounts
- Application deadlines
- Focus areas

#### Update Contact Information
Edit the contact info section in `contact.html`:
- Address
- Phone number
- Email addresses
- Office hours

#### Change Colors and Branding
Edit CSS variables in `css/styles.css`:
```css
:root {
    --primary-color: #2563eb;      /* Change to your brand color */
    --secondary-color: #7c3aed;
    --accent-color: #ec4899;
    /* ... other colors ... */
}
```

## Features in Detail

### Navigation
- Sticky navigation bar
- Active state indicators
- Responsive mobile menu ready

### Forms
- **Grant Application Form**
  - Personal information collection
  - Grant type selection
  - Project description and timeline
  - Funding amount request
  - Terms acceptance

- **Contact Form**
  - Name, email, subject, and message fields
  - Validation before submission
  - Success confirmation

### Responsive Design
- Mobile-first approach
- Breakpoints at 768px and 600px
- Touch-friendly buttons and forms
- Readable text sizes on all devices

### Form Validation
The JavaScript includes validation for:
- Required fields
- Email format
- Phone number format
- Text length minimums
- Amount ranges
- Checkbox confirmation

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Accessibility

- Semantic HTML structure
- Form labels properly associated with inputs
- Color contrast meets WCAG standards
- Keyboard navigation support

## Adding Backend Functionality

To enable actual form submissions to a server:

1. **Update form handlers** in `js/main.js`:
   ```javascript
   // Replace the console.log with:
   fetch('/api/submit-application', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(data)
   })
   ```

2. **Set up your backend** (Node, Python, PHP, etc.) to:
   - Receive form data
   - Validate and sanitize input
   - Store in database
   - Send confirmation emails

## Deployment

### GitHub Pages
1. Push your repository to GitHub
2. Go to Settings > Pages
3. Select the branch to deploy
4. Site will be available at `https://username.github.io/grant-program-website`

### Traditional Hosting
1. Upload all files to your web server
2. Ensure `.html`, `.css`, and `.js` files are in the correct directories
3. Access via your domain

### Netlify
1. Connect your GitHub repository
2. Set build command: (leave empty for static site)
3. Set publish directory: `/` (root)
4. Deploy

## Customization Examples

### Add a New Page
1. Create a new `.html` file (e.g., `success-stories.html`)
2. Copy the structure from another page
3. Add link to navigation in all HTML files

### Add Form Fields
1. Add new input in the form
2. Update validation function in `js/main.js`
3. Update success message handling

### Change Styling
1. Edit `css/styles.css`
2. Use CSS variables for consistent colors
3. Test responsive breakpoints

## Troubleshooting

### Forms not submitting
- Check browser console (F12) for JavaScript errors
- Ensure validation passes (check all required fields)
- Verify form IDs match in HTML and JavaScript

### Styles not loading
- Check file paths in `<link>` tags
- Ensure `css/styles.css` exists in correct directory
- Clear browser cache (Ctrl+Shift+Delete)

### Navigation not working
- Verify file names match exactly (case-sensitive on Linux/Mac)
- Check that all `.html` files exist
- Test in different browser

## Future Enhancements

- [ ] Email notifications on form submission
- [ ] Admin dashboard for viewing applications
- [ ] PDF export of applications
- [ ] Payment processing for fees (if applicable)
- [ ] Multi-language support
- [ ] Search functionality
- [ ] Application status tracking
- [ ] FAQ section
- [ ] Blog for grant tips and news

## License

This project is open source and available under the MIT License.

## Support

For questions or issues:
1. Check the troubleshooting section above
2. Review the code comments in HTML and JS files
3. Contact the development team

## Version History

- **v1.0.0** (2025-12-22) - Initial release
  - Created core pages and structure
  - Implemented form validation
  - Added responsive design
  - Included contact functionality
