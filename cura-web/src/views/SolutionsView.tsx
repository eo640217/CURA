import { Link } from "react-router-dom";
import "./SolutionsView.scss";

type Solution = {
  icon: string;
  color: "blue" | "green" | "amber" | "red" | "purple";
  title: string;
  description: string;
  bullets: string[];
};

const SOLUTIONS: Solution[] = [
  {
    icon: "ti-users",
    color: "blue",
    title: "Resident management",
    description:
      "Complete resident profiles with medical history, care plans, medication logs, and family contacts — all in one place, accessible to the right staff instantly.",
    bullets: [
      "Digital resident profiles",
      "Medical history & allergies",
      "Family contact directory",
      "Document & consent storage",
    ],
  },
  {
    icon: "ti-clipboard-list",
    color: "green",
    title: "Care plan tracking",
    description:
      "Create, assign, and review care plans with goal checklists, review schedules, and compliance audit trails that keep every plan current and defensible.",
    bullets: [
      "Goal checklists & progress tracking",
      "Scheduled plan reviews & reminders",
      "Version history & audit trail",
      "Assignable per resident or keyworker",
    ],
  },
  {
    icon: "ti-calendar-event",
    color: "amber",
    title: "Staff scheduling",
    description:
      "Weekly shift scheduling with coverage indicators, leave management, and automatic gap detection across all wings — so shifts are never left uncovered.",
    bullets: [
      "Drag-and-drop weekly rota",
      "Coverage gap detection",
      "Leave & absence tracking",
      "Cross-facility shift visibility",
    ],
  },
  {
    icon: "ti-alert-triangle",
    color: "red",
    title: "Incident reporting",
    description:
      "Log, track, and resolve incidents with a full audit timeline — from initial report through to closure and review, ready for CQC inspection.",
    bullets: [
      "Structured incident forms",
      "Status timeline from report to closure",
      "Root-cause & follow-up notes",
      "Exportable incident history",
    ],
  },
  {
    icon: "ti-pill",
    color: "purple",
    title: "Medication management",
    description:
      "Medication rounds, missed dose alerts, and administration logs — with real-time notifications when action is needed, reducing missed-dose risk.",
    bullets: [
      "Round-by-round administration logs",
      "Missed dose alerts",
      "PRN and controlled drug tracking",
      "Pharmacy-ready medication history",
    ],
  },
  {
    icon: "ti-chart-bar",
    color: "green",
    title: "Compliance & reporting",
    description:
      "CQC-ready reports generated automatically. Stay audit-ready without the last-minute scramble, with data pulled directly from daily operations.",
    bullets: [
      "One-click CQC report export",
      "Occupancy & operational dashboards",
      "Multi-facility compliance rollups",
      "Historical reporting archive",
    ],
  },
];

export default function SolutionsView() {
  return (
    <>
      <section className="pageHero">
        <div className="pageHero__inner">
          <p className="homeSectionEyebrow homeSectionEyebrow--centred">Solutions</p>
          <h1 className="homeSectionH2 homeSectionH2--centred">
            One platform for every part of <em>care home</em> operations
          </h1>
          <p className="homeSectionSub homeSectionSub--centred">
            From resident intake to CQC reporting, CURA replaces spreadsheets and paper forms
            with one connected system.
          </p>
        </div>
      </section>

      <section className="solStats">
        <div className="solStats__inner">
          <div className="solStats__item">
            <span className="solStats__value">2k+</span>
            <span className="solStats__label">Residents managed on CURA</span>
          </div>
          <div className="solStats__item">
            <span className="solStats__value">98%</span>
            <span className="solStats__label">Customer satisfaction score</span>
          </div>
          <div className="solStats__item">
            <span className="solStats__value">40%</span>
            <span className="solStats__label">Reduction in admin time</span>
          </div>
          <div className="solStats__item">
            <span className="solStats__value">120+</span>
            <span className="solStats__label">Care homes using CURA today</span>
          </div>
        </div>
      </section>

      <section className="solRows">
        {SOLUTIONS.map((sol, i) => (
          <div
            key={sol.title}
            className={`solRow${i % 2 === 1 ? " solRow--reverse" : ""}`}
          >
            <div className="solRow__visual">
              <div className={`solRow__iconBox solRow__iconBox--${sol.color}`}>
                <i className={`ti ${sol.icon}`} />
              </div>
            </div>
            <div className="solRow__content">
              <h2 className="solRow__title">{sol.title}</h2>
              <p className="solRow__desc">{sol.description}</p>
              <ul className="solRow__bullets">
                {sol.bullets.map((b) => (
                  <li key={b}>
                    <i className="ti ti-check" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      <section className="homeContact">
        <div className="homeContact__inner">
          <h2 className="homeContact__h2">
            See it in <em>action</em>
          </h2>
          <p className="homeContact__sub">
            Book a walkthrough with our team or start a free trial to explore every feature
            yourself.
          </p>
          <div className="homeContact__ctas">
            <Link to="/login" className="homeBtn homeBtn--ctaWhite">
              Start free trial
            </Link>
            <Link to="/contact" className="homeBtn homeBtn--ctaGhost">
              See it in action
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
