const API_URL = "http://127.0.0.1:5000";

/* =====================================================
   ADMIN DASHBOARD
===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  loadAdminDashboard();
  loadAdminAnnouncements();

  const announcementForm = document.getElementById("announcementForm");

  if (announcementForm) {
    announcementForm.addEventListener("submit", addAnnouncement);
  }
});

/* =====================================================
   LOAD ADMIN DASHBOARD DATA
===================================================== */

async function loadAdminDashboard() {
  loadTotalStudents();
  loadTotalFaculty();
  loadTotalAttendance();
  loadTotalMarks();

  loadRecentAttendance();
  loadRecentMarks();
}

/* =====================================================
   TOTAL STUDENTS
===================================================== */

async function loadTotalStudents() {
  const element = document.getElementById("totalStudents");

  if (!element) return;

  try {
    const response = await fetch(API_URL + "/api/students/");

    if (!response.ok) {
      throw new Error("Failed to load students");
    }

    const students = await response.json();

    element.textContent = students.length;
  } catch (error) {
    console.error("Student count error:", error);

    element.textContent = "0";
  }
}

/* =====================================================
   TOTAL FACULTY
===================================================== */

async function loadTotalFaculty() {
  const element = document.getElementById("totalFaculty");

  if (!element) return;

  try {
    const response = await fetch(API_URL + "/api/faculty/");

    if (!response.ok) {
      throw new Error("Failed to load faculty");
    }

    const faculty = await response.json();

    element.textContent = faculty.length;
  } catch (error) {
    console.error("Faculty count error:", error);

    element.textContent = "0";
  }
}

/* =====================================================
   TOTAL ATTENDANCE
===================================================== */

async function loadTotalAttendance() {
  const element = document.getElementById("totalAttendance");

  if (!element) return;

  try {
    const response = await fetch(API_URL + "/api/attendance/");

    if (!response.ok) {
      throw new Error("Failed to load attendance");
    }

    const attendance = await response.json();

    element.textContent = attendance.length;
  } catch (error) {
    console.error("Attendance count error:", error);

    element.textContent = "0";
  }
}

/* =====================================================
   TOTAL MARKS
===================================================== */

async function loadTotalMarks() {
  const element = document.getElementById("totalMarks");

  if (!element) return;

  try {
    const response = await fetch(API_URL + "/api/marks/");

    if (!response.ok) {
      throw new Error("Failed to load marks");
    }

    const marks = await response.json();

    element.textContent = marks.length;
  } catch (error) {
    console.error("Marks count error:", error);

    element.textContent = "0";
  }
}

/* =====================================================
   RECENT ATTENDANCE
===================================================== */

async function loadRecentAttendance() {
  const tableBody = document.getElementById("recentAttendanceBody");

  if (!tableBody) return;

  try {
    const response = await fetch(API_URL + "/api/attendance/");

    if (!response.ok) {
      throw new Error("Failed to load attendance");
    }

    const records = await response.json();

    const recent = records.slice(0, 5);

    if (recent.length === 0) {
      tableBody.innerHTML = `
                <tr>
                    <td colspan="4"
                        class="empty-state">
                        No attendance records yet.
                    </td>
                </tr>
            `;

      return;
    }

    tableBody.innerHTML = recent
      .map(function (record) {
        return `
                    <tr>

                        <td>
                            ${record.name || ""}
                        </td>

                        <td>
                            ${record.department || ""}
                        </td>

                        <td>
                            ${record.date || ""}
                        </td>

                        <td>
                            ${record.status || ""}
                        </td>

                    </tr>
                `;
      })
      .join("");
  } catch (error) {
    console.error("Recent attendance error:", error);

    tableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    Unable to load attendance.
                </td>
            </tr>
        `;
  }
}

/* =====================================================
   RECENT MARKS
===================================================== */

async function loadRecentMarks() {
  const tableBody = document.getElementById("recentMarksBody");

  if (!tableBody) return;

  try {
    const response = await fetch(API_URL + "/api/marks/");

    if (!response.ok) {
      throw new Error("Failed to load marks");
    }

    const records = await response.json();

    const recent = records.slice(0, 5);

    if (recent.length === 0) {
      tableBody.innerHTML = `
                <tr>
                    <td colspan="3"
                        class="empty-state">
                        No marks records yet.
                    </td>
                </tr>
            `;

      return;
    }

    tableBody.innerHTML = recent
      .map(function (record) {
        return `
                    <tr>

                        <td>
                            ${record.name || ""}
                        </td>

                        <td>
                            ${record.subject || ""}
                        </td>

                        <td>
                            ${record.marks || ""}
                        </td>

                    </tr>
                `;
      })
      .join("");
  } catch (error) {
    console.error("Recent marks error:", error);

    tableBody.innerHTML = `
            <tr>
                <td colspan="3">
                    Unable to load marks.
                </td>
            </tr>
        `;
  }
}

/* =====================================================
   LOAD ANNOUNCEMENTS
===================================================== */

async function loadAdminAnnouncements() {
  const list = document.getElementById("recentAnnouncements");

  if (!list) return;

  try {
    const response = await fetch(API_URL + "/api/announcements/");

    if (!response.ok) {
      throw new Error("Failed to load announcements");
    }

    const announcements = await response.json();

    const recent = announcements.slice(0, 5);

    if (recent.length === 0) {
      list.innerHTML = `
                <li class="empty-state">
                    No announcements yet.
                </li>
            `;

      return;
    }

    list.innerHTML = recent
      .map(function (announcement) {
        return `
                    <li style="margin-bottom:10px;">

                        <strong>
                            ${announcement.title || ""}
                        </strong>

                        <br>

                        ${announcement.message || ""}

                    </li>
                `;
      })
      .join("");
  } catch (error) {
    console.error("Announcement loading error:", error);

    list.innerHTML = `
            <li>
                Unable to load announcements.
            </li>
        `;
  }
}

/* =====================================================
   ADD ANNOUNCEMENT
===================================================== */

async function addAnnouncement(event) {
  event.preventDefault();

  const title = document.getElementById("announcementTitle").value.trim();

  const message = document.getElementById("announcementMessage").value.trim();

  const alert = document.getElementById("announcementAlert");

  if (!title || !message) {
    showAnnouncementMessage(alert, "Please enter title and message.", "error");

    return;
  }

  try {
    const response = await fetch(API_URL + "/api/announcements/", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        title: title,
        message: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add announcement");
    }

    showAnnouncementMessage(
      alert,
      "Announcement added successfully!",
      "success",
    );

    document.getElementById("announcementForm").reset();

    loadAdminAnnouncements();
  } catch (error) {
    console.error("Add announcement error:", error);

    showAnnouncementMessage(alert, error.message, "error");
  }
}

/* =====================================================
   ANNOUNCEMENT MESSAGE
===================================================== */

function showAnnouncementMessage(element, message, type) {
  if (!element) return;

  element.textContent = message;

  element.style.display = "block";

  if (type === "success") {
    element.className = "alert alert-success";
  } else {
    element.className = "alert alert-error";
  }
}
