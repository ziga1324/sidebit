import "./about.css"

export default function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <h1>About Sidebit</h1>
        <p>
          Every moment can become a side quest.
        </p>
      </section>

      <section className="about-chat">

        <div className="message left">
          <h2>Traveler</h2>
          <p>
            Kaj je Sidebit?
          </p>
        </div>

        <div className="message right">
          <h2>Guide</h2>
          <p>
            Sidebit je aplikacija, ki ti pomaga najti majhne, zabavne in
            koristne izzive glede na tvoje razpoloženje, energijo,
            lokacijo in prosti čas.
          </p>
        </div>

        <div className="message left">
          <h2>Traveler</h2>
          <p>
            In kako to deluje?
          </p>
        </div>

        <div className="message right">
          <h2>Guide</h2>
          <p>
            Izbereš svoje trenutno stanje — kako se počutiš, koliko časa
            imaš in kje si — Sidebit pa ti predlaga quest,
            ki se ujema s tvojim trenutkom.
          </p>
        </div>

        <div className="message left">
          <h2>Traveler</h2>
          <p>
            Kaj pa ko quest opravim?
          </p>
        </div>

        <div className="message right">
          <h2>Guide</h2>
          <p>
            Takrat prejmeš XP, beležiš svoj napredek in odkriješ nove
            ideje za naslednji side quest.
          </p>
        </div>

        <div className="message left">
          <h2>Traveler</h2>
          <p>
            Zakaj sploh Sidebit?
          </p>
        </div>

        <div className="message right">
          <h2>Guide</h2>
          <p>
            Ker tudi nekaj prostih minut lahko postane mini avantura.
            Nekaj aktivnega. Nekaj ustvarjalnega.
            Nekaj samo zate.
          </p>
        </div>

      </section>
    </div>
  )
}