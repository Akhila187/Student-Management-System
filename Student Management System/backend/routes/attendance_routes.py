from flask import Blueprint, request, jsonify
from db import get_db_connection

attendance_bp = Blueprint("attendance_bp", __name__)


# =====================================================
# GET ATTENDANCE RECORDS
# =====================================================

@attendance_bp.route("/", methods=["GET"])
def get_attendance():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                attendance.id,
                attendance.student_id,
                students.name,
                students.department,
                attendance.date,
                attendance.status
            FROM attendance
            JOIN students
                ON attendance.student_id = students.id
            ORDER BY attendance.id ASC
        """

        cursor.execute(query)
        records = cursor.fetchall()

        return jsonify(records), 200

    except Exception as error:
        print("GET ATTENDANCE ERROR:", error)

        return jsonify({
            "message": "Failed to load attendance",
            "error": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


# =====================================================
# MARK ATTENDANCE
# =====================================================

@attendance_bp.route("/", methods=["POST"])
def mark_attendance():
    connection = None
    cursor = None

    try:
        data = request.get_json()

        student_id = data.get("student_id")
        date = data.get("date")
        status = data.get("status")

        if not student_id or not date or not status:
            return jsonify({
                "message": "All attendance fields are required"
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        query = """
            INSERT INTO attendance
            (student_id, date, status)
            VALUES (%s, %s, %s)
        """

        cursor.execute(
            query,
            (student_id, date, status)
        )

        connection.commit()

        return jsonify({
            "message": "Attendance marked successfully",
            "id": cursor.lastrowid
        }), 201

    except Exception as error:
        print("MARK ATTENDANCE ERROR:", error)

        if connection:
            connection.rollback()

        return jsonify({
            "message": "Failed to mark attendance",
            "error": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()