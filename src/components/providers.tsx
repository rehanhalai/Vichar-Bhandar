"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { ReminderDialog } from "@/components/reminders/reminder-dialog"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReminderDialog />
    </QueryClientProvider>
  )
}
