import { useState } from "react";
import { Link } from "react-router-dom";
import PricingCards from "../components/PricingCards";
import FaqAccordion from "../components/FaqAccordion";
import { FEATURE_MATRIX, PRICING_FAQS } from "../data/packages";
import "./PackagesView.scss";

function MatrixCell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="pkgMatrix__text">{value}</span>;
  }
  return value ? (
    <i className="ti ti-check pkgMatrix__check" />
  ) : (
    <i className="ti ti-x pkgMatrix__x" />
  );
}

export default function PackagesView() {
  const [billingMode, setBillingMode] = useState<"monthly" | "yearly">("monthly");

  return (
    <>
      <section className="pageHero">
        <div className="pageHero__inner">
          <p className="homeSectionEyebrow homeSectionEyebrow--centred">Pricing</p>
          <h1 className="homeSectionH2 homeSectionH2--centred">
            Plans built for every stage of <em>growth</em>
          </h1>
          <p className="homeSectionSub homeSectionSub--centred">
            Compare Cura Essential, Plus, and Enterprise in full detail. All plans include a
            14-day free trial and no credit card required.
          </p>
        </div>
      </section>

      <section className="homePackages">
        <div className="homePackages__inner">
          <PricingCards billingMode={billingMode} onBillingModeChange={setBillingMode} />
          <p className="homePackages__note">
            All prices exclude VAT. Annual billing saves 20%.
          </p>
        </div>
      </section>

      <section className="pkgMatrix">
        <div className="pkgMatrix__inner">
          <p className="homeSectionEyebrow homeSectionEyebrow--centred">Compare plans</p>
          <h2 className="homeSectionH2 homeSectionH2--centred">
            Every feature, side by <em>side</em>
          </h2>
          <table className="pkgMatrix__table">
            <thead>
              <tr>
                <th>Capability</th>
                <th>Essential</th>
                <th>Plus</th>
                <th>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_MATRIX.map((row) => (
                <tr key={row.category}>
                  <td className="pkgMatrix__category">{row.category}</td>
                  <td><MatrixCell value={row.essential} /></td>
                  <td><MatrixCell value={row.plus} /></td>
                  <td><MatrixCell value={row.enterprise} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="homeFaq">
        <div className="homeFaq__inner">
          <h2 className="homeFaq__h2">Pricing questions</h2>
          <FaqAccordion items={PRICING_FAQS} defaultOpenIndex={0} />
        </div>
      </section>

      <section className="homeContact">
        <div className="homeContact__inner">
          <h2 className="homeContact__h2">
            Not sure which plan is <em>right</em> for you?
          </h2>
          <p className="homeContact__sub">
            Talk to our team about your facility size, sites, and compliance needs — we&apos;ll
            recommend the right plan.
          </p>
          <div className="homeContact__ctas">
            <Link to="/login" className="homeBtn homeBtn--ctaWhite">
              Start free trial
            </Link>
            <Link to="/contact" className="homeBtn homeBtn--ctaGhost">
              Talk to sales
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
