import os
import asyncio
from flask import Flask, request, jsonify, send_from_directory
from orchestrator import MASwarmOrchestrator
import config

app = Flask(__name__, static_folder=".")

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/style.css")
def serve_css():
    return send_from_directory(".", "style.css")

@app.route("/app.js")
def serve_js():
    return send_from_directory(".", "app.js")

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json or {}
    clause = data.get("clause", "").strip()
    if not clause:
        return jsonify({ "error": "Clause cannot be empty" }), 400

    api_key = config.GEMINI_API_KEY
    if not api_key:
        return jsonify({ "error": "GEMINI_API_KEY is not defined in the server environment." }), 500

    try:
        # Run the async swarm orchestrator in a temporary event loop
        orchestrator = MASwarmOrchestrator(api_key=api_key)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        report = loop.run_until_complete(orchestrator.analyze_clause_swarm_async(clause))
        loop.close()
        return jsonify({ "report": report })
    except Exception as e:
        return jsonify({ "error": str(e) }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[START] M&A Swarm Server starting on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port)
