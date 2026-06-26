/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pin, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { deleteThought } from "@/actions/thoughts";
import { useUIStore } from "@/store/ui-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MOODS } from "@/lib/constants";

export function ThoughtCard({ thought }: { thought: any }) {
  const { openThoughtDialog } = useUIStore();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => await deleteThought(thought.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thoughts"] });
    },
  });

  return (
    <Card className="mb-4 relative group overflow-hidden ">
      <CardContent className="p-4">
        {thought.isPinned === 1 && (
          <Pin className="w-4 h-4 text-muted-foreground absolute top-4 right-12" />
        )}
        
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openThoughtDialog(thought)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-foreground whitespace-pre-wrap pr-10">
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
          {thought.mood ? <span>{MOODS[thought.mood - 1]}</span> : null}
          <span className="text-muted-foreground ml-auto">
            {format(new Date(thought.createdAt), "h:mm a")}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
