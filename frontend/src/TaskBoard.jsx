import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import CreateTask from "./CreateTask";
import { CheckCircle2, Circle, Trash2, Calendar, Loader2, Search, X } from "lucide-react";

export default function TaskBoard() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // 1. Fetch Tasks (All or Search)
  const fetchTasks = async (query = "") => {
    setIsLoading(true);
    try {
      let url = "/tasks";
      let options = {
        headers: { Authorization: `Bearer ${token}` },
      };

      // If we have a query, switch to the Search Endpoint
      if (query.trim()) {
        url = "/search";
        options = {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ search_term: query }),
        };
      }

      const response = await fetch(url, options);
      if (!response.ok) throw new Error("Failed to fetch tasks");

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTasks();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Search Submit
  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(!!searchQuery);
    fetchTasks(searchQuery);
  };

  // Clear Search
  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    fetchTasks("");
  };

  const handleTaskCreated = (newTask) => {
    setTasks([newTask, ...tasks]);
  };

  // ... (toggleTask and deleteTask remain the same as before) ...
  const toggleTask = async (taskId, isCompleted) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: isCompleted ? "pending" : "completed" } : t));
    try {
      await fetch(`/tasks/${taskId}/${isCompleted ? "pending" : "complete"}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) { fetchTasks(); }
  };

  const deleteTask = async (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    try {
      await fetch(`/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) { fetchTasks(); }
  };
  // ... (End of helper functions) ...

  if (error) return <div className="text-red-400 text-center p-8">Error: {error}</div>;

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <CreateTask onTaskCreated={handleTaskCreated} />

        {/* --- SEARCH BAR --- */}
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input 
            type="text"
            placeholder="Search tasks using AI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-700 pl-10 pr-10 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-indigo-500 h-8 w-8" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500">
          {isSearching ? (
             <p>No tasks found matching "{searchQuery}". Try a different concept!</p>
          ) : (
             <p>No tasks found. Create one to get started!</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className={`p-4 rounded-xl border transition-all hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between h-full ${
                task.status === "completed" 
                  ? "bg-zinc-900/30 border-zinc-800 opacity-60" 
                  : "bg-zinc-900 border-zinc-700"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <button 
                    onClick={() => toggleTask(task.id, task.status === "completed")}
                    className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                      task.status === "completed" ? "text-green-500 hover:text-green-400" : "text-zinc-500 hover:text-indigo-400"
                    }`}
                  >
                    {task.status === "completed" ? <CheckCircle2 /> : <Circle />}
                  </button>
                  
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h3 className={`font-semibold text-lg mb-1 ${task.status === "completed" ? "line-through text-zinc-500" : "text-zinc-100"}`}>
                  {task.title}
                </h3>
                
                {/* --- DISPLAY SUMMARY INSTEAD OF DESCRIPTION --- */}
                <p className="text-sm text-zinc-400 line-clamp-3 mb-4">
                  {task.summary || task.description} 
                </p>
              </div>

              <div className="flex items-center text-xs text-zinc-600 font-mono mt-auto pt-4 border-t border-zinc-800/50">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(task.created_at || Date.now()).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
