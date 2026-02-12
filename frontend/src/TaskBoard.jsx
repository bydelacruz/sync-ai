import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { CheckCircle2, Circle, Trash2, Calendar, Loader2 } from "lucide-react";
import CreateTask from "./CreateTask";

export default function TaskBoard() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. Fetch Tasks on Mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch tasks");

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Task Completion
  const toggleTask = async (taskId, isCompleted) => {
    // Optimistic Update (Update UI immediately for speed) ⚡
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, status: isCompleted ? "pending" : "completed" } : t
    ));

    try {
      const endpoint = isCompleted ? "pending" : "complete"; 
      // NOTE: We might need to adjust the backend if it doesn't support "un-completing" yet!
      // For now, let's assume we just hit the complete endpoint.
      await fetch(`/tasks/${taskId}/complete`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
        // Revert on error
        fetchTasks();
    }
  };

  // 3. Handle Delete
  const deleteTask = async (taskId) => {
    // Optimistic Update
    setTasks(tasks.filter(t => t.id !== taskId));

    try {
      await fetch(`/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
       fetchTasks();
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-500" /></div>;
  if (error) return <div className="text-red-400 text-center p-8">Error: {error}</div>;
  
  const handleTaskCreated = (newTask) => {
    setTasks([newTask, ...tasks])
  };

  if (error) return <div className="text-red-400 text-center p-8">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <CreateTask onTaskCreated={handleTaskCreated} />

      {tasks.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500">
          <p>No tasks found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className={`p-4 rounded-xl border transition-all hover:shadow-lg hover:shadow-indigo-500/10 ${
                task.status === "completed" 
                  ? "bg-zinc-900/30 border-zinc-800 opacity-60" 
                  : "bg-zinc-900 border-zinc-700"
              }`}
            >
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
              
              <p className="text-sm text-zinc-400 line-clamp-3 mb-4">
                {task.summary}
              </p>

              <div className="flex items-center text-xs text-zinc-600 font-mono">
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
