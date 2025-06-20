from flask import Flask, render_template, request, redirect, url_for, session
from chinesePage import chinese_page
from classicalChinesePage import classical_chinese_page
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = "ai2025!@#%$^&*"


@app.before_request
def require_login():
    # 允许未登录访问的 endpoint 名称
    allowed_endpoints = [
        "index",  # 主页
        "login",  # 登录
        "register",  # 注册
        "static",  # 静态资源
    ]
    # endpoint 可能为 None，需判断
    if request.endpoint is not None:
        # 如果未登录，且访问的不是允许的页面，则重定向到登录页
        if "username" not in session and request.endpoint not in allowed_endpoints:
            return redirect(url_for("login"))


@app.route("/")
def index():
    return render_template("index.html")


# 注册诗词写作页面蓝图
app.register_blueprint(chinese_page, url_prefix="/")


# 注册文言文分析页面蓝图
app.register_blueprint(classical_chinese_page, url_prefix="/")


@app.route("/classicalChinese")
def classicalChinese():
    return render_template("classicalChinese.html")


@app.route("/draw")
def draw():
    return render_template("draw.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        import sqlite3

        conn = sqlite3.connect("users.db")
        c = conn.cursor()
        c.execute("SELECT id, password FROM users WHERE username=?", (username,))
        user = c.fetchone()
        conn.close()
        if not user:
            error = "用户名不存在"
        elif not check_password_hash(user[1], password):
            error = "密码错误"
        else:
            session["user_id"] = user[0]
            session["username"] = username
            return redirect(url_for("index"))
    return render_template("login.html", error=error)


@app.route("/register", methods=["GET", "POST"])
def register():
    error = None
    success = None
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        password2 = request.form.get("password2", "")
        if not username or not password or not password2:
            error = "所有字段均为必填"
        elif password != password2:
            error = "两次输入的密码不一致"
        else:
            import sqlite3

            conn = sqlite3.connect("users.db")
            c = conn.cursor()
            c.execute("SELECT id FROM users WHERE username=?", (username,))
            if c.fetchone():
                error = "用户名已存在"
            else:
                hashed = generate_password_hash(password)
                c.execute(
                    "INSERT INTO users (username, password) VALUES (?, ?)",
                    (username, hashed),
                )
                conn.commit()
                success = "注册成功，请登录"
            conn.close()
    return render_template("register.html", error=error, success=success)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


if __name__ == "__main__":
    app.run(debug=True)
