# Testing Product Endpoints

## Prerequisites

1. Make sure dependencies are installed:
   ```bash
   npm install
   ```

2. Set up your database connection (optional for basic testing, but required for full functionality):
   ```bash
   $env:DATABASE_URL="postgresql://user:password@localhost:5432/database_name"
   ```

3. Run database migration (if not already done):
   ```bash
   psql $env:DATABASE_URL -f migrations/init.sql
   ```

4. Start the server:
   ```bash
   node app.js
   ```

## Testing with curl (Windows PowerShell)

### 1. List all products
```powershell
curl.exe -X GET http://localhost:3000/products
```

Or using PowerShell:
```powershell
Invoke-WebRequest -Uri http://localhost:3000/products -Method GET | Select-Object -ExpandProperty Content
```

### 2. Create a new product
```powershell
curl.exe -X POST http://localhost:3000/products -H "Content-Type: application/json" -d "{\"name\":\"Laptop\",\"quantity\":10,\"price\":150000.00}"
```

Or using PowerShell:
```powershell
$body = @{name="Laptop";quantity=10;price=150000.00} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:3000/products -Method POST -Body $body -ContentType "application/json"
```

### 3. Get product by ID
```powershell
curl.exe -X GET http://localhost:3000/products/1
```

Or using PowerShell:
```powershell
Invoke-WebRequest -Uri http://localhost:3000/products/1 -Method GET | Select-Object -ExpandProperty Content
```

### 4. Test 404 (non-existent product)
```powershell
curl.exe -X GET http://localhost:3000/products/99999
```

## Using the Test Script

Run the PowerShell test script:
```powershell
.\test-endpoints.ps1
```

This will test all endpoints automatically and display the results.

## Expected Responses

### GET /products (Success)
```json
{
  "message": "Products retrieved successfully",
  "products": []
}
```

### POST /products (Success)
```json
{
  "message": "Product created successfully",
  "product": {
    "id": 1,
    "name": "Laptop",
    "quantity": 10,
    "price": "150000.00",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /products/:id (Success)
```json
{
  "message": "Product retrieved successfully",
  "product": {
    "id": 1,
    "name": "Laptop",
    "quantity": 10,
    "price": "150000.00",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /products/:id (404 Not Found)
```json
{
  "message": "Product not found",
  "error": "Product with ID 99999 does not exist"
}
```

### POST /products (Validation Error)
```json
{
  "message": "Validation error",
  "error": "Product name is required"
}
```

