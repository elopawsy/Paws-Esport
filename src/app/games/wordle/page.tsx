"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { Search, Trophy, RefreshCw, HelpCircle, X, ChevronDown, Gamepad2 } from "lucide-react";
import CountryFlag from "@/components/ui/CountryFlag";
import { VIDEO_GAMES, type VideoGameSlug } from "@/types/videogame";

interface Player {
    id: number;
    name: string;
    first_name?: string | null;
    last_name?: string | null;
    nationality?: string | null;
    image_url?: string | null;
    current_team?: {
        id: number;
        name: string;
        image_url?: string | null;
        location?: string | null;
    } | null;
    relevanceScore?: number;
}

interface Guess {
    player: Player;
    results: {
        name: "correct" | "wrong";
        team: "correct" | "wrong";
        nationality: "correct" | "wrong";
        team_nationality: "correct" | "wrong";
        initial: "correct" | "wrong";
    };
}

type HintType = "correct" | "wrong";

const MAX_GUESSES = 10;

const GAME_NAMES: Record<VideoGameSlug, string> = {
    "cs-2": "Counter-Strikle",
    valorant: "Valorantle",
    lol: "Legendle",
};

// Calculate relevance score based on how well the name matches the query
function calculateRelevance(name: string, query: string): number {
    const lowerName = name.toLowerCase();
    const lowerQuery = query.toLowerCase();

    // Exact match = highest score
    if (lowerName === lowerQuery) return 100;

    // Starts with query = very high score
    if (lowerName.startsWith(lowerQuery)) return 90 + (lowerQuery.length / lowerName.length) * 10;

    // Contains query as a word = high score
    const words = lowerName.split(/[\s\-_]+/);
    for (const word of words) {
        if (word === lowerQuery) return 80;
        if (word.startsWith(lowerQuery)) return 70 + (lowerQuery.length / word.length) * 10;
    }

    // Contains query anywhere = medium score
    if (lowerName.includes(lowerQuery)) {
        const index = lowerName.indexOf(lowerQuery);
        return 50 + (10 - Math.min(index, 10));
    }

    // Partial match (all query chars present in order)
    let queryIdx = 0;
    for (const char of lowerName) {
        if (char === lowerQuery[queryIdx]) queryIdx++;
        if (queryIdx === lowerQuery.length) break;
    }
    if (queryIdx === lowerQuery.length) return 30;

    return 0;
}

// Sort by relevance
function sortByRelevance(items: Player[], query: string): Player[] {
    return items
        .map(item => ({
            ...item,
            relevanceScore: calculateRelevance(item.name, query)
        }))
        .filter(item => (item.relevanceScore || 0) > 0)
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
}

const getRegion = (countryCode?: string | null): string => {
    if (!countryCode) return "?";
    const code = countryCode.toUpperCase();

    // Americas
    if (["US", "CA", "MX"].includes(code)) return "NA";
    if (["BR", "AR", "CL", "PE", "CO", "UY"].includes(code)) return "SA";

    // Asia / Oceania
    if (["CN", "KR", "JP", "MN", "TH", "VN", "SG", "MY", "ID", "PH", "IN", "PK", "BD"].includes(code)) return "ASIA";
    if (["AU", "NZ"].includes(code)) return "OCE";

    // CIS (often grouped with EU in some contexts, but let's keep it if distinctive, otherwise EU)
    // For "Region of play", usually we have EU, NA, SA, ASIA. CIS teams play in EU often.
    // Let's verify common requests. Keeping CIS separate might be better or merging.
    // Let's go with broad regions: EU (includes CIS/TR/IL), NA, SA, ASIA, OCE.

    return "EU"; // Default to EU as it covers most remaining active CS countries (FR, DE, DK, SE, PL, UA, RU, KZ, etc.)
};

