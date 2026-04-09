# Portfolio Website (React + CSS)

This is a personal portfolio website built with:
- React
- Vite
- Classic CSS (no CSS frameworks)

## Tech Stack

- React 18
- Vite 5
- Plain CSS

## Project Structure

- `index.html` - App entry HTML
- `src/main.jsx` - React root mount
- `src/App.jsx` - Main portfolio component and sections
- `src/portfolioData.js` - Content data (name, links, skills, projects, etc.)
- `src/styles.css` - Full styling and theme rules
- `myphoto.jpeg` - Hero/profile image asset
- `check2.jpeg` - Checkered background texture

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Run development server

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### 3) Build for production

```bash
npm run build
```

### 4) Preview production build

```bash
npm run preview
```

## How to Update Your Portfolio Content

Edit `src/portfolioData.js`:

- `siteName` - Header logo text
- `name` - Hero name
- `title` - Hero subtitle
- `about` - About section text
- `links` - GitHub, LinkedIn, email
- `skills` - Skills cards
- `projects` - Projects list
- `experience` - Timeline cards
- `achievements` - Badge list

## Styling and Theme

- All styles are in `src/styles.css`.
- Light/Dark mode uses `body[data-theme="light|dark"]`.
- If you want to tweak spacing, typography, or button colors, update classes in `src/styles.css`.

## Notes

- This project currently uses static data from `src/portfolioData.js`.
- Contact form is UI-only and does not send data to a backend yet.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
