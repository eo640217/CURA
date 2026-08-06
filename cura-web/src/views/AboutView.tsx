import { Link } from "react-router-dom";
import "./AboutView.scss";

const VALUES = [
  {
    icon: "ti-heart",
    title: "Care comes first",
    description: "Every feature exists to give staff more time with residents, not less.",
  },
  {
    icon: "ti-shield-check",
    title: "Trust by default",
    description: "Compliance and data security are built in, not bolted on after the fact.",
  },
  {
    icon: "ti-bulb",
    title: "Built with operators",
    description: "We build alongside registered managers and care staff, not just for them.",
  },
  {
    icon: "ti-clock",
    title: "Simple, fast, reliable",
    description: "Software that works during a busy shift, not just in a product demo.",
  },
];

const TEAM = [
  { initials: "RK", name: "Rhea Kapoor", role: "Co-founder & CEO", color: "blue" },
  { initials: "DM", name: "Daniel Marsh", role: "Co-founder & CTO", color: "green" },
  { initials: "TO", name: "Temi Oyelaran", role: "Head of Product", color: "purple" },
  { initials: "LB", name: "Lena Brandt", role: "Head of Customer Success", color: "blue" },
  { initials: "JW", name: "Jonah Whitfield", role: "Head of Compliance", color: "green" },
  { initials: "AC", name: "Amara Chukwu", role: "Head of Engineering", color: "purple" },
];

const AWARDS = [
  { emoji: "🏆", year: "2025", name: "Best Care Technology Platform", org: "Care Tech Awards UK" },
  { emoji: "🥇", year: "2025", name: "Most Innovative Health SaaS", org: "Digital Health 100" },
  { emoji: "⭐", year: "2024", name: "Recommended Supplier", org: "NHS Procurement Framework" },
  { emoji: "🔒", year: "2024", name: "ISO 27001 Certified", org: "Data Security Standard" },
];

export default function AboutView() {
  return (
    <>
      <section className="pageHero">
        <div className="pageHero__inner">
          <p className="homeSectionEyebrow homeSectionEyebrow--centred">About</p>
          <h1 className="homeSectionH2 homeSectionH2--centred">
            Software built by people who <em>understand</em> care
          </h1>
          <p className="homeSectionSub homeSectionSub--centred">
            CURA exists to give care home operators the same operational clarity that other
            industries have had for years.
          </p>
        </div>
      </section>

      <section className="aboutStory">
        <div className="aboutStory__inner">
          <p>
            CURA started after our founders spent a year shadowing care home managers who were
            running 24/7 operations on paper logs, whiteboards, and a patchwork of spreadsheets.
            Medication rounds, incident reports, and CQC evidence all lived in different places —
            and pulling it together for an inspection could take days.
          </p>
          <p>
            We built CURA to put resident care, staff scheduling, and compliance reporting in one
            system that works the way a real shift works: fast, mobile-friendly, and built around
            the people actually using it, not just the people buying it.
          </p>
          <p>
            Today CURA supports care homes and multi-site providers who need to trust their data,
            pass inspections with confidence, and give their staff more time back for the work
            that matters most — caring for residents.
          </p>
        </div>
      </section>

      <section className="aboutValues">
        <div className="aboutValues__inner">
          <p className="homeSectionEyebrow homeSectionEyebrow--centred">What we believe</p>
          <h2 className="homeSectionH2 homeSectionH2--centred">
            Principles that guide every <em>release</em>
          </h2>
          <div className="aboutValues__grid">
            {VALUES.map((v) => (
              <div key={v.title} className="aboutValueCard">
                <div className="aboutValueCard__icon">
                  <i className={`ti ${v.icon}`} />
                </div>
                <h3>{v.title}</h3>
                <p>{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="aboutTeam">
        <div className="aboutTeam__inner">
          <p className="homeSectionEyebrow homeSectionEyebrow--centred">Leadership</p>
          <h2 className="homeSectionH2 homeSectionH2--centred">
            The team behind <em>CURA</em>
          </h2>
          <div className="aboutTeam__grid">
            {TEAM.map((m) => (
              <div key={m.name} className="aboutTeamCard">
                <div className={`aboutTeamCard__avatar aboutTeamCard__avatar--${m.color}`}>
                  {m.initials}
                </div>
                <p className="aboutTeamCard__name">{m.name}</p>
                <p className="aboutTeamCard__role">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="aboutAwards">
        <div className="aboutAwards__inner">
          <p className="homeSectionEyebrow homeSectionEyebrow--centred">Recognition</p>
          <h2 className="homeSectionH2 homeSectionH2--centred">
            Built to an <em>award-winning</em> standard
          </h2>
          <div className="aboutAwards__grid">
            {AWARDS.map((a) => (
              <div key={a.name} className="aboutAwardCard">
                <span className="aboutAwardCard__emoji">{a.emoji}</span>
                <span className="aboutAwardCard__year">{a.year}</span>
                <p className="aboutAwardCard__name">{a.name}</p>
                <p className="aboutAwardCard__org">{a.org}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="homeContact">
        <div className="homeContact__inner">
          <h2 className="homeContact__h2">
            Want to bring <em>order</em> to your care home?
          </h2>
          <p className="homeContact__sub">
            Join hundreds of care home operators who&apos;ve simplified their operations with
            CURA.
          </p>
          <div className="homeContact__ctas">
            <Link to="/login" className="homeBtn homeBtn--ctaWhite">
              Start free trial
            </Link>
            <Link to="/contact" className="homeBtn homeBtn--ctaGhost">
              Book a demo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
