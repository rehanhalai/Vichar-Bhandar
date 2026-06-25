"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO, isSameDay } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { createThought } from "@/actions/thoughts"
import { Brain, Plus } from "lucide-react"

interface Thought {
  id: string
  body: string
  date: string
  category?: { name: string; color: string | null } | null
}

interface Reminder {
  id: string
  title: string
  dueDate: string | null
  isCompleted: number | null
}

export function CalendarView({
  initialThoughts,
  initialReminders,
}: {
  initialThoughts: Thought[]
  initialReminders: Reminder[]
}) {
  const [selected, setSelected] = useState<Date>(new Date())
  const [thoughts, setThoughts] = useState<Thought[]>(initialThoughts)
  const [newThought, setNewThought] = useState("")

  const thoughtDates = thoughts.map(t => parseISO(t.date))
  const reminderDates = initialReminders
    .filter(r => r.dueDate && !r.isCompleted)
    .map(r => parseISO(r.dueDate!))

  const selectedThoughts = thoughts.filter(t => isSameDay(parseISO(t.date), selected))
  const selectedReminders = initialReminders.filter(
    r => r.dueDate && isSameDay(parseISO(r.dueDate), selected) && !r.isCompleted
  )

  const handleAddThought = async () => {
    if (!newThought.trim()) return
    await createThought({
      body: newThought,
      date: format(selected, "yyyy-MM-dd"),
      tags: [],
    })
    setNewThought("")
    setThoughts(prev => [...prev, {
      id: crypto.randomUUID(),
      body: newThought,
      date: format(selected, "yyyy-MM-dd"),
    }])
  }

  const modifiers = {
    hasThoughts: thoughtDates,
    hasReminders: reminderDates,
  }

  const modifiersStyles = {
    hasThoughts: {
      fontWeight: "bold",
      color: "var(--primary)",
      textDecoration: "underline",
      textUnderlineOffset: "3px",
    },
    hasReminders: {
      fontWeight: "bold",
      color: "var(--destructive)",
    },
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6 lg:flex-row">
      <Card className=" lg:w-auto">
        <CardContent className="p-4">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => date && setSelected(date)}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-lg border"
            captionLayout="dropdown"
          />
        </CardContent>
      </Card>

      <div className="flex-1 space-y-4">
        <Card className="">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {format(selected, "EEEE, MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a thought for this day..."
                value={newThought}
                onChange={(e) => setNewThought(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
              />
              <Button onClick={handleAddThought} disabled={!newThought.trim()} size="icon" className="shrink-0">
                <Plus className="size-4" />
              </Button>
            </div>

            {selectedThoughts.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Thoughts</h4>
                <div className="space-y-2">
                  {selectedThoughts.map((t) => (
                    <div key={t.id} className="text-sm p-2 rounded-md bg-muted/50">
                      <p className="whitespace-pre-wrap">{t.body}</p>
                      {t.category && (
                        <span
                          className="text-[10px] px-1 py-0.5 rounded mt-1 inline-block"
                          style={{ backgroundColor: `${t.category.color ?? "#888"}20`, color: t.category.color ?? "#888" }}
                        >
                          {t.category.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedReminders.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Reminders</h4>
                <div className="space-y-1">
                  {selectedReminders.map((r) => (
                    <div key={r.id} className="flex items-center gap-2 text-sm">
                      <span className={`size-1.5 rounded-full ${r.isCompleted ? "bg-green-500" : "bg-yellow-500"}`} />
                      <span className={r.isCompleted ? "line-through text-muted-foreground" : ""}>
                        {r.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedThoughts.length === 0 && selectedReminders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Brain className="size-8 mb-2 opacity-50" />
                <p className="text-sm">Nothing for this day</p>
                <p className="text-xs">Add a thought or create a reminder</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
