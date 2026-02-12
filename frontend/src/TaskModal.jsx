import { X, Calendar, Clock, AlignLeft } from "lucide-react";

export default function TaskModal({ task, isOpen, onClose }) {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-zinc-800/50">
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">{task.title}</h2>
            <div className="flex items-center gap-2 mt-2 text-zinc-400 text-sm">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                task.status === 'completed' 
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
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* AI Summary Section */}
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-4">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              ✨ AI Summary
            </h3>
            <p className="text-indigo-100/90 text-sm leading-relaxed">
              {task.summary || "No summary available."}
            </p>
          </div>

          {/* Full Description Section */}
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
              <AlignLeft className="w-4 h-4" /> Description
            </h3>
            <div className="prose prose-invert max-w-none text-zinc-300 text-base leading-relaxed whitespace-pre-wrap">
              {task.description}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-950/50 border-t border-zinc-800/50 flex justify-end gap-2">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
}
