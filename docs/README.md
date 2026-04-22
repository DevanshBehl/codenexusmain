# Webinar Module

## Overview
Virtual seminar/ webinar management system for companies to conduct live sessions with students.

## Features
- Schedule webinars with target universities
- Set duration and meeting links
- Track attendee participation
- Real-time messaging in webinars
- Permission-based speaking control
- Attendee analytics

## Theory & Flow

### Webinar Creation Flow
```mermaid
sequenceDiagram
    participant Company
    participant Controller
    participant Service
    participant Prisma
    
    Company->>Controller: POST /webinars
    Controller->>Service: createWebinar()
    Service->>Prisma: Validate company
    Prisma-->>Service: Company
    alt No company profile
        Service-->>Controller: Error 403
    end
    Service->>Service: Parse date + time
    Service->>Prisma: Create webinar with target universities
    Prisma-->>Service: Webinar
    Service-->>Controller: Webinar object
    Controller-->>Company: 201 Created
```

### Join Webinar Flow
```mermaid
sequenceDiagram
    participant User
    participant Controller
    participant Service
    participant Prisma
    
    User->>Controller: POST /webinars/:id/join
    Controller->>Service: joinWebinar()
    Service->>Prisma: Find webinar
    Prisma-->>Service: Webinar
    Service->>Prisma: Check existing attendance
    alt First time joining
        Service->>Prisma: Create attendee record
    end
    alt Previously left
        Service->>Prisma: Update leftAt to null
    end
    Service-->>Controller: Attendee record
    Controller-->>User: 200 OK
```

### Permission Management Flow
```mermaid
sequenceDiagram
    participant Host
    participant Controller
    participant Service
    participant Prisma
    
    Host->>Controller: POST /webinars/:id/grant
    Controller->>Service: grantPermission()
    Service->>Prisma: Verify attendee
    Prisma-->>Service: Attendee
    Service->>Prisma: Update hasPermissionToSpeak
    Prisma-->>Service: Updated
    Service-->>Controller: 200 OK
    
    Host->>Controller: POST /webinars/:id/revoke
    Controller->>Service: revokePermission()
    Service->>Prisma: Update permission
    Service-->>Controller: 200 OK
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/webinars` | List webinars |
| GET | `/webinars/:id` | Get webinar details |
| POST | `/webinars` | Create webinar |
| PATCH | `/webinars/:id` | Update webinar |
| DELETE | `/webinars/:id` | Delete webinar |
| POST | `/webinars/:id/join` | Join webinar |
| POST | `/webinars/:id/leave` | Leave webinar |
| GET | `/webinars/:id/attendees` | List attendees |
| POST | `/webinars/:id/grant` | Grant speaking permission |
| POST | `/webinars/:id/revoke` | Revoke speaking permission |
| GET | `/webinars/:id/messages` | Get chat messages |
| POST | `/webinars/:id/messages` | Send message |

## Attendee Roles
- `VIEWER` - Can only watch
- `SPEAKER` - Can speak (granted by host)
- `HOST` - Can manage permissions

## File Structure

```
webinar/
├── webinar.controller.ts  # HTTP handlers
├── webinar.routes.ts      # Route definitions
├── webinar.schema.ts      # Zod validation schemas
└── webinar.service.ts     # Business logic
```
