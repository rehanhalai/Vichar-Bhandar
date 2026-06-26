"use client"

import { useState, useRef, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardDescription, CardAction } from "@/components/ui/card"
import { createThought } from "@/actions/thoughts"
import { upsertDraft, getDraft, clearDraft } from "@/actions/drafts"
import { CategorySelector } from "@/components/categories/category-selector"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Send, Sparkles, Loader2 } from "lucide-react"
import { MOODS } from "@/lib/constants"

export function QuickCapture() {
  const queryClient = useQueryClient()
  const [body, setBody] = useState("")
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [mood, setMood] = useState<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        textareaRef.current?.focus()
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    getDraft().then((draft) => {
      if (draft?.body) setBody(draft.body)
    })
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (body.trim()) {
        upsertDraft(body)
      } else {
        clearDraft()
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [body])

  const createMutation = useMutation({
    mutationFn: async (data: any) => await createThought(data),
    onMutate: async (newThought) => {
      await queryClient.cancelQueries({ queryKey: ['thoughts'] })
      const previousThoughts = queryClient.getQueryData(['thoughts'])

      const optimisticThought = {
        id: "optimistic-" + Date.now(),
        body: newThought.body,
        date: newThought.date,
        createdAt: new Date().toISOString(),
        isPinned: 0,
        category: null, // Optimistic UI won't show full category details but it's fine
        categoryId: newThought.categoryId,
        tags: [],
      }

      queryClient.setQueryData(['thoughts'], (old: any) => {
        return [optimisticThought, ...(old || [])]
      })

      return { previousThoughts }
    },
    onError: (err, newThought, context) => {
      console.error("Failed to save thought:", err)
      alert("Failed to save thought")
      if (context?.previousThoughts) {
        queryClient.setQueryData(['thoughts'], context.previousThoughts)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['thoughts'] })
    },
    onSuccess: () => {
      setBody("")
      setCategoryId(null)
      setMood(null)
      clearDraft()
    }
  })

  const handleSave = () => {
    if (!body.trim() || createMutation.isPending) return
    createMutation.mutate({
      body,
      categoryId,
      mood,
      date: format(new Date(), "yyyy-MM-dd"),
      tags: [],
    })
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <Sparkles className="size-4" />
          Quick Capture
        </CardDescription>
        <CardAction>
          <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </CardAction>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="relative group">
          <Textarea
            id="quick-capture-textarea"
            ref={textareaRef}
            placeholder="What's on your mind?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={createMutation.isPending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                handleSave()
              }
            }}
            className="min-h-[120px] resize-none bg-muted/40 focus-visible:bg-background border-muted-foreground/20 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 p-4 text-base transition-all pb-14 rounded-xl disabled:opacity-50"
          />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="w-[140px]">
              <CategorySelector value={categoryId} onChange={setCategoryId} disabled={createMutation.isPending} />
            </div>
            <div className="flex items-center gap-0.5 bg-muted/30 rounded-full px-1 py-0.5 border border-transparent hover:border-border transition-colors">
              {MOODS.map((m, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMood(mood === i + 1 ? null : i + 1)}
                  className={cn("size-6 flex items-center justify-center rounded-full text-sm opacity-50 hover:opacity-100 transition-all", mood === i + 1 && "opacity-100 bg-background shadow-sm scale-110")}
                  title={`Mood ${i + 1}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground hidden sm:inline-block opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
              Press <kbd className="font-sans px-1 py-0.5 rounded bg-muted border">⌘</kbd> <kbd className="font-sans px-1 py-0.5 rounded bg-muted border">↵</kbd> to save
            </span>
            <Button type="button" onClick={handleSave} disabled={!body.trim() || createMutation.isPending} size="sm" className="h-8 rounded-lg shadow-none font-medium sm:min-w-17.5 transition-all">
              {createMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  <span className="hidden sm:block">
                    Saving
                  </span>
                </>
              ) : (
                <>
                  <Send className="size-3.5 mr-1.5" />
                  <span className="hidden sm:block">
                    Save
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
