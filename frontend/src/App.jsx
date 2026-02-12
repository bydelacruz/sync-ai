import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./Login";
import Layout from "./Layout";
import TaskBoard from "./TaskBoard"; // <--- Make sure this import matches your file structure
import { Loader2 } from "lucide-react";

function AppContent() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
      </div>
    );
  }

  if (!token) {
    return <Login />;
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">My Tasks</h1>
        <p className="text-zinc-400 mt-1">Manage your intelligent task queue.</p>
      </div>
      <TaskBoard />
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
