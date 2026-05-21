import random
import json

# ─────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────

TOTAL_QUESTS = 20000

CATEGORIES = [
    "kreativno",
    "gibanje",
    "socialno",
    "ucenje",
    "sprostitev",
    "pustolovscina",
]

DIFFICULTIES = [
    "common",
    "rare",
    "epic",
    "legendary",
    "mythic",
]

# ─────────────────────────────────────────────────────────────
# NORMAL QUEST TEMPLATES
# ─────────────────────────────────────────────────────────────

NORMAL_TEMPLATES = [
    "Nariši {}",
    "Poslušaj glasbo o {}",
    "Preberi članek o {}",
    "Pojdi na sprehod okoli {}",
    "Fotografiraj {}",
    "Napiši kratko zgodbo o {}",
    "Naredi workout za {} minut",
    "Meditiraj {} minut",
    "Pokliči nekoga in govori o {}",
    "Poglej tutorial za {}",
    "Nauči se nekaj o {}",
    "Naredi seznam idej za {}",
    "Sprehodi se brez telefona {} minut",
    "Poišči zanimivost o {}",
    "Pospravi {}",
]

# ─────────────────────────────────────────────────────────────
# CRAZY QUEST TEMPLATES
# ─────────────────────────────────────────────────────────────

CRAZY_TEMPLATES = [
    "Vprašaj 3 neznance za random življenjski nasvet",
    "Pojdi v trgovino in kupi najbolj čudno stvar pod 3€",
    "Zapleši 15 sekund na javnem mestu",
    "Začni pogovor z neznancem o vesolju",
    "Pojdi na avtobus brez plana",
    "Govori 1 uro brez uporabe črke A",
    "Naredi selfie na najbolj random lokaciji",
    "Obleci najbolj smešen outfit doma",
    "Pojej nekaj, česar še nikoli nisi",
    "Pojdi ven ob 2h zjutraj in poslušaj tišino",
    "Vprašaj nekoga če bi šel na kavo",
    "Pojdi v knjižnico in vzemi random knjigo",
    "Napiši pesem o prvi stvari ki jo vidiš",
    "Naredi mini vlog svojega dneva",
    "Govori z AI kot da je NPC iz RPG igre",
]

# ─────────────────────────────────────────────────────────────
# RANDOM WORDS
# ─────────────────────────────────────────────────────────────

WORDS = [
    "vesolju",
    "glasbi",
    "motivaciji",
    "življenju",
    "naravi",
    "tehnologiji",
    "umetnosti",
    "sanjah",
    "prihodnosti",
    "kreativnosti",
    "energiji",
    "prijateljstvu",
    "sreči",
    "rutini",
    "mestu",
    "gozdu",
    "telefonu",
    "spominih",
    "filmski sceni",
    "idejah",
]

# ─────────────────────────────────────────────────────────────
# QUEST GENERATION
# ─────────────────────────────────────────────────────────────

quests = []

for i in range(TOTAL_QUESTS):

    is_crazy = random.random() < 0.04

    if is_crazy:

        title = random.choice(CRAZY_TEMPLATES)

        difficulty = random.choice([
            "epic",
            "legendary",
            "mythic"
        ])

        xp = random.randint(250, 1200)

        crazy_level = random.randint(7, 10)

    else:

        template = random.choice(NORMAL_TEMPLATES)

        fill = random.choice(WORDS)

        if "{}" in template:
            if "minut" in template:
                fill = str(random.choice([5,10,15,20,30,45,60]))

            title = template.format(fill)

        else:
            title = template

        difficulty = random.choice([
            "common",
            "common",
            "common",
            "rare",
            "epic"
        ])

        xp = random.randint(40, 300)

        crazy_level = random.randint(0, 3)

    quest = {
        "id": f"quest_{i}",
        "naslov": title,
        "category": random.choice(CATEGORIES),

        "difficulty": difficulty,

        "xp": xp,

        "cas_min": random.choice([
            2,5,10,15,20,30,45,60,90
        ]),

        "crazy_level": crazy_level,

        "requirements": {
            "razpolozenje": random.randint(1,4),
            "energija": random.randint(1,4),
            "socialna_zelja": random.randint(1,3),
            "ustvarjalnost": random.randint(1,3),
            "telesna_pripravljenost": random.randint(1,3),
            "miselna_pripravljenost": random.randint(1,3),
            "stres": random.randint(1,3),
        },

        "rarity": round(random.uniform(0.01, 1.0), 3),

        "night_only": random.random() < 0.08,

        "outside_only": random.random() < 0.15,
    }

    quests.append(quest)

# ─────────────────────────────────────────────────────────────
# SAVE DATABASE
# ─────────────────────────────────────────────────────────────

with open("quests_database.json", "w", encoding="utf-8") as f:
    json.dump(
        quests,
        f,
        ensure_ascii=False,
        indent=2
    )

print(f"\nGenerated {len(quests)} quests")
print("Saved → quests_database.json")

# preview
print("\nExample quests:\n")

for q in random.sample(quests, 5):
    print(q["id"], "-", q["naslov"])