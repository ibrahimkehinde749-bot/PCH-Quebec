# Admin Dashboard Setup Guide

## Overview
This admin dashboard allows you to manage the winners list displayed on the public `winners.html` page. All changes are stored in JSONBin.io and automatically synchronized across your site.

## Features
- ✅ Add, edit, and delete winners
- ✅ Search and filter winners
- ✅ View statistics (total winners, status breakdown)
- ✅ Real-time synchronization between admin panel and public site
- ✅ Status tracking (Pending, Processing, Delivered, Claimed)
- ✅ Responsive design (mobile-friendly)

## Architecture

### Folder Structure
```
grant-program-website/
├── admin/
│   ├── index.html           # Admin dashboard interface
│   ├── css/
│   │   └── admin.css        # Dashboard styling
│   └── js/
│       ├── main.js          # Dashboard logic
│       └── jsonbin.js       # JSONBin.io API integration
├── js/
│   └── winners-loader.js    # Loads data on public winners.html
└── winners.html             # Public winners page
```

### How It Works

1. **Admin Dashboard** (`/admin/index.html`)
   - Interface for managing winners data
   - Communicates with JSONBin.io to store/retrieve data
   - Provides add, edit, delete, search, and statistics features

2. **JSONBin.io Storage**
   - Cloud-based JSON storage (free tier available)
   - Acts as your database for winners information
   - Stores data in a single JSON bin

3. **Public Winners Page** (`/winners.html`)
   - Loads winners data from JSONBin.io on page load
   - Falls back to static HTML table if JSONBin is unavailable
   - Updates automatically when admin panel makes changes

## Setup Instructions

