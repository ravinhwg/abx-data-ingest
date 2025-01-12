# Drug Data Collection

A local application for collecting and managing drug data.

## Table of Contents

- Installation
- Usage
- Scripts
- API Endpoints
- Testing
- License

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/drug-data-collection.git
    cd drug-data-collection
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Seed the database:
    ```sh
    npm run seed
    ```

## Usage

1. Start the server:
    ```sh
    npm start
    ```

2. Open your browser and navigate to `http://localhost:3000`.

## Scripts

- `npm start`: Start the server.
- `npm run dev`: Start the server in development mode with nodemon.
- `npm run seed`: Seed the database.
- `npm test`: Run tests with coverage.
- `npm run build:ncc`: Build the project using ncc.
- `npm run build:pkg`: Package the application.
- `npm run clean`: Clean the dist.

## API Endpoints

- **POST /api/save-data**: Save new data.
- **GET /api/get-data**: Fetch paginated data.
- **PUT /api/update-data/:id**: Update data by ID.
- **DELETE /api/delete-data/:id**: Delete data by ID.

## Testing

To run tests, use the following command:
```sh
npm test
```
License
This project is licensed under the MIT License.
