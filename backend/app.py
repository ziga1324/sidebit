from flask import Flask, request, jsonify
from flask_cors import CORS

from model_helper import ZestQuestPredictor

app = Flask(__name__)
CORS(app)

predictor = ZestQuestPredictor()


@app.route("/api/predict", methods=["POST"])
def napovej():
    if predictor is None:
        return jsonify({"ok": False, "error": "Model ni naložen"}), 500

    data = request.get_json(force=True, silent=True) or {}

    try:
        rezultat = predictor.napovej({
            "osebnost": data.get("osebnost", "ambivert"),
            "cas_dneva": data.get("cas_dneva", "popoldne"),
            "vreme": data.get("vreme", "oblacno"),
            "energija": data.get("energija", "srednja"),
            "lokacija": data.get("lokacija", "doma"),
            "razpolozenje": data.get("razpolozenje", "dolgcas"),
            "skupina": data.get("skupina", "sam"),
            "cas_razpolozljiv": data.get("cas_razpolozljiv", "5_15min"),
            "starost": int(data.get("starost", 20)),
            "xp_skupaj": int(data.get("xp_skupaj", 0)),
            "streak_dni": int(data.get("streak_dni", 0)),
            "opravljeni_questi": int(data.get("opravljeni_questi", 0)),
        })

        # 🔥 PRETVORBA MODELA V QUEST (brez baze)
        kategorija = rezultat["kategorija"]

        quest = {
            "naslov": f"{kategorija.capitalize()} quest",
            "opis": f"Model priporoča aktivnost iz kategorije: {kategorija}",
            "xp": 10
        }

        return jsonify({
            "ok": True,
            "quest": quest,
            "kategorija": kategorija,
            "top3": rezultat["top3"]
        })

    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 400


@app.route("/api/user-stats", methods=["GET"])
def user_stats():
    return jsonify({
        "xp": 120,
        "streak": 7,
        "opravljeni": 18
    })


if __name__ == "__main__":
    app.run(debug=True)