# LearningOps Tracker

**A collaborative learning operating system designed to turn self-study into an engineering sprint.**

![Dashboard Preview](https://via.placeholder.com/1200x600?text=LearningOps+Dashboard+Preview)

## 📌 Project Overview

**LearningOps Tracker** is a React-based single-page application (SPA) built to solve the consistency problem in self-directed technical upskilling. Unlike standard to-do lists, this application treats learning like a product operation—enforcing accountability, measuring velocity, and providing data-driven feedback loops.

It is designed for two collaborators (e.g., a "Curriculum Lead" and an "Accountability Lead") to track progress through a rigorous 14-week Data Analytics roadmap.

## 🚀 Key Features

### 1. The Accountability Engine
*   **Automated Rules:** The system runs a rules engine on every state change. If a task deadline is missed, the system automatically generates a "Compensation Task" due the next day, simulating production incident remediation.
*   **Velocity Tracking:** Real-time visualization of completion rates vs. assigned volume.

### 2. Performance Feedback
*   **Deterministic Insights:** Real-time analysis of study logs to generate velocity intensity scores (Low, Moderate, Elite) without external API dependencies.
*   **Syllabus Tracking:** Built-in standard templates for Data Analytics roadmaps.

### 3. Data-Driven Dashboard
*   **KPI Monitoring:** Tracks hours logged, consistency streaks, and subjective mastery scores.
*   **Visual Analytics:** Uses `Recharts` to render velocity trends, skill topology radar charts, and burn-up charts.

### 4. Capstone Readiness Index
*   **Artifact Tracking:** A specialized module to track evidence of competency (GitHub links, deployed dashboards) across 5 core dimensions (Data Sourcing, Cleaning, Analysis, Visualization, Communication).

## 🛠️ Tech Stack

*   **Frontend:** React 18 (Hooks, Context, Custom Hooks)
*   **Styling:** Tailwind CSS (Responsive, Clean UI)
*   **Visualization:** Recharts
*   **Persistence:** LocalStorage (Custom `useLocalStorage` hook for client-side persistence)
*   **Type Safety:** TypeScript

## 🧠 Skills Demonstrated

This project serves as a demonstration of **Senior Product Engineering** and **UX Design** capabilities:

1.  **Systems Thinking:** The application isn't just a CRUD app; it implements a logic layer (the Rules Engine) that enforces business rules (accountability) automatically.
2.  **Complex State Management:** Orchestrating interaction between multiple data domains (Syllabus, Logs, Scores, User Profiles) while maintaining performance.
3.  **Zero-Dependency Architecture:** Building robust, self-contained logic that runs entirely in the browser without backend reliance.
4.  **Data Visualization:** Selecting the *right* visualizations to communicate progress effectively, rather than just displaying raw numbers.
5.  **Professional Polish:** A focus on "Audit-Ready" code structure, clean component architecture, and a minimalist, distraction-free UI.

## 💻 Getting Started

### Prerequisites
*   Node.js (v16+)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/learningops-tracker.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the application:
    ```bash
    npm start
    ```

## 📂 Project Structure

```bash
src/
├── components/       # UI Components (Dashboard, Tracker, Syllabus, etc.)
├── hooks/            # Custom hooks (useLocalStorage)
├── types/            # TypeScript interfaces
└── App.tsx           # Main application logic & Rules Engine
```

---

*Designed and engineered by Uwabor Collins*
