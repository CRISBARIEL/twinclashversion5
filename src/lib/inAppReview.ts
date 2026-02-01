import { registerPlugin } from '@capacitor/core';

export interface InAppReviewPlugin {
  requestReview(): Promise<{ success: boolean; message?: string }>;
  openPlayStore(): Promise<{ success: boolean; message?: string }>;
}

const InAppReview = registerPlugin<InAppReviewPlugin>('InAppReview', {
  web: () => ({
    async requestReview() {
      console.log('InAppReview: requestReview (web) - redirecting to Play Store');
      window.open('https://play.google.com/store/apps/details?id=com.twinclash.game&pcampaignid=web_share&showAllReviews=true', '_blank');
      return { success: true, message: 'Opened Play Store for review' };
    },
    async openPlayStore() {
      console.log('InAppReview: openPlayStore - opening in new tab');
      window.open('https://play.google.com/store/apps/details?id=com.twinclash.game&pcampaignid=web_share', '_blank');
      return { success: true, message: 'Opened in browser' };
    },
  }),
});

export { InAppReview };
