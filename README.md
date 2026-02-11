# CURA
cura is a full-stack web application designed to help care homes manage daily operations and maintain compliance through structured workflows, secure data storage, and audit-ready records.

The platform provides tools for managing residents, staff, care tasks, incident reporting, and document storage, with a strong focus on data integrity, traceability, and scalability.

Built as a modern Java + React system, cura follows real-world backend patterns such as database migrations, role-based access control, secure file handling via cloud storage, and containerized infrastructure.

Key Features

Residents & Staff Management
CRUD APIs for managing resident profiles and staff accounts with role-based permissions.

Care Tasks & Incident Reporting
Track daily care tasks, record incidents, and maintain structured operational logs.

Compliance-Ready Audit Trail
Database-backed audit records to support traceability and regulatory review.

Secure Document Storage
File uploads handled via cloud object storage (S3-compatible) with metadata persisted in PostgreSQL.

RESTful API Architecture
Cleanly designed REST endpoints documented with OpenAPI / Swagger.

Database Migrations & Data Integrity
Flyway-managed schema migrations to ensure consistent environments across deployments.

Containerized Development Environment
Docker-based local setup using PostgreSQL and LocalStack for production-like workflows.

Tech Stack

Backend: Java 17, Spring Boot, Spring Data JPA, Flyway, Spring Security

Frontend: React, TypeScript, modern component-based UI

Database: PostgreSQL

Cloud / Storage: AWS S3 (via LocalStack for local development)

Infrastructure: Docker, Docker Compose

Tooling: Maven, OpenAPI (Swagger)

Architecture Highlights

Environment-based configuration with secure secret management

Separation of concerns between API, persistence, and infrastructure layers

Scalable foundation designed to evolve into multi-tenant and event-driven workflows
