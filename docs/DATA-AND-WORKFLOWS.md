# RUSYS data and workflows

This guide covers the data model, authentication, application updates, import and export, and offline caching.
[Project README](../README.md).

## Data and security

`src/server/db.ts` manages MongoDB connections and creates missing indexes when a database is first opened. The main
collections are:

| Collection      | Purpose                                         |
| --------------- | ----------------------------------------------- |
| `groups`        | Groups, display order, and archive status       |
| `products`      | Products, yearly quantities, and change history |
| `variants`      | Group variants and their display order          |
| `user_profiles` | User profiles                                   |
| `sessions`      | Hashed session tokens and expiry times          |

Some stock changes use MongoDB transactions. The session token is stored in an `httpOnly` cookie; MongoDB stores its
SHA-256 hash. Access is limited to configured Google accounts. Development mode uses a development profile.

Configuration is passed through environment variables. Docker Compose uses `LOCALE`, `TZ`, `GOOGLE_CLIENT_ID`,
`GOOGLE_ALLOWED_USERS`, `DB`, optional `IMAGES_DIR`, and `PORT`. The database code also accepts `DB_NAME`. Local
development reads `.env.local`.

### MongoDB document model

```mermaid
erDiagram
    GROUP {
        string group PK
        number order
        boolean annual
        boolean review
        number archivedAt
    }
    PRODUCT {
        string group PK
        string name PK
        string parent
        boolean missing
        number archivedAt
    }
    VARIANT {
        string group PK
        string variant PK
        number order
        string units
    }
    YEAR_AMOUNTS {
        number year
    }
    VARIANT_AMOUNT {
        string variant
        number amount
        boolean recycled
        number expiresAt
    }
    UPDATE {
        number time
        string user
        string comment
    }
    USER_PROFILE {
        string email PK
        string name
    }
    SESSION {
        string tokenHash PK
        date expiresAt
    }

    GROUP ||--o{ PRODUCT : contains
    GROUP ||--o{ VARIANT : defines
    PRODUCT ||--o{ YEAR_AMOUNTS : has
    YEAR_AMOUNTS ||--o{ VARIANT_AMOUNT : contains
    VARIANT ||..o{ VARIANT_AMOUNT : referenced_by
    PRODUCT ||--o{ UPDATE : records
    USER_PROFILE ||..o{ SESSION : signs_in
```

`YEAR_AMOUNTS`, `VARIANT_AMOUNT`, and `UPDATE` are embedded in product documents; they are not separate collections.
Dotted relationships are logical links, not MongoDB foreign keys. Full types are defined in `src/common/data.ts`.

### Sign-in sequence

```mermaid
sequenceDiagram
    actor U as User
    participant B as Browser
    participant A as loginWithGoogle
    participant G as Google
    participant M as MongoDB
    U->>B: Choose Google sign-in
    B->>G: Request an ID or access token
    G-->>B: Token
    B->>A: Send token to Server Action
    A->>G: Verify token and audience
    G-->>A: Verified identity
    A->>A: Check email and allowed accounts
    alt Access allowed
        A->>M: Update user profile if needed
        A->>M: Store session token hash
        A-->>B: Set httpOnly session cookie
        B-->>U: Open application
    else Access denied
        A-->>B: Return sign-in error
    end
```

This follows `src/server/actions/auth.ts` and `src/server/auth/session.ts`. Protected REST requests pass through the
session check in `src/server/api/next.ts`.

## Requests and updates

The UI calls a hook or updates client state, then sends a request through a REST endpoint or Server Action. The server
checks the session and input before calling the data layer.

```mermaid
sequenceDiagram
    actor U as User
    participant UI as Feature component
    participant H as Hook or Redux state
    participant E as API or Server Action
    participant D as server/data
    participant M as MongoDB
    U->>UI: Change product or quantity
    UI->>H: Dispatch action
    H->>E: Send change
    E->>E: Check session and input
    E->>D: Call domain operation
    D->>M: Read or update documents
    M-->>D: Database result
    D-->>E: Domain result
    E-->>H: Response
    H-->>UI: Updated state
    UI-->>U: Show result
```

REST route files are in `src/app/api/v1/**/route.ts`, with handlers in `src/server/api/v1`. Shared API paths are defined
in `src/common/api/v1.ts`. Product data operations are exposed through `src/server/data/products.ts`.

## Import and export

```mermaid
flowchart LR
    DB[(products, variants, groups)] --> Data["data.json"]
    Files[(Image directory)] --> ImageFiles["images/ files"]
    Data --> Zip[ZIP archive]
    ImageFiles --> Zip
    Zip --> Parse[Read imported archive]
    Parse --> Temp[Temporary MongoDB database]
    Temp --> Backup[Backup of current database]
    Backup --> Replace[Move temporary data into main database]
    Parse --> WriteImages[Write image files]
```

`src/server/data/exportArchive.ts` defines the ZIP structure. `src/server/data/common.ts` moves collections through
temporary and backup databases during import.

## PWA and offline viewing

The application includes `public/manifest.json`, generated PWA images, an offline page, and a Service Worker route.
`pnpm assets` generates icons, splash screens, metadata, and optimized images. Registration and account-specific cache
logic are in `src/components/app/ServiceWorker`.

```mermaid
flowchart TD
    Request[GET request] --> Kind{Resource type}
    Kind -->|Public static asset| Public[Cache first]
    Public --> PublicHit{Cached?}
    PublicHit -->|Yes| CachedPublic[Return cached asset]
    PublicHit -->|No| FetchPublic[Fetch and cache]
    Kind -->|Page, RSC, API, image| Private[Network first]
    Private --> Online{Network available?}
    Online -->|Yes| Identity[Check offline/identity]
    Identity --> UserCache[Cache for current user when allowed]
    Online -->|No| CacheHit{User copy cached?}
    CacheHit -->|Yes| CachedUser[Return cached response]
    CacheHit -->|No, navigation| Offline["/offline"]
```

Previously cached responses can be viewed offline. Signing out or changing accounts clears the former user's cache.
Offline editing and later synchronization are not implemented. See the
[Service Worker guide](../src/components/app/ServiceWorker/README.md) for details.
