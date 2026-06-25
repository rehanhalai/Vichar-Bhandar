"use client"

import { useState } from "react"
import { CalendarDays, GanttChart, Plus, ChevronLeft, ChevronRight, X, Clock, Pencil } from "lucide-react"
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameDay, isSameMonth, isToday,
  differenceInDays, addDays, subDays, min, max, addMonths, subMonths, parse
} from "date-fns"
import { cn } from "@/lib/utils"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CategorySelector } from "@/components/categories/category-selector"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

export type Priority = "high" | "medium" | "low"

export type Reminder = {
  id: string
  title: string
  detail?: string
  priority: Priority
  createdAt: Date
  startAt?: Date
  dueAt: Date
  dueTime?: string
  category?: string
  categoryId?: string | null
  completed: boolean
}

export interface RemindersViewProps {
  reminders: Reminder[]
  onToggleComplete: (id: string, completed: boolean) => void
  onAddClick?: () => void
  onEditClick?: (id: string) => void
}

const priorityConfig: Record<Priority, { bar: string; dot: string; badge: string }> = {
  high:   { bar: "bg-red-100 text-red-800",    dot: "bg-red-400",    badge: "bg-red-100 text-red-800 border-red-200" },
  medium: { bar: "bg-amber-100 text-amber-800", dot: "bg-amber-400",  badge: "bg-amber-100 text-amber-800 border-amber-200" },
  low:    { bar: "bg-green-100 text-green-800", dot: "bg-green-400",  badge: "bg-green-100 text-green-800 border-green-200" },
}

function getUrgency(task: Reminder): { label: string; className: string } {
  if (task.completed) return { label: "Done", className: "bg-green-100 text-green-800" }
  const days = differenceInDays(task.dueAt, new Date())
  if (days < 0)  return { label: `${Math.abs(days)}d overdue`, className: "bg-red-100 text-red-800" }
  if (days === 0) return { label: "Due today",                  className: "bg-red-100 text-red-800" }
  if (days <= 2)  return { label: `${days}d left`,              className: "bg-amber-100 text-amber-800" }
  return                  { label: `${days}d left`,              className: "bg-green-100 text-green-800" }
}

