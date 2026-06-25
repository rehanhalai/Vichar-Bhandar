"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createThought } from "@/actions/thoughts";
import { format } from "date-fns";

export function QuickCapture() {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSave = async () => {
    if (!body.trim()) return;
    await createThought({
      body,
      date: format(new Date(), "yyyy-MM-dd"),
      tags: [],
    });
    setBody("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] ">
        <DialogHeader>
          <DialogTitle className="sr-only">Quick Capture</DialogTitle>
        </DialogHeader>
        <div className="grid py-2">
          <Textarea 
            placeholder="What's on your mind?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[150px] resize-none text-lg border-none focus-visible:ring-0 shadow-none p-0"
            autoFocus
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {/* Future: Mood & Voice buttons */}
          </div>
          <Button onClick={handleSave} disabled={!body.trim()} size="sm">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
