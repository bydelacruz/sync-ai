import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import CreateTask from "./CreateTask";
import TaskModal from "./TaskModal";
import TaskSkeleton from "./TaskSkeleton";
import { Check, Circle, Trash2, Search, X } from "lucide-react";
import API_URL from "./api";

export default function TaskBoard() {
  const { token, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for the selected task (Modal)
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = async (query = "") => {
    setIsLoading(true);
    try {
      let url = query.trim() ? `${API_URL}/search` : `${API_URL}/tasks`;
      let options = {
        method: query.trim() ? "POST" : "GET",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: query.trim() ? JSON.stringify({ search_term: query }) : null,
      };

      const response = await fetch(url, options);
      
      if (response.status == 401) {
        logout();
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      fetchTasks()
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTasks(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery("");
    fetchTasks("");
  };

  const handleTaskCreated = (newTask) => {
    setTasks([newTask, ...tasks]);
  };

  const updateTask = async (taskId, updatedData) => {
    // optimistic UI update
    setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? {...t, ...updatedData} : t))

    // also update the selectedtask so the modaldoesnt show old data
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => ({...prev, ...updatedData}));
    }

    try {
      // send api request
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) throw new Error("Failed to update task");
      
      const savedTask = await response.json();
      setTasks(prev => prev.map(t => t.id === taskId ? savedTask : t))

    } catch (err) {
      console.error(err);
      fetchTasks()
    }
  };

  const toggleTask = async (e, taskId, isCompleted) => {
    e.stopPropagation(); // Stop card click
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: isCompleted ? "pending" : "completed" } : t));
    try {
      await fetch(`${API_URL}/tasks/${taskId}/${isCompleted ? "pending" : "complete"}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) { fetchTasks(); }
  };

  const deleteTask = async (e, taskId) => {
    e.stopPropagation(); // Stop card click
    setTasks(tasks.filter(t => t.id !== taskId));
    try {
      await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) { fetchTasks(); }
  };

  if (error) return <div className="text-red-400 text-center p-8">Error: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Detail Modal */}
      <TaskModal 
        task={selectedTask} 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)} 
        onUpdate={updateTask}
      />

      {/* Header Controls (Always Visible) */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <CreateTask onTaskCreated={handleTaskCreated} />

        <form onSubmit={handleSearch} className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full h-10 rounded-lg bg-zinc-900 border border-zinc-800 pl-10 pr-10 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:bg-zinc-900 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-2.5 text-zinc-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>

      {/* --- THE CONTENT AREA --- */}
      {isLoading ? (
        <TaskSkeleton />
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800">
           <p className="text-zinc-500">No tasks found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              onClick={() => setSelectedTask(task)}
              className={`
                group relative p-5 rounded-xl border cursor-pointer transition-all duration-200
                hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20
                ${task.status === "completed" 
                  ? "bg-zinc-900/40 border-zinc-800/50" 
                  : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                }
              `}
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`font-semibold text-base pr-4 line-clamp-1 ${task.status === "completed" ? "text-zinc-500 line-through decoration-zinc-700" : "text-zinc-100"}`}>
                  {task.title}
                </div>
                
                <div className="flex gap-1 transition-opacity absolute top-4 right-4 bg-zinc-900 pl-2 shadow-[-10px_0_10px_0_rgba(24,24,27,1)]">
                   <button 
                    onClick={(e) => toggleTask(e, task.id, task.status === "completed")}
                    className={`p-1.5 rounded-md hover:bg-zinc-800 transition-colors ${task.status === 'completed' ? 'text-green-500' : 'text-zinc-500'}`}
                  >
                    {task.status === "completed" ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={(e) => deleteTask(e, task.id)}
                    className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>


              <p className={`text-sm leading-relaxed line-clamp-3 mb-4 ${task.status === "completed" ? "text-zinc-600" : "text-zinc-400"}`}>
                {task.summary || task.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
