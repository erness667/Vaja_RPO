## Sprint 3 README

### Fokus
- Frontend: migracija iz Tailwind na Chakra UI (zadnja izdaja), prilagoditev novih stilskih komponent in obstoječih strani (register/login, layout, CarSearch).
- Backend: implementacija JWT avtentikacije in auth endpointov (register dodan, login/refresh/logout v planu), konfiguracija `Jwt` nastavitev in zaščita API-jev.

### Status in kaj je narejeno
- Chakra UI integrirana v frontend; strani `/register` in `/login` uporabljajo nove komponente.
- Backend ima `POST /api/auth/register` z BCrypt hashingom in izdajo JWT access tokena.
- Posodobiti UI na novih komponentah (teme, layout, tipografija) in testirati flow.
- Dark mode support

### Kaj še sledi
- Dodati `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout` ter middleware za zaščito drugih virov.


### Kako zagnati (povzetek)
- DB: `docker-compose up -d`
- Backend: `cd Backend && dotnet ef database update && dotnet run`
- Frontend: `cd frontend && npm install && npm run dev`
