import { getAllThoughts } from "@/actions/thoughts";
import { TimelineView } from "@/components/thoughts/timeline-view";
import { QuickCapture } from "@/components/capture/quick-capture";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const thoughts = await getAllThoughts();
  
  return (
    <>
      <TimelineView thoughts={thoughts} />
      <QuickCapture />
    </>
  );
}
