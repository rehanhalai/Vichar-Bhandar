"use client"

import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { updateThought } from "@/features/thoughts/actions"
import { useUIStore } from "@/store/ui-store"
import { CategorySelector } from "@/components/categories/category-selector"
import { Loader2 } from "lucide-react"
import { MOODS } from "@/lib/constants"

export function ThoughtDialog() {
  const { isThoughtDialogOpen, editingThought, closeThoughtDialog } = useUIStore()
  const queryClient = useQueryClient()
  
  const [body, setBody] = useState("")
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [mood, setMood] = useState<number | null>(null)

  useEffect(() => {
    if (isThoughtDialogOpen && editingThought) {
      setBody(editingThought.body || "")
      setCategoryId(editingThought.categoryId || null)
      setMood(editingThought.mood || null)
    } else {
      setBody("")
      setCategoryId(null)
      setMood(null)
    }
  }, [isThoughtDialogOpen, editingThought])

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Parameters<typeof updateThought>[1] }) => await updateThought(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thoughts'] })
      closeThoughtDialog()
    },
    onError: (err) => {
      console.error("Failed to update thought:", err)
    }
  })

  const handleSave = () => {
    if (!body.trim() || !editingThought) return

    updateMutation.mutate({
      id: editingThought.id,
      data: {
        body,
        categoryId,
        mood,
      }
    })
  }

  return (
    <Dialog open={isThoughtDialogOpen} onOpenChange={(open) => !open && closeThoughtDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Thought</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[120px] resize-none"
              placeholder="Your thought..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <div className="block">
                <CategorySelector
                  value={categoryId}
                  onChange={setCategoryId}
                  disabled={updateMutation.isPending}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mood</label>
              <div className="flex items-center gap-1 bg-muted/30 rounded-full px-2 py-1 border border-transparent w-fit">
                {MOODS.map((m, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMood(mood === i + 1 ? null : i + 1)}
                    className={`size-7 flex items-center justify-center rounded-full text-lg opacity-50 hover:opacity-100 transition-all ${mood === i + 1 ? "opacity-100 bg-background shadow-sm scale-110" : ""}`}
                    title={`Mood ${i + 1}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            className="w-full" 
            disabled={!body.trim() || updateMutation.isPending}
          >
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
