"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Clock, Trophy } from "lucide-react";

interface Match {
  id: number;
  name: string;
  status: string;
  begin_at: string | null;
  scheduled_at: string | null;
  tournament: {
    id: number;
    name: string;
  } | null;
  league: {
    id: number;
    name: string;
    image_url: string | null;
  } | null;
  opponents: {
    type: string;
    opponent: {
      id: number;
      name: string;
      acronym: string | null;
      image_url: string | null;
    };
  }[];
}

interface MatchCalendarProps {
  matches: Match[];
  loading?: boolean;
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function formatMatchTime(dateStr: string | null) {
  if (!dateStr) return "TBD";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  // Convert Sunday (0) to 6, and shift other days (Mon=0, Tue=1, etc.)
  return day === 0 ? 6 : day - 1;
}

export default function MatchCalendar({ matches, loading }: MatchCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Group matches by date
  const matchesByDate = useMemo(() => {
    const grouped: Record<string, Match[]> = {};
    matches.forEach(match => {
      const dateStr = match.scheduled_at || match.begin_at;
      if (dateStr) {
        const date = new Date(dateStr);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(match);
      }
    });
    return grouped;
  }, [matches]);

  // Get matches for selected date
  const selectedMatches = useMemo(() => {
    if (!selectedDate) return [];
    return matchesByDate[selectedDate] || [];
  }, [selectedDate, matchesByDate]);

  // Navigation
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setSelectedDate(todayKey);
  };

  // Calendar grid generation
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const getDateKey = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const hasMatches = (day: number) => {
    const key = getDateKey(day);
    return matchesByDate[key] && matchesByDate[key].length > 0;
  };

  const getMatchCount = (day: number) => {
    const key = getDateKey(day);
    return matchesByDate[key]?.length || 0;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Calendar Grid */}
      <div className="lg:col-span-2 bg-card border border-card-border rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-display font-bold uppercase tracking-wide">
              {MONTHS[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS_OF_WEEK.map(day => (
            <div
              key={day}
              className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty days before first day of month */}
          {emptyDays.map(i => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {daysArray.map(day => {
            const dateKey = getDateKey(day);
            const isSelected = selectedDate === dateKey;
            const matchCount = getMatchCount(day);

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateKey)}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-lg transition-all relative
                  ${isToday(day) ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}
                  ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}
                  ${hasMatches(day) && !isSelected ? "bg-primary/10" : ""}
                `}
              >
                <span className={`text-sm font-medium ${isSelected ? "" : isToday(day) ? "text-primary" : ""}`}>
                  {day}
                </span>
                {matchCount > 0 && (
                  <span
                    className={`
                      absolute bottom-1 text-[10px] font-bold px-1.5 rounded-full
                      ${isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary text-primary-foreground"}
                    `}
                  >
                    {matchCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="mt-6 text-center text-muted-foreground text-sm">
            Loading matches...
          </div>
        )}
      </div>

      {/* Selected day matches panel */}
      <div className="bg-card border border-card-border rounded-2xl p-6 h-fit lg:sticky lg:top-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold uppercase tracking-wide">
              {selectedDate
                ? new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                : "Select a day"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedMatches.length} match{selectedMatches.length !== 1 ? "es" : ""}
            </p>
          </div>
        </div>

        {selectedMatches.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {selectedDate ? "No matches this day" : "Click on a day to see matches"}
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {selectedMatches.map(match => (
              <Link
                key={match.id}
                href={`/match/${match.id}`}
                className="block bg-secondary/50 hover:bg-secondary border border-card-border hover:border-primary/30 rounded-xl p-4 transition-all group"
              >
                {/* League/Tournament */}
                <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                  {match.league?.image_url && (
                    <Image
                      src={match.league.image_url}
                      alt={match.league.name}
                      width={16}
                      height={16}
                      className="rounded"
                    />
                  )}
                  <span className="truncate">
                    {match.tournament?.name || match.league?.name}
                  </span>
                </div>

                {/* Teams */}
                <div className="flex items-center justify-between gap-3">
                  {match.opponents[0] && (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {match.opponents[0].opponent.image_url ? (
                        <Image
                          src={match.opponents[0].opponent.image_url}
                          alt={match.opponents[0].opponent.name}
                          width={24}
                          height={24}
                          className="rounded"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-card rounded flex items-center justify-center text-[10px] font-bold">
                          {match.opponents[0].opponent.acronym?.[0] || match.opponents[0].opponent.name[0]}
                        </div>
                      )}
                      <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {match.opponents[0].opponent.acronym || match.opponents[0].opponent.name}
                      </span>
                    </div>
                  )}

                  <span className="text-xs font-medium text-muted-foreground">vs</span>

                  {match.opponents[1] && (
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="font-medium text-sm truncate group-hover:text-primary transition-colors text-right">
                        {match.opponents[1].opponent.acronym || match.opponents[1].opponent.name}
                      </span>
                      {match.opponents[1].opponent.image_url ? (
                        <Image
                          src={match.opponents[1].opponent.image_url}
                          alt={match.opponents[1].opponent.name}
                          width={24}
                          height={24}
                          className="rounded"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-card rounded flex items-center justify-center text-[10px] font-bold">
                          {match.opponents[1].opponent.acronym?.[0] || match.opponents[1].opponent.name[0]}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Time */}
                <div className="mt-3 pt-3 border-t border-card-border flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>{formatMatchTime(match.begin_at || match.scheduled_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
