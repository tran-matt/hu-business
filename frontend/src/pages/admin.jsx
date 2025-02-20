import React, { useEffect, useState } from "react";
import { getAllCourses, addCourse, updateCourse, deleteCourse } from "../api";

function Admin() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const [newCourse, setNewCourse] = useState({ course_code: "", course_name: "", description: "", credit_hours: "" });
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await getAllCourses();
    if (error) setErrorMessage("Failed to fetch courses.");
    else setCourses(data);
    setLoading(false);
  };

  const handleAddCourse = async () => {
    if (!newCourse.course_code || !newCourse.course_name) {
      setErrorMessage("Course Code and Name are required.");
      return;
    }
    const { error } = await addCourse(newCourse);
    if (error) setErrorMessage("Failed to add course.");
    else {
      alert("Course added successfully!");
      await fetchCourses();
      setNewCourse({ course_code: "", course_name: "", description: "", credit_hours: "" });
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse.course_code || !editingCourse.course_name) {
      setErrorMessage("Course Code and Name are required.");
      return;
    }
    const { error } = await updateCourse(editingCourse.id, editingCourse);
    if (error) setErrorMessage("Failed to update course.");
    else {
      alert("Course updated successfully!");
      await fetchCourses();
      setEditingCourse(null);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    const { error } = await deleteCourse(id);
    if (error) setErrorMessage("Failed to delete course.");
    else {
      alert("Course deleted successfully!");
      await fetchCourses();
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-4">Admin Panel</h1>
      {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}

      {/* Add/Edit Course Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-2xl font-semibold mb-2">{editingCourse ? "Edit Course" : "Add New Course"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Course Code"
            className="p-2 border rounded"
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
            className="p-2 border rounded"
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
            className="p-2 border rounded"
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
            className="p-2 border rounded"
            value={editingCourse ? editingCourse.credit_hours : newCourse.credit_hours}
            onChange={(e) =>
              editingCourse
                ? setEditingCourse({ ...editingCourse, credit_hours: e.target.value })
                : setNewCourse({ ...newCourse, credit_hours: e.target.value })
            }
          />
        </div>
        <button
          className={`mt-4 px-4 py-2 text-white rounded ${
            editingCourse ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"
          }`}
          onClick={editingCourse ? handleUpdateCourse : handleAddCourse}
        >
          {editingCourse ? "Update Course" : "Add Course"}
        </button>
      </div>

      {/* Course List */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">All Courses</h2>
        {loading ? (
          <p className="text-center">Loading courses...</p>
        ) : (
          <ul className="space-y-3">
            {courses.map((course) => (
              <li key={course.id} className="p-4 border rounded flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    {course.course_name} ({course.course_code})
                  </p>
                  <p className="text-sm text-gray-500">{course.description}</p>
                  <p className="text-sm">Credit Hours: {course.credit_hours}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    onClick={() => setEditingCourse(course)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Admin;
