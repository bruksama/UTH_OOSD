import { StudentDTO, StudentStatus } from "../types";

const mockStudents: StudentDTO[] = [
    {
        studentId: "STU001",
        firstName: "Nguyen",
        lastName: "Van A",
        email: "nguyenvana@student.edu",
        gpa: 3.45,
        totalCredits: 90,
        status: StudentStatus.NORMAL,
        enrollmentDate: "2022-09-01",
    },
    {
        studentId: "STU002",
        firstName: "Tran",
        lastName: "Thi B",
        email: "tranthib@student.edu",
        gpa: 1.85,
        totalCredits: 75,
        status: StudentStatus.AT_RISK,
        enrollmentDate: "2022-09-01",
    },
];

export const getStudents = async (): Promise<StudentDTO[]> => {
    return Promise.resolve(mockStudents);
};
