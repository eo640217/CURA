export type PackageTier = {
  name: string;
  subtitle: string;
  monthly: string;
  yearly: string;
  features: string[];
};

export const PACKAGE_TIERS: PackageTier[] = [
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

export const TIER_EXCLUDED: Record<string, string[]> = {
  "Cura Essential": ["Multi-site dashboard", "CQC report export", "API access"],
  "Cura Plus": ["API access"],
  "Cura Enterprise": [],
};

export type FeatureMatrixRow = {
  category: string;
  essential: boolean | string;
  plus: boolean | string;
  enterprise: boolean | string;
};

export const FEATURE_MATRIX: FeatureMatrixRow[] = [
  { category: "Resident profiles & care notes", essential: true, plus: true, enterprise: true },
  { category: "Medication & appointment reminders", essential: true, plus: true, enterprise: true },
  { category: "Daily occupancy & unit tracking", essential: true, plus: true, enterprise: true },
  { category: "Shift & hours oversight", essential: false, plus: true, enterprise: true },
  { category: "Multi-facility analytics dashboard", essential: false, plus: true, enterprise: true },
  { category: "CQC report export", essential: false, plus: true, enterprise: true },
  { category: "API access", essential: false, plus: false, enterprise: true },
  { category: "Advanced permissions & audit exports", essential: false, plus: false, enterprise: true },
  { category: "Custom onboarding & integrations", essential: false, plus: false, enterprise: true },
  { category: "Support level", essential: "Email", plus: "Priority", enterprise: "Dedicated success manager" },
];

export type PricingFaq = { q: string; a: string };

export const PRICING_FAQS: PricingFaq[] = [
  {
    q: "What happens after my 14-day trial ends?",
    a: "You'll be prompted to pick a plan before losing access. Nothing is billed automatically during the trial, and there's no card required to start it.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrade or downgrade at any time from your account settings — changes apply from your next billing cycle.",
  },
  {
    q: "Do you charge per resident or per facility?",
    a: "Pricing is per facility, not per resident, so growing occupancy doesn't increase your bill.",
  },
  {
    q: "Is there a setup fee?",
    a: "No setup fee on Essential or Plus. Enterprise includes custom onboarding scoped to your rollout.",
  },
  {
    q: "What does 'Custom' pricing mean for Enterprise?",
    a: "Enterprise pricing depends on facility count, integrations, and governance requirements — talk to sales for a quote.",
  },
];
