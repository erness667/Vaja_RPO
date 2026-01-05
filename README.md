# superCars - Used Car Marketplace

A modern web application for buying and selling used cars, similar to avto.net and mobile.de. This platform provides a forum-style marketplace where users can browse, search, and list their vehicles for sale.

## 📸 Screenshots

![Car Search Interface](docs/images/screenshot.png)

*Quick search interface for personal vehicles with advanced filtering options*

## 🚗 Features

- **User Authentication & Profiles**: Secure user registration, login, and JWT-based authentication with refresh tokens
- **Car Listings**: Create, edit, delete, and manage car listings with detailed information
- **Advanced Search & Filtering**: Search cars by make, model, price range, year, mileage, fuel type, and seller
- **Image Gallery**: Upload, manage, and delete multiple photos for each listing with main image selection
- **Comments System**: Add, edit, and delete comments on car listings
- **Favorites/Watchlist**: Save favorite listings for later viewing with toggle functionality
- **View History**: Track recently viewed cars (last 10 per user)
- **View Count Tracking**: Automatically track how many times each car has been viewed
- **Admin Panel**: User management, role assignment, and content moderation
- **User Roles**: Support for Admin and User roles with role-based authorization
- **Price History**: Track original listing price vs current price
- **Car Dealership Management**: Create and manage car dealerships with worker/team management
  - Create dealership requests (pending admin approval)
  - Worker invitation system with accept/decline functionality
  - Worker role management (Worker/Admin roles)
  - Ownership transfer capability
  - Leave dealership functionality for workers
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 🛠️ Tech Stack

### Backend
- **C#** - Primary programming language
- **ASP.NET Core 8.0** - Web API framework
- **Entity Framework Core** - ORM for database operations
- **SQL Server 2022** - Database management system
- **JWT (JSON Web Tokens)** - Authentication mechanism
- **BCrypt** - Password hashing
- **Swagger/OpenAPI** - API documentation

### Frontend
- **Next.js** - React framework for server-side rendering and static site generation
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **Lingui** - Internationalization (i18n) support (English/Slovenian)
- **Chakra UI** - Components framework

### DevOps & Infrastructure
- **Docker** - Containerization for SQL Server
- **Docker Compose** - Multi-container orchestration

## 📁 Project Structure

