import os
from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "dev-secret-change-me")

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_ANON_KEY = os.environ["SUPABASE_ANON_KEY"]
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


# ---------- Auth helper ----------
def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("access_token"):
            return redirect(url_for("login_page"))
        return view(*args, **kwargs)
    return wrapped


# ---------- Routes ----------
@app.route("/")
def index():
    # If already logged in, go to overview; else register
    if session.get("access_token"):
        return redirect(url_for("overview"))
    return redirect(url_for("register"))


@app.route("/register")
def register():
    return render_template("register.html")


@app.route("/login")
def login_page():
    return render_template("login-page.html")


@app.route("/overview")
@login_required
def overview():
    return render_template("overview.html")


# ---------- API endpoints (optional, if you want to proxy Supabase) ----------
@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    try:
        res = supabase.auth.sign_in_with_password({"email": email, "password": password})
    except Exception as e:
        return jsonify({"error": str(e)}), 401

    session["access_token"] = res.session.access_token
    session["user_id"] = res.user.id
    return jsonify({"ok": True, "redirect": url_for("overview")})


@app.route("/api/logout", methods=["POST"])
def api_logout():
    session.clear()
    return jsonify({"ok": True, "redirect": url_for("login_page")})


if __name__ == "__main__":
    app.run(debug=True)