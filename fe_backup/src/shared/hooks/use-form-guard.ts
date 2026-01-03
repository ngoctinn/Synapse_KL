import { useEffect, useState } from "react";

interface UseFormGuardProps {
  isDirty: boolean;
  onClose?: () => void;
  onReset?: () => void;
}

export function useFormGuard({ isDirty, onClose, onReset }: UseFormGuardProps) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // 1. Browser Level Guard (Close Tab / Refresh)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // 2. App Level Guard (Internal Navigation / Sheet Close)
  const handleOpenChange = (open: boolean) => {
    if (!open && isDirty) {
      setShowExitConfirm(true);
      return;
    }
    if (onClose) onClose();
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    if (onClose) onClose();
    if (onReset) {
      onReset();
    }
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  // Props to pass to SheetContent/DialogContent to block interactions
  const contentProps = {
    onPointerDownOutside: (e: Event) => {
      if (isDirty) e.preventDefault();
    },
    onEscapeKeyDown: (e: Event) => {
      if (isDirty) e.preventDefault();
    },
  };

  return {
    showExitConfirm,
    setShowExitConfirm,
    handleOpenChange,
    handleConfirmExit,
    handleCancelExit,
    contentProps,
  };
}
