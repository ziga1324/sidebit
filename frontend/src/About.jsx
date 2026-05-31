import "./about.css"

export default function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <h1>About ZestQuest</h1>
        <p>
          ZestQuest je aplikacija, ki ti pomaga najti majhne, zabavne in
          koristne izzive glede na tvoje razpoloženje, energijo, lokacijo in
          prosti čas.
        </p>
      </section>

      <section className="about-card">
        <h2>Naša ideja</h2>
        <p>
          Velikokrat imamo nekaj minut prostega časa, ampak ne vemo, kaj bi
          počeli. ZestQuest ti predlaga quest, ki se ujema s tvojo trenutno
          situacijo — doma, zunaj, sam ali s prijatelji.
        </p>
      </section>

      <section className="about-card">
        <h2>Kako deluje?</h2>
        <p>
          Izbereš svoje trenutno stanje, aplikacija pa ti predlaga primeren
          izziv. Ko quest opraviš, prejmeš XP in gradiš svoj napredek.
        </p>
      </section>

      <section className="about-card">
        <h2>Zakaj ZestQuest?</h2>
        <p>
          Namen aplikacije je, da vsak dan narediš nekaj malega zase — nekaj
          aktivnega, ustvarjalnega, sproščujočega ali socialnega.
        </p>
      </section>
    </div>
  )
}