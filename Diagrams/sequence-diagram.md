# Sequence Diagram

> Flow of operations for the Astrology backend

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'darkMode': true }}}%%
sequenceDiagram
    participant User as Frontend App
    participant API as Node Backend
    participant DB as MongoDB
    participant VA as VedicAstro API

    Note over User,VA: 1. Manage Birth Profile
    User->>API: Send DOB, Time, Location
    API->>DB: Save Profile to DB
    DB-->>API: Confirm Profile Saved
    API-->>User: Show Profile Success

    Note over User,VA: 2. Calculate Birth Chart
    User->>API: Request Birth Chart
    API->>VA: Send Coordinates to API
    VA-->>API: Return Vedic Chart JSON
    API->>DB: Save Chart History
    API-->>User: Render Visual Chart on UI

    Note over User,VA: 3. Analyze Dosha Status
    User->>API: Request Dosha Details
    API->>DB: Check for Cached Data
    
    alt Cache Valid and Exists
        DB-->>API: Return Saved Dosha
    else No Cache or Expired
        API->>VA: Fetch Fresh Dosha Data
        VA-->>API: Return Dosha Results
        API->>DB: Write New Cache to DB
    end
    API-->>User: Display Dosha Information

    Note over User,VA: 4. Manage Saved Reports
    User->>API: Delete Saved Chart
    API->>DB: Remove Chart Record
    DB-->>API: Confirm Deletion
    API-->>User: Update Chart List UI
```

---

## Explanation

### Step 1: Manage Birth Profile
1. User sends Date of Birth, Time of Birth, and Location
2. Backend saves profile to MongoDB
3. Confirmation returned to user

### Step 2: Calculate Birth Chart
1. User requests birth chart generation
2. Backend calls VedicAstro API with coordinates
3. API returns chart data
4. Backend stores chart in MongoDB
5. Frontend displays the chart

### Step 3: Analyze Dosha Status
1. User requests dosha details
2. Backend checks for existing cached data in MongoDB
3. If cached - return saved data
4. If not cached - call VedicAstro API, store result, return to user

### Step 4: Manage Saved Reports
1. User requests to delete a chart
2. Backend removes record from MongoDB
3. Confirmation sent to frontend

---

*Updated: April 2026*
