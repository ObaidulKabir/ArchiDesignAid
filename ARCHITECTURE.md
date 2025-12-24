# Architectural Design Assistant - System Architecture

## Overview
This application is a collaborative architectural design tool built with Next.js. It allows architects to manage projects, define zoning hierarchies, plan spaces interactively, and collaborate in real-time.

## Technology Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB (via Mongoose)
- **Styling:** Tailwind CSS
- **State Management:** React Context / Zustand (for client-side planner state)
- **Validation:** Zod
- **Forms:** React Hook Form

## Module Breakdown

The application is structured into the following domain modules:

### 1. Project Management (`modules/project`)
- **Responsibilities:** 
  - CRUD operations for Projects.
  - Managing project metadata (Location, Land Area, Description).
  - File attachments (Site images, maps).
- **Key Entities:** `Project`

### 2. Zoning & Spatial Structuring (`modules/zoning`)
- **Responsibilities:**
  - Defining the hierarchy of spaces (Floors -> Zones -> Sub-Zones).
  - Managing area constraints and use types.
  - Recursive structure handling.
- **Key Entities:** `Zone` (Recursive)

### 3. Design Element Library (`modules/library`)
- **Responsibilities:**
  - Maintaining the Central Design Element Library (Admin managed).
  - Managing Personal Element Libraries (User derived).
  - Storing element properties (Dimensions, Standards).
- **Key Entities:** `DesignElement`, `ElementLibrary`

### 4. Space Planner (`modules/planner`)
- **Responsibilities:**
  - Interactive canvas/grid for placing elements in zones.
  - Validation engine (Area checks, Constraint violations).
  - Real-time feedback.
- **Key Components:** `PlannerCanvas`, `ElementPalette`, `ValidationStatus`

### 5. Collaboration & Reporting (`modules/collaboration`)
- **Responsibilities:**
  - Generating reports (Space planning, Area distribution).
  - (Future) Real-time collaboration sockets.
  - Change tracking.

### 6. Authentication & User (`modules/auth`)
- **Responsibilities:**
  - User registration/login.
  - Role management (Admin, Architect).

## Database Schema Design (High Level)

### Project Collection
```json
{
  "_id": "ObjectId",
  "name": "String",
  "location": { "address": "String", "geo": [lat, lng] },
  "landArea": { "value": "Number", "unit": "String" },
  "ownerId": "ObjectId (User)",
  "collaborators": ["ObjectId (User)"],
  "createdAt": "Date"
}
```

### Zone Collection (Embedded or Referenced)
*Note: Given the hierarchical nature, we might use a materialized path or parent reference pattern, or embed zones if they don't grow indefinitely.*
```json
{
  "_id": "ObjectId",
  "projectId": "ObjectId",
  "parentId": "ObjectId (nullable for root zones like Floors)",
  "name": "String",
  "type": "String (Floor, MajorZone, SubZone)",
  "useType": "String (Residential, Commercial, etc.)",
  "areaAllocation": { "value": "Number", "type": "Absolute/Percentage" },
  "elements": [
    {
      "elementId": "ObjectId",
      "instanceProperties": { "width": "Number", "length": "Number" }
    }
  ]
}
```

### DesignElement Collection
```json
{
  "_id": "ObjectId",
  "name": "String",
  "category": "String (Bedroom, Kitchen...)",
  "defaultDimensions": { "min": "...", "max": "...", "standard": "..." },
  "isSystem": "Boolean",
  "createdBy": "ObjectId (User)"
}
```

## Folder Structure
```
src/
  app/              # Next.js App Router Pages
  components/       # Shared UI Components (Buttons, Inputs)
  lib/              # Utilities (DB connection, Helpers)
  modules/          # Domain Logic
    project/
      components/
      models/
      actions.ts
    zoning/
      ...
    library/
      ...
```
