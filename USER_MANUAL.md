# ArchiDesignAid User Manual

Welcome to the **ArchiDesignAid** user manual. This guide will help you understand how to install, configure, and effectively use the Architectural Design Assistant application.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Running the Application](#running-the-application)
3. [User Interface Overview](#3-user-interface-overview)
4. [Feature Guide](#4-feature-guide)
   - [Project Management](#project-management)
   - [Zoning Hierarchy](#zoning-hierarchy)
   - [Space Planner](#space-planner)
   - [Design Element Library](#design-element-library)
5. [Step-by-Step Workflow](#5-step-by-step-workflow)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Introduction

**ArchiDesignAid** is a collaborative architectural design tool built for architects and designers. It streamlines the early stages of design by allowing you to:
- Manage multiple projects with specific site data.
- Define complex zoning hierarchies (Floors > Zones > Sub-zones).
- Interactively plan spaces using a drag-and-drop interface.
- Validate designs against area constraints in real-time.

---

## 2. Getting Started

### Prerequisites
Before running the application, ensure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local instance or Atlas connection string)
- **Git** (for version control)

### Installation

1. **Clone the Repository**
   Open your terminal and clone the project:
   ```bash
   git clone <repository-url>
   cd ArchiDesignAid
   ```

2. **Install Dependencies**
   Install the required Node.js packages:
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env.local` file in the root directory by copying the example:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and add your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb://localhost:27017/archi-design-aid
   ```

### Running the Application

Start the development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## 3. User Interface Overview

- **Navigation Bar**: Located at the top/side, providing access to Projects, Library, and Settings.
- **Dashboard**: The landing page displaying recent projects and quick actions.
- **Canvas Area**: The main workspace in the Space Planner module for designing layouts.
- **Sidebar**: Context-aware panels for tool palettes, properties, or project navigation.

---

## 4. Feature Guide

### Project Management
The **Projects** module is the central hub for your work.
- **Create Project**: Click "New Project" and fill in details like Name, Location, and Land Area.
- **Project Dashboard**: View project summaries, access zoning tools, and enter the planner.
- **Edit/Delete**: Manage project metadata as requirements change.

### Zoning Hierarchy
Organize your project structure logically.
- **Structure**: Define a hierarchy such as `Building A -> Floor 1 -> Residential Wing -> Apartment 101`.
- **Area Units**: Each zone’s allocation can be set as `Absolute (sqm)` or `Percentage` of its container.
- **Overlapping vs Non-Overlapping Children**:
  - Use the “Overlapping children (level-separated)” option on a container zone to indicate that its children represent vertically separated levels (e.g., floors/sections that can overlap in plan).
  - Rules applied for every container (overlapping or non-overlapping):
    - `Container Area <= Sum of all non-overlapping child zones`
    - `Container Area <= Area of any overlapping child zone`
  - Practical interpretation:
    - Overlapping children do not contribute to the non-overlapping sum; each overlapping child is individually checked against the container.
    - Non-overlapping children are summed and checked collectively against the container.
- **Examples**:
  - Container = 100 sqm
    - Non-overlapping children: A=40 sqm, B=50 sqm → Sum=90 ≤ 100 OK
    - Overlapping child: C=120 sqm → 120 ≤ 100 FAIL (exceeds container)
    - Mixed: A=40, B=50 (non-overlap sum=90), C=95 (overlap) → Sum(non-overlap)=90 ≤ 100 OK; Any(overlap)=95 ≤ 100 OK
  - Percentage allocations:
    - If container = 200 sqm, child at 25% → 50 sqm; validations convert percentages to absolute against the container area.
 - **Add Sub-Zone**:
   - In the project’s Zone Hierarchy, click a zone’s “Add Sub-Zone” button.
   - Fill in the form (Name, Use Type, Area, Unit, Overlapping option) and submit.
   - The list refreshes automatically, showing your new sub-zone nested under its parent.

### Space Planner
The interactive heart of the application.
- **Drag-and-Drop**: Drag elements (furniture, rooms) from the palette onto the canvas.
- **Real-time Validation**: The planner calculates used area vs. allocated area instantly.
- **Visual Feedback**: The interface highlights overflow errors in red if you exceed zone limits.
- **Tools**: Rotate and delete elements using the toolbar above the canvas.

### Design Element Library
Manage the building blocks of your designs.
- **System Library**: Comes with standard architectural elements (beds, desks, doors).
- **Custom Elements**: (Admin/Advanced) Define new elements with specific dimensions and properties.

---

## 5. Step-by-Step Workflow

Follow this standard workflow to design a space:

1.  **Create a Project**: Go to the Projects page, click "Create New", and enter site details.
2.  **Define Zones**:
    - Open the project.
    - Create a top-level zone (e.g., "Ground Floor").
    - Add sub-zones (e.g., "Living Room", "Kitchen") with specific area allocations.
3.  **Open Planner**: Navigate to a specific sub-zone (e.g., "Living Room") and click "Open Planner".
4.  **Place Elements**:
    - Browse the element library on the left sidebar.
    - Drag furniture or fixtures onto the grid.
    - Arrange them to fit the space.
5.  **Validate**: Check the "Zone Stats" panel to ensure you are within the area limit.
6.  **Save**: Click "Save Layout" to persist your design.

---

## 6. Troubleshooting

**Issue: "Database Connection Failed"**
- Check if your MongoDB server is running.
- Verify the `MONGODB_URI` in your `.env.local` file is correct.

**Issue: "Area Limit Exceeded"**
- This is a validation warning, not a system error. It means your placed elements occupy more space than allocated for the zone. Remove elements or increase the zone's area allocation.

**Issue: Drag-and-Drop not working**
- Ensure you are using a supported desktop browser. Mobile touch events may not be fully supported in the current version.

---

*For further technical details, please refer to `ARCHITECTURE.md`.*
