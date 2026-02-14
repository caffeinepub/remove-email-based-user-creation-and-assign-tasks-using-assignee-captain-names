import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Pencil, Trash2, User, Users } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateAssigneeCaptainPair, useDeleteAssigneeCaptainPair } from '../hooks/useQueries';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface AssigneeDetailsTabProps {
  assignee: string;
  captain: string;
  onClose: () => void;
}

export default function AssigneeDetailsTab({ assignee, captain, onClose }: AssigneeDetailsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editAssigneeName, setEditAssigneeName] = useState(assignee);
  const [editCaptainName, setEditCaptainName] = useState(captain);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const updatePair = useUpdateAssigneeCaptainPair();
  const deletePair = useDeleteAssigneeCaptainPair();

  const handleSave = async () => {
    if (!editAssigneeName.trim() || !editCaptainName.trim()) {
      return;
    }

    await updatePair.mutateAsync({
      assignee,
      update: {
        assignee: editAssigneeName.trim(),
        captain: editCaptainName.trim(),
      },
    });

    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deletePair.mutateAsync(assignee);
    setShowDeleteDialog(false);
    onClose();
  };

  const handleCancelEdit = () => {
    setEditAssigneeName(assignee);
    setEditCaptainName(captain);
    setIsEditing(false);
  };

  const isPending = updatePair.isPending || deletePair.isPending;

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Assignee Details</h3>
          <p className="text-sm text-muted-foreground mt-1">View and manage assignee/captain pair</p>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button onClick={() => setShowDeleteDialog(true)} variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <Separator />

      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Assignee/Captain Pair</CardTitle>
            <CardDescription>Update the assignee and captain names</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-assignee">Assignee Name</Label>
              <Input
                id="edit-assignee"
                value={editAssigneeName}
                onChange={(e) => setEditAssigneeName(e.target.value)}
                placeholder="Enter assignee name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-captain">Captain Name</Label>
              <Input
                id="edit-captain"
                value={editCaptainName}
                onChange={(e) => setEditCaptainName(e.target.value)}
                placeholder="Enter captain name"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                disabled={isPending || !editAssigneeName.trim() || !editCaptainName.trim()}
              >
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button onClick={handleCancelEdit} variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Assignee Name
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{assignee}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Captain Name
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{captain}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignee/Captain Pair</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this assignee/captain pair? This action cannot be undone.
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
