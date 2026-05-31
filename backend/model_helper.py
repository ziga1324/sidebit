import os
import pickle
import pandas as pd

KATEGORICNE_KOLONE = [
    "osebnost",
    "cas_dneva",
    "vreme",
    "energija",
    "lokacija",
    "razpolozenje",
    "skupina",
    "cas_razpolozljiv"
]

NUMERICNE_KOLONE = [
    "starost",
    "xp_skupaj",
    "opravljeni_questi"
]

VELJAVNE_VREDNOSTI = {
    "osebnost": ["introvert", "ekstrovert", "ambivert"],
    "cas_dneva": ["jutro", "dopoldne", "popoldne", "vecer", "noc"],
    "vreme": ["soncno", "oblacno", "dezevno", "snezno", "vetrovmo"],
    "energija": ["nizka", "srednja", "visoka"],
    "lokacija": ["doma", "v_mestu", "v_naravi", "v_soli", "na_delu"],
    "razpolozenje": ["dolgcas", "vesel", "utrujen", "motiviran", "stresen", "umirjen"],
    "skupina": ["sam", "z_enim", "skupina"],
    "cas_razpolozljiv": ["do_5min", "5_15min", "15_30min", "30_60min", "vec_kot_uro"],
}


class ZestQuestPredictor:
    def __init__(self, mapa="."):
        self.model = self._nalozi(os.path.join(mapa, "model.pkl"))
        self.encoders = self._nalozi(os.path.join(mapa, "encoders.pkl"))
        self.label_enc = self._nalozi(os.path.join(mapa, "label_enc.pkl"))
        print("✅ ZestQuestPredictor naložen.")

    def _nalozi(self, pot):
        if not os.path.exists(pot):
            raise FileNotFoundError(
                f"Datoteka '{pot}' ne obstaja. "
                f"Najprej poženi: python treniraj_model.py"
            )
        with open(pot, "rb") as f:
            return pickle.load(f)

    def validiraj(self, podatki):
        napake = []

        for kol, veljavne in VELJAVNE_VREDNOSTI.items():
            vrednost = podatki.get(kol)

            if vrednost is None:
                napake.append(f"Manjkajoče polje: '{kol}'")
            elif vrednost not in veljavne:
                napake.append(
                    f"Neveljavna vrednost za '{kol}': '{vrednost}'"
                )

        return napake

    def napovej(self, podatki):
        napake = self.validiraj(podatki)

        if napake:
            raise ValueError(
                "Napake v vhodnih podatkih:\n" + "\n".join(napake)
            )

        vrstica = {}

        for kol in KATEGORICNE_KOLONE:
            vrednost = podatki[kol]

            try:
                vrstica[kol] = self.encoders[kol].transform([vrednost])[0]
            except ValueError:
                vrstica[kol] = 0

        vrstica["starost"] = int(podatki.get("starost", 20))
        vrstica["xp_skupaj"] = int(podatki.get("xp_skupaj", 0))
        vrstica["opravljeni_questi"] = int(
            podatki.get("opravljeni_questi", 0)
        )

        X = pd.DataFrame([vrstica])

        napoved_enc = self.model.predict(X)[0]
        verjetnosti = self.model.predict_proba(X)[0]
        razredi = self.label_enc.classes_

        kategorija = self.label_enc.inverse_transform(
            [napoved_enc]
        )[0]

        ver_dict = {
            r: round(float(v), 4)
            for r, v in zip(razredi, verjetnosti)
        }

        top3 = sorted(
            ver_dict.items(),
            key=lambda x: -x[1]
        )[:3]

        return {
            "kategorija": kategorija,
            "verjetnosti": ver_dict,
            "top3": [
                {
                    "kategorija": k,
                    "verjetnost": v
                }
                for k, v in top3
            ],
        }

    def batch_napovej(self, seznam_podatkov):
        return [self.napovej(p) for p in seznam_podatkov]