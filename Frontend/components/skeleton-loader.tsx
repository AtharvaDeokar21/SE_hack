import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-md bg-muted/50", className)} />
}

export function AlertSkeleton() {
  return (
    <div className="border rounded-lg p-4 bg-secondary/20">
      <div className="flex items-start gap-3">
        <Skeleton className="h-5 w-5 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <div className="flex justify-between items-center pt-1">
            <Skeleton className="h-4 w-1/4 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function GuardSkeleton() {
  return (
    <div className="bg-secondary/50 rounded-lg p-4 border border-border/50">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function MapSkeleton() {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] bg-muted/30 rounded-lg border border-border overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    </div>
  )
}