### Step 1: Create a JSONBin.io Account
1. Go to [jsonbin.io](https://jsonbin.io)
2. Sign up for a free account
3. Log in to your dashboard

### Step 2: Create a JSON Bin

1. Click "Create Bin" or use the API to create one
2. Create a new bin with the following structure:

```json
{
  "winners": [
    {
      "id": "1707331200000",
      "claimCode": "PCH203156",
      "winnerName": "John Doe",
      "prizeCategory": "$1,000,000.00",
      "status": "Delivered",
      "dateAdded": "2026-02-07T00:00:00.000Z"
    },
    {
      "id": "1707331201000",
      "claimCode": "PCH789012",
      "winnerName": "Jane Smith",
      "prizeCategory": "$500,000.00",
      "status": "Delivered",
      "dateAdded": "2026-02-07T00:00:00.000Z"
    }
  ]
}
```

3. Save the bin and note your:
   - **Bin ID** (shown in the URL: `jsonbin.io/b/{BIN_ID}`)
   - **Master Key** (shown in your account settings or bin details)

### Step 3: Update Configuration Files

#### In `/admin/js/main.js`:
Find these lines (approximately line 125):
```javascript
const BIN_ID = 'YOUR_BIN_ID_HERE';
const MASTER_KEY = 'YOUR_MASTER_KEY_HERE';
```

Replace with your actual credentials:
```javascript
const BIN_ID = 'abc123def456';
const MASTER_KEY = 'your_master_key_here';
```

#### In `/js/winners-loader.js`:
Find these lines (approximately line 52):
```javascript
const BIN_ID = 'YOUR_BIN_ID_HERE';
const MASTER_KEY = 'YOUR_MASTER_KEY_HERE';
```

Replace with your actual credentials (same as above):
```javascript
const BIN_ID = 'abc123def456';
const MASTER_KEY = 'your_master_key_here';
```

### Step 4: Test the Setup

1. Open your admin dashboard: `https://yoursite.com/admin/`
2. You should see the "Manage Winners" tab with your winners list
3. Try adding a new winner using the "Add Winner" form
4. Open your public winners page: `https://yoursite.com/winners.html`
5. The new winner should appear in the table (may take a few seconds to load)

## Using the Admin Dashboard

### Manage Winners Tab
- View all winners in a table format
- Search by claim code, name, or prize category
- Click "Edit" to modify a winner (opens modal form)
- Click "Delete" to remove a winner
- Changes are instantly saved to JSONBin.io

### Add Winner Tab
- Fill in the form with winner details:
  - **Claim Code**: Unique identifier (e.g., PCH123456)
  - **Winner Name**: Full name of the winner
  - **Prize Category**: Prize amount or category
  - **Status**: Select from Pending, Processing, Delivered, or Claimed
- Click "Add Winner" to save
- New winner appears in the table immediately

### Statistics Tab
- View total number of winners
- See breakdown by status (Delivered, Pending, Processing, Claimed)
- Quick overview of your winners list

## Key Features Explained

### Automatic Synchronization
- When you change data in the admin dashboard, it's saved to JSONBin.io
- The public winners page checks JSONBin.io on load
- Any changes made are reflected on the public site within seconds

### Status Options
- **Pending**: Winner submitted but not yet verified
- **Processing**: Winner is being processed
- **Delivered**: Prize has been delivered
- **Claimed**: Winner has claimed their prize

### Search Functionality
- Real-time search across claim code, winner name, and prize category
- Case-insensitive matching
- Filters results as you type

### Fallback Mechanism
- If JSONBin.io is unavailable, the public site uses the static HTML table data
- Admin dashboard requires JSONBin.io connection to function

## Troubleshooting

### Issue: "Setup Required" Message
**Solution**: Verify you've correctly updated the `BIN_ID` and `MASTER_KEY` in both:
- `/admin/js/main.js`
- `/js/winners-loader.js`

### Issue: Data Not Loading
**Possible causes**:
- Incorrect BIN_ID or MASTER_KEY
- JSONBin.io API is down
- Browser blocked the request (CORS)

**Solution**:
1. Check browser console for error messages (F12 → Console)
2. Verify your credentials are correct
3. Check JSONBin.io status
4. Clear browser cache and reload

### Issue: Changes Not Appearing on Public Site
**Solution**:
- Wait 3-5 seconds for the data to sync
- Hard refresh the winners.html page (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors

### Issue: CORS Errors
**Solution**: JSONBin.io allows cross-origin requests by default. If you encounter CORS errors:
1. Verify the Master Key is correct
2. Check that the bin has the correct structure (winners array)
3. Try accessing the bin directly in your browser to test connectivity

## Security Considerations

### Important: Master Key Protection
⚠️ **Do NOT commit your Master Key to public repositories!**

If hosting on a platform like Netlify, GitHub Pages, or similar:
1. Consider using environment variables (see Netlify section below)
2. Implement authentication on the admin dashboard
3. Add IP whitelisting in JSONBin.io settings

### Implementing Environment Variables (Netlify)

1. In your Netlify dashboard, go to **Site Settings → Build & Deploy → Environment**
2. Add the following variables:
   - `REACT_APP_BIN_ID`: Your bin ID
   - `REACT_APP_MASTER_KEY`: Your master key

3. Update your JavaScript files to use environment variables:
```javascript
const BIN_ID = process.env.REACT_APP_BIN_ID;
const MASTER_KEY = process.env.REACT_APP_MASTER_KEY;
```

Note: This requires a build step or server-side setup. For static sites, you'll need an alternative approach.

### Alternative: Backend Proxy
For better security, consider implementing a backend API that:
- Stores credentials securely on the server
- Acts as a proxy between your frontend and JSONBin.io
- Implements authentication for the admin panel

## API Reference

### JSONBinManager Class

#### Constructor
```javascript
const manager = new JSONBinManager(binId, masterKey);
```

#### Methods
- `fetchWinners()` - Get all winners from JSONBin
- `updateWinners(winnersData)` - Replace all winners
- `addWinner(winnerObject)` - Add a new winner
- `updateWinner(winnerId, updatedData)` - Update specific winner
- `deleteWinner(winnerId)` - Delete a winner

### Winner Object Structure
```javascript
{
  id: "1707331200000",              // Unique identifier
  claimCode: "PCH123456",           // Claim code
  winnerName: "John Doe",           // Winner's name
  prizeCategory: "$1,000,000.00",   // Prize amount/category
  status: "Delivered",              // Current status
  dateAdded: "2026-02-07T..."       // ISO date string
}
```

## Advanced Usage

### Bulk Import
To import multiple winners at once:
1. Create a JSON file with the winners array
2. Use JSONBin.io's import feature or create a script
3. The admin dashboard will immediately reflect the changes

### Data Backup
JSONBin.io keeps version history (on paid plans). To backup:
1. Export your bin's data regularly
2. Save to your repository as a JSON file
3. Use the file as a fallback if needed

### Custom Statuses
If you need additional status options:
1. Update the `<select>` element in `/admin/index.html`
2. Add corresponding CSS classes in `/admin/css/admin.css` for styling
3. Update status mapping in `/js/winners-loader.js` if needed

## Support

For JSONBin.io support: https://jsonbin.io
For issues with the admin dashboard, check:
1. Browser console for errors (F12)
2. Network tab to verify API calls
3. Verify bin structure matches the expected format

## File Modifications Summary

When you upload to Netlify or your hosting provider, ensure you upload these files:
- All original website files
- New `/admin/` folder with all its contents
- Updated `winners.html` (now includes winners-loader.js)
- New `/js/winners-loader.js`

## Next Steps

1. ✅ Create JSONBin.io account and bin
2. ✅ Update credentials in JavaScript files
3. ✅ Deploy to Netlify
4. ✅ Test admin dashboard at `/admin/`
5. ✅ Add/edit winners and verify changes appear on `/winners.html`
6. ✅ Set up environment variables for security (optional but recommended)

Happy managing! 🎉
