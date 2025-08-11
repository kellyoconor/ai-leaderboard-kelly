# KOC does AI

## Overview

An AI Tools Leaderboard application that displays top 5 AI tools rankings on a weekly basis. The application features a minimalist, clean interface built with React and TypeScript, displaying current week rankings, historical data, and contextual position statistics. Users can view trending data, compare tool performance across weeks with "Weeks at Position" insights, and view authentic GitHub profile with real contribution data automatically loaded. The dashboard is read-only for public visitors.

## User Preferences

Preferred communication style: Simple, everyday language.
GitHub username: kellyoconor (automatically load profile without search)
Application title: "KOC does AI"
Public access: Read-only dashboard (no update functionality for visitors)

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on top of Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints for rankings management
- **Development Server**: Custom Vite integration with HMR support
- **Error Handling**: Centralized error middleware with standardized error responses

### Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Development Storage**: In-memory storage implementation with seed data for development
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple

### Database Schema
- **Weekly Rankings Table**: Stores weekly tool rankings with fields for rank, tool name, category, activity description, and week identifier
- **Schema Validation**: Zod schemas for runtime type checking and API validation
- **Data Types**: UUID primary keys, ISO date strings for week tracking, and structured ranking data

### API Structure
- **GET /api/rankings/current**: Retrieve current week's rankings
- **GET /api/rankings/week/:weekOf**: Get rankings for a specific week
- **GET /api/rankings/weeks**: List all available weeks
- **GET /api/rankings/history**: Fetch historical rankings with configurable week limit
- **GET /api/rankings/weeks-at-position**: Get contextual data showing weeks each tool spent at each position
- **POST /api/rankings**: Create or update weekly rankings (batch operation)

### Component Architecture
- **Header Component**: Centered title display ("KOC does AI")
- **Leaderboard Table**: Current week rankings display with position change indicators and trophy icon
- **GitHub Profile**: Compact profile section with GitHub icon and custom contribution calendar
- **GitHub Contributions**: Custom contribution calendar starting from January 2025 without day labels
- **Weekly Stats**: Dashboard metrics and activity summaries
- **Position Context**: "Weeks at Position" feature showing how long each tool has held their current rank

### Design System
- **Color Palette**: Black and white with neutral grays, success green, and warning amber
- **Typography**: Inter font family for clean, modern text rendering
- **Layout**: Responsive grid system with mobile-first approach
- **Components**: Consistent spacing, border radius, and shadow system

## External Dependencies

### Database & ORM
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon Database
- **drizzle-orm**: TypeScript-first ORM for type-safe database queries
- **drizzle-kit**: CLI tools for schema management and migrations

### UI Framework & Styling
- **@radix-ui/***: Accessible, unstyled UI primitives for complex components
- **tailwindcss**: Utility-first CSS framework for rapid UI development
- **class-variance-authority**: Type-safe variant API for component styling
- **clsx**: Utility for constructing className strings conditionally

### State Management & Data Fetching
- **@tanstack/react-query**: Powerful data synchronization for server state
- **wouter**: Minimalist routing library for React applications

### Form Handling & Validation
- **react-hook-form**: Performant forms with easy validation
- **@hookform/resolvers**: Validation resolvers for React Hook Form
- **zod**: TypeScript-first schema validation with static type inference

### Development Tools
- **vite**: Fast build tool with hot module replacement
- **@vitejs/plugin-react**: React support for Vite
- **tsx**: TypeScript execution environment for Node.js
- **esbuild**: Fast JavaScript bundler for production builds

### Additional Utilities
- **date-fns**: Modern JavaScript date utility library
- **lucide-react**: Beautiful and consistent icon pack
- **nanoid**: URL-safe unique string ID generator
- **cmdk**: Command menu component for search interfaces