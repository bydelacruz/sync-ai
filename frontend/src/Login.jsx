import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { Command, ArrowRight, Loader2, UserPlus } from "lucide-react";
import API_URL from "./api"

export default function Login() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true); // <--- Toggle State
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (isLogin) {
        // --- LOGIN MODE ---
        const response = await fetch(`${API_URL}/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) throw new Error("Invalid credentials");
        const data = await response.json();
        login(data.access_token);
        
      } else {
        // --- SIGNUP MODE ---
        // 1. Create User
        const createRes = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!createRes.ok) {
          const errData = await createRes.json();
          throw new Error(errData.detail || "Failed to create account");
        }

        // 2. Auto-Login after success
        setSuccessMsg("Account created! Logging you in...");
        
        const loginRes = await fetch(`${API_URL}/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!loginRes.ok) throw new Error("Auto-login failed. Please sign in manually.");
        const data = await loginRes.json();
        login(data.access_token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100 p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-[400px] space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/20 mb-6 ring-1 ring-white/10">
            <Command className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm text-zinc-400">
            {isLogin ? "Enter your credentials to access Sync AI" : "Start organizing your tasks with AI power"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 ml-1 uppercase tracking-wider">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg bg-zinc-950/50 border border-zinc-800 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-zinc-600 text-white"
                placeholder="Ex. user123"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 ml-1 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-zinc-950/50 border border-zinc-800 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-zinc-600 text-white"
                placeholder="••••••••"
              />
            </div>

            {/* Error / Success Messages */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium animate-in slide-in-from-top-2">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium animate-in slide-in-from-top-2">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign in" : "Create Account"} 
                  {isLogin ? <ArrowRight className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                </>
              )}
            </button>
          </form>

          {/* Toggle Switch */}
          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setSuccessMsg("");
                }}
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
