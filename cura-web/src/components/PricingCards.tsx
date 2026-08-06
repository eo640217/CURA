import { Link } from "react-router-dom";
import { PACKAGE_TIERS, TIER_EXCLUDED } from "../data/packages";

type Props = {
  billingMode: "monthly" | "yearly";
  onBillingModeChange: (mode: "monthly" | "yearly") => void;
  enterpriseCtaTo?: string;
};

export default function PricingCards({ billingMode, onBillingModeChange, enterpriseCtaTo = "/contact" }: Props) {
  return (
    <>
      <div className="homeBillingToggle" role="tablist" aria-label="Billing mode">
        <button
          type="button"
          className={billingMode === "monthly" ? "isActive" : ""}
          onClick={() => onBillingModeChange("monthly")}
        >
          Monthly
        </button>
        <button
          type="button"
          className={billingMode === "yearly" ? "isActive" : ""}
          onClick={() => onBillingModeChange("yearly")}
        >
          Yearly
        </button>
      </div>
      <div className="homePackages__grid">
        {PACKAGE_TIERS.map((tier, i) => {
          const isMiddle = i === 1;
          const excluded = TIER_EXCLUDED[tier.name] ?? [];
          const isCustom = tier.monthly === "Custom";
          return (
            <article
              key={tier.name}
              className={`homePricingCard${isMiddle ? " homePricingCard--featured" : ""}`}
            >
              <p className="homePricingCard__name">{tier.name}</p>
              <div className="homePricingCard__priceRow">
                {isCustom ? (
                  <span className="homePricingCard__priceCustom">Custom</span>
                ) : (
                  <>
                    <span className="homePricingCard__price">
                      {billingMode === "monthly"
                        ? tier.monthly.replace("/mo", "")
                        : tier.yearly.replace("/yr", "")}
                    </span>
                    <span className="homePricingCard__pricePer">
                      {billingMode === "monthly" ? "/month" : "/year"}
                    </span>
                  </>
                )}
              </div>
              <p className="homePricingCard__subtitle">{tier.subtitle}</p>
              <hr className="homePricingCard__divider" />
              <ul className="homePricingCard__features">
                {tier.features.map((f) => (
                  <li key={f} className="homePricingCard__featureItem">
                    <i className="ti ti-check homePricingCard__check" />
                    <span>{f}</span>
                  </li>
                ))}
                {excluded.map((f) => (
                  <li
                    key={f}
                    className="homePricingCard__featureItem homePricingCard__featureItem--excluded"
                  >
                    <i className="ti ti-x homePricingCard__x" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={isCustom ? enterpriseCtaTo : "/login"}
                className={`homeBtn homeBtn--fullWidth ${
                  isMiddle ? "homeBtn--primary" : "homeBtn--outline"
                }`}
              >
                {isCustom ? "Talk to sales" : "Start free trial"}
              </Link>
            </article>
          );
        })}
      </div>
    </>
  );
}
