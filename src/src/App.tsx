import { lazy, Suspense, useEffect, useState } from 'react';

const ThreeInfrastructureScene = lazy(() => import('./components/ThreeInfrastructureScene'));

const buildPillars = [
  {
    title: 'Trusted Markets',
    body: 'Digital rails for water accounting, trading, auditability, and stewardship where confidence in the record matters.',
  },
  {
    title: 'Blockchain Infrastructure',
    body: 'Practical distributed-ledger systems designed for regulated workflows, public trust, and operational reliability.',
  },
  {
    title: 'AI-Native Engineering',
    body: 'Agentic AI workflows, spec-driven delivery, and tool-using systems that improve execution without losing engineering accountability.',
  },
];

const projects = [
  {
    name: 'Water Ledger',
    role: 'Chief Technology Officer',
    signal: 'Water markets, accounting, and transparent stewardship',
    url: 'https://www.waterledger.com',
    description:
      'Leading technology strategy for platforms that turn water rights, status, and market activity into auditable digital infrastructure.',
  },
  {
    name: 'TapIn',
    role: 'Creator',
    signal: 'Community water condition reporting',
    url: 'https://play.google.com/store/apps/details?id=com.waterledger.tapin&hl=en_US&pli=1',
    description:
      'A mobile-first way for communities to report and monitor leaks, spills, and water conditions on a live operational map.',
  },
  {
    name: 'Civic Ledger',
    role: 'Senior Software / Blockchain Engineer',
    signal: 'Public-sector blockchain systems',
    url: 'https://www.civicledger.com/home',
    description:
      'Built secure blockchain and full-stack systems for real-world regulated use cases where transparency and governance are core requirements.',
  },
  {
    name: 'Enterprise Platforms',
    role: 'Engineering Leader',
    signal: 'Aviation, insurance, data, and consulting systems',
    url: 'https://www.linkedin.com/in/thanapatpirmphol/',
    description:
      'More than two decades delivering enterprise software, BI systems, integrations, architecture, and engineering leadership across complex organizations.',
  },
];

const experience = [
  ['2024 - Present', 'Chief Technology Officer', 'Water Ledger Global'],
  ['2022 - 2024', 'Senior Software / Blockchain Engineer', 'Civic Ledger'],
  ['2020 - 2022', 'Lead Software Engineer', '4-ti Co. Ltd.'],
  ['2020', 'Senior Manager, Business Transformation & IS', 'Aetna, a CVS Health Company'],
  ['2019 - 2020', 'IT Business Consultant', 'Adastra Thailand'],
  ['2002 - 2018', 'Engineering and Application Leadership', 'Unilode, ExxonMobil, Softscape, Progress Information'],
];

const quickFacts = [
  ['Current role', 'Chief Technology Officer at Water Ledger Global'],
  ['Core positioning', 'CTO, blockchain engineer, and product-minded builder for trusted digital infrastructure'],
  ['Focus areas', 'Water markets, blockchain infrastructure, regulated systems, technical leadership, and agentic AI delivery'],
  ['Experience base', '20+ years across enterprise software, aviation, insurance, data platforms, public-sector blockchain, and water infrastructure'],
];

const skills = [
  'Blockchain architecture',
  'Smart contracts',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Cloud platforms',
  'DevOps',
  'Data systems',
  'Agentic AI',
  'AI agents',
  'LLM tool use',
  'Spec-driven AI workflows',
  'Team leadership',
  'Stakeholder translation',
];

const systemNodes = ['Water', 'Markets', 'Ledger', 'AI Delivery', 'Leadership'];

