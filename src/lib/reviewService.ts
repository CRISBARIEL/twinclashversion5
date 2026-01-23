import { supabase } from './supabase';
import { Capacitor } from '@capacitor/core';
import { InAppReview } from './inAppReview';

export interface ReviewTracking {
  id?: string;
  user_id?: string;
  last_prompt_timestamp?: string;
  prompt_count: number;
  review_flow_shown: boolean;
  feedback_sent: boolean;
  highest_level_completed: number;
  created_at?: string;
  updated_at?: string;
}

export interface FeedbackData {
  feedback_type: 'performance' | 'difficulty' | 'monetization' | 'other';
  feedback_text?: string;
}

const DAYS_BETWEEN_PROMPTS = 14;
const MAX_PROMPTS = 3;
const TRIGGER_LEVEL = 5;
const ADDITIONAL_TRIGGER_LEVELS = [10, 20, 30, 50];

class ReviewService {
  private localStorageKey = 'review_tracking';

  async getTrackingData(): Promise<ReviewTracking> {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('review_tracking')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) return data;

      const newTracking: ReviewTracking = {
        user_id: user.id,
        prompt_count: 0,
        review_flow_shown: false,
        feedback_sent: false,
        highest_level_completed: 0,
      };

      const { data: created } = await supabase
        .from('review_tracking')
        .insert([newTracking])
        .select()
        .single();

      return created || newTracking;
    } else {
      const stored = localStorage.getItem(this.localStorageKey);
      if (stored) return JSON.parse(stored);

      const newTracking: ReviewTracking = {
        prompt_count: 0,
        review_flow_shown: false,
        feedback_sent: false,
        highest_level_completed: 0,
      };

      localStorage.setItem(this.localStorageKey, JSON.stringify(newTracking));
      return newTracking;
    }
  }

  async updateTrackingData(updates: Partial<ReviewTracking>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    const current = await this.getTrackingData();

    const updated: ReviewTracking = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (user && current.id) {
      await supabase
        .from('review_tracking')
        .update(updated)
        .eq('id', current.id);
    } else {
      localStorage.setItem(this.localStorageKey, JSON.stringify(updated));
    }
  }

  async shouldShowReviewPrompt(levelCompleted: number, isWin: boolean): Promise<boolean> {
    console.log('[ReviewService] Checking if should show prompt:', { levelCompleted, isWin });

    if (!isWin) {
      console.log('[ReviewService] Not a win, skipping');
      return false;
    }

    const isTriggerLevel =
      levelCompleted === TRIGGER_LEVEL ||
      ADDITIONAL_TRIGGER_LEVELS.includes(levelCompleted);

    if (!isTriggerLevel) {
      console.log('[ReviewService] Not a trigger level, skipping');
      return false;
    }

    const tracking = await this.getTrackingData();
    console.log('[ReviewService] Current tracking:', tracking);

    if (tracking.review_flow_shown) {
      console.log('[ReviewService] Review flow already shown');
      return false;
    }

    if (tracking.feedback_sent) {
      console.log('[ReviewService] Feedback already sent');
      return false;
    }

    if (tracking.prompt_count >= MAX_PROMPTS) {
      console.log('[ReviewService] Max prompts reached');
      return false;
    }

    if (tracking.last_prompt_timestamp) {
      const lastPrompt = new Date(tracking.last_prompt_timestamp);
      const now = new Date();
      const daysSinceLastPrompt = (now.getTime() - lastPrompt.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceLastPrompt < DAYS_BETWEEN_PROMPTS) {
        console.log('[ReviewService] Too soon since last prompt:', daysSinceLastPrompt, 'days');
        return false;
      }
    }

    console.log('[ReviewService] ✅ Should show review prompt!');
    return true;
  }

  async onLevelCompleted(levelNumber: number, isWin: boolean): Promise<void> {
    const tracking = await this.getTrackingData();
    if (levelNumber > tracking.highest_level_completed) {
      await this.updateTrackingData({
        highest_level_completed: levelNumber,
      });
    }
  }

  async recordPromptShown(): Promise<void> {
    const tracking = await this.getTrackingData();
    await this.updateTrackingData({
      last_prompt_timestamp: new Date().toISOString(),
      prompt_count: tracking.prompt_count + 1,
    });
  }

  async recordReviewFlowShown(): Promise<void> {
    await this.updateTrackingData({
      review_flow_shown: true,
    });
  }

  async saveFeedback(feedback: FeedbackData): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase
      .from('user_feedback')
      .insert([{
        user_id: user?.id || null,
        feedback_type: feedback.feedback_type,
        feedback_text: feedback.feedback_text || '',
      }]);

    await this.updateTrackingData({
      feedback_sent: true,
    });
  }

  async requestInAppReview(): Promise<{ success: boolean; message?: string }> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      console.log('[ReviewService] Not on Android, simulating success for testing');
      return { success: true, message: 'Simulated on web' };
    }

    try {
      const result = await InAppReview.requestReview();
      if (result.success) {
        await this.recordReviewFlowShown();
      }
      return result;
    } catch (error) {
      console.error('Error requesting in-app review:', error);
      return { success: false, message: String(error) };
    }
  }

  async openPlayStore(): Promise<void> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      console.log('[ReviewService] Would open Play Store on Android');
      return;
    }

    try {
      await InAppReview.openPlayStore();
    } catch (error) {
      console.error('Error opening Play Store:', error);
    }
  }
}

export const reviewService = new ReviewService();
