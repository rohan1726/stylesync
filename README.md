<![CDATA[<div align="center">

# 🎨 StyleSync

**Extract, edit, and export design tokens from any website in seconds.**

StyleSync is a powerful web-based design system extraction tool that scrapes any website, analyzes its design language — colors, typography, spacing — and presents them as editable design tokens you can fine-tune and export.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)

</div>

---

## ✨ Features

- **🔍 Website Scraping** — Enter any URL and StyleSync will crawl the page using Playwright, capturing HTML, stylesheets, and a screenshot.
- **🎨 Color Extraction** — Automatically detects the full color palette including primary, secondary, accent, neutral, and semantic colors via CSS analysis and image vibrant extraction.
- **🔤 Typography Analysis** — Identifies font families, sizes, weights, and line heights used across the page.
- **📐 Spacing Detection** — Extracts spacing scale, padding, margins, and gap values from the design.
- **✏️ Live Token Editing** — Adjust any extracted token in real-time using intuitive editors with color pickers, sliders, and inputs.
- **🔒 Token Locking** — Lock specific tokens to preserve custom overrides across re-scrapes.
- **📜 Version History** — Track every change made to your tokens with a full timeline.
- **🖼️ Live Preview** — See your design tokens applied in real-time on sample UI components.
- **📦 Multi-Format Export** — Export your design system as CSS Variables, Tailwind config, SCSS variables, or JSON tokens.

---

## 🛠️ Tech Stack

| Layer        | Technology                                                  |
| ------------ | ----------------------------------------------------------- |
| **Frontend** | React 19, TypeScript, Vite, Zustand (state management)     |
| **Backend**  | Node.js, Express, TypeScript                                |
| **Database** | SQLite via Prisma ORM                                       |
| **Scraping** | Playwright (headless browser), Cheerio (HTML parsing)       |
| **Analysis** | node-vibrant (color extraction), Sharp (image processing)   |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/stylesync.git
   cd stylesync
   ```

2. **Install all dependencies**

   ```bash
   npm run install:all
   ```

3. **Set up the database**

   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Install Playwright browsers** (required for scraping)

   ```bash
   npx playwright install chromium
   ```

5. **Start the development servers**

   ```bash
   npm run dev
   ```

   This will start both servers concurrently:

   | Service    | URL                        |
   | ---------- | -------------------------- |
   | Frontend   | http://localhost:5173       |
   | Backend    | http://localhost:3001       |
   | Health API | http://localhost:3001/api/health |

---

## 📁 Project Structure

```
stylesync/
├── client/                    # React frontend (Vite)
│   └── src/
│       ├── api/               # API client functions
│       ├── components/
│       │   ├── editors/       # Color, Typography, Spacing editors
│       │   ├── export/        # Export panel (CSS, Tailwind, SCSS, JSON)
│       │   ├── history/       # Version timeline
│       │   ├── layout/        # Header, Sidebar
│       │   └── preview/       # Live preview grid
│       ├── store/             # Zustand state management
│       ├── App.tsx            # Root component
│       └── index.css          # Design system & global styles
│
├── server/                    # Express backend
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── src/
│       ├── routes/            # API routes (scrape, tokens, export)
│       ├── services/          # Core logic
│       │   ├── scraper.ts     # Playwright web scraper
│       │   ├── colorAnalyzer.ts
│       │   ├── typographyAnalyzer.ts
│       │   ├── spacingAnalyzer.ts
│       │   └── tokenNormalizer.ts
│       └── utils/
│
├── package.json               # Root workspace config
└── tsconfig.json              # Root TypeScript config
```

---

## 📡 API Endpoints

| Method | Endpoint                  | Description                    |
| ------ | ------------------------- | ------------------------------ |
| POST   | `/api/scrape`             | Scrape a website URL           |
| GET    | `/api/tokens/:siteId`     | Get design tokens for a site   |
| PUT    | `/api/tokens/:tokenId`    | Update design tokens           |
| POST   | `/api/export`             | Export tokens in chosen format  |
| GET    | `/api/health`             | Server health check            |

---

## 🎯 Usage

1. **Enter a URL** — Paste any website URL on the landing page
2. **Wait for extraction** — StyleSync scrapes the site and analyzes design tokens
3. **Browse & Edit** — Navigate between Colors, Typography, and Spacing editors
4. **Lock tokens** — Click the lock icon on any token you want to preserve
5. **Preview** — Switch to the Preview tab to see tokens applied to sample UI
6. **Export** — Choose your format and download the design system file

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <b>Built with ❤️ using React, Express & Playwright</b>
</div>
]]>
