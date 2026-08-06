import { Link } from "react-router-dom";
import FaqAccordion from "../components/FaqAccordion";
import { FAQ_CATEGORIES } from "../data/faqs";
import "./FaqView.scss";

export default function FaqView() {
  return (
    <>
      <section className="pageHero">
        <div className="pageHero__inner">
          <p className="homeSectionEyebrow homeSectionEyebrow--centred">FAQ</p>
          <h1 className="homeSectionH2 homeSectionH2--centred">
            Frequently asked <em>questions</em>
          </h1>
          <p className="homeSectionSub homeSectionSub--centred">
            Everything you need to know about getting started, access, pricing, and security.
            Can&apos;t find an answer? <Link to="/contact">Contact us</Link>.
          </p>
        </div>
      </section>

      <section className="faqCategories">
        <div className="faqCategories__inner">
          {FAQ_CATEGORIES.map((cat) => (
            <div key={cat.category} className="faqCategory">
              <h2 className="faqCategory__h2">{cat.category}</h2>
              <FaqAccordion items={cat.items} />
            </div>
          ))}
        </div>
      </section>

      <section className="homeContact">
        <div className="homeContact__inner">
          <h2 className="homeContact__h2">
            Still have <em>questions</em>?
          </h2>
          <p className="homeContact__sub">
            Our team is happy to walk you through anything not covered here.
          </p>
          <div className="homeContact__ctas">
            <Link to="/contact" className="homeBtn homeBtn--ctaWhite">
              Contact us
            </Link>
            <Link to="/login" className="homeBtn homeBtn--ctaGhost">
              Start free trial
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
