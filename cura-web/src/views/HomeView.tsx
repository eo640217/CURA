import { useState } from "react";
import { Link } from "react-router-dom";
import PricingCards from "../components/PricingCards";
import FaqAccordion from "../components/FaqAccordion";
import { FAQS } from "../data/faqs";
import "./HomeView.scss";

const FAQ_TEASER = FAQS.slice(0, 3);

export default function HomeView() {
  const [billingMode, setBillingMode] = useState<"monthly" | "yearly">("monthly");

  return (
    <>
      {/* HERO */}
      <section className="homeHero">
        <div className="homeHero__inner">
          <div className="homeHero__left">
            <p className="homeHero__eyebrow">Care home operations platform</p>
            <h1 className="homeHero__h1">
              Run your care home with <em>clarity</em> and confidence
            </h1>
            <p className="homeHero__sub">
              CURA gives care home operators a single platform to manage residents, staff, care
              plans, and compliance — so your team can focus on what matters most.
            </p>
            <div className="homeHero__ctas">
              <Link to="/login" className="homeBtn homeBtn--primary homeBtn--hero">
                <i className="ti ti-arrow-right" /> Start free trial
              </Link>
              <Link to="/contact" className="homeBtn homeBtn--outline homeBtn--hero">
                <i className="ti ti-calendar" /> Book a demo
              </Link>
            </div>
            <div className="homeHero__trust">
              <span>No credit card required</span>
              <span className="homeHero__trustDot" />
              <span>14-day free trial</span>
              <span className="homeHero__trustDot" />
              <span>Cancel anytime</span>
            </div>
          </div>

          <div className="homeHero__right">
            <div className="homeHero__card">
              <div className="homeHero__browserBar">
                <span className="homeHero__windowDot homeHero__windowDot--red" />
                <span className="homeHero__windowDot homeHero__windowDot--amber" />
                <span className="homeHero__windowDot homeHero__windowDot--green" />
                <div className="homeHero__urlBar">
                  app.cura.health · Maple Grove Care Home
                </div>
              </div>
              <div className="homeHero__appContent">
                <p className="homeHero__greeting">Good morning, Aisha ☀️</p>
                <div className="homeHero__statGrid">
                  <div className="homeHero__miniStat">
                    <span className="homeHero__miniLabel">Residents</span>
                    <span className="homeHero__miniValue">48</span>
                    <span className="homeHero__pill homeHero__pill--green">44 stable</span>
                  </div>
                  <div className="homeHero__miniStat">
                    <span className="homeHero__miniLabel">Alerts</span>
                    <span className="homeHero__miniValue">4</span>
                    <span className="homeHero__pill homeHero__pill--red">1 urgent</span>
                  </div>
                  <div className="homeHero__miniStat">
                    <span className="homeHero__miniLabel">Staff on shift</span>
                    <span className="homeHero__miniValue">12</span>
                    <span className="homeHero__pill homeHero__pill--green">Full cover</span>
                  </div>
                  <div className="homeHero__miniStat">
                    <span className="homeHero__miniLabel">Occupancy</span>
                    <span className="homeHero__miniValue">91%</span>
                    <span className="homeHero__pill homeHero__pill--blue">4 beds free</span>
                  </div>
                </div>
                <div className="homeHero__actionStrip">
                  <p className="homeHero__actionTitle">⏰ Awaiting action</p>
                  <ul className="homeHero__actionList">
                    <li>
                      <span className="homeHero__statusDot homeHero__statusDot--red" />
                      <span className="homeHero__actionText">Medication review — Room 12</span>
                      <span className="homeHero__inlineBadge homeHero__inlineBadge--red">Urgent</span>
                    </li>
                    <li>
                      <span className="homeHero__statusDot homeHero__statusDot--amber" />
                      <span className="homeHero__actionText">Care plan renewal — E. Morris</span>
                      <span className="homeHero__inlineBadge homeHero__inlineBadge--amber">Due today</span>
                    </li>
                    <li>
                      <span className="homeHero__statusDot homeHero__statusDot--blue" />
                      <span className="homeHero__actionText">Incident follow-up — Wing B</span>
                      <span className="homeHero__inlineBadge homeHero__inlineBadge--blue">Review</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="homeHero__floatBadge homeHero__floatBadge--bl">
              <span>📋</span>
              <div>
                <strong>48</strong>
                <small>Active care plans</small>
              </div>
            </div>
            <div className="homeHero__floatBadge homeHero__floatBadge--tr">
              <span>✅</span>
              <div>
                <strong>100%</strong>
                <small>CQC compliant</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGO STRIP */}
      <div className="homeLogoStrip">
        <span className="homeLogoStrip__label">Trusted by</span>
        <span className="homeLogoStrip__name">Sunrise Group</span>
        <span className="homeLogoStrip__name">Oakdale Homes</span>
        <span className="homeLogoStrip__name">Meridian Care</span>
        <span className="homeLogoStrip__name">Ashford Living</span>
        <span className="homeLogoStrip__name">Riverdale NHS Trust</span>
      </div>

      <main>
        {/* FEATURES */}
        <section id="features" className="homeFeatures">
          <div className="homeFeatures__inner">
            <p className="homeSectionEyebrow">Features</p>
            <h2 className="homeSectionH2">
              Built for the <em>real</em> complexity of care
            </h2>
            <p className="homeSectionSub">
              From resident intake to CQC reporting, CURA handles the operational load so your
              staff can spend more time caring.
            </p>
            <div className="homeFeatures__grid">
              <div className="homeFeatureCard">
                <div className="homeFeatureCard__icon homeFeatureCard__icon--blue">
                  <i className="ti ti-users" />
                </div>
                <h3>Resident management</h3>
                <p>
                  Complete resident profiles with medical history, care plans, medication logs,
                  and family contacts — all in one place.
                </p>
              </div>
              <div className="homeFeatureCard">
                <div className="homeFeatureCard__icon homeFeatureCard__icon--green">
                  <i className="ti ti-clipboard-list" />
                </div>
                <h3>Care plan tracking</h3>
                <p>
                  Create, assign, and review care plans with goal checklists, review schedules,
                  and compliance audit trails.
                </p>
              </div>
              <div className="homeFeatureCard">
                <div className="homeFeatureCard__icon homeFeatureCard__icon--amber">
                  <i className="ti ti-calendar-event" />
                </div>
                <h3>Staff scheduling</h3>
                <p>
                  Weekly shift scheduling with coverage indicators, leave management, and
                  automatic gap detection across all wings.
                </p>
              </div>
              <div className="homeFeatureCard">
                <div className="homeFeatureCard__icon homeFeatureCard__icon--red">
                  <i className="ti ti-alert-triangle" />
                </div>
                <h3>Incident reporting</h3>
                <p>
                  Log, track, and resolve incidents with a full audit timeline — from initial
                  report through to closure and review.
                </p>
              </div>
              <div className="homeFeatureCard">
                <div className="homeFeatureCard__icon homeFeatureCard__icon--purple">
                  <i className="ti ti-pill" />
                </div>
                <h3>Medication management</h3>
                <p>
                  Medication rounds, missed dose alerts, and administration logs — with
                  real-time notifications when action is needed.
                </p>
              </div>
              <div className="homeFeatureCard">
                <div className="homeFeatureCard__icon homeFeatureCard__icon--green">
                  <i className="ti ti-chart-bar" />
                </div>
                <h3>Compliance &amp; reporting</h3>
                <p>
                  CQC-ready reports generated automatically. Stay audit-ready without the
                  last-minute scramble.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STATS BAND */}
        <div className="homeStatsBand">
          <div className="homeStatsBand__inner">
            <div className="homeStatsBand__item">
              <span className="homeStatsBand__value">2k+</span>
              <span className="homeStatsBand__label">Residents managed on CURA</span>
            </div>
            <div className="homeStatsBand__item">
              <span className="homeStatsBand__value">98%</span>
              <span className="homeStatsBand__label">Customer satisfaction score</span>
            </div>
            <div className="homeStatsBand__item">
              <span className="homeStatsBand__value">40%</span>
              <span className="homeStatsBand__label">Reduction in admin time</span>
            </div>
            <div className="homeStatsBand__item">
              <span className="homeStatsBand__value">120+</span>
              <span className="homeStatsBand__label">Care homes using CURA today</span>
            </div>
          </div>
        </div>

        {/* TESTIMONIALS */}
        <section className="homeTestimonials">
          <div className="homeTestimonials__inner">
            <p className="homeSectionEyebrow">Testimonials</p>
            <h2 className="homeSectionH2">
              Trusted by care home <em>leaders</em>
            </h2>
            <div className="homeTestimonials__grid">
              <div className="homeTestimonialCard">
                <div className="homeTestimonialCard__stars">★★★★★</div>
                <p className="homeTestimonialCard__quote">
                  "CURA completely changed how we run our morning handovers. Every nurse knows
                  exactly what needs attention before they even start their round."
                </p>
                <div className="homeTestimonialCard__author">
                  <div className="homeTestimonialCard__avatar homeTestimonialCard__avatar--blue">
                    SR
                  </div>
                  <div>
                    <p className="homeTestimonialCard__name">Sandra Reynolds</p>
                    <p className="homeTestimonialCard__role">
                      Operations Director, Sunrise Group
                    </p>
                  </div>
                </div>
              </div>
              <div className="homeTestimonialCard homeTestimonialCard--featured">
                <div className="homeTestimonialCard__stars">★★★★★</div>
                <p className="homeTestimonialCard__quote">
                  "We passed our CQC inspection with flying colours. The auditor specifically
                  commented on how well-organised our care plan records were."
                </p>
                <div className="homeTestimonialCard__author">
                  <div className="homeTestimonialCard__avatar homeTestimonialCard__avatar--green">
                    MO
                  </div>
                  <div>
                    <p className="homeTestimonialCard__name">Michael Osei</p>
                    <p className="homeTestimonialCard__role">
                      Registered Manager, Oakdale Homes
                    </p>
                  </div>
                </div>
              </div>
              <div className="homeTestimonialCard">
                <div className="homeTestimonialCard__stars">★★★★★</div>
                <p className="homeTestimonialCard__quote">
                  "The incident log alone saved us hours each week. What used to be paper forms
                  and chasing signatures is now done in seconds."
                </p>
                <div className="homeTestimonialCard__author">
                  <div className="homeTestimonialCard__avatar homeTestimonialCard__avatar--purple">
                    FN
                  </div>
                  <div>
                    <p className="homeTestimonialCard__name">Fatima Nkosi</p>
                    <p className="homeTestimonialCard__role">Care Manager, Meridian Care</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AWARDS */}
        <section id="awards" className="homeAwards">
          <div className="homeAwards__inner">
            <p className="homeSectionEyebrow">Recognition</p>
            <h2 className="homeSectionH2">
              Built to an <em>award-winning</em> standard
            </h2>
            <div className="homeAwards__grid">
              <div className="homeAwardCard">
                <span className="homeAwardCard__emoji">🏆</span>
                <span className="homeAwardCard__year">2025</span>
                <p className="homeAwardCard__name">Best Care Technology Platform</p>
                <p className="homeAwardCard__org">Care Tech Awards UK</p>
              </div>
              <div className="homeAwardCard">
                <span className="homeAwardCard__emoji">🥇</span>
                <span className="homeAwardCard__year">2025</span>
                <p className="homeAwardCard__name">Most Innovative Health SaaS</p>
                <p className="homeAwardCard__org">Digital Health 100</p>
              </div>
              <div className="homeAwardCard">
                <span className="homeAwardCard__emoji">⭐</span>
                <span className="homeAwardCard__year">2024</span>
                <p className="homeAwardCard__name">Recommended Supplier</p>
                <p className="homeAwardCard__org">NHS Procurement Framework</p>
              </div>
              <div className="homeAwardCard">
                <span className="homeAwardCard__emoji">🔒</span>
                <span className="homeAwardCard__year">2024</span>
                <p className="homeAwardCard__name">ISO 27001 Certified</p>
                <p className="homeAwardCard__org">Data Security Standard</p>
              </div>
            </div>
          </div>
        </section>

        {/* PACKAGES */}
        <section id="packages" className="homePackages">
          <div className="homePackages__inner">
            <p className="homeSectionEyebrow homeSectionEyebrow--centred">Pricing</p>
            <h2 className="homeSectionH2 homeSectionH2--centred">
              One price. No <em>surprises.</em>
            </h2>
            <p className="homeSectionSub homeSectionSub--centred">
              All plans include a 14-day free trial. No credit card required.
            </p>
            <PricingCards billingMode={billingMode} onBillingModeChange={setBillingMode} />
            <p className="homePackages__note">
              All prices exclude VAT. Annual billing saves 20%. Need help choosing?{" "}
              <Link to="/packages">See full plan details →</Link>
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="homeFaq">
          <div className="homeFaq__inner">
            <h2 className="homeFaq__h2">Frequently asked questions</h2>
            <FaqAccordion items={FAQ_TEASER} defaultOpenIndex={0} />
            <Link to="/faq" className="homeFaq__viewAll">View all FAQs →</Link>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="homeContact">
          <div className="homeContact__inner">
            <h2 className="homeContact__h2">
              Ready to bring <em>order</em> to your care home?
            </h2>
            <p className="homeContact__sub">
              Join hundreds of care home operators who&apos;ve simplified their operations
              with CURA.
            </p>
            <div className="homeContact__ctas">
              <Link to="/login" className="homeBtn homeBtn--ctaWhite">
                Start free trial
              </Link>
              <Link to="/contact" className="homeBtn homeBtn--ctaGhost">
                Book a demo
              </Link>
            </div>
            <div className="homeContact__links">
              <a href="mailto:hello@cura-care.com">hello@cura-care.com</a>
              <a href="tel:+18005551234">+1 (800) 555-1234</a>
            </div>
            <div className="homeContact__trust">
              <span>
                <i className="ti ti-shield-check" /> GDPR compliant
              </span>
              <span>
                <i className="ti ti-lock" /> ISO 27001
              </span>
              <span>
                <i className="ti ti-award" /> CQC recommended
              </span>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
