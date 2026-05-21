from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os
import random
from supabase import create_client
from dotenv import load_dotenv
from uuid import UUID

load_dotenv()

app = Flask(__name__)
CORS(app)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL:
    raise Exception("Manjka SUPABASE_URL v .env")

if not SUPABASE_KEY:
    raise Exception("Manjka SUPABASE_KEY v .env")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "quest_model.pkl")

with open(MODEL_PATH, "rb") as f:
    model_data = pickle.load(f)

model = model_data["model"]
QUESTS = model_data["quests"]
quest_to_idx = model_data["quest_to_idx"]


def safe_int(v, default=0):
    try:
        return int(v)
    except Exception:
        return default


def is_valid_uuid(value):
    try:
        UUID(str(value))
        return True
    except Exception:
        return False


def require_valid_user_id(user_id):
    if not user_id:
        return None, jsonify({"error": "Manjka user_id"}), 400

    if not is_valid_uuid(user_id):
        return None, jsonify({
            "error": "user_id ni pravilen UUID",
            "received_user_id": user_id
        }), 400

    return str(user_id), None, None


RAZPOLOZENJE_MAP = {
    "utrujen": 1,
    "dolgcas": 2,
    "vesel": 3,
    "motiviran": 4,
}

ENERGIJA_MAP = {
    "nizka": 2,
    "srednja": 3,
    "visoka": 4,
}

CAS_MAP = {
    "0_5min": 5,
    "5_15min": 15,
    "15_30min": 30,
    "30plus": 60,
}

LOKACIJA_MAP = {
    "doma": 0,
    "zunaj": 1,
    "sluzba": 2,
}

SKUPINA_MAP = {
    "sam": 1,
    "prijatelji": 3,
    "druzina": 2,
}

OSEBNOST_MAP = {
    "introvert": 1,
    "ambivert": 2,
    "ekstrovert": 3,
}

VREME_MAP = {
    "dezevno": 0,
    "oblacno": 1,
    "soncno": 1,
}

CAS_DNEVA_MAP = {
    "jutro": 0,
    "popoldne": 1,
    "vecer": 2,
}


def ensure_profile_exists(user_id):
    profile = supabase.table("profiles") \
        .select("user_id") \
        .eq("user_id", user_id) \
        .execute()

    if not profile.data:
        supabase.table("profiles").insert({
            "user_id": user_id,
            "username": "Guest",
            "xp": 0,
            "streak": 0,
        }).execute()


def get_completed_quest_ids(user_id):
    res = supabase.table("completed_quests") \
        .select("quest_id") \
        .eq("user_id", user_id) \
        .execute()

    return [row["quest_id"] for row in res.data]


def update_profile_stats(user_id, xp):
    ensure_profile_exists(user_id)

    profile = supabase.table("profiles") \
        .select("xp, streak") \
        .eq("user_id", user_id) \
        .execute()

    profile_data = profile.data[0] if profile.data else {}

    current_xp = profile_data.get("xp") or 0
    current_streak = profile_data.get("streak") or 0

    new_xp = current_xp + xp
    new_streak = current_streak + 1

    supabase.table("profiles") \
        .update({
            "xp": new_xp,
            "streak": new_streak,
        }) \
        .eq("user_id", user_id) \
        .execute()

    completed_count = supabase.table("completed_quests") \
        .select("id", count="exact") \
        .eq("user_id", user_id) \
        .execute()

    return {
        "xp": new_xp,
        "streak": new_streak,
        "opravljeni": completed_count.count or 0,
    }


def pretvori(body):
    return np.array([[
        RAZPOLOZENJE_MAP.get(body.get("razpolozenje", "vesel"), 2),
        ENERGIJA_MAP.get(body.get("energija", "srednja"), 3),
        CAS_MAP.get(body.get("cas_razpolozljiv", "5_15min"), 15),
        LOKACIJA_MAP.get(body.get("lokacija", "doma"), 0),
        SKUPINA_MAP.get(body.get("skupina", "sam"), 1),
        OSEBNOST_MAP.get(body.get("osebnost", "ambivert"), 2),
        ENERGIJA_MAP.get(body.get("energija", "srednja"), 3),
        2,
        2,
        CAS_DNEVA_MAP.get(body.get("cas_dneva", "popoldne"), 1),
        VREME_MAP.get(body.get("vreme", "oblacno"), 1),
        0,
    ]])


