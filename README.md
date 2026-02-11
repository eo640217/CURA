# cura — Care Home Operations & Compliance Platform

cura is a full-stack web application designed to support care homes with daily operations and compliance-focused record keeping. The platform emphasizes clean backend architecture, secure data handling, and production-style development workflows.

Built using modern Java and React technologies, cura demonstrates how real-world systems manage structured data, enforce access control, handle file storage, and maintain audit-ready records.

---

## Features

- Resident and staff management with CRUD APIs  
- Care task tracking and incident reporting  
- Role-based access control for secure operations  
- Compliance-ready audit logging  
- Secure document storage using S3-compatible object storage  
- RESTful API design with OpenAPI / Swagger documentation  
- Flyway-managed database migrations  
- Containerized local development environment using Docker

---

## Tech Stack

- **Backend:** Java 17, Spring Boot, Spring Data JPA, Spring Security  
- **Frontend:** React, TypeScript  
- **Database:** PostgreSQL  
- **Storage:** AWS S3 (LocalStack for local development)  
- **Infrastructure:** Docker, Docker Compose  
- **Build Tool:** Maven  
- **API Docs:** Swagger / OpenAPI  

---

## Getting Started

### Prerequisites
- Java 17
- Docker & Docker Compose
- Maven

### Local Setup

```bash
git clone https://github.com/eo640217/cura.git
cd cura
cp .env.example .env
docker compose up -d
cd cura-api
mvn spring-boot:run
