import { useEffect, useState } from "react";
import {
  experience,
  projects,
  quickFacts,
  skills,
  systemNodes,
} from "./content";
import Icon from "./components/Icon";
import SpaceBackdrop from "./components/SpaceBackdrop";
import PhotoCollection from "./components/PhotoCollection";
import { photographs } from "./photographs";
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
export default function App() {
  const [reducedMotion, setReducedMotion] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [activeFocus, setActiveFocus] = useState("Leadership");
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReducedMotion(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? "off" : "on";
  }, [reducedMotion]);
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
      <SpaceBackdrop paused={reducedMotion} />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a href="#top" className="wordmark" aria-label="Thanapat Pirmphol home">
          oadtz
        </a>
        <p className="header-note">Engineer. Photographer. Player.</p>
        <button
          className="menu-button"
          aria-expanded={menuOpen}
          aria-controls="navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Icon name={menuOpen ? "close" : "menu"} />{" "}
          {menuOpen ? "Close" : "Menu"}
        </button>
        <nav
          id="navigation"
          className={menuOpen ? "open" : ""}
          aria-label="Main navigation"
        >
          {["Work", "Photography", "About", "Contact"].map((item) => (
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
            <p className="role">CTO · Software engineer · Curious by nature</p>
            <p>
              I’m an engineer who likes getting to the bottom of complicated
              things. Then building something people can actually use.
            </p>
            <p>
              My work spans software architecture, blockchain, AI, and
              engineering leadership. Away from the keyboard, I’m usually
              looking through a camera — or playing a game.
            </p>
            <a href="#work" className="inline-link">
              A few things I’ve worked on <Icon name="down" />
            </a>
          </div>
          <div className="intro-margin">
            <span className="personal-signals">
              <a href="#work">
                <Icon name="code" /> Engineer
              </a>
              <a href="#photography">
                <Icon name="camera" /> Photographer
              </a>
              <a href="/flappybird/">
                <Icon name="gamepad" /> Gamer
              </a>
            </span>
            <a
              href="https://www.linkedin.com/in/thanapatpirmphol/"
              target="_blank"
              rel="noreferrer"
            >
              Find me on LinkedIn <Icon name="external" />
            </a>
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
            {[projects[4], projects[3], projects[2], projects[0], projects[1]].map(
              (project, i) => (
                <article key={project.name} className="work-item">
                  <span className="work-index">0{i + 1}</span>
                  <div className="work-name">
                    <h3>
                      <a href={project.url} target="_blank" rel="noreferrer">
                        {project.name} <Icon name="external" />
                      </a>
                    </h3>
                    <p>{project.role}</p>
                  </div>
                  <div className="work-description">
                    <p>{project.description}</p>
                    <span>{project.signal}</span>
                  </div>
                </article>
              ),
            )}
          </div>
        </section>
        <section
          className="photography-section"
          id="photography"
          aria-labelledby="photography-title"
        >
          <div className="photography-heading">
            <div>
              <p className="section-label">
                <Icon name="camera" /> AWAY FROM THE KEYBOARD
              </p>
              <h2 id="photography-title">A different way of looking.</h2>
            </div>
            <a
              className="inline-link"
              href="https://pixabay.com/users/oadtz-3657813/"
              target="_blank"
              rel="noreferrer"
            >
              My photography on Pixabay <Icon name="external" />
            </a>
          </div>
          <p className="photography-intro">
            I enjoy taking photographs as much as building software. A little
            patience, a different angle, and something ordinary becomes worth a
            second look.
          </p>
          <PhotoCollection photos={photographs} paused={reducedMotion} />
          <div className="creative-footer">
            <p>
              <Icon name="camera" /> Photographs by me, shared as oadtz.
            </p>
          </div>
          <a className="arcade-note" href="/flappybird/">
            <span className="arcade-symbol">
              <Icon name="gamepad" />
            </span>
            <span>
              <strong>There’s a gamer here, too.</strong>
              <span>
                A small browser game for the “one more round” part of me.
              </span>
            </span>
            <span className="arcade-action">
              Play the arcade <Icon name="external" />
            </span>
          </a>
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
                Profile & technical toolkit <Icon name="plus" />
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
              Full experience on LinkedIn <Icon name="external" />
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
                Software architecture, blockchain, AI, and engineering
                leadership — or simply a good photograph or a good game.
              </p>
              <a
                href="https://www.linkedin.com/in/thanapatpirmphol/"
                target="_blank"
                rel="noreferrer"
              >
                Say hello on LinkedIn <Icon name="external" />
              </a>
              <a
                href="https://www.github.com/oadtz"
                target="_blank"
                rel="noreferrer"
              >
                Look around my GitHub <Icon name="external" />
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
          <Icon name="gamepad" /> One more round? <Icon name="external" />
        </a>
      </footer>
    </>
  );
}
