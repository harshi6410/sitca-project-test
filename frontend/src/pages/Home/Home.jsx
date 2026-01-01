import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

import "./Home.css";

// Asset imports
import logo from "../../assets/sitca_logo.png";
import heroStadium from "../../assets/hero_stadium.jpg";
import aboutCricketer from "../../assets/about_cricketer.png";
import gallery1 from "../../assets/gallery1.jpg";
import gallery2 from "../../assets/gallery2.jpg";
import gallery3 from "../../assets/gallery3.jpg";
import tournamentImg from "../../assets/tournament.jpg";

// Constants
const FEATURES = [
  { id: 1, title: "Pro Tournaments", desc: "Organised T10 events with fixtures & rankings.", icon: "🏆" },
  { id: 2, title: "Player Development", desc: "Coaching, scouting & analytics.", icon: "🎯" },
  { id: 3, title: "Team Registration", desc: "Manage squads, fixtures & rosters easily.", icon: "📝" },
  { id: 4, title: "Talent Promotion", desc: "Showcase players & route to bigger leagues.", icon: "🚀" },
];

const STATS = [
  { id: 1, label: "Players", value: 1200 },
  { id: 2, label: "Matches", value: 250 },
  { id: 3, label: "Teams", value: 48 },
  { id: 4, label: "Districts", value: 10 },
];

