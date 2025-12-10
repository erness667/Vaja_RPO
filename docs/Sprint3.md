# Sprint 3 - Chakra UI Migration & JWT Authentication

## 🎯 Fokus

### Frontend
- ✅ Migracija iz Tailwind CSS na **Chakra UI v3** (zadnja izdaja)
- ✅ Prilagoditev novih stilskih komponent
- ✅ Posodobitev obstoječih strani (`/register`, `/login`, layout, `CarSearch`)
- ✅ Dark mode podpora z `next-themes`

### Backend
- ✅ Implementacija JWT avtentikacije
- ✅ `POST /api/auth/register` z BCrypt hashingom
- 🔄 `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout` (v planu)
- 🔄 Konfiguracija JWT nastavitev in middleware za zaščito API-jev

## ✅ Status - Kaj je narejeno

### Frontend
- ✅ Chakra UI v3 integrirana v frontend
- ✅ Strani `/register` in `/login` uporabljajo nove komponente
- ✅ UI posodobljen na nove komponente (teme, layout, tipografija)
- ✅ Dark mode podpora z dinamičnim preklapljanjem
- ✅ Vse Tailwind CSS odvisnosti odstranjene
- ✅ Komponente pretvorjene na inline stiliziranje z dark mode podporo

### Backend
- ✅ `POST /api/auth/register` endpoint implementiran
- ✅ BCrypt hashing za gesla
- ✅ JWT access token izdaja
- ✅ Database migracije (`InitialCreate`, `AddUsers`)

## 📋 Kaj še sledi

### Backend
- [ ] Dodati `POST /api/auth/login`
- [ ] Dodati `POST /api/auth/refresh`
- [ ] Dodati `POST /api/auth/logout`
- [ ] Implementirati middleware za zaščito API-jev
- [ ] Dodati role-based access control (RBAC)

### Frontend
- [ ] Popolna integracija Chakra UI komponent
- [ ] Optimizacija dark mode prehajanj
- [ ] Dodatne UI izboljšave

## 🚀 Kako zagnati

### 1. Database Setup

```bash
# Start SQL Server container
docker-compose up -d

# Wait for SQL Server to be ready (10-30 seconds)
docker-compose logs -f sqlserver
```

### 2. Backend Setup

```bash
cd Backend

# Apply database migrations
dotnet ef database update

# Start the API server
dotnet run
```

API bo dostopen na `https://localhost:5001` ali `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Aplikacija bo dostopna na `http://localhost:3000`

## 📝 Database Connection Details

- **Server**: `localhost,1433`
- **Database**: `vajaRPO` (ustvarijo migracije)
- **Username**: `sa`
- **Password**: `VajaRPO2025!`
- **Trust Server Certificate**: `True`

## 🛠️ Tehnologije

- **Frontend**: Next.js 16, React 19, Chakra UI v3, next-themes
- **Backend**: .NET 8, Entity Framework Core, JWT Authentication
- **Database**: SQL Server 2022 (Docker)
