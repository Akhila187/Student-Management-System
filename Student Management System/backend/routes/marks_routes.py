from flask import Blueprint, request, jsonify
from db import get_db_connection

marks_bp = Blueprint("marks_bp", __name__)


# =========================================================
# GET ALL ACADEMIC RECORDS
# =========================================================

@marks_bp.route("/", methods=["GET"])
def get_marks():

    connection = None
    cursor = None

    try:
        connection = get_db_connection()

        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                marks.id,
                marks.student_id,
                students.name,
                students.department,
                marks.subject,
                marks.marks
            FROM marks
            JOIN students
                ON marks.student_id = students.id
            ORDER BY marks.id DESC
        """

        cursor.execute(query)

        records = cursor.fetchall()

        return jsonify(records), 200

    except Exception as error:

        print("GET MARKS ERROR:", error)

        return jsonify({
            "message": "Failed to load marks",
            "error": str(error)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# =========================================================
# ADD ACADEMIC RECORD
# =========================================================

@marks_bp.route("/", methods=["POST"])
def add_marks():

    connection = None
    cursor = None

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "message": "No data received"
            }), 400


        student_id = data.get("student_id")
        student_name = data.get("student_name")
        department = data.get("department")
        subject = data.get("subject")
        marks = data.get("marks")


        # =================================================
        # VALIDATE STUDENT NAME
        # =================================================

        if not student_name or not str(student_name).strip():

            return jsonify({
                "message": "Please enter a student name"
            }), 400

        student_name = str(student_name).strip()


        # =================================================
        # VALIDATE DEPARTMENT
        # =================================================

        if not department or not str(department).strip():

            return jsonify({
                "message": "Please select a department"
            }), 400

        department = str(department).strip()


        # =================================================
        # VALIDATE SUBJECT
        # =================================================

        if not subject or not str(subject).strip():

            return jsonify({
                "message": "Please enter a subject"
            }), 400

        subject = str(subject).strip()


        # =================================================
        # VALIDATE MARKS
        # =================================================

        if marks is None or marks == "":

            return jsonify({
                "message": "Please enter marks"
            }), 400

        try:

            marks = int(marks)

        except (ValueError, TypeError):

            return jsonify({
                "message": "Marks must be a valid number"
            }), 400


        if marks < 0 or marks > 100:

            return jsonify({
                "message": "Marks must be between 0 and 100"
            }), 400


        # =================================================
        # DATABASE CONNECTION
        # =================================================

        connection = get_db_connection()

        cursor = connection.cursor(dictionary=True)


        # =================================================
        # EXISTING STUDENT
        # =================================================

        if student_id:

            try:

                student_id = int(student_id)

            except (ValueError, TypeError):

                return jsonify({
                    "message": "Invalid student ID"
                }), 400


            cursor.execute(
                """
                SELECT
                    id,
                    name,
                    department
                FROM students
                WHERE id = %s
                """,
                (student_id,)
            )

            student = cursor.fetchone()


            if not student:

                return jsonify({
                    "message": "Student does not exist"
                }), 404


            # Existing student's department
            # is automatically used

            if student["department"]:

                department = student["department"]


        # =================================================
        # NEW STUDENT
        # =================================================

        else:

            cursor.execute(
                """
                SELECT
                    id,
                    name,
                    department
                FROM students
                WHERE LOWER(name) = LOWER(%s)
                LIMIT 1
                """,
                (student_name,)
            )

            existing_student = cursor.fetchone()


            # =================================================
            # STUDENT ALREADY EXISTS
            # =================================================

            if existing_student:

                student_id = existing_student["id"]


                if existing_student["department"]:

                    department = existing_student["department"]


            # =================================================
            # COMPLETELY NEW STUDENT
            # =================================================

            else:

                cursor.execute(
                    """
                    INSERT INTO students
                    (
                        name,
                        department
                    )
                    VALUES
                    (
                        %s,
                        %s
                    )
                    """,
                    (
                        student_name,
                        department
                    )
                )

                student_id = cursor.lastrowid


        # =================================================
        # INSERT MARKS
        # =================================================

        cursor.execute(
            """
            INSERT INTO marks
            (
                student_id,
                subject,
                marks
            )
            VALUES
            (
                %s,
                %s,
                %s
            )
            """,
            (
                student_id,
                subject,
                marks
            )
        )


        # =================================================
        # SAVE DATABASE CHANGES
        # =================================================

        connection.commit()


        marks_id = cursor.lastrowid


        # =================================================
        # SUCCESS RESPONSE
        # =================================================

        return jsonify({

            "message":
                "Academic record added successfully",

            "id":
                marks_id,

            "student_id":
                student_id

        }), 201


    # =====================================================
    # ERROR
    # =====================================================

    except Exception as error:

        print("POST MARKS ERROR:", error)

        if connection:

            connection.rollback()

        return jsonify({

            "message":
                "Failed to add academic record",

            "error":
                str(error)

        }), 500


    # =====================================================
    # CLOSE DATABASE
    # =====================================================

    finally:

        if cursor:

            cursor.close()

        if connection:

            connection.close()