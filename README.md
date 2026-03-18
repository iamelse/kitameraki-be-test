# TaskApp Backend Iamelse

## 1. Prerequisites

* Node.js
* npm atau yarn
* Azure Functions Core Tools
* Azure Cosmos DB Emulator (untuk development lokal)
* Git

## 2. Clone repository

```
git clone https://github.com/<org-or-username>/taskapp-backend.git
cd taskapp-backend
```

## 3. Install dependencies
```
npm install
# atau
yarn install
```

## 4. Configure environment

Buat file .env atau gunakan local.settings.json (Azure Functions lokal):
```
{
  "IsEncrypted": false,
  "Values": {
    "COSMOS_ENDPOINT": "https://localhost:8081",
    "COSMOS_KEY": "C2y6yDjf5/R+ob0N8A7Cgv30VRDjKp...",
    "COSMOS_DATABASE_NAME": "TaskApp",
    "COSMOS_CONTAINER_NAME": "Tasks",
    "NODE_TLS_REJECT_UNAUTHORIZED": "0"
  }
}
```

`COSMOS_ENDPOINT` dan `COSMOS_KEY` untuk Cosmos Emulator atau account Azure

`NODE_TLS_REJECT_UNAUTHORIZED=0` untuk bypass self-signed certificate di lokal

## 5. Running the backend locally
`func start --build`

Otomatis compile TypeScript dan hot reload saat file berubah

Endpoint tersedia di `http://localhost:7071/api/...`

## 6. Project Structure (singkat)
```
/functions       # Azure Functions endpoints
/config          # Cosmos client & init
/models          # TypeScript interfaces
/services        # Business logic
/repository      # Data access layer
/utils           # Helper (success/error)
```

Functions memanggil service → service panggil repository → repository ke Cosmos

success / error helper untuk konsisten response API

CRUD endpoints sudah otomatis clean dari _rid, _self, _etag, _attachments, _ts

## 7. Testing

Gunakan Postman atau HTTP client:

Endpoint tersedia:
```
POST /api/tasks → Insert Task
GET /api/tasks/{id}?organizationId=... → Get Task
PUT /api/tasks/{id}?organizationId=... → Update Task
DELETE /api/tasks/{id}?organizationId=... → Delete Task
DELETE /api/tasks/bulk?organizationId=... → Bulk Delete Tasks
```

Disarankan gunakan Postman environment dengan variable:

taskId, taskId1, taskId2, taskTitle, taskDescription, organizationId

Bulk Delete dan CRUD endpoints siap untuk testing dinamis

## 8. Repository FE

Repository FE sudah disiapkan di `https://github.com/iamelse/kitameraki-fe`