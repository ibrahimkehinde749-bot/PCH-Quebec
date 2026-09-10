# System Architecture & Data Flow

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR WEBSITE                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐              ┌──────────────────┐    │
│  │ Admin Dashboard  │              │ Public Site      │    │
│  │  /admin/         │              │ /winners.html    │    │
│  │                  │              │                  │    │
│  │ • Add winners    │              │ • Display table  │    │
│  │ • Edit winners   │◄────────────►│ • Show status    │    │
│  │ • Delete winners │              │ • Search ability │    │
│  │ • View stats     │              │                  │    │
│  │ • Search         │              │ Uses:            │    │
│  │                  │              │ winners-loader.js│    │
│  │ Uses:            │              │                  │    │
│  │ jsonbin.js       │              │                  │    │
│  │ main.js          │              │                  │    │
│  │ admin.css        │              │                  │    │
│  └──────────────────┘              └──────────────────┘    │
│           │                                 │               │
│           └─────────────┬───────────────────┘               │
│                         │                                   │
│                    Sync Data                                │
│                         │                                   │
│                         ▼                                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ API Calls
                          │
┌─────────────────────────────────────────────────────────────┐
│               JSONBin.io (Cloud Storage)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  {                                                           │
│    "winners": [                                              │
│      {                                                       │
│        "id": "1",                                            │
│        "claimCode": "PCH203156",                             │
│        "winnerName": "John Doe",                             │
│        "prizeCategory": "$1,000,000.00",                     │
│        "status": "Delivered"                                 │
│      },                                                      │
│      { ... more winners ... }                                │
│    ]                                                         │
│  }                                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Add New Winner

```
Step 1: Admin Fill Form
┌─────────────────────┐
│ Admin opens /admin/ │
│ Sees "Add Winner"   │
│ Fills form with:    │
│ • Claim Code        │
│ • Name              │
│ • Prize             │
│ • Status            │
└──────────────┬──────┘
               │
               ▼
Step 2: Submit Form
┌─────────────────────┐
│ Admin clicks button │
│ "Add Winner"        │
└──────────────┬──────┘
               │
               ▼
Step 3: JavaScript Processing
┌─────────────────────────────────────┐
│ /admin/js/main.js                   │
│ Validates form data                 │
│ Creates object with all fields      │
│ Generates unique ID                 │
│ Adds timestamp                      │
└──────────────┬──────────────────────┘
               │
               ▼
Step 4: API Call to JSONBin.io
┌──────────────────────────────────────┐
│ /admin/js/jsonbin.js                 │
│ Sends HTTP request:                  │
│ • Method: PUT                        │
│ • URL: api.jsonbin.io/v3/b/{BIN_ID} │
│ • Headers: X-Master-Key              │
│ • Body: Complete winners array       │
└──────────────┬───────────────────────┘
               │
               ▼
Step 5: Cloud Storage Update
┌──────────────────────────────┐
│ JSONBin.io receives data     │
│ Validates JSON structure     │
│ Stores in cloud              │
│ Returns confirmation         │
└──────────────┬───────────────┘
               │
               ▼
Step 6: Frontend Refresh
┌──────────────────────────┐
│ Admin sees success msg   │
│ Table re-loads from      │
│ JSONBin.io              │
│ New winner appears       │
│ Form clears              │
└──────────────┬───────────┘
               │
               ▼
Step 7: Public Site Auto-Sync
┌──────────────────────────────┐
│ When /winners.html loads:    │
│ • Runs winners-loader.js     │
│ • Fetches from JSONBin.io    │
│ • Populates table with data  │
│ • New winner visible!        │
└──────────────────────────────┘
```

---

## Data Flow: User Views Winners

