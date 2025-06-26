# PDF Viewer Application

## Overview

This is a full-stack React application that provides a comprehensive PDF viewing experience with a modern, responsive interface. The application is built using React with TypeScript on the frontend, Express.js on the backend, and is designed to handle PDF document loading, viewing, and navigation with features like zoom controls, page thumbnails, and sidebar navigation.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **PDF Rendering**: PDF.js library for client-side PDF processing and rendering
- **State Management**: React Query for server state management and React hooks for local state
- **Routing**: React Router for client-side navigation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Database**: PostgreSQL (configured but not actively used in current implementation)
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Development**: Hot reload with tsx for TypeScript execution

### Database Schema
- **Users Table**: Basic user management with username/password authentication
- **Schema Location**: `shared/schema.ts` for type-safe database operations
- **Validation**: Zod schemas for runtime type validation

## Key Components

### PDF Viewing Components
1. **PDFViewer**: Main container component managing PDF state and user interactions
2. **DocumentCanvas**: Renders individual PDF pages using HTML5 canvas
3. **Toolbar**: Provides navigation controls, zoom functionality, and file operations
4. **Sidebar**: Displays page thumbnails for quick navigation

### UI Component System
- Comprehensive set of reusable UI components based on Radix UI primitives
- Consistent theming with CSS custom properties for light/dark mode support
- Accessible components following ARIA guidelines

### Storage Layer
- Abstract storage interface (`IStorage`) for data operations
- PostgreSQL database with Drizzle ORM for production
- Database schema includes users, documents, and viewing sessions tables
- Full CRUD operations for document management and viewing state persistence

## Data Flow

### PDF Loading Process
1. User selects PDF file through file input
2. File is converted to ArrayBuffer
3. PDF.js processes the document and extracts metadata
4. Document pages are rendered to canvas elements
5. Thumbnail generation for sidebar navigation

### State Management
- PDF document state managed at the PDFViewer level
- Page navigation, zoom level, and UI state handled through React hooks
- Toast notifications for user feedback
- Responsive sidebar toggle for mobile optimization

## External Dependencies

### Core Libraries
- **PDF.js**: Client-side PDF rendering and processing
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Server state synchronization
- **Drizzle ORM**: Type-safe database operations
- **Zod**: Runtime type validation

### Development Tools
- **Vite**: Fast build tool with HMR
- **TypeScript**: Static type checking
- **ESBuild**: Fast bundling for production
- **Replit Integration**: Development environment optimization

## Deployment Strategy

### Development Environment
- Replit-optimized configuration with auto-reload
- PostgreSQL module enabled for database development
- Port 5000 configured for local development
- Vite dev server with Express.js backend proxy

### Production Build
- Vite builds optimized client bundle to `dist/public`
- ESBuild bundles server code for Node.js runtime
- Static asset serving through Express.js
- Autoscale deployment target for scalability

### Environment Configuration
- Database URL configuration through environment variables
- Separate development and production build processes
- Error overlay integration for development debugging

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 26, 2025. Initial setup
- June 26, 2025. Added PostgreSQL database with Drizzle ORM
- June 26, 2025. Fixed PDF.js zoom functionality with stable version 4.8.69
- June 26, 2025. Migrated from Replit Agent to Replit environment successfully