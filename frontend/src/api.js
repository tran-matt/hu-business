import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// **REGISTER USER**
export const registerUser = async (email, password, firstName, lastName, gradYear) => {
    try {
        const { data: existingUser } = await supabase
            .from('students')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return { error: { message: "This email is already registered. Please log in instead." } };
        }

        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return { data, error };

        const userId = data?.user?.id;
        if (!userId) return { error: { message: "User registration failed." } };

        const { error: studentError } = await supabase
            .from('students')
            .insert([{ id: userId, first_name: firstName, last_name: lastName, email, anticipated_graduation_year: gradYear }]);

        return { data, error: studentError || null };
    } catch (err) {
        return { error: { message: "Unexpected error occurred. Please try again." } };
    }
};

// **LOGIN USER**
export const loginUser = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    } catch (err) {
        return { error: { message: "Unexpected error occurred during login." } };
    }
};

// **LOGOUT USER**
export const logoutUser = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        return error;
    } catch (err) {
        return { error: { message: "Unexpected error occurred during logout." } };
    }
};

// **GET CURRENT USER SESSION & STUDENT INFO**
export const getUserSession = async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return null;

        // Fetch student details using the authenticated user ID
        const { data: studentData, error } = await supabase
            .from('students')
            .select('id, first_name, last_name, email, hu_id')
            .eq('id', session.user.id)
            .single();

        if (error) {
            console.error("Error fetching student data:", error.message);
            return null;
        }

        console.log("✅ Found Student ID:", studentData.id); // Debugging

        return { ...session.user, ...studentData };
    } catch (err) {
        console.error("Error fetching user session:", err.message);
        return null;
    }
};



// **FETCH ALL COURSES WITH PREREQUISITES**
export const getCourses = async () => {
    const { data, error } = await supabase
        .from('courses')
        .select('id, course_code, course_name, credit_hours, prerequisites');

    if (error) {
        console.error('Error fetching courses:', error.message);
        return { data: null, error };
    }

    // ✅ Ensure prerequisites is always an array
    const fixedData = data.map(course => ({
        ...course,
        prerequisites: Array.isArray(course.prerequisites) ? course.prerequisites : [],
    }));

    return { data: fixedData, error };
};

// **FETCH AVAILABLE SEMESTERS**
export const getSemesters = async () => {
    const { data, error } = await supabase
        .from('semesters')
        .select('*')
        .order('year', { ascending: true });

    if (error) console.error('Error fetching semesters:', error.message);
    return { data, error };
};

// **FETCH ENROLLED COURSES FOR A STUDENT**
export const getEnrolledCourses = async (studentId) => {
    if (!studentId) {
        console.error("No student ID provided");
        return { data: null, error: "No student ID provided" };
    }

    console.log(`Fetching enrolled courses for Student ID: ${studentId}`);

    const { data, error } = await supabase
        .from("student_course")
        .select(`
            id, 
            student_id,
            course_id, 
            semester_id, 
            status, 
            grade, 
            grade_points, 
            is_repeated, 
            credit_hours,
            courses!inner (id, course_code, course_name, credit_hours),
            semesters!inner (id, semester_name, year)
        `)
        .eq("student_id", studentId)
        .order("semester_id", { ascending: false });

    if (error) {
        console.error("Error fetching enrolled courses:", error.message);
        return { data: null, error };
    }

    console.log("Retrieved Enrolled Courses:", data);
    return { data, error };
};

// **CALCULATE CUMULATIVE GPA**
export const calculateGPA = async (studentId) => {
    const { data, error } = await supabase
        .from('student_course')
        .select('grade_points, credit_hours')
        .eq('student_id', studentId)
        .eq('status', 'Completed');

    if (error) {
        console.error("Error calculating GPA:", error.message);
        return { data: null, error };
    }

    let totalPoints = 0;
    let totalCredits = 0;

    data.forEach(({ grade_points, credit_hours }) => {
        totalPoints += grade_points * credit_hours;
        totalCredits += credit_hours;
    });

    const cumulativeGPA = totalCredits ? (totalPoints / totalCredits).toFixed(2) : 0;

    return { data: cumulativeGPA, error: null };
};

