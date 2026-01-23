import { useState, useCallback } from 'react';
import { reviewService } from '../lib/reviewService';
import toast from 'react-hot-toast';

type ReviewStep = 'satisfaction' | 'review-request' | 'feedback' | null;

export function useReviewFlow() {
  const [currentStep, setCurrentStep] = useState<ReviewStep>(null);

  const checkAndTriggerReview = useCallback(async (levelCompleted: number, isWin: boolean) => {
    console.log('[useReviewFlow] Checking review for level:', levelCompleted, 'win:', isWin);

    try {
      await reviewService.onLevelCompleted(levelCompleted, isWin);
      const shouldShow = await reviewService.shouldShowReviewPrompt(levelCompleted, isWin);

      if (shouldShow) {
        console.log('[useReviewFlow] ✅ Showing satisfaction modal');
        await reviewService.recordPromptShown();
        setCurrentStep('satisfaction');
      } else {
        console.log('[useReviewFlow] ❌ Not showing review prompt');
      }
    } catch (error) {
      console.error('[useReviewFlow] Error:', error);
    }
  }, []);

  const onPositiveResponse = useCallback(() => {
    console.log('[useReviewFlow] User responded positively');
    setCurrentStep('review-request');
  }, []);

  const onNegativeResponse = useCallback(() => {
    console.log('[useReviewFlow] User responded negatively');
    setCurrentStep('feedback');
  }, []);

  const onReviewNow = useCallback(async () => {
    console.log('[useReviewFlow] User wants to review now');
    try {
      const result = await reviewService.requestInAppReview();
      if (result.success) {
        toast.success('¡Gracias por tu reseña!');
        setCurrentStep(null);
      } else {
        await reviewService.openPlayStore();
        await reviewService.recordReviewFlowShown();
        setCurrentStep(null);
      }
    } catch (error) {
      console.error('Error launching review:', error);
      toast.error('No se pudo abrir la reseña');
      setCurrentStep(null);
    }
  }, []);

  const onReviewLater = useCallback(() => {
    console.log('[useReviewFlow] User chose later');
    setCurrentStep(null);
  }, []);

  const closeModal = useCallback(() => {
    console.log('[useReviewFlow] Closing modal');
    setCurrentStep(null);
  }, []);

  return {
    currentStep,
    checkAndTriggerReview,
    onPositiveResponse,
    onNegativeResponse,
    onReviewNow,
    onReviewLater,
    closeModal,
  };
}
