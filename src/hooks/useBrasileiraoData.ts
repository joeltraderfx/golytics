import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/config";
import { getClubColor } from "@/lib/clubColors";
import type { TeamStats, Match } from "@/lib/teamsData";

interface ApiTeam {
  id: number;
  name: string;
  shortName?: string;
  games: number;
  goalsFor: number;
  goalsAgainst: number;
  points?: number;
  position?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  recentForm?: string[];
}

interface ApiMatch {
  id: number;
  round: number;
  dateTime: string;
  venue?: string;
  status: string;
  homeTeam: { id: number; name: string; shortName?: string };
  awayTeam: { id: number; name: string; shortName?: string };
}

function mapTeam(t: ApiTeam): TeamStats {
  const games = t.games || 1;
  return {
    id: String(t.id),
    name: t.name,
    shortName: t.shortName || t.name.slice(0, 3).toUpperCase(),
    attackStrength: t.goalsFor / games,
    defenseWeakness: t.goalsAgainst / games,
    color: getClubColor(t.name),
    form: (t.recentForm as ("W" | "D" | "L")[]) || [],
    points: t.points ?? 0,
    position: t.position ?? 0,
    games: t.games,
    wins: t.wins ?? 0,
    draws: t.draws ?? 0,
    losses: t.losses ?? 0,
    goalsFor: t.goalsFor,
    goalsAgainst: t.goalsAgainst,
  };
}

function mapMatch(m: ApiMatch): Match {
  return {
    id: String(m.id),
    homeId: String(m.homeTeam.id),
    awayId: String(m.awayTeam.id),
    date: m.dateTime,
    round: m.round,
    stadium: m.venue || "",
  };
}

interface BrasileiraoData {
  teams: TeamStats[];
  matches: Match[];
  loading: boolean;
  teamsError: string | null;
  matchesError: string | null;
  stale: boolean;
  currentRound: number;
}

export function useBrasileiraoData(): BrasileiraoData {
  const [teams, setTeams] = useState<TeamStats[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const [teamsResult, matchesResult] = await Promise.allSettled([
        fetch(`${API_BASE}/api/teams`).then((r) => {
          if (!r.ok) throw new Error("Falha ao buscar times");
          return r.json();
        }),
        fetch(`${API_BASE}/api/rounds`).then((r) => {
          if (!r.ok) throw new Error("Falha ao buscar jogos");
          return r.json();
        }),
      ]);

      if (cancelled) return;

      if (teamsResult.status === "fulfilled") {
        setTeams(teamsResult.value.data.map(mapTeam));
        if (teamsResult.value.stale) setStale(true);
        setTeamsError(null);
      } else {
        setTeamsError(
          "Não foi possível carregar os times agora. O backend pode estar indisponível ou ainda não foi configurado."
        );
      }

      if (matchesResult.status === "fulfilled") {
        setMatches(matchesResult.value.data.map(mapMatch));
        if (matchesResult.value.stale) setStale(true);
        setMatchesError(null);
      } else {
        setMatchesError("Não foi possível carregar os jogos da rodada agora.");
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentRound = matches[0]?.round || 0;

  return { teams, matches, loading, teamsError, matchesError, stale, currentRound };
}
