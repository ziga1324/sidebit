import json
import numpy as np
import pandas as pd
import pickle

from sklearn.ensemble import RandomForestRegressor

# ─────────────────────────────
# LOAD QUESTS
# ─────────────────────────────

with open("quests_database.json", "r", encoding="utf-8") as f:
    QUESTS = json.load(f)

FEATURE_NAMES = [
    "razpolozenje","energija","cas_na_voljo","lokacija",
    "socialna_zelja","ustvarjalnost","telesna_pripravljenost",
    "miselna_pripravljenost","stres","del_dneva","vreme_zunaj"
]

# ─────────────────────────────
# SIMPLE SCORE FUNCTION (FAST)
# ─────────────────────────────

def score(quest, feats):

    r,e,c,l,s,u,t,m,st,d,w = feats

    base = 0

    if c >= quest["cas_min"]:
        base += 40
    else:
        base -= 80

    base += quest.get("xp",0) * 0.05
    base += quest.get("rarity",1) * 5

    base += (4 - abs(r - quest["requirements"]["razpolozenje"])) * 5
    base += (4 - abs(e - quest["requirements"]["energija"])) * 5

    return base

# ─────────────────────────────
# CHUNK GENERATOR
# ─────────────────────────────

def generate_chunk(n=2000):

    rows = []

    for _ in range(n):

        feats = [
            np.random.randint(1,5),
            np.random.randint(1,5),
            np.random.choice([5,10,15,20,30,60]),
            np.random.randint(0,3),
            np.random.randint(1,4),
            np.random.randint(1,4),
            np.random.randint(1,4),
            np.random.randint(1,4),
            np.random.randint(1,4),
            np.random.randint(0,4),
            np.random.randint(0,2),
        ]

        scores = [(score(q, feats), q["id"]) for q in QUESTS]
        scores.sort(reverse=True)

        # TOP 3 only
        for s, qid in scores[:3]:
            rows.append(feats + [qid, s])

    return pd.DataFrame(
        rows,
        columns=FEATURE_NAMES + ["quest_id", "score"]   # 🔥 IMPORTANT FIX
    )

# ─────────────────────────────
# STREAM TRAINING DATA
# ─────────────────────────────

chunks = []
NUM_CHUNKS = 20

print("Generating chunks...")

for i in range(NUM_CHUNKS):

    df_chunk = generate_chunk(3000)
    chunks.append(df_chunk)

    print(f"Chunk {i+1}/{NUM_CHUNKS}")

df = pd.concat(chunks, ignore_index=True)

print("Total:", len(df))

# ─────────────────────────────
# ENCODE QUESTS
# ─────────────────────────────

quest_ids = df["quest_id"].unique()
quest_to_idx = {q:i for i,q in enumerate(quest_ids)}

df["quest_idx"] = df["quest_id"].map(quest_to_idx)

# ─────────────────────────────
# TRAIN MODEL (LIGHTER)
# ─────────────────────────────

X = df[FEATURE_NAMES + ["quest_idx"]].values
y = df["score"].values

from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)

print("Training...")

model = RandomForestRegressor(
    n_estimators=150,   # 🔥 reduced for RAM
    max_depth=20,
    n_jobs=-1,
    random_state=42
)

model.fit(X_train, y_train)

print("Done")

# ─────────────────────────────
# SAVE
# ─────────────────────────────

with open("quest_model.pkl", "wb") as f:
    pickle.dump({
        "model": model,
        "quests": QUESTS,
        "quest_to_idx": quest_to_idx
    }, f)

df.to_csv("quest_dataset.csv", index=False)

print("Saved safely (RAM-friendly)")