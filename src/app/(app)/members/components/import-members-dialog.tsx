
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileUp, Download, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function ImportMembersDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const headers = [
      'Name', 'Father Name', 'Rank', 'Trade', 'EIN (Service No)', 'Badge No',
      'Blood Group', 'Post Type (Officiating/Temporary/Substantive)', 'Joining Rank',
      'DOB (YYYY-MM-DD)', 'Enrollment Date (YYYY-MM-DD)', 'Superannuation Date (YYYY-MM-DD)', 'Address', 'Phone',
      'Unit Name', 'Status (Opened/Closed)', 'Subscription Start (YYYY-MM-DD)',
      'Date Applied (YYYY-MM-DD)', 'Receipt Date (YYYY-MM-DD)', 'Allotment Date (YYYY-MM-DD)'
    ];
    const data = [
      ['John Doe', 'Richard Doe', 'Sub-Inspector', 'General', '123456', 'B-101', 'O+', 'Substantive', 'Constable', '1985-05-20', '2010-01-15', '2045-05-20', 'Police HQ, Imphal', '9876543210', 'PHQ', 'Opened', '2010-02-01', '2009-12-01', '2009-12-15', '2010-01-01']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, "Member_Import_Template.xlsx");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const binaryStr = e.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet) as any[];

        if (rows.length === 0) {
          throw new Error('The selected file is empty.');
        }

        const formattedData = rows.map(row => ({
          name: row['Name'],
          fatherName: row['Father Name'],
          rank: row['Rank'],
          trade: row['Trade'],
          serviceNumber: String(row['EIN (Service No)'] || ''),
          badgeNumber: String(row['Badge No'] || ''),
          bloodGroup: row['Blood Group'],
          memberPostType: row['Post Type (Officiating/Temporary/Substantive)'],
          joiningRank: row['Joining Rank'],
          dateOfBirth: row['DOB (YYYY-MM-DD)'],
          dateOfEnrollment: row['Enrollment Date (YYYY-MM-DD)'],
          superannuationDate: row['Superannuation Date (YYYY-MM-DD)'],
          address: row['Address'],
          phone: String(row['Phone'] || ''),
          unitName: row['Unit Name'],
          status: row['Status (Opened/Closed)'],
          subscriptionStartDate: row['Subscription Start (YYYY-MM-DD)'],
          dateApplied: row['Date Applied (YYYY-MM-DD)'],
          receiptDate: row['Receipt Date (YYYY-MM-DD)'],
          allotmentDate: row['Allotment Date (YYYY-MM-DD)'],
        }));

        const response = await fetch('/api/members/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ members: formattedData })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to import members');
        }

        toast({
          title: "Import Successful",
          description: `${result.count} members have been imported.`,
        });
        
        setIsOpen(false);
        router.refresh();

      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: error.message,
        });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileUp className="mr-2 h-4 w-4" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Members</DialogTitle>
          <DialogDescription>
            Upload an Excel file to bulk register members. 
            Download the template to see the required format.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button variant="secondary" onClick={downloadTemplate} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
              id="member-file-upload"
              ref={fileInputRef}
              disabled={isUploading}
            />
            <label htmlFor="member-file-upload">
              <Button asChild variant="default" className="w-full" disabled={isUploading}>
                <span>
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
                  {isUploading ? 'Importing...' : 'Upload Excel File'}
                </span>
              </Button>
            </label>
          </div>
        </div>
        <DialogFooter className="text-xs text-muted-foreground text-center sm:text-left">
          Note: Membership codes will be auto-generated based on the provided Unit Name.
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
