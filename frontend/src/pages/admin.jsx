import React, { useEffect, useState } from "react";
import { getAllCourses, addCourse, updateCourse, deleteCourse } from "../api";

function Admin() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // State for adding/editing courses
  const [newCourse, setNewCourse] = useState({ course_code: "", course_name: "", description: "", credit_hours: "" });
  const [editingCourse, setEditingCourse] = useState(null);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data, error } = await getAllCourses();
      if (error) setErrorMessage("Failed to fetch courses.");
      else setCourses(data);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  // Handle adding a new course
  const handleAddCourse = async () => {
    if (!newCourse.course_code || !newCourse.course_name) {
      setErrorMessage("Course Code and Name are required.");
      return;
    }
    const { error } = await addCourse(newCourse);
    if (error) setErrorMessage("Failed to add course.");
    else {
      alert("Course added successfully!");
      setCourses([...courses, newCourse]); // Update UI without refresh
      setNewCourse({ course_code: "", course_name: "", description: "", credit_hours: "" });
    }
  };

  // Handle updating a course
  const handleUpdateCourse = async () => {
    if (!editingCourse.course_code || !editingCourse.course_name) {
      setErrorMessage("Course Code and Name are required.");
      return;
    }
    const { error } = await updateCourse(editingCourse.id, editingCourse);
    if (error) setErrorMessage("Failed to update course.");
    else {
      alert("Course updated successfully!");
      setCourses(courses.map(course => (course.id === editingCourse.id ? editingCourse : course)));
      setEditingCourse(null);
    }
  };

  // Handle deleting a course
  const handleDeleteCourse = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this course?");
    if (!confirmDelete) return;

    const { error } = await deleteCourse(id);
    if (error) setErrorMessage("Failed to delete course.");
    else {
      alert("Course deleted successfully!");
      setCourses(courses.filter(course => course.id !== id));
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* ✅ Title Section */}
      <h1 className="text-4xl font-bold text-center">Admin Panel</h1>
      <p className="text-center text-gray-500 text-lg mt-1">Manage Courses</p>

      {errorMessage && <p className="text-red-500 text-center mt-4">{errorMessage}</p>}

      {/* ✅ Add/Edit Course Form */}
      <div className="mt-6 p-6 border border-gray-300 rounded-md shadow-md">
        <h2 className="text-2xl font-semibold">{editingCourse ? "Edit Course" : "Add New Course"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <input
            type="text"
            placeholder="Course Code"
            className="p-2 border border-gray-500 rounded w-full"
            value={editingCourse ? editingCourse.course_code : newCourse.course_code}
            onChange={(e) =>
              editingCourse
                ? setEditingCourse({ ...editingCourse, course_code: e.target.value })
                : setNewCourse({ ...newCourse, course_code: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Course Name"
            className="p-2 border border-gray-500 rounded w-full"
            value={editingCourse ? editingCourse.course_name : newCourse.course_name}
            onChange={(e) =>
              editingCourse
                ? setEditingCourse({ ...editingCourse, course_name: e.target.value })
                : setNewCourse({ ...newCourse, course_name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Description"
            className="p-2 border border-gray-500 rounded w-full"
            value={editingCourse ? editingCourse.description : newCourse.description}
            onChange={(e) =>
              editingCourse
                ? setEditingCourse({ ...editingCourse, description: e.target.value })
                : setNewCourse({ ...newCourse, description: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Credit Hours"
            className="p-2 border border-gray-500 rounded w-full"
            value={editingCourse ? editingCourse.credit_hours : newCourse.credit_hours}
            onChange={(e) =>
              editingCourse
                ? setEditingCourse({ ...editingCourse, credit_hours: e.target.value })
                : setNewCourse({ ...newCourse, credit_hours: e.target.value })
            }
          />
        </div>

        <button
          className={`mt-4 px-4 py-2 text-white rounded w-full md:w-auto ${editingCourse ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"}`}
          onClick={editingCourse ? handleUpdateCourse : handleAddCourse}
        >
          {editingCourse ? "Update Course" : "Add Course"}
        </button>
      </div>

      {/* ✅ Course List */}
      {loading ? (
        <p className="text-center mt-6">Loading courses...</p>
      ) : (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">All Courses</h2>
          <ul className="space-y-3">
            {courses.map((course) => (
              <li key={course.id} className="p-4 border border-gray-300 rounded-md flex flex-col md:flex-row justify-between items-center shadow-sm">
                <div className="text-center md:text-left">
                  <p className="font-medium">{course.course_name} ({course.course_code})</p>
                  <p className="text-sm text-gray-600">{course.description}</p>
                </div>
                <div className="flex space-x-2 mt-2 md:mt-0">
                  <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600" onClick={() => setEditingCourse(course)}>Edit</button>
                  <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => handleDeleteCourse(course.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Admin;
