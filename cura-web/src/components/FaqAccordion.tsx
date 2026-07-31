import { useState } from "react";

type Faq = { q: string; a: string };

type Props = {
  items: Faq[];
  defaultOpenIndex?: number | null;
};

export default function FaqAccordion({ items, defaultOpenIndex = null }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  return (
    <div className="homeFaq__list">
      {items.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={faq.q} className={`homeFaqItem${isOpen ? " homeFaqItem--open" : ""}`}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}
            >
              <span>{faq.q}</span>
              <i className="ti ti-chevron-down homeFaqItem__chevron" />
            </button>
            {isOpen && <p>{faq.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
