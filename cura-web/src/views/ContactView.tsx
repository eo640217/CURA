import { useState } from "react";
import { Link } from "react-router-dom";
import "./ContactView.scss";

type SubmitState = "idle" | "loading" | "success";

const FACILITY_SIZES = ["1-25 residents", "26-50 residents", "51-100 residents", "100+ residents"];
const REASONS = ["Start a free trial", "Book a demo", "Talk to sales", "General question"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactView() {
  const [form, setForm] = useState({
    fullName: "",
    workEmail: "",
    facilityName: "",
    phone: "",
    facilitySize: "",
    reason: REASONS[1],
    message: "",
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required.";
    if (!form.workEmail.trim()) errs.workEmail = "Work email is required.";
    else if (!EMAIL_RE.test(form.workEmail.trim())) errs.workEmail = "Enter a valid email address.";
    if (!form.facilityName.trim()) errs.facilityName = "Facility or organisation name is required.";
    if (!form.consent) errs.consent = "Please confirm you agree to be contacted.";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setSubmitState("loading");
    setTimeout(() => setSubmitState("success"), 600);
  }

  function reset() {
    setForm({
      fullName: "",
      workEmail: "",
      facilityName: "",
      phone: "",
      facilitySize: "",
      reason: REASONS[1],
      message: "",
      consent: false,
    });
    setErrors({});
    setSubmitState("idle");
  }

  const isSubmitting = submitState === "loading";
  const isSuccess = submitState === "success";

  return (
    <>
      <section className="pageHero">
        <div className="pageHero__inner">
          <p className="homeSectionEyebrow homeSectionEyebrow--centred">Contact</p>
          <h1 className="homeSectionH2 homeSectionH2--centred">
            Let&apos;s talk about your <em>care home</em>
          </h1>
          <p className="homeSectionSub homeSectionSub--centred">
            Book a demo, start a trial, or ask us anything — our team replies within one
            business day.
          </p>
        </div>
      </section>

      <section className="contactSection">
        <div className="contactSection__inner">
          <div className="contactSection__form">
            {isSuccess ? (
              <div className="contactSuccess">
                <div className="contactSuccess__icon">
                  <i className="ti ti-check" />
                </div>
                <h2 className="contactSuccess__h2">Thanks — we&apos;ll be in touch</h2>
                <p className="contactSuccess__body">
                  A member of the CURA team will reach out to the email you provided shortly.
                  In the meantime, feel free to explore our plans or browse common questions.
                </p>
                <div className="contactSuccess__links">
                  <Link to="/packages" className="homeBtn homeBtn--outline">View plans</Link>
                  <Link to="/faq" className="homeBtn homeBtn--outline">Browse FAQs</Link>
                </div>
                <button type="button" className="contactSuccess__reset" onClick={reset}>
                  Send another message
                </button>
              </div>
            ) : (
              <form className="contactForm" onSubmit={onSubmit}>
                <div className="contactForm__grid2">
                  <div className="contactForm__field">
                    <label className="contactForm__label">Full name *</label>
                    <input
                      className={`contactForm__input${errors.fullName ? " contactForm__input--error" : ""}`}
                      value={form.fullName}
                      onChange={(e) => update("fullName", e.target.value)}
                    />
                    {errors.fullName && <div className="contactForm__err">{errors.fullName}</div>}
                  </div>
                  <div className="contactForm__field">
                    <label className="contactForm__label">Work email *</label>
                    <input
                      className={`contactForm__input${errors.workEmail ? " contactForm__input--error" : ""}`}
                      type="email"
                      value={form.workEmail}
                      onChange={(e) => update("workEmail", e.target.value)}
                    />
                    {errors.workEmail && <div className="contactForm__err">{errors.workEmail}</div>}
                  </div>
                </div>

                <div className="contactForm__grid2">
                  <div className="contactForm__field">
                    <label className="contactForm__label">Facility / organisation name *</label>
                    <input
                      className={`contactForm__input${errors.facilityName ? " contactForm__input--error" : ""}`}
                      value={form.facilityName}
                      onChange={(e) => update("facilityName", e.target.value)}
                    />
                    {errors.facilityName && <div className="contactForm__err">{errors.facilityName}</div>}
                  </div>
                  <div className="contactForm__field">
                    <label className="contactForm__label">Phone</label>
                    <input
                      className="contactForm__input"
                      type="tel"
                      value={form.phone}
                      placeholder="Optional"
                      onChange={(e) => update("phone", e.target.value)}
                    />
                  </div>
                </div>

                <div className="contactForm__grid2">
                  <div className="contactForm__field">
                    <label className="contactForm__label">Facility size</label>
                    <select
                      className="contactForm__select"
                      value={form.facilitySize}
                      onChange={(e) => update("facilitySize", e.target.value)}
                    >
                      <option value="">Select…</option>
                      {FACILITY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="contactForm__field">
                    <label className="contactForm__label">Reason for contact</label>
                    <select
                      className="contactForm__select"
                      value={form.reason}
                      onChange={(e) => update("reason", e.target.value)}
                    >
                      {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div className="contactForm__field">
                  <label className="contactForm__label">Message</label>
                  <textarea
                    className="contactForm__textarea"
                    rows={4}
                    value={form.message}
                    placeholder="Optional — tell us a bit more about what you need"
                    onChange={(e) => update("message", e.target.value)}
                  />
                </div>

                <label className="contactForm__checkboxRow">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => update("consent", e.target.checked)}
                  />
                  <span>I agree to be contacted about CURA.</span>
                </label>
                {errors.consent && <div className="contactForm__err">{errors.consent}</div>}

                <button
                  type="submit"
                  className="homeBtn homeBtn--primary contactForm__submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </div>

          <aside className="contactSection__info">
            <div className="contactInfoCard">
              <h3>Get in touch directly</h3>
              <a href="mailto:hello@cura-care.com" className="contactInfoCard__link">
                <i className="ti ti-mail" /> hello@cura-care.com
              </a>
              <a href="tel:+18005551234" className="contactInfoCard__link">
                <i className="ti ti-phone" /> +1 (800) 555-1234
              </a>
            </div>
            <div className="contactInfoCard">
              <h3>Explore first</h3>
              <Link to="/packages" className="contactInfoCard__link">
                <i className="ti ti-arrow-right" /> Compare plans and pricing
              </Link>
              <Link to="/faq" className="contactInfoCard__link">
                <i className="ti ti-arrow-right" /> Read frequently asked questions
              </Link>
            </div>
            <div className="contactInfoCard contactInfoCard--trust">
              <span><i className="ti ti-shield-check" /> GDPR compliant</span>
              <span><i className="ti ti-lock" /> ISO 27001</span>
              <span><i className="ti ti-award" /> CQC recommended</span>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
