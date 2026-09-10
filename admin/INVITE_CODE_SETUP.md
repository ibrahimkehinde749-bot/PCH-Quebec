# Admin Dashboard Authentication Setup

## Overview
The admin dashboard uses server-side authentication with an administrator Gmail address and password. The browser does not store or validate credentials.

## How It Works

1. **First Visit**: When someone visits `/admin/index.html`, they see a login modal for the configured administrator Gmail and password.

2. **Authentication**:
   - The credentials are checked by the Express server
   - The password is stored as a salted scrypt hash in `private/admin-auth.json`
   - A short-lived HTTP-only session cookie grants access to the dashboard APIs

3. **Sessions**:
   - Sessions are stored server-side and represented by an HTTP-only cookie
   - Logging out, changing the email/password, or resetting the password revokes sessions

4. **Logout**:
   - The logout button revokes the server session
   - The dashboard remains hidden until the server confirms a new login

## Configure Credentials

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the server environment before the first launch. On first launch, the password is hashed and stored server-side. After that, use the Settings section to change the Gmail address or password.

Password recovery requires SMTP configuration. The server sends a one-time reset link that expires after 15 minutes; it never sends or displays the existing password.

## Security Notes

⚠️ **IMPORTANT SECURITY CONSIDERATIONS:**

1. **Production Security**: Use:
   - HTTPS/SSL certificates
   - Password hashing
   - Database-level access controls
   - IP whitelisting
   - Two-factor authentication

2. The JSONBin master key and Formspree token must remain server environment variables. Never place them in the admin frontend.

3. Deploy behind HTTPS so session cookies use the `Secure` attribute.

## Troubleshooting

### **Problem**: Users see the invite modal but can't unlock the dashboard
**Solution**: Verify the invite code is correctly entered. Check the exact spelling in `main.js`.

### **Problem**: Users can see the code in the source
**Solution**: This is expected with JavaScript-based authentication. For true security, implement server-side authentication.

### **Problem**: Logout doesn't work
**Solution**: Ensure the logout button element exists in the HTML and JavaScript is not throwing errors in the console.

### **Problem**: Code works sometimes but not always
**Solution**: Check browser session storage settings. Some browsers or extensions may clear storage automatically.

## Features

✅ **What's Included:**
- Invite code input with password field
- Form validation and error messages
- Shake animation on invalid code (visual feedback)
- Session persistence during browser session
- Logout functionality with confirmation dialog
- Responsive design (works on mobile and desktop)
- Clean, modern UI matching the admin dashboard style

## Testing

To test the authentication system:

1. Open `/admin/index.html` in your browser
2. You should see the invite code modal
3. Try entering wrong codes - you should see the error message
4. Enter the correct code - the dashboard should unlock
5. Refresh the page - you should still be logged in (session persists)
6. Click the logout button - it should ask for confirmation
7. After logout, the modal should reappear

## Default Credentials

- **Default Invite Code**: `SECRET123ADMIN`
- **Change immediately for production use!**

---

For questions or issues, check the browser console (F12) for any JavaScript errors.
