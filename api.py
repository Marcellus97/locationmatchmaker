import flask
import requests
import pandas as pd
import os
from flask import request, jsonify
from final_data_and_ranking_algorithm import compute_ranking
from flask_cors import CORS


app = flask.Flask(__name__)
app.config["DEBUG"] = True

# Enable CORS for all routes
CORS(app)

script_dir = os.path.dirname(os.path.abspath(__file__))

static_merged_data = pd.read_excel(os.path.join(script_dir, "./static/data/silver/merged_data.xlsx"))
cost_of_living_data = pd.read_excel(os.path.join(script_dir, "./static/data/silver/cost_of_living_data.xlsx"))

@app.route("/test", methods=["GET"])
def get_test():
    return('!doctype html <html><body>TEst</body</html>')

@app.route("/", methods=["GET"])
def get_index():
    return flask.render_template('index.html')

@app.route("/api/ranking", methods=["POST"])
def get_ranking():
    try:
        user_input = request.get_json()
        app.logger.info("INPUT %s", user_input)

        if not user_input:
            return jsonify({"error": "No data provided"}), 400

        result = compute_ranking(static_merged_data, cost_of_living_data, user_input)

        if result.empty:
            return jsonify({"error": "No results found for the given input."}), 404

        result_json = result.to_dict(orient='records')
        return jsonify({"results": result_json})

    except ValueError as ve:
        app.logger.error("ValueError in get_ranking (Line 15): %s", str(ve))
        return jsonify({"error": str(ve)}), 400

    except Exception as e:
        import traceback
        app.logger.error("Exception in get_ranking (Line 20): %s", traceback.format_exc())
        return jsonify({
            "error": "An unexpected error occurred.",
            "details": str(e)
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)