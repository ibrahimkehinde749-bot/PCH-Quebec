# EmailJS Configuration Verification

Your current EmailJS configuration:

## Service Configuration
- **Service ID**: `service_kgs6vjh`
- **Public Key**: `u6LwWkk8fv67W37h4`
- **Location**: Initialized in `/js/main.js` line 63

## Template Configuration

### Grant Form Template
- **Template ID**: `template_n6ag76q`
- **Form ID**: `sweepstakes`
- **Location**: `/apply.html`
- **Trigger**: Form submit event

### Expected Template Variables

Your code sends these variables to EmailJS:

```
claim_code          (from form field: claimCode)
full_name           (from form field: fullName)
email               (from form field: email)
phone               (from form field: phone)
address             (from form field: address)
sweepstakes_type    (from form field: grantType)
delivery_card       (from form field: idNumber)
additional_info     (from form field: additionalInfo)
reply_to            (from form field: email)
subject             (generated from code)
```

## Verification Steps

### 1. Verify Service Connection

In EmailJS Dashboard:
1. Go to https://dashboard.emailjs.com
2. Click **Email Services** in left menu
3. Should show a connected service (Gmail, Outlook, etc.)
4. If service shows red/offline, click it and reconnect

### 2. Verify Template

In EmailJS Dashboard:
1. Click **Email Templates** in left menu
2. Look for template with ID: `template_n6ag76q`
3. Click to open it
4. In the **Preview** section, you should see variables like:
   - `{{claim_code}}`
   - `{{full_name}}`
   - `{{email}}`
   - etc.

**⚠️ CRITICAL**: Template variable names MUST match exactly what the code sends!

If your template uses different names (e.g., `{{claimCode}}` instead of `{{claim_code}}`), the email will be sent but with empty/missing values!

### 3. Template Variable Mapping Check

| Form Field | Expected Variable | Template Uses |
|------------|-------------------|----------------|
| claimCode | claim_code | {{claim_code}} |
| fullName | full_name | {{full_name}} |
| email | email | {{email}} |
| phone | phone | {{phone}} |
| address | address | {{address}} |
| grantType | sweepstakes_type | {{sweepstakes_type}} |
| idNumber | delivery_card | {{delivery_card}} |
| additionalInfo | additional_info | {{additional_info}} |

**Action**: Open your template in EmailJS and verify all these variables exist with underscore naming (not camelCase!)

---

## Common Configuration Errors

### ❌ Error 1: Variable Name Mismatch
**Problem**: Template has `{{claimCode}}` but code sends `claim_code`

**Effect**: Email sends but field is empty

**Fix**: Update template to use `{{claim_code}}`

### ❌ Error 2: Service Disconnected
**Problem**: Email service connection dropped

**Effect**: All submissions fail with 401/403 error

**Fix**: 
1. Go to Email Services in dashboard
2. Click on your service
3. Click "Reconnect" or reconnect Gmail/Outlook

### ❌ Error 3: Template Deleted
**Problem**: Template ID changed or template was deleted

**Effect**: 404 error - template not found

**Fix**:
1. Create new template with ID: `template_n6ag76q`
2. Or update code to use your current template ID

### ❌ Error 4: Public Key Wrong
**Problem**: Public Key in code doesn't match dashboard

**Effect**: 401 Unauthorized errors

**Fix**:
1. Go to Account Settings in dashboard
2. Copy your actual Public Key
3. Update main.js line 63 with correct key

---

## Quick Fix Checklist

If forms aren't working:

```
Dashboard Email Services:
- [ ] Service is connected (not red/offline)
- [ ] Service name matches (Gmail, Outlook, etc.)

Dashboard Email Templates:
- [ ] Template `template_n6ag76q` exists
- [ ] Open template and check variables
- [ ] All variables use underscore format (claim_code not claimCode)
- [ ] Template has body/content configured

JavaScript Configuration:
- [ ] main.js line 63 has: emailjs.init("u6LwWkk8fv67W37h4")
- [ ] main.js has service ID: service_kgs6vjh
- [ ] main.js has template ID: template_n6ag76q

Email Configuration:
- [ ] Email address is correct in dashboard
- [ ] Can send test emails manually
- [ ] Check SPAM folder (not just inbox)
```

---

## How to Fix Variable Name Mismatches

If your template uses different variable names:

### Option 1: Update Template (Recommended)
1. In EmailJS, edit your template
2. Change all variables to use underscore format:
   - `claimCode` → `claim_code`
   - `fullName` → `full_name`
   - `grantType` → `sweepstakes_type`
   - `idNumber` → `delivery_card`
   - `additionalInfo` → `additional_info`

### Option 2: Update Code
If you want to keep your template, update main.js to send matching names:

Find this section (~line 371):
```javascript
emailjs.send("service_kgs6vjh", "template_n6ag76q", {
    claim_code: data.claimCode,
    full_name: data.fullName,
    // ...
})
```

Change to match your template variables.

---

## Testing Configuration

### Test 1: Send Test Email
In browser console:
```javascript
sendTestEmail()
```

Should show:
```
✅ Test email sent successfully: {...}
```

### Test 2: Check Email Logs
1. Go to https://dashboard.emailjs.com
2. Click **Email Logs**
3. Should see recent send attempts
4. Click on entry to see details/errors

### Test 3: Verify Form Data
In browser console (while on /apply.html):
```javascript
const form = document.getElementById('sweepstakes');
const formData = new FormData(form);
const data = Object.fromEntries(formData.entries());
console.log('Form data:', data);
```

Should show all form fields with values.

---

## Still Having Issues?

Provide these details:

1. **What error do you see in console?**
   - Take screenshot of console messages
   - Share the exact error text

2. **EmailJS Dashboard Status**
   - Is email service connected? (red/green status)
   - Does template `template_n6ag76q` exist?
   - Are there entries in Email Logs?

3. **Form Behavior**
   - Does success message appear?
   - Do you see "Email sent successfully" in console?
   - Does error message appear?

4. **Test Email Status**
   - Can you send test email manually?
   - Does `sendTestEmail()` work?

With this info, we can pinpoint the exact problem!
