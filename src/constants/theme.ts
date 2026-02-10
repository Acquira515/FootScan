// --- THEME CONSTANTS ---
export const THEME = {
  bg: "bg-slate-950",
  card: "bg-slate-900",
  cardHover: "hover:bg-slate-800",
  textMain: "text-white",
  textMuted: "text-slate-400",
  accent: "text-red-600",
  accentBg: "bg-red-600",
  accentBorder: "border-red-600",
  border: "border-slate-800",
  success: "text-green-500",
  chartColors: {
    primary: "#E50914", // Red
    secondary: "#F5F5F5", // White
    tertiary: "#525252", // Dark Gray
    grid: "#333333"
  }
};

// Mock Data
export const MOCK_MATCHES = [
  {
    fixture: { id: 1, date: new Date().toISOString(), status: { short: 'NS' } },
    league: { name: "Premier League", logo: "https://media.api-sports.io/football/leagues/39.png" },
    teams: {
      home: { id: 33, name: "Manchester United", logo: "https://media.api-sports.io/football/teams/33.png" },
      away: { id: 40, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png" }
    },
    goals: { home: null, away: null }
  },
  {
    fixture: { id: 2, date: new Date(Date.now() + 3600000).toISOString(), status: { short: 'NS' } },
    league: { name: "La Liga", logo: "https://media.api-sports.io/football/leagues/140.png" },
    teams: {
      home: { id: 529, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" },
      away: { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" }
    },
    goals: { home: null, away: null }
  },
  {
    fixture: { id: 3, date: new Date(Date.now() + 7200000).toISOString(), status: { short: 'NS' } },
    league: { name: "Serie A", logo: "https://media.api-sports.io/football/leagues/135.png" },
    teams: {
      home: { id: 496, name: "Juventus", logo: "https://media.api-sports.io/football/teams/496.png" },
      away: { id: 489, name: "AC Milan", logo: "https://media.api-sports.io/football/teams/489.png" }
    },
    goals: { home: null, away: null }
  }
];
