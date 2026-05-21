import {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
} from "react";

const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

/* Page wrapper — applies .ent-scope so theme variables take effect. */
export function EntPage({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("ent-scope ent-page", className)} {...rest}>
      {children}
    </div>
  );
}

/* Toolbar */
export interface EntToolbarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  actions?: ReactNode;
}
export function EntToolbar({
  title,
  actions,
  children,
  className,
  ...rest
}: EntToolbarProps) {
  return (
    <div className={cx("ent-toolbar", className)} {...rest}>
      {title !== undefined && <div className="ent-toolbar__title">{title}</div>}
      {children}
      {actions && <div className="ent-toolbar__group">{actions}</div>}
    </div>
  );
}
export const EntToolbarSep = () => <div className="ent-toolbar__sep" />;

/* Filter bar */
export function EntFilterBar({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("ent-filterbar", className)} {...rest}>
      {children}
    </div>
  );
}
export function EntFilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="ent-filterbar__field">
      <span className="ent-filterbar__label">{label}</span>
      {children}
    </div>
  );
}

/* Button */
export interface EntButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "danger";
  size?: "sm" | "xs" | "icon";
}
export const EntButton = forwardRef<HTMLButtonElement, EntButtonProps>(
  function EntButton(
    { variant = "default", size = "sm", className, type, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cx(
          "ent-btn",
          variant === "primary" && "ent-btn--primary",
          variant === "danger" && "ent-btn--danger",
          size === "icon" && "ent-btn--icon",
          size === "xs" && "ent-btn--xs",
          className,
        )}
        {...rest}
      />
    );
  },
);

/* Input */
export interface EntInputProps extends InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean;
}
export const EntInput = forwardRef<HTMLInputElement, EntInputProps>(
  function EntInput({ mono, className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cx("ent-input", mono && "ent-input--mono", className)}
        {...rest}
      />
    );
  },
);

/* Select (native, for performance + density) */
export const EntSelect = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function EntSelect({ className, children, ...rest }, ref) {
  return (
    <select ref={ref} className={cx("ent-select", className)} {...rest}>
      {children}
    </select>
  );
});

