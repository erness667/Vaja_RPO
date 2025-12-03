📅 Povzetek Cikla
V tem ciklu smo se osredotočili na vzpostavitev temeljev projekta, vključno z inicializacijo projekta, nastavitvijo Jire, pripravo Docker kontejnerjev, in vzpostavitvijo backend, frontend ter podatkovne baze.



🛠️ Opravljeno delo
1. Delo za nazaj – Cikel 1 

Opravljene so bile naslednje naloge:


KAN-19: prvi cikel (Dokončano) 


KAN-17: jira setup (Dokončano) 


KAN-16: project initialization (Dokončano) 


KAN-10: docker kontejnerji (Dokončano) 


KAN-18: načrtovanje (Dokončano) 

2. Delo tega tedna – Cikel 2 

Opravljene so bile naslednje naloge:


KAN-23: drugi cikel (Dokončano) 


KAN-21: backend setup (Dokončano) 


KAN-15: DB connection, shema (Dokončano) 


KAN-14: login / register (Dokončano) 


KAN-9: sestanek (Dokončano) 

💻 Tehnični dosežki
Backend (ASP.NET Core Docker)
Vzpostavljen je bil backend projekt v ASP.NET Core Docker okolju.

Vzpostavljena je bila povezava z bazo podatkov z uporabo Microsoft.EntityFrameworkCore in Microsoft.EntityFrameworkCore.SqlServer.

Definiran je bil model Car z atributi Id, Name, Brand, Year, Horsepower, in Price.

Implementirana je bila konfiguracija Dockerfile za gradnjo in objavo projekta.

Frontend
Razvita je bila stran za registracijo uporabnikov (/register) z vnosnimi polji za uporabniško ime in geslo.

Razvita je bila stran za prijavo uporabnikov (/login) z vnosnimi polji za uporabniško ime in geslo.

Podatkovna baza (DB)
Vzpostavljena je bila povezava s strežnikom SQL Server na localhost,1433 z uporabo SQL Server avtentikacije.

Ustvarjena je bila baza podatkov in tabela dbo.Cars.

🛠️ Navodila za Zagon
Prepričajte se, da imate nameščen Docker za zagon kontejnerjev.

Uporabite Dockerfile  za zgradbo in zagon backend storitve:

Bash

# Primer ukaza za zgradbo (odvisno od vaše konfiguracije)
docker build -t supercarsapi -f Backend/Dockerfile .

# Primer ukaza za zagon (odvisno od vaše konfiguracije)
docker run -d -p 8080:8080 supercarsapi
Za prijavo in registracijo obiščite:

Registracija: http://localhost:3000/register 

Prijava: http://localhost:3000/login