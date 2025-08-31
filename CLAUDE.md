# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite project called "Threativator" - a standard modern React application with Hot Module Replacement (HMR) and ESLint rules. The project uses ES modules and strict TypeScript configuration.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview production build locally

## Architecture

- **Build System**: Vite with React plugin for fast development and building
- **TypeScript**: Strict mode enabled with project references (tsconfig.json references tsconfig.app.json and tsconfig.node.json)
- **Linting**: ESLint with TypeScript, React Hooks, and React Refresh plugins
- **Entry Point**: src/main.tsx renders the App component into #root element
- **Project Structure**: Standard Vite React template structure
  - `src/` - Source files
  - `public/` - Static assets
  - `index.html` - Main HTML template

## Key Configuration

- **TypeScript**: Targets ES2020, uses bundler module resolution, strict linting rules
- **ESLint**: Configured for TypeScript/React with recommended rules, ignores dist folder
- **React**: Uses React 18 with StrictMode enabled

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
