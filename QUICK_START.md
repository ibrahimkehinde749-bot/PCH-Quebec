# Quick Start Guide - Admin Dashboard

## 30-Minute Setup

### What You'll Get
✅ Admin dashboard to manage winners  
✅ Auto-sync to public winners page  
✅ Cloud storage with JSONBin.io  
✅ No backend required  
✅ Works on Netlify instantly  

---

## Step 1: Create JSONBin Account (5 minutes)
1. Go to https://jsonbin.io
2. Click "Sign Up"
3. Create account with email
4. Verify email
5. Log in to dashboard

---

## Step 2: Create Your Winners Bin (5 minutes)

In JSONBin dashboard, create a new bin with this JSON:

```json
{
  "winners": [
    {
      "id": "1",
      "claimCode": "PCH203156",
      "winnerName": "John Doe",
      "prizeCategory": "$1,000,000.00",
      "status": "Delivered",
      "dateAdded": "2026-02-07T00:00:00.000Z"
    },
    {
      "id": "2",
      "claimCode": "PCH789012",
      "winnerName": "Jane Smith",
      "prizeCategory": "$500,000.00",
      "status": "Delivered",
      "dateAdded": "2026-02-07T00:00:00.000Z"
    }
  ]
}
```

Copy your:
- **Bin ID** (from URL: https://jsonbin.io/b/`YOUR_BIN_ID`)
- **Master Key** (from Account Settings)

---

## Step 3: Update Config Files (5 minutes)

### File 1: `/admin/js/main.js`
Find (around line 125):
```javascript
const BIN_ID = 'YOUR_BIN_ID_HERE';
const MASTER_KEY = 'YOUR_MASTER_KEY_HERE';
```

Replace with your actual values:
```javascript
const BIN_ID = '6758f3abc123def456';
const MASTER_KEY = 'your_master_key_goes_here';
```

### File 2: `/js/winners-loader.js`
Find (around line 52):
```javascript
const BIN_ID = 'YOUR_BIN_ID_HERE';
const MASTER_KEY = 'YOUR_MASTER_KEY_HERE';
```

Replace with **same values** as above.

---

## Step 4: Test Locally (10 minutes)

### Test Admin Dashboard
1. Open `/admin/index.html` in browser
2. Should see 2 sample winners in the table
3. Click "Add Winner" tab
4. Fill form: PCH555555, Test User, $250,000.00, Pending
5. Click "Add Winner"
6. New winner should appear in table

### Test Public Site
1. Open `/winners.html`
2. Wait 2-3 seconds
3. Should see the test winner in the table
4. If not, hard refresh (Ctrl+Shift+R)

### Test Edit
1. Go back to `/admin/`
2. Click "Edit" on any winner
3. Change status to something different
4. Click "Save Changes"
5. Go to `/winners.html` and refresh
6. Status should be updated

---

## Step 5: Deploy to Netlify (5 minutes)

1. Upload entire folder to Netlify
2. Visit `yoursite.netlify.com/admin/`
3. Dashboard should work!
4. Add a test winner
5. Check `/winners.html` - should sync!

---

## Done! 🎉

Your admin dashboard is live!

### What You Can Now Do:
- ✅ Visit `/admin/` to manage winners
- ✅ Add new winners (instant sync)
- ✅ Edit winner details
- ✅ Delete winners
- ✅ View statistics
- ✅ Search winners
- ✅ All changes appear on `/winners.html` instantly

---

## Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| "Setup Required" warning | Check BIN_ID and MASTER_KEY in both JS files |
| Table is empty | Make sure JSONBin bin has the correct structure |
| Data not syncing | Hard refresh `/winners.html` (Ctrl+Shift+R) |
| "Failed to fetch" error | Check internet, verify Bin ID is correct |
| Changes not saving | Check browser console (F12) for errors |

---

## File Reference

| File | Purpose |
|------|---------|
| `/admin/index.html` | Admin dashboard interface |
| `/admin/js/main.js` | Dashboard logic (needs config) |
| `/admin/js/jsonbin.js` | API integration |
| `/admin/css/admin.css` | Dashboard styling |
| `/js/winners-loader.js` | Loads data on public site |
| `/winners.html` | Public winners page (auto-syncs) |

---

## Cheat Sheet

### Add Winner via Admin Panel
1. Click "Add Winner" tab
2. Fill in 4 fields
3. Click "Add Winner"
4. Done!

### Edit Winner
1. Click "Edit" button in table
2. Update fields in modal
3. Click "Save Changes"
4. Done!

### Delete Winner
1. Click "Delete" button
2. Confirm deletion
3. Winner removed
4. Done!

### Search Winners
1. Type in search box
2. Table filters in real-time
3. Results update as you type
4. Done!

### View Statistics
1. Click "Statistics" tab
2. See total and breakdown by status
3. Done!

---

## For More Help

- **Full Setup Guide**: See `ADMIN_SETUP.md`
- **Configuration Reference**: See `ADMIN_CONFIG.txt`
- **Implementation Details**: See `IMPLEMENTATION_COMPLETE.md`
- **JSONBin.io Help**: https://jsonbin.io

---

## Need to Make Changes?

### Want to add more fields?
1. Update JSONBin bin structure
2. Add inputs in `/admin/index.html` form
3. Update form handling in `/admin/js/main.js`

### Want to change colors?
1. Edit `/admin/css/admin.css`
2. Update `:root` color variables

### Want to add authentication?
1. Add login form to `/admin/index.html`
2. Validate before showing dashboard
3. Add login check in `/admin/js/main.js`

---

**You're ready to go! Start managing your winners now.** 🚀

Questions? Check the full guides or JSONBin.io documentation.
