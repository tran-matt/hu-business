import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, getCourses, getSemesters, getEnrolledCourses, enrollInCourse, dropCourse } from "../api";

function Dashboard() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          navigate("/login");
          return;
        }
        setUserInfo(user);

        const { data: enrolledData, error: enrolledError } = await getEnrolledCourses(user.id);
        if (enrolledError) throw new Error("Failed to fetch enrolled courses.");
        setEnrolledCourses(enrolledData || []);

        const { data: allCourses, error: coursesError } = await getCourses();
        if (coursesError) throw new Error("Failed to fetch available courses.");
        setAvailableCourses(allCourses || []);

        const { data: allSemesters, error: semestersError } = await getSemesters();
        if (semestersError) throw new Error("Failed to fetch semesters.");
        setSemesters(allSemesters || []);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Group courses by semester for better UI organization
  const groupedCourses = enrolledCourses.reduce((acc, item) => {
    const semesterKey = `${item.semesters.year} ${item.semesters.semester_name}`;
    if (!acc[semesterKey]) acc[semesterKey] = [];
    acc[semesterKey].push(item);
    return acc;
  }, {});

  // Enroll in a new course
  const handleEnroll = async () => {
    if (!selectedCourse || !selectedSemester) {
      setErrorMessage("Please select both a course and a semester.");
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

  // Drop a course
  const handleDropCourse = async (courseId, semesterId) => {
    try {
      setLoading(true);
      const { error } = await dropCourse(userInfo.id, courseId, semesterId);
      if (error) throw new Error("Failed to drop course.");

      alert("Course dropped successfully!");
      setEnrolledCourses(prevCourses =>
        prevCourses.filter(course => !(course.course_id === courseId && course.semester_id === semesterId))
      );
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-6">Your Dashboard</h1>

      {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}

      {loading ? (
        <p className="text-center text-lg mt-10">Loading...</p>
      ) : (
        <>
          {/* ✅ Grouped Enrolled Courses by Semester */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Enrolled Courses</h2>
            {Object.keys(groupedCourses).length === 0 ? (
              <p className="text-gray-600">You have not enrolled in any courses yet.</p>
            ) : (
              <div className="space-y-6">
                {Object.keys(groupedCourses).sort().map((semester, index) => (
                  <div key={index} className="p-4 border border-gray-300 rounded-md">
                    <h3 className="text-xl font-bold mb-2 text-blue-600">{semester}</h3>
                    <ul className="space-y-2">
                      {groupedCourses[semester].map((item, idx) => (
                        <li key={idx} className="p-3 border border-gray-200 rounded-md flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.courses.course_name} ({item.courses.course_code})</p>
                          </div>
                          <button
                            onClick={() => handleDropCourse(item.course_id, item.semester_id)}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition"
                          >
                            Drop
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ✅ Course Enrollment Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Add a Course</h2>
            <div className="flex gap-4">
              {/* Course Dropdown */}
              <select
                className="p-2 border border-gray-300 rounded w-1/3"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">Select a Course</option>
                {availableCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.course_name} ({course.course_code})
                  </option>
                ))}
              </select>

              {/* Semester Dropdown */}
              <select
                className="p-2 border border-gray-300 rounded w-1/3"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                <option value="">Select a Semester</option>
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.semester_name} {semester.year}
                  </option>
                ))}
              </select>

              {/* Enroll Button */}
              <button
                onClick={handleEnroll}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
              >
                Enroll
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