```
Vaja_RPO/
├── Backend/                           # ASP.NET Web API backend
│   ├── Controllers/                   # API controllers
│   │   ├── AuthController.cs         # Authentication endpoints
│   │   ├── CarController.cs          # Car listing endpoints
│   │   ├── CarApiController.cs       # Car catalog endpoints (makes/models)
│   │   ├── UserController.cs         # User profile & admin endpoints
│   │   ├── CommentController.cs      # Comment endpoints
│   │   ├── FavouriteController.cs    # Favourite/wishlist endpoints
│   │   ├── ViewHistoryController.cs  # View history endpoints
│   │   ├── DealershipController.cs   # Dealership management endpoints
│   │   ├── ChatController.cs         # Chat/messaging endpoints
│   │   └── FriendController.cs       # Friend request endpoints
│   ├── Models/                        # Domain models
│   │   ├── User.cs                   # User entity
│   │   ├── Car.cs                    # Car listing entity
│   │   ├── CarImage.cs               # Car image entity
│   │   ├── Comment.cs                # Comment entity
│   │   ├── Favourite.cs              # Favourite entity
│   │   ├── ViewHistory.cs            # View history entity
│   │   ├── RefreshToken.cs           # Refresh token entity
│   │   ├── BlacklistedToken.cs       # Blacklisted JWT tokens
│   │   ├── CarDealership.cs          # Car dealership entity
│   │   ├── DealershipWorker.cs       # Dealership worker/team member entity
│   │   ├── Message.cs                # Chat message entity
│   │   ├── FriendRequest.cs          # Friend request entity
│   │   └── Role.cs                   # User role enumeration
│   ├── DTOs/                         # Data Transfer Objects
│   │   ├── Auth/                    # Authentication DTOs
│   │   │   ├── RegisterRequest.cs
│   │   │   ├── LoginRequest.cs
│   │   │   ├── RefreshRequest.cs
│   │   │   ├── AuthResponse.cs
│   │   │   └── UserDto.cs
│   │   ├── Car/                     # Car-related DTOs
│   │   │   ├── CarDto.cs
│   │   │   ├── CreateCarRequest.cs
│   │   │   └── UpdateCarRequest.cs
│   │   ├── CarApi/                  # External API DTOs (makes/models)
│   │   │   ├── MakeDto.cs
│   │   │   └── ModelDto.cs
│   │   ├── User/                    # User-related DTOs
│   │   │   ├── ChangePasswordRequest.cs
│   │   │   ├── UpdateProfileRequest.cs
│   │   │   ├── UpdateAvatarRequest.cs
│   │   │   └── UpdateUserRoleRequest.cs
│   │   ├── Comment/                 # Comment DTOs
│   │   │   ├── CommentDto.cs
│   │   │   ├── CreateCommentRequest.cs
│   │   │   └── UpdateCommentRequest.cs
│   │   ├── Favourite/               # Favourite DTOs
│   │   │   └── FavouriteDto.cs
│   │   └── ViewHistory/             # View history DTOs
│   │       └── ViewHistoryDto.cs
│   │   ├── Dealership/              # Dealership DTOs
│   │   │   ├── DealershipDto.cs
│   │   │   ├── CreateDealershipRequest.cs
│   │   │   ├── UpdateDealershipRequest.cs
│   │   │   ├── ApproveDealershipRequest.cs
│   │   │   ├── DealershipWorkerDto.cs
│   │   │   ├── InviteWorkerRequest.cs
│   │   │   ├── UpdateWorkerRoleRequest.cs
│   │   │   └── TransferOwnershipRequest.cs
│   │   ├── Chat/                    # Chat/messaging DTOs
│   │   └── Friend/                  # Friend request DTOs
│   ├── Services/                     # Business logic services
│   │   ├── CarDataService.cs        # Car make/model data service
│   │   ├── AutoDevApiService.cs     # External API integration
│   │   └── CarCatalogService.cs     # Car catalog service
│   ├── Helpers/                      # Helper utilities
│   │   └── AuthorizationHelper.cs   # Authorization helper methods
│   ├── Options/                      # Configuration options
│   │   ├── JwtSettings.cs           # JWT configuration
│   │   └── AutoDevSettings.cs       # External API settings
│   ├── Migrations/                   # Entity Framework migrations
│   │   └── [multiple migration files]
│   ├── wwwroot/                      # Static files and uploads
│   │   └── uploads/
│   │       ├── avatars/              # User avatar images
│   │       └── cars/                 # Car listing images
│   ├── ApplicationDbContext.cs       # Database context
│   ├── Program.cs                    # Application entry point & configuration
│   ├── appsettings.json              # Configuration file
│   ├── appsettings.Development.json  # Development configuration
│   ├── swagger.json                  # OpenAPI specification
│   └── Backend.csproj                # Project file
├── frontend/                         # Next.js frontend
│   ├── src/
│   │   ├── app/                     # Next.js app directory (pages)
│   │   │   ├── page.tsx             # Home page
│   │   │   ├── login/               # Login page
│   │   │   ├── register/            # Registration page
│   │   │   ├── create/              # Create car listing page
│   │   │   ├── profile/             # User profile page
│   │   │   ├── dealerships/         # Dealership pages
│   │   │   │   ├── create/          # Create dealership page
│   │   │   │   └── manage/          # Manage dealership page
│   │   │   └── admin/               # Admin pages
│   │   ├── components/              # React components
│   │   │   ├── auth/               # Authentication components
│   │   │   ├── car/                # Car-related components
│   │   │   ├── layout/             # Layout components
│   │   │   ├── profile/            # Profile components
│   │   │   ├── dealership/         # Dealership components
│   │   │   │   ├── DealershipRequestForm.tsx
│   │   │   │   ├── DealershipManagementPage.tsx
│   │   │   │   └── DealershipInvitationsList.tsx
│   │   │   ├── admin/              # Admin components
│   │   │   └── ui/                 # UI components
│   │   ├── lib/                    # Utilities and helpers
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   ├── types/              # TypeScript type definitions
│   │   │   └── utils/              # Utility functions
│   │   └── client/                 # API client (generated)
│   ├── public/                      # Static assets (logos, images)
│   ├── locales/                     # i18n translation files
│   │   ├── en.po / en.ts           # English translations
│   │   └── sl.po / sl.ts           # Slovenian translations
│   ├── package.json                 # Node.js dependencies
│   ├── next.config.ts               # Next.js configuration
│   ├── tsconfig.json                # TypeScript configuration
│   └── README.md                    # Frontend README
├── docs/                            # Documentation
│   ├── images/                      # Documentation images
│   │   └── screenshot.png
│   └── Sprint3.md                   # Sprint documentation
├── docker-compose.yml               # Docker Compose configuration
├── DATABASE_SETUP.md                # Database setup instructions
└── README.md                        # Main project README
```

