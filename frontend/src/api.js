import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = 'https://dqnoznfkjkexgtzvjpcq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxbm96bmZramtleGd0enZqcGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5NTQ4MjAsImV4cCI6MjA1NDUzMDgyMH0.nP8Zloowi4mz7MkB9ggYkcn9cady3yk9IbDsCrdhGS4';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Register user
export const registerUser = async (email, password, firstName, lastName, gradYear) => {
    try {
        // Check if the email already exists in students table
        const { data: existingUser } = await supabase
            .from('students')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return { error: { message: "This email is already registered. Please log in instead." } };
        }

        // Create user in Supabase authentication
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) return { data, error };

        // Get user ID from authentication response
        const userId = data?.user?.id;
        if (!userId) return { error: { message: "User registration failed." } };

        // Insert user into students table
        const { error: studentError } = await supabase
            .from('students')
            .insert([{ 
                id: userId, 
                first_name: firstName, 
                last_name: lastName, 
                email, 
                anticipated_graduation_year: gradYear 
            }]);

        return { data, error: studentError || null };
    } catch (err) {
        return { error: { message: "Unexpected error occurred. Please try again." } };
    }
};

// Login user
export const loginUser = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    } catch (err) {
        return { error: { message: "Unexpected error occurred during login." } };
    }
};

// Logout user
export const logoutUser = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        return error;
    } catch (err) {
        return { error: { message: "Unexpected error occurred during logout." } };
    }
};

// Get current user session
export const getUserSession = async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.user || null;
    } catch (err) {
        return null;
    }
};

// Fetch all available courses
export const getCourses = async () => {
    const { data, error } = await supabase
        .from('courses')
        .select('*');  // Ensure all fields are selected

    console.log("Fetched Courses:", data); // Debugging log

    if (error) {
        console.error('Error fetching courses:', error.message);
    }
    return { data, error };
};

// Fetch available semesters
export const getSemesters = async () => {
    const { data, error } = await supabase
        .from('semesters')
        .select('*')
        .order('year', { ascending: true });

    console.log("Fetched Semesters:", data); // Debugging log

    if (error) {
        console.error('Error fetching semesters:', error.message);
    }
    return { data, error };
};



// Fetch enrolled courses for a student
export const getEnrolledCourses = async (studentId) => {
    if (!studentId) return { data: null, error: "No student ID provided" };

    const { data, error } = await supabase
        .from('student_course')
        .select(`
            id, course_id, semester_id, status,
            courses (id, course_code, course_name),
            semesters (id, semester_name, year)
        `)
        .eq('student_id', studentId);

    if (error) console.error("Error fetching enrolled courses:", error.message);
    return { data, error };
};

// Enroll a student in a course for a specific semester
export const enrollInCourse = async (studentId, courseId, semesterId) => {
    const { data, error } = await supabase
        .from('student_course')
        .insert([{ student_id: studentId, course_id: courseId, semester_id: semesterId, status: 'Enrolled' }]);

    if (error) {
        console.error('Error enrolling in course:', error.message);
    }
    return { data, error };
};

// Drop a course
export const dropCourse = async (studentId, courseId, semesterId) => {
    const { error } = await supabase
        .from('student_course')
        .delete()
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .eq('semester_id', semesterId);

    return { error };
};

// Fetch all courses
export const getAllCourses = async () => {
    const { data, error } = await supabase.from("courses").select("*");
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
    const { data, error } = await supabase.from("courses").update(updatedCourse).eq("id", id);
    if (error) console.error("Error updating course:", error.message);
    return { data, error };
};

// Delete a course
export const deleteCourse = async (id) => {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) console.error("Error deleting course:", error.message);
    return { error };
};

