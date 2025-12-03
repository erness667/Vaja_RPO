# Database Setup Instructions

This guide will help you set up the SQL Server database locally using Docker Compose.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

### 1. Start the Database

Open a terminal in the project root directory and run:

```bash
docker-compose up -d
```

This will:
- Download the SQL Server 2022 image (if not already present)
- Create and start a container named `vaja-rpo-sqlserver`
- Expose SQL Server on port `1433`
- Create a persistent volume for database data

### 2. Verify the Database is Running

Check if the container is running:

```bash
docker ps
```

You should see a container named `vaja-rpo-sqlserver` with status "Up".

### 3. Wait for SQL Server to be Ready

SQL Server takes about 10-30 seconds to start. You can check the logs:

```bash
docker-compose logs sqlserver
```

Wait until you see a message like: "SQL Server is now ready for client connections."

### 4. Run Database Migrations

Navigate to the Backend directory and run Entity Framework migrations:

```bash
cd Backend
dotnet ef database update
```

This will create the `vajaRPO` database and apply all migrations.

## Database Connection Details

- **Server**: `localhost,1433`
- **Database**: `vajaRPO` (created automatically by migrations)
- **Username**: `sa`
- **Password**: `VajaRPO2025!`
- **Trust Server Certificate**: `True` (required for local development)

These settings are already configured in `Backend/appsettings.json`.

## Useful Commands

### Stop the Database

```bash
docker-compose stop
```

### Start the Database (if stopped)

```bash
docker-compose start
```

### Stop and Remove Containers (keeps data)

```bash
docker-compose down
```

### Stop and Remove Containers + Volumes (deletes all data)

```bash
docker-compose down -v
```

### View Database Logs

```bash
docker-compose logs -f sqlserver
```

### Connect to SQL Server using sqlcmd (inside container)

```bash
docker exec -it vaja-rpo-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "VajaRPO2025!" -C
```

## Troubleshooting

### Port 1433 Already in Use

If you get an error that port 1433 is already in use, you can:

1. **Stop the existing SQL Server service** (if you have SQL Server installed locally)
2. **Change the port** in `docker-compose.yml`:
   ```yaml
   ports:
     - "1434:1433"  # Use port 1434 instead
   ```
   Then update `Backend/appsettings.json`:
   ```json
   "DefaultConnection": "Server=localhost,1434;Database=vajaRPO;..."
   ```

### Container Won't Start

1. Check Docker Desktop is running
2. Check logs: `docker-compose logs sqlserver`
3. Ensure you have enough disk space
4. Try removing and recreating: `docker-compose down -v && docker-compose up -d`

### Connection Timeout

- Wait longer for SQL Server to fully start (can take 30+ seconds)
- Check if the container is healthy: `docker ps` (should show "healthy" status)
- Verify the port is correct: `netstat -an | findstr 1433` (Windows) or `lsof -i :1433` (Mac/Linux)

### Password Issues

The password must meet SQL Server requirements:
- At least 8 characters
- Contains uppercase, lowercase, numbers, and special characters

If you need to change the password, update both:
1. `docker-compose.yml` (SA_PASSWORD environment variable)
2. `Backend/appsettings.json` (connection string)

Then recreate the container:
```bash
docker-compose down -v
docker-compose up -d
```

## Data Persistence

Database data is stored in a Docker volume named `sqlserver_data`. This means:
- Data persists even if you stop/remove the container
- Data is only deleted if you use `docker-compose down -v`
- The volume is shared across Docker Compose restarts

## Production Considerations

⚠️ **Important**: This setup is for **local development only**. For production:

1. Use a managed SQL Server service (Azure SQL, AWS RDS, etc.)
2. Use strong, unique passwords
3. Enable SSL/TLS encryption
4. Use connection strings from environment variables (not appsettings.json)
5. Set up proper backup strategies
6. Configure firewall rules appropriately

