# Baroque Frontend

Vue 3 + Quasar frontend for the Claude API Usage Leaderboard.

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app runs at http://localhost:9000

## Environment

Create a `.env` file:

```
API_URL=http://localhost:8000
```

## Pages

- `/register` - Enter API key ID and display name
- `/leaderboard` - View rankings by category and model
- `/stats` - Personal usage stats and trends

## Build for Production

```bash
npm run build
```

Output goes to `dist/spa/`.
