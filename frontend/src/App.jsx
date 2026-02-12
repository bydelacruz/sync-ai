import { useState } from "react";
import Login from "./Login";

function App() {
  const [token, setToken] = useState(null);

  const handleLogin = (accessToken) => {
    setToken(accessToken);
    console.log("Logged in! Token:", accessToken);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-green-500">Access Granted! 🔓</h1>
        <p className="text-zinc-400 break-all max-w-lg p-4 bg-zinc-900 rounded-lg border border-zinc-800 font-mono text-xs">
          {token}
        </p>
        <button 
          onClick={() => setToken(null)}
          className="px-4 py-2 bg-red-600 rounded hover:bg-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default App;
