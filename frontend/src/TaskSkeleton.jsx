export default function TaskSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Create an array of 6 items to simulate a full board */}
      {[...Array(6)].map((_, i) => (
        <div 
          key={i} 
          className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30"
        >
          {/* Header: Title + Actions */}
          <div className="flex justify-between items-start mb-4">
            {/* Title Bar */}
            <div className="h-5 bg-zinc-800 rounded w-1/2 animate-pulse" />
            
            {/* Fake Buttons */}
            <div className="flex gap-2">
               <div className="h-7 w-7 bg-zinc-800 rounded animate-pulse" />
               <div className="h-7 w-7 bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>
          
          {/* Body: 3 lines of text */}
          <div className="space-y-3 mb-6">
            <div className="h-3 bg-zinc-800 rounded w-full animate-pulse" />
            <div className="h-3 bg-zinc-800 rounded w-5/6 animate-pulse" />
            <div className="h-3 bg-zinc-800 rounded w-4/6 animate-pulse" />
          </div>

          {/* Footer: Date + Tag */}
          <div className="pt-4 border-t border-zinc-800/50 flex justify-between items-center">
             <div className="h-3 bg-zinc-800 rounded w-24 animate-pulse" />
             <div className="h-5 bg-zinc-800/50 rounded w-16 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
