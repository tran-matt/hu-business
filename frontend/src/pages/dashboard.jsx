import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  supabase,
  getCourses,
  getSemesters,
  getEnrolledCourses,
  enrollInCourse,
  dropCourse,
  getCompletedCourses,
  updateStudentCourse,
  getUserSession,  
} from "../api";


function Dashboard() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [totalCredits, setTotalCredits] = useState(0);
  const [gpa, setGpa] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [huId, setHuId] = useState(""); 
const [isEditingHuId, setIsEditingHuId] = useState(false);


  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setErrorMessage(null);
  
      try {
          const user = await getUserSession();
          if (!user) {
              navigate("/login");
              return;
          }
  
          setUserInfo(user);
          setHuId(user.hu_id); // ✅ Store HU ID in state
  
          const [enrolledRes, coursesRes, semestersRes, completedRes] =
              await Promise.all([
                  getEnrolledCourses(user.id),
                  getCourses(),
                  getSemesters(),
                  getCompletedCourses(user.id),
              ]);
  
          if (enrolledRes.error) throw new Error("Failed to fetch enrolled courses.");
          if (coursesRes.error) throw new Error("Failed to fetch available courses.");
          if (semestersRes.error) throw new Error("Failed to fetch semesters.");
          if (completedRes.error) throw new Error("Failed to fetch completed courses.");
  
          setEnrolledCourses(enrolledRes.data || []);
          setAvailableCourses(coursesRes.data || []);
          setSemesters(semestersRes.data || []);
          setCompletedCourses(completedRes.data.map((c) => c.course_id));
  
          // 🔹 Calculate Total Completed Credits & GPA
          let totalCredits = 0;
          let totalGradePoints = 0;
  
          completedRes.data.forEach((course) => {
              if (course.status === "Completed") {
                  totalCredits += course.credit_hours || 0;
                  totalGradePoints += (course.grade_points || 0) * (course.credit_hours || 0);
              }
          });
  
          const calculatedGpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
  
          setTotalCredits(totalCredits);
          setGpa(calculatedGpa);
      } catch (error) {
          setErrorMessage(error.message);
      } finally {
          setLoading(false);
      }
  };
  

    fetchUserData();
}, [navigate]);

  const isEligibleForCourse = (course) => {
    if (!course) return false;
    const prerequisites = Array.isArray(course.prerequisites) ? course.prerequisites : [];
  
    console.log("Checking eligibility for:", course.course_code, "Prerequisites:", prerequisites);
  
    if (course.course_code === "GMGT 590" && totalCredits < 27) return false;
    return prerequisites.every((prereq) => completedCourses.includes(prereq));
  };
  

  const handleEnroll = async () => {
    if (!selectedCourse || !selectedSemester) {
      setErrorMessage("Please select both a course and a semester.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
  
    const alreadyEnrolled = enrolledCourses.some(
      (course) => course.course_id === selectedCourse && course.semester_id === selectedSemester
    );
  
    if (alreadyEnrolled) {
      setErrorMessage("You are already enrolled in this course for the selected semester.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
  
    const courseToEnroll = availableCourses.find((course) => course.id === selectedCourse);
  
    if (!courseToEnroll) {
      setErrorMessage("Error: Selected course not found in available courses.");
      console.error("Selected course not found:", selectedCourse);
      return;
    }
  
    // ✅ Ensure prerequisites is always an array
    if (!courseToEnroll.prerequisites || !Array.isArray(courseToEnroll.prerequisites)) {
      courseToEnroll.prerequisites = [];
  }
  
    console.log("Course to Enroll (After Fix):", courseToEnroll);
  
    if (!isEligibleForCourse(courseToEnroll)) {
      setErrorMessage("You haven't completed the required prerequisites for this course.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
  
    try {
      setLoading(true);
      const { error } = await enrollInCourse(userInfo.id, selectedCourse, selectedSemester);
      if (error) throw new Error("Failed to enroll in course.");
  
      alert("Successfully enrolled!");
      const { data: updatedEnrolledCourses } = await getEnrolledCourses(userInfo.id);
      setEnrolledCourses(updatedEnrolledCourses || []);
      setSelectedCourse("");
      setSelectedSemester("");
    } catch (error) {
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleDropCourse = async (courseId, semesterId) => {
    try {
      setLoading(true);
      const { error } = await dropCourse(userInfo.id, courseId, semesterId);
      if (error) throw new Error("Failed to drop course.");
  
      alert("Course dropped successfully!");
  
      // ✅ Removes only the course matching both `course_id` and `semester_id`
      setEnrolledCourses((prevCourses) =>
        prevCourses.filter((course) =>
          !(course.course_id === courseId && course.semester_id === semesterId)
        )
      );
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateCourse = async (courseId, semesterId, field, value) => {
    try {
        console.log(`Updating Course: ${courseId}, Semester: ${semesterId}, Field: ${field}, Value: ${value}`);

        // 🔹 Optimistically update UI
        setEnrolledCourses((prevCourses) =>
            prevCourses.map((course) =>
                course.course_id === courseId && course.semester_id === semesterId
                    ? { ...course, [field]: value }
                    : course
            )
        );

        // 🔹 Send update request to Supabase
        const { error } = await updateStudentCourse(userInfo.id, courseId, semesterId, { [field]: value });

        if (error) {
            console.error("Update failed:", error.message);
            throw new Error("Failed to update course.");
        }

        console.log("Update successful. Fetching updated courses...");

        // 🔹 Fetch latest enrolled courses **after successful update**
        const updatedEnrolledCourses = await getEnrolledCourses(userInfo.id);
if (updatedEnrolledCourses.error) {
    console.error("Failed to fetch updated enrolled courses:", updatedEnrolledCourses.error.message);
} else {
    setEnrolledCourses(updatedEnrolledCourses.data || []);
}


        // 🔹 Fetch latest completed courses
        const { data: updatedCompletedCourses, error: completedError } = await getCompletedCourses(userInfo.id);
        if (completedError) {
            console.error("Fetch failed:", completedError.message);
            throw new Error("Failed to fetch updated completed courses.");
        }

        let newTotalCredits = 0;
        let newTotalGradePoints = 0;

        updatedCompletedCourses.forEach((course) => {
            if (course.status === "Completed") {
                newTotalCredits += course.credit_hours || 0;
                newTotalGradePoints += (course.grade_points || 0) * (course.credit_hours || 0);
            }
        });

        const newCalculatedGpa = newTotalCredits > 0 ? (newTotalGradePoints / newTotalCredits).toFixed(2) : 0;
        setTotalCredits(newTotalCredits);
        setGpa(newCalculatedGpa);

    } catch (error) {
        alert(error.message);
    }
};

  // ✅ Ensure courses are correctly grouped by semester
  const groupedCourses = enrolledCourses.reduce((acc, item) => {
    if (!item.semesters || !item.courses) return acc; 

    const semesterKey = `${item.semesters.year} ${item.semesters.semester_name}`;
    if (!acc[semesterKey]) acc[semesterKey] = [];
    acc[semesterKey].push(item);
    return acc;
}, {});

  
  const handleUpdateHuId = async () => {
    if (!huId.trim()) {
        alert("HU ID cannot be empty.");
        return;
    }

    try {
        setLoading(true);
        const { error } = await supabase
            .from('students')
            .update({ hu_id: huId })
            .eq('id', userInfo.id);

        if (error) {
            console.error("Error updating HU ID:", error.message);
            alert("Failed to update HU ID.");
        } else {
            alert("HU ID updated successfully!");
            setIsEditingHuId(false); // ✅ Exit edit mode
        }
    } catch (error) {
        console.error("Unexpected error:", error.message);
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-6">Your Dashboard</h1>

      {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}
      {/* ✅ Display Student Info */}
      {loading && <p className="text-center text-gray-500">Loading...</p>}
    {userInfo && (
        <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6 text-left">
        <p className="text-lg font-semibold">Student Name: <span className="text-blue-600">{userInfo.first_name} {userInfo.last_name}</span></p>
        <p className="text-lg font-semibold">Email: <span className="text-blue-600">{userInfo.email}</span></p>
    
        {/* ✅ Editable HU ID Section */}
        <p className="text-lg font-semibold">HU ID No: 
            {isEditingHuId ? (
                <input 
                    type="text" 
                    value={huId} 
                    onChange={(e) => setHuId(e.target.value)} 
                    className="ml-2 border border-gray-300 p-1 rounded"
                />
            ) : (
                <span className="text-blue-600 ml-2">{huId || "Not Set"}</span>
            )}
            <button 
                onClick={() => isEditingHuId ? handleUpdateHuId() : setIsEditingHuId(true)} 
                className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-700 transition"
            >
                {isEditingHuId ? "Save" : "Edit"}
            </button>
        </p>
    </div>
    )}

    {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}
    <div className="text-left mb-6">
    <p className="text-lg font-semibold">
        Total Completed Credits: <span className="text-blue-600">{totalCredits}</span>
    </p>
    <p className="text-lg font-semibold">
        Cumulative GPA: <span className="text-blue-600">{gpa}</span>
    </p>
</div>

      <h2 className="text-2xl font-semibold mb-4">Add a Course</h2>
      <div className="flex gap-4 mb-6">
        <select className="p-2 border border-gray-300 rounded w-1/3" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
          <option value="">Select a Course</option>
          {availableCourses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.course_name} ({course.course_code})
            </option>
          ))}
        </select>

        <select className="p-2 border border-gray-300 rounded w-1/3" value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
          <option value="">Select a Semester</option>
          {semesters.map((semester) => (
            <option key={semester.id} value={semester.id}>
              {semester.semester_name} {semester.year}
            </option>
          ))}
        </select>

        <button onClick={handleEnroll} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition">Enroll</button>
      </div>

      {Object.keys(groupedCourses).map((semester) => (
  <div key={semester} className="mb-6">
    <h3 className="text-xl font-bold mb-2 text-blue-600">{semester}</h3>
    {groupedCourses[semester].map((course, index) => (
      <div 
        key={course.enrollment_id || `${course.course_id}-${course.semester_id}-${index}`} 
        className="p-4 border border-gray-300 rounded-md mb-2 flex justify-between items-center"
      >
        <p>{course.courses.course_name} ({course.courses.course_code})</p>

        {/* Status, Grade, and Repeated Course Selection */}
        <div className="flex gap-4 items-center">
          {/* Status Selection */}
<select 
  value={course.status || "Planned"} 
  onChange={(e) => handleUpdateCourse(course.course_id, course.semester_id, "status", e.target.value)}
  className="p-1 border border-gray-300 rounded"
>
  <option value="Planned">Planned</option>
  <option value="In Progress">In Progress</option>
  <option value="Completed">Completed</option>
</select>

{/* Grade Selection */}
<select 
  value={course.grade || "Grade"} 
  onChange={(e) => handleUpdateCourse(course.course_id, course.semester_id, "grade", e.target.value)}
  className="p-1 border border-gray-300 rounded"
>
  <option value="Grade">N/A</option>
  <option value="A">A</option>
  <option value="B">B</option>
  <option value="C">C</option>
  <option value="D">D</option>
  <option value="F">F</option>
</select>

{/* Repeated Checkbox */}
<label className="flex items-center gap-2">
  <input 
    type="checkbox" 
    checked={course.is_repeated || false} 
    onChange={(e) => handleUpdateCourse(course.course_id, course.semester_id, "is_repeated", e.target.checked)}
    className="h-4 w-4"
  />
  Repeated?
</label>

          {/* Drop Button */}
          <button
  onClick={() => handleDropCourse(course.course_id, course.semester_id)}
  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition"
>
  Drop
</button>

        </div>
      </div>
    ))}
  </div>
))}

      <p className="text-center text-gray-700 mt-6"> Notes:
A cumulative grade point average (GPA) of 3.00 (B) is required for graduation.
A student who falls below the 3.00 GPA must raise the GPA to 3.00 within the next two terms. Failing to do so will result in dismissal from the MBA program.</p>
    </div>
  );
}

export default Dashboard;
