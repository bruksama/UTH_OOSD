import api from './api';
import { CourseDTO } from '../types';

export const fetchCourses = async (): Promise<CourseDTO[]> => {
    const res = await api.get<CourseDTO[]>('/courses');
    return res.data;
};
