import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Settings, Users } from 'lucide-react';
import BulkUploadSection from '../components/BulkUploadSection';
import CategoryManagement from '../components/CategoryManagement';
import AssigneeDirectoryManagement from '../components/AssigneeDirectoryManagement';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Panel</h2>
        <p className="text-muted-foreground mt-1">Manage system settings and data</p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="assignees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Assignees</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <BulkUploadSection />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <CategoryManagement />
        </TabsContent>

        <TabsContent value="assignees" className="mt-6">
          <AssigneeDirectoryManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