function useScrollEffects() {
  useEffect(() => {
    const root = document.documentElement;
    let ticking = false;

    const updateScrollVars = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
      root.style.setProperty('--scroll-y', scrollY.toFixed(2));
      root.style.setProperty('--scroll-ratio', Math.min(scrollY / maxScroll, 1).toFixed(4));
      root.style.setProperty('--parallax-bg', `${(scrollY * 0.08).toFixed(2)}px`);
      root.style.setProperty('--parallax-copy', `${(scrollY * 0.028).toFixed(2)}px`);
      root.style.setProperty('--parallax-panel', `${(scrollY * -0.022).toFixed(2)}px`);
      root.style.setProperty('--parallax-band', `${(scrollY * -0.035).toFixed(2)}px`);
      root.style.setProperty('--parallax-scale', (1 + Math.min(scrollY / maxScroll, 1) * 0.025).toFixed(4));
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollVars);
        ticking = true;
      }
    };

    const revealTargets = document.querySelectorAll(
      '.section, .pillar-card, .work-row, .fact-row, .timeline-row, .skill-cloud span',
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    );

    document.body.classList.add('parallax-ready');
    revealTargets.forEach((target) => observer.observe(target));
    updateScrollVars();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      observer.disconnect();
      document.body.classList.remove('parallax-ready');
    };
  }, []);
}

