"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, Loader2, Circle } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getAllCategories, createCategory } from "@/actions/categories"

interface CategorySelectorProps {
  value?: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
}

export function CategorySelector({ value, onChange, disabled }: CategorySelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const queryClient = useQueryClient()

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getAllCategories(Date.now()),
  })

  const createCatMutation = useMutation({
    mutationFn: async (name: string) => {
      // Pick a random nice color
      const colors = ["#3b82f6", "#ef4444", "#eab308", "#22c55e", "#8b5cf6", "#ec4899", "#f97316"]
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      return await createCategory(name, randomColor)
    },
    onSuccess: (newId) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      onChange(newId)
      setOpen(false)
      setSearch("")
    }
  })

  const selectedCategory = categories.find((c: any) => c.id === value)
  
  // Check if current search exactly matches an existing category
  const hasExactMatch = categories.some((c: any) => c.name.toLowerCase() === search.trim().toLowerCase())
  const showCreate = search.trim().length > 0 && !hasExactMatch

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger 
        className={cn(
          "flex w-full items-center justify-between sm:w-[200px] h-8 text-xs bg-muted/50 hover:bg-muted px-3 rounded-md border border-input outline-none focus:ring-1 focus:ring-ring",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
        disabled={disabled}
      >
        {selectedCategory ? (
          <div className="flex items-center gap-2 truncate">
            <Circle className="size-2.5 fill-current" style={{ color: selectedCategory.color || "#888" }} />
            {selectedCategory.name}
          </div>
        ) : (
          <span className="text-muted-foreground">Select category...</span>
        )}
        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search category..." 
            value={search} 
            onValueChange={setSearch} 
            autoFocus={false}
            className="h-8 text-xs"
          />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center">
                <Loader2 className="size-3 animate-spin mr-2" /> Loading...
              </div>
            ) : (
              <>
                <CommandEmpty>
                  {!showCreate ? "No category found." : "Type to create new"}
                </CommandEmpty>
                <CommandGroup>
                  {/* Client-side filter because we set shouldFilter=false to control the exact matching */}
                  {categories
                    .filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()))
                    .map((category: any) => (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      onSelect={() => {
                        onChange(category.id === value ? null : category.id)
                        setOpen(false)
                        setSearch("")
                      }}
                      className="text-xs flex items-center gap-2"
                    >
                      <Circle className="size-2.5 fill-current" style={{ color: category.color || "#888" }} />
                      <span className="flex-1 truncate">{category.name}</span>
                      <Check
                        className={cn(
                          "ml-auto h-3.5 w-3.5",
                          value === category.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                  
                  {showCreate && (
                    <CommandItem
                      onSelect={() => createCatMutation.mutate(search.trim())}
                      className="text-xs text-primary font-medium flex items-center gap-2"
                      disabled={createCatMutation.isPending}
                    >
                      {createCatMutation.isPending ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Plus className="size-3" />
                      )}
                      Create "{search.trim()}"
                    </CommandItem>
                  )}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
