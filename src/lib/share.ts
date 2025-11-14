/**
 * share.ts - Web Share API integration for sharing game progress
 * Shares progress when completing 5 levels of a world
 */

interface ShareProgressOptions {
  world: number;
  levelsCompleted: number;
  url?: string;
}

/**
 * Shares game progress using Web Share API with fallbacks
 * @param opts - Options containing world number, levels completed, and optional URL
 */
export async function shareProgress(opts: ShareProgressOptions): Promise<void> {
  const { world, levelsCompleted, url } = opts;

  // Only share if 5 levels are completed
  if (levelsCompleted < 5) {
    console.info('[share] Not enough levels completed to share:', levelsCompleted);
    return;
  }

  const shareTitle = `¡He completado 5 niveles del mundo ${world}!`;
  const shareText = '¡Mira mi progreso y juega tú también!';
  const shareUrl = url || window.location.href;

  try {
    // Try Web Share API first (mobile-friendly)
    if (navigator.share) {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      });
      console.info('[share] Shared via Web Share API');
      return;
    }

    // Fallback: Try WhatsApp
    await shareViaWhatsApp(shareTitle, shareUrl);
  } catch (error) {
    // If user cancels or error occurs, fail silently
    console.warn('[share] Share failed or cancelled:', error);
  }
}

/**
 * Opens WhatsApp with pre-filled message
 */
async function shareViaWhatsApp(title: string, url: string): Promise<void> {
  try {
    const message = encodeURIComponent(`${title} ${url}`);
    const whatsappUrl = `https://wa.me/?text=${message}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    console.info('[share] Opened WhatsApp share');
  } catch (error) {
    console.warn('[share] WhatsApp share failed:', error);

    // Final fallback: Copy to clipboard for Instagram/TikTok
    await copyToClipboard(title, url);
  }
}

/**
 * Copies text to clipboard (for Instagram/TikTok sharing)
 */
async function copyToClipboard(title: string, url: string): Promise<void> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      const textToCopy = `${title} ${url}`;
      await navigator.clipboard.writeText(textToCopy);
      console.info('[share] Enlace copiado para pegar en Instagram/TikTok');
    } else {
      // Legacy fallback for older browsers
      fallbackCopyToClipboard(`${title} ${url}`);
    }
  } catch (error) {
    console.warn('[share] Failed to copy to clipboard:', error);
  }
}

/**
 * Legacy clipboard copy method for older browsers
 */
function fallbackCopyToClipboard(text: string): void {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    document.execCommand('copy');
    textArea.remove();
    console.info('[share] Copied to clipboard (fallback method)');
  } catch (error) {
    console.warn('[share] Fallback copy failed:', error);
  }
}

/**
 * Checks if native sharing is supported
 */
export function isNativeSharingSupported(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}
