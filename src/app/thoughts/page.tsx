import { getAllThoughts } from "@/actions/thoughts"
import { TimelineView } from "@/components/thoughts/timeline-view"

export const dynamic = 'force-dynamic'

export default async function ThoughtsPage() {
  const thoughts = await getAllThoughts()

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <TimelineView thoughts={thoughts} />
        </div>
      </div>
    </div>
  )
}
