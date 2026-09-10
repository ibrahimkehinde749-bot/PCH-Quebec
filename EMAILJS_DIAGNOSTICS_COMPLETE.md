# EmailJS Form Submission - Complete Diagnostics & Fix

## What I've Done

I've added comprehensive diagnostic and logging tools to help identify why your form submissions aren't being delivered:

### ✅ Updates Made:

1. **Enhanced Error Logging**
   - Added detailed console messages throughout submission process
   - Shows exactly where the process fails
   - Logs all data being sent to EmailJS

2. **Diagnostic Tools**
   - `/js/emailjs-diagnostics.js` - Runs tests on page load
   - `sendTestEmail()` - Function to test EmailJS directly
   - Console logging at each step

3. **Better Error Display**
   - Shows specific error details to users
   - Includes error codes and messages
   - Helps identify the issue

4. **Documentation**
   - `EMAILJS_TROUBLESHOOTING.md` - Step-by-step fixing guide
   - `EMAILJS_CONFIG_VERIFICATION.md` - Configuration checklist

---

## How to Find the Problem

### Step 1: Open the Apply Form
Go to `/apply.html` in your browser

### Step 2: Open Browser Console
Press **F12** and click **Console** tab

### Step 3: Fill & Submit Form
Fill out the form and click "Submit Application"

### Step 4: Check Console Messages

You'll see one of these scenarios:

#### ✅ Scenario A: "Email sent successfully"
```
=== GRANT FORM SUBMISSION ===
✅ Email sent successfully!
```
→ **Email was sent!** Check inbox and spam folder

---

#### ❌ Scenario B: "EmailJS not available"
```
❌ EmailJS not available; showing success locally
```
→ **Problem**: EmailJS library not loading
→ **Fix**: Verify script tag is in apply.html

---

#### ❌ Scenario C: "Error Status 401/403"
```
❌ Email send failed!
Error status: 401 (or 403)
Error text: Unauthorized
```
→ **Problem**: Wrong Public Key or service disconnected
→ **Fix**: Check EmailJS dashboard → Account Settings

---

#### ❌ Scenario D: "Error Status 404"
```
❌ Email send failed!
Error status: 404
Error text: Not found
```
→ **Problem**: Service ID or Template ID is wrong
→ **Fix**: Check in EmailJS dashboard

---

#### ❌ Scenario E: "Error Status 422"
```
❌ Email send failed!
Error status: 422
```
→ **Problem**: Form variable names don't match template
→ **Fix**: Check template variables in EmailJS dashboard

---

## Typical Causes (In Order of Likelihood)

### 1. **Most Common: Template Variable Mismatch** (40%)
Your code sends `claim_code` but template expects `claimCode`

**Check**:
1. Go to https://dashboard.emailjs.com
2. Open template `template_n6ag76q`
3. Look at variables used in the template body
4. Should be: `{{claim_code}}`, `{{full_name}}`, etc. (with underscores!)
5. If different, either:
   - Update template to use underscore format, OR
   - Update code to match template variables

### 2. **Email Service Disconnected** (30%)
Gmail/Outlook connection dropped in EmailJS

**Check**:
1. Go to Email Services in dashboard
2. Look for your service (should be green/connected)
3. If red/offline, click it and reconnect

### 3. **Wrong Configuration** (20%)
Service ID, Template ID, or Public Key is incorrect

**Check**:
1. Main.js line 63: `emailjs.init("u6LwWkk8fv67W37h4")`
2. Main.js line ~371: `emailjs.send("service_kgs6vjh", "template_n6ag76q", ...)`
3. Compare with actual IDs in dashboard

### 4. **EmailJS Not Loading** (10%)
Script tag missing or in wrong order

**Check**:
```html
<!-- In apply.html before </body> -->
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/emailjs.min.js"></script>
<script src="js/emailjs-diagnostics.js"></script>
<script src="js/main.js"></script>
```

---

## Quick Diagnostic Command

Paste this in browser console (F12) to test:

```javascript
// Test 1: Check EmailJS loaded
console.log('EmailJS loaded:', typeof emailjs !== 'undefined');

// Test 2: Check form exists
console.log('Form exists:', !!document.getElementById('sweepstakes'));

// Test 3: Send test email
sendTestEmail();
```

You'll immediately see which part is failing.

---

## Expected Console Output (If Working)

When you submit the form successfully:

```
=== GRANT FORM SUBMISSION ===
Form submit triggered
✅ Validation passed, preparing form data
Form data extracted: {
  claimCode: "PCH...",
  fullName: "John Doe",
  email: "john@example.com",
  phone: "+1-279-222-1855",
  address: "123 Main St",
  grantType: "innovation",
  idNumber: "Card ID",
  additionalInfo: "",
  terms: "on"
}
📧 Preparing to send email...
Service ID: service_kgs6vjh
Template ID: template_n6ag76q
Email parameters: {...}
✅ Email sent successfully!
Response status: 200
Response text: OK
```

If you see this, the email WAS sent! Check inbox and spam folder.

---

## What To Do Now

### Immediate Actions:

1. **Test the form**
   - Open `/apply.html`
   - Fill it out completely
   - Click Submit
   - Watch the browser console (F12 → Console)

2. **Note the exact error message** (if any)
   - Is it "Not available"? 
   - Is it "Error Status 401"?
   - Is it "Email sent successfully"?

3. **Check your email**
   - Inbox
   - Spam/Junk folder
   - Wait 1-2 minutes

4. **Report findings**
   - Tell me what console says
   - Tell me if test email works
   - Tell me what's in dashboard

---

## If Email Test Works But Form Doesn't

This is almost always a **variable name mismatch**.

**The fix**:

1. Go to https://dashboard.emailjs.com
2. Click **Email Templates**
3. Open template `template_n6ag76q`
4. Look at ALL the `{{variable}}` names used
5. Compare with what code sends:
   - `claim_code` - must be `{{claim_code}}`
   - `full_name` - must be `{{full_name}}`
   - `sweepstakes_type` - must be `{{sweepstakes_type}}`
   - etc.

**If template uses different names**:
- Edit template body to use correct names, OR
- Edit main.js to send matching names

---

## Files Updated:

- ✅ `/js/main.js` - Enhanced logging
- ✅ `/js/emailjs-diagnostics.js` - New diagnostic tool
- ✅ `/apply.html` - Added diagnostics script
- ✅ `EMAILJS_TROUBLESHOOTING.md` - Troubleshooting guide
- ✅ `EMAILJS_CONFIG_VERIFICATION.md` - Config verification guide

---

## Next Steps:

1. **Test the form** on `/apply.html`
2. **Watch the console** (F12) for messages
3. **Follow the troubleshooting guide** based on what you see
4. **Let me know**:
   - What console messages appear?
   - What error, if any?
   - Does test email work?

---

## TL;DR Quick Reference

**If form doesn't submit**:
- Check console (F12) for error
- Most common: variable name mismatch in template
- Solution: Compare template variables with code

**If form submits but email doesn't arrive**:
- Check SPAM folder
- Verify email service is connected in dashboard
- Check template has correct variable names

**If test email works but form email doesn't**:
- Form is sending wrong variable names
- Check template expects those names

**For help**:
- See `EMAILJS_TROUBLESHOOTING.md`
- See `EMAILJS_CONFIG_VERIFICATION.md`
- Check browser console messages

---

**Start by testing the form and watching the console. That will tell us exactly what's wrong!**
