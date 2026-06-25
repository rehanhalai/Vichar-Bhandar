import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain } from "lucide-react"
import { format } from "date-fns"

interface Thought {
  id: string
  body: string
  createdAt: Date | null
  category?: { name: string; color: string | null } | null
}

export function RecentThoughts({ thoughts }: { thoughts: Thought[] }) {
  if (thoughts.length === 0) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Thoughts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Brain className="size-8 mb-2 opacity-50" />
            <p className="text-sm">No thoughts yet</p>
            <p className="text-xs">Start typing above to capture your first thought</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Recent Thoughts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {[...thoughts]
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
            return dateB - dateA
          })
          .slice(0, 5)
          .map((thought) => (
          <div key={thought.id} className="group border-b border-border/50 pb-3 last:border-0 last:pb-0">
            <p className="text-sm leading-relaxed line-clamp-2">{thought.body}</p>
            <div className="flex items-center gap-2 mt-1">
              {thought.category && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${thought.category.color ?? "#888"}20`, color: thought.category.color ?? "#888" }}
                >
                  {thought.category.name}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground ml-auto">
                {thought.createdAt ? format(new Date(thought.createdAt), "h:mm a") : ""}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
