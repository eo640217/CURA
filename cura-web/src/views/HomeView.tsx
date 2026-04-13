import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./HomeView.scss";

type PackageTier = {
  name: string;
  subtitle: string;
  monthly: string;
  yearly: string;
  features: string[];
};

const PACKAGE_TIERS: PackageTier[] = [
  {
    name: "Cura Essential",
    subtitle: "For single care homes starting digital operations",
    monthly: "$299/mo",
    yearly: "$2,990/yr",
    features: [
      "Resident profiles and care notes",
      "Medication and appointment reminders",
      "Daily occupancy and unit tracking",
      "Email support",
    ],
  },
  {
    name: "Cura Plus",
    subtitle: "For growing teams that need operational visibility",
    monthly: "$699/mo",
    yearly: "$6,990/yr",
    features: [
      "Everything in Essential",
      "Shift and hours oversight",
      "Multi-facility analytics dashboards",
      "Priority support",
    ],
  },
  {
    name: "Cura Enterprise",
    subtitle: "For regional providers with advanced governance needs",
    monthly: "Custom",
    yearly: "Custom",
    features: [
      "Everything in Plus",
      "Advanced permissions and audit exports",
      "Custom onboarding and integrations",
      "Dedicated success manager",
    ],
  },
];

const FAQS = [
  {
    q: "Can residents and employees both sign in?",
    a: "Yes. Cura supports role-based access so residents, staff, and administrators each see tools relevant to them.",
  },
  {
    q: "How long does onboarding take?",
    a: "Most facilities are live in 2 to 4 weeks, including setup, training, and migration support.",
  },
  {
    q: "Do you offer support for multiple sites?",
    a: "Yes. Cura Plus and Enterprise include multi-site operational oversight and centralized reporting.",
  },
];

export default function HomeView() {
  const [billingMode, setBillingMode] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats = useMemo(
    () => [
      { value: "140+", label: "Care homes using Cura" },
      { value: "98%", label: "Staff adoption after 30 days" },
      { value: "24/7", label: "Operational visibility" },
    ],
    []
  );

  return (
    <div className="homePage">
      <header className="homeHero">
        <div className="homeHero__nav">
          <div className="homeHero__brand">CURA</div>
          <div className="homeHero__links">
            <a href="#packages">Packages</a>
            <a href="#contact">Contact</a>
            <Link to="/login" className="ghostBtn">
              Sign in
            </Link>
          </div>
        </div>

        <div className="homeHero__content">
          <p className="homeHero__eyebrow">Modern Care Home Platform</p>
          <h1>Care operations that feel calm, connected, and human.</h1>
          <p>
            Cura helps teams run safer homes, gives residents better daily support,
            and keeps families informed through transparent communication.
          </p>

          <div className="homeHero__ctaRow">
            <Link to="/login" className="primaryBtn">
              Sign in for residents and employees
            </Link>
            <a href="#packages" className="secondaryBtn">
              View packages
            </a>
          </div>
        </div>

        <div className="homeHero__stats">
          {stats.map((s) => (
            <article key={s.label} className="statCard">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </article>
          ))}
        </div>
      </header>

      <main>
        <section className="homeSection homeSection--features">
          <h2>Built for everyday care delivery</h2>
          <div className="featureGrid">
            <article>
              <h3>Resident-centered records</h3>
              <p>Track profiles, notes, and care activities with one shared, structured timeline.</p>
            </article>
            <article>
              <h3>Team coordination</h3>
              <p>Coordinate shifts and handovers while reducing missed updates between teams.</p>
            </article>
            <article>
              <h3>Operational clarity</h3>
              <p>Use live dashboards for occupancy, unit workload, and response performance.</p>
            </article>
          </div>
        </section>

        <section id="packages" className="homeSection homeSection--packages">
          <div className="sectionHeader">
            <h2>Packages</h2>
            <div className="billingToggle" role="tablist" aria-label="Billing mode">
              <button
                type="button"
                className={billingMode === "monthly" ? "isActive" : ""}
                onClick={() => setBillingMode("monthly")}
              >
                Monthly
              </button>
              <button
                type="button"
                className={billingMode === "yearly" ? "isActive" : ""}
                onClick={() => setBillingMode("yearly")}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="packageGrid">
            {PACKAGE_TIERS.map((tier) => (
              <article key={tier.name} className="packageCard">
                <h3>{tier.name}</h3>
                <p>{tier.subtitle}</p>
                <div className="packagePrice">
                  {billingMode === "monthly" ? tier.monthly : tier.yearly}
                </div>
                <ul>
                  {tier.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <Link to="/login" className="tertiaryBtn">
                  Get started
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="homeSection homeSection--faq">
          <h2>Frequently asked questions</h2>
          <div className="faqList">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <article key={faq.q} className={`faqItem ${isOpen ? "isOpen" : ""}`}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq((prev) => (prev === index ? null : index))}
                  >
                    <span>{faq.q}</span>
                    <span>{isOpen ? "-" : "+"}</span>
                  </button>
                  {isOpen && <p>{faq.a}</p>}
                </article>
              );
            })}
          </div>
        </section>

        <section id="contact" className="homeSection homeSection--contact">
          <h2>How to get in touch</h2>
          <p>
            Speak with our care technology specialists to plan your rollout and pick a package that fits your team.
          </p>
          <div className="contactActions">
            <a href="mailto:hello@cura-care.com" className="secondaryBtn">
              hello@cura-care.com
            </a>
            <a href="tel:+18005551234" className="secondaryBtn">
              +1 (800) 555-1234
            </a>
            <Link to="/login" className="primaryBtn">
              Sign in
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}