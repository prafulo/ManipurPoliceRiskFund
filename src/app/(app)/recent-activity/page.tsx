'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import type { Activity } from '@/lib/types';
import { ActivityTable } from './components/activity-table';
import { subMonths } from 'date-fns';

export default function RecentActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });

  useEffect(() => {
    async function getActivities() {
      setIsLoading(true);
      let url = '/api/activities';
      if (dateRange?.from) {
        const from = dateRange.from.toISOString();
        // Use today for 'to' if it's not set in the range
        const to = (dateRange.to || new Date()).toISOString();
        url += `?startDate=${from}&endDate=${to}`;
      }
      
      try {
        const res = await fetch(url);
        const data = await res.json();
        setActivities(data.activities || []);
      } catch (error) {
        console.error("Failed to fetch activities", error);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    }
    getActivities();
  }, [dateRange]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Recent Activity</h2>
          <p className="text-muted-foreground">A log of all system activities. Data is available for the last 3 months.</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <ActivityTable data={activities} isLoading={isLoading} />
    </div>
  );
}
