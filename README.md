# AI Council Project

A debate arena where you assemble a council of personas, pick strategies, and run structured rounds against an opposing team. This project combines modern web technologies with competitive debate formats to create an engaging platform for intellectual discourse.

## 📋 Overview

AI Council is a full-stack application that enables users to:
- Create and customize AI personas with distinct rhetorical styles
- Engage in team-based structured debates
- Experience real-time debate rounds with turn-based interactions
- View comprehensive results with per-round verdicts and scoring
- Analyze debate dynamics with live analytics

The project is built as a **Minor Project** combining frontend excellence with backend debate mechanics.

## 🎯 Features

### Core Features
- **Authentication & Session Management** – Secure user sessions and personalized experience
- **Multi-Step Setup Flow** – Intuitive onboarding for mode, topic, and roster selection
- **Persona Creation** – Design custom AI agents with unique perspectives and rhetorical strategies
- **Draft-Style Team Selection** – Sports-inspired team composition with opponent auto-selection
- **Strategy Configuration** – Advanced debate strategy selection with preview generation
- **Real-Time Debate UI** – Interactive turn-based debate arena with live round pairing
- **Results & Analytics** – Comprehensive post-debate analysis with per-round verdicts
- **Discussion History** – Load and replay previous debates
- **Bias Controls** – Dynamic analytics panels and debate metrics

## 🏗️ Project Structure

```
AI_Council_minor_project/
├── frontend/                    # React web client
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── data/               # Mock data and constants
│   │   ├── store/              # Zustand state management
│   │   ├── lib/                # API client and helpers
│   │   ├── App.jsx             # Main application shell
│   │   └── main.jsx            # React entry point
│   ├── public/                 # Static assets
│   ├── index.html
│   ├── README.md
│   └── package.json
├── README.md                    # This file
└── [Other project files]
```

## ���️ Tech Stack

### Frontend
- **React** – Modern UI library
- **Vite** – Fast build tool and dev server
- **Tailwind CSS** – Utility-first styling
- **Zustand** – Lightweight state management

### Development
- Node.js & npm
- ES6+ JavaScript

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API base URL (optional)**
   
   Create a `frontend/.env` file if your backend is not at the default `/api` proxy path:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   ```

## 💡 Key Concepts

### Personas
Custom AI agents that represent different viewpoints and argumentation styles. Each persona can be tailored with specific traits and rhetorical preferences.

### Debate Rounds
Structured interactions where teams present arguments, counter-arguments, and closing statements in a turn-based format.

### Scoring & Verdicts
After each round, the debate receives evaluation based on argument quality, relevance, and persuasiveness. Final scores aggregate across all rounds.

### Strategy Selection
Before debates begin, teams can select strategies that influence how their personas approach the discussion, similar to sports draft selections.

## 🎭 Inspirations

- **Competitive Debate Formats** – Oxford-style and parliamentary debate structures
- **Sports-Style Drafting** – Team composition inspired by sports draft systems
- **Role-Playing Personas** – Character-driven narratives with distinct communication styles
- **Director's Cut Editing** – Creative workflows for debate setup and customization

## 📁 File Organization

- **Components** – Modular, reusable UI building blocks
- **Data** – Mock datasets and application constants
- **Store** – Centralized state management with Zustand
- **Lib** – API client utilities and helper functions

## 🔧 Configuration

### Environment Variables

Create `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=AI Council
```

## 📝 Notes

- This is a Minor Project combining frontend development with debate mechanics
- The application follows a component-driven architecture for scalability
- State management is handled via Zustand for simplicity and performance
- Styling uses Tailwind CSS utility classes for rapid UI development

## 🤝 Contributing

When contributing to this project:
1. Maintain the existing folder structure
2. Follow React best practices and component composition patterns
3. Use consistent naming conventions
4. Keep components focused and modular
5. Document complex logic with comments

## 📞 Support

For issues or questions regarding the frontend, refer to the `frontend/README.md` for detailed component and setup information.

---

**Last Updated:** July 2026  
**Project Type:** Minor Project  
**Status:** Active Development
