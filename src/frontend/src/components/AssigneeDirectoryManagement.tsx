import { useState, useRef } from 'react';
import { useGetAssigneeCaptainDirectory, useAddAssigneeCaptainPair, useUpdateAssigneeCaptainPair, useDeleteAssigneeCaptainPair, useBulkUpdateAssigneeCaptainPairs, useBulkDeleteAssigneeCaptainPairs } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2, UserPlus, Download, Upload, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { downloadAssigneeTemplate, parseAssigneeCsv } from '../utils/assigneeCsv';
import { toast } from 'sonner';
import AssigneeDetailsTab from './AssigneeDetailsTab';
import BulkActionBar from './BulkActionBar';
import { useBulkSelection } from '../hooks/useBulkSelection';

interface OpenTab {
  assignee: string;
  captain: string;
}

export default function AssigneeDirectoryManagement() {
  const [assigneeName, setAssigneeName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [editingAssignee, setEditingAssignee] = useState<string | null>(null);
  const [deleteAssignee, setDeleteAssignee] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: directory = [], isLoading } = useGetAssigneeCaptainDirectory();
  const addPair = useAddAssigneeCaptainPair();
  const updatePair = useUpdateAssigneeCaptainPair();
  const deletePair = useDeleteAssigneeCaptainPair();
  const bulkUpdate = useBulkUpdateAssigneeCaptainPairs();
  const bulkDelete = useBulkDeleteAssigneeCaptainPairs();

  const {
    selectedIds,
    selectedCount,
    toggleOne,
    toggleAllVisible,
    clearSelection,
    isSelected,
    headerCheckboxState,
  } = useBulkSelection(directory, (pair) => pair[0]);

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
      setOpenTabs(prev => prev.filter(tab => tab.assignee !== deleteAssignee));
      if (activeTab === `assignee-${deleteAssignee}`) {
        setActiveTab('list');
      }
      setDeleteAssignee(null);
    }
  };

  const handleBulkDelete = async () => {
    const assignees = Array.from(selectedIds);
    await bulkDelete.mutateAsync(assignees);
    
    // Close tabs for deleted assignees
    setOpenTabs(prev => prev.filter(tab => !assignees.includes(tab.assignee)));
    if (assignees.some(a => activeTab === `assignee-${a}`)) {
      setActiveTab('list');
    }
    
    clearSelection();
    setIsBulkDeleting(false);
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

      const pairs = data.map(row => ({
        assignee: row.assigneeName,
        captain: row.captainName,
      }));

      await bulkUpdate.mutateAsync(pairs);
    } catch (error) {
      toast.error('Failed to process CSV file');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRowClick = (assignee: string, captain: string) => {
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

  const handleAssigneeDeleted = (assignee: string) => {
    setOpenTabs(prev => prev.filter(tab => tab.assignee !== assignee));
    if (activeTab === `assignee-${assignee}`) {
      setActiveTab('list');
    }
  };

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
                className="ml-1 rounded-sm hover:bg-muted p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Assignee/Captain Pair</CardTitle>
              <CardDescription>
                {editingAssignee ? 'Update the assignee and captain names' : 'Add a new assignee and captain pair to the directory'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="assignee">Assignee Name</Label>
                    <Input
                      id="assignee"
                      value={assigneeName}
                      onChange={(e) => setAssigneeName(e.target.value)}
                      placeholder="Enter assignee name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="captain">Captain Name</Label>
                    <Input
                      id="captain"
                      value={captainName}
                      onChange={(e) => setCaptainName(e.target.value)}
                      placeholder="Enter captain name"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={addPair.isPending || updatePair.isPending}>
                    {editingAssignee ? (
                      updatePair.isPending ? 'Updating...' : 'Update Pair'
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        {addPair.isPending ? 'Adding...' : 'Add Pair'}
                      </>
                    )}
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bulk Import</CardTitle>
                  <CardDescription>Upload a CSV file to import multiple assignee/captain pairs</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={bulkUpdate.isPending}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {bulkUpdate.isPending ? 'Uploading...' : 'Upload CSV'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {selectedCount > 0 && (
            <BulkActionBar selectedCount={selectedCount} onClearSelection={clearSelection}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBulkDeleting(true)}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete selected
              </Button>
            </BulkActionBar>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Assignee/Captain Directory</CardTitle>
              <CardDescription>
                {directory.length} {directory.length === 1 ? 'pair' : 'pairs'} in directory
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : directory.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center text-center">
                  <UserPlus className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No assignee/captain pairs yet</p>
                  <p className="text-sm text-muted-foreground">Add your first pair above</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={headerCheckboxState === 'checked'}
                            onCheckedChange={toggleAllVisible}
                            aria-label="Select all visible pairs"
                            className={headerCheckboxState === 'indeterminate' ? 'data-[state=checked]:bg-primary' : ''}
                            {...(headerCheckboxState === 'indeterminate' ? { 'data-state': 'indeterminate' } : {})}
                          />
                        </TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Captain</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {directory.map(([assignee, captain]) => (
                        <TableRow 
                          key={assignee}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected(assignee)}
                              onCheckedChange={() => toggleOne(assignee)}
                              aria-label={`Select ${assignee}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium" onClick={() => handleRowClick(assignee, captain)}>
                            {assignee}
                          </TableCell>
                          <TableCell onClick={() => handleRowClick(assignee, captain)}>
                            {captain}
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(assignee, captain);
                                }}
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
              onClose={() => handleAssigneeDeleted(tab.assignee)}
            />
          </TabsContent>
        ))}
      </Tabs>

      <AlertDialog open={!!deleteAssignee} onOpenChange={(open) => !open && setDeleteAssignee(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignee/Captain Pair</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the pair for "{deleteAssignee}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkDeleting} onOpenChange={setIsBulkDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Pairs</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} selected {selectedCount === 1 ? 'pair' : 'pairs'}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete} 
              disabled={bulkDelete.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkDelete.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
