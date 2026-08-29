import type { User } from '@supabase/supabase-js';

/**
 * Utility to reliably compute and store course progress consistently across Catalog & Lesson Page.
 */
export const getProgressStorageKey = (user: User | null, courseSlug: string) => {
  return `rutapyme_completed_${user?.id || 'guest'}_${courseSlug || 'lean-manufacturing'}`;
};

export const getCompletedLessonsMap = (user: User | null, courseSlug: string): Record<string, boolean> => {
  try {
    const key = getProgressStorageKey(user, courseSlug);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const saveCompletedLessonsMap = (user: User | null, courseSlug: string, map: Record<string, boolean>) => {
  try {
    const key = getProgressStorageKey(user, courseSlug);
    localStorage.setItem(key, JSON.stringify(map));
  } catch (e) {
    console.error('Error saving progress:', e);
  }
};

export const calculateCourseProgress = (user: User | null, courseSlug: string, totalLessonsCount = 3): number => {
  const map = getCompletedLessonsMap(user, courseSlug);
  const uniqueCompletedSlugs = Object.keys(map).filter((k) => map[k] && !k.startsWith('lesson-'));
  // If fallback IDs exist, fallback to clean count
  const keys = Object.keys(map).filter((k) => map[k]);
  const doneCount = uniqueCompletedSlugs.length > 0 ? uniqueCompletedSlugs.length : Math.min(totalLessonsCount, keys.length);
  
  if (totalLessonsCount === 0) return 0;
  return Math.min(100, Math.round((doneCount / totalLessonsCount) * 100));
};
