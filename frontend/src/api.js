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

// **GET CURRENT USER SESSION**
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
// **FETCH ENROLLED COURSES FOR A STUDENT**
export const getEnrolledCourses = async (studentId) => {
    if (!studentId) return { data: null, error: "No student ID provided" };

    const { data, error } = await supabase
        .from('student_course') // Make sure this is the correct table name in Supabase
        .select(`
            id, course_id, semester_id, status, grade, grade_points, is_repeated, credit_hours,
            courses (id, course_code, course_name, prerequisites, credit_hours),
            semesters (id, semester_name, year)
        `)
        .eq('student_id', studentId)
        .order("semester_id", { ascending: false }); // Sort by most recent semester

    if (error) console.error("Error fetching enrolled courses:", error.message);
    return { data, error };
};

// **FETCH COMPLETED COURSES FOR A STUDENT**
export const getCompletedCourses = async (studentId) => {
    if (!studentId) return { data: null, error: "No student ID provided" };

    const { data, error } = await supabase
        .from('student_course')
        .select('course_id')
        .eq('student_id', studentId)
        .eq('status', 'Completed');

    if (error) console.error("Error fetching completed courses:", error.message);
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

    console.log(`🛠 Attempting to enroll Student:`, { studentId, courseId, semesterId });

    // Fetch course details
    const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("prerequisites, course_code, credit_hours")
        .eq("id", courseId)
        .single();

    if (courseError || !courseData) {
        console.error("❌ Error fetching course details:", courseError?.message);
        return { error: { message: "Failed to fetch course details." } };
    }

    console.log("📘 Course Data Retrieved:", courseData);

    // **Special Case: GMGT 590 requires 27 completed core credits**
    if (courseData.course_code === "GMGT 590") {
        const { data: completedCreditsData, error: completedCreditsError } = await supabase
            .from("student_course")
            .select("credit_hours")
            .eq("student_id", studentId)
            .eq("status", "Completed"); // Only count completed courses

        if (completedCreditsError || !completedCreditsData) {
            console.error("❌ Error fetching completed credits:", completedCreditsError?.message);
            return { error: { message: "Failed to fetch completed courses." } };
        }

        // Sum up total completed credits
        const totalCompletedCredits = completedCreditsData.reduce((sum, course) => sum + (course.credit_hours || 0), 0);

        console.log(`📊 Total Completed Credits: ${totalCompletedCredits}`);

        if (totalCompletedCredits < 27) {
            return { error: { message: "You must complete at least 27 core credits before enrolling in GMGT 590." } };
        }
    }

    // Fetch student's completed courses
    const { data: completedData, error: completedError } = await getCompletedCourses(studentId);
    
    if (completedError) {
        console.error("❌ Error fetching completed courses:", completedError?.message);
        return { error: { message: "Failed to fetch completed courses." } };
    }

    const completedCourseIds = completedData.map(c => c.course_id);

    console.log("📌 Completed Courses:", completedCourseIds);

    // Ensure prerequisites is always an array
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
            credit_hours: courseData.credit_hours || 0, // ✅ Ensure credit hours are included
            grade: null,
            grade_points: 0 // ✅ Default grade points to 0
        }]);

    if (error) {
        console.error("❌ Error enrolling in course:", error.message);
        return { error };
    }

    console.log(`✅ Successfully enrolled in course:`, data);
    return { data, error: null };
};

// **DROP A COURSE**
export const dropCourse = async (studentId, courseId, semesterId) => {
    const { error } = await supabase
        .from('student_course')
        .delete()
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .eq('semester_id', semesterId);

    if (error) console.error("Error dropping course:", error.message);
    return { error };
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
export const updateCourse = async (id, updatedCourse) => {
    const { data, error } = await supabase
        .from("courses")
        .update(updatedCourse)
        .eq("id", id);

    if (error) console.error("Error updating course:", error.message);
    return { data, error };
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
export const updateStudentCourse = async (studentId, courseId, semesterId, updates) => {
    if (!studentId || !courseId || !semesterId) {
        return { data: null, error: "Missing studentId, courseId, or semesterId" };
    }

    const { data, error } = await supabase
        .from("student_course") // Ensure this is the correct table name
        .update(updates)
        .eq("student_id", studentId)
        .eq("course_id", courseId)
        .eq("semester_id", semesterId) // ✅ Ensure the correct semester is updated
        .select()
        .single(); // Ensures only one record is updated

    if (error) console.error("Error updating student course:", error.message);
    return { data, error };
};

