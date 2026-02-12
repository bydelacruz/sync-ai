import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./Login";
import TaskBoard from "./TaskBoard";
import { LogOut } from "lucide-react";

// Inner component that consumes the context
function AppContent() {
  const { token, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading...</div>;
  }

  if (!token) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            My Dashboard
          </h1>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
        
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-8 text-center">
            <TaskBoard />
        </div>

      </div>
    </div>
  );
}

// Main component that provides the context
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
