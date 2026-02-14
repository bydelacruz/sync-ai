import { useState, useEffect } from "react";
import { X, Calendar, AlignLeft, Edit2, Save, Loader2 } from "lucide-react";

export default function TaskModal({ task, isOpen, onClose, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDesc, setEditedDesc] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when the modal opens or task changes
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDesc(task.description);
      setIsEditing(false);
    }
  }, [task, isOpen]);

  const handleSave = async () => {
    if (!editedTitle.trim()) return; // Prevent empty titles
    
    setIsLoading(true);
    try {
      // Call the parent's update function
      await onUpdate(task.id, { 
        title: editedTitle, 
        description: editedDesc 
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update task", error);
    } finally {
      setIsLoading(false);
      onClose()
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-zinc-800/50 shrink-0">
          <div className="w-full mr-4">
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full bg-zinc-800 text-white text-xl font-semibold px-3 py-2 rounded-lg border border-zinc-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-zinc-600"
                placeholder="Task Title"
                autoFocus
              />
            ) : (
              <h2 className="text-2xl font-semibold text-white tracking-tight leading-tight">
                {task.title}
              </h2>
            )}

            {!isEditing && (
              <div className="flex items-center gap-2 mt-3 text-zinc-400 text-sm">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                  task.status === 'completed' || task.status === 'done'
                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                }`}>
                  {task.status.toUpperCase()}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(task.created_at || Date.now()).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* AI Summary Section (Read Only) */}
          {!isEditing && (
            <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-4">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                ✨ AI Summary
              </h3>
              <p className="text-indigo-100/90 text-sm leading-relaxed">
                {task.summary || "No summary available."}
              </p>
            </div>
          )}

          {/* Description Section */}
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
              <AlignLeft className="w-4 h-4" /> Description
            </h3>
            
            {isEditing ? (
              <textarea
                value={editedDesc}
                onChange={(e) => setEditedDesc(e.target.value)}
                className="w-full h-64 bg-zinc-800 text-zinc-200 text-base leading-relaxed px-4 py-3 rounded-lg border border-zinc-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none placeholder:text-zinc-600"
                placeholder="Add a detailed description..."
              />
            ) : (
              <div className="prose prose-invert max-w-none text-zinc-300 text-base leading-relaxed whitespace-pre-wrap">
                {task.description}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-950/50 border-t border-zinc-800/50 flex justify-end gap-3 shrink-0">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-900 bg-white hover:bg-zinc-200 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Edit Task
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
