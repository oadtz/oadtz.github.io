# Product Requirements Document (PRD): Interactive Flappy Bird Portfolio

## 1. Project Overview
**Product Name:** Flappy Bird Portfolio
**Type:** Personal Portfolio Website / Interactive Web Game
**Objective:** To showcase the professional profile of a CTO/Senior Software Engineer through an engaging, gamified experience. The site combines a fully functional "Flappy Bird" style game with standard portfolio content (About, Experience, Skills) revealed through game interactions.

## 2. Technical Architecture

### 2.1. Technology Stack
*   **Frontend Framework:** React 18+ (Functional Components, Hooks)
*   **Language:** TypeScript (Strict mode enabled)
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS (Utility-first)
*   **State Management:** React Context or Local State (for game status, score, night mode)
*   **Deployment:** Static hosting (Vercel/Netlify/GitHub Pages)

### 2.2. Project Structure
```
src/
├── components/         # Reusable UI components
│   ├── GameCanvas.tsx  # Main game rendering layer (Canvas API)
│   ├── UIOverlay.tsx   # HUD (Score, Start Screen, Game Over)
│   └── MobileControls.tsx # Touch controls for mobile
├── engine/             # Game Logic & Physics
│   ├── Bird.ts         # Bird entity (velocity, gravity, jump)
│   ├── Pipe.ts         # Pipe generation and movement logic
│   ├── Ground.ts       # Parallax ground scrolling
│   ├── Physics.ts      # Collision detection (AABB)
│   └── Constants.ts    # Game tuning (gravity, speed, dimensions)
├── sections/           # Content Modules (Modals)
│   ├── Home.tsx
│   ├── About.tsx
│   ├── Experience.tsx
│   ├── Skills.tsx
│   ├── Portfolio.tsx
│   ├── Certifications.tsx
│   └── Contact.tsx
├── hooks/              # Custom Hooks
│   └── useInput.ts     # Keyboard/Touch event listeners
└── App.tsx             # Main entry point & Layout
```

## 3. Game Engine Specifications

### 3.1. Core Mechanics
*   **Physics Loop:** 60 FPS (using `requestAnimationFrame`).
*   **Gravity:** Constant downward acceleration applied to the Bird.
*   **Jump:** Impulse force applied upward on input (Spacebar / Tap).
*   **Scrolling:** Pipes and Ground move left at a constant speed (`GAME_SPEED`).
*   **Collision:**
    *   **Bird vs Pipe:** Triggers "Game Over".
    *   **Bird vs Ground:** Triggers "Game Over".
    *   **Bird vs Ceiling:** Clamped (cannot fly over pipes).

### 3.2. The "Pipe" System (Navigation)
Instead of standard pipes, the game generates **Content Pipes**.
*   **Visuals:** Green pipes with labels (e.g., "About", "Experience").
*   **Interaction:**
    *   Passing a pipe increments the score.
    *   **Clicking** a pipe (or pressing specific keys) pauses the game and opens the corresponding **Modal**.
    *   *Note:* The current implementation may use collision or specific triggers to open sections, or simply act as a backdrop for the menu. **Specification:** Pipes act as menu items.

### 3.3. Controls
*   **Desktop:**
    *   `Space` / `Click`: Jump / Start Game.
    *   `Enter`: Restart Game (on Game Over).
*   **Mobile:**
    *   `Tap`: Jump / Start.

## 4. UI/UX & Design System

### 4.1. Visual Style
*   **Theme:** Pixel Art / Retro Gaming.
*   **Font:** "Pixel" font (e.g., 'Press Start 2P' or similar web font).
*   **Day/Night Mode:**
    *   **Day:** Light blue sky background, bright pipes.
    *   **Night:** Dark slate background, dimmed pipes, white text borders.
    *   **Toggle:** A UI switch to flip between modes dynamically.

