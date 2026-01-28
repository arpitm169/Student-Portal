from flask import Flask, render_template, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)

# ---------- DATABASE CONNECTION ----------
def get_db_connection():
    return psycopg2.connect(
        dbname="student_portal_db",
        user="postgres",
        password="arpit123",
        host="localhost",
        port="5432",
        cursor_factory=RealDictCursor
    )

# ---------- HOME ----------
@app.route("/")
def home():
    return render_template("index.html")

# ---------- REGISTER ----------
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"success": False, "message": "All fields required"}), 400

    hashed_password = generate_password_hash(password)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO users (name, email, password, role)
            VALUES (%s, %s, %s, 'student')
            RETURNING user_id
        """, (name, email, hashed_password))

        user_id = cursor.fetchone()["user_id"]
        cursor.execute("""
    INSERT INTO student_profiles (user_id)
    VALUES (%s)
    ON CONFLICT DO NOTHING
""", (user_id,))


        # Auto-enroll in default courses
        cursor.execute("""
            INSERT INTO enrollments (user_id, course_id)
            SELECT %s, course_id FROM courses LIMIT 2
            ON CONFLICT DO NOTHING
        """, (user_id,))

        conn.commit()
        return jsonify({"success": True})

    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return jsonify({"success": False, "message": "Email already exists"}), 409

    finally:
        cursor.close()
        conn.close()

# ---------- LOGIN ----------
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT user_id, name, email, password
        FROM users
        WHERE email = %s
    """, (email,))
    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if user and check_password_hash(user["password"], password):
        return jsonify({
            "success": True,
            "user": {
                "id": user["user_id"],
                "name": user["name"],
                "email": user["email"]
            }
        })

    return jsonify({"success": False, "message": "Invalid email or password"})

# ---------- FINANCE (GET) ----------
@app.route("/finance/<int:user_id>")
def get_finance(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT total_amount, paid_amount, overdue_amount
        FROM finance
        WHERE user_id = %s
    """, (user_id,))
    finance = cursor.fetchone()

    cursor.close()
    conn.close()

    return jsonify({
        "success": True,
        "finance": finance
    })

# ---------- FINANCE (UPDATE / PAY) ----------
@app.route("/finance/update", methods=["POST"])
def update_finance():
    data = request.json
    user_id = data.get("user_id")
    amount = data.get("amount")

    if user_id is None or amount is None or amount <= 0:
        return jsonify({"success": False, "message": "Invalid data"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT total_amount, paid_amount
        FROM finance
        WHERE user_id = %s
    """, (user_id,))
    finance = cursor.fetchone()

    if not finance:
        cursor.close()
        conn.close()
        return jsonify({"success": False}), 404

    new_paid = finance["paid_amount"] + amount
    overdue = finance["total_amount"] - new_paid

    if overdue < 0:
        cursor.close()
        conn.close()
        return jsonify({
            "success": False,
            "message": "Amount exceeds remaining balance"
        }), 400

    cursor.execute("""
        UPDATE finance
        SET paid_amount = %s,
            overdue_amount = %s
        WHERE user_id = %s
    """, (new_paid, overdue, user_id))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"success": True})

# ---------- COURSES ----------
@app.route("/courses/enrolled/<int:user_id>")
def get_enrolled_courses(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT c.course_id, c.course_name, c.course_icon
        FROM enrollments e
        JOIN courses c ON e.course_id = c.course_id
        WHERE e.user_id = %s AND e.status = 'active'
    """, (user_id,))
    courses = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify({
        "success": True,
        "courses": courses
    })

# ---------- INSTRUCTORS ----------
@app.route("/instructors")
def get_instructors():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT instructor_id, name, avatar_color, initials
        FROM instructors
        LIMIT 3
    """)
    instructors = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify({
        "success": True,
        "instructors": instructors
    })



# ---------- PROFILE (GET) ----------
@app.route("/profile/<int:user_id>")
def get_profile(user_id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT u.name,
               p.registration_no,
               p.phone,
               p.department,
               p.year,
               p.cgpa
        FROM users u
        LEFT JOIN student_profiles p ON u.user_id = p.user_id
        WHERE u.user_id = %s
    """, (user_id,))

    profile = cur.fetchone()

    cur.close()
    conn.close()

    return jsonify({
        "success": True,
        "user": profile or {}
    })



# ---------- PROFILE (UPDATE) ----------
@app.route("/profile/update", methods=["POST"])
def update_profile():
    data = request.json

    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"success": False, "message": "User ID missing"}), 400

    registration_no = data.get("registration_no")
    phone = data.get("phone")
    department = data.get("department")
    year = data.get("year")
    cgpa = data.get("cgpa")

    conn = get_db_connection()
    cur = conn.cursor()

    # Check if profile exists
    cur.execute(
        "SELECT 1 FROM student_profiles WHERE user_id = %s",
        (user_id,)
    )

    exists = cur.fetchone()

    if exists:
        cur.execute("""
            UPDATE student_profiles
            SET registration_no=%s,
                phone=%s,
                department=%s,
                year=%s,
                cgpa=%s
            WHERE user_id=%s
        """, (registration_no, phone, department, year, cgpa, user_id))
    else:
        cur.execute("""
            INSERT INTO student_profiles
            (user_id, registration_no, phone, department, year, cgpa)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user_id, registration_no, phone, department, year, cgpa))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"success": True})


# ---------- RUN ----------
if __name__ == "__main__":
    app.run(debug=True)