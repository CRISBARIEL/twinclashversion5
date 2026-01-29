import { registerPlugin } from '@capacitor/core';

export interface InAppReviewPlugin {
  requestReview(): Promise<{ success: boolean; message?: string }>;
  openPlayStore(): Promise<{ success: boolean; message?: string }>;
}

const InAppReview = registerPlugin<InAppReviewPlugin>('InAppReview', {
  web: () => ({
    async requestReview() {
      console.log('InAppReview: requestReview (web simulation)');
      return { success: false, message: 'Not available on web' };
    },
    async openPlayStore() {
      console.log('InAppReview: openPlayStore - opening in new tab');
      window.open('https://play.google.com/store/apps/details?id=com.twinclash.game&pcampaignid=web_share', '_blank');
      return { success: true, message: 'Opened in browser' };
    },
  }),
});

export { InAppReview };
