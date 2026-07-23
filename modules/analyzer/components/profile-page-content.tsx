import { Typography } from "@core/ui";

import type { SaasCustomerProfile } from "../types";

type ProfilePageContentProps = {
  profile: SaasCustomerProfile;
};

export function ProfilePageContent({ profile }: ProfilePageContentProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header className="space-y-2">
        <Typography
          variant="h2"
          className="border-0 pb-0 font-[family-name:var(--font-saas-display)] text-[var(--saas-ink)]"
        >
          Profile
        </Typography>
        <Typography variant="muted" className="text-[var(--saas-muted)]">
          Account details from your signed-in session.
        </Typography>
      </header>

      <dl className="grid gap-4 border border-[var(--saas-line)] bg-[var(--saas-panel)] px-4 py-5 text-sm sm:grid-cols-2">
        <Field label="Name" value={profile.name} />
        <Field label="Email" value={profile.email ?? "—"} />
        <Field label="Phone" value={profile.phone} />
        <Field
          label="Member since"
          value={profile.memberSince.toLocaleDateString()}
        />
      </dl>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <Typography variant="muted" className="text-[var(--saas-muted)]">
        {label}
      </Typography>
      <Typography variant="small" className="text-[var(--saas-ink)]">
        {value}
      </Typography>
    </div>
  );
}