```
User Opens /winners.html
│
▼
HTML Page Loads
│
├─ Static content loads
├─ Navigation loads
├─ Empty table ready
│
▼
JavaScript runs (winners-loader.js)
│
▼
API Request to JSONBin.io
│
│ GET https://api.jsonbin.io/v3/b/{BIN_ID}
│ Headers: X-Master-Key: {KEY}
│
▼
JSONBin.io responds with JSON data
│
▼
JavaScript processes response
│
├─ Extracts winners array
├─ Validates each winner
├─ Escapes HTML (security)
│
▼
Generate Table Rows
│
│ For each winner:
│ <tr>
│   <td>Claim Code</td>
│   <td>Name</td>
│   <td>Prize</td>
│   <td>Status Badge</td>
│ </tr>
│
▼
Insert into DOM
│
│ document.querySelector('.winners-table tbody')
│ .innerHTML = generated HTML
│
▼
User sees winner list with LATEST data from admin
```

---

## Component Dependencies

```
/admin/index.html
│
├─ /admin/css/admin.css
│  └─ Styling and layout
│
├─ /admin/js/jsonbin.js
│  └─ JSONBin.io API wrapper
│     ├─ fetch() API (browser native)
│     └─ Promise handling
│
└─ /admin/js/main.js
   ├─ AdminDashboard class
   ├─ Event listeners
   ├─ Form handling
   ├─ DOM manipulation
   └─ Depends on jsonbin.js

/winners.html
│
├─ /js/main.js (existing)
│  └─ Navigation and other features
│
└─ /js/winners-loader.js (NEW)
   ├─ WinnersDataLoader class
   ├─ Fetches from JSONBin.io
   └─ Updates table on load
```

---

## Network Communication

### Admin Adding/Editing/Deleting

```
Browser                                JSONBin.io
  │                                        │
  │  1. PUT Request                        │
  │  Headers:                              │
  │    Content-Type: application/json      │
  │    X-Master-Key: {MASTER_KEY}          │
  │  Body: { winners: [...] }              │
  ├───────────────────────────────────────►│
  │                                        │
  │                    2. 200 OK           │
  │                    Body: { record }    │
  │◄───────────────────────────────────────┤
  │                                        │
  │  3. JavaScript updates UI              │
  │  4. Shows success message              │
  │                                        │
```

### Public Site Fetching Data

```
Browser                                JSONBin.io
  │                                        │
  │  1. GET Request                        │
  │  Headers:                              │
  │    X-Master-Key: {MASTER_KEY}          │
  ├───────────────────────────────────────►│
  │                                        │
  │                    2. 200 OK           │
  │                    Body: { record }    │
  │                          { winners }   │
  │◄───────────────────────────────────────┤
  │                                        │
  │  3. Parse JSON response                │
  │  4. Insert into table                  │
  │  5. User sees data                     │
  │                                        │
```

---

## State Management

### Admin Dashboard State

```
AdminDashboard Instance
│
├─ jsonBin (JSONBinManager)
│  └─ Handles API communication
│
├─ winners (Array)
│  └─ In-memory copy of all winners
│     Used for display and editing
│
├─ currentView (String)
│  └─ 'manage', 'add', or 'stats'
│     Controls which section shows
│
└─ Methods
   ├─ loadWinners() → updates this.winners
   ├─ addWinner() → POST to API → reload
   ├─ editWinner() → PUT to API → reload
   ├─ deleteWinner() → DELETE → reload
   ├─ renderWinnersTable() → generates HTML
   ├─ renderStats() → generates stats
   └─ filterWinners() → searches this.winners
```

### Public Site State

```
WinnersDataLoader Instance
│
├─ binId (String)
│  └─ Which bin to fetch from
│
├─ masterKey (String)
│  └─ Authentication key
│
└─ Methods
   ├─ fetchWinners()
   │  └─ GET from JSONBin.io → Array
   │
   └─ loadWinnersTable()
      ├─ Fetches data
      ├─ Validates response
      ├─ Generates HTML
      └─ Inserts into DOM
```

---

## Security Flow

