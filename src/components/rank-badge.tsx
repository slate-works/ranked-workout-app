import { cn } from '@/lib/utils';
import { RankTier } from '@/lib/scoring';

interface RankBadgeProps {
  rank: RankTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const rankConfig: Record<RankTier, { label: string; gradient: string }> = {
  bronze: {
    label: 'Bronze',
    gradient: 'from-amber-700 to-amber-500',
  },
  silver: {
    label: 'Silver',
    gradient: 'from-gray-400 to-gray-300',
  },
  gold: {
    label: 'Gold',
    gradient: 'from-yellow-500 to-yellow-300',
  },
  diamond: {
    label: 'Diamond',
    gradient: 'from-cyan-400 to-cyan-200',
  },
  apex: {
    label: 'Apex',
    gradient: 'from-indigo-600 to-purple-600',
  },
  mythic: {
    label: 'Mythic',
    gradient: 'from-red-600 via-orange-500 to-red-600',
  },
};

const sizeConfig = {
  sm: 'h-6 px-2 text-xs',
  md: 'h-8 px-3 text-sm',
  lg: 'h-10 px-4 text-base',
};

export function RankBadge({
  rank,
  size = 'md',
  showLabel = true,
  className,
}: RankBadgeProps) {
  // Fallback to bronze if rank is invalid or undefined
  const safeRank = rank && rankConfig[rank] ? rank : 'bronze';
  const config = rankConfig[safeRank];

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-bold text-white shadow-lg',
        `bg-gradient-to-r ${config.gradient}`,
        sizeConfig[size],
        safeRank === 'mythic' && 'animate-pulse',
        className
      )}
      style={{
        boxShadow: `0 0 20px var(--rank-${safeRank})`,
      }}
    >
      {showLabel && config.label}
    </div>
  );
}

export interface RankProgressProps {
  currentScore?: number;
  currentRank: RankTier;
  progress?: number;
  showNextRank?: boolean;
  className?: string;
}

const rankThresholds: { rank: RankTier; min: number }[] = [
  { rank: 'bronze', min: 0 },
  { rank: 'silver', min: 25 },
  { rank: 'gold', min: 50 },
  { rank: 'diamond', min: 70 },
  { rank: 'apex', min: 85 },
  { rank: 'mythic', min: 95 },
];

export function RankProgress({
  currentScore,
  currentRank,
  progress,
  showNextRank,
  className,
}: RankProgressProps) {
  const currentIndex = rankThresholds.findIndex((r) => r.rank === currentRank);
  const nextRank = rankThresholds[currentIndex + 1];

  const currentMin = rankThresholds[currentIndex]?.min || 0;
  const nextMin = nextRank?.min || 100;

  // Use provided progress or calculate from score
  const progressInRank = progress ?? 
    (currentScore !== undefined 
      ? ((currentScore - currentMin) / (nextMin - currentMin)) * 100
      : 0);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <RankBadge rank={currentRank} size="sm" />
        {(showNextRank || nextRank) && nextRank && <RankBadge rank={nextRank.rank} size="sm" />}
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            `bg-gradient-to-r ${rankConfig[currentRank].gradient}`
          )}
          style={{ width: `${Math.min(100, progressInRank)}%` }}
        />
      </div>
      {currentScore !== undefined && (
        <p className="text-xs text-muted-foreground text-center">
          {Math.floor(currentScore)} / {nextMin} points
          {nextRank && ` to ${rankConfig[nextRank.rank].label}`}
        </p>
      )}
    </div>
  );
}
