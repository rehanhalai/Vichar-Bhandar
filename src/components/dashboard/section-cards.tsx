import { IconTrendingDown, IconTrendingUp, IconFlame, IconBell, IconBrain, IconSparkles, IconClockHour4 } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardsProps {
  thoughtsToday: number
  streak: number
  remindersDue: number
}

export function SectionCards({ thoughtsToday, streak, remindersDue }: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-sm lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader className="pt-4">
          <CardDescription>Thoughts Today</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {thoughtsToday}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {thoughtsToday > 0 ? <IconTrendingUp /> : <IconBrain />}
              {thoughtsToday > 0 ? `+${thoughtsToday}` : "0"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 py-4 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {thoughtsToday > 0 ? "Active today" : "No entries yet"}{" "}
            {thoughtsToday > 0 ? <IconTrendingUp className="size-4" /> : <IconBrain className="size-4" />}
          </div>
          <div className="text-muted-foreground">Thoughts captured today</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="pt-4">
          <CardDescription>Writing Streak</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {streak} days
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconFlame />
              {streak > 0 ? `${streak}d` : "0d"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 py-4 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {streak > 0 ? "Keep it !going" : "Start your streak"}{" "}
            {streak > 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">Consecutive days writing</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="pt-4">
          <CardDescription>Reminders Due</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {remindersDue}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconBell />
              {remindersDue > 0 ? `${remindersDue} pending` : "Clear"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 py-4 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {remindersDue > 0 ? "Needs attention" : "All caught up"}{" "}
            {remindersDue === 0 ? <IconTrendingUp className="size-4" /> : <IconClockHour4 className="size-4" />}
          </div>
          <div className="text-muted-foreground">Pending reminders</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="pt-4">
          <CardDescription>Mood</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            —
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconSparkles />
              N/A
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 py-4 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Coming soon <IconSparkles className="size-4" />
          </div>
          <div className="text-muted-foreground">Mood tracking feature</div>
        </CardFooter>
      </Card>
    </div>
  )
}
