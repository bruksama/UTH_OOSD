import { describe, expect, it } from 'vitest';
import { getLetterGradeColor } from './helpers';

describe('getLetterGradeColor', () => {
    it('keeps zero, null and undefined on the failing-grade fallback', () => {
        const expected = 'bg-red-50 text-red-700 border-red-200';
        expect(getLetterGradeColor(0)).toBe(expected);
        expect(getLetterGradeColor(null)).toBe(expected);
        expect(getLetterGradeColor(undefined)).toBe(expected);
    });

    it('keeps the existing grade thresholds', () => {
        expect(getLetterGradeColor(8.5)).toContain('emerald');
        expect(getLetterGradeColor(5)).toContain('amber');
        expect(getLetterGradeColor(4)).toContain('orange');
    });
});