function App() {
  const [activeNode, setActiveNode] = useState('Water');
  const [sceneReady, setSceneReady] = useState(false);
  useScrollEffects();

  useEffect(() => {
    const canLoadScene = window.matchMedia('(min-width: 700px)').matches;
    if (!canLoadScene) return undefined;

    const handle = window.setTimeout(() => setSceneReady(true), 900);
    return () => window.clearTimeout(handle);
  }, []);

  return (
    <main>
      <section className="hero" id="top">
        {sceneReady ? (
          <Suspense fallback={<div className="three-scene three-scene-fallback" aria-hidden="true" />}>
            <ThreeInfrastructureScene activeNode={activeNode} />
          </Suspense>
        ) : (
          <div className="three-scene three-scene-fallback" aria-hidden="true" />
        )}
        <header className="site-header" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="Thanapat Pirmphol home">
            Thanapat Pirmphol
          </a>
          <nav>
            <a href="#work">Work</a>
            <a href="#leadership">Leadership</a>
            <a href="#experience">Experience</a>
            <a href="#contact">Contact</a>
          </nav>
        </header>

        <div className="hero-content">
          <div className="hero-copy">
            <h1>Building trusted digital infrastructure for regulated markets and sustainable systems.</h1>
            <p>
              CTO, blockchain engineer, and product-minded builder with 20+ years of experience turning complex ideas
              into secure, auditable platforms for real-world operations.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#work">Explore Work</a>
            </div>
            <p className="hero-proof">
              CTO, Water Ledger Global · Former Senior Software / Blockchain Engineer, Civic Ledger
            </p>
          </div>

          <aside className="system-panel" aria-label="Interactive expertise map">
            <div className="panel-header">
              <span>Live System Map</span>
              <span>Trust Layer</span>
            </div>
            <div className="node-list">
              {systemNodes.map((node) => (
                <button
                  className={activeNode === node ? 'node active' : 'node'}
                  key={node}
                  onClick={() => setActiveNode(node)}
                >
                  <span>{node}</span>
                </button>
              ))}
            </div>
            <p>
              {activeNode === 'Water' && 'Water data becomes accountable infrastructure for stewardship and allocation decisions.'}
              {activeNode === 'Markets' && 'Market workflows need transparent records, clear state, and practical user trust.'}
              {activeNode === 'Ledger' && 'Distributed ledgers are useful when auditability and shared truth solve a real coordination problem.'}
              {activeNode === 'AI Delivery' && 'Agentic AI works best when tools, specs, review loops, and accountability stay explicit.'}
              {activeNode === 'Leadership' && 'Strong engineering leadership translates complexity into decisions, teams, and shipped systems.'}
            </p>
          </aside>
        </div>
      </section>

      <section className="section intro" aria-label="Personal positioning">
        <div className="section-grid">
          <div>
            <h2>I work where software becomes infrastructure.</h2>
          </div>
          <div className="intro-copy">
            <p>
              My work sits at the intersection of blockchain systems, sustainable resource management, enterprise
              platforms, and engineering leadership. My current focus is water markets, accounting, and stewardship
              through Water Ledger, but the broader pattern is building systems where trust, governance, compliance,
              reliability, and adoption matter.
            </p>
            <p>
              The goal is not to make systems sound advanced. The goal is to make complex systems understandable,
              usable, and dependable enough for people to build decisions on top of them.
            </p>
          </div>
        </div>
      </section>

      <section className="section pillars" aria-labelledby="what-i-build">
        <div className="section-heading">
          <h2 id="what-i-build">What I Build</h2>
          <p>Three themes connect my current work and the path that led here.</p>
        </div>
        <div className="pillar-grid">
          {buildPillars.map((pillar, index) => (
            <article className="pillar-card" key={pillar.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section quick-facts" aria-labelledby="quick-facts-heading">
        <div className="section-heading">
          <h2 id="quick-facts-heading">Quick Facts</h2>
          <p>Plain answers for people, search engines, and AI assistants evaluating the profile.</p>
        </div>
        <dl className="fact-list">
          {quickFacts.map(([label, value]) => (
            <div className="fact-row" key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="section work" id="work" aria-labelledby="selected-work">
        <div className="section-heading">
          <h2 id="selected-work">Selected Work</h2>
          <p>Case-study entry points for the systems, products, and leadership story behind the brand.</p>
        </div>
        <div className="work-list">
          {projects.map((project) => (
            <a className="work-row" href={project.url} target="_blank" rel="noreferrer" key={project.name}>
              <div>
                <h3>{project.name}</h3>
                <span>{project.role}</span>
              </div>
              <p>{project.signal}</p>
              <p>{project.description}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="section leadership" id="leadership" aria-labelledby="leadership-heading">
        <div className="section-grid">
          <div>
            <h2 id="leadership-heading">Technical leadership with product reality.</h2>
          </div>
          <div className="leadership-stack">
            <p>
              I work best where the problem is still forming: translating market, product, and technical uncertainty
              into architecture, teams, and shipped platforms. I bring the hands-on depth of an engineer, the operating
              judgment of a CTO, and the builder instinct needed to move from idea to adoption.
            </p>
            <div className="principles">
              <span>Accountable architecture</span>
              <span>Practical blockchain</span>
              <span>Spec-driven delivery</span>
              <span>Balanced systems thinking</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section experience" id="experience" aria-labelledby="experience-heading">
        <div className="section-heading">
          <h2 id="experience-heading">Experience</h2>
          <p>A long engineering arc, with recent focus on water, markets, blockchain, and agentic AI delivery.</p>
        </div>
        <div className="timeline">
          {experience.map(([period, role, company]) => (
            <div className="timeline-row" key={`${period}-${role}`}>
              <span>{period}</span>
              <strong>{role}</strong>
              <p>{company}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section skills" aria-labelledby="skills-heading">
        <div className="section-heading">
          <h2 id="skills-heading">Skills</h2>
          <p>A practical toolkit across architecture, agentic AI, delivery, product, and engineering systems.</p>
        </div>
        <div className="skill-cloud">
          {skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </section>

      <section className="section contact" id="contact" aria-labelledby="contact-heading">
        <div className="contact-copy">
          <h2 id="contact-heading">Build systems people can trust.</h2>
          <p>
            For water infrastructure, blockchain platforms, agentic AI engineering workflows, or technology leadership
            conversations, connect through the professional channels below.
          </p>
        </div>
        <div className="contact-profile">
          <img className="contact-photo" src="/profile.jpg" alt="Thanapat Pirmphol" loading="lazy" />
          <div className="contact-actions">
            <a className="button primary" href="https://www.linkedin.com/in/thanapatpirmphol/" target="_blank" rel="noreferrer">LinkedIn</a>
            <a className="button secondary" href="https://www.github.com/oadtz" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </section>

      <footer>
        <span>Thanapat Pirmphol</span>
        <span className="footer-meta">
          <span>© 2026</span>
          <a className="arcade-easter-egg" href="/flappybird/" aria-label="Open arcade archive" title="Arcade archive">
            <span className="arcade-bird" aria-hidden="true">
              <span className="arcade-bird-eye" />
              <span className="arcade-bird-wing" />
            </span>
          </a>
        </span>
      </footer>
    </main>
  );
}

export default App;
