export type Faq = { q: string; a: string };
export type FaqCategory = { category: string; items: Faq[] };

export const FAQS: Faq[] = [
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

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    category: "Getting started",
    items: [
      {
        q: "How long does onboarding take?",
        a: "Most facilities are live in 2 to 4 weeks, including setup, training, and migration support.",
      },
      {
        q: "Do I need to migrate existing resident records?",
        a: "Our onboarding team helps import resident, unit, and care plan data from spreadsheets or your previous system before go-live.",
      },
      {
        q: "Is training included?",
        a: "Yes. All plans include staff onboarding sessions; Plus and Enterprise include ongoing refresher training.",
      },
    ],
  },
  {
    category: "Access & roles",
    items: [
      {
        q: "Can residents and employees both sign in?",
        a: "Yes. Cura supports role-based access so residents, staff, and administrators each see tools relevant to them.",
      },
      {
        q: "Can I limit what staff can see across facilities?",
        a: "Admins can scope staff accounts to specific facilities or units, and restrict sensitive actions like resident deletion to admin roles.",
      },
      {
        q: "Do you support multiple facilities under one account?",
        a: "Yes. Cura Plus and Enterprise include multi-site operational oversight and centralized reporting across all your facilities.",
      },
    ],
  },
  {
    category: "Pricing & billing",
    items: [
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
    ],
  },
  {
    category: "Security & compliance",
    items: [
      {
        q: "Is CURA GDPR compliant?",
        a: "Yes, CURA is fully GDPR compliant, with data processing agreements available for every plan.",
      },
      {
        q: "Are you ISO 27001 certified?",
        a: "Yes. Our infrastructure and data handling practices are ISO 27001 certified and independently audited annually.",
      },
      {
        q: "Does CURA support CQC reporting?",
        a: "Yes. Cura Plus and Enterprise generate CQC-ready reports automatically, so you stay audit-ready without a last-minute scramble.",
      },
    ],
  },
  {
    category: "Support",
    items: [
      {
        q: "What support comes with each plan?",
        a: "Essential includes email support, Plus includes priority support with faster response times, and Enterprise includes a dedicated success manager.",
      },
      {
        q: "Do you offer phone support?",
        a: "Phone support is available on Plus and Enterprise plans; Essential customers reach us by email.",
      },
    ],
  },
];
