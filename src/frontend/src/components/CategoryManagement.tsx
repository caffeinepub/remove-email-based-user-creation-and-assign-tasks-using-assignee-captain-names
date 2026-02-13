import { useState } from 'react';
import {
  useGetTaskCategories,
  useGetSubCategories,
  useGetTaskStatuses,
  useGetPaymentStatuses,
  useCreateTaskCategory,
  useCreateSubCategory,
  useCreateTaskStatus,
  useCreatePaymentStatus,
} from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import type { TaskCategory } from '../backend';

export default function CategoryManagement() {
  const { data: categories = [] } = useGetTaskCategories();
  const { data: subCategories = [] } = useGetSubCategories();
  const { data: statuses = [] } = useGetTaskStatuses();
  const { data: paymentStatuses = [] } = useGetPaymentStatuses();

  const createCategory = useCreateTaskCategory();
  const createSubCategory = useCreateSubCategory();
  const createStatus = useCreateTaskStatus();
  const createPayment = useCreatePaymentStatus();

  const [newCategory, setNewCategory] = useState('');
  const [newSubCategory, setNewSubCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newPayment, setNewPayment] = useState('');

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      await createCategory.mutateAsync(newCategory.trim());
      setNewCategory('');
    }
  };

  const handleCreateSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubCategory.trim() && selectedCategory) {
      await createSubCategory.mutateAsync({
        name: newSubCategory.trim(),
        category: selectedCategory,
      });
      setNewSubCategory('');
    }
  };

  const handleCreateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStatus.trim()) {
      await createStatus.mutateAsync(newStatus.trim());
      setNewStatus('');
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPayment.trim()) {
      await createPayment.mutateAsync(newPayment.trim());
      setNewPayment('');
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Task Categories</CardTitle>
          <CardDescription>Manage task categories and sub-categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleCreateCategory} className="space-y-3">
            <Label htmlFor="category">New Category</Label>
            <div className="flex gap-2">
              <Input
                id="category"
                placeholder="Enter category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button type="submit" disabled={createCategory.isPending}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="space-y-2">
            <Label>Existing Categories</Label>
            <div className="flex flex-wrap gap-2">
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No categories yet</p>
              ) : (
                categories.map((cat) => (
                  <Badge key={cat.id} variant="secondary">
                    {cat.name}
                  </Badge>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleCreateSubCategory} className="space-y-3">
            <Label htmlFor="subCategory">New Sub-Category</Label>
            <Select
              value={selectedCategory?.id || ''}
              onValueChange={(value) => {
                const cat = categories.find((c) => c.id === value);
                setSelectedCategory(cat || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                id="subCategory"
                placeholder="Enter sub-category name"
                value={newSubCategory}
                onChange={(e) => setNewSubCategory(e.target.value)}
                disabled={!selectedCategory}
              />
              <Button type="submit" disabled={createSubCategory.isPending || !selectedCategory}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="space-y-2">
            <Label>Existing Sub-Categories</Label>
            <div className="flex flex-wrap gap-2">
              {subCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sub-categories yet</p>
              ) : (
                subCategories.map((sub) => (
                  <Badge key={sub.id} variant="outline">
                    {sub.category.name} → {sub.name}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Statuses</CardTitle>
            <CardDescription>Manage task status options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleCreateStatus} className="space-y-3">
              <Label htmlFor="status">New Status</Label>
              <div className="flex gap-2">
                <Input
                  id="status"
                  placeholder="Enter status name"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                />
                <Button type="submit" disabled={createStatus.isPending}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </form>

            <div className="space-y-2">
              <Label>Existing Statuses</Label>
              <div className="flex flex-wrap gap-2">
                {statuses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No statuses yet</p>
                ) : (
                  statuses.map((status) => (
                    <Badge key={status.id} variant="secondary">
                      {status.name}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Statuses</CardTitle>
            <CardDescription>Manage payment status options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleCreatePayment} className="space-y-3">
              <Label htmlFor="payment">New Payment Status</Label>
              <div className="flex gap-2">
                <Input
                  id="payment"
                  placeholder="Enter payment status"
                  value={newPayment}
                  onChange={(e) => setNewPayment(e.target.value)}
                />
                <Button type="submit" disabled={createPayment.isPending}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </form>

            <div className="space-y-2">
              <Label>Existing Payment Statuses</Label>
              <div className="flex flex-wrap gap-2">
                {paymentStatuses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No payment statuses yet</p>
                ) : (
                  paymentStatuses.map((payment) => (
                    <Badge key={payment.id} variant="secondary">
                      {payment.name}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
