# PandaScore API Reference

> Documentation générée pour garder en contexte toutes les possibilités de l'API PandaScore.

## Installation du SDK

```bash
npx api install "@developers-pandascore/v2#1h4i0g2jmc95krtl"
```

Le SDK est généré dans `.api/apis/developers-pandascore/`.

## Utilisation de base

```typescript
import sdk from '@api/developers-pandascore';

// Authentification avec Bearer token
sdk.auth(process.env.PANDASCORE_API_KEY);

// Exemple d'appel
const response = await sdk.get_teams({ 'page[size]': '20' });
const teams = response.data;
```

---

## Endpoints Disponibles

### 🎮 Videogames

| Méthode | Description |
|---------|-------------|
| `get_videogames()` | Liste tous les jeux vidéo supportés |
| `get_videogames_videogameIdOrSlug({ videogame_id_or_slug })` | Obtenir un jeu par ID ou slug |
| `get_videogames_videogameIdOrSlug_leagues({ videogame_id_or_slug })` | Leagues d'un jeu |
| `get_videogames_videogameIdOrSlug_series({ videogame_id_or_slug })` | Séries d'un jeu |
| `get_videogames_videogameIdOrSlug_titles({ videogame_id_or_slug })` | Titres d'un jeu |
| `get_videogames_videogameIdOrSlug_tournaments({ videogame_id_or_slug })` | Tournois d'un jeu |
| `get_videogames_videogameIdOrSlug_versions({ videogame_id_or_slug })` | Versions d'un jeu |

**Slugs CS2:** `csgo`, `cs-2`

---

### 👥 Teams (Équipes)

| Méthode | Description |
|---------|-------------|
| `get_teams(metadata?)` | Liste des équipes |
| `get_teams_teamIdOrSlug({ team_id_or_slug })` | Détails d'une équipe |
| `get_teams_teamIdOrSlug_leagues({ team_id_or_slug })` | Leagues d'une équipe |
| `get_teams_teamIdOrSlug_matches({ team_id_or_slug })` | Matchs d'une équipe |
| `get_teams_teamIdOrSlug_series({ team_id_or_slug })` | Séries d'une équipe |
| `get_teams_teamIdOrSlug_tournaments({ team_id_or_slug })` | Tournois d'une équipe |

**Paramètres courants:**
```typescript
{
  'filter[id]': '3216,3210,3455',        // Filtrer par IDs
  'filter[videogame]': 'csgo',           // Filtrer par jeu
  'search[name]': 'natus',               // Recherche par nom
  'page[size]': '50',                    // Nombre de résultats
  'page[number]': '1',                   // Numéro de page
  'sort': 'name',                        // Tri
}
```

---

### 🎯 Players (Joueurs)

| Méthode | Description |
|---------|-------------|
| `get_players(metadata?)` | Liste des joueurs |
| `get_players_playerIdOrSlug({ player_id_or_slug })` | Détails d'un joueur |
| `get_players_playerIdOrSlug_leagues({ player_id_or_slug })` | Leagues d'un joueur |
| `get_players_playerIdOrSlug_matches({ player_id_or_slug })` | Matchs d'un joueur |
| `get_players_playerIdOrSlug_series({ player_id_or_slug })` | Séries d'un joueur |
| `get_players_playerIdOrSlug_tournaments({ player_id_or_slug })` | Tournois d'un joueur |

---

### ⚔️ Matches

| Méthode | Description |
|---------|-------------|
| `get_matches(metadata?)` | Liste tous les matchs |
| `get_matches_past(metadata?)` | Matchs terminés |
| `get_matches_running(metadata?)` | Matchs en cours |
| `get_matches_upcoming(metadata?)` | Matchs à venir |
| `get_matches_matchIdOrSlug({ match_id_or_slug })` | Détails d'un match |
| `get_matches_matchIdOrSlug_opponents({ match_id_or_slug })` | Adversaires d'un match |

**Paramètres courants:**
```typescript
{
  'filter[videogame]': 'csgo',
  'filter[status]': 'running',           // not_started, running, finished
  'sort': 'scheduled_at',                // Tri par date
  'sort': '-scheduled_at',               // Tri inverse (récent d'abord)
  'page[size]': '30',
}
```

---

### 🔴 Lives (Matchs en direct)

| Méthode | Description |
|---------|-------------|
| `get_lives(metadata?)` | Matchs actuellement en live avec données WebSocket |

---

### 🏆 Leagues

| Méthode | Description |
|---------|-------------|
| `get_leagues(metadata?)` | Liste des leagues |
| `get_leagues_leagueIdOrSlug({ league_id_or_slug })` | Détails d'une league |
| `get_leagues_leagueIdOrSlug_matches({ league_id_or_slug })` | Matchs d'une league |
| `get_leagues_leagueIdOrSlug_matches_past({ league_id_or_slug })` | Matchs passés |
| `get_leagues_leagueIdOrSlug_matches_running({ league_id_or_slug })` | Matchs en cours |
| `get_leagues_leagueIdOrSlug_matches_upcoming({ league_id_or_slug })` | Matchs à venir |
| `get_leagues_leagueIdOrSlug_series({ league_id_or_slug })` | Séries d'une league |
| `get_leagues_leagueIdOrSlug_tournaments({ league_id_or_slug })` | Tournois d'une league |

---

### 📅 Series

