import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseBackExitGuardOptions {
  enabled: boolean;
  onConfirmExit: () => void;
  isLevelCompleted?: boolean;
}

export interface UseBackExitGuardReturn {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export function useBackExitGuard(opts: UseBackExitGuardOptions): UseBackExitGuardReturn {
  const [open, setOpen] = useState(false);
  const modalOpenRef = useRef(false);
  const enabledRef = useRef(opts.enabled);

  useEffect(() => {
    enabledRef.current = opts.enabled;
  }, [opts.enabled]);

  const openModal = useCallback(() => {
    setOpen(true);
    modalOpenRef.current = true;
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    modalOpenRef.current = false;
  }, []);

  useEffect(() => {
    if (!opts.enabled) return;

    const handlePopState = (e: PopStateEvent) => {
      if (!enabledRef.current) return;

      if (modalOpenRef.current) {
        opts.onConfirmExit();
        return;
      }

      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
      openModal();
    };

    const handleBackButton = (e: Event) => {
      if (!enabledRef.current) return;

      e.preventDefault();

      if (modalOpenRef.current) {
        opts.onConfirmExit();
        return;
      }

      openModal();
    };

    window.history.pushState(null, '', window.location.href);

    window.addEventListener('popstate', handlePopState);

    if ('backbutton' in document) {
      document.addEventListener('backbutton', handleBackButton, false);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);

      if ('backbutton' in document) {
        document.removeEventListener('backbutton', handleBackButton, false);
      }
    };
  }, [opts.enabled, opts.onConfirmExit, openModal]);

  return { open, openModal, closeModal };
}
