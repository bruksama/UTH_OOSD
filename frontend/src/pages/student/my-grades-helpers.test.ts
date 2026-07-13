import { describe, expect, it } from 'vitest';
import { Semester } from '../../types';
import { filterAvailableOfferings, getGradeHierarchyView, parseBoundedNumber } from './my-grades-helpers';

describe('my-grades helpers', () => {
    const offerings = [
        { id: 1, courseId: 1, courseCode: 'CS101', courseName: 'One', department: 'CS', semester: Semester.FALL, academicYear: 2024 },
        { id: 2, courseId: 2, courseCode: 'MA101', courseName: 'Two', department: 'Math', semester: Semester.FALL, academicYear: 2024 },
    ];

    it('filters enrolled courses with Set membership and department selection', () => {
        expect(filterAvailableOfferings(offerings, new Set(['CS101']), 'All').map(o => o.id)).toEqual([2]);
        expect(filterAvailableOfferings(offerings, new Set(), 'CS').map(o => o.id)).toEqual([1]);
    });

    it('parses inclusive numeric boundaries and rejects invalid values', () => {
        expect(parseBoundedNumber('0', 0, 10)).toBe(0);
        expect(parseBoundedNumber('10', 0, 10)).toBe(10);
        expect(parseBoundedNumber('-0.1', 0, 10)).toBeNull();
        expect(parseBoundedNumber('10.1', 0, 10)).toBeNull();
        expect(parseBoundedNumber('not-a-number', 0, 10)).toBeNull();
    });

    it('selects loading, empty, and content views', () => {
        expect(getGradeHierarchyView(true, 0)).toBe('loading');
        expect(getGradeHierarchyView(false, 0)).toBe('empty');
        expect(getGradeHierarchyView(false, 1)).toBe('content');
    });
});
