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

export function ImportPaymentsDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const headers = [
      'Membership Code', 'EIN (Service Number)', 'Member Name', 
      'Amount', 'Year', 'Months (Comma separated 1-12)', 'Payment Date (YYYY-MM-DD)'
    ];
    const data = [
      ['PHQ-30001-0225', '123456', 'John Doe', 300, 2024, '1,2,3', '2024-03-15'],
      ['1MR-30005-0225', '654321', 'Jane Smith', 100, 2024, '1', '2024-01-10']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, "Payment_Import_Template.xlsx");
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
          membershipCode: String(row['Membership Code'] || ''),
          serviceNumber: String(row['EIN (Service Number)'] || ''),
          amount: Number(row['Amount']),
          year: Number(row['Year']),
          months: String(row['Months (Comma separated 1-12)'] || '').split(',').map(m => parseInt(m.trim())),
          paymentDate: row['Payment Date (YYYY-MM-DD)'],
        }));

        const response = await fetch('/api/payments/bulk-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payments: formattedData })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to import payments');
        }

        toast({
          title: "Import Successful",
          description: `${result.count} payment records have been imported.`,
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
          <DialogTitle>Import Subscription Payments</DialogTitle>
          <DialogDescription>
            Upload an Excel file to bulk record subscription payments.
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
              id="payment-file-upload"
              ref={fileInputRef}
              disabled={isUploading}
            />
            <label htmlFor="payment-file-upload">
              <Button asChild variant="default" className="w-full" disabled={isUploading}>
                <span>
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
                  {isUploading ? 'Importing...' : 'Upload Excel File'}
                </span>
              </Button>
            </label>
          </div>
        </div>
        <DialogFooter className="text-xs text-muted-foreground text-center">
          Note: Payments will be matched using Membership Code or EIN.
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}