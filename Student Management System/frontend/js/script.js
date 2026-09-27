const API_URL = "http://127.0.0.1:5000";

// ======================================================
// COMMON API FUNCTION
// ======================================================

async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(API_URL + url, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    let data;

    try {
      data = await response.json();
    } catch (jsonError) {
      throw new Error(
        `Server returned an invalid response (${response.status})`,
      );
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || "Request failed");
    }

    return data;
  } catch (error) {
    console.error(`API Error: ${url}`, error);

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Unable to connect to server. Please make sure Flask backend is running on port 5000.",
      );
    }

    throw error;
  }
}

// ======================================================
// TODAY'S DATE
// ======================================================

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ======================================================
// LOGIN
// ======================================================

async function loginUser(event) {
  event.preventDefault();

  const usernameElement = document.getElementById("username");

  const passwordElement = document.getElementById("password");

  const message = document.getElementById("loginMessage");

  if (!usernameElement || !passwordElement) {
    return;
  }

  const username = usernameElement.value.trim();

  const password = passwordElement.value;

  try {
    const result = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    localStorage.setItem("user", JSON.stringify(result));

    if (result.role === "admin") {
      window.location.href = "admin-dashboard.html";
    } else if (result.role === "faculty") {
      window.location.href = "faculty-dashboard.html";
    } else {
      if (message) {
        message.textContent = "Invalid user role.";

        message.style.color = "#ef4444";
      }
    }
  } catch (error) {
    console.error(error);

    if (message) {
      message.textContent = error.message || "Login failed.";

      message.style.color = "#ef4444";
    }
  }
}

// ======================================================
// LOGOUT
// ======================================================

function logout() {
  localStorage.removeItem("user");

  window.location.href = "login.html";
}

// ======================================================
// ROLE PROTECTION
// ======================================================

function checkRole(requiredRole) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    window.location.href = "login.html";

    return null;
  }

  /*
   * Only compare the role when a required role
   * has actually been provided.
   */
  if (requiredRole && user.role !== requiredRole) {
    if (user.role === "admin") {
      window.location.href = "admin-dashboard.html";
    } else if (user.role === "faculty") {
      window.location.href = "faculty-dashboard.html";
    } else {
      window.location.href = "login.html";
    }

    return null;
  }

  return user;
}

// ======================================================
// LOAD STUDENTS
// ======================================================

