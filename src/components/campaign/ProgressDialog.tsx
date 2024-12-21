import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

export function ProgressDialog({ 
  open, 
  title, 
  stages 
}: { 
  open: boolean;
  title: string;
  stages: { name: string; duration: number }[];
}) {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setCurrentStage(0);
      return;
    }

    let startTime = Date.now();
    let currentStageIndex = 0;
    let stageStartTime = startTime;

    const timer = setInterval(() => {
      const now = Date.now();
      const stageElapsed = now - stageStartTime;
      const currentStageDuration = stages[currentStageIndex].duration;

      // Check if we should move to next stage
      if (stageElapsed >= currentStageDuration && currentStageIndex < stages.length - 1) {
        currentStageIndex++;
        setCurrentStage(currentStageIndex);
        stageStartTime = now;
      }

      // Calculate total progress
      const totalElapsed = now - startTime;
      const newProgress = Math.min((totalElapsed / totalDuration) * 100, 99);
      setProgress(newProgress);
    }, 50);

    return () => clearInterval(timer);
  }, [open, stages, totalDuration]);

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <Progress value={progress} className="mb-4" />
          <p className="text-sm text-muted-foreground">
            {stages[currentStage]?.name}...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}