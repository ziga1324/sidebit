from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os
import random   # 🔥 FIX

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

MODEL_PATH = os.path.join(os.path.dirname(__file__), "quest_model.pkl")

with open(MODEL_PATH, "rb") as f:
    model_data = pickle.load(f)

model = model_data["model"]
QUESTS = model_data["quests"]
quest_to_idx = model_data["quest_to_idx"]

FEATURE_NAMES = [
    "razpolozenje","energija","cas_na_voljo","lokacija",
    "socialna_zelja","ustvarjalnost","telesna_pripravljenost",
    "miselna_pripravljenost","stres","del_dneva","vreme_zunaj"
]

user_history = {}

def get_history(user_id):
    return user_history.setdefault(user_id, [])

def add_history(user_id, quest_id):
    hist = get_history(user_id)
    hist.append(quest_id)
    user_history[user_id] = hist[-8:]

def is_recent(user_id, quest_id):
    return quest_id in get_history(user_id)

# ── SAFE MAPS ───────────────────────────────

RAZPOLOZENJE_MAP = {
    "utrujen": 1,
    "dolgcas": 2,
    "vesel": 3,
    "motiviran": 4
}

ENERGIJA_MAP = {
    "nizka": 2,
    "srednja": 3,
    "visoka": 4
}

def safe_int(v, default=0):
    try:
        return int(v)
    except:
        return default

def pretvori(body):
    return np.array([[
        RAZPOLOZENJE_MAP.get(body.get("razpolozenje", "vesel"), 2),
        ENERGIJA_MAP.get(body.get("energija", "srednja"), 3),

        safe_int(body.get("cas_na_voljo", 10)),
        safe_int(body.get("lokacija", 0)),
        safe_int(body.get("socialna_zelja", 2)),
        safe_int(body.get("ustvarjalnost", 2)),
        safe_int(body.get("telesna_pripravljenost", 2)),
        safe_int(body.get("miselna_pripravljenost", 2)),
        safe_int(body.get("stres", 2)),
        safe_int(body.get("del_dneva", 1)),
        safe_int(body.get("vreme_zunaj", 1)),

        0
    ]])

def safe_predict(X):
    try:
        return float(model.predict(X)[0])
    except:
        return 0.0

@app.route("/api/predict", methods=["POST"])
def predict():

    body = request.get_json(force=True)
    X = pretvori(body)
    model_score = safe_predict(X)

    user_id = body.get("user_id", "default")

    # ── BEST QUEST LOGIC ───────────────────────
    best = None
    best_score = -999

    for q in QUESTS:

        if is_recent(user_id, q["id"]):
            continue

        r = 0

        if X[0][2] >= q["cas_min"]:
            r += 40
        else:
            r -= 80

        r += q.get("xp", 0) * 0.05
        r += np.random.uniform(-5, 5)

        if r > best_score:
            best_score = r
            best = q

    if best is None:
        best = random.choice(QUESTS)
        user_history[user_id] = []

    add_history(user_id, best["id"])

    # ── TOP 5 LOGIC ─────────────────────────────
    ranked = []

    for q in QUESTS:
        if is_recent(user_id, q["id"]):
            continue

        s = 0

        if X[0][2] >= q["cas_min"]:
            s += 40
        else:
            s -= 60

        s += q.get("xp", 0) * 0.05
        s += model_score * 0.1

        ranked.append((s, q))

    ranked.sort(reverse=True, key=lambda x: x[0])

    top5 = [
        {
            "id": q["id"],
            "naslov": q["naslov"],
            "xp": q["xp"],
            "cas_min": q["cas_min"],
            "score": float(s)
        }
        for s, q in ranked[:5]
    ]

    return jsonify({
        "quest": {
            "id": best["id"],
            "naslov": best["naslov"],
            "xp": best["xp"],
            "cas_min": best["cas_min"]
        },
        "alternativni": top5[1:],
        "model_score": model_score
    })


if __name__ == "__main__":
    print("Backend running → http://127.0.0.1:5000")
    print(f"Quests loaded: {len(QUESTS)}")
    app.run(debug=True, port=5000)