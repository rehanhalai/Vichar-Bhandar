/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useMemo } from "react";
import { ThoughtCard } from "./thought-card";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOODS } from "@/lib/constants";
import { Circle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TimelineView({ thoughts }: { thoughts: any[] }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedMood, setSelectedMood] = useState<string>("all");

  const availableCategories = useMemo(() => {
    const ObjectMap = new Map();
    thoughts.forEach(t => {
      if (t.category && t.categoryId) {
        ObjectMap.set(t.categoryId, t.category);
      }
    });
    return Array.from(ObjectMap.entries()).map(([id, cat]) => ({ id, ...cat }));
  }, [thoughts]);

  const filteredThoughts = useMemo(() => {
    return thoughts.filter(t => {
      if (selectedCategoryId !== "all" && t.categoryId !== selectedCategoryId) return false;
      if (selectedMood !== "all" && t.mood !== parseInt(selectedMood)) return false;
      return true;
    });
  }, [thoughts, selectedCategoryId, selectedMood]);

  const grouped = filteredThoughts.reduce((acc, thought) => {
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-2.5 rounded-xl border border-transparent hover:border-border/50 transition-colors">
        <Select value={selectedCategoryId} onValueChange={(val) => setSelectedCategoryId(val ?? "all")}>
          <SelectTrigger className="w-[160px] h-8 text-xs bg-background/50 border-0 shadow-none">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Categories</SelectItem>
            {availableCategories.map(cat => (
              <SelectItem key={cat.id} value={cat.id} className="text-xs">
                <div className="flex items-center gap-2">
                  <Circle className="size-2.5 fill-current" style={{ color: cat.color || "#888" }} />
                  {cat.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMood} onValueChange={(val) => setSelectedMood(val ?? "all")}>
          <SelectTrigger className="w-[130px] h-8 text-xs bg-background/50 border-0 shadow-none">
            <SelectValue placeholder="All Moods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Moods</SelectItem>
            {MOODS.map((mood, i) => (
              <SelectItem key={i} value={(i + 1).toString()} className="text-xs">
                <span className="mr-2">{mood}</span> Mood {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(selectedCategoryId !== "all" || selectedMood !== "all") && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { setSelectedCategoryId("all"); setSelectedMood("all"); }}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:bg-background/50 ml-auto"
          >
            <X className="size-3.5 mr-1.5" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-8 mt-4">
        {filteredThoughts.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
            No thoughts match your current filters.
          </div>
        ) : (
          dates.map(date => (
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
          ))
        )}
      </div>
    </div>
  )
}