/* Badge */
export function EntBadge({
  variant = "default",
  children,
  className,
  title,
}: {
  variant?: "default" | "success" | "warn" | "danger" | "muted";
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cx(
        "ent-badge",
        variant === "success" && "ent-badge--success",
        variant === "warn" && "ent-badge--warn",
        variant === "danger" && "ent-badge--danger",
        variant === "muted" && "ent-badge--muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* Table primitives — bare wrappers around <table> for max layout control */
export function EntTableWrap({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("ent-table-wrap", className)} {...rest}>
      {children}
    </div>
  );
}
export function EntTable({
  compact,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLTableElement> & { compact?: boolean }) {
  return (
    <table
      className={cx("ent-table", compact && "ent-table--compact", className)}
      {...rest}
    >
      {children}
    </table>
  );
}

/* Pagination — minimal: prev/next + page indicator */
export function EntPagination({
  page,
  totalPages,
  total,
  limit,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <div className="ent-pagination">
      <div className="ent-pagination__info">
        {total === 0 ? "Yozuv yo'q" : `${from}–${to} / ${total}`}
      </div>
      <EntButton
        size="xs"
        disabled={page <= 1}
        onClick={() => onChange(1)}
        title="Birinchi"
      >
        «
      </EntButton>
      <EntButton
        size="xs"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        title="Oldingi"
      >
        ‹
      </EntButton>
      <span className="ent-muted" style={{ padding: "0 6px" }}>
        {page} / {Math.max(totalPages, 1)}
      </span>
      <EntButton
        size="xs"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        title="Keyingi"
      >
        ›
      </EntButton>
      <EntButton
        size="xs"
        disabled={page >= totalPages}
        onClick={() => onChange(totalPages)}
        title="Oxirgi"
      >
        »
      </EntButton>
    </div>
  );
}

/* Tabs */
export function EntTabs({ children }: { children: ReactNode }) {
  return <div className="ent-tabs">{children}</div>;
}
export function EntTab({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx("ent-tab", active && "ent-tab--active")}
    >
      {children}
    </button>
  );
}

/* Dialog — basic, controlled */
export function EntDialog({
  open,
  onClose,
  title,
  footer,
  children,
  width,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  width?: number | string;
}) {
  if (!open) return null;
  return (
    <div
      className="ent-scope ent-dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="ent-dialog"
        style={width ? { width } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ent-dialog__header">
          <span>{title}</span>
          <button
            type="button"
            className="ent-dialog__close"
            onClick={onClose}
            aria-label="Yopish"
          >
            ×
          </button>
        </div>
        <div className="ent-dialog__body">{children}</div>
        {footer && <div className="ent-dialog__footer">{footer}</div>}
      </div>
    </div>
  );
}

/* Empty state */
export function EntEmpty({ children }: { children: ReactNode }) {
  return <div className="ent-empty">{children}</div>;
}

/* Textarea */
export const EntTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function EntTextarea({ className, style, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cx("ent-input", className)}
      style={{
        height: "auto",
        padding: 6,
        fontFamily: "inherit",
        resize: "vertical",
        ...style,
      }}
      {...rest}
    />
  );
});

/* Checkbox */
export function EntCheckbox({
  label,
  checked,
  onChange,
  disabled,
  className,
}: {
  label?: ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label className={cx("ent-checkbox", className)}>
      <input
        type="checkbox"
        checked={!!checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      {label && <span>{label}</span>}
    </label>
  );
}

/* Card */
export function EntCard({
  title,
  actions,
  children,
  className,
  bodyClassName,
  noPadding,
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}) {
  return (
    <div className={cx("ent-card", className)}>
      {(title || actions) && (
        <div className="ent-card__header">
          <div style={{ minWidth: 0 }}>{title}</div>
          {actions && (
            <div style={{ display: "flex", gap: 4 }}>{actions}</div>
          )}
        </div>
      )}
      <div
        className={cx(!noPadding && "ent-card__body", bodyClassName)}
        style={noPadding ? { padding: 0 } : undefined}
      >
        {children}
      </div>
    </div>
  );
}

/* Field — label + control wrapper */
export function EntField({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  className,
}: {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("ent-field", required && "ent-field--required", className)}>
      {label && (
        <label className="ent-field__label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <div className="ent-field__error">{error}</div>
      ) : hint ? (
        <div className="ent-field__hint">{hint}</div>
      ) : null}
    </div>
  );
}

/* StatCard */
export function EntStatCard({
  label,
  value,
  delta,
  deltaDir,
}: {
  label: ReactNode;
  value: ReactNode;
  delta?: ReactNode;
  deltaDir?: "up" | "down" | "flat";
}) {
  return (
    <div className="ent-statcard">
      <div className="ent-statcard__label">{label}</div>
      <div className="ent-statcard__value">{value}</div>
      {delta !== undefined && (
        <div
          className={cx(
            "ent-statcard__delta",
            deltaDir === "up" && "ent-statcard__delta--up",
            deltaDir === "down" && "ent-statcard__delta--down",
          )}
        >
          {delta}
        </div>
      )}
    </div>
  );
}

/* Section title strip */
export function EntSectionTitle({ children }: { children: ReactNode }) {
  return <div className="ent-section-title">{children}</div>;
}

/* Right-side drawer (for forms) */
export function EntDrawer({
  open,
  onClose,
  title,
  footer,
  children,
  width,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  width?: number | string;
}) {
  if (!open) return null;
  return (
    <div
      className="ent-scope ent-drawer-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="ent-drawer"
        style={width ? { width } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ent-drawer__header">
          <span>{title}</span>
          <button
            type="button"
            className="ent-drawer__close"
            onClick={onClose}
            aria-label="Yopish"
          >
            ×
          </button>
        </div>
        <div className="ent-drawer__body">{children}</div>
        {footer && <div className="ent-drawer__footer">{footer}</div>}
      </div>
    </div>
  );
}

/* Confirm dialog (small, focused) */
export function EntConfirmDialog({
  open,
  title = "Tasdiqlash",
  message,
  confirmLabel = "Tasdiqlash",
  cancelLabel = "Bekor qilish",
  variant = "default",
  onConfirm,
  onClose,
  busy,
}: {
  open: boolean;
  title?: ReactNode;
  message: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  variant?: "default" | "danger";
  onConfirm: () => void;
  onClose: () => void;
  busy?: boolean;
}) {
  return (
    <EntDialog
      open={open}
      onClose={onClose}
      title={title}
      width={400}
      footer={
        <>
          <EntButton disabled={busy} onClick={onClose}>
            {cancelLabel}
          </EntButton>
          <EntButton
            disabled={busy}
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
          >
            {busy ? "Yuklanmoqda..." : confirmLabel}
          </EntButton>
        </>
      }
    >
      <div style={{ fontSize: 13, lineHeight: 1.5 }}>{message}</div>
    </EntDialog>
  );
}

/* Grid wrapper helper (for stat-card rows) */
export function EntGrid({
  cols = 4,
  children,
  className,
  style,
}: {
  cols?: 2 | 3 | 4;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={cx("ent-grid", `ent-grid--${cols}`, className)} style={style}>
      {children}
    </div>
  );
}
