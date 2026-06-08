import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const routeCards = [
  { title: 'Daily Sales', detail: 'Record bottle deliveries, returns, and payments in one clean flow.' },
  { title: 'Customer Ledger', detail: 'Find customers by name or phone and keep every order easy to trace.' },
  { title: 'Monthly Analytics', detail: 'Watch revenue, bottle movement, and outstanding balances at a glance.' },
];

function Landing() {
  const [progress, setProgress] = React.useState(0);
  const landingVars = {
    '--spill-percent': `${progress * 100}%`,
    '--stream-height': `${120 + (progress * 360)}px`,
    '--pool-scale': 0.64 + (progress * 0.42),
    '--pool-opacity': 0.45 + (progress * 0.45),
    '--card-one-offset': `${(1 - progress) * -28}px`,
    '--card-two-offset': `${(1 - progress) * 28}px`,
    '--panel-drift': `${(0.45 - progress) * 40}px`,
  };

  React.useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll('.landing-forms-on-scroll'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-formed');
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="himalaya-landing" style={landingVars}>
      <nav className="landing-nav">
        <Link className="landing-brand" to="/">
          <span className="landing-brand-mark">HS</span>
          Himaliya Springs
        </Link>
        <div className="landing-nav-actions">
          <a href="#flow">Flow</a>
          <a href="#operations">Operations</a>
          <Link className="landing-nav-button" to="/login">Sign In</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-copy landing-forms-on-scroll">
          <span className="hero-kicker">Water delivery admin system</span>
          <h1>Run Himaliya Springs like a calm, fast-moving control room.</h1>
          <p>
            Manage customers, daily sales, bottles, balances, and monthly performance from a focused dashboard built
            for everyday operators.
          </p>
          <div className="hero-actions">
            <Link className="hero-primary" to="/login">Sign in to dashboard</Link>
            <a className="hero-secondary" href="#flow">Watch the flow</a>
          </div>
        </div>

        <div className="bottle-stage landing-forms-on-scroll" aria-hidden="true">
          <div className="bottle">
            <div className="bottle-cap" />
            <div className="bottle-neck" />
            <div className="bottle-body">
              <span />
            </div>
          </div>
          <div className="water-drop drop-one" />
          <div className="water-drop drop-two" />
          <div className="water-stream" />
          <div className="water-pool" />
          <div className="metric-card card-one">
            <strong>124</strong>
            <span>customers served</span>
          </div>
          <div className="metric-card card-two">
            <strong>Rs 86k</strong>
            <span>monthly sales</span>
          </div>
        </div>
      </section>

      <section id="flow" className="scroll-story">
        <div className="story-rail">
          <div className="story-water" />
        </div>
        <div className="story-panels">
          <article className="landing-forms-on-scroll">
            <span>01</span>
            <h2>Scroll the bottle open</h2>
            <p>The water stream follows your scroll, like a lightweight video reveal without loading a heavy video.</p>
          </article>
          <article className="landing-forms-on-scroll">
            <span>02</span>
            <h2>Cards drift into place</h2>
            <p>Operational blocks slide in as the flow moves down, keeping the landing page alive and clear.</p>
          </article>
          <article className="landing-forms-on-scroll">
            <span>03</span>
            <h2>Enter the dashboard</h2>
            <p>The landing page ends with a direct handoff to the sign-in and admin workspace.</p>
          </article>
        </div>
      </section>

      <section id="operations" className="operations-section">
        <div className="section-heading landing-forms-on-scroll">
          <span>Built for daily work</span>
          <h2>Everything important stays close.</h2>
        </div>
        <div className="operation-grid">
          {routeCards.map((card) => (
            <article className="operation-card landing-forms-on-scroll" key={card.title}>
              <div className="operation-icon" />
              <h3>{card.title}</h3>
              <p>{card.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} Himaliya Springs</span>
        <Link to="/login">Admin sign in</Link>
      </footer>
    </main>
  );
}

export default Landing;
