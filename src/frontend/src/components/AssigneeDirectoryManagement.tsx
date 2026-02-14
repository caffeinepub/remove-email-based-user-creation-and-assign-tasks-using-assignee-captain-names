import { useState, useRef } from 'react';
import { useGetAssigneeCaptainDirectory, useAddAssigneeCaptainPair, useUpdateAssigneeCaptainPair, useDeleteAssigneeCaptainPair, useBulkUpdateAssigneeCaptainPairs } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Trash2, UserPlus, Download, Upload, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { downloadAssigneeTemplate, parseAssigneeCsv } from '../utils/assigneeCsv';
import { toast } from 'sonner';
import AssigneeDetailsTab from './AssigneeDetailsTab';

interface OpenTab {
  assignee: string;
  captain: string;
}

export default function AssigneeDirectoryManagement() {
  const [assigneeName, setAssigneeName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [editingAssignee, setEditingAssignee] = useState<string | null>(null);
  const [deleteAssignee, setDeleteAssignee] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: directory = [], isLoading } = useGetAssigneeCaptainDirectory();
  const addPair = useAddAssigneeCaptainPair();
  const updatePair = useUpdateAssigneeCaptainPair();
  const deletePair = useDeleteAssigneeCaptainPair();
  const bulkUpdate = useBulkUpdateAssigneeCaptainPairs();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assigneeName.trim() || !captainName.trim()) {
      return;
    }

    if (editingAssignee) {
      await updatePair.mutateAsync({
        assignee: editingAssignee,
        update: {
          assignee: assigneeName.trim(),
          captain: captainName.trim(),
        },
      });
      setEditingAssignee(null);
    } else {
      await addPair.mutateAsync({
        assignee: assigneeName.trim(),
        captain: captainName.trim(),
      });
    }

    setAssigneeName('');
    setCaptainName('');
  };

  const handleEdit = (assignee: string, captain: string) => {
    setAssigneeName(assignee);
    setCaptainName(captain);
    setEditingAssignee(assignee);
  };

  const handleCancelEdit = () => {
    setAssigneeName('');
    setCaptainName('');
    setEditingAssignee(null);
  };

  const handleDelete = async () => {
    if (deleteAssignee) {
      await deletePair.mutateAsync(deleteAssignee);
      // Close the tab if it's open
      setOpenTabs(prev => prev.filter(tab => tab.assignee !== deleteAssignee));
      if (activeTab === `assignee-${deleteAssignee}`) {
        setActiveTab('list');
      }
      setDeleteAssignee(null);
    }
  };

  const handleDownloadTemplate = () => {
    downloadAssigneeTemplate();
    toast.success('Template downloaded successfully');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const { data, errors } = parseAssigneeCsv(text);

      if (errors.length > 0) {
        toast.error(`CSV validation failed: ${errors[0]}`);
        return;
      }

      if (data.length === 0) {
        toast.error('No valid data found in CSV file');
        return;
      }

      // Convert to backend format
      const pairs = data.map(row => ({
        assignee: row.assigneeName,
        captain: row.captainName,
      }));

      await bulkUpdate.mutateAsync(pairs);
    } catch (error) {
      toast.error('Failed to read CSV file');
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAssigneeClick = (assignee: string, captain: string) => {
    const existingTab = openTabs.find(tab => tab.assignee === assignee);
    
    if (!existingTab) {
      setOpenTabs(prev => [...prev, { assignee, captain }]);
    }
    setActiveTab(`assignee-${assignee}`);
  };

  const handleCloseTab = (assignee: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenTabs(prev => prev.filter(tab => tab.assignee !== assignee));
    if (activeTab === `assignee-${assignee}`) {
      setActiveTab('list');
    }
  };

  const isPending = addPair.isPending || updatePair.isPending || deletePair.isPending || bulkUpdate.isPending;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="list">Directory</TabsTrigger>
          {openTabs.map(tab => (
            <TabsTrigger key={tab.assignee} value={`assignee-${tab.assignee}`} className="gap-2">
              <span className="max-w-[120px] truncate">{tab.assignee}</span>
              <button
                onClick={(e) => handleCloseTab(tab.assignee, e)}
                className="ml-1 rounded-sm hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Bulk Import Assignees
              </CardTitle>
              <CardDescription>
                Import multiple assignee/captain pairs from a CSV file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleDownloadTemplate} 
                  variant="outline" 
                  className="gap-2"
                  disabled={isPending}
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="csv-upload"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <Upload className="h-4 w-4" />
                    {bulkUpdate.isPending ? 'Uploading...' : 'Upload CSV'}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Download the template, fill in your assignee and captain names, then upload the completed CSV file.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                {editingAssignee ? 'Edit Assignee/Captain Pair' : 'Add Assignee/Captain Pair'}
              </CardTitle>
              <CardDescription>
                {editingAssignee 
                  ? 'Update the assignee and captain names below'
                  : 'Create a new assignee/captain pair that can be used when creating tasks'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="assigneeName">Assignee Name</Label>
                    <Input
                      id="assigneeName"
                      placeholder="Enter assignee name"
                      value={assigneeName}
                      onChange={(e) => setAssigneeName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="captainName">Captain Name</Label>
                    <Input
                      id="captainName"
                      placeholder="Enter captain name"
                      value={captainName}
                      onChange={(e) => setCaptainName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isPending || !assigneeName.trim() || !captainName.trim()}>
                    {isPending ? 'Saving...' : editingAssignee ? 'Update Pair' : 'Add Pair'}
                  </Button>
                  {editingAssignee && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assignee/Captain Directory</CardTitle>
              <CardDescription>
                Manage your assignee and captain pairs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : directory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No assignee/captain pairs yet. Add one above to get started.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Assignee Name</TableHead>
                        <TableHead>Captain Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {directory.map(([assignee, captain]) => (
                        <TableRow 
                          key={assignee}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleAssigneeClick(assignee, captain)}
                        >
                          <TableCell className="font-medium">{assignee}</TableCell>
                          <TableCell>{captain}</TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(assignee, captain);
                                }}
                                disabled={isPending}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteAssignee(assignee);
                                }}
                                disabled={isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {openTabs.map(tab => (
          <TabsContent key={tab.assignee} value={`assignee-${tab.assignee}`}>
            <AssigneeDetailsTab 
              assignee={tab.assignee}
              captain={tab.captain}
              onClose={() => {
                setOpenTabs(prev => prev.filter(t => t.assignee !== tab.assignee));
                setActiveTab('list');
              }}
            />
          </TabsContent>
        ))}
      </Tabs>

      <AlertDialog open={!!deleteAssignee} onOpenChange={(open) => !open && setDeleteAssignee(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignee/Captain Pair</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this assignee/captain pair? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deletePair.isPending}>
              {deletePair.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