@app.route("/api/user-stats", methods=["GET"])
def user_stats():
    try:
        user_id = request.args.get("user_id")
        user_id, error_response, status = require_valid_user_id(user_id)

        if error_response:
            return error_response, status

        ensure_profile_exists(user_id)

        profile = supabase.table("profiles") \
            .select("xp, streak") \
            .eq("user_id", user_id) \
            .execute()

        completed_count = supabase.table("completed_quests") \
            .select("id", count="exact") \
            .eq("user_id", user_id) \
            .execute()

        profile_data = profile.data[0] if profile.data else {}

        return jsonify({
            "xp": profile_data.get("xp") or 0,
            "streak": profile_data.get("streak") or 0,
            "opravljeni": completed_count.count or 0,
        })

    except Exception as e:
        print("USER-STATS ERROR:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        body = request.get_json(force=True)
        user_id = body.get("user_id")

        user_id, error_response, status = require_valid_user_id(user_id)

        if error_response:
            return error_response, status

        ensure_profile_exists(user_id)

        completed_ids = get_completed_quest_ids(user_id)

        available_quests = [
            q for q in QUESTS
            if q["id"] not in completed_ids
        ]

        if not available_quests:
            return jsonify({
                "error": "Opravil si že vse queste 🎉"
            }), 404

        X_base = pretvori(body)
        cas_na_voljo = X_base[0][2]

        filtered_quests = [
            q for q in available_quests
            if q.get("cas_min", 0) <= cas_na_voljo
        ]

        if not filtered_quests:
            filtered_quests = available_quests

        sample_quests = random.sample(
            filtered_quests,
            min(50, len(filtered_quests))
        )

        X_batch = []

        for q in sample_quests:
            quest_idx = quest_to_idx.get(q["id"], 0)

            X = X_base.copy()
            X[0][-1] = quest_idx

            X_batch.append(X[0])

        X_batch = np.array(X_batch)

        try:
            model_scores = model.predict(X_batch)
        except Exception as e:
            print("Batch predict napaka:", e)
            model_scores = np.zeros(len(sample_quests))

        ranked = []

        for model_score, q in zip(model_scores, sample_quests):
            score = float(model_score)
            score += q.get("xp", 0) * 0.05
            score += q.get("rarity", 1) * 2
            score += random.uniform(-3, 3)

            ranked.append((score, q))

        ranked.sort(reverse=True, key=lambda x: x[0])

        best_score, best = ranked[0]

        top5 = [
            {
                "id": q["id"],
                "naslov": q["naslov"],
                "opis": q.get("opis", ""),
                "xp": q.get("xp", 0),
                "cas_min": q.get("cas_min", 0),
                "kat": q.get("kat"),
                "score": float(s),
            }
            for s, q in ranked[:5]
        ]

        return jsonify({
            "quest": {
                "id": best["id"],
                "naslov": best["naslov"],
                "opis": best.get("opis", ""),
                "xp": best.get("xp", 0),
                "cas_min": best.get("cas_min", 0),
                "kat": best.get("kat"),
            },
            "alternativni": top5[1:],
            "model_score": float(best_score),
        })

    except Exception as e:
        print("PREDICT ERROR:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/opravi", methods=["POST"])
def opravi():
    try:
        body = request.get_json(force=True)

        user_id = body.get("user_id")
        quest_id = body.get("quest_id")
        xp = safe_int(body.get("xp"), 0)

        user_id, error_response, status = require_valid_user_id(user_id)

        if error_response:
            return jsonify({
                "success": False,
                "error": error_response.get_json().get("error"),
                "received_user_id": body.get("user_id")
            }), status

        if not quest_id:
            return jsonify({
                "success": False,
                "error": "Manjka quest_id"
            }), 400

        quest_id = str(quest_id)

        ensure_profile_exists(user_id)

        existing = supabase.table("completed_quests") \
            .select("id") \
            .eq("user_id", user_id) \
            .eq("quest_id", quest_id) \
            .execute()

        if existing.data:
            return jsonify({
                "success": False,
                "error": "Quest je že opravljen"
            }), 409

        completed_response = supabase.table("completed_quests") \
            .insert({
                "user_id": user_id,
                "quest_id": quest_id
            }) \
            .execute()

        stats = update_profile_stats(user_id, xp)

        return jsonify({
            "success": True,
            "completed_quest": completed_response.data,
            "stats": stats
        }), 200

    except Exception as e:
        print("OPRAVI ERROR:", e)

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    print("Backend running → http://127.0.0.1:5000")
    print(f"Quests loaded: {len(QUESTS)}")
    app.run(host="127.0.0.1", port=5000, debug=False, use_reloader=False)