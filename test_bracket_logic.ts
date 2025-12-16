
import { parseBracketMatches } from './src/lib/bracket-parser';
import { Match } from './src/types';

// Mock Match factory
const createMatch = (id: number, name: string, date: string): Match => ({
    id,
    name,
    scheduled_at: date,
    status: 'finished',
    slug: 'mock-match',
    begin_at: date,
    end_at: null,
    opponents: [],
    results: [],
    league: null,
    serie: null,
    tournament: null,
    tier: 'Other',
    streams: []
});

const matches: Match[] = [
    createMatch(1, "Upper bracket quarterfinal 1", "2024-01-01T10:00:00Z"),
    createMatch(2, "Upper bracket quarterfinal 2", "2024-01-01T11:00:00Z"),
    createMatch(3, "Lower bracket round 1", "2024-01-02T10:00:00Z"),
    createMatch(4, "Upper bracket semifinal 1", "2024-01-03T10:00:00Z"),
    createMatch(5, "Lower bracket final", "2024-01-04T10:00:00Z"),
    createMatch(6, "Grand Final", "2024-01-05T10:00:00Z"),
];

console.log("Testing Bracket Parse Logic...");
const sections = parseBracketMatches(matches);

sections.forEach(section => {
    console.log(`\nSection: ${section.name}`);
    section.rounds.forEach(round => {
        console.log(`  Round: ${round.name} (Order: ${round.order})`);
        round.matches.forEach(m => console.log(`    - ${m.name}`));
    });
});
