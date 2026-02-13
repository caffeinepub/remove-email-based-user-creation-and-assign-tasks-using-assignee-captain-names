import { useState } from 'react';
import { useGetAssigneeCaptainDirectory, useAddAssigneeCaptainPair, useUpdateAssigneeCaptainPair, useDeleteAssigneeCaptainPair } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, UserPlus } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function AssigneeDirectoryManagement() {
  const [assigneeName, setAssigneeName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [editingAssignee, setEditingAssignee] = useState<string | null>(null);
  const [deleteAssignee, setDeleteAssignee] = useState<string | null>(null);

  const { data: directory = [], isLoading } = useGetAssigneeCaptainDirectory();
  const addPair = useAddAssigneeCaptainPair();
  const updatePair = useUpdateAssigneeCaptainPair();
  const deletePair = useDeleteAssigneeCaptainPair();

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
      setDeleteAssignee(null);
    }
  };

  const isPending = addPair.isPending || updatePair.isPending || deletePair.isPending;

  return (
    <div className="space-y-6">
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
                    <TableRow key={assignee}>
                      <TableCell className="font-medium">{assignee}</TableCell>
                      <TableCell>{captain}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(assignee, captain)}
                            disabled={isPending}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteAssignee(assignee)}
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

      <AlertDialog open={!!deleteAssignee} onOpenChange={(open) => !open && setDeleteAssignee(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignee/Captain Pair</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this assignee/captain pair? This action cannot be undone.
              Existing tasks with this assignee will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