async function loadStudents() {
  const studentList = document.getElementById("studentList");

  if (!studentList) {
    return;
  }

  try {
    const students = await apiRequest("/api/students/");

    if (!students || students.length === 0) {
      studentList.innerHTML = "<p>No students found.</p>";

      return;
    }

    let html = `
            <div class="table-wrap">
                <table class="student-table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Department</th>
                            <th>Year</th>
                            <th>Date of Birth</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
        `;

    students.forEach((student) => {
      html += `
                <tr>

                    <td>${student.id ?? "-"}</td>

                    <td>${student.name || "-"}</td>

                    <td>${student.email || "-"}</td>

                    <td>${student.phone || "-"}</td>

                    <td>${student.department || "-"}</td>

                    <td>${student.year || "-"}</td>

                    <td>${student.dob || "-"}</td>

                    <td class="actions">

                        <button
                            class="button small"
                            onclick="editStudent(${student.id})"
                        >
                            Edit
                        </button>

                        <button
                            class="button small danger"
                            onclick="deleteStudent(${student.id})"
                        >
                            Delete
                        </button>

                    </td>

                </tr>
            `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        `;

    studentList.innerHTML = html;
  } catch (error) {
    console.error(error);

    studentList.innerHTML = `<p>${error.message || "Unable to load students."}</p>`;
  }
}

// ======================================================
// ADD / UPDATE STUDENT
// ======================================================

async function saveStudent(event) {
  event.preventDefault();

  const studentIdElement = document.getElementById("studentId");

  const form = document.getElementById("studentForm");

  if (!studentIdElement || !form) {
    return;
  }

  const studentId = studentIdElement.value;

  const studentData = {
    name: document.getElementById("name")?.value || "",

    email: document.getElementById("email")?.value || "",

    phone: document.getElementById("phone")?.value || "",

    department: document.getElementById("department")?.value || "",

    year: document.getElementById("year")?.value || "",

    dob: document.getElementById("dob")?.value || "",
  };

  const message = document.getElementById("studentMessage");

  try {
    if (studentId) {
      await apiRequest(`/api/students/${studentId}`, {
        method: "PUT",
        body: JSON.stringify(studentData),
      });

      if (message) {
        message.textContent = "Student updated successfully!";
      }
    } else {
      await apiRequest("/api/students/", {
        method: "POST",
        body: JSON.stringify(studentData),
      });

      if (message) {
        message.textContent = "Student added successfully!";
      }
    }

    if (message) {
      message.style.color = "#10b981";
    }

    form.reset();

    studentIdElement.value = "";

    await loadStudents();
  } catch (error) {
    console.error(error);

    if (message) {
      message.textContent = error.message || "Failed to save student.";

      message.style.color = "#ef4444";
    }
  }
}

// ======================================================
// EDIT STUDENT
// ======================================================

async function editStudent(id) {
  try {
    const students = await apiRequest("/api/students/");

    const student = students.find((item) => Number(item.id) === Number(id));

    if (!student) {
      return;
    }

    const studentId = document.getElementById("studentId");

    const name = document.getElementById("name");

    const email = document.getElementById("email");

    const phone = document.getElementById("phone");

    const department = document.getElementById("department");

    const year = document.getElementById("year");

    const dob = document.getElementById("dob");

    if (studentId) studentId.value = student.id;
    if (name) name.value = student.name || "";
    if (email) email.value = student.email || "";
    if (phone) phone.value = student.phone || "";
    if (department) department.value = student.department || "";
    if (year) year.value = student.year || "";
    if (dob) dob.value = student.dob || "";

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  } catch (error) {
    console.error(error);
  }
}

// ======================================================
// DELETE STUDENT
// ======================================================

async function deleteStudent(id) {
  if (!confirm("Are you sure you want to delete this student?")) {
    return;
  }

  try {
    await apiRequest(`/api/students/${id}`, {
      method: "DELETE",
    });

    await loadStudents();
  } catch (error) {
    console.error(error);

    alert(error.message || "Failed to delete student.");
  }
}

// ======================================================
// LOAD STUDENTS INTO DROPDOWN
// ======================================================

async function loadStudentDropdown(selectId = "student") {
  const select = document.getElementById(selectId);

  if (!select) {
    return;
  }

  try {
    const students = await apiRequest("/api/students/");

    select.innerHTML = '<option value="">Select Student</option>';

    students.forEach((student) => {
      const option = document.createElement("option");

      option.value = student.id;

      option.textContent = `${student.name} - ${student.department || "Department"}`;

      select.appendChild(option);
    });
  } catch (error) {
    console.error(error);

    select.innerHTML = '<option value="">Unable to load students</option>';
  }
}

// ======================================================
// LOAD ATTENDANCE
// ======================================================

async function loadAttendance() {
  const attendanceList = document.getElementById("attendanceList");

  if (!attendanceList) {
    return;
  }

  try {
    const records = await apiRequest("/api/attendance/");

    if (!records || records.length === 0) {
      attendanceList.innerHTML = "<p>No attendance records found.</p>";

      return;
    }

    let html = `
            <div class="table-wrap">

                <table class="student-table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Student</th>
                            <th>Department</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
        `;

    records.forEach((record) => {
      html += `
                <tr>

                    <td>${record.id ?? "-"}</td>

                    <td>${record.name || "-"}</td>

                    <td>${record.department || "-"}</td>

                    <td>${record.date || "-"}</td>

                    <td>${record.status || "-"}</td>

                </tr>
            `;
    });

    html += `
                    </tbody>
                </table>

            </div>
        `;

    attendanceList.innerHTML = html;
  } catch (error) {
    console.error(error);

    attendanceList.innerHTML = `<p>${error.message || "Unable to load attendance records."}</p>`;
  }
}

// ======================================================
// MARK ATTENDANCE
// ======================================================

async function markAttendance(event) {
  event.preventDefault();

  const studentElement = document.getElementById("student");

  const dateElement = document.getElementById("attendanceDate");

  const statusElement = document.getElementById("status");

  const form = document.getElementById("attendanceForm");

  if (!studentElement || !dateElement || !statusElement || !form) {
    return;
  }

  const studentId = studentElement.value;

  const date = dateElement.value;

  const status = statusElement.value;

  const message = document.getElementById("attendanceMessage");

  try {
    await apiRequest("/api/attendance/", {
      method: "POST",

      body: JSON.stringify({
        student_id: studentId,
        date: date,
        status: status,
      }),
    });

    if (message) {
      message.textContent = "Attendance marked successfully!";

      message.style.color = "#10b981";
    }

    form.reset();

    dateElement.value = getTodayDate();

    await loadAttendance();
  } catch (error) {
    console.error(error);

    if (message) {
      message.textContent = error.message || "Failed to mark attendance.";

      message.style.color = "#ef4444";
    }
  }
}

// ======================================================
// LOAD MARKS
// ======================================================

async function loadMarks() {
  const marksList = document.getElementById("marksList");

  if (!marksList) {
    return;
  }

  try {
    const records = await apiRequest("/api/marks/");

    if (!records || records.length === 0) {
      marksList.innerHTML = "<p>No marks records found.</p>";

      return;
    }

    let html = `
            <div class="table-wrap">

                <table class="student-table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Student</th>
                            <th>Department</th>
                            <th>Subject</th>
                            <th>Marks</th>
                        </tr>
                    </thead>

                    <tbody>
        `;

    records.forEach((record) => {
      html += `
                <tr>

                    <td>${record.id ?? "-"}</td>

                    <td>${record.name || "-"}</td>

                    <td>${record.department || "-"}</td>

                    <td>${record.subject || "-"}</td>

                    <td>${record.marks ?? "-"}</td>

                </tr>
            `;
    });

    html += `
                    </tbody>
                </table>

            </div>
        `;

    marksList.innerHTML = html;
  } catch (error) {
    console.error(error);

    marksList.innerHTML = `<p>${error.message || "Unable to load marks."}</p>`;
  }
}

// ======================================================
// ADD MARKS
// ======================================================

async function saveMarks(event) {
  event.preventDefault();

  const message = document.getElementById("marksMessage");

  const marksForm = document.getElementById("marksForm");

  const markStudent = document.getElementById("markStudent");

  const subject = document.getElementById("subject");

  const marks = document.getElementById("marks");

  if (!marksForm || !markStudent || !subject || !marks) {
    return;
  }

  try {
    await apiRequest("/api/marks/", {
      method: "POST",

      body: JSON.stringify({
        student_id: markStudent.value,

        subject: subject.value,

        marks: marks.value,
      }),
    });

    if (message) {
      message.textContent = "Marks added successfully!";

      message.style.color = "#10b981";
    }

    marksForm.reset();

    await loadMarks();
  } catch (error) {
    console.error(error);

    if (message) {
      message.textContent = error.message || "Failed to add marks.";

      message.style.color = "#ef4444";
    }
  }
}

// ======================================================
// LOAD FACULTY
// ======================================================

async function loadFaculty() {
  const facultyList = document.getElementById("facultyList");

  if (!facultyList) {
    return;
  }

  try {
    const faculty = await apiRequest("/api/faculty/");

    if (!faculty || faculty.length === 0) {
      facultyList.innerHTML = "<p>No faculty records found.</p>";

      return;
    }

    let html = `
            <div class="table-wrap">

                <table class="student-table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Username</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
        `;

    faculty.forEach((member) => {
      html += `
                <tr>

                    <td>${member.id ?? "-"}</td>

                    <td>${member.name || "-"}</td>

                    <td>${member.email || "-"}</td>

                    <td>${member.phone || "-"}</td>

                    <td>${member.department || "-"}</td>

                    <td>${member.designation || "-"}</td>

                    <td>${member.username || "-"}</td>

                    <td class="actions">

                        <button
                            class="button small"
                            onclick="editFaculty(${member.id})"
                        >
                            Edit
                        </button>

                        <button
                            class="button small danger"
                            onclick="deleteFaculty(${member.id})"
                        >
                            Delete
                        </button>

                    </td>

                </tr>
            `;
    });

    html += `
                    </tbody>
                </table>

            </div>
        `;

    facultyList.innerHTML = html;
  } catch (error) {
    console.error(error);

    facultyList.innerHTML = `<p>${error.message || "Unable to load faculty."}</p>`;
  }
}

// ======================================================
// ADD / UPDATE FACULTY
// ======================================================

async function saveFaculty(event) {
  event.preventDefault();

  const facultyIdElement = document.getElementById("facultyId");

  const facultyForm = document.getElementById("facultyForm");

  if (!facultyIdElement || !facultyForm) {
    return;
  }

  const facultyId = facultyIdElement.value;

  const data = {
    name: document.getElementById("f_name")?.value || "",

    email: document.getElementById("f_email")?.value || "",

    phone: document.getElementById("f_phone")?.value || "",

    department: document.getElementById("f_department")?.value || "",

    designation: document.getElementById("f_designation")?.value || "",

    username: document.getElementById("f_username")?.value || "",

    password: document.getElementById("f_password")?.value || "",
  };

  const message = document.getElementById("facultyMessage");

  try {
    await apiRequest(
      facultyId ? `/api/faculty/${facultyId}` : "/api/faculty/",
      {
        method: facultyId ? "PUT" : "POST",

        body: JSON.stringify(data),
      },
    );

    if (message) {
      message.textContent = facultyId
        ? "Faculty updated successfully!"
        : "Faculty added successfully!";

      message.style.color = "#10b981";
    }

    facultyForm.reset();

    facultyIdElement.value = "";

    await loadFaculty();
  } catch (error) {
    console.error(error);

    if (message) {
      message.textContent = error.message || "Failed to save faculty.";

      message.style.color = "#ef4444";
    }
  }
}

// ======================================================
// EDIT FACULTY
// ======================================================

async function editFaculty(id) {
  try {
    const faculty = await apiRequest("/api/faculty/");

    const member = faculty.find((item) => Number(item.id) === Number(id));

    if (!member) {
      return;
    }

    const facultyId = document.getElementById("facultyId");

    const name = document.getElementById("f_name");

    const email = document.getElementById("f_email");

    const phone = document.getElementById("f_phone");

    const department = document.getElementById("f_department");

    const designation = document.getElementById("f_designation");

    const username = document.getElementById("f_username");

    if (facultyId) facultyId.value = member.id;
    if (name) name.value = member.name || "";
    if (email) email.value = member.email || "";
    if (phone) phone.value = member.phone || "";
    if (department) department.value = member.department || "";
    if (designation) designation.value = member.designation || "";
    if (username) username.value = member.username || "";

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  } catch (error) {
    console.error(error);
  }
}

// ======================================================
// DELETE FACULTY
// ======================================================

async function deleteFaculty(id) {
  if (!confirm("Are you sure you want to delete this faculty?")) {
    return;
  }

  try {
    await apiRequest(`/api/faculty/${id}`, {
      method: "DELETE",
    });

    await loadFaculty();
  } catch (error) {
    console.error(error);

    alert(error.message || "Failed to delete faculty.");
  }
}

// ======================================================
// LOAD ANNOUNCEMENTS
// ======================================================

async function loadAnnouncements(elementId, adminView = false) {
  const container = document.getElementById(elementId);

  if (!container) {
    return;
  }

  try {
    const announcements = await apiRequest("/api/announcements/");

    if (!announcements || announcements.length === 0) {
      container.innerHTML = "<p>No announcements available.</p>";

      return;
    }

    if (adminView) {
      let html = `
                <div class="table-wrap">

                    <table class="student-table">

                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Announcement</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
            `;

      announcements.forEach((item) => {
        html += `
                    <tr>

                        <td>${item.id ?? "-"}</td>

                        <td>${item.message || "-"}</td>

                        <td>${item.created_at || "-"}</td>

                        <td>

                            <button
                                class="button small danger"
                                onclick="deleteAnnouncement(${item.id})"
                            >
                                Delete
                            </button>

                        </td>

                    </tr>
                `;
      });

      html += `
                        </tbody>
                    </table>

                </div>
            `;

      container.innerHTML = html;
    } else {
      const messages = announcements
        .map((item) => `<span>📢 ${item.message || ""}</span>`)
        .join("");

      container.innerHTML = `
                <div class="notice">

                    <div class="ticker">
                        ${messages}
                    </div>

                </div>
            `;
    }
  } catch (error) {
    console.error(error);

    container.innerHTML = `<p>${error.message || "Unable to load announcements."}</p>`;
  }
}

// ======================================================
// ADD ANNOUNCEMENT
// ======================================================

async function addAnnouncement(event) {
  event.preventDefault();

  const message = document.getElementById("announcementMessage");

  const announcementInput = document.getElementById("announcement");

  if (!announcementInput) {
    return;
  }

  const announcement = announcementInput.value.trim();

  if (!announcement) {
    if (message) {
      message.textContent = "Please enter an announcement.";

      message.style.color = "#ef4444";
    }

    return;
  }

  try {
    await apiRequest("/api/announcements/", {
      method: "POST",

      body: JSON.stringify({
        message: announcement,
      }),
    });

    if (message) {
      message.textContent = "Announcement added successfully!";

      message.style.color = "#10b981";
    }

    const announcementForm = document.getElementById("announcementForm");

    if (announcementForm) {
      announcementForm.reset();
    }

    await loadAnnouncements("announcementList", true);
  } catch (error) {
    console.error(error);

    if (message) {
      message.textContent = error.message || "Failed to add announcement.";

      message.style.color = "#ef4444";
    }
  }
}

// ======================================================
// DELETE ANNOUNCEMENT
// ======================================================

async function deleteAnnouncement(id) {
  if (!confirm("Delete this announcement?")) {
    return;
  }

  try {
    await apiRequest(`/api/announcements/${id}`, {
      method: "DELETE",
    });

    await loadAnnouncements("announcementList", true);
  } catch (error) {
    console.error(error);

    alert(error.message || "Failed to delete announcement.");
  }
}

// ======================================================
// ADMIN DASHBOARD
// ======================================================

async function loadAdminDashboard() {
  /*
   * Each API is loaded separately.
   * If one API fails, the other dashboard sections
   * can still display their available data.
   */

  let students = [];
  let faculty = [];
  let attendance = [];
  let marks = [];

  // =========================================
  // GET STUDENTS
  // =========================================

  try {
    students = await apiRequest("/api/students/");

    if (!Array.isArray(students)) {
      students = [];
    }
  } catch (error) {
    console.error("Student dashboard API error:", error);
  }

  // =========================================
  // GET FACULTY
  // =========================================

  try {
    faculty = await apiRequest("/api/faculty/");

    if (!Array.isArray(faculty)) {
      faculty = [];
    }
  } catch (error) {
    console.error("Faculty dashboard API error:", error);
  }

  // =========================================
  // GET ATTENDANCE
  // =========================================

  try {
    attendance = await apiRequest("/api/attendance/");

    if (!Array.isArray(attendance)) {
      attendance = [];
    }
  } catch (error) {
    console.error("Attendance dashboard API error:", error);
  }

  // =========================================
  // GET MARKS
  // =========================================

  try {
    marks = await apiRequest("/api/marks/");

    if (!Array.isArray(marks)) {
      marks = [];
    }
  } catch (error) {
    console.error("Marks dashboard API error:", error);
  }

  // =========================================
  // DASHBOARD COUNTS
  // =========================================

  const studentCount = document.getElementById("studentCount");

  const facultyCount = document.getElementById("facultyCount");

  const attendanceCount = document.getElementById("attendanceCount");

  const marksCount = document.getElementById("marksCount");

  if (studentCount) {
    studentCount.textContent = students.length;
  }

  if (facultyCount) {
    facultyCount.textContent = faculty.length;
  }

  if (attendanceCount) {
    attendanceCount.textContent = attendance.length;
  }

  if (marksCount) {
    marksCount.textContent = marks.length;
  }

  // =========================================
  // STUDENT RECORDS
  // =========================================

  const studentRecords = document.getElementById("studentRecords");

  if (studentRecords) {
    if (!students || students.length === 0) {
      studentRecords.innerHTML = "<p>No student records found.</p>";
    } else {
      let html = `
                <div class="table-wrap">

                    <table class="student-table">

                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Department</th>
                                <th>Year</th>
                            </tr>
                        </thead>

                        <tbody>
            `;

      students.forEach((student) => {
        html += `
                    <tr>

                        <td>${student.id ?? "-"}</td>

                        <td>${student.name || "-"}</td>

                        <td>${student.email || "-"}</td>

                        <td>${student.phone || "-"}</td>

                        <td>${student.department || "-"}</td>

                        <td>${student.year || "-"}</td>

                    </tr>
                `;
      });

      html += `
                        </tbody>
                    </table>

                </div>
            `;

      studentRecords.innerHTML = html;
    }
  }

  // =========================================
  // FACULTY RECORDS
  // =========================================

  const facultyRecords = document.getElementById("facultyRecords");

  if (facultyRecords) {
    if (!faculty || faculty.length === 0) {
      facultyRecords.innerHTML = "<p>No faculty records found.</p>";
    } else {
      let html = `
                <div class="table-wrap">

                    <table class="student-table">

                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Department</th>
                                <th>Designation</th>
                            </tr>
                        </thead>

                        <tbody>
            `;

      faculty.forEach((member) => {
        html += `
                    <tr>

                        <td>${member.id ?? "-"}</td>

                        <td>${member.name || "-"}</td>

                        <td>${member.email || "-"}</td>

                        <td>${member.phone || "-"}</td>

                        <td>${member.department || "-"}</td>

                        <td>${member.designation || "-"}</td>

                    </tr>
                `;
      });

      html += `
                        </tbody>
                    </table>

                </div>
            `;

      facultyRecords.innerHTML = html;
    }
  }

  // =========================================
  // RECENT ATTENDANCE
  // =========================================

  const dashboardAttendanceList = document.getElementById(
    "dashboardAttendanceList",
  );

  if (dashboardAttendanceList) {
    if (!attendance || attendance.length === 0) {
      dashboardAttendanceList.innerHTML = "<p>No attendance records found.</p>";
    } else {
      let html = `
                <div class="table-wrap">

                    <table class="student-table">

                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Department</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
            `;

      attendance.slice(0, 10).forEach((record) => {
        html += `
                        <tr>

                            <td>${record.name || "-"}</td>

                            <td>${record.department || "-"}</td>

                            <td>${record.date || "-"}</td>

                            <td>${record.status || "-"}</td>

                        </tr>
                    `;
      });

      html += `
                        </tbody>
                    </table>

                </div>
            `;

      dashboardAttendanceList.innerHTML = html;
    }
  }

  // =========================================
  // RECENT MARKS
  // =========================================

  const dashboardMarksList = document.getElementById("dashboardMarksList");

  if (dashboardMarksList) {
    if (!marks || marks.length === 0) {
      dashboardMarksList.innerHTML = "<p>No marks records found.</p>";
    } else {
      let html = `
                <div class="table-wrap">

                    <table class="student-table">

                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Department</th>
                                <th>Subject</th>
                                <th>Marks</th>
                            </tr>
                        </thead>

                        <tbody>
            `;

      marks.slice(0, 10).forEach((record) => {
        html += `
                        <tr>

                            <td>${record.name || "-"}</td>

                            <td>${record.department || "-"}</td>

                            <td>${record.subject || "-"}</td>

                            <td>${record.marks ?? "-"}</td>

                        </tr>
                    `;
      });

      html += `
                        </tbody>
                    </table>

                </div>
            `;

      dashboardMarksList.innerHTML = html;
    }
  }

  // =========================================
  // RECENT ANNOUNCEMENTS
  // =========================================

  await loadAnnouncements("announcementList", true);
}

// ======================================================
// PAGE LOADED
// ======================================================

document.addEventListener("DOMContentLoaded", async () => {
  // =========================================
  // LOGIN
  // =========================================

  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", loginUser);
  }

  // =========================================
  // ROLE
  // =========================================

  const requiredRole = document.body.dataset.role;

  if (requiredRole) {
    const user = checkRole(requiredRole);

    if (!user) {
      return;
    }
  }

  // =========================================
  // STUDENTS
  // =========================================

  if (document.getElementById("studentList")) {
    await loadStudents();

    const form = document.getElementById("studentForm");

    if (form) {
      form.addEventListener("submit", saveStudent);
    }
  }

  // =========================================
  // FACULTY
  // =========================================

  if (document.getElementById("facultyList")) {
    await loadFaculty();

    const form = document.getElementById("facultyForm");

    if (form) {
      form.addEventListener("submit", saveFaculty);
    }
  }

  // =========================================
  // ATTENDANCE
  // =========================================

  if (document.getElementById("attendanceList")) {
    const attendanceForm = document.getElementById("attendanceForm");

    /*
     * Only load the student dropdown when
     * the attendance form actually exists.
     *
     * Admin attendance page is VIEW ONLY.
     */

    if (attendanceForm) {
      await loadStudentDropdown("student");

      const dateInput = document.getElementById("attendanceDate");

      if (dateInput) {
        dateInput.value = getTodayDate();
      }

      attendanceForm.addEventListener("submit", markAttendance);
    }

    await loadAttendance();
  }

  // =========================================
  // MARKS
  // =========================================

  if (document.getElementById("marksList")) {
    const marksForm = document.getElementById("marksForm");

    /*
     * Only load student dropdown and
     * submit handler when marks form exists.
     *
     * Admin marks page can remain VIEW ONLY.
     */

    if (marksForm) {
      await loadStudentDropdown("markStudent");

      marksForm.addEventListener("submit", saveMarks);
    }

    await loadMarks();
  }

  // =========================================
  // ADMIN DASHBOARD
  // =========================================

  if (document.getElementById("adminDashboard")) {
    await loadAdminDashboard();
  }

  // =========================================
  // FACULTY DASHBOARD
  // =========================================

  if (document.getElementById("facultyDashboard")) {
    await loadAnnouncements("facultyAnnouncements", false);
  }

  // =========================================
  // ANNOUNCEMENT FORM
  // =========================================

  const announcementForm = document.getElementById("announcementForm");

  if (announcementForm) {
    announcementForm.addEventListener("submit", addAnnouncement);
  }
});
