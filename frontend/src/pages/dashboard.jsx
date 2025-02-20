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

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          navigate("/login");
          return;
        }
        setUserInfo(user);

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

        // Calculate total credits and GPA
        const totalCredits = completedRes.data.reduce(
          (sum, c) => sum + (c.credit_hours || 0),
          0
        );
        const totalGradePoints = completedRes.data.reduce(
          (sum, c) => sum + (c.grade_points || 0),
          0
        );
        const calculatedGpa =
          totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;

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
    if (!course || !Array.isArray(course.prerequisites) || course.prerequisites.length === 0)
      return true;
    if (course.course_code === "GMGT 590" && totalCredits < 27) return false;
    return course.prerequisites.every((prereq) => completedCourses.includes(prereq));
  };

  const handleEnroll = async () => {
    if (!selectedCourse || !selectedSemester) {
      setErrorMessage("Please select both a course and a semester.");
      return;
    }

    const courseToEnroll = availableCourses.find((course) => course.id === selectedCourse);
    if (!isEligibleForCourse(courseToEnroll)) {
      setErrorMessage("You haven't completed the required prerequisites for this course.");
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
    } finally {
      setLoading(false);
    }
  };

  const handleDropCourse = async (courseId) => {
    try {
      setLoading(true);
      const { error } = await dropCourse(userInfo.id, courseId);
      if (error) throw new Error("Failed to drop course.");

      alert("Course dropped successfully!");
      setEnrolledCourses((prevCourses) =>
        prevCourses.filter((course) => course.course_id !== courseId)
      );
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (courseId, field, value) => {
    const { error } = await updateStudentCourse(userInfo.id, courseId, { [field]: value });
    if (error) {
      alert("Failed to update course.");
    } else {
      setEnrolledCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.course_id === courseId ? { ...course, [field]: value } : course
        )
      );
    }
  };

  const groupedCourses = enrolledCourses.reduce((acc, item) => {
    const semesterKey = `${item.semesters.year} ${item.semesters.semester_name}`;
    if (!acc[semesterKey]) acc[semesterKey] = [];
    acc[semesterKey].push(item);
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-6">Your Dashboard</h1>

      {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}

      <div className="text-center mb-6">
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
            value={course.status || "Status"} 
            onChange={(e) => handleUpdateCourse(course.course_id, "status", e.target.value)}
            className="p-1 border border-gray-300 rounded"
          >
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Grade Selection */}
          <select 
            value={course.grade || "Grade"} 
            onChange={(e) => handleUpdateCourse(course.course_id, "grade", e.target.value)}
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
              onChange={(e) => handleUpdateCourse(course.course_id, "is_repeated", e.target.checked)}
              className="h-4 w-4"
            />
            Repeated?
          </label>

          {/* Drop Button */}
          <button
            onClick={() => handleDropCourse(course.course_id)}
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
