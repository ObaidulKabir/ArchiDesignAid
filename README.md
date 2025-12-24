# Architectural Design Assistant

A collaborative architectural design tool for project management, zoning, and interactive space planning.

## Features

- **Project Management:** Create and manage architectural projects with location and site data.
- **Zoning Hierarchy:** Define floors, major zones, and sub-zones with area constraints.
- **Design Library:** Manage standard and custom design elements (rooms, furniture).
- **Interactive Planner:** Drag-and-drop space planning with real-time area validation.
- **Collaboration:** Role-based access and reporting.

## Architecture

This project follows a modular architecture using Next.js 15 App Router.

### Tech Stack
- **Framework:** Next.js 15
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose)
- **UI:** Tailwind CSS, Lucide Icons

### Modules (`src/modules`)
- `project`: Project CRUD and metadata.
- `zoning`: Zone hierarchy and constraints.
- `library`: Design element libraries.
- `planner`: Interactive canvas logic (Frontend primarily).
- `auth`: User authentication (To be implemented).

## Getting Started

1. **Environment Setup:**
   Copy `.env.example` to `.env.local` (create it if missing) and add your MongoDB URI:
   ```
   MONGODB_URI=mongodb://localhost:27017/archi-design-aid
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

## Database Schema
See `ARCHITECTURE.md` for detailed schema and module breakdown.
