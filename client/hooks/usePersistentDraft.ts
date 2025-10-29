import { useEffect, useRef } from 'react';

interface DraftData {
  [key: string]: any;
}

export function usePersistentDraft(key: string, initialData: DraftData) {
  const timerRef = useRef<NodeJS.Timeout>();

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(`draft_${key}`);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        // Return draft data to component through callback
        return () => {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        };
      } catch (e) {
        console.error('Failed to parse draft:', e);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [key]);

  const saveDraft = (data: DraftData) => {
    try {
      localStorage.setItem(`draft_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save draft:', e);
    }
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(`draft_${key}`);
    } catch (e) {
      console.error('Failed to clear draft:', e);
    }
  };

  const loadDraft = (): DraftData | null => {
    try {
      const saved = localStorage.getItem(`draft_${key}`);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to load draft:', e);
      return null;
    }
  };

  return {
    saveDraft,
    clearDraft,
    loadDraft,
  };
}
