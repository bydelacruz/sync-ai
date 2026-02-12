import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { Plus, Loader2, X, AlignLeft, Type } from "lucide-react";

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

  return (
    <>
      {/* 1. The Trigger Button (Always Visible & Stationary) */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all font-medium shadow-lg shadow-indigo-500/20"
      >
        <Plus className="h-4 w-4" />
        New Task
      </button>

      {/* 2. The Modal Overlay (Only renders when isOpen) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-white">Create New Task</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 flex items-center gap-2">
                  <Type className="h-3 w-3" /> Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-zinc-600"
                  placeholder="e.g., Buy Groceries"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 flex items-center gap-2">
                  <AlignLeft className="h-3 w-3" /> Description (AI Auto-Summarized)
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all resize-none placeholder:text-zinc-600 leading-relaxed"
                  placeholder="Describe your task in detail..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