## 🚀 Getting Started

### Prerequisites

- **.NET SDK** (8.0 or later)
- **Node.js** (18.0 or later)
- **npm** or **yarn**
- **Docker Desktop** (for SQL Server database)
- **Git** (for cloning the repository)

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Vaja_RPO
   ```

2. **Start the database** (using Docker Compose):
   ```bash
   docker-compose up -d
   ```
   Wait 10-30 seconds for SQL Server to be ready. See [DATABASE_SETUP.md](DATABASE_SETUP.md) for detailed database setup instructions.

3. **Set up the backend**:
   ```bash
   cd Backend
   dotnet restore
   dotnet ef database update
   dotnet run
   ```
   The API will be available at `http://localhost:5121` (Swagger UI: `http://localhost:5121/swagger`)

4. **Set up the frontend** (in a new terminal):
   ```bash
   cd frontend
   npm install
   # Create .env.local file
   echo "NEXT_PUBLIC_API_URL=http://localhost:5121" > .env.local
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

### Detailed Setup Instructions

#### Database Setup

The project uses **SQL Server** running in a Docker container. The easiest way to get started is using Docker Compose:

```bash
# Start SQL Server container
docker-compose up -d

# Verify it's running
docker ps
```

The database connection is pre-configured in `Backend/appsettings.json`:
- **Server**: `localhost,1433`
- **Database**: `vajaRPO` (created automatically)
- **Username**: `sa`
- **Password**: `**********`

For detailed database setup, troubleshooting, and alternative configurations, see [DATABASE_SETUP.md](DATABASE_SETUP.md).

#### Backend Setup

1. **Navigate to the Backend directory**:
   ```bash
   cd Backend
   ```

2. **Restore NuGet packages**:
   ```bash
   dotnet restore
   ```

3. **Configure the database connection** (if needed):
   
   The connection string in `appsettings.json` is already configured for Docker Compose setup. If you're using a different SQL Server instance, update:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost,1433;Database=vajaRPO;User=sa;Password=*********;TrustServerCertificate=True;"
     }
   }
   ```

4. **Run database migrations**:
   ```bash
   dotnet ef database update
   ```
   This creates the database schema and applies all migrations.

5. **Start the API server**:
   ```bash
   dotnet run
   ```
   
   The API will be available at:
   - **HTTP**: `http://localhost:5121`
   - **HTTPS**: `https://localhost:7091`
   - **Swagger UI**: `http://localhost:5121/swagger` (interactive API documentation)

### Authentication & Authorization

The API uses JWT (JSON Web Token) for authentication:

1. **Register/Login**: Users receive:
   - Access token (short-lived, typically 15-30 minutes)
   - Refresh token (long-lived, typically 7-30 days)

2. **Using the API**: Include the access token in the Authorization header:
   ```
   Authorization: Bearer <access_token>
   ```

3. **Token Refresh**: When the access token expires, use the refresh token to get a new access token via `/api/auth/refresh`

4. **Roles**: The system supports two roles:
   - **User**: Default role for all registered users
   - **Admin**: Administrative role with access to user management endpoints

