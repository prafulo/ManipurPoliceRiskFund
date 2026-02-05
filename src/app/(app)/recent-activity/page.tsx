'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import type { Activity } from '@/lib/types';
import { ActivityTable } from './components/activity-table';

export default function RecentActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });

  const getActivities = useCallback(async () => {
    setIsLoading(true);
    let url = `/api/activities?page=${page}&limit=15`;
    if (dateRange?.from) {
      url += `&startDate=${dateRange.from.toISOString()}`;
      url += `&endDate=${(dateRange.to || new Date()).toISOString()}`;
    }
    
    try {
      const res = await fetch(url);
      const data = await res.json();
      setActivities(data.activities || []);
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error("Failed to fetch activities", error);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, page]);

  useEffect(() => {
    getActivities();
  }, [getActivities]);

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setPage(1);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Recent Activity</h2>
          <p className="text-muted-foreground">Detailed log of system events.</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-[300px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
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
              onSelect={handleDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <ActivityTable 
        data={activities} 
        isLoading={isLoading} 
        pagination={{
            currentPage: page,
            totalPages: totalPages,
            onPageChange: setPage
        }}
      />
    </div>
  );
}
