import { useEffect, useState } from 'react';
import { courseService } from '../../services';
import { CourseDTO } from '../../types';

/**
 * MyCourses - Course Catalog
 * Students can view all available courses offered by the university.
 * This is a read-only view for reference.
 * Enrollments are managed in the "My Grades" page.
 */
const MyCourses = () => {
    const [courses, setCourses] = useState<CourseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('All');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await courseService.getAll();
                setCourses(response.data);
            } catch (err) {
                console.error('Error fetching courses:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    // Extract unique departments
    const departments = ['All', ...Array.from(new Set(courses.map(c => c.department || 'General')))];

    const filteredCourses = courses.filter(c => {
        const matchesSearch = c.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = selectedDepartment === 'All' || (c.department || 'General') === selectedDepartment;

        return matchesSearch && matchesDept;
    });

    if (loading) return <div className="text-center py-10"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Course Catalog</h1>
                    <p className="text-slate-500">Browse all available courses offered by the university</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Department Filter */}
                    <div className="relative w-full sm:w-48">
                        <select
                            className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none appearance-none bg-white cursor-pointer"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                        >
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search courses..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                    <div key={course.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow p-6 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-lg text-sm font-bold font-mono">
                                {course.courseCode}
                            </span>
                            <span className="text-slate-500 text-sm font-medium">
                                {course.credits} Credits
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-2">{course.courseName}</h3>

                        <p className="text-slate-600 text-sm flex-grow mb-6 line-clamp-3">
                            {course.description || "No description available for this course."}
                        </p>

                        <div className="pt-4 border-t border-slate-100 mt-auto flex justify-between items-center text-sm">
                            <span className="text-slate-500">
                                Dept: <span className="font-medium text-slate-700">{course.department || 'General'}</span>
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500">No courses found matching "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
};

export default MyCourses;
