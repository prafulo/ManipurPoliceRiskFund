"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-5 bg-card border border-border/60 rounded-2xl shadow-lg ring-1 ring-black/[0.03]",
        className
      )}
      classNames={{
        months: "flex flex-col sm:flex-row gap-6",
        month: "space-y-5",
        caption: "flex justify-center pt-1.5 pb-2 relative items-center px-10 border-b border-border/40 mb-1",
        caption_label: "text-sm font-bold tracking-tight text-foreground",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-card p-0 opacity-60 hover:opacity-100 hover:bg-accent/40 border-border/50 rounded-lg transition-all duration-200 absolute left-1.5"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-card p-0 opacity-60 hover:opacity-100 hover:bg-accent/40 border-border/50 rounded-lg transition-all duration-200 absolute right-1.5"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "grid grid-cols-7 mb-1",
        weekday: "text-muted-foreground/70 w-10 font-semibold text-[0.65rem] uppercase tracking-widest flex items-center justify-center select-none",
        week: "grid grid-cols-7 w-full mt-0.5 gap-0.5",
        day: "h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-medium text-sm aria-selected:opacity-100 hover:bg-accent/30 hover:text-accent-foreground rounded-xl transition-all duration-150"
        ),
        selected: "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-xl shadow-md ring-2 ring-primary/25 font-bold",
        today: "bg-accent/30 text-accent-foreground font-extrabold ring-1 ring-accent/50 rounded-xl",
        outside: "day-outside text-muted-foreground/40 opacity-40 aria-selected:bg-accent/30 aria-selected:text-muted-foreground aria-selected:opacity-25",
        disabled: "text-muted-foreground/40 opacity-40 cursor-not-allowed line-through",
        range_middle: "aria-selected:bg-accent/20 aria-selected:text-accent-foreground",
        hidden: "invisible",
        dropdowns: "flex gap-2.5",
        dropdown: "appearance-none px-3.5 py-1.5 text-sm font-bold bg-card text-foreground border border-border/60 rounded-lg shadow-sm hover:bg-accent/20 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-primary cursor-pointer transition-all duration-200",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => orientation === "left" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
      }}
      captionLayout="dropdown"
      startMonth={new Date(1900, 0)}
      endMonth={new Date(new Date().getFullYear() + 20, 11)}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
