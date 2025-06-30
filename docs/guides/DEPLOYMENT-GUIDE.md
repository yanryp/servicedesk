# Deployment Guide

This guide provides instructions for setting up and running the ticketing system in a local development environment.

---

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- PostgreSQL (v14 or later)
- A running PostgreSQL server

---

## 1. Database Setup

1.  **Create a Database**: Create a new PostgreSQL database for the project.

2.  **Configure Environment**: Navigate to the `backend` directory and create a `.env` file by copying the `.env.example` file.

3.  **Update Database URL**: Open the `.env` file and update the `DATABASE_URL` variable with your PostgreSQL connection string. It should look like this:
    ```
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    ```

4.  **Set JWT Secret**: In the same `.env` file, set the `JWT_SECRET` to a long, random, and secure string. This is critical for securing user sessions.

---

## 2. Backend Setup

1.  **Navigate to Backend**: Open a terminal and change the directory to `backend`.
    ```sh
    cd backend
    ```

2.  **Install Dependencies**:
    ```sh
    npm install
    ```

3.  **Run Database Migration**: Apply the Prisma schema to your database. This will create all the necessary tables and relationships.
    ```sh
    npx prisma migrate dev
    ```

4.  **Start the Backend Server**: The server will run on the port specified in your `.env` file (default is 5000).
    ```sh
    npm run dev
    ```

The backend API should now be running at `http://localhost:5000`.

---

## 3. Frontend Setup

1.  **Navigate to Frontend**: Open a **new** terminal and change the directory to `frontend`.
    ```sh
    cd frontend
    ```

2.  **Install Dependencies**:
    ```sh
    npm install
    ```

3.  **Start the Frontend Application**:
    ```sh
    npm start
    ```

The React development server will start, and the application will open in your default browser, typically at `http://localhost:3000`.

---

## Production Deployment (Conceptual)

For a production environment, the following steps would be necessary:

1.  **Build Frontend**: Create an optimized, static build of the frontend application.
    ```sh
    cd frontend
    npm run build
    ```
2.  **Serve Frontend**: Serve the contents of the `frontend/build` directory using a static web server like Nginx or a cloud service (Vercel, Netlify).

3.  **Run Backend**: Run the compiled backend code using a process manager like PM2 to ensure it runs continuously and restarts on failure.
    ```sh
    cd backend
    npm run build
    pm2 start dist/index.js --name ticketing-api
    ```
4.  **Web Server/Reverse Proxy**: Use a web server like Nginx as a reverse proxy to direct API traffic (e.g., `yourdomain.com/api`) to the Node.js backend server and serve the frontend for all other requests.