export default function RemindersView({ reminders, onToggleComplete, onAddClick, onEditClick }: RemindersViewProps) {
  const [view, setView] = useState<"calendar" | "timeline">("calendar")
  const [filter, setFilter] = useState<"pending" | "completed" | "all">("pending")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const filtered = reminders.filter(r => {
    const statusMatch = filter === "all" ? true :
                        filter === "pending" ? !r.completed :
                        r.completed
    const categoryMatch = categoryFilter ? r.categoryId === categoryFilter : true
    return statusMatch && categoryMatch
  })

  // Calendar setup
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  // Timeline setup
  const rangeStart = startDate
  const rangeEnd = endDate
  const totalDays = differenceInDays(rangeEnd, rangeStart) + 1
  const dayW = Math.max(38, Math.floor(560 / totalDays))
  const timelineDays = days

  const sortedTimeline = [...filtered].filter(r => {
    const taskStart = r.startAt || r.dueAt
    const taskEnd = r.dueAt
    return taskStart <= rangeEnd && taskEnd >= rangeStart
  }).sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())

  return (
    <div className="flex flex-col gap-4">
      {/* TOP BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3 sm:flex sm:w-auto">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="w-full sm:w-[200px]">
            <CategorySelector value={categoryFilter} onChange={setCategoryFilter} />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex gap-2">
            <Button
              variant={view === "calendar" ? "default" : "outline"}
              size="icon"
              onClick={() => setView("calendar")}
              aria-label="Calendar view"
            >
              <CalendarDays className="w-4 h-4" />
            </Button>
            <Button
              variant={view === "timeline" ? "default" : "outline"}
              size="icon"
              onClick={() => setView("timeline")}
              aria-label="Timeline view"
            >
              <GanttChart className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="destructive" onClick={onAddClick}>
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Add reminder</span>
            <span className="sm:hidden ml-1">Add</span>
          </Button>
        </div>
      </div>
      {/* Shared Nav Row */}
      <div className="flex items-center justify-between p-2 border rounded-md bg-card shadow-sm text-card-foreground">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => {
            const now = new Date()
            setCurrentMonth(now)
            setSelectedDate(now)
          }}>
            Today
          </Button>
        </div>
        <div className="font-medium text-sm">{format(currentMonth, "MMMM yyyy")}</div>
        <div className="w-24" /> {/* Spacer */}
      </div>

      {view === "calendar" && (
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full min-w-0">
          <div className="flex-1 w-full min-w-0 border rounded-md overflow-x-auto bg-card text-card-foreground shadow-sm">
            <div className="min-w-[600px] flex flex-col">
              {/* Headers */}
              <div className="grid grid-cols-7 border-b bg-muted/30">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                  <div key={dayName} className="p-2 text-center text-xs text-muted-foreground font-medium">
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7 auto-rows-fr">
                {days.map((day, idx) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth)
                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                  const dayReminders = filtered.filter(r => isSameDay(r.dueAt, day))
                  const displayedReminders = dayReminders.slice(0, 2)
                  const extraCount = dayReminders.length - 2

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "min-h-24 p-1 border-b border-r last:border-r-0 hover:bg-muted/10 cursor-pointer flex flex-col gap-1 transition-colors min-w-0",
                        !isCurrentMonth && "text-muted-foreground/40 bg-muted/5",
                        isSelected && "ring-1 ring-inset ring-primary bg-primary/5",
                        idx % 7 === 6 && "border-r-0"
                      )}
                    >
                      <div className="flex justify-start p-1 shrink-0">
                        <span className={cn(
                          "text-xs font-medium w-6 h-6 flex items-center justify-center shrink-0",
                          isToday(day) ? "rounded-full bg-red-500 text-white" : ""
                        )}>
                          {format(day, "d")}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 flex-1 px-1 min-w-0">
                        {isCurrentMonth && displayedReminders.map(r => (
                          <div
                            key={r.id}
                            className={cn(
                              "px-1.5 py-0.5 rounded text-[10px] font-medium truncate",
                              priorityConfig[r.priority].bar,
                              r.completed && "line-through opacity-40"
                            )}
                          >
                            {r.title}
                          </div>
                        ))}
                        {isCurrentMonth && extraCount > 0 && (
                          <div className="text-[10px] text-muted-foreground font-medium px-1 truncate">
                            +{extraCount} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Panel */}
          <div className="w-full md:w-80 border rounded-md bg-card text-card-foreground flex flex-col self-start shrink-0 shadow-sm">
            {selectedDate ? (
              <>
                <div className="flex items-center justify-between p-3 border-b bg-muted/20">
                  <div>
                    <div className="font-semibold text-sm">{format(selectedDate, "EEEE, MMMM d")}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {filtered.filter(r => isSameDay(r.dueAt, selectedDate)).length} tasks
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedDate(null)} className="h-8 w-8">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-3 flex flex-col gap-3 max-h-[500px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {filtered.filter(r => isSameDay(r.dueAt, selectedDate)).length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-8">No reminders for this day.</div>
                  ) : (
                    filtered.filter(r => isSameDay(r.dueAt, selectedDate)).map(r => (
                      <div key={r.id} className="flex gap-3 items-start border p-3 rounded-lg bg-background shadow-sm">
                        <Checkbox
                          checked={r.completed}
                          onCheckedChange={(c) => onToggleComplete(r.id, !!c)}
                          className="mt-1"
                        />
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className={cn("text-sm font-medium leading-none", r.completed && "line-through text-muted-foreground")}>
                              {r.title}
                            </div>
                            {onEditClick && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 -mt-1 -mr-1 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                                onClick={() => onEditClick(r.id)}
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          {r.detail && <div className="text-xs text-muted-foreground">{r.detail}</div>}
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border", priorityConfig[r.priority].badge)}>
                              {r.priority}
                            </Badge>
                            {r.category && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {r.category}
                              </Badge>
                            )}
                            {r.dueTime && (
                              <div className="flex items-center text-[10px] text-muted-foreground gap-1">
                                <Clock className="w-3 h-3" />
                                {r.dueTime}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (() => {
              const monthReminders = filtered.filter(r => isSameMonth(r.dueAt, currentMonth)).sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())
              return (
                <>
                  <div className="flex items-center justify-between p-3 border-b bg-muted/20">
                    <div>
                      <div className="font-semibold text-sm">{format(currentMonth, "MMMM yyyy")} Tasks</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {monthReminders.length} tasks
                      </div>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col gap-3 max-h-[500px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {monthReminders.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-8">No reminders for this month.</div>
                    ) : (
                      monthReminders.map(r => (
                        <div key={r.id} className="flex gap-3 items-start border p-3 rounded-lg bg-background shadow-sm hover:border-primary/50 transition-colors">
                          <Checkbox
                            checked={r.completed}
                            onCheckedChange={(c) => onToggleComplete(r.id, !!c)}
                            className="mt-1"
                          />
                          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className={cn("text-sm font-medium leading-none", r.completed && "line-through text-muted-foreground")}>
                                {r.title}
                              </div>
                              {onEditClick && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 -mt-1 -mr-1 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                                  onClick={() => onEditClick(r.id)}
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                            {r.detail && <div className="text-xs text-muted-foreground truncate">{r.detail}</div>}
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-[10px] text-muted-foreground font-medium bg-muted/50 px-1.5 py-0.5 rounded">
                                {format(r.dueAt, "MMM d")}
                              </span>
                              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border", priorityConfig[r.priority].badge)}>
                                {r.priority}
                              </Badge>
                              {r.category && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {r.category}
                                </Badge>
                              )}
                              {r.dueTime && (
                                <div className="flex items-center text-[10px] text-muted-foreground gap-1">
                                  <Clock className="w-3 h-3" />
                                  {format(parse(r.dueTime, "HH:mm", new Date()), "h:mm a")}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {view === "timeline" && (
        <TooltipProvider>
          <div className="flex border rounded-md overflow-hidden bg-card text-card-foreground shadow-sm w-full min-w-0">
            {/* Label Column */}
            <div className="w-32 shrink-0 border-r bg-muted/20 flex flex-col z-20">
              <div className="h-10 border-b flex items-center px-3 text-xs font-medium text-muted-foreground">Task</div>
              {sortedTimeline.map(r => (
                <div key={r.id} className="h-11 border-b last:border-b-0 px-3 flex flex-col justify-center overflow-hidden">
                  <div className={cn("truncate text-xs font-medium", r.completed && "line-through text-muted-foreground")}>{r.title}</div>
                  {r.category && <div className="text-[10px] text-muted-foreground truncate">{r.category}</div>}
                </div>
              ))}
            </div>

            {/* Track Area */}
            <div className="flex-1 overflow-x-auto relative">
              <div className="flex flex-col min-w-max relative">
                {/* Ruler */}
                <div className="h-10 border-b flex relative">
                  {timelineDays.map(day => (
                    <div
                      key={day.toISOString()}
                      style={{ width: dayW }}
                      className={cn(
                        "flex flex-col items-center justify-center border-r last:border-r-0 shrink-0",
                        isToday(day) && "bg-red-500/5"
                      )}
                    >
                      <div className={cn("text-[10px] text-muted-foreground", isToday(day) && "text-red-500 font-medium")}>{format(day, "EEE")}</div>
                      <div className="text-[9px] text-muted-foreground">{format(day, "d")}</div>
                    </div>
                  ))}
                  
                  {/* Today line spanning full height of tracks */}
                  <div
                    className="absolute top-10 bottom-0 w-[1.5px] bg-red-500/70 z-10 pointer-events-none"
                    style={{
                      left: differenceInDays(new Date(), rangeStart) * dayW + dayW / 2
                    }}
                  />
                </div>

                {/* Rows */}
                {sortedTimeline.map(r => {
                  const actualStart = r.startAt || r.dueAt
                  let left = differenceInDays(actualStart, rangeStart) * dayW
                  let width = (differenceInDays(r.dueAt, actualStart) + 1) * dayW
                  
                  if (left < 0) {
                    width += left
                    left = 0
                  }
                  
                  if (left + width > totalDays * dayW) {
                    width = (totalDays * dayW) - left
                  }

                  const urgency = getUrgency(r)

                  return (
                    <div key={r.id} className="h-11 border-b last:border-b-0 relative flex group hover:bg-muted/5 transition-colors w-full">
                      <Tooltip>
                        <TooltipTrigger
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 h-7 rounded-md cursor-pointer transition-opacity z-10 hover:brightness-95",
                            priorityConfig[r.priority].bar,
                            r.completed && "opacity-40",
                            !r.startAt && "w-7 rounded-full"
                          )}
                          style={{ 
                            left: !r.startAt ? left + (dayW - 28) / 2 : left, 
                            width: !r.startAt ? 28 : Math.max(width, dayW * 0.8) 
                          }}
                        />
                        <TooltipContent className="flex flex-col gap-1.5 z-50">
                          <div className={cn("font-medium", r.completed && "line-through opacity-70")}>{r.title}</div>
                          {r.startAt && (
                            <div className="flex gap-2 text-xs">
                              <span className="text-muted-foreground">Start:</span>
                              <span>{format(r.startAt, "MMM d")}</span>
                            </div>
                          )}
                          <div className="flex gap-2 text-xs">
                            <span className="text-muted-foreground">Due:</span>
                            <span>{format(r.dueAt, "MMM d")}</span>
                          </div>
                          {r.dueTime && (
                            <div className="flex gap-2 text-xs">
                              <span className="text-muted-foreground">Time:</span>
                              <span>{format(parse(r.dueTime, "HH:mm", new Date()), "h:mm a")}</span>
                            </div>
                          )}
                          {r.category && (
                            <div className="flex gap-2 text-xs">
                              <span className="text-muted-foreground">Category:</span>
                              <span>{r.category}</span>
                            </div>
                          )}
                          <div className="mt-1">
                            <Badge variant="secondary" className={cn("text-[10px] border-transparent", urgency.className)}>{urgency.label}</Badge>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      <div
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-background z-20 shadow-sm pointer-events-none",
                          priorityConfig[r.priority].dot
                        )}
                        style={{ left: !r.startAt ? left + dayW / 2 - 4 : left + dayW / 2 - 4 }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </TooltipProvider>
      )}
    </div>
  )
}
