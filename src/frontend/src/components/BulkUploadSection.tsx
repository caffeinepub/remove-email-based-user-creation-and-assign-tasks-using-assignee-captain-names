import { useState, useRef } from 'react';
import { useBulkCreateTasks } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function BulkUploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkCreateTasks = useBulkCreateTasks();
  const { identity } = useInternetIdentity();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'csv' || fileExtension === 'xlsx' || fileExtension === 'xls') {
        setFile(selectedFile);
      } else {
        toast.error('Please select a CSV or Excel file');
        e.target.value = '';
      }
    }
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter((line) => line.trim());
    return lines.map((line) => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });
  };

  const parseDateToTimestamp = (dateStr: string): bigint => {
    if (!dateStr || dateStr.trim() === '') return BigInt(0);
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return BigInt(0);
      return BigInt(date.getTime() * 1000000);
    } catch {
      return BigInt(0);
    }
  };

  const parseAmount = (amountStr: string): bigint => {
    if (!amountStr || amountStr.trim() === '') return BigInt(0);
    try {
      const cleaned = amountStr.replace(/[^0-9.]/g, '');
      const num = parseFloat(cleaned);
      if (isNaN(num)) return BigInt(0);
      return BigInt(Math.floor(num));
    } catch {
      return BigInt(0);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    if (!identity) {
      toast.error('Please log in to upload tasks');
      return;
    }

    setIsProcessing(true);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length < 2) {
        toast.error('File must contain at least a header row and one data row');
        setIsProcessing(false);
        return;
      }

      const header = rows[0].map((h) => h.toLowerCase().trim());
      
      // Required columns (case-insensitive)
      const clientIndex = header.findIndex((h) => h === 'client name');
      const categoryIndex = header.findIndex((h) => h === 'task category');
      const subCategoryIndex = header.findIndex((h) => h === 'sub category');
      
      // Optional columns
      const statusIndex = header.findIndex((h) => h === 'status');
      const commentIndex = header.findIndex((h) => h === 'comment');
      const assigneeIndex = header.findIndex((h) => h === 'assigned name');
      const dueDateIndex = header.findIndex((h) => h === 'due date');
      const assignmentDateIndex = header.findIndex((h) => h === 'assignment date');
      const completionDateIndex = header.findIndex((h) => h === 'completion date');
      const billIndex = header.findIndex((h) => h === 'bill');
      const advanceIndex = header.findIndex((h) => h === 'advance received');
      const outstandingIndex = header.findIndex((h) => h === 'outstanding amount');
      const paymentIndex = header.findIndex((h) => h === 'payment status');

      // Validate required columns
      const missingColumns: string[] = [];
      if (clientIndex === -1) missingColumns.push('Client Name');
      if (categoryIndex === -1) missingColumns.push('Task Category');
      if (subCategoryIndex === -1) missingColumns.push('Sub Category');

      if (missingColumns.length > 0) {
        toast.error(`Missing required columns: ${missingColumns.join(', ')}`);
        setIsProcessing(false);
        return;
      }

      // Get the current user's principal to assign as owner
      const ownerPrincipal = identity.getPrincipal();

      const tasksData: Array<{
        ownerPrincipal: typeof ownerPrincipal;
        client: string;
        taskCategory: string;
        subCategory: string;
        status: string;
        paymentStatus: string;
        assigneeName: string;
        captainName: string;
        comment: string;
        dueDate: bigint;
        assignmentDate: bigint;
        completionDate: bigint;
        bill: bigint;
        advanceReceived: bigint;
        outstandingAmount: bigint;
      }> = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 3) continue;

        const client = row[clientIndex]?.trim() || '';
        const category = row[categoryIndex]?.trim() || '';
        const subCategory = row[subCategoryIndex]?.trim() || '';

        // Skip rows without required fields
        if (!client || !category || !subCategory) {
          continue;
        }

        // Optional fields with defaults
        const status = statusIndex !== -1 ? row[statusIndex]?.trim() || 'Pending' : 'Pending';
        const comment = commentIndex !== -1 ? row[commentIndex]?.trim() || '' : '';
        const assigneeName = assigneeIndex !== -1 ? row[assigneeIndex]?.trim() || '' : '';
        const captainName = ''; // Not in new template, default to empty
        const paymentStatus = paymentIndex !== -1 ? row[paymentIndex]?.trim() || 'Unpaid' : 'Unpaid';
        
        const dueDate = dueDateIndex !== -1 ? parseDateToTimestamp(row[dueDateIndex]) : BigInt(0);
        const assignmentDate = assignmentDateIndex !== -1 ? parseDateToTimestamp(row[assignmentDateIndex]) : BigInt(0);
        const completionDate = completionDateIndex !== -1 ? parseDateToTimestamp(row[completionDateIndex]) : BigInt(0);
        
        const bill = billIndex !== -1 ? parseAmount(row[billIndex]) : BigInt(0);
        const advanceReceived = advanceIndex !== -1 ? parseAmount(row[advanceIndex]) : BigInt(0);
        const outstandingAmount = outstandingIndex !== -1 ? parseAmount(row[outstandingIndex]) : BigInt(0);

        tasksData.push({
          ownerPrincipal,
          client,
          taskCategory: category,
          subCategory,
          status,
          paymentStatus,
          assigneeName,
          captainName,
          comment,
          dueDate,
          assignmentDate,
          completionDate,
          bill,
          advanceReceived,
          outstandingAmount,
        });
      }

      if (tasksData.length === 0) {
        toast.error('No valid tasks found in the file. Please check that required columns (Client Name, Task Category, Sub Category) have values.');
        setIsProcessing(false);
        return;
      }

      await bulkCreateTasks.mutateAsync(tasksData);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success(`Successfully uploaded ${tasksData.length} tasks`);
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Failed to upload tasks. Please check your file format.';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 
      'Client Name,Task Category,Sub Category,Status,Comment,Assigned Name,Due Date,Assignment Date,Completion Date,Bill,Advance Received,Outstanding Amount,Payment Status\n' +
      'ABC Corp,Design,Logo Design,In Progress,Initial draft completed,John Doe,2026-03-15,2026-02-01,2026-03-10,5000,2000,3000,Partially Paid\n' +
      'XYZ Ltd,Development,Web Development,Pending,Waiting for requirements,Jane Smith,2026-04-01,2026-02-14,,10000,0,10000,Unpaid';

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'task_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Task Upload</CardTitle>
          <CardDescription>Upload multiple tasks at once using a CSV or Excel file</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Required columns:</strong> Client Name, Task Category, Sub Category<br />
              <strong>Optional columns:</strong> Status (default: Pending), Comment, Assigned Name, Due Date, Assignment Date, Completion Date, Bill, Advance Received, Outstanding Amount, Payment Status (default: Unpaid)<br />
              <strong>Date format:</strong> YYYY-MM-DD or MM/DD/YYYY
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-4">
            <Button variant="outline" onClick={downloadTemplate} className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>

            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="w-full cursor-pointer" asChild>
                  <span>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    {file ? file.name : 'Choose File'}
                  </span>
                </Button>
              </label>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!file || isProcessing || bulkCreateTasks.isPending}
              className="w-full sm:w-auto"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isProcessing || bulkCreateTasks.isPending ? 'Uploading...' : 'Upload Tasks'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
