%%{init: {'theme': 'dark', 'themeVariables': { 'darkMode': true }}}%%
graph TB

    subgraph External_Systems ["External Systems"]
        API["VedicAstro API<br/>(Planetary Calculations)"]
        DB["MongoDB<br/>(Data Persistence)"]
    end
    
    subgraph System ["Vedic Astrology System"]
        Auth["Authenticate User<br/>(Security Session)"]
        Fetch["Fetch Planetary Data<br/>(API Call)"]
        
        UC1["Manage Birth Profile<br/>(Save DOB, TOB, Coordinates)"]
        UC2["Calculate Birth Chart<br/>(Virtual Rendering)"]
        UC3["Analyse Dosha Status<br/>(Mangal, Kaal Sarp)"]
        UC4["Manage Saved Reports<br/>(CRUD Operations)"]
        UC4a["Export Report as PDF<br/>(Download)"]
        UC5["Request Account Deletion<br/>(Soft-Delete 30 Days)"]
    end
    
    Actor["User (Registered)"]
    
    %% Primary Actor Relationships
    Actor --> UC1
    Actor --> UC2
    Actor --> UC4
    Actor --> UC5
    
    %% Include Relationships (Mandatory dependencies)
    UC1 -. "<<include>>" .-> Auth
    UC4 -. "<<include>>" .-> Auth
    UC5 -. "<<include>>" .-> Auth
    UC2 -. "<<include>>" .-> Fetch
    
    %% Extend Relationships (Optional additions)
    UC3 -. "<<extend>>" .-> UC2
    UC4a -. "<<extend>>" .-> UC4
    
    %% External System Interactions
    Fetch --> API
    UC1 --> DB
    UC2 --> DB
    UC3 --> DB
    UC4 --> DB
    UC5 --> DB
    
    %% Original Styling
    style Actor fill:#1a237e,stroke:#fff,color:#fff
    style Auth fill:#004d40,stroke:#fff,color:#fff
    style Fetch fill:#004d40,stroke:#fff,color:#fff
    style UC1 fill:#2e7d32,stroke:#fff,color:#fff
    style UC2 fill:#2e7d32,stroke:#fff,color:#fff
    style UC3 fill:#2e7d32,stroke:#fff,color:#fff
    style UC4 fill:#2e7d32,stroke:#fff,color:#fff
    style UC4a fill:#2e7d32,stroke:#fff,color:#fff
    style UC5 fill:#2e7d32,stroke:#fff,color:#fff
    style API fill:#e65100,stroke:#fff,color:#fff
    style DB fill:#e65100,stroke:#fff,color:#fff
    style System fill:#00695c,stroke:#fff,color:#fff
    style External_Systems fill:#6a1b9a,stroke:#fff,color:#fff
