
import { Match } from "@/types";

export interface BracketMatch extends Match {
  // Extended properties for display
  label?: string;
}

export interface BracketRound {
  id: string; // unique id for key
  name: string; // "Quarterfinals", "Round 1"
  matches: BracketMatch[];
  order: number; // for sorting columns
}

export interface BracketSection {
  id: string; // "upper", "lower", "final"
  name: string;
  rounds: BracketRound[];
}

/**
 * Heuristics to parse match names into valid bracket rounds.
 * Supports standard formats: "Quarterfinal 1", "Upper bracket round 1", etc.
 */
export function parseBracketMatches(matches: Match[]): BracketSection[] {
  // We primarily want to support Double Elimination and Single Elimination brackets.
  // We look for keywords: "Upper", "Lower", "Quarterfinal", "Semifinal", "Final", "Grand Final", "Ro16", "Ro32"

  const upper: BracketRound[] = [];
  const lower: BracketRound[] = [];
  const final: BracketRound[] = [];

  // Temporary storage to group by round name
  const roundMap = new Map<string, { section: 'upper' | 'lower' | 'final', order: number, name: string, matches: Match[] }>();

  matches.forEach(match => {
    // If status is 'canceled' or similar, we might want to exclude, but for now keep all.
    const name = match.name.toLowerCase();
    
    // Determine Section
    let section: 'upper' | 'lower' | 'final' = 'upper'; // Default to upper/main
    if (name.includes('lower')) {
      section = 'lower';
    } else if (name.includes('grand final')) {
      section = 'final';
    }

    // Determine Round Name & normalized "Order"
    // Higher order = later in the tournament
    let roundName = 'Unknown Round';
    let order = 0;

    // Specific Parsing Logic
    if (name.includes('ro64') || name.includes('round of 64')) {
        roundName = 'Round of 64';
        order = 64;
    } else if (name.includes('ro32') || name.includes('round of 32')) {
        roundName = 'Round of 32';
        order = 32;
    } else if (name.includes('ro16') || name.includes('round of 16')) {
        roundName = 'Round of 16';
        order = 16;
    } else if (name.includes('quarter') || name.includes('qf')) {
        roundName = 'Quarterfinals';
        order = 8;
    } else if (name.includes('semi') || name.includes('sf')) {
        roundName = 'Semifinals';
        order = 4;
    } else if (name.includes('consolation') || name.includes('decider') || name.includes('3rd')) {
         // Usually happens parallel to finals, but let's put it at the end of lower or separate
         roundName = '3rd Place Match';
         order = 3; 
    } else if (name.includes('final') && !name.includes('quarter') && !name.includes('semi')) {
        if (name.includes('lower')) {
             roundName = 'Lower Final';
             order = 2; // Before Grand Final
        } else if (name.includes('upper')) {
             roundName = 'Upper Final';
             order = 4; // Equivalent to Semis in terms of column position usually, or just before GF
        } else {
            roundName = 'Grand Final';
            order = 1;
        }
    } else if (name.match(/round \d+/)) {
        // "Round 1", "Round 2" logic
        // For general "Round X", higher X is usually later, BUT NOT ALWAYS.
        // In "Round of 16", 16 is early. In "Round 1", 1 is early.
        // We assume "Round X" means incremental rounds.
        const matchRound = name.match(/round (\d+)/);
        const roundNum = matchRound ? parseInt(matchRound[1]) : 1;
        roundName = `Round ${roundNum}`;
        // Heuristic: Invert order for sorting? No, usually Round 1 -> Round 2.
        // We need a way to sort this relative to named rounds.
        // Let's assume generic rounds come before named rounds?
        // Actually, let's just assign a negative order relative to the start to sort them ascendingly
        // then we map them to a display order.
        // To be simpler: Just give them a high generic number and sort by name?
        // Let's use 100 + roundNum for generic rounds if they seem early, 
        // but often Round 1 is the start.
        // Let's treat them as: 1000 - roundNum*10 (So Round 1 is 990, Round 2 is 980...) ??
        // No, we want Left -> Right.
        // Left = Round 1 (Early). Right = Final (Late).
        // Let's change 'order' semantics to 'weight'. Higher weight = Right side (Finals).
        
        // Re-evaluating weights:
        // Ro64 = 1
        // Ro32 = 2
        // Ro16 = 3
        // QF = 4
        // SF = 5
        // Final = 6
        
        // Generic "Round N": Round 1 = 1, Round 2 = 2.
        order = roundNum;
    }

    // Override weights for standard named rounds
    if (name.includes('ro64')) order = 1;
    if (name.includes('ro32')) order = 2;
    if (name.includes('ro16')) order = 3;
    if (name.includes('quarter')) order = 4;
    if (name.includes('semi')) order = 5;
    if ((name.includes('upper') || section === 'upper') && name.includes('final') && !name.includes('quarter') && !name.includes('semi')) order = 6; // Upper bracket final
    if (name.includes('grand final')) order = 99; // The very end

    // Handling Lower bracket complexity
    // Lower Round 1, Lower Round 2...
    if (section === 'lower') {
        const matchRound = name.match(/round (\d+)/);
        if (matchRound) {
            order = parseInt(matchRound[1]);
        } else if (name.includes('final')) {
           order = 20; // Lower Final is late
        }
    }

    const key = `${section}-${roundName}`;
    if (!roundMap.has(key)) {
        roundMap.set(key, { section, name: roundName, order, matches: [] });
    }
    roundMap.get(key)!.matches.push(match);
  });

  // Convert Map to Sections
  const sections: BracketSection[] = [
      { id: 'upper', name: 'Main Bracket', rounds: [] },
      { id: 'lower', name: 'Losers Bracket', rounds: [] },
  ];

  roundMap.forEach((value, key) => {
      const round: BracketRound = {
          id: key,
          name: value.name,
          matches: value.matches.sort((a, b) => (a.scheduled_at || "").localeCompare(b.scheduled_at || "")),
          order: value.order
      };

      if (value.section === 'lower') {
          sections[1].rounds.push(round);
      } else {
          // Merge 'upper' and 'final' into the main bracket
          sections[0].rounds.push(round);
      }
  });

  // Sort rounds by order
  sections.forEach(s => s.rounds.sort((a, b) => a.order - b.order));

  // Filter empty sections
  return sections.filter(s => s.rounds.length > 0);
}
