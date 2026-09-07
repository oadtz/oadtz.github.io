import { lazy, Suspense, useEffect, useState } from "react";
import {
  buildPillars,
  experience,
  projects,
  quickFacts,
  skills,
  systemNodes,
} from "./content";
const ThreeInfrastructureScene = lazy(
  () => import("./components/ThreeInfrastructureScene"),
);
const nodeCopy: Record<string, string> = {
  Water:
    "Making every drop accountable. Digital infrastructure for water markets and stewardship.",
  Markets:
    "Connecting people, resources, and transparent records to build confidence in every exchange.",
  Ledger:
    "Shared records. Verifiable actions. Blockchain grounded in real coordination problems.",
  "AI Delivery":
    "Turning intent into working systems with agents, clear specifications, and human judgment.",
  Leadership:
    "Connecting technical depth with product direction. Building teams that can deliver both.",
};
function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h16m-6-6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
function App() {
  const [activeNode, setActiveNode] = useState("Water");
  const [paused, setPaused] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        document.querySelector<HTMLButtonElement>(".menu-toggle")?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setPaused(media.matches);
    media.addEventListener("change", syncMotion);
    return () => media.removeEventListener("change", syncMotion);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = paused ? "off" : "on";
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    document
      .querySelectorAll("[data-reveal]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [paused]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Thanapat Pirmphol home">
          oadtz<span className="brand-dot">.</span>
        </a>
        <nav
          aria-label="Main navigation"
          className={menuOpen ? "nav open" : "nav"}
        >
          {["Work", "About", "Experience"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <a
            className="nav-contact"
            href="#contact"
            onClick={() => setMenuOpen(false)}
          >
            Let’s connect <Arrow diagonal />
          </a>
        </nav>
        <button
          className="menu-toggle"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "Close −" : "Menu +"}
        </button>
      </header>
      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-topline">
            <span>
              <i className="status-dot" /> ENGINEER. LEADER. BUILDER.
            </span>
            <span className="hero-index">PERSONAL PORTFOLIO / 2026</span>
          </div>
          <div className="hero-body">
            <div className="hero-copy">
              <p className="eyebrow name-label">THANAPAT PIRMPHOL</p>
              <h1 id="hero-title">
                Complex
                <br />
                systems.
                <br />
                <span className="serif-word">Real</span>{" "}
                <span className="accent">impact.</span>
              </h1>
              <p className="hero-description">
                I build trusted digital infrastructure.
                <br />
                For water. For markets. For what comes next.
              </p>
              <a className="button primary" href="#work">
                Explore my work <Arrow />
              </a>
            </div>
            <div className="hero-visual">
              <div className="scene-grid" aria-hidden="true" />
              <div className="scene-coordinates" aria-hidden="true">
                <span>FIG. 01 — CONNECTED SYSTEMS</span>
                <span>∞</span>
              </div>
              <Suspense
                fallback={
                  <div className="scene-loading">Connecting the dots…</div>
                }
              >
                <ThreeInfrastructureScene
                  activeNode={activeNode}
                  paused={paused}
                />
              </Suspense>
              <div className="scene-caption">
                <span>
                  <i className="status-dot" /> {activeNode.toUpperCase()}
                </span>
                <button
                  className="motion-toggle"
                  onClick={() => setPaused(!paused)}
                  aria-pressed={paused}
                  aria-label={paused ? "Enable animation" : "Pause animation"}
                >
                  {paused ? "Play motion" : "Pause motion"}{" "}
                  <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
                </button>
              </div>
            </div>
          </div>
          <div className="hero-bottom">
            <p>
              Currently shaping the future of water
              <br />
              <strong>CTO @ Water Ledger Global</strong>
            </p>
            <a href="#about" className="scroll-cue">
              <span>SCROLL TO DISCOVER</span>
              <span aria-hidden="true">↓</span>
            </a>
            <span className="hero-bottom-note">
              20+ YEARS OF BUILDING
              <br />
              ALWAYS EXPLORING.
            </span>
          </div>
        </section>
        <section
          className="exploration"
          aria-label="Explore areas of expertise"
        >
          <div className="exploration-label">
            <span className="eyebrow">THE CONNECTED THREADS</span>
            <span className="small-muted">Choose a focus</span>
          </div>
          <div className="node-list">
            {systemNodes.map((node, i) => (
              <button
                key={node}
                className={activeNode === node ? "node active" : "node"}
                aria-pressed={activeNode === node}
                onClick={() => setActiveNode(node)}
              >
                <span className="node-index">0{i + 1}</span>
                {node}
                <span className="node-plus" aria-hidden="true">
                  {activeNode === node ? "−" : "+"}
                </span>
              </button>
            ))}
          </div>
          <p className="node-description" aria-live="polite">
            {nodeCopy[activeNode]}
          </p>
        </section>
        <section
          className="section work"
          id="work"
          aria-labelledby="work-title"
        >
          <div className="section-heading" data-reveal>
            <p className="eyebrow">01 / SELECTED WORK</p>
            <div>
              <h2 id="work-title">
                Ideas into
                <br />
                <span className="serif-word">infrastructure.</span>
              </h2>
              <p>
                Real problems. Working platforms.
                <br />A few places I’ve made a difference.
              </p>
            </div>
          </div>
          <div className="project-grid">
            {projects.map((project, index) => (
              <a
                className={`project-card project-${index}`}
                key={project.name}
                href={project.url}
                target="_blank"
                rel="noreferrer"
                data-reveal
              >
                <div className="project-art" aria-hidden="true">
                  <span className="project-number">
                    0{index + 1} /{" "}
                    {
                      [
                        "WATER & SUSTAINABILITY",
                        "COMMUNITY & IMPACT",
                        "TRUST & GOVERNANCE",
                        "SYSTEMS AT SCALE",
                      ][index]
                    }
                  </span>
                  {index === 0 ? (
                    <div className="water-mark">
                      water<span>ledger</span>
                      <i>↗</i>
                    </div>
                  ) : index === 1 ? (
                    <div className="tapin-mark">
                      <span className="crosshair">+</span>TapIn
                      <span className="tapin-caption">
                        Every report. A clearer picture.
                      </span>
                    </div>
                  ) : index === 2 ? (
                    <div className="civic-mark">
                      civic
                      <span>
                        ledger<span className="accent">_</span>
                      </span>
                    </div>
                  ) : (
                    <div className="enterprise-mark">
                      <span>Ideas.</span>
                      <span>People.</span>
                      <span>Platforms.</span>
                    </div>
                  )}
                  <span className="project-open">
                    <Arrow diagonal />
                  </span>
                </div>
                <div className="project-details">
                  <div>
                    <h3>{project.name}</h3>
                    <span>{project.role}</span>
                  </div>
                  <p>{project.description}</p>
                  <span className="project-signal">{project.signal}</span>
                </div>
              </a>
            ))}
          </div>
        </section>
        <section
          className="section about"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="about-portrait" data-reveal>
            <div className="portrait-frame">
              <img
                src="/profile.jpg"
                alt="Thanapat Pirmphol"
                loading="lazy"
                width="590"
                height="590"
              />
              <span className="portrait-cross" aria-hidden="true">
                +
              </span>
            </div>
            <div className="portrait-caption">
              <span>THANAPAT PIRMPHOL</span>
              <span>AKA. OADTZ</span>
            </div>
            <div className="experience-stat">
              <strong>
                20<span>+</span>
              </strong>
              <span>
                years connecting technology
                <br />
                with the real world
              </span>
            </div>
          </div>
          <div className="about-copy" data-reveal>
            <p className="eyebrow">02 / THE PERSON BEHIND THE SYSTEMS</p>
            <h2 id="about-title">
              An engineer’s mind.
              <br />A builder’s <span className="serif-word">instinct.</span>
            </h2>
            <p>
              I work where software becomes infrastructure — where trust,
              reliability, and adoption matter as much as the code.
            </p>
            <p>
              My work connects blockchain, sustainable resource management,
              enterprise platforms, and engineering leadership. Today, that
              means building water markets, accounting, and stewardship at Water
              Ledger.
            </p>
            <p>
              I like making complex systems understandable, usable, and
              dependable enough for people to build decisions on top of them.
            </p>
            <a
              className="text-link"
              href="https://www.linkedin.com/in/thanapatpirmphol/"
              target="_blank"
              rel="noreferrer"
            >
              More about my journey <Arrow diagonal />
            </a>
            <details className="profile-facts">
              <summary>
                Profile at a glance <span aria-hidden="true">+</span>
              </summary>
              <dl>
                {quickFacts.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </div>
        </section>
        <section
          className="section approach"
          id="leadership"
          aria-labelledby="approach-title"
        >
          <div className="section-heading" data-reveal>
            <p className="eyebrow">03 / HOW I THINK</p>
            <div>
              <h2 id="approach-title">
                Build with purpose.
                <br />
                <span className="serif-word">Lead with clarity.</span>
              </h2>
              <p>
                Hands-on engineering depth.
                <br />
                The operating judgment of a CTO.
              </p>
            </div>
          </div>
          <div className="pillar-grid">
            {buildPillars.map((pillar, index) => (
              <article className="pillar" data-reveal key={pillar.title}>
                <span className="pillar-number">[ 0{index + 1} ]</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
              </article>
            ))}
          </div>
          <div
            className="skill-cloud"
            aria-label="Technical and leadership skills"
          >
            {skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </section>
        <section
          className="section experience"
          id="experience"
          aria-labelledby="experience-title"
        >
          <div className="section-heading" data-reveal>
            <p className="eyebrow">04 / THE JOURNEY</p>
            <div>
              <h2 id="experience-title">
                Always <span className="serif-word">building.</span>
              </h2>
              <p>
                From enterprise systems to
                <br />
                the next generation of infrastructure.
              </p>
            </div>
          </div>
          <div className="timeline">
            {experience.map(([period, role, company], index) => (
              <article className="timeline-row" data-reveal key={period}>
                <span className="timeline-period">{period}</span>
                <div>
                  <h3>{role}</h3>
                  <p>{company}</p>
                </div>
                <span
                  className={index === 0 ? "current-badge" : "timeline-counter"}
                >
                  {index === 0 ? "CURRENT" : `0${experience.length - index}`}
                </span>
              </article>
            ))}
          </div>
        </section>
        <section
          className="contact"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="contact-top">
            <p className="eyebrow">HAVE A COMPLEX PROBLEM WORTH SOLVING?</p>
            <span aria-hidden="true">✳</span>
          </div>
          <h2 id="contact-title">
            Let’s build
            <br />
            <span className="serif-word">what’s next.</span>
          </h2>
          <div className="contact-bottom">
            <p>
              Water. Blockchain. AI. Technology leadership.
              <br />
              Good conversations are where good systems start.
            </p>
            <div className="contact-actions">
              <a
                className="button dark"
                href="https://www.linkedin.com/in/thanapatpirmphol/"
                target="_blank"
                rel="noreferrer"
              >
                Connect on LinkedIn <Arrow diagonal />
              </a>
              <a
                className="github-link"
                href="https://www.github.com/oadtz"
                target="_blank"
                rel="noreferrer"
              >
                GitHub <Arrow diagonal />
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <a className="brand" href="#top">
          oadtz<span className="brand-dot">.</span>
        </a>
        <span>© {new Date().getFullYear()} Thanapat Pirmphol</span>
        <div>
          <a
            className="arcade-easter-egg"
            href="/flappybird/"
            aria-label="Play the arcade archive"
            title="A little play, between the serious work"
          >
            ↗ PLAY
          </a>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </>
  );
}
export default App;
