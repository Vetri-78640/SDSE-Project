# Simplified Astrology Platform Sequence Diagram

This simplified diagram is designed for easy reproduction in drawing applications like draw.io or Excalidraw, abstracting away deep technical syntax for clear logical flow blocks.

```mermaid
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
    
    alt Cache Valid & Exists
        DB-->>API: Return Saved Dosha
    else No Cache / Expired
        API->>VA: Fetch Fresh Manglik/Dosha Data
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
