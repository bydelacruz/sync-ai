import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./Login";
import Layout from "./Layout";
import TaskBoard from "./TaskBoard"; 
import { Loader2 } from "lucide-react";
import API_URL from "./api";

function AppContent() {
  // 1. Get logout from context so we can kick invalid users
  const { token, logout, isLoading: authLoading } = useAuth();
  
  // 2. Local state to track if we've pinged the API yet
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Only verify if:
    // A. We have a token
    // B. The AuthContext is done loading from localStorage
    if (token && !authLoading) {
      
      // Reset verification state (prevents UI flash during re-logins)
      setIsVerified(false);

      // Ping a lightweight endpoint to test the token
      fetch(`${API_URL}/tasks?limit=1`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        }
      })
      .then((res) => {
        if (res.status === 401) {
          // Token is bad? Destroy it.
          logout();
        } else {
          // Token is good? Let them in.
          setIsVerified(true);
        }
      })
      .catch((err) => {
        console.error("Verification error:", err);
        // If network is down, we usually let them in to see cached data or error UI
        setIsVerified(true); 
      });
    }
  }, [token, authLoading, logout]);

  // --- LOADING STATE ---
  // Show loader if:
  // 1. AuthContext is still reading localStorage (authLoading)
  // 2. OR We have a token but haven't verified it with the API yet (!isVerified)
  if (authLoading || (token && !isVerified)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
      </div>
    );
  }

  // --- LOGIN STATE ---
  if (!token) {
    return <Login />;
  }

  // --- DASHBOARD STATE ---
  // (Only reached if token exists AND isVerified is true)
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
