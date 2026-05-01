# Corporate Invoice Management System

A high-performance, full-stack dashboard for managing corporate relationships and billing cycles. Built with a focus on **Type Safety**, **Separation of Concerns**, and **Reactive State Management**.

---

## Quick Start

### Prerequisites

- **PHP 8.2+** & **Composer**
- **Node.js 20+** & **Angular CLI**
- **SQLite**

### Backend Setup (Symfony 7)

```bash
cd backend
composer install

# Initialize the SQLite database
php bin/console doctrine:database:create
php bin/console doctrine:schema:update --force

# Clear metadata cache to sync Entity changes
php bin/console cache:clear

# Start the development server
symfony server:start --port=8000
```

### Frontend Setup (Angular 19+)

```bash
cd frontend
npm install
ng serve --port=4200
```

**Access the dashboard at:** http://localhost:4200

---

## 🏗️ Software Architecture

This project adheres to professional engineering standards to ensure the codebase remains maintainable as the system scales.

### 1. Separation of Concerns (SoC)

We follow a strict **Interface → Service → Component** hierarchy:

- **Interfaces**: Define immutable data contracts, ensuring the Frontend and Backend are always in sync.
- **Services**: Encapsulate all business logic and API communication. Components never interact with the `HttpClient` directly.
- **Components**: Purely presentational layers that subscribe to data streams.

### 2. Reactive State Management

Instead of manual variable updates, the system utilizes **RxJS BehaviorSubjects** within Services:

- **Single Source of Truth**: The `ClientService` and `InvoiceService` maintain the "live" state of the application.
- **Zero-Refresh UX**: Using the `tap` operator, the UI updates instantly when a new record is created without requiring a page reload.

### 3. Encapsulation & Security

- **Private Subjects**: Data streams are private to the service, exposed only as read-only Observables.
- **Symfony Serialization Groups**: We use `#[Groups]` attributes (e.g., `client:read`, `client:write`) to prevent "leaky" APIs and control exactly which fields are exposed.

---

##  System Modules

### Clients Module

- **Persistence**: Full CRUD support including name, email, company, and address.
- **Real-time Filtering**: Reactive search bar that filters the table locally from the data stream.

### Invoices Module

- **Relational Logic**: Invoices are linked to corporate clients via foreign keys.
- **Dynamic UI**: Includes a "Generate Invoice" form with auto-calculating summaries and status badges (Draft, Sent, Paid).

---

##  Tech Stack

| Layer    | Technology                                          |
|----------|-----------------------------------------------------|
| Frontend | Angular (Standalone Components, RxJS, Tailwind CSS, Lucide Icons) |
| Backend  | Symfony 7 (Doctrine ORM, API Platform patterns)    |
| Database | SQLite (`var/data.db`)                              |
| Environment | WSL / Docker Ready                                |

---

##  Database Schema (SQLite)

### Client Entity

| Field   | Type      | Constraint                 |
|---------|-----------|----------------------------|
| id      | INTEGER   | Primary Key (AI)           |
| name    | VARCHAR   | Not Null                   |
| email   | VARCHAR   | Unique, Not Null           |
| address | TEXT      | Nullable                   |

### Invoice Entity

| Field     | Type      | Constraint                 |
|-----------|-----------|----------------------------|
| id        | INTEGER   | Primary Key (AI)           |
| client_id | INTEGER   | Foreign Key → Client       |
| amount    | NUMERIC   | Total Value                |
| status    | VARCHAR   | Default: 'Draft'           |

---

##  Key Features

**Type-Safe Full Stack** — Interfaces ensure consistency between frontend and backend

**Reactive Updates** — Real-time UI changes powered by RxJS

**RESTful API** — Symfony API Platform with structured endpoints

**Relational Data** — Proper foreign key relationships for client-invoice links

**Responsive Design** — Tailwind CSS for modern, mobile-friendly interfaces

**Zero Boilerplate** — Angular Standalone Components reduce configuration

---

##  API Endpoints

The backend exposes RESTful endpoints for managing clients and invoices:

```
GET    /api/clients         — Fetch all clients
POST   /api/clients         — Create a new client
GET    /api/clients/{id}    — Fetch a specific client
PATCH  /api/clients/{id}    — Update a client
DELETE /api/clients/{id}    — Delete a client

GET    /api/invoices        — Fetch all invoices
POST   /api/invoices        — Create a new invoice
GET    /api/invoices/{id}   — Fetch a specific invoice
PATCH  /api/invoices/{id}   — Update an invoice
DELETE /api/invoices/{id}   — Delete an invoice
```

---

##  Project Structure

```

├── backend/
│   ├── src/
│   │   ├── Entity/          — Doctrine ORM Entities
│   │   ├── Repository/      — Data access layer
│   │   ├── Controller/      — API endpoints
│   │   ├── Service/         — Business logic
│   │   └── Serializer/      — Custom serialization
│   ├── config/
│   ├── var/
│   │   └── data.db          — SQLite database
│   └── composer.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── models/      — TypeScript interfaces
│   │   │   ├── services/    — RxJS-based services
│   │   │   ├── components/  — Angular components
│   │   │   
│   │   └── main.ts
│   ├── angular.json
│   └── package.json
└── README.md
```

---

##  Development Workflow

### Adding a New Feature

1. **Backend**: Create Entity → Repository → Controller
2. **Frontend**: Define Interface → Build Service (with BehaviorSubject) → Create Component
3. **Test**: Verify API endpoints with REST client (Postman, Insomnia)
4. **UI**: Wire service to component with async pipe

### Example: Adding a "Company" field to Clients

**Backend:**
```php
#[ORM\Column(length: 255)]
private string $company;
```

**Frontend:**
```typescript
export interface Client {
  id: number;
  name: string;
  email: string;
  company: string;
}
```

---


## Documentation

- [Symfony Documentation](https://symfony.com/doc/current/index.html)
- [Angular Documentation](https://angular.io/docs)
- [RxJS Guide](https://rxjs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)