### 4.2. Responsive Design
*   **Canvas:** Resizes to fit the window (`window.innerWidth`, `window.innerHeight`).
*   **Modals:**
    *   **Desktop:** Centered cards with fixed max-width.
    *   **Mobile:** Full-width/height or high-percentage width with scrollable content.

## 5. Content Modules (Specifications)

Each section is displayed as a modal overlay when triggered.

### 5.1. Home (Start Screen)
*   **Elements:** Title ("Thanapat Pirmphol"), Subtitle ("CTO & Software Engineer"), "Press Space to Start".
*   **Behavior:** Hidden once the game loop starts.

### 5.2. About Me
*   **Layout:** Vertical stack (Mobile) / Horizontal split (Desktop).
*   **Content:**
    *   **Profile Photo:** Circular, centered at the top.
    *   **Bio:** Professional summary highlighting CTO role, WAND Framework invention, and ethical tech philosophy.
    *   **Scroll:** `max-h-[80vh]` with `overflow-y-auto`.

### 5.3. Experience
*   **Layout:** Vertical timeline or grid.
*   **Data Points:** Role, Company, Date Range, Description.
*   **Specific Data:**
    *   Water Ledger Global (CTO)
    *   Civic Ledger (Senior Engineer)
    *   4-ti Co. Ltd. (Lead Engineer)
    *   Aetna (Senior Manager)
    *   Adastra (Consultant)
    *   *Historical:* Unilode, ExxonMobil, Softscape, Progress Info.

### 5.4. Skills
*   **Layout:** Categorized Grid.
*   **Categories:**
    *   **Emerging Tech:** Generative AI, LLM, Ollama, Cursor.
    *   **Leadership & Strategy:** WAND Framework, Strategic Planning, Team Leadership.
    *   **Blockchain:** Smart Contracts, Solidity, DLT.
    *   **Tech Stack:** NodeJS, TypeScript, React, Python, Go.
    *   **Data & Cloud:** SQL/NoSQL, AWS, Azure, Docker.

### 5.5. Portfolio
*   **Layout:** Grid of Project Cards.
*   **Card Content:**
    *   **Title:** Project Name (e.g., "TapIn").
    *   **Role:** e.g., "Creator", "CTO".
    *   **Summary:** 2-3 line description of the project value.
    *   **Link:** "VIEW PROJECT >" (External URL).
*   **Projects:** Water Ledger, TapIn, Unilode's ACID, Rikai.

### 5.6. Certifications
*   **Layout:** List or Grid.
*   **Content:** Certified Blockchain Developer (CBDE), etc.

### 5.7. Contact
*   **Content:** Email (`t.pirmphol@gmail.com`), LinkedIn URL, GitHub URL, Phone.

## 6. Assets & SEO

### 6.1. Assets
*   `profile.jpg`: Professional headshot.
*   `favicon.png`: Pixel art icon.
*   `og-preview.png`: Gameplay screenshot (Bird flying past pipes) for social sharing.

### 6.2. SEO & Meta Tags
*   **Title:** "Thanapat Pirmphol - CTO & Software Engineer | Interactive Portfolio"
*   **Meta Description:** "Experienced Software Engineer with expertise in blockchain... Interactive portfolio with unique game interface."
*   **Open Graph (OG):**
    *   `og:type`: website
    *   `og:image`: `/og-preview.png`
    *   `og:title`: [Same as Title]
    *   `og:description`: [Same as Description]

## 7. Implementation Guidelines for Developers
1.  **Setup:** Initialize Vite project with React/TypeScript.
2.  **Canvas Loop:** Implement the `GameCanvas` component first to establish the render loop.
3.  **Entities:** Create classes for `Bird` and `Pipe` to manage state independent of React rendering (for performance).
4.  **Integration:** Use `useEffect` in `GameCanvas` to hook the game loop. Use React State to toggle the `isNightMode` and `currentSection` (modal) visibility.
5.  **Styling:** Use Tailwind for all overlay UI (Modals, HUD). Keep Canvas for game elements only.
