# api.py
import os
import pandas as pd
from flask import Flask, request, jsonify, render_template
# from flask_cors import CORS
from final_data_and_ranking_algorithm import compute_ranking

# ── App setup ────────────────────────────────────────────────────────────────
BASE = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder="static", template_folder="templates")
# CORS(app)

# ── Routes ──────────────────────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def index():
    print("GET / - Rendering index.html", flush=True)
    return render_template("index.html")


@app.route("/api/ranking", methods=["POST"])
def ranking():
    user_input = request.get_json() or {}
    print("POST /api/ranking - Received input:", user_input, flush=True)
    if not user_input:
        print("POST /api/ranking - No data provided", flush=True)
        return jsonify({"error": "No data provided"}), 400

    try:
        print("POST /api/ranking - Computing ranking...", flush=True)
        df_top10 = compute_ranking(user_input)
        if df_top10.empty:
            print("POST /api/ranking - No results found for input:", user_input, flush=True)
            return jsonify({"error": "No results found for the given input."}), 404
        print("POST /api/ranking - Successfully computed ranking", flush=True)
        return jsonify({"results": df_top10.to_dict(orient="records")})

    except ValueError as ve:
        print("POST /api/ranking - ValueError:", str(ve), flush=True)
        return jsonify({"error": str(ve)}), 400

    except Exception as e:
        print("POST /api/ranking - Unexpected error:", str(e), flush=True)
        return jsonify({
            "error": "An unexpected error occurred.",
            "details": str(e)
        }), 500


if __name__ == "__main__":
    # only when you run `python api.py` locally
    app.run(host="0.0.0.0", port=8080)