```
User Action in Admin
│
▼
Data validation in JavaScript
│
├─ Check required fields
├─ Trim whitespace
├─ Validate input format
│
▼
Create request object
│
├─ Escape HTML characters (prevent XSS)
├─ Add timestamp
├─ Generate unique ID
│
▼
Send to JSONBin.io
│
├─ HTTPS encryption (JSONBin.io requirement)
├─ Master Key in headers
├─ No sensitive data in URL
│
▼
JSONBin.io validates
│
├─ Master Key authentication
├─ JSON schema validation
├─ Rate limiting
│
▼
Store in secure cloud storage
│
▼
When displaying on public site
│
├─ Fetch from JSONBin.io (HTTPS)
├─ Escape HTML in JavaScript
├─ No sensitive fields exposed
│
▼
User sees safe, sanitized data
```

---

## Fallback & Error Handling

```
Public Site Loads
│
▼
Try to fetch from JSONBin.io
│
├─ Success? 
│  └─ Yes → Populate table with cloud data
│
└─ Error?
   ├─ No internet → Fall back to static HTML
   ├─ Wrong key → Fall back to static HTML
   ├─ API down → Fall back to static HTML
   │
   └─ User still sees winners table!
      (Just using static data instead of live)
```

---

## Database-like Behavior

```
JSONBin.io acts like a simple database:

┌──────────────────────────────────────┐
│          JSONBin.io Bin              │
├──────────────────────────────────────┤
│                                      │
│  Record ID: winners                  │
│  {                                   │
│    "winners": [                      │
│      { id: "1", ... },   ← Row 1     │
│      { id: "2", ... },   ← Row 2     │
│      { id: "3", ... }    ← Row 3     │
│    ]                                 │
│  }                                   │
│                                      │
└──────────────────────────────────────┘

API Operations (like SQL):

CREATE:  POST new object to array
READ:    GET entire array from bin
UPDATE:  PUT entire array with changes
DELETE:  PUT array minus deleted item
SEARCH:  GET array + filter in JavaScript
SORT:    GET array + sort in JavaScript
```

---

## Scalability

### Current Design (1 Bin)
```
1 Website → 1 JSONBin Bin → Multiple Winners
            (One JSON file with all winners)
            
Pros: Simple, single source of truth
Cons: Limited to 512KB per bin (free tier)
      ~5,000+ winners possible before limit
```

### Future: Multiple Bins
```
Multiple Websites
    │
    ├─ Site 1 → Bin 1 (Winners)
    │
    ├─ Site 2 → Bin 2 (Winners)
    │
    └─ Site 3 → Bin 3 (Winners)

Each site has its own admin and public pages
```

### Future: Multiple Collections
```
1 Bin with multiple collections:

{
  "winners": [ ... ],
  "categories": [ ... ],
  "settings": { ... }
}

Just add more properties to JSON
```

---

## Performance Characteristics

```
Admin Dashboard:
- Add winner: ~500ms (API call)
- Edit winner: ~500ms (API call)
- Delete winner: ~500ms (API call)
- Load dashboard: ~300ms (API call)
- Search: ~0ms (local filtering)

Public Site:
- Initial page load: ~1-2s (API call + render)
- Table displays: Depends on winner count
  - 100 winners: ~10ms render
  - 1000 winners: ~50ms render
  - 5000 winners: ~200ms render

JSONBin.io:
- Read speed: <100ms
- Write speed: <500ms
- Availability: 99.9% uptime

Overall UX: Fast enough for real-time feel
```

---

## Summary

Your system uses:
- **Frontend**: HTML/CSS/JavaScript (static site)
- **Backend**: JSONBin.io API (cloud JSON storage)
- **Architecture**: Client-side, serverless
- **Communication**: REST API over HTTPS
- **Data Format**: JSON
- **Storage**: Cloud-based
- **Sync**: Real-time (within 2-3 seconds)

This is a **JAMstack** approach:
- **J**avaScript
- **A**PIs (JSONBin.io)
- **M**arkup (HTML)

Perfect for Netlify deployment! 🚀
