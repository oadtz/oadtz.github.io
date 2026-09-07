import { lazy, Suspense, useEffect, useState } from "react";
import {
  experience,
  projects,
  quickFacts,
  skills,
  systemNodes,
} from "./content";
const WaterScene = lazy(() => import("./components/ThreeInfrastructureScene"));
const focusNotes: Record<string, string> = {
  Water:
    "Water markets, accounting, and stewardship at Water Ledger. Making resource decisions easier to understand and audit.",
  Markets:
    "Transparent records and clear workflows that give people confidence in an exchange.",
  Ledger:
    "Blockchain for shared records, regulated workflows, and the practical problem of coordinating trust.",
  "AI Delivery":
    "Agentic tools, clear specifications, and engineering review. New ways to deliver software while keeping people accountable.",
  Leadership:
    "Hands-on architecture, product decisions, and teams that can turn an uncertain problem into a working platform.",
};
function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
export default function App() {
  const [paused, setPaused] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [activeFocus, setActiveFocus] = useState("Water");
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setPaused(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = paused ? "off" : "on";
  }, [paused]);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        document.querySelector<HTMLButtonElement>(".menu-button")?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a href="#top" className="wordmark" aria-label="Thanapat Pirmphol home">
          oadtz
        </a>
        <p className="header-note">Engineering, with a human point of view.</p>
        <button
          className="menu-button"
          aria-expanded={menuOpen}
          aria-controls="navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
        <nav
          id="navigation"
          className={menuOpen ? "open" : ""}
          aria-label="Main navigation"
        >
          {["Work", "About", "Experience", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </a>
          ))}
        </nav>
      </header>
      <main id="main">
        <section className="introduction" id="top" aria-labelledby="hero-title">
          <div className="name-block">
            <p className="intro-note">Hi, I’m Thanapat.</p>
            <h1 id="hero-title">
              Thanapat
              <br />
              <span>Pirmphol</span>
              <span className="name-period">.</span>
            </h1>
          </div>
          <figure className="portrait">
            <img
              src="/profile.jpg"
              alt="Thanapat Pirmphol"
              width="590"
              height="590"
              fetchPriority="high"
            />
            <figcaption>
              <span>Thanapat Pirmphol</span>
              <span>oadtz</span>
            </figcaption>
          </figure>
          <div className="intro-copy">
            <p className="role">CTO at Water Ledger Global</p>
            <p>
              I’m an engineer who likes getting to the bottom of complicated
              things. Then building something people can actually use.
            </p>
            <p>
              These days, I work on water: how it’s accounted for, traded, and
              managed. Before that, enterprise systems, blockchain, and the
              teams behind them.
            </p>
            <a href="#work" className="inline-link">
              A few things I’ve worked on <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="intro-margin">
            <span>Software · Systems · People</span>
            <a
              href="https://www.linkedin.com/in/thanapatpirmphol/"
              target="_blank"
              rel="noreferrer"
            >
              Find me on LinkedIn <Arrow />
            </a>
          </div>
        </section>
        <section className="water-feature" aria-labelledby="water-title">
          <div className="water-heading">
            <div>
              <p className="section-label">MY CURRENT CHAPTER</p>
              <h2 id="water-title">
                Water is a shared resource.
                <br />
                Its records should be clear.
              </h2>
            </div>
            <a
              href="https://www.waterledger.com"
              target="_blank"
              rel="noreferrer"
            >
              Water Ledger <Arrow />
            </a>
          </div>
          <div className="water-window">
            <Suspense fallback={<div className="water-fallback">Water</div>}>
              <WaterScene paused={paused} />
            </Suspense>
            <div className="water-caption">
              <span>Move across the water to make a ripple.</span>
              <button onClick={() => setPaused(!paused)} aria-pressed={paused}>
                {paused ? "Resume motion" : "Pause motion"}
              </button>
            </div>
          </div>
          <div className="water-footnote">
            <p>
              A surface of connected ripples — a small illustration of a shared
              resource. My work is the infrastructure underneath: water
              accounting, market activity, and records people can trust.
            </p>
            <span>
              Water Ledger Global
              <br />
              Chief Technology Officer · 2024–present
            </span>
          </div>
        </section>
        <section
          className="work-section"
          id="work"
          aria-labelledby="work-title"
        >
          <div className="section-title">
            <h2 id="work-title">Some of the work.</h2>
            <p>Different domains. The same curiosity.</p>
          </div>
          <div className="work-list">
            {projects.map((project, i) => (
              <article key={project.name} className="work-item">
                <span className="work-index">0{i + 1}</span>
                <div className="work-name">
                  <h3>
                    <a href={project.url} target="_blank" rel="noreferrer">
                      {project.name} <Arrow />
                    </a>
                  </h3>
                  <p>{project.role}</p>
                </div>
                <div className="work-description">
                  <p>{project.description}</p>
                  <span>{project.signal}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section
          className="about-section"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="about-heading">
            <p className="section-label">A LITTLE CONTEXT</p>
            <h2 id="about-title">
              Still an engineer.
              <br />
              Still curious.
            </h2>
            <p className="years">
              20+ <span>years in software</span>
            </p>
          </div>
          <div className="about-body">
            <p className="large-copy">
              The code is only part of the system. People need to understand it,
              operate it, and trust what comes out of it.
            </p>
            <p>
              That has been the common thread through my work in enterprise
              software, aviation, insurance, data platforms, public-sector
              blockchain, and water infrastructure.
            </p>
            <p>
              As a CTO, I move between architecture and product decisions,
              hands-on engineering and team leadership. I’m also exploring how
              AI agents can help us deliver better software with clear
              specifications and thoughtful review.
            </p>
            <div className="focus">
              <h3>What I spend time thinking about</h3>
              <div className="focus-buttons">
                {systemNodes.map((node) => (
                  <button
                    key={node}
                    onClick={() => setActiveFocus(node)}
                    aria-pressed={activeFocus === node}
                  >
                    {node}
                  </button>
                ))}
              </div>
              <p className="focus-note" aria-live="polite">
                {focusNotes[activeFocus]}
              </p>
            </div>
            <details className="profile-facts">
              <summary>
                Profile & technical toolkit <span aria-hidden="true">+</span>
              </summary>
              <dl>
                {quickFacts.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="skills">{skills.join(" / ")}</p>
            </details>
          </div>
        </section>
        <section
          className="experience-section"
          id="experience"
          aria-labelledby="experience-title"
        >
          <div className="section-title">
            <h2 id="experience-title">The longer story.</h2>
            <a
              className="inline-link"
              href="https://www.linkedin.com/in/thanapatpirmphol/"
              target="_blank"
              rel="noreferrer"
            >
              Full experience on LinkedIn <Arrow />
            </a>
          </div>
          <div className="timeline">
            {experience.map(([period, role, company]) => (
              <article className="timeline-row" key={period}>
                <span>{period}</span>
                <h3>{company}</h3>
                <p>{role}</p>
              </article>
            ))}
          </div>
        </section>
        <section
          className="contact"
          id="contact"
          aria-labelledby="contact-title"
        >
          <p className="section-label">CONTINUE THE CONVERSATION</p>
          <div>
            <h2 id="contact-title">
              What are you
              <br />
              working on?
            </h2>
            <div className="contact-copy">
              <p>
                I’m always interested in the problems behind the technology.
                Especially water, blockchain, AI, and the work of leading
                engineering teams.
              </p>
              <a
                href="https://www.linkedin.com/in/thanapatpirmphol/"
                target="_blank"
                rel="noreferrer"
              >
                Say hello on LinkedIn <Arrow />
              </a>
              <a
                href="https://www.github.com/oadtz"
                target="_blank"
                rel="noreferrer"
              >
                Look around my GitHub <Arrow />
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <a className="wordmark" href="#top">
          oadtz
        </a>
        <span>© {new Date().getFullYear()} Thanapat Pirmphol</span>
        <a href="/flappybird/">
          And sometimes, I make games. <Arrow />
        </a>
      </footer>
    </>
  );
}
