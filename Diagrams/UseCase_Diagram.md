# Astrology Platform - Use Case Architecture

Below is the use case diagram outlining the primary interactions, internal services, and external dependencies for the platform.

```mermaid
graph LR
    subgraph System["Astrology Platform"]
        subgraph UserCases["User Use Cases"]
            UC1["Manage Birth Profile"]
            UC2["Generate Birth Chart"]
            UC3["Analyze Dosha Status"]
            UC4["Manage Saved Reports"]
            UC5["Request Soft-Delete"]
        end
        
        subgraph InternalCases["Internal/Services"]
            UC6["Validate Birth Details"]
            UC7["Fetch Astro API"]
            UC8["Restore Account"]
        end
    end
    
    subgraph External["External Systems"]
        API["VedicAstro API"]
        DB["MongoDB"]
    end
    
    Actor["👤 Registered User"]
    
    %% User interactions
    Actor -->|Uses| UC1
    Actor -->|Uses| UC2
    Actor -->|Uses| UC3
    Actor -->|Uses| UC4
    Actor -->|Uses| UC5
    
    %% Includes relationships
    UC1 -->|includes| UC6
    UC2 -->|includes| UC7
    UC3 -->|includes| UC7
    UC4 -->|includes| UC7
    
    %% Extends relationships
    UC5 -->|extends| UC8
    
    %% External connections
    UC7 -->|calls| API
    UC8 -->|accesses| DB
    UC4 -->|reads from| DB
    
    %% Styling
    classDef actor fill:#38bdf8,stroke:#38bdf8,color:#fff
    classDef usecase fill:#0f172a,stroke:#38bdf8,color:#f8fafc
    classDef internal fill:#0f172a,stroke:#94a3b8,color:#cbd5e1
    classDef external fill:#0f172a,stroke:#c084fc,color:#c084fc
    
    class Actor actor
    class UC1,UC2,UC3,UC4,UC5 usecase
    class UC6,UC7,UC8 internal
    class API,DB external
