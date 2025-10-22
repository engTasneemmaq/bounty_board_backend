# Bounty Board Backend

A backend API for managing bounties, projects, and applications.

## Features

- User authentication (JWT)
- Project, role, milestone, and subtask management
- Email notifications
- API documentation (Swagger)
- Dockerized for easy deployment

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended for easiest setup)
- [Node.js](https://nodejs.org/) (v18+) (for local development)
- [PostgreSQL](https://www.postgresql.org/download/) (if not using Docker for DB)
- [pgAdmin](https://www.pgadmin.org/download/) (optional, for DB management)

---

## Quick Start (Recommended for Everyone)

**This method works for both backend and frontend developers.**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/admin-MENADevs/Bounty_Board_Project_Backend.git
   cd Bounty_Board_Project_Backend
   ```
2. **Copy and configure environment variables:**
   - Copy `.env.example` to `.env` and fill in any secrets or email credentials if needed **before running Docker or local dev**.
3. **Start everything with Docker Compose:**
   ```bash
   docker-compose up -d --build
   ```
   - This will start the backend API and a Postgres database in containers.
   - The API will be available at [http://localhost:3000](http://localhost:3000).
   - The API docs will be at [http://localhost:3000/api](http://localhost:3000/api).
4. **Stop everything:**
   ```bash
   docker-compose down
   ```

---

## Local Development (For Backend Developers)

**Use this if you want hot-reload, debugging, or to contribute code.**

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

#### Option A: Use Docker for the database only

- Start only the database container:
  ```bash
  docker-compose up -d db
  ```
- Update your `.env` to use:
  ```env
  DB_HOST=localhost
  DB_PORT=5432
  DB_USER=postgres
  DB_PASSWORD=123
  DB_NAME=bounty_board
  ```

#### Option B: Use your own local Postgres

- [Download and install PostgreSQL](https://www.postgresql.org/download/)
- (Optional) [Download pgAdmin](https://www.pgadmin.org/download/) for GUI management
- Create a database (e.g., `bounty_board`)
- Update your `.env` with your local credentials

### 3. Run the app in development mode

```bash
npm run start:dev
```

- The API will be available at [http://localhost:3000](http://localhost:3000).

---

## For Frontend Developers

- You only need the backend running (use Docker for easiest setup).
- Point your frontend app's API requests to `http://localhost:3000`.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=123 # your password goes here
DB_NAME=bounty_board
NODE_ENV=development

# Mail
MAIL_HOST=smtp.ethereal.email
MAIL_PORT=587
MAIL_USER=avis.rosenbaum@ethereal.email
MAIL_PASSWORD=319WUNUpD2zfeUgeQd
MAIL_FROM=avis.rosenbaum@ethereal.email
```

---

## Health Check

Visit [http://localhost:3000/health](http://localhost:3000/health) to check if the API is running.

---

## Testing

```bash
npm run test
npm run test:e2e
```

---

## API Documentation

Visit [http://localhost:3000/api](http://localhost:3000/api) for Swagger docs.

---

## Common Issues

- **Windows/OneDrive:** If you get file permission errors, try moving the project outside OneDrive or close all editors/terminals using the files.
- **Port in use:** If port 3000 or 5432 is in use, stop other services or change the port in `.env` and `docker-compose.yml`.
- **Database connection errors:** Make sure the database container is running and healthy. Check with `docker-compose ps`.
- **Docker troubleshooting:** If you get a database connection error, make sure the DB container is healthy and your `.env` matches the DB config.

---

## License

MIT
