import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { Plus, Loader2, X } from "lucide-react";

export default function CreateTask({ onTaskCreated }) {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) throw new Error("Failed to create task");

      const newTask = await response.json();
      
      // Update the parent state instantly! ⚡
      onTaskCreated(newTask);
      
      // Reset and close
      setTitle("");
      setDescription("");
      setIsOpen(false);
    } catch (err) {
      alert("Error creating task: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all font-medium shadow-lg shadow-indigo-500/20"
      >
        <Plus className="h-4 w-4" />
        New Task
      </button>
    );
  }

  return (
    <div className="mb-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Create New Task</h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-zinc-500 hover:text-zinc-300"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            placeholder="e.g., Buy Groceries"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Description (AI Auto-Summarized)</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
            placeholder="Describe your task..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}