// **ENROLL STUDENT IN COURSE (CHECK PREREQUISITES)**
export const enrollInCourse = async (studentId, courseId, semesterId) => {
    if (!studentId || !courseId || !semesterId) {
        return { error: { message: "Missing parameters" } };
    }

    console.log(`Attempting to enroll Student:`, { studentId, courseId, semesterId });

    // Fetch course details
    const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("prerequisites, course_code, credit_hours")
        .eq("id", courseId)
        .single();

    if (courseError || !courseData) {
        console.error("Error fetching course details:", courseError?.message);
        return { error: { message: "Failed to fetch course details." } };
    }

    console.log("📘 Course Data Retrieved:", courseData);

    // Fetch student's completed courses
    const { data: completedData, error: completedError } = await getCompletedCourses(studentId);
    
    if (completedError) {
        console.error("❌ Error fetching completed courses:", completedError?.message);
        return { error: { message: "Failed to fetch completed courses." } };
    }

    const completedCourseIds = completedData.map(c => c.course_id);

    console.log("📌 Completed Courses:", completedCourseIds);

    // Ensure prerequisites are met
    const prerequisites = Array.isArray(courseData.prerequisites) ? courseData.prerequisites : [];

    if (prerequisites.length > 0) {
        const missingPrereqs = prerequisites.filter(prereq => !completedCourseIds.includes(prereq));

        if (missingPrereqs.length > 0) {
            console.warn("⚠️ Missing Prerequisites:", missingPrereqs);
            return { error: { message: "You haven't completed the required prerequisites for this course." } };
        }
    }

    // 🔹 Ensure `credit_hours` is included in the insert
    const { data, error } = await supabase
        .from("student_course")
        .insert([{ 
            student_id: studentId, 
            course_id: courseId, 
            semester_id: semesterId, 
            status: "Planned", 
            credit_hours: courseData.credit_hours || 0, // Ensure credit hours are included
            grade: null,
            grade_points: 0, // Default grade points to 0
            is_repeated: false // Default value
        }])
        .select();

    if (error) {
        console.error("Error enrolling in course:", error.message);
        return { error };
    }

    console.log(`Successfully enrolled in course:`, data);
    return { data, error: null };
};


// **DROP A COURSE**
export const dropCourse = async (studentId, courseId, semesterId) => {
    try {
        console.log(`🗑️ Attempting to delete course:`, { studentId, courseId, semesterId });

        // Step 1: Fetch the row's primary key (id)
        const { data: existingCourse, error: fetchError } = await supabase
            .from('student_course')
            .select('id')
            .eq('student_id', studentId)
            .eq('course_id', courseId)
            .eq('semester_id', semesterId)
            .single();

        if (fetchError) {
            console.error("❌ Error fetching course before deletion:", fetchError.message);
            return { error: fetchError };
        }

        if (!existingCourse) {
            console.warn("⚠️ No matching course found in database.");
            return { error: { message: "Course not found. Unable to drop." } };
        }

        console.log(`🚀 Found course ID, proceeding with deletion:`, existingCourse.id);

        // Step 2: Delete by `id`
        const { error } = await supabase
            .from('student_course')
            .delete()
            .eq('id', existingCourse.id);

        if (error) {
            console.error("❌ Error dropping course:", error.message);
            return { error };
        }

        console.log("✅ Successfully dropped course.");
        return { error: null };

    } catch (err) {
        console.error("❌ Unexpected error in dropCourse:", err.message);
        return { error: { message: "Unexpected error occurred while dropping the course." } };
    }
};


// **UPDATE COURSE GRADE**
export const updateGrade = async (studentId, courseId, grade) => {
    const gradeMapping = { A: 4, B: 3, C: 2, D: 1, F: 0 };
    const gradePoints = gradeMapping[grade] || 0;

    const { error } = await supabase
        .from("student_course")
        .update({ grade, grade_points: gradePoints, status: "Completed" })
        .eq("student_id", studentId)
        .eq("course_id", courseId);

    if (error) console.error("Error updating grade:", error.message);
    return { error };
};

// Fetch all courses
export const getAllCourses = async () => {
    const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("course_code", { ascending: true });

    if (error) console.error("Error fetching courses:", error.message);
    return { data, error };
};

// Add a new course
export const addCourse = async (course) => {
    const { data, error } = await supabase.from("courses").insert([course]);
    if (error) console.error("Error adding course:", error.message);
    return { data, error };
};

// Update an existing course
export const updateCourse = async (studentId, courseId, semesterId, newGrade, newGradePoints) => {
    const { data, error } = await supabase
        .from("student_course")
        .update({ grade: newGrade, grade_points: newGradePoints })
        .eq("student_id", studentId)
        .eq("course_id", courseId)
        .eq("semester_id", semesterId)
        .select("*"); // Ensures updated data is returned immediately

    if (error) {
        console.error("Error updating course:", error);
    } else {
        console.log("Update successful:", data);
        return data; // Optionally return updated data
    }
};

// Delete a course
export const deleteCourse = async (id) => {
    const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", id);

    if (error) console.error("Error deleting course:", error.message);
    return { error };
};

// **UPDATE STUDENT COURSE STATUS, GRADE, OR REPEATED STATUS**
export const updateStudentCourse = async (studentId, courseId, semesterId, updatedFields) => {
    const { data, error } = await supabase
        .from("student_course")
        .update(updatedFields)
        .eq("student_id", studentId)
        .eq("course_id", courseId)
        .eq("semester_id", semesterId)
        .select(); // ✅ Ensures updated data is returned

    if (error) {
        console.error("Supabase Update Error:", error);
    } else {
        console.log("Supabase Update Successful:", data);
    }

    return { data, error };
};



export const getCompletedCourses = async (studentId) => {
    if (!studentId) {
        console.error("No student ID provided");
        return { data: null, error: "No student ID provided" };
    }

    const { data, error } = await supabase
        .from('student_course')
        .select('course_id, credit_hours, grade_points, status')
        .eq('student_id', studentId)
        .eq('status', 'Completed');

    if (error) {
        console.error("Error fetching completed courses:", error.message);
        return { data: null, error };
    }

    console.log("Completed Courses:", data);
    return { data, error };
};
