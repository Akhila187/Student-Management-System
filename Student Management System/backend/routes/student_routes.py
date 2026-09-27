from flask import Blueprint, request, jsonify
from db import get_db_connection

student_bp = Blueprint("student_bp", __name__)


# =====================================================
# GET ALL STUDENTS
# =====================================================

@student_bp.route("/", methods=["GET"])
def get_students():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                id,
                student_id,
                name,
                email,
                phone,
                department,
                year,
                section
            FROM students
            ORDER BY id ASC
            """
        )

        students = cursor.fetchall()

        return jsonify(students), 200

    except Exception as error:

        print("Get students error:", error)

        return jsonify({
            "message": "Failed to load students",
            "error": str(error)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# =====================================================
# ADD STUDENT
# =====================================================

@student_bp.route("/", methods=["POST"])
def add_student():

    connection = None
    cursor = None

    try:

        data = request.get_json()

        student_id = data.get("student_id")
        name = data.get("name")
        email = data.get("email")
        phone = data.get("phone")
        department = data.get("department")
        year = data.get("year")
        section = data.get("section", "")

        # Required fields

        if not student_id:
            return jsonify({
                "message": "Student ID is required"
            }), 400

        if not name:
            return jsonify({
                "message": "Student name is required"
            }), 400

        if not email:
            return jsonify({
                "message": "Email is required"
            }), 400

        if not phone:
            return jsonify({
                "message": "Phone number is required"
            }), 400

        if not department:
            return jsonify({
                "message": "Department is required"
            }), 400

        if not year:
            return jsonify({
                "message": "Academic year is required"
            }), 400


        connection = get_db_connection()
        cursor = connection.cursor()

        query = """
            INSERT INTO students
            (
                student_id,
                name,
                email,
                phone,
                department,
                year,
                section
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        cursor.execute(
            query,
            (
                student_id,
                name,
                email,
                phone,
                department,
                year,
                section
            )
        )

        connection.commit()

        return jsonify({
            "message": "Student added successfully",
            "id": cursor.lastrowid,
            "student_id": student_id
        }), 201


    except Exception as error:

        print("Add student error:", error)

        if connection:
            connection.rollback()

        return jsonify({
            "message": "Failed to add student",
            "error": str(error)
        }), 500


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# =====================================================
# UPDATE STUDENT
# =====================================================

@student_bp.route("/<int:student_id>", methods=["PUT"])
def update_student(student_id):

    connection = None
    cursor = None

    try:

        data = request.get_json()

        connection = get_db_connection()
        cursor = connection.cursor()

        query = """
            UPDATE students
            SET
                name=%s,
                email=%s,
                phone=%s,
                department=%s,
                year=%s,
                section=%s
            WHERE id=%s
        """

        cursor.execute(
            query,
            (
                data.get("name"),
                data.get("email"),
                data.get("phone"),
                data.get("department"),
                data.get("year"),
                data.get("section", ""),
                student_id
            )
        )

        connection.commit()

        return jsonify({
            "message": "Student updated successfully"
        }), 200


    except Exception as error:

        print("Update student error:", error)

        if connection:
            connection.rollback()

        return jsonify({
            "message": "Failed to update student",
            "error": str(error)
        }), 500


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# =====================================================
# DELETE STUDENT
# =====================================================

@student_bp.route("/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            "DELETE FROM students WHERE id=%s",
            (student_id,)
        )

        connection.commit()

        return jsonify({
            "message": "Student deleted successfully"
        }), 200


    except Exception as error:

        print("Delete student error:", error)

        if connection:
            connection.rollback()

        return jsonify({
            "message": "Failed to delete student",
            "error": str(error)
        }), 500


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()