| Méthode | Description |
|---------|-------------|
| `get_series(metadata?)` | Liste des séries |
| `get_series_past(metadata?)` | Séries terminées |
| `get_series_running(metadata?)` | Séries en cours |
| `get_series_upcoming(metadata?)` | Séries à venir |
| `get_series_serieIdOrSlug({ serie_id_or_slug })` | Détails d'une série |
| `get_series_serieIdOrSlug_matches({ serie_id_or_slug })` | Matchs d'une série |
| `get_series_serieIdOrSlug_matches_past({ serie_id_or_slug })` | Matchs passés |
| `get_series_serieIdOrSlug_matches_running({ serie_id_or_slug })` | Matchs en cours |
| `get_series_serieIdOrSlug_matches_upcoming({ serie_id_or_slug })` | Matchs à venir |
| `get_series_serieIdOrSlug_tournaments({ serie_id_or_slug })` | Tournois d'une série |

---

### 🏅 Tournaments

| Méthode | Description |
|---------|-------------|
| `get_tournaments(metadata?)` | Liste des tournois |
| `get_tournaments_past(metadata?)` | Tournois terminés |
| `get_tournaments_running(metadata?)` | Tournois en cours |
| `get_tournaments_upcoming(metadata?)` | Tournois à venir |
| `get_tournaments_tournamentIdOrSlug({ tournament_id_or_slug })` | Détails d'un tournoi |
| `get_tournaments_tournamentIdOrSlug_brackets({ tournament_id_or_slug })` | Brackets |
| `get_tournaments_tournamentIdOrSlug_matches({ tournament_id_or_slug })` | Matchs |
| `get_tournaments_tournamentIdOrSlug_rosters({ tournament_id_or_slug })` | Rosters/équipes |
| `get_tournaments_tournamentIdOrSlug_standings({ tournament_id_or_slug })` | Classement |
| `get_tournaments_tournamentIdOrSlug_teams({ tournament_id_or_slug })` | Équipes |

**Filtrage par tier:**
```typescript
{
  'filter[tier]': 's',    // S-tier (Majors)
  'filter[tier]': 'a',    // A-tier (IEM, ESL Pro League)
  'filter[tier]': 'b',    // B-tier
  'filter[tier]': 'c',    // C-tier
  'filter[tier]': 'd',    // D-tier
}
```

---

### 📊 Incidents (Changements)

| Méthode | Description |
|---------|-------------|
| `get_additions(metadata?)` | Dernières additions |
| `get_changes(metadata?)` | Dernières modifications |
| `get_deletions(metadata?)` | Dernières suppressions |
| `get_incidents(metadata?)` | Tous les incidents (additions + changes + deletions) |

---

## Types TypeScript

Le SDK génère automatiquement les types dans `.api/apis/developers-pandascore/types.ts`.

### Types de réponse courants

```typescript
// Import du SDK
import sdk from '@api/developers-pandascore';
import type { 
  GetTeamsResponse200,
  GetMatchesResponse200,
  GetPlayersResponse200,
  GetTournamentsResponse200 
} from '@api/developers-pandascore';

// Les réponses sont typées
const teamsResponse = await sdk.get_teams();
const teams: GetTeamsResponse200 = teamsResponse.data;
```

---

## IDs d'équipes CS2 connues

| ID | Équipe |
|----|--------|
| 3216 | Natus Vincere |
| 3210 | G2 Esports |
| 3455 | Team Vitality |
| 3240 | MOUZ |
| 3212 | FaZe Clan |
| 3234 | Heroic |
| 124530 | FURIA |
| 3310 | Complexity |
| 3213 | Team Liquid |
| 3249 | BIG |
| 129413 | Eternal Fire |
| 3288 | Virtus.pro |
| 3223 | Cloud9 |
| 125847 | GamerLegion |
| 131216 | Falcons |
| 133458 | BetBoom Team |
| 3218 | NIP |
| 119369 | Team Spirit |

---

## Gestion des erreurs

Le SDK lève des erreurs typées pour chaque code HTTP:

```typescript
try {
  const response = await sdk.get_teams_teamIdOrSlug({ 
    team_id_or_slug: 'invalid' 
  });
} catch (error) {
  // FetchError<400> Bad request
  // FetchError<401> Unauthorized
  // FetchError<403> Forbidden
  // FetchError<404> Not found
  // FetchError<422> Unprocessable Entity
}
```

---

## Rate Limiting

- **Free tier:** 1000 requêtes/heure
- Recommandation: utiliser un cache de 10-30 minutes pour les données statiques

---

## Exemple complet

```typescript
import sdk from '@api/developers-pandascore';

// Configuration
sdk.auth(process.env.PANDASCORE_API_KEY!);

// Récupérer les équipes CS2 top tier
async function getTopCS2Teams() {
  const response = await sdk.get_teams({
    'filter[videogame]': 'csgo',
    'page[size]': '50',
  });
  return response.data;
}

// Récupérer les matchs en cours
async function getLiveMatches() {
  const response = await sdk.get_matches_running({
    'filter[videogame]': 'csgo',
  });
  return response.data;
}

// Récupérer les tournois S-tier à venir
async function getUpcomingMajors() {
  const response = await sdk.get_tournaments_upcoming({
    'filter[videogame]': 'csgo',
    'filter[tier]': 's',
  });
  return response.data;
}
```
