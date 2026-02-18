import lexicon from "../assets/lexicon";
import "./AdminView.scss";

export default function AdminView() {
  const t = lexicon;
  return (
    <div className="page adminView">
      <h2 className="adminView__title">{t.admin.title}</h2>
      <p className="adminView__body">{t.admin.body}</p>
    </div>
  );
}
