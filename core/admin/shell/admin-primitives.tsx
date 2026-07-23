import type { ReactNode } from "react";

import { cn } from "@core/lib/utils";

type AdminStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
};

export function AdminStatCard({
  label,
  value,
  hint,
  className,
}: AdminStatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--admin-line)] bg-[var(--admin-panel)] px-4 py-4",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--admin-muted)]">
        {label}
      </p>
      <p className="mt-2 font-[family-name:var(--font-admin-display)] text-2xl font-semibold tracking-tight text-[var(--admin-ink)]">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-sm text-[var(--admin-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

type AdminPanelCardProps = {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  actions?: ReactNode;
};

export function AdminPanelCard({
  title,
  description,
  children,
  className,
  actions,
}: AdminPanelCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-[var(--admin-line)] bg-[var(--admin-panel)]",
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--admin-line)] px-4 py-4 md:px-5">
        <div>
          <h2 className="font-[family-name:var(--font-admin-display)] text-lg font-semibold tracking-tight text-[var(--admin-ink)]">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-[var(--admin-muted)]">{description}</p>
          ) : null}
        </div>
        {actions}
      </header>
      {children ? <div className="px-4 py-4 md:px-5 md:py-5">{children}</div> : null}
    </section>
  );
}

type AdminDataTableProps = {
  headers: string[];
  children: ReactNode;
  className?: string;
};

export function AdminDataTable({
  headers,
  children,
  className,
}: AdminDataTableProps) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-[var(--admin-line)]",
        className,
      )}
    >
      <table className="w-full min-w-[32rem] text-start text-sm">
        <thead className="bg-[var(--admin-surface)] text-[var(--admin-muted)]">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--admin-line)] bg-[var(--admin-panel)] text-[var(--admin-ink)]">
          {children}
        </tbody>
      </table>
    </div>
  );
}