5. **Authorization**: 
   - Some endpoints require authentication (marked with `[Authorize]`)
   - Owner-only endpoints require the user to be the resource owner
   - Admin-only endpoints require the Admin role

### Database Models

The application uses the following main database entities:

- **Users**: User accounts with authentication information, profile data, and roles
- **Cars**: Car listings with detailed specifications (make, model, year, price, mileage, etc.)
- **CarImages**: Images associated with car listings (with main image flag)
- **Comments**: User comments on car listings
- **Favourites**: User's favourite car listings
- **ViewHistory**: Tracks recently viewed cars per user (keeps last 10 entries)
- **CarDealerships**: Car dealership entities with owner, status, and business information
- **DealershipWorkers**: Worker/team members associated with dealerships (with roles and status)
- **Messages**: Chat messages between users
- **FriendRequests**: Friend request system for connecting users
- **RefreshTokens**: JWT refresh tokens for token rotation
- **BlacklistedTokens**: Blacklisted JWT access tokens (for logout)

All database schema changes are managed through Entity Framework Core migrations. Run `dotnet ef database update` to apply migrations.

#### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure the API endpoint**:
   
   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5121
   ```
   
   This tells the frontend where to find the backend API.

4. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The application will be available at `http://localhost:3000`

### Running Both Services

To run both backend and frontend simultaneously:

**Terminal 1** (Backend):
```bash
cd Backend
dotnet run
```

**Terminal 2** (Frontend):
```bash
cd frontend
npm run dev
```

**Terminal 3** (Database - if not already running):
```bash
docker-compose up -d
```

### Verifying the Setup

1. **Database**: Check Docker container status
   ```bash
   docker ps
   ```
   Should show `vaja-rpo-sqlserver` container running.

2. **Backend**: Visit `http://localhost:5121/swagger` - you should see the Swagger API documentation.

3. **Frontend**: Visit `http://localhost:3000` - you should see the application homepage.

### Troubleshooting

- **Database connection issues**: See [DATABASE_SETUP.md](DATABASE_SETUP.md) for troubleshooting steps.
- **Port conflicts**: If port 5121 or 3000 is in use, update the ports in `Backend/Properties/launchSettings.json` and `frontend/package.json` respectively.
- **Migration errors**: Ensure SQL Server is running and the connection string is correct before running migrations.

## 📝 API Endpoints

All endpoints are served from the backend API base URL (for local development this is typically `http://localhost:5121`).

### 🔐 Authentication (`/api/auth`)

- **POST** `/api/auth/register`  
  - **Body**: `RegisterRequest` (name, surname, email, phoneNumber, username, password)
  - **Auth**: None
  - **Description**: Register a new user account. Returns JWT access token and refresh token.

- **POST** `/api/auth/login`  
  - **Body**: `LoginRequest` (username, password)  
  - **Auth**: None (username can be email or username)
  - **Description**: Authenticate user and return JWT access token and refresh token.

- **POST** `/api/auth/logout`  
  - **Auth**: Required (Bearer token)
  - **Description**: Logout the current user, blacklist the access token, and revoke all refresh tokens.

- **POST** `/api/auth/refresh`  
  - **Body**: `RefreshRequest` (refreshToken)
  - **Auth**: None
  - **Description**: Get a new access token using a valid refresh token. Rotates the refresh token.

### 🚘 Cars (`/api/cars`)

- **POST** `/api/cars`  
  - **Body**: `CreateCarRequest` (makeId, modelId, year, firstRegistrationDate, mileage, previousOwners, fuelType, enginePower, transmission, color, equipmentAndDetails, price)
  - **Auth**: Required (Bearer token)
  - **Description**: Create a new car listing. Sets originalPrice equal to initial price.

- **GET** `/api/cars`  
  - **Query params** (optional):  
    - `page` (int, default: 1)
    - `pageSize` (int, default: 20)
    - `makeId` (string)
    - `modelId` (string)
    - `yearFrom` (int)
    - `yearTo` (int)
    - `priceFrom` (decimal)
    - `priceTo` (decimal)
    - `mileageTo` (int)
    - `fuelType` (string)
    - `search` (string) - search by brand/model name
    - `sellerId` (Guid) - filter by seller
  - **Auth**: None
  - **Description**: Get a paginated list of cars with optional filters. Returns total count and pagination info.

