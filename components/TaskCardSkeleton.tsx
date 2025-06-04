import { Card } from "@/components/ui/card";

export default function TaskCardSkeleton() {
  return (
    <Card className="bg-card shadow-sm skeleton-card animate-appear mb-2 transition-opacity duration-200">
      <div className="flex flex-col p-2 px-4">
        {/* Top row with title and menu */}
        <div className="flex justify-between items-start mb-1.5">
          <div className="w-3/4 h-4 bg-gray-400/50 rounded"></div>
          <div className="w-4 h-4 bg-gray-400/50 rounded-full"></div>
        </div>

        {/* Description placeholder - shorter */}
        <div className="w-full h-3 bg-gray-400/50 rounded mt-1.5 mb-1"></div>
        <div className="w-2/3 h-3 bg-gray-400/50 rounded mb-2"></div>

        {/* Bottom row with assignee and status badge */}
        <div className="flex justify-between items-center mt-auto">
          {/* Assignee placeholder */}
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-gray-400/50 rounded-full"></div>
            <div className="w-14 h-3 bg-gray-400/50 rounded"></div>
          </div>

          {/* Status badge placeholder */}
          <div className="w-14 h-4 bg-gray-400/50 rounded-full"></div>
        </div>
      </div>
    </Card>
  );
}
