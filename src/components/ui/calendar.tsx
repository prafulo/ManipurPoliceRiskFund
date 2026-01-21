"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { format, parse } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const isSingle = props.mode === 'single';

  const [inputValue, setInputValue] = React.useState<string>(
    isSingle && props.selected ? format(props.selected as Date, "MM/dd/yyyy") : ""
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSingle) return;
    
    const value = e.target.value;
    setInputValue(value);
    
    const parsedDate = parse(value, "MM/dd/yyyy", new Date());
    if (!isNaN(parsedDate.getTime()) && props.onSelect) {
      const onSelectSingle = props.onSelect as (date: Date | undefined, ...args: any[]) => void;
      onSelectSingle(parsedDate, parsedDate, {} as any, e);
    }
  };

  React.useEffect(() => {
    if (isSingle && props.selected) {
      setInputValue(format(props.selected as Date, "MM/dd/yyyy"));
    } else if (isSingle && !props.selected) {
      setInputValue("");
    }
  }, [props.selected, isSingle]);

  return (
    <div className={cn(className)}>
       {isSingle && (
        <div className="p-3 pb-1">
          <Input
            type="text"
            placeholder="MM/dd/yyyy"
            value={inputValue}
            onChange={handleInputChange}
          />
        </div>
      )}
      <DayPicker
        weekStartsOn={1} 
        showOutsideDays={showOutsideDays}
        className="p-3"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_dropdowns: "flex justify-center gap-1",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          
          // Grid-based layout for modern react-day-picker v8+
          weekdays: 'grid grid-cols-7',
          weekday: 'text-muted-foreground w-9 h-9 flex items-center justify-center font-normal text-[0.8rem]',
          weeks: 'mt-2 grid gap-y-1',
          week: 'grid grid-cols-7',
          
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        captionLayout="dropdown-buttons"
        fromYear={1900}
        toYear={new Date().getFullYear() + 20}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
          IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        }}
        {...props}
      />
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