export default function Home() {
  // State variables
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Tournament countdown state
  const tournamentDate = new Date();
  tournamentDate.setDate(tournamentDate.getDate() + 18); // Example: 18 days from now
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft());

  // Stats counters state
  const [counters, setCounters] = useState(STATS.map(() => 0));

  useEffect(() => {
    // scroll listener
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      const sections = document.querySelectorAll("section");
      let current = "home";
      sections.forEach((s) => {
        const top = s.offsetTop - 120;
        if (window.scrollY >= top) current = s.getAttribute("id");
      });
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // countdown timer
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft());
    }, 1000);

    // animate counters once
    const counterInterval = setInterval(() => {
      setCounters((prev) =>
        prev.map((v, i) => {
          const target = STATS[i].value;
          if (v < target) {
            const delta = Math.ceil(target / 80);
            return Math.min(v + delta, target);
          }
          return v;
        })
      );
    }, 35);

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearInterval(timer);
      clearInterval(counterInterval);
    };
  }, []);

  function calcTimeLeft() {
    const now = new Date();
    const diff = tournamentDate - now;
    if (diff <= 0) return { days: 0, hrs: 0, mins: 0, secs: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    return { days, hrs, mins, secs };
  }

  const toggleDrawer = () => setDrawerOpen((s) => !s);
  const closeDrawer = () => setDrawerOpen(false);

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="home-wrapper">
      {/* floating register button */}
      <a href="/signup" className="floating-register" aria-label="Register">
        <span className="ball" />
        Register
      </a>

      {/* NAVBAR */}
      <Navbar expand="lg" fixed="top" className={`custom-navbar ${scrolled ? "scrolled" : ""}`}>
        <Container>
          {/* Logo */}
          <Navbar.Brand href="#home" className="brand">
            <img src={logo} alt="SITCA" className="logo" />
          </Navbar.Brand>

          {/* Mobile Hamburger */}
          <button className="hamburger" onClick={toggleDrawer} aria-label="Menu">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </g>
            </svg>
          </button>

          {/* Desktop Navigation */}
          <Navbar.Collapse id="navbarNav" className="justify-content-end desktop-nav">
            <Nav>

              <Nav.Link
                href="#home"
                onClick={(e) => { e.preventDefault(); document.querySelector("#home").scrollIntoView({ behavior: "smooth" }); }}
                className={activeSection === "home" ? "active" : ""}
              >
                Home
              </Nav.Link>

              <Nav.Link
                href="#features"
                onClick={(e) => { e.preventDefault(); document.querySelector("#features").scrollIntoView({ behavior: "smooth" }); }}
                className={activeSection === "features" ? "active" : ""}
              >
                Features
              </Nav.Link>

              <Nav.Link
                href="#gallery"
                onClick={(e) => { e.preventDefault(); document.querySelector("#gallery").scrollIntoView({ behavior: "smooth" }); }}
                className={activeSection === "gallery" ? "active" : ""}
              >
                Gallery
              </Nav.Link>

              <Nav.Link
                href="#about"
                onClick={(e) => { e.preventDefault(); document.querySelector("#about").scrollIntoView({ behavior: "smooth" }); }}
                className={activeSection === "about" ? "active" : ""}
              >
                About
              </Nav.Link>

              <Nav.Link
                href="#contact"
                onClick={(e) => { e.preventDefault(); document.querySelector("#contact").scrollIntoView({ behavior: "smooth" }); }}
                className={activeSection === "contact" ? "active" : ""}
              >
                Contact
              </Nav.Link>

              {/* Signup Button */}
              <Nav.Link as={Link} to="/SitcaForm">
                <button className="signup-btn">Register</button>
              </Nav.Link>

              {/* Login Text Link (with underline hover) */}
              <Nav.Link as={Link} to="/login" className="nav-login">
                Admin Login
              </Nav.Link>

            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {/* Side Drawer (mobile) */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.aside
            className="side-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.32 }}
          >
            <button className="drawer-close" onClick={closeDrawer} aria-label="Close">✕</button>
            <nav className="drawer-nav">
              <a href="#home" onClick={(e) => { e.preventDefault(); closeDrawer(); document.querySelector("#home").scrollIntoView({ behavior: "smooth" }); }}>Home</a>
              <a href="#features" onClick={(e) => { e.preventDefault(); closeDrawer(); document.querySelector("#features").scrollIntoView({ behavior: "smooth" }); }}>Features</a>
              <a href="#gallery" onClick={(e) => { e.preventDefault(); closeDrawer(); document.querySelector("#gallery").scrollIntoView({ behavior: "smooth" }); }}>Gallery</a>
              <a href="#about" onClick={(e) => { e.preventDefault(); closeDrawer(); document.querySelector("#about").scrollIntoView({ behavior: "smooth" }); }}>About</a>
              <a href="#contact" onClick={(e) => { e.preventDefault(); closeDrawer(); document.querySelector("#contact").scrollIntoView({ behavior: "smooth" }); }}>Contact</a>
              <Link to="/SitcaForm" className="drawer-register" onClick={() => closeDrawer()}>Register</Link>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* HIGHLIGHT STRIP */}
      <section className="highlight-strip">
        <div className="marquee">
          <div className="marquee-inner">
            <span>Official League • T10 Format • Season 2025 • Register Now • Talent Hunt Live</span>
            <span>Official League • T10 Format • Season 2025 • Register Now • Talent Hunt Live</span>
          </div>
        </div>
      </section>

      {/* HERO */}
      <section id="home" className="hero-section" style={{ backgroundImage: `url(${heroStadium})` }}>
        <div className="hero-overlay" />
        <div className="hero-inner container-lg">
          <motion.h1 className="hero-title" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
            South India T10 Cricket Association
          </motion.h1>

          <motion.p className="hero-sub" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9 }}>
            Where Passion Meets Perfection in Every Over
          </motion.p>

          <motion.div className="hero-cta" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, delay: 0.2 }}>
            <Link to="/SitcaForm" className="btn cta-btn">Join a Team</Link>
            <a href="#features" onClick={(e) => { e.preventDefault(); document.querySelector("#features").scrollIntoView({ behavior: "smooth" }); }} className="btn cta-outline ms-3">See Features</a>
          </motion.div>
        </div>
        {/* animated cricket ball (decor) */}
        <motion.div className="cricket-ball" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
          <svg width="36" height="36" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="#d90429" strokeWidth="1.6"/><path d="M6 6 L10 10 M14 14 L18 18 M6 18 L10 14 M14 10 L18 6" stroke="#d90429" strokeWidth="1.2" strokeLinecap="round"/></svg>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section id="features" className="features-section">
        <Container>
          <motion.div className="section-head" initial={{ y: 12, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
            <h2>League Features</h2>
            <p className="muted">Built for players, teams and organisers.</p>
          </motion.div>

          <div className="cards-grid">
            {FEATURES.map((f, i) => (
              <motion.article key={f.id} className="feature-card" variants={featureVariants} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                <div className="card-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <a className="learn-link" href="#contact" onClick={(e) => { e.preventDefault(); document.querySelector("#contact").scrollIntoView({ behavior: "smooth" }); }}>Learn more →</a>
              </motion.article>
            ))}
          </div>
        </Container>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="gallery-section">
        <Container>
          <motion.h2 className="section-head" initial={{ y: 12, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
            Match Gallery
            <p className="muted">Moments from previous seasons</p>
          </motion.h2>
          <div className="gallery-grid">
            {[gallery1, gallery2, gallery3, gallery2, gallery1, gallery3].map((img, idx) => (
              <motion.div key={idx} className="gallery-item" initial={{ scale: 0.97, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: idx * 0.08 }}>
                <img src={img} alt={`gallery-${idx}`} />
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* UPCOMING TOURNAMENT */}
      <section id="tournament" className="tournament-section">
        <Container className="tourney-inner">
          <div className="tourney-left">
            <motion.h2 initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }}>Upcoming Tournament</motion.h2>
            <p className="muted">South India T10 - Season 2025</p>
            <p>Join the action. Short-format cricket with intense competition across districts. Schedule, venues and squad registrations open now.</p>

            <div className="countdown">
              <div><strong>{timeLeft.days}</strong><span>Days</span></div>
              <div><strong>{timeLeft.hrs}</strong><span>Hrs</span></div>
              <div><strong>{timeLeft.mins}</strong><span>Mins</span></div>
              <div><strong>{timeLeft.secs}</strong><span>Secs</span></div>
            </div>

            <div className="tourney-cta">
              <a href="/register" className="btn cta-btn">Register Team</a>
              <a href="#contact" onClick={(e)=>{ e.preventDefault(); document.querySelector("#contact").scrollIntoView({ behavior: "smooth" });}} className="btn cta-outline ms-3">Contact Us</a>
            </div>
          </div>

          <motion.div className="tourney-right" initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }}>
            <img src={tournamentImg} alt="tournament" />
          </motion.div>
        </Container>
      </section>

      {/* STATS */}
      <section className="stats-section">
        <Container>
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <motion.div key={s.id} className="stat-card" initial={{ y: 12, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.12 }}>
                <h3>{counters[i]}</h3>
                <p className="muted">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ABOUT */}
      <section id="about" className="about-section">
        <div className="about-bg" style={{ backgroundImage: `url(${aboutCricketer})` }} />
        <div className="about-overlay" />
        <Container className="about-inner">
          <motion.div className="about-left" initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }}>
            <h2>About the Association</h2>
            <p>South India T10 Cricket Association (SITCA) — a non-profit dedicated to promoting T10 cricket in South India. We run tournaments, coaching camps and provide a platform for emerging talent.</p>
            <ul className="objective-list">
              <li>Promote & develop T10 cricket</li>
              <li>Organize tournaments & coaching</li>
              <li>Encourage sportsmanship & teamwork</li>
            </ul>
          </motion.div>

          <motion.div className="about-right" initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }}>
            <div className="about-card">
              <h4>Executive Committee</h4>
              <ul>
                <li><strong>President:</strong> George Stephen</li>
                <li><strong>Secretary:</strong> Aravinthan</li>
                <li><strong>Treasurer:</strong> Dhanush Kumar</li>
              </ul>
              <Link to="/register" className="btn small ms-0 mt-3">Register Now</Link>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* EXECUTIVE COMMITTEE SECTION */}
      <section id="committee" className="committee-section">
        <Container>
          <motion.div
            className="committee-header"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="committee-title">Executive Committee</h2>
            <p className="committee-sub">Leadership of South India T10 Cricket Association</p>
            <div className="committee-underline"></div>
          </motion.div>

          <motion.div
            className="committee-table-wrapper"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <table className="committee-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>District</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>1</td><td className="highlight-name">George Stephen</td><td>President</td><td>Coimbatore</td></tr>
                <tr><td>2</td><td className="highlight-name">Aravinthan</td><td>Secretary</td><td>Coimbatore</td></tr>
                <tr><td>3</td><td className="highlight-name">Dhanush Kumar</td><td>Treasurer</td><td>Coimbatore</td></tr>
                <tr><td>4</td><td className="highlight-name">Dilip Kumar</td><td>Member</td><td>Coimbatore</td></tr>
                <tr><td>5</td><td className="highlight-name">Sridevi</td><td>Member</td><td>Coimbatore</td></tr>
                <tr><td>6</td><td className="highlight-name">Vijesh</td><td>Member</td><td>Coimbatore</td></tr>
                <tr><td>7</td><td className="highlight-name">Ranjith</td><td>Member</td><td>Coimbatore</td></tr>
              </tbody>
            </table>
          </motion.div>
        </Container>
      </section>
      {/* CONTACT */}
      <section id="contact" className="contact-section">
        <Container className="text-center">
          <motion.h3 initial={{ y: 12, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
            Get in touch
          </motion.h3>
          <p className="muted">Email: info@sitca.com · Address: R.S. Puram, Coimbatore</p>
          <div className="contact-actions mt-3">
            <a href="mailto:info@sitca.com" className="btn contact-btn">Email Us</a>
            <a href="#register" className="btn contact-outline ms-3">Register</a>
          </div>
        </Container>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <Container className="d-flex justify-content-between align-items-center">
          <div>© {new Date().getFullYear()} South India T10 Cricket Association</div>
          <div className="small muted">Designed with ❤️</div>
        </Container>
      </footer>

    </div>
  );
}
