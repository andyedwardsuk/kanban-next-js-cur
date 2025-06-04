import { Card } from "@/components/ui/card";

export default function TaskCardSkeleton() {
  return (
    <Card className="bg-card/30 shadow-sm h-[100px] skeleton-card">
      <div className="flex flex-col p-3 px-4 h-auto">
        {/* Title placeholder */}
        <div className="w-3/4 h-4 bg-muted-foreground/20 rounded mb-3"></div>

        {/* Description placeholder (optional) */}
        <div className="w-full h-3 bg-muted-foreground/10 rounded mb-2"></div>
        <div className="w-2/3 h-3 bg-muted-foreground/10 rounded mb-4"></div>

        {/* Bottom row placeholder */}
        <div className="flex justify-between items-center mt-auto">
          <div className="w-20 h-4 bg-muted-foreground/20 rounded"></div>
          <div className="w-16 h-5 bg-muted-foreground/20 rounded-full"></div>
        </div>
      </div>
    </Card>
  );
}