export default function WordlePage() {
    const [selectedGame, setSelectedGame] = useState<VideoGameSlug>("cs-2");
    const [players, setPlayers] = useState<Player[]>([]);
    const [mysteryPlayer, setMysteryPlayer] = useState<Player | null>(null);
    const [guesses, setGuesses] = useState<Guess[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [won, setWon] = useState(false);
    const [lost, setLost] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showGameSelect, setShowGameSelect] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Fetch players for the selected game (to pick a mystery player)
    useEffect(() => {
        async function fetchPlayers() {
            setLoading(true);
            try {
                // Use the teams endpoint to get players from top teams
                const res = await fetch(`/api/teams?game=${selectedGame}`);
                if (res.ok) {
                    const teams = await res.json();
                    // Extract all players from teams
                    const allPlayers: Player[] = [];
                    for (const team of teams) {
                        if (team.players) {
                            for (const player of team.players) {
                                allPlayers.push({
                                    ...player,
                                    current_team: {
                                        id: team.id,
                                        name: team.name,
                                        image_url: team.image_url,
                                        location: team.location,
                                    },
                                });
                            }
                        }
                    }

                    // Pick random mystery player
                    if (allPlayers.length > 0) {
                        const randomIndex = Math.floor(Math.random() * allPlayers.length);
                        setMysteryPlayer(allPlayers[randomIndex]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch players:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchPlayers();
        setGuesses([]);
        setWon(false);
        setLost(false);
        setSearchQuery("");
    }, [selectedGame]);

    // Search players dynamically
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/players/search?q=${encodeURIComponent(searchQuery)}&game=${selectedGame}`);
                if (res.ok) {
                    const data = await res.json();
                    const guessedIds = new Set(guesses.map((g) => g.player.id));
                    // Filter out already guessed players
                    const filtered = data
                        .filter((p: Player) => !guessedIds.has(p.id));

                    // Sort by relevance logic like SearchBar
                    const sorted = sortByRelevance(filtered, searchQuery).slice(0, 8);

                    setSuggestions(sorted);
                }
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, selectedGame, guesses]);

    // Compare guess with mystery player
    const compareGuess = useCallback(
        (guessedPlayer: Player): Guess["results"] => {
            if (!mysteryPlayer) {
                return { name: "wrong", team: "wrong", nationality: "wrong", team_nationality: "wrong", initial: "wrong" };
            }

            const getInitial = (name?: string | null) => name ? name.charAt(0).toUpperCase() : "?";
            const teamRegion = (p: Player) => getRegion(p.current_team?.location);

            return {
                name: guessedPlayer.id === mysteryPlayer.id ? "correct" : "wrong",
                team: guessedPlayer.current_team?.id === mysteryPlayer.current_team?.id ? "correct" : "wrong",
                nationality: guessedPlayer.nationality === mysteryPlayer.nationality ? "correct" : "wrong",
                team_nationality: teamRegion(guessedPlayer) === teamRegion(mysteryPlayer) ? "correct" : "wrong",
                initial: getInitial(guessedPlayer.first_name) === getInitial(mysteryPlayer.first_name) ? "correct" : "wrong",
            };
        },
        [mysteryPlayer]
    );

    // Handle guess selection
    const handleGuess = (player: Player) => {
        if (won || lost) return;

        const results = compareGuess(player);
        const newGuess: Guess = { player, results };

        const newGuesses = [newGuess, ...guesses];
        setGuesses(newGuesses);
        setSearchQuery("");
        setSuggestions([]);

        if (results.name === "correct") {
            setWon(true);
        } else if (newGuesses.length >= MAX_GUESSES) {
            setLost(true);
        }
    };

    // Reset game
    const resetGame = () => {
        setLoading(true);
        window.location.reload();
    };

    // Get hint color class
    const getHintClass = (type: HintType): string => {
        switch (type) {
            case "correct":
                return "bg-green-500 text-white";
            default:
                return "bg-card border border-card-border text-muted-foreground";
        }
    };

    const gameName = GAME_NAMES[selectedGame] || "Esportsle";

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
            <div className="container-custom py-8 max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight mb-2">
                        <span className="text-primary">{gameName}</span>
                    </h1>
                    <p className="text-muted-foreground">Guess the mystery {VIDEO_GAMES[selectedGame]?.name} player from a Major Team</p>
                    {mysteryPlayer && (
                        <div className="mt-4 inline-flex items-center px-4 py-2 bg-secondary rounded-full text-sm font-medium">
                            Guess {guesses.length}/{MAX_GUESSES}
                        </div>
                    )}
                </div>

                {/* Game Selector */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <button
                            onClick={() => setShowGameSelect(!showGameSelect)}
                            className="flex items-center gap-2 px-4 py-2 bg-card border border-card-border rounded-lg hover:border-primary/50 transition-colors"
                        >
                            <Gamepad2 className="w-4 h-4 text-primary" />
                            <span className="font-medium">{VIDEO_GAMES[selectedGame]?.name}</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        {showGameSelect && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-card-border rounded-lg shadow-xl z-50 overflow-hidden">
                                {Object.entries(VIDEO_GAMES).map(([slug, game]) => (
                                    <button
                                        key={slug}
                                        onClick={() => {
                                            setSelectedGame(slug as VideoGameSlug);
                                            setShowGameSelect(false);
                                        }}
                                        className={`w-full px-4 py-2.5 text-left hover:bg-primary/10 transition-colors ${selectedGame === slug ? "bg-primary/20 text-primary" : ""
                                            }`}
                                    >
                                        {game.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => setShowHelp(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <HelpCircle className="w-4 h-4" />
                        How to Play
                    </button>
                    <button
                        onClick={resetGame}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        New Game
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading players...</p>
                    </div>
                ) : (
                    <>
                        {/* Search Input */}
                        {!won && !lost && (
                            <div className="relative mb-8">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={`Guess a player... (${MAX_GUESSES - guesses.length} tries left)`}
                                        className="w-full bg-card border-2 border-primary/50 rounded-xl py-4 pl-12 pr-4 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                                        autoFocus
                                    />
                                    {isSearching && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                                        </div>
                                    )}
                                </div>

                                {/* Suggestions */}
                                {suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-card-border rounded-xl shadow-xl overflow-hidden z-50">
                                        {suggestions.map((player) => (
                                            <button
                                                key={player.id}
                                                onClick={() => handleGuess(player)}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors text-left"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-secondary border border-card-border overflow-hidden flex items-center justify-center">
                                                    {player.image_url ? (
                                                        <Image
                                                            src={player.image_url}
                                                            alt={player.name}
                                                            width={40}
                                                            height={40}
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-sm font-bold text-muted-foreground">
                                                            {player.name[0]}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">{player.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {player.current_team?.name || "No team"}
                                                    </p>
                                                </div>
                                                {player.nationality && (
                                                    <div className="ml-auto">
                                                        <CountryFlag code={player.nationality} size="sm" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Won Message */}
                        {won && mysteryPlayer && (
                            <div className="text-center mb-8 p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
                                <Trophy className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-display font-bold text-green-500 mb-2">Congratulations!</h2>
                                <p className="text-foreground mb-4">
                                    You found <span className="font-bold text-primary">{mysteryPlayer.name}</span> in{" "}
                                    {guesses.length} {guesses.length === 1 ? "guess" : "guesses"}!
                                </p>
                                <button
                                    onClick={resetGame}
                                    className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary-hover transition-colors"
                                >
                                    Play Again
                                </button>
                            </div>
                        )}

                        {/* Lost Message */}
                        {lost && mysteryPlayer && (
                            <div className="text-center mb-8 p-6 bg-red-500/10 border border-red-500/30 rounded-xl animate-in fade-in zoom-in duration-300">
                                <h2 className="text-2xl font-display font-bold text-red-500 mb-2">Game Over!</h2>
                                <p className="text-foreground mb-4">
                                    The player was:
                                </p>
                                <div className="flex flex-col items-center gap-2 mb-6">
                                    <div className="w-20 h-20 rounded-xl bg-secondary border border-card-border overflow-hidden flex items-center justify-center">
                                        {mysteryPlayer.image_url ? (
                                            <Image
                                                src={mysteryPlayer.image_url}
                                                alt={mysteryPlayer.name}
                                                width={80}
                                                height={80}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-2xl font-bold text-muted-foreground">
                                                {mysteryPlayer.name[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xl font-bold">{mysteryPlayer.name}</div>
                                    <div className="text-muted-foreground">{mysteryPlayer.current_team?.name}</div>
                                </div>

                                <button
                                    onClick={resetGame}
                                    className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary-hover transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Guesses Table */}
                        {guesses.length > 0 && (
                            <div className="space-y-2 max-w-lg mx-auto">
                                {/* Header */}
                                <div className="grid grid-cols-5 gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">
                                    <div className="text-center">Name</div>
                                    <div className="text-center">Team</div>
                                    <div className="text-center">Nat</div>
                                    <div className="text-center">Region</div>
                                    <div className="text-center">Initial</div>
                                </div>

                                {/* Guesses */}
                                {guesses.map((guess, index) => (
                                    <div
                                        key={`${guess.player.id}-${index}`}
                                        className="grid grid-cols-5 gap-2 animate-in slide-in-from-top-2 duration-300"
                                    >
                                        <div
                                            className={`rounded-lg p-3 text-center font-bold text-sm flex items-center justify-center ${getHintClass(
                                                guess.results.name
                                            )}`}
                                        >
                                            {guess.player.name}
                                        </div>
                                        <div
                                            className={`rounded-lg p-3 text-center text-sm flex items-center justify-center ${getHintClass(
                                                guess.results.team
                                            )}`}
                                        >
                                            {guess.player.current_team?.name || "?"}
                                        </div>
                                        <div
                                            className={`rounded-lg p-3 flex items-center justify-center ${getHintClass(
                                                guess.results.nationality
                                            )}`}
                                        >
                                            {guess.player.nationality ? (
                                                <CountryFlag code={guess.player.nationality} size="md" />
                                            ) : (
                                                "?"
                                            )}
                                        </div>
                                        <div
                                            className={`rounded-lg p-3 text-center text-sm font-bold flex items-center justify-center ${getHintClass(
                                                guess.results.team_nationality
                                            )}`}
                                        >
                                            {getRegion(guess.player.current_team?.location)}
                                        </div>
                                        <div
                                            className={`rounded-lg p-3 text-center text-sm font-bold flex items-center justify-center ${getHintClass(
                                                guess.results.initial
                                            )}`}
                                        >
                                            {guess.player.first_name ? guess.player.first_name.charAt(0).toUpperCase() : "?"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {guesses.length === 0 && !won && !lost && (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>Start typing to guess a player!</p>
                                <p className="text-sm mt-2 opacity-50">You have {MAX_GUESSES} tries.</p>
                            </div>
                        )}
                    </>
                )}

                {/* Help Modal */}
                {showHelp && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-card border border-card-border rounded-2xl p-6 max-w-md w-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-display font-bold">How to Play</h3>
                                <button
                                    onClick={() => setShowHelp(false)}
                                    className="p-1 hover:bg-secondary rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4 text-sm">
                                <p>Guess the mystery player by searching for player names.</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-lg" />
                                        <span>Correct</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-card border border-card-border rounded-lg" />
                                        <span>Wrong</span>
                                    </div>
                                </div>
                                <p className="mt-4 text-muted-foreground">
                                    You have {MAX_GUESSES} tries to guess the player.
                                    Hints include Team, Nationality, Team Region, and First Name Initial.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