- **GET** `/api/cars/{id}`  
  - **Path params**: `id` (int)
  - **Auth**: None (but authenticated users get view history tracked)
  - **Description**: Get details of a specific car. Increments view count. Tracks view history for authenticated users (keeps last 10).

- **PUT** `/api/cars/{id}`  
  - **Path params**: `id` (int)
  - **Body**: `UpdateCarRequest` (same as CreateCarRequest)
  - **Auth**: Required (Bearer token, owner or admin only)
  - **Description**: Update an existing car listing. OriginalPrice is never changed.

- **DELETE** `/api/cars/{id}`  
  - **Path params**: `id` (int)
  - **Auth**: Required (Bearer token, owner or admin only)
  - **Description**: Delete a car listing and all associated images.

- **POST** `/api/cars/{id}/images`  
  - **Path params**: `id` (int)
  - **Body**: `multipart/form-data` with `files` (array of image files, max 10MB each)
  - **Auth**: Required (Bearer token, owner or admin only)
  - **Description**: Upload one or more images for a car. Supported formats: JPG, JPEG, PNG, GIF, WEBP. First image becomes main if none exists.

- **DELETE** `/api/cars/{id}/images/{imageId}`  
  - **Path params**: `id` (int), `imageId` (int)
  - **Auth**: Required (Bearer token, owner or admin only)
  - **Description**: Delete a specific car image (both file and database record).

- **PUT** `/api/cars/{id}/images/{imageId}/set-main`  
  - **Path params**: `id` (int), `imageId` (int)
  - **Auth**: Required (Bearer token, owner or admin only)
  - **Description**: Mark a specific image as the main image for a car.

### 📚 Car Catalog (`/api/car-catalog`)

- **GET** `/api/car-catalog/makes`  
  - **Auth**: None
  - **Description**: Get all available car makes.

- **GET** `/api/car-catalog/makes/search`  
  - **Query params**: `query` (string, required)
  - **Auth**: None
  - **Description**: Search car makes by name.

- **GET** `/api/car-catalog/makes/{makeId}/models`  
  - **Path params**: `makeId` (string)
  - **Auth**: None
  - **Description**: Get all models for a specific make.

### 👤 User (`/api/user`)

All endpoints in this section require authentication (Bearer token).

- **GET** `/api/user/me`  
  - **Description**: Get the profile of the currently authenticated user.

- **PUT** `/api/user/password`  
  - **Body**: `ChangePasswordRequest` (currentPassword, newPassword)
  - **Description**: Change the current user's password. Requires current password verification.

- **PUT** `/api/user/profile`  
  - **Body**: `UpdateProfileRequest` (optional name, surname, phoneNumber)
  - **Description**: Update the current user's profile details. Only provided fields are updated.

- **PUT** `/api/user/avatar`  
  - **Body**: `multipart/form-data` with `file` (image file, max 5MB)
  - **Description**: Update the current user's avatar image. Supported formats: JPG, JPEG, PNG, GIF, WEBP. Old avatar is deleted.

### 👑 Admin Endpoints (`/api/user/admin/*`)

All admin endpoints require authentication and Admin role.

- **GET** `/api/user/admin/users`  
  - **Query params** (optional):
    - `page` (int, default: 1)
    - `pageSize` (int, default: 20)
    - `search` (string) - search by name, surname, email, or username
  - **Auth**: Required (Admin only)
  - **Description**: Get paginated list of all users with optional search.

- **GET** `/api/user/admin/users/{id}`  
  - **Path params**: `id` (Guid)
  - **Auth**: Required (Admin only)
  - **Description**: Get details of a specific user by ID.

- **PUT** `/api/user/admin/users/{id}/role`  
  - **Path params**: `id` (Guid)
  - **Body**: `UpdateUserRoleRequest` (role: "User" or "Admin")
  - **Auth**: Required (Admin only)
  - **Description**: Update a user's role. Admins cannot remove their own admin role.

