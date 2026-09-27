import mysql.connector


def get_db_connection():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Akhila@123",
        database="student_management"
    )

    return connection