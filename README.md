# Zan CMS Backoffice

A Backoffice CMS for the Zan Municipality static website.

## Running the Project

You can run this project in two ways: using Docker (recommended) or with Node.js directly on your local machine.

### 1. Using Docker (Recommended)

This is the most straightforward method as it encapsulates the entire environment.

**Prerequisites:**

*   [Docker](https://www.docker.com/get-started)
*   [Docker Compose](https://docs.docker.com/compose/install/)

**Steps:**

1.  **Create an environment file:**
    Copy the example environment file to a new `.env` file:
    ```bash
    cp .env.example .env
    ```
    You can modify the variables in `.env` if needed, but the defaults are suitable for a local setup.

2.  **Build and run the container:**
    Open a terminal in the project root and run:
    ```bash
    docker-compose build
    docker-compose up
    ```

3.  **Access the application:**
    The application will be running at [http://localhost:8080](http://localhost:8080).

### 2. Running with Node.js on your local machine

This method requires you to have Node.js and npm installed on your system.

**Prerequisites:**

*   [Node.js](https://nodejs.org/) (v20 or higher recommended, as per `Dockerfile`)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)

**Steps:**

1.  **Install dependencies:**
    Open a terminal in the project root and run:
    ```bash
    npm install
    ```

2.  **Set up the database:**
    This project uses Prisma with a SQLite database. To create the database and apply migrations, run:
    ```bash
    npx prisma migrate dev
    ```
    This will create a `data` directory with a `cms.sqlite` file.

3.  **Create an environment file:**
    If you haven't already, copy the example environment file:
    ```bash
    cp .env.example .env
    ```
    The default values should work for a local setup.

4.  **Run the application:**
    *   **For development (with auto-reloading):**
        ```bash
        npm run dev
        ```
    *   **For production:**
        First, build the TypeScript code:
        ```bash
        npm run build
        ```
        Then, start the application:
        ```bash
        npm start
        ```

    The application will be accessible at [http://localhost:8080](http://localhost:8080).