- **PUT** `/api/user/admin/users/{id}/profile`  
  - **Path params**: `id` (Guid)
  - **Body**: `UpdateProfileRequest` (optional name, surname, phoneNumber)
  - **Auth**: Required (Admin only)
  - **Description**: Update any user's profile details.

- **PUT** `/api/user/admin/users/{id}/avatar`  
  - **Path params**: `id` (Guid)
  - **Body**: `multipart/form-data` with `file` (image file)
  - **Auth**: Required (Admin only)
  - **Description**: Update any user's avatar image.

- **POST** `/api/user/admin/users/{id}/impersonate`  
  - **Path params**: `id` (Guid)
  - **Auth**: Required (Admin only)
  - **Description**: Generate authentication tokens for a user (admin impersonation). Returns AuthResponse.

- **DELETE** `/api/user/admin/users/{id}`  
  - **Path params**: `id` (Guid)
  - **Auth**: Required (Admin only)
  - **Description**: Delete a user. Admins cannot delete themselves.

### 💬 Comments (`/api/cars/{carId}/comments`)

- **GET** `/api/cars/{carId}/comments`  
  - **Path params**: `carId` (int)
  - **Auth**: None
  - **Description**: Get all comments for a specific car, ordered by most recent first.

- **POST** `/api/cars/{carId}/comments`  
  - **Path params**: `carId` (int)
  - **Body**: `CreateCommentRequest` (content: string)
  - **Auth**: Required (Bearer token)
  - **Description**: Create a new comment on a car listing.

- **PUT** `/api/comments/{id}`  
  - **Path params**: `id` (int)
  - **Body**: `UpdateCommentRequest` (content: string)
  - **Auth**: Required (Bearer token, owner or admin only)
  - **Description**: Update a comment. Only the comment owner or admin can update.

- **DELETE** `/api/comments/{id}`  
  - **Path params**: `id` (int)
  - **Auth**: Required (Bearer token, owner or admin only)
  - **Description**: Delete a comment. Only the comment owner or admin can delete.

### ⭐ Favourites (`/api/favourites`)

All endpoints in this section require authentication (Bearer token).

- **GET** `/api/favourites`  
  - **Description**: Get all favourite cars for the current user, ordered by most recent first.

- **POST** `/api/favourites/{carId}`  
  - **Path params**: `carId` (int)
  - **Description**: Add a car to favourites. Returns error if already favourited.

- **POST** `/api/favourites/{carId}/toggle`  
  - **Path params**: `carId` (int)
  - **Description**: Toggle favourite status (add if not exists, remove if exists). Returns current status.

- **GET** `/api/favourites/{carId}/check`  
  - **Path params**: `carId` (int)
  - **Description**: Check if a car is in the user's favourites. Returns `{ isFavourite: boolean }`.

- **DELETE** `/api/favourites/{carId}`  
  - **Path params**: `carId` (int)
  - **Description**: Remove a car from favourites.

### 📖 View History (`/api/view-history`)

All endpoints in this section require authentication (Bearer token).

- **GET** `/api/view-history`  
  - **Description**: Get the last 10 cars the authenticated user viewed, ordered by most recent first. Includes full car details and seller information.

### 🏢 Dealership Management (`/api/dealerships`)

All endpoints in this section require authentication (Bearer token) unless otherwise specified.

- **POST** `/api/dealerships`  
  - **Body**: `CreateDealershipRequest` (name, description, address, city, phoneNumber, email, website, taxNumber)
  - **Auth**: Required
  - **Description**: Create a new dealership request. Status starts as "Pending" and requires admin approval. Users can only create one dealership.

- **GET** `/api/dealerships`  
  - **Query params** (optional):
    - `status` (string: "Pending", "Approved", "Declined", "Suspended")
    - `ownerId` (Guid)
  - **Auth**: None
  - **Description**: Get all dealerships with optional filtering by status or owner.

- **GET** `/api/dealerships/{id}`  
  - **Path params**: `id` (int)
  - **Auth**: None
  - **Description**: Get details of a specific dealership by ID.

- **GET** `/api/dealerships/pending`  
  - **Auth**: Required (Admin only)
  - **Description**: Get all dealerships pending admin approval.

