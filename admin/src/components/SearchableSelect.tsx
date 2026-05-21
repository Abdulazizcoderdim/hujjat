import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export interface SearchableOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SearchableOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
}

const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Tanlang",
  searchPlaceholder = "Qidirish...",
  emptyText = "Topilmadi",
  disabled,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState(0);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // focus input when opening
  useEffect(() => {
    if (open) {
      setHighlight(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // scroll highlighted into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-idx="${highlight}"]`,
    );
    if (el) {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [highlight, open]);

  const select = (v: string) => {
    onChange(v === value ? "" : v);
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(filtered.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[highlight];
      if (opt) select(opt.value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div
      ref={wrapRef}
      className={cx("ent-searchable", className)}
      style={{ position: "relative", width: "100%" }}
    >
      <button
        type="button"
        className="ent-input"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          textAlign: "left",
          cursor: disabled ? "not-allowed" : "pointer",
          color: selected ? "var(--ent-text)" : "var(--ent-text-faint)",
          paddingRight: 24,
          position: "relative",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {selected ? selected.label : placeholder}
        </span>
        {selected && !disabled ? (
          <X
            size={12}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            style={{
              position: "absolute",
              right: 6,
              color: "var(--ent-text-muted)",
              cursor: "pointer",
            }}
          />
        ) : (
          <ChevronDown
            size={12}
            style={{
              position: "absolute",
              right: 6,
              color: "var(--ent-text-muted)",
            }}
          />
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 1px)",
            left: 0,
            right: 0,
            zIndex: 60,
            background: "var(--ent-surface)",
            border: "1px solid var(--ent-border-strong)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              padding: 4,
              borderBottom: "1px solid var(--ent-border)",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlight(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="ent-input"
              style={{ width: "100%" }}
            />
          </div>
          <div
            ref={listRef}
            style={{
              maxHeight: 220,
              overflowY: "auto",
            }}
            role="listbox"
          >
            {filtered.length === 0 ? (
              <div
                className="ent-muted"
                style={{
                  padding: "8px 10px",
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                {emptyText}
              </div>
            ) : (
              filtered.map((opt, i) => {
                const isActive = opt.value === value;
                const isHi = i === highlight;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    data-idx={i}
                    onClick={() => select(opt.value)}
                    onMouseEnter={() => setHighlight(i)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      width: "100%",
                      textAlign: "left",
                      padding: "4px 8px",
                      fontSize: 12,
                      background: isHi
                        ? "var(--ent-row-hover)"
                        : "transparent",
                      border: 0,
                      borderTop:
                        i === 0 ? "0" : "1px dotted transparent",
                      color: isActive
                        ? "var(--ent-accent)"
                        : "var(--ent-text)",
                      fontWeight: isActive ? 600 : 400,
                      cursor: "pointer",
                      minHeight: 26,
                    }}
                  >
                    <Check
                      size={12}
                      style={{
                        flexShrink: 0,
                        opacity: isActive ? 1 : 0,
                        color: "var(--ent-accent)",
                      }}
                    />
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {opt.label}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
