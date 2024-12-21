// CardProgress.tsx
import { useEffect, useState, useMemo } from 'react';

interface ProgressStage {
  name: string;
  duration: number;
}

interface CardProgressProps {
  stages: ProgressStage[];
  onComplete?: () => void;
}

export function CardProgress({ stages, onComplete }: CardProgressProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  // Calculate total duration and stage thresholds once
  const { totalDuration, stageThresholds } = useMemo(() => {
    const total = stages.reduce((sum, stage) => sum + stage.duration, 0);
    let accumulated = 0;
    const thresholds = stages.map(stage => {
      accumulated += stage.duration;
      return (accumulated / total) * 100;
    });
    return { totalDuration: total, stageThresholds: thresholds };
  }, [stages]);

  useEffect(() => {
    const startTime = Date.now();
    let animationFrame: number;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(currentProgress);

      // Update current stage based on progress
      const newStage = stageThresholds.findIndex(threshold => currentProgress <= threshold);
      if (newStage !== -1) {
        setCurrentStage(newStage);
      }

      if (currentProgress < 100) {
        animationFrame = requestAnimationFrame(updateProgress);
      } else {
        onComplete?.();
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [totalDuration, stageThresholds, onComplete]);

  return (
    <div className="space-y-2 p-2">
      <p className="text-sm font-medium">{stages[currentStage].name}</p>
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-150"
          style={{ 
            width: `${progress}%`,
            transition: 'width 150ms linear'
          }}
        />
      </div>
    </div>
  );
}