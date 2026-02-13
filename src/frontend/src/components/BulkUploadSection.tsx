import { useState, useRef } from 'react';
import { useBulkCreateTasks, useListAllUsers } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

export default function BulkUploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkCreateTasks = useBulkCreateTasks();
  const { data: users = [] } = useListAllUsers();

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

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
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
      const clientIndex = header.findIndex((h) => h.includes('client'));
      const categoryIndex = header.findIndex((h) => h.includes('category') && !h.includes('sub'));
      const subCategoryIndex = header.findIndex((h) => h.includes('sub'));
      const statusIndex = header.findIndex((h) => h.includes('status') && !h.includes('payment'));
      const paymentIndex = header.findIndex((h) => h.includes('payment'));
      const assigneeIndex = header.findIndex((h) => h.includes('assignee'));
      const captainIndex = header.findIndex((h) => h.includes('captain'));

      if (clientIndex === -1 || categoryIndex === -1 || subCategoryIndex === -1) {
        toast.error('CSV must contain Client, Category, and Sub Category columns');
        setIsProcessing(false);
        return;
      }

      if (assigneeIndex === -1 || captainIndex === -1) {
        toast.error('CSV must contain Assignee Name and Captain Name columns');
        setIsProcessing(false);
        return;
      }

      const tasksData: Array<[Principal, string, string, string, string, string, string, string]> = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < Math.max(clientIndex, categoryIndex, subCategoryIndex, assigneeIndex, captainIndex) + 1) {
          continue;
        }

        const client = row[clientIndex]?.trim() || '';
        const category = row[categoryIndex]?.trim() || '';
        const subCategory = row[subCategoryIndex]?.trim() || '';
        const status = statusIndex !== -1 ? row[statusIndex]?.trim() || 'Pending' : 'Pending';
        const paymentStatus = paymentIndex !== -1 ? row[paymentIndex]?.trim() || 'Unpaid' : 'Unpaid';
        const assigneeName = row[assigneeIndex]?.trim() || '';
        const captainName = row[captainIndex]?.trim() || '';

        if (!client || !category || !subCategory) {
          continue;
        }

        // Use the first user as owner, or anonymous if no users exist
        const ownerPrincipal = users.length > 0 
          ? Principal.fromText(`user-0`)
          : Principal.anonymous();

        tasksData.push([
          ownerPrincipal,
          client,
          category,
          subCategory,
          status,
          paymentStatus,
          assigneeName,
          captainName,
        ]);
      }

      if (tasksData.length === 0) {
        toast.error('No valid tasks found in the file');
        setIsProcessing(false);
        return;
      }

      await bulkCreateTasks.mutateAsync(tasksData);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success(`Successfully uploaded ${tasksData.length} tasks`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload tasks. Please check your file format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'Client,Category,Sub Category,Status,Payment Status,Assignee Name,Captain Name\n' +
      'Example Client,Design,Logo Design,In Progress,Paid,John Doe,Jane Smith\n' +
      'Another Client,Development,Web Development,Pending,Unpaid,Bob Wilson,Alice Johnson';

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
              Your CSV file must include the following columns: Client, Category, Sub Category, Assignee Name, and Captain Name.
              Status and Payment Status are optional (defaults: Pending, Unpaid).
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
