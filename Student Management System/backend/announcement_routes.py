from flask import Blueprint, request, jsonify
from db import get_db_connection

announcement_bp = Blueprint("announcement_bp", __name__)


@announcement_bp.route("/", methods=["GET"])
def get_announcements():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, title, message, created_at
            FROM announcements
            ORDER BY id DESC
        """)

        announcements = cursor.fetchall()

        return jsonify(announcements), 200

    except Exception as error:
        print("GET ANNOUNCEMENTS ERROR:", error)

        return jsonify({
            "message": "Failed to load announcements",
            "error": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


@announcement_bp.route("/", methods=["POST"])
def add_announcement():
    connection = None
    cursor = None

    try:
        data = request.get_json()

        title = data.get("title", "").strip()
        message = data.get("message", "").strip()

        if not title or not message:
            return jsonify({
                "message": "Title and message are required"
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO announcements (title, message)
            VALUES (%s, %s)
        """, (title, message))

        connection.commit()

        return jsonify({
            "message": "Announcement added successfully",
            "id": cursor.lastrowid
        }), 201

    except Exception as error:
        print("ADD ANNOUNCEMENT ERROR:", error)

        if connection:
            connection.rollback()

        return jsonify({
            "message": "Failed to add announcement",
            "error": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


@announcement_bp.route("/<int:announcement_id>", methods=["DELETE"])
def delete_announcement(announcement_id):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            DELETE FROM announcements
            WHERE id = %s
        """, (announcement_id,))

        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({
                "message": "Announcement not found"
            }), 404

        return jsonify({
            "message": "Announcement deleted successfully"
        }), 200

    except Exception as error:
        print("DELETE ANNOUNCEMENT ERROR:", error)

        if connection:
            connection.rollback()

        return jsonify({
            "message": "Failed to delete announcement",
            "error": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()