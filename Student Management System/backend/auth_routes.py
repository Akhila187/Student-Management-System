from flask import Blueprint, request, jsonify
from db import get_db_connection
import bcrypt

auth_bp = Blueprint("auth_bp", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():

    try:
        data = request.get_json() or {}

        username = str(data.get("username", "")).strip()
        password = str(data.get("password", ""))
        role = str(data.get("role", "")).strip().lower()

        # Debug: check what role is received from frontend
        print("RECEIVED ROLE:", repr(role))

        if not username or not password:
            return jsonify({
                "message": "Username and password are required"
            }), 400

        # Only Admin and Faculty are allowed
        if role not in ["admin", "faculty"]:
            return jsonify({
                "message": "Invalid role"
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT id, username, password, role, email, linked_id
            FROM users
            WHERE (username = %s OR email = %s)
            AND role = %s
            LIMIT 1
            """,
            (username, username, role)
        )

        user = cursor.fetchone()

        cursor.close()
        connection.close()

        if not user:
            return jsonify({
                "message": "Invalid username, password or role"
            }), 401

        stored_password = user["password"]

        if isinstance(stored_password, str):
            stored_password = stored_password.encode("utf-8")

        password_bytes = password.encode("utf-8")

        if not bcrypt.checkpw(password_bytes, stored_password):
            return jsonify({
                "message": "Invalid username or password"
            }), 401

        return jsonify({
            "message": "Login successful",
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "linked_id": user.get("linked_id")
        }), 200

    except Exception as error:

        print("LOGIN ERROR:", error)

        return jsonify({
            "message": "Login server error"
        }), 500