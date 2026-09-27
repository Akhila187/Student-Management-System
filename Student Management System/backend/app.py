from flask import Flask
from flask_cors import CORS

from routes.student_routes import student_bp
from routes.attendance_routes import attendance_bp
from routes.marks_routes import marks_bp
from routes.auth_routes import auth_bp
from routes.faculty_routes import faculty_bp
from routes.announcement_routes import announcement_bp


app = Flask(__name__)

CORS(app)


# =========================================
# REGISTER BLUEPRINTS
# =========================================

app.register_blueprint(
    student_bp,
    url_prefix="/api/students"
)

app.register_blueprint(
    attendance_bp,
    url_prefix="/api/attendance"
)

app.register_blueprint(
    marks_bp,
    url_prefix="/api/marks"
)

app.register_blueprint(
    auth_bp,
    url_prefix="/api/auth"
)

app.register_blueprint(
    faculty_bp,
    url_prefix="/api/faculty"
)

app.register_blueprint(
    announcement_bp,
    url_prefix="/api/announcements"
)


# =========================================
# HOME
# =========================================

@app.route("/")
def home():
    return {
        "message": "Student Management System Backend is running!"
    }


# =========================================
# START SERVER
# =========================================

if __name__ == "__main__":
    app.run(
        debug=True,
        port=5000
    )