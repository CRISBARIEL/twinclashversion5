import { registerPlugin } from '@capacitor/core';

export interface InAppReviewPlugin {
  requestReview(): Promise<{ success: boolean; message?: string }>;
  openPlayStore(): Promise<{ success: boolean; message?: string }>;
}

const InAppReview = registerPlugin<InAppReviewPlugin>('InAppReview', {
  web: () => ({
    async requestReview() {
      console.log('InAppReview: requestReview (web simulation)');
      return { success: true, message: 'Web simulation' };
    },
    async openPlayStore() {
      console.log('InAppReview: openPlayStore (web simulation)');
      return { success: true, message: 'Web simulation' };
    },
  }),
});

export { InAppReview };
