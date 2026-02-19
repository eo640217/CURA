import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import "./MenuSelect.scss";

export type MenuSelectOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
};

type Props<T extends string> = {
  label: string;
  value: T;
  options: MenuSelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
};

export default function MenuSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: Props<T>) {
  const id = useId();
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? options[0],
    [options, value]
  );

  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  function toggle() {
    if (disabled) return;
    setOpen((p) => !p);
  }

  function commit(next: T) {
    onChange(next);
    close();
    // restore focus to button for accessibility
    requestAnimationFrame(() => btnRef.current?.focus());
  }

  // click outside to close
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const target = e.target as Node | null;
      if (!target) return;
      if (fieldRef.current?.contains(target)) return;
      close();
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  // keyboard on button
  function onButtonKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => {
        // focus selected option if open
        const el = menuRef.current?.querySelector<HTMLLIElement>(`li[data-value="${value}"]`);
        (el ?? menuRef.current?.querySelector("li"))?.focus();
      });
    }
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  // keyboard on items
  function onItemKeyDown(e: React.KeyboardEvent<HTMLLIElement>, idx: number) {
    const items = menuRef.current?.querySelectorAll<HTMLLIElement>("li[role='option']");
    if (!items || items.length === 0) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const v = options[idx].value;
      commit(v);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[idx + 1] ?? items[0];
      next.focus();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[idx - 1] ?? items[items.length - 1];
      prev.focus();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      requestAnimationFrame(() => btnRef.current?.focus());
    }
    if (e.key === "Tab") {
      // allow tab, but close menu
      close();
    }
  }

  return (
    <div ref={fieldRef} className={`ms ${open ? "ms--open" : ""} ${disabled ? "ms--disabled" : ""}`}>
      <label className="ms__label" id={`${id}-label`}>
        {label}
      </label>

      {/* keep a real <select> for forms/autofill if you want; hidden visually */}
      <select className="ms__native" value={value} onChange={(e) => onChange(e.target.value as T)} disabled={disabled}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <div className="ms__control">
        <button
          ref={btnRef}
          type="button"
          className="ms__toggle"
          aria-describedby={`${id}-label`}
          aria-controls={`${id}-menu`}
          aria-expanded={open}
          onClick={toggle}
          onKeyDown={onButtonKeyDown}
          disabled={disabled}
        >
          <span className="ms__toggleText">{selected?.label ?? "Select…"}</span>
        </button>

        <ul ref={menuRef} id={`${id}-menu`} className="ms__menu" role="listbox" aria-label={label}>
          {options.map((o, idx) => {
            const isSelected = o.value === value;
            return (
              <li
                key={o.value}
                data-value={o.value}
                role="option"
                aria-selected={isSelected}
                tabIndex={open ? 0 : -1}
                className={`ms__item ${isSelected ? "isSelected" : ""}`}
                onClick={() => commit(o.value)}
                onKeyDown={(e) => onItemKeyDown(e, idx)}
              >
                {o.icon && <span className="ms__icon">{o.icon}</span>}
                <div className="ms__text">
                  <div className="ms__name">{o.label}</div>
                  {o.description && <div className="ms__desc">{o.description}</div>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
