'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { MemberTable } from "./components/member-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ImportMembersDialog } from "./components/import-members-dialog";

export default function MembersPage() {
  const [data, setData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [status, setStatus] = React.useState<'Opened' | 'Closed'>('Opened');
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState('');

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
        const res = await fetch(`/api/members?status=${status}&page=${page}&limit=10&query=${searchQuery}`);
        const result = await res.json();
        setData(result.members || []);
        setTotalPages(result.pages || 1);
    } catch (error) {
        console.error("Failed to fetch members data", error);
        setData([]);
    } finally {
        setIsLoading(false);
    }
  }, [status, page, searchQuery]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (value: string) => {
    setStatus(value as 'Opened' | 'Closed');
    setPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  if (isLoading && data.length === 0) {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-10 w-full max-w-md mb-4" />
            <Card><CardContent className="p-8 space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card>
        </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Members</h2>
          <p className="text-muted-foreground">Manage your organization's members.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ImportMembersDialog />
          <Link href="/members/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="Opened" value={status} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="Opened">Opened</TabsTrigger>
          <TabsTrigger value="Closed">Closed</TabsTrigger>
        </TabsList>
        <TabsContent value={status} className="mt-4">
          <MemberTable 
            data={data} 
            listType={status === 'Opened' ? 'opened' : 'closed'} 
            isLoading={isLoading}
            pagination={{
                currentPage: page,
                totalPages: totalPages,
                onPageChange: setPage
            }}
            onSearch={handleSearch}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
