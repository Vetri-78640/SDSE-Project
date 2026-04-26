%%{init: {'theme': 'dark', 'themeVariables': { 'darkMode': true }}}%%
flowchart LR

    %% Actors
    Actor((👤 Registered User))
    API[/"⚙️ VedicAstro API"\]
    DB[("🗄️ MongoDB")]

    %% System Boundary
    subgraph System ["Vedic Astrology System"]
        direction TB
        
        Auth([Authenticate User])
        
        UC1([Manage Birth Profile])
        UC2([Calculate Birth Chart])
        UC3([Analyse Dosha Status])
        
        UC4([Manage Saved Reports])
        UC4a([Export Report as PDF])
        
        UC5([Request Account Deletion])
        Fetch([Fetch Planetary Data])
    end

    %% Primary Actor Relationships (Solid lines)
    Actor --- UC1
    Actor --- UC2
    Actor --- UC4
    Actor --- UC5

    %% <<include>> Relationships (Base to Included - Dashed with arrow)
    %% Authentication is required for these core actions
    UC1 -. "<<include>>" .-> Auth
    UC4 -. "<<include>>" .-> Auth
    UC5 -. "<<include>>" .-> Auth
    
    %% Chart calculation requires fetching data from the API
    UC2 -. "<<include>>" .-> Fetch

    %% <<extend>> Relationships (Extending to Base - Dashed with arrow)
    %% Dosha analysis is an optional feature when calculating/viewing a chart
    UC3 -. "<<extend>>" .-> UC2
    
    %% Exporting is an optional feature of managing saved reports
    UC4a -. "<<extend>>" .-> UC4

    %% Secondary Actor / External System Relationships
    Fetch --- API
    UC1 --- DB
    UC2 --- DB
    UC3 --- DB
    UC4 --- DB
    UC5 --- DB

    %% Styling
    classDef actor fill:#1a237e,stroke:#fff,color:#fff,stroke-width:2px;
    classDef usecase fill:#00695c,stroke:#fff,color:#fff,stroke-width:1px;
    classDef external fill:#e65100,stroke:#fff,color:#fff,stroke-width:2px;
    classDef db fill:#6a1b9a,stroke:#fff,color:#fff,stroke-width:2px;

    class Actor actor;
    class Auth,UC1,UC2,UC3,UC4,UC4a,UC5,Fetch usecase;
    class API external;
    class DB db;
