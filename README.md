# helloworld

A simple Hello World API built with Express and Node.js.

## Installation

```bash
npm install
```

## Running the API

```bash
npm start
```

The API will start on port 3000 (or the PORT environment variable if set).

## Endpoints

- `GET /` - Returns a Hello World message
  ```json
  {
    "message": "Hello World!"
  }
  ```

- `GET /health` - Health check endpoint
  ```json
  {
    "status": "OK"
  }
  ```

## Example Usage

```bash
# Using curl
curl http://localhost:3000/

# Response
{"message":"Hello World!"}
```
