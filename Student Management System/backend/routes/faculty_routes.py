from flask import Blueprint, jsonify, request
from db import get_db_connection

faculty_bp = Blueprint("faculty_bp", __name__)


# ==========================================
# GET FACULTY RECORDS
# ==========================================

@faculty_bp.route("/", methods=["GET"])
def get_faculty():

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                id,
                faculty_code,
                name,
                department,
                email,
                status
            FROM faculty
            ORDER BY id ASC
        """)

        faculty = cursor.fetchall()

        return jsonify(faculty), 200

    except Exception as error:

        print("GET FACULTY ERROR:", error)

        return jsonify({
            "message": "Failed to load faculty records",
            "error": str(error)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================
# ADD FACULTY
# ==========================================

@faculty_bp.route("/", methods=["POST"])
def add_faculty():

    connection = None
    cursor = None

    try:
        data = request.get_json()

        faculty_code = data.get("faculty_code", "").strip()
        name = data.get("name", "").strip()
        department = data.get("department", "").strip()
        email = data.get("email", "").strip()
        status = data.get("status", "Active").strip()

        if not faculty_code or not name or not department or not email:
            return jsonify({
                "message": "Faculty code, name, department and email are required"
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO faculty
            (faculty_code, name, department, email, status)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            faculty_code,
            name,
            department,
            email,
            status
        ))

        connection.commit()

        return jsonify({
            "message": "Faculty added successfully",
            "id": cursor.lastrowid
        }), 201

    except Exception as error:

        if connection:
            connection.rollback()

        print("ADD FACULTY ERROR:", error)

        return jsonify({
            "message": "Failed to add faculty",
            "error": str(error)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================
# UPDATE FACULTY
# ==========================================

@faculty_bp.route("/<int:faculty_id>", methods=["PUT"])
def update_faculty(faculty_id):

    connection = None
    cursor = None

    try:
        data = request.get_json()

        faculty_code = data.get("faculty_code", "").strip()
        name = data.get("name", "").strip()
        department = data.get("department", "").strip()
        email = data.get("email", "").strip()
        status = data.get("status", "Active").strip()

        if not faculty_code or not name or not department or not email:
            return jsonify({
                "message": "Faculty code, name, department and email are required"
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            UPDATE faculty
            SET
                faculty_code = %s,
                name = %s,
                department = %s,
                email = %s,
                status = %s
            WHERE id = %s
        """, (
            faculty_code,
            name,
            department,
            email,
            status,
            faculty_id
        ))

        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({
                "message": "Faculty record not found"
            }), 404

        return jsonify({
            "message": "Faculty updated successfully"
        }), 200

    except Exception as error:

        if connection:
            connection.rollback()

        print("UPDATE FACULTY ERROR:", error)

        return jsonify({
            "message": "Failed to update faculty",
            "error": str(error)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()