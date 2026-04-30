import { useEffect } from "react";

interface DossierProps {
  mode: "heikki" | "rcb";
}

export default function Dossier({ mode }: DossierProps) {
  useEffect(() => {
    // Inject CSS for the dossier page
    const styleId = "dossier-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        :root {
          --ink: #05080f;
          --ink2: #080d18;
          --ink3: #0d1525;
          --ink4: #111d30;
          --white: #ffffff;
          --snow: #f0f4f8;
          --red: #c8102e;
          --red2: #a50d26;
          --red3: #e01535;
          --ice: #c8dff0;
          --gold: #e8c84a;
          --silver: #b8ceda;
          --bronze: #d4a870;
          --muted: rgba(255,255,255,0.52);
          --dim: rgba(255,255,255,0.25);
          --subtle: rgba(255,255,255,0.08);
          --line: rgba(255,255,255,0.09);
          --line2: rgba(255,255,255,0.045);
          --glow: rgba(200,16,46,0.18);
        }

        .dossier-body {
          font-family: 'Barlow', sans-serif;
          background: var(--ink);
          color: var(--white);
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          margin: 0;
          padding: 0;
        }

        .dossier-body * { box-sizing: border-box; }

        /* ─── NAV ─── */
        .dossier-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          display: flex; justify-content: space-between; align-items: center;
          padding: 0 3rem; height: 60px;
          background: rgba(5,8,15,0.92); backdrop-filter: blur(32px);
          border-bottom: 1px solid var(--line2);
        }

        .n-brand {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; letter-spacing: 0.18em;
          display: flex; align-items: center; gap: 0.6rem; color: #fff; text-decoration: none;
        }

        .n-pip { width: 6px; height: 6px; border-radius: 50%; background: var(--red); }

        .n-links { display: flex; gap: 2.2rem; align-items: center; }
        .n-links a {
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.72rem;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--muted); text-decoration: none; transition: color 0.2s; font-weight: 500;
        }
        .n-links a:hover { color: #fff; }

        .n-cta {
          background: var(--red); color: #fff;
          padding: 0.45rem 1.2rem; border-radius: 2px;
          font-size: 0.72rem; font-weight: 600;
          letter-spacing: 0.14em; text-decoration: none;
        }

        /* ─── HERO ─── */
        .hero {
          min-height: 100vh; position: relative;
          display: grid; grid-template-columns: 1fr 1fr; overflow: hidden;
        }

        .hero-left {
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 8rem 3.5rem 5rem; position: relative; z-index: 2;
        }

        .hero-photo {
          position: absolute; inset: 0;
          background: 
            linear-gradient(105deg, var(--ink) 0%, rgba(5,8,15,0.45) 55%, transparent 100%),
            linear-gradient(to top, var(--ink) 0%, rgba(5,8,15,0.2) 40%, transparent 70%),
            url('https://hpiali-management.s3.eu-central-1.amazonaws.com/heikki-photo.png') center top/cover no-repeat;
        }

        .hero-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(4rem, 8vw, 8rem); line-height: 0.84; letter-spacing: 0.02em;
          margin-bottom: 1.5rem;
        }
        .hero-name b { display: block; color: #fff; font-weight: 400; }
        .hero-name em { display: block; color: var(--red); font-style: normal; }

        .hero-sub {
          font-size: 0.92rem; font-weight: 300; color: rgba(255,255,255,0.62);
          line-height: 1.85; max-width: 360px; margin-bottom: 2.5rem;
          border-left: 2px solid rgba(200,16,46,0.4); padding-left: 1rem;
        }

        /* ─── SECTIONS ─── */
        .sec { padding: 6rem 0; }
        .sec-alt { background: var(--ink2); }
        .w { max-width: 1140px; margin: 0 auto; padding: 0 2.5rem; }

        .stitle {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          line-height: 0.88; letter-spacing: 0.03em; margin-bottom: 2rem;
        }

        .about-g { display: grid; grid-template-columns: 300px 1fr; gap: 4rem; margin-top: 3rem; }

        .stat-card { border: 1px solid var(--line); background: var(--ink2); border-radius: 4px; overflow: hidden; }
        .stat-card-head { padding: 1rem; background: var(--red); font-family: 'Bebas Neue', sans-serif; }
        .stat-row { display: flex; border-bottom: 1px solid var(--line2); }
        .stat-k { padding: 0.8rem; font-size: 0.7rem; color: var(--muted); width: 120px; border-right: 1px solid var(--line2); text-transform: uppercase; }
        .stat-v { padding: 0.8rem; font-size: 0.9rem; }

        .bio p { font-size: 1rem; line-height: 1.8; color: rgba(255,255,255,0.7); margin-bottom: 1.5rem; }

        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; }
          .about-g { grid-template-columns: 1fr; }
          .dossier-nav { padding: 0 1.5rem; }
          .n-links { display: none; }
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const style = document.getElementById(styleId);
      if (style) style.remove();
    };
  }, []);

  return (
    <div className="dossier-body">
      <nav className="dossier-nav">
        <a href="#" className="n-brand">
          <div className="n-pip"></div>
          HEIKKI PIALI
        </a>
        <div className="n-links">
          <a href="#ueber-mich">Über mich</a>
          <a href="#erfolge">Erfolge</a>
          <a href="#ziele">Ziele</a>
          {mode === "heikki" && (
            <>
              <a href="#partner">Mehrwert</a>
              <a href="#kontakt" className="n-cta">Partner werden</a>
            </>
          )}
        </div>
      </nav>

      <section className="hero">
        <div className="hero-left">
          <h1 className="hero-name">
            <b>HEIKKI</b>
            <em>PIALI</em>
          </h1>
          <p className="hero-sub">
            Skilanglauf-Athlet aus Leidenschaft. Mit Fokus auf Explosivität, 
            Technik und den unbändigen Willen, an die Spitze zu laufen.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#ueber-mich" style={{ background: 'var(--red)', color: 'white', padding: '0.8rem 1.5rem', textDecoration: 'none', borderRadius: '2px', fontWeight: 'bold' }}>MEHR ERFAHREN</a>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-photo"></div>
        </div>
      </section>

      <section className="sec" id="ueber-mich">
        <div className="w">
          <h2 className="stitle">Über mich</h2>
          <div className="about-g">
            <div className="stat-card">
              <div className="stat-card-head">STECKBRIEF</div>
              <div className="stat-row"><div className="stat-k">Name</div><div className="stat-v">Heikki Piali</div></div>
              <div className="stat-row"><div className="stat-k">Geburtsdatum</div><div className="stat-v">18.09.2008</div></div>
              <div className="stat-row"><div className="stat-k">Wohnort</div><div className="stat-v">Bonaduz</div></div>
              <div className="stat-row"><div className="stat-k">Sportart</div><div className="stat-v">Skilanglauf</div></div>
              <div className="stat-row"><div className="stat-k">Kader</div><div className="stat-v">NLZ Ost</div></div>
            </div>
            <div className="bio">
              <p>
                Ich bin in Graubünden aufgewachsen und habe die Berge und den Schnee schon früh als mein zweites Zuhause entdeckt. 
                Was als spielerisches Hobby begann, ist heute mein absoluter Lebensmittelpunkt im Leistungssport. 
                Als Mitglied des Clubs Alpina St. Moritz und des NLZ Ost Kaders investiere ich jährlich hunderte von Trainingsstunden.
              </p>
              <p>
                Meine grosse Spezialität und Leidenschaft ist der Sprint. In dieser Disziplin fühle ich mich zu Hause, 
                weil sie alles von einem Athleten abverlangt: Kraft, technische Präzision und vor allem taktische Cleverness.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec sec-alt" id="erfolge">
        <div className="w">
          <h2 className="stitle">Erfolge</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Auszug aus den Resultaten der letzten Saison:</p>
          <div style={{ background: 'var(--ink3)', border: '1px solid var(--line)', borderRadius: '4px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--line2)' }}>
              <span>1. Rang</span>
              <span>BKW Swiss Cup, Sprint U20</span>
              <span>Langis</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--line2)' }}>
              <span>1. Rang</span>
              <span>Sprinter-Gesamtwertung U18</span>
              <span>Gesamtsaison</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
              <span>2. Rang</span>
              <span>BKW Swiss Cup Final, Sprint U18</span>
              <span>Sils</span>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" id="ziele">
        <div className="w">
          <h2 className="stitle">Ziele</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ background: 'var(--ink2)', padding: '2rem', borderRadius: '4px' }}>
              <h3 style={{ fontFamily: 'Bebas Neue', color: 'var(--red)', marginBottom: '1rem' }}>Kurzfristig</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>• Qualifikation Swiss-Ski C-Kader</li>
                <li style={{ marginBottom: '0.5rem' }}>• Top-Platzierungen im Swiss Cup</li>
              </ul>
            </div>
            <div style={{ background: 'var(--ink2)', padding: '2rem', borderRadius: '4px' }}>
              <h3 style={{ fontFamily: 'Bebas Neue', color: 'var(--red)', marginBottom: '1rem' }}>Langfristig</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>• Etablierung an der nationalen Spitze</li>
                <li style={{ marginBottom: '0.5rem' }}>• Teilnahme an Grossanlässen</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {mode === "heikki" && (
        <>
          <section className="sec sec-alt" id="partner">
            <div className="w">
              <h2 className="stitle">Mehrwert</h2>
              <p>Gerne stelle ich Ihnen meine Pläne in einem persönlichen Gespräch vor.</p>
              <div style={{ marginTop: '2rem' }}>
                <a href="#kontakt" style={{ background: 'var(--red)', color: 'white', padding: '0.8rem 1.5rem', textDecoration: 'none', borderRadius: '2px', fontWeight: 'bold' }}>ANFRAGE SENDEN</a>
              </div>
            </div>
          </section>

          <section className="sec" id="kontakt">
            <div className="w">
              <h2 className="stitle">Kontakt</h2>
              <div style={{ background: 'var(--red)', padding: '3rem', borderRadius: '4px', textAlign: 'center' }}>
                <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', marginBottom: '1rem' }}>GEMEINSAM ZUM ERFOLG</h3>
                <p style={{ marginBottom: '2rem' }}>Laurin Bieler | Management</p>
                <a href="mailto:hpiali.management@gmail.com" style={{ background: 'white', color: 'var(--red)', padding: '1rem 2rem', textDecoration: 'none', borderRadius: '2px', fontWeight: 'bold' }}>hpiali.management@gmail.com</a>
              </div>
            </div>
          </section>
        </>
      )}

      <footer style={{ padding: '4rem 0', textAlign: 'center', borderTop: '1px solid var(--line2)', color: 'var(--muted)', fontSize: '0.8rem' }}>
        &copy; 2026 HEIKKI PIALI | ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}
