import type { WishRecord } from '../types';

/**
 * Sample postcards shown on localhost, and in production while no real wishes
 * exist (existing behaviour — see docs/REFACTOR_AUDIT.md §6). Remove or edit
 * here once real wishes are flowing.
 */
export const SAMPLE_WISHES: readonly WishRecord[] = [
  {
    id: 'dummy_vm',
    displayName: 'Vikram & Meera',
    wish: 'Wishing you both a lifetime of boundless happiness, shared laughter, and beautiful adventures together! So thrilled for you both.',
    submittedAt: '2026-10-15T10:00:00.000Z',
    likesCount: 12,
  },
  {
    id: 'dummy_kd',
    displayName: 'Karthik & Divya',
    wish: 'May your journey together be as harmonious as your favorite songs! Congratulations Lalith and Anjana!',
    submittedAt: '2026-10-18T12:00:00.000Z',
    likesCount: 8,
  },
  {
    id: 'dummy_pn',
    displayName: 'Pooja Narayanan',
    wish: 'Sending you so much love from Bangalore! Can’t wait to celebrate the big day with you both.',
    submittedAt: '2026-10-20T14:30:00.000Z',
    likesCount: 15,
  },
  {
    id: 'dummy_sr',
    displayName: 'Sneha & Rahul',
    wish: 'Here is to a wonderful beginning of a forever love story. God bless you both!',
    submittedAt: '2026-10-22T09:15:00.000Z',
    likesCount: 6,
  },
];
