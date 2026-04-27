"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, User, Users, Shield, Trophy } from "lucide-react";
import CountryFlag from "@/components/ui/CountryFlag";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

interface Player {
    id: number;
    slug: string;
    name: string;
    first_name?: string | null;
    last_name?: string | null;
    nationality?: string | null;
    image_url?: string | null;
    role?: string | null;
    current_team?: {
        id: number;
        name: string;
        image_url?: string | null;
    } | null;
}

interface Props {
    player: Player;
}

export default function PlayerDetailsClient({ player }: Props) {
    const fullName = [player.first_name, player.last_name].filter(Boolean).join(" ");

    return (
        <div className="container-custom py-8">
            <Breadcrumbs
                items={[
                    { label: "Players" }, // Or Teams -> Team -> Player? Usually players are distinct.
                    { label: player.name }
                ]}
                className="mb-8"
            />

            {/* Player Header */}
            <div className="bg-card border border-card-border rounded-2xl overflow-hidden mb-8">
                <div className="relative h-48 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                </div>

                <div className="px-8 pb-8 -mt-20 relative z-10">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                        {/* Player Image */}
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-secondary border-4 border-background shadow-xl overflow-hidden flex items-center justify-center">
                            {player.image_url ? (
                                <Image
                                    src={player.image_url}
                                    alt={player.name}
                                    width={160}
                                    height={160}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <User className="w-16 h-16 text-muted-foreground" />
                            )}
                        </div>

                        {/* Player Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                {player.nationality && (
                                    <CountryFlag code={player.nationality} size="lg" />
                                )}
                                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                                    {player.name}
                                </h1>
                            </div>

                            {fullName && (
                                <p className="text-lg text-muted-foreground mb-4">
                                    {fullName}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-3">
                                {player.role && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-lg border border-primary/20">
                                        <Shield className="w-4 h-4" />
                                        {player.role}
                                    </span>
                                )}
                                {player.nationality && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-muted-foreground text-sm font-medium rounded-lg border border-card-border">
                                        <MapPin className="w-4 h-4" />
                                        {player.nationality.toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Team */}
            {player.current_team && (
                <div className="bg-card border border-card-border rounded-xl p-6 mb-8">
                    <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Current Team
                    </h2>
                    <Link
                        href={`/teams/${player.current_team.id}`}
                        className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg border border-card-border hover:border-primary/50 transition-colors group"
                    >
                        <div className="w-16 h-16 rounded-lg bg-background border border-card-border overflow-hidden flex items-center justify-center">
                            {player.current_team.image_url ? (
                                <Image
                                    src={player.current_team.image_url}
                                    alt={player.current_team.name}
                                    width={64}
                                    height={64}
                                    className="object-contain p-2"
                                />
                            ) : (
                                <Users className="w-8 h-8 text-muted-foreground" />
                            )}
                        </div>
                        <div>
                            <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                {player.current_team.name}
                            </p>
                            <p className="text-sm text-muted-foreground">View Team Profile →</p>
                        </div>
                    </Link>
                </div>
            )}

            {/* Stats Placeholder */}
            <div className="bg-card border border-card-border rounded-xl p-6">
                <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Career Statistics
                </h2>
                <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">Detailed statistics coming soon...</p>
                </div>
            </div>
        </div>
    );
}