- **POST** `/api/dealerships/{id}/approve`  
  - **Path params**: `id` (int)
  - **Body**: `ApproveDealershipRequest` (approve: boolean, notes?: string)
  - **Auth**: Required (Admin only)
  - **Description**: Approve or decline a pending dealership request. Admin can add optional notes.

- **PUT** `/api/dealerships/{id}`  
  - **Path params**: `id` (int)
  - **Body**: `UpdateDealershipRequest` (optional fields: name, description, address, city, phoneNumber, email, website, taxNumber)
  - **Auth**: Required (Owner or Admin only)
  - **Description**: Update dealership information. Only approved dealerships can be updated (unless admin).

- **POST** `/api/dealerships/{id}/transfer-ownership`  
  - **Path params**: `id` (int)
  - **Body**: `TransferOwnershipRequest` (newOwnerId: Guid)
  - **Auth**: Required (Current owner only)
  - **Description**: Transfer ownership of a dealership to an active worker. The new owner must be an active worker. The previous owner becomes a worker automatically.

- **GET** `/api/dealerships/my`  
  - **Auth**: Required
  - **Description**: Get the current user's dealership (if they own one).

- **GET** `/api/dealerships/my/worker`  
  - **Auth**: Required
  - **Description**: Get dealerships where the current user is an active worker.

- **GET** `/api/dealerships/{id}/workers`  
  - **Path params**: `id` (int)
  - **Auth**: None
  - **Description**: Get all workers for a specific dealership.

- **POST** `/api/dealerships/{id}/workers/invite`  
  - **Path params**: `id` (int)
  - **Body**: `InviteWorkerRequest` (userId: Guid, role: "Worker" | "Admin")
  - **Auth**: Required (Owner or Dealership Admin only)
  - **Description**: Invite a user to join the dealership as a worker. Creates a pending invitation.

- **POST** `/api/dealerships/workers/{workerId}/respond`  
  - **Path params**: `workerId` (int)
  - **Body**: `boolean` (true to accept, false to decline)
  - **Auth**: Required
  - **Description**: Accept or decline a worker invitation.

- **GET** `/api/dealerships/workers/invitations/pending`  
  - **Auth**: Required
  - **Description**: Get all pending worker invitations for the current user.

- **GET** `/api/dealerships/workers/{workerId}`  
  - **Path params**: `workerId` (int)
  - **Auth**: None
  - **Description**: Get details of a specific worker by ID.

- **PUT** `/api/dealerships/workers/{workerId}/role`  
  - **Path params**: `workerId` (int)
  - **Body**: `UpdateWorkerRoleRequest` (role: "Worker" | "Admin")
  - **Auth**: Required (Owner or Dealership Admin only)
  - **Description**: Update a worker's role (promote to admin or demote to worker).

- **DELETE** `/api/dealerships/workers/{workerId}`  
  - **Path params**: `workerId` (int)
  - **Auth**: Required (Owner, Dealership Admin, or the worker themselves)
  - **Description**: Remove a worker from the dealership. Workers can remove themselves. Owners cannot be removed.

- **PUT** `/api/dealerships/workers/{workerId}/status`  
  - **Path params**: `workerId` (int)
  - **Body**: `boolean` (true to activate, false to deactivate)
  - **Auth**: Required (Owner or Dealership Admin only)
  - **Description**: Activate or deactivate a worker.

## 🧪 Testing

### Backend Tests
```bash
cd Backend
dotnet test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

If you encounter issues, have suggestions, or need help with setup, feel free to reach out:

- **Email 1**: [aljaz.ski@gmail.com](mailto:aljaz.ski@gmail.com)
- **Email 2**: [Smajilovicernes@gmail.com](mailto:Smajilovicernes@gmail.com)
- **Email 3**: [enejev.lokar07@gmail.com](mailto:enejev.lokar07@gmail.com)

We aim to respond as soon as possible and appreciate clear descriptions, screenshots, or logs when reporting problems.



## 🙏 Acknowledgments

- Inspired by avto.net and mobile.de
- Built with modern web technologies for optimal performance and user experience