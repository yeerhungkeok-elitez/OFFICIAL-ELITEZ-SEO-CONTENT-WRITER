# SEO Growth Engine — v1

AI-powered, people-first SEO content engine built with React + Vite + Tailwind CSS.
No backend. No API keys. Runs 100% in your browser with localStorage.

---

## Quick Start (Windows / VS Code)

### 1. Open the project in VS Code
Right-click the "SEO Content Writer" folder on your Desktop → **Open with Code**

### 2. Open the Terminal in VS Code
Press `Ctrl + `` ` (backtick) — or go to **Terminal → New Terminal**

### 3. Install dependencies (only needed once)
```
npm install
```

### 4. Start the app
```
npm run dev
```

### 5. Open in browser
Go to: **http://localhost:5173**

---

## How to Use the 6-Step Workflow

| Step | Page | What it does |
|------|------|--------------|
| 1 | Project Setup | Enter company name, services, audience, country, tone |
| 2 | Keyword Opportunities | Generate and score keyword clusters |
| 3 | Content Brief | Build H1, H2s, FAQs, meta tags, CTA, internal links |
| 4 | SEO Writer | Generate a full business-relevant SEO article |
| 5 | Score Checker | Score across 5 dimensions (SEO, Helpful, Readability, Conversion, Links) |
| 6 | WordPress Export | Get HTML, schema markup, image alts, LinkedIn caption |

---

## Project Structure

```
src/
├── context/
│   └── ProjectContext.jsx     — Global state + localStorage sync
├── lib/
│   ├── storage.js             — localStorage helpers
│   ├── seoLogic.js            — Keyword generation + scoring engine
│   ├── briefLogic.js          — Content brief generator
│   ├── contentWriter.js       — SEO article generator
│   ├── scoreChecker.js        — 5-dimension content scorer
│   └── exportLogic.js         — WordPress HTML + schema exporter
├── components/
│   ├── layout/
│   │   ├── Layout.jsx         — App shell
│   │   └── Sidebar.jsx        — Navigation + project switcher
│   └── ui/
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Badge.jsx
│       └── CopyButton.jsx
└── pages/
    ├── Dashboard.jsx
    ├── ProjectSetup.jsx
    ├── KeywordOpportunities.jsx
    ├── ContentBriefGenerator.jsx
    ├── SEOContentWriter.jsx
    ├── ContentScoreChecker.jsx
    └── WordPressExport.jsx
```

---

## How to Edit the App

### Change keyword templates
Edit `src/lib/seoLogic.js` — the `generateKeywords()` function

### Change content templates
Edit `src/lib/contentWriter.js` — the section writer functions

### Change scoring logic
Edit `src/lib/scoreChecker.js` — individual score functions

### Add a new page
1. Create `src/pages/YourPage.jsx`
2. Add the route in `src/App.jsx`
3. Add the nav link in `src/components/layout/Sidebar.jsx`

---

## Build for Production

```
npm run build
```
Output goes to the `dist/` folder. Upload that folder to any static host (Vercel, Netlify, etc.).
