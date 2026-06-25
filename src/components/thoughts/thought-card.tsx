/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pin } from "lucide-react";
import { format } from "date-fns";

export function ThoughtCard({ thought }: { thought: any }) {
  const moodEmoji = ["", "😔", "😕", "😐", "🙂", "😄"];

  return (
    <Card className="mb-4 relative group overflow-hidden ">
      <CardContent className="p-4">
        {thought.isPinned === 1 && (
          <Pin className="w-4 h-4 text-muted-foreground absolute top-4 right-4" />
        )}
        <p className="text-sm text-foreground whitespace-pre-wrap pr-6">
          {thought.body}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
          {thought.category && (
            <Badge 
              variant="secondary" 
              style={{ backgroundColor: `${thought.category.color ?? "#888"}20`, color: thought.category.color ?? "#888" }}
            >
              {thought.category.name}
            </Badge>
          )}
          {thought.tags?.map((tag: any) => (
            <Badge variant="outline" key={tag.id}>{tag.label}</Badge>
          ))}
          {thought.mood ? <span>{moodEmoji[thought.mood]}</span> : null}
          <span className="text-muted-foreground ml-auto">
            {format(new Date(thought.createdAt), "h:mm a")}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
