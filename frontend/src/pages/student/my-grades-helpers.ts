import { CourseOfferingDTO } from '../../types';

export type GradeHierarchyView = 'loading' | 'empty' | 'content';

export const filterAvailableOfferings = (
    offerings: CourseOfferingDTO[],
    enrolledCourseCodes: Set<string | undefined>,
    department: string,
) => offerings.filter((offering) => {
    if (enrolledCourseCodes.has(offering.courseCode)) return false;
    return department === 'All' || (offering.department || 'General') === department;
});

export const parseBoundedNumber = (value: string, min: number, max: number): number | null => {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) || parsed < min || parsed > max ? null : parsed;
};

export const getGradeHierarchyView = (loading: boolean, entryCount: number): GradeHierarchyView => {
    if (loading) return 'loading';
    if (entryCount === 0) return 'empty';
    return 'content';
};
