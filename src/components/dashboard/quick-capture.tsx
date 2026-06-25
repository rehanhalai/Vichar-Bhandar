"use client"

import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardDescription, CardAction } from "@/components/ui/card"
import { createThought } from "@/actions/thoughts"
import { upsertDraft, getDraft } from "@/actions/drafts"
import { format } from "date-fns"
import { Send, Sparkles } from "lucide-react"

export function QuickCapture() {
  const [body, setBody] = useState("")
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey) && !focused) {
        e.preventDefault()
        textareaRef.current?.focus()
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [focused])

  useEffect(() => {
    getDraft().then((draft) => {
      if (draft?.body) setBody(draft.body)
    })
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (body.trim()) {
        upsertDraft(body)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [body])

  const handleSave = async () => {
    if (!body.trim()) return
    await createThought({
      body,
      date: format(new Date(), "yyyy-MM-dd"),
      tags: [],
    })
    setBody("")
    setFocused(false)
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
        <Textarea
          ref={textareaRef}
          placeholder="What's on your mind?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="min-h-[100px] resize-none border-none focus-visible:ring-0 shadow-none p-0 text-base"
        />
        <div className="flex justify-end mt-3">
          <Button onClick={handleSave} disabled={!body.trim()} size="sm">
            <Send className="size-4 mr-1" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
