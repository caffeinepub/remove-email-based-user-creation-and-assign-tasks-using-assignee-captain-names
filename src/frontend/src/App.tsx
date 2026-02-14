import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import AdminPage from './pages/AdminPage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, ListTodo, Shield } from 'lucide-react';
import RuntimeErrorBoundary from './components/RuntimeErrorBoundary';
import AppBootstrap from './components/AppBootstrap';

function MainApp({ userProfile, isAdmin }: { userProfile: any; isAdmin: boolean }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header userProfile={userProfile} isAdmin={isAdmin} />
      <main className="flex-1 container py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="dashboard">
            <Dashboard isAdmin={isAdmin} />
          </TabsContent>
          <TabsContent value="tasks">
            <TasksPage isAdmin={isAdmin} />
          </TabsContent>
          {isAdmin && (
            <TabsContent value="admin">
              <AdminPage />
            </TabsContent>
          )}
        </Tabs>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RuntimeErrorBoundary>
        <AppBootstrap>
          {({ userProfile, isAdmin }) => (
            <MainApp userProfile={userProfile} isAdmin={isAdmin} />
          )}
        </AppBootstrap>
      </RuntimeErrorBoundary>
    </ThemeProvider>
  );
}
