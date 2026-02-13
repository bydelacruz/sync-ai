import { useAuth } from "./context/AuthContext";

export default function Layout({ children }) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      
      {/* --- TOP NAVIGATION --- */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md z-50">
        <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg tracking-tight text-zinc-100">Sync AI</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
           <button 
              onClick={logout}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              title="Sign Out"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
