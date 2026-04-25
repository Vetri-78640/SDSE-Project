# Entity Relationship Diagram

This diagram represents the data models and their relationships in the Astrology API project.

```mermaid
erDiagram
    USER ||--|| USER_PROFILE : "has one"
    USER ||--o{ BIRTH_CHART : "generates many"
    USER ||--o{ DOSHA_REPORT : "has many"
    USER_PROFILE ||--o{ BIRTH_CHART : "associated with"
    USER_PROFILE ||--o{ DOSHA_REPORT : "associated with"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role
        string resetPasswordToken
        date resetPasswordExpires
        date createdAt
        date updatedAt
    }

    USER_PROFILE {
        ObjectId _id PK
        ObjectId userId FK "ref: User (Unique)"
        string name
        string gender
        date dateOfBirth
        string timeOfBirth
        string city
        string state
        string country
        number coordinates_latitude "Nested: personalInfo.placeOfBirth.coordinates"
        number coordinates_longitude "Nested: personalInfo.placeOfBirth.coordinates"
        string timezone
        boolean isDeleted "Soft Delete"
        date deletedAt
        date createdAt
        date updatedAt
    }

    BIRTH_CHART {
        ObjectId _id PK
        ObjectId userId FK "ref: User"
        ObjectId profileId FK "ref: UserProfile"
        string chartName
        object chartData
        string chartImage
        date generatedAt
        boolean isDeleted "Soft Delete"
        date createdAt
        date updatedAt
    }

    DOSHA_REPORT {
        ObjectId _id PK
        ObjectId userId FK "ref: User"
        ObjectId profileId FK "ref: UserProfile"
        string doshaType
        object inputParams
        object apiResponse
        boolean isPresent
        string severity
        string_array remedies
        date cachedAt
        date expiresAt "TTL: Auto-expires (index: 0)"
        date createdAt
        date updatedAt
    }
```

## Description of Relationships

1.  **User to User Profile (1:1):** Each registered User can have exactly one associated User Profile containing their birth details. The `userId` in `UserProfile` is unique and references the `User`.
2.  **User to Birth Chart (1:N):** A User can generate multiple Birth Charts over time.
3.  **User to Dosha Report (1:N):** A User can have multiple Dosha Reports.
4.  **User Profile to Birth Chart / Dosha Report (1:N):** Birth Charts and Dosha Reports are specific to a User's profile (birth data). Both models maintain a `profileId` reference to ensure the results are linked to the correct birth information.

## Implementation Details

-   **Nested Structure:** In the `USER_PROFILE` model, `latitude` and `longitude` are physically stored within `personalInfo.placeOfBirth.coordinates`, but represented here as logical fields.
-   **Soft Deletes:** Both `USER_PROFILE` and `BIRTH_CHART` implement a soft-delete pattern using the `isDeleted` boolean field.
-   **TTL (Time To Live):** The `DOSHA_REPORT.expiresAt` field is indexed with `expires: 0`, enabling MongoDB's TTL feature to automatically remove expired reports.
