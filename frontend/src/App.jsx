import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./Login";
import Layout from "./Layout";
import TaskBoard from "./TaskBoard"; 
import { Loader2, WifiOff } from "lucide-react";
import API_URL from "./api";

// Helper: Check if JWT is expired without calling the server
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    // 1. Get the payload part (the middle string)
    const payloadBase64 = token.split('.')[1];
    // 2. Decode it
    const decodedJson = atob(payloadBase64);
    // 3. Parse it
    const payload = JSON.parse(decodedJson);
    // 4. Check expiration (exp is in seconds, Date.now is in ms)
    const isExpired = payload.exp * 1000 < Date.now();
    
    return isExpired;
  } catch (e) {
    return true; // If we can't read it, assume it's bad
  }
};

function AppContent() {
  const { token, logout, isLoading: authLoading } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    if (token && !authLoading) {
      // If the math says it's expired, kill it immediately. 
      if (isTokenExpired(token)) {
        logout();
        return;
      }

      // Token looks okay properly, but is it revoked? Or valid on the server?
      setIsVerified(false);
      setConnectionError(false);

      fetch(`${API_URL}/tasks?limit=1`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        }
      })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          // Explicitly bad token
          logout();
        } else if (!res.ok) {
          // 500 Server Error or similar - Don't logout, but don't verify
          console.error("Server error during verification");
          setConnectionError(true);
        } else {
          // Status 200 - We are golden
          setIsVerified(true);
        }
      })
      .catch((err) => {
        console.error("Verification connection failed:", err);
        // If the internet is down, showing the dashboard with a "Failed to fetch" 
        // error is messy. Better to show a "Connection Error" screen.
        setConnectionError(true); 
      });
    }
  }, [token, authLoading, logout]);

  // --- LOADING STATE ---
  if (authLoading || (token && !isVerified && !connectionError)) {
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

  // --- CONNECTION ERROR STATE ---
  // If we couldn't verify because the server is down
  if (connectionError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-4">
        <WifiOff className="h-12 w-12 text-zinc-600" />
        <p>Unable to connect to server.</p>
        <div className="flex gap-4">
            <button 
            onClick={() => window.location.reload()} 
            className="text-indigo-400 hover:text-indigo-300 underline"
            >
            Retry
            </button>
            <span className="text-zinc-700">|</span>
            <button 
            onClick={logout} 
            className="text-zinc-500 hover:text-zinc-300 underline"
            >
            Log Out
            </button>
        </div>
      </div>
    );
  }

  // --- DASHBOARD STATE ---
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
