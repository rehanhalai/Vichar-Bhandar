/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { ThoughtCard } from "./thought-card";
import { format, isToday, isYesterday, parseISO } from "date-fns";

export function TimelineView({ thoughts }: { thoughts: any[] }) {
  const grouped = thoughts.reduce((acc, thought) => {
    const date = thought.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(thought);
    return acc;
  }, {} as Record<string, any[]>);

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const formatHeader = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return `Today — ${format(date, "MMM d")}`;
      if (isYesterday(date)) return `Yesterday — ${format(date, "MMM d")}`;
      return format(date, "EEEE — MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  if (thoughts.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-muted-foreground">
        No thoughts yet. Press ⌘K to capture your first thought.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-8">
      {dates.map(date => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 sticky top-0 bg-background/95 backdrop-blur py-2 z-10">
            {formatHeader(date)}
          </h3>
          <div>
            {grouped[date].map((thought: any) => (
              <ThoughtCard key={thought.id} thought={thought} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
