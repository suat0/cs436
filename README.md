# Set-up Guide

## Frontend
1. Navigate to the `./frontend` folder.
2. Install dependencies and build the project:
   ```bash
   npm install
   ```
## Backend
1. Navigate to the `./backend` folder.
2. Install dependencies and build the project:
   ```bash
   npm install
   ```
3. Navigate to the `./backend/src` folder.
4. Install dependencies and build the project:
   ```bash
   npm install
   ```

## Database
1. Setup new MySQL connection (e.g., MySQL Workbench), by default use username `root` and password `1234`. 
2. Run `database-schema.sql` (file located in `./backend/db_queries`)
3. Run `database-add.sql` to add instances (file located in `./backend/db_queries`)

# To Start
1. From the ./backend directory, run:
   ```bash
   node ./src/index.js
   ```
2. From the ./frontend directory, run:
   ```bash
   npm run start
   ```
3. Access the website from `http://localhost:3000/`
