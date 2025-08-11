# KOC does AI

A minimalist AI Tools Leaderboard showcasing weekly rankings of top 5 AI tools, combined with GitHub contribution visualization.

## Features

- **Weekly Rankings**: Navigate through historical weekly rankings of AI tools
- **Position Tracking**: See how tools move up and down the rankings with change indicators
- **Weeks at Position**: Track how long each tool has held their current rank
- **GitHub Integration**: Real-time GitHub contribution calendar starting from January 2025
- **Clean Design**: Professional, read-only dashboard with consistent icon styling

## Tech Stack

- **Frontend**: React with TypeScript, Vite build tool
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Shadcn/ui component library
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   └── lib/            # Utilities and configurations
├── server/                 # Express backend
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database interface
│   └── db.ts              # Database connection
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema and types
└── README.md
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - `DATABASE_URL`: PostgreSQL connection string
   - `GITHUB_TOKEN`: GitHub API token for contribution data

3. **Run the application**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Open [http://localhost:5000](http://localhost:5000)

## API Endpoints

- `GET /api/rankings/current` - Current week's rankings
- `GET /api/rankings/week/:weekOf` - Rankings for specific week
- `GET /api/rankings/weeks` - List all available weeks
- `GET /api/rankings/weeks-at-position` - Position duration statistics
- `GET /api/github/user/:username` - GitHub user profile
- `GET /api/github/contributions/:username` - GitHub contribution data

## Database Schema

The application uses a PostgreSQL database with the following main table:

- **weekly_rankings**: Stores weekly tool rankings with rank, tool name, and week identifier
- Uses UUIDs for primary keys and ISO date strings for week tracking

## Features in Detail

### Weekly Navigation
- Navigate between current and historical weeks using arrow controls
- Shows formatted date ranges for each week
- Displays "Current Week" indicator for the most recent data

### Position Changes
- Green up arrows for tools that improved their ranking
- Red down arrows for tools that dropped in ranking
- "NEW" indicator for tools appearing for the first time

### GitHub Integration
- Custom contribution calendar implementation
- Displays contribution intensity with color coding
- Shows profile information with repository and follower counts
- Automatically loads data for username "kellyoconor"

### Performance Optimizations
- Intelligent caching with stale-time configurations
- Query optimization for faster week-to-week navigation
- Efficient data fetching with React Query

## Contributing

This is a personal project showcasing AI tool preferences. The dashboard is read-only for public visitors.

## License

Private project - All rights reserved.