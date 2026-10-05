import { useEffect, useState, type CSSProperties, type PointerEvent } from "react";
import {
  experience,
  projects,
  quickFacts,
  skills,
  systemNodes,
} from "./content";
import Icon from "./components/Icon";
import Avatar from "./components/Avatar";
import StandingAvatar from "./components/StandingAvatar";
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
const signals = [
  {
    href: "#work",
    icon: "code",
    label: "Engineer",
    hint: "Architecture, ledgers & AI agents. My day job 💻",
  },
  {
    href: "#photography",
    icon: "camera",
    label: "Photographer",
    hint: "Same world, different frame 📷",
  },
  {
    href: "/flappybird/",
    icon: "gamepad",
    label: "Gamer",
    hint: "Fancy a round of Flappy Bird? 🎮",
  },
] as const;
const workSpans = [3, 3, 2, 2, 2];
// Card spotlight: the glow follows the pointer inside the card.
const spotlight = (event: PointerEvent<HTMLElement>) => {
  const bounds = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty(
    "--px",
    `${event.clientX - bounds.left}px`,
  );
  event.currentTarget.style.setProperty(
    "--py",
    `${event.clientY - bounds.top}px`,
  );
};
export default function App() {
  const [reducedMotion, setReducedMotion] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [activeFocus, setActiveFocus] = useState("Leadership");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
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
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    const glow = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      document.documentElement.style.setProperty("--mx", `${event.clientX}px`);
      document.documentElement.style.setProperty("--my", `${event.clientY}px`);
    };
    window.addEventListener("pointermove", glow, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", glow);
    };
  }, []);
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
      <div className="cursor-glow" aria-hidden="true" />
      <div className="scroll-progress" aria-hidden="true" />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a href="#top" className="wordmark" aria-label="Thanapat Pirmphol home">
          oadtz<span>.</span>
        </a>
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
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="status-chip">
              <span className="status-dot" /> CTO at Water Ledger Global
            </p>
            <h1 id="hero-title">
              <span className="hero-hi">Hi, I’m</span>
              <span className="hero-name">
                <span className="hero-name-stage">
                  <span className="hero-name-text">
                    Thanapat
                    <span className="hero-surname">Pirmphol.</span>
                  </span>
                  {/* Icons orbit the name, passing behind and in front of it. */}
                  <span className="name-orbit" aria-hidden="true">
                    <span className="orbit-ring" />
                    {signals.map((signal, index) => (
                      <span
                        className="orbit-chip"
                        key={signal.icon}
                        style={{ "--i": index } as CSSProperties}
                      >
                        <Icon name={signal.icon} />
                      </span>
                    ))}
                  </span>
                </span>
              </span>
            </h1>
            <p className="hero-lead">
              An engineer who likes getting to the bottom of complicated things.
              Then building something people can actually use.
            </p>
            <p className="hero-sub">
              Software architecture, blockchain, AI, and engineering leadership.
              Away from the keyboard, usually behind a camera — or playing a
              game.
            </p>
            <div className="signal-row">
              {signals.map((signal) => (
                <a
                  key={signal.label}
                  href={signal.href}
                  className="signal"
                  onPointerEnter={() => setHint(signal.hint)}
                  onPointerLeave={() => setHint(null)}
                  onFocus={() => setHint(signal.hint)}
                  onBlur={() => setHint(null)}
                >
                  <Icon name={signal.icon} /> {signal.label}
                </a>
              ))}
            </div>
            <div className="hero-actions">
              <a href="#work" className="button button-primary">
                See the work <Icon name="down" />
              </a>
              <a
                href="https://www.linkedin.com/in/thanapatpirmphol/"
                className="button"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn <Icon name="external" />
              </a>
            </div>
          </div>
          <Avatar paused={reducedMotion} hint={hint} />
          <p className="scroll-cue" aria-hidden="true">
            <span /> Scroll
          </p>
        </section>

        <div className="marquee" aria-label="Skills">
          <div className="marquee-track">
            {[0, 1].map((copy) => (
              <ul key={copy} aria-hidden={copy === 1 || undefined}>
                {skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <section
          className="work-section"
          id="work"
          aria-labelledby="work-title"
        >
          <div className="section-title reveal">
            <p className="section-label">
              <Icon name="code" /> SELECTED WORK
            </p>
            <h2 id="work-title">
              Different domains.
              <br />
              <em>The same curiosity.</em>
            </h2>
          </div>
          <div className="work-grid">
            {[projects[3], projects[2], projects[0], projects[1], projects[4]].map(
              (project, i) => (
                <a
                  key={project.name}
                  className="work-card reveal"
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  onPointerMove={spotlight}
                  style={{ gridColumn: `span ${workSpans[i]}` }}
                >
                  <span className="work-top">
                    <span className="work-index">0{i + 1}</span>
                    <span className="work-role">{project.role}</span>
                    <Icon name="external" />
                  </span>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <span className="work-signal">{project.signal}</span>
                </a>
              ),
            )}
          </div>
        </section>

        <section
          className="photography-section"
          id="photography"
          aria-labelledby="photography-title"
        >
          <div className="photography-heading reveal">
            <div>
              <p className="section-label">
                <Icon name="camera" /> AWAY FROM THE KEYBOARD
              </p>
              <h2 id="photography-title">
                A different way
                <br />
                <em>of looking.</em>
              </h2>
            </div>
            <div className="photography-side">
              <p>
                I enjoy taking photographs as much as building software. A
                little patience, a different angle, and something ordinary
                becomes worth a second look.
              </p>
              <a
                className="inline-link"
                href="https://pixabay.com/users/oadtz-3657813/"
                target="_blank"
                rel="noreferrer"
              >
                My photography on Pixabay <Icon name="external" />
              </a>
            </div>
          </div>
          <PhotoCollection photos={photographs} paused={reducedMotion} />
          <a
            className="arcade-note reveal"
            href="/flappybird/"
            onPointerMove={spotlight}
          >
            <span className="arcade-symbol">
              <Icon name="gamepad" />
            </span>
            <span className="arcade-text">
              <strong>There’s a gamer here, too.</strong>
              <span>
                A small browser game for the “one more round” part of me.
              </span>
            </span>
            <span className="arcade-action">
              Press start <Icon name="external" />
            </span>
          </a>
        </section>

        <section
          className="about-section"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="about-heading reveal">
            <p className="section-label">A LITTLE CONTEXT</p>
            <h2 id="about-title">
              Still an engineer.
              <br />
              <em>Still curious.</em>
            </h2>
            <p className="years">
              <strong>20+</strong>
              <span>years in software</span>
            </p>
          </div>
          <div className="about-body reveal">
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
              <p className="focus-note" aria-live="polite" key={activeFocus}>
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
            </details>
          </div>
        </section>

        <section
          className="experience-section"
          id="experience"
          aria-labelledby="experience-title"
        >
          <div className="section-title reveal">
            <p className="section-label">TIMELINE</p>
            <h2 id="experience-title">
              The longer <em>story.</em>
            </h2>
            <a
              className="inline-link"
              href="https://www.linkedin.com/in/thanapatpirmphol/"
              target="_blank"
              rel="noreferrer"
            >
              Full experience on LinkedIn <Icon name="external" />
            </a>
          </div>
          <ol className="timeline">
            {experience.map(([period, role, company]) => (
              <li className="timeline-row reveal" key={period}>
                <span>{period}</span>
                <h3>{company}</h3>
                <p>{role}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="contact"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="contact-card reveal" onPointerMove={spotlight}>
            <p className="section-label">CONTINUE THE CONVERSATION</p>
            <h2 id="contact-title">
              What are you
              <br />
              <em>working on?</em>
            </h2>
            <p>
              I’m always interested in the problems behind the technology.
              Software architecture, blockchain, AI, and engineering leadership —
              or simply a good photograph or a good game.
            </p>
            <div className="hero-actions">
              <a
                className="button button-primary"
                href="https://www.linkedin.com/in/thanapatpirmphol/"
                target="_blank"
                rel="noreferrer"
              >
                Say hello on LinkedIn <Icon name="external" />
              </a>
              <a
                className="button"
                href="https://www.github.com/oadtz"
                target="_blank"
                rel="noreferrer"
              >
                GitHub <Icon name="external" />
              </a>
            </div>
            <StandingAvatar paused={reducedMotion} />
          </div>
        </section>
      </main>
      <footer>
        <a className="wordmark" href="#top">
          oadtz<span>.</span>
        </a>
        <span>© {new Date().getFullYear()} Thanapat Pirmphol</span>
        <a href="/flappybird/">
          <Icon name="gamepad" /> One more round? <Icon name="external" />
        </a>
      </footer>
    </>
  );
}
