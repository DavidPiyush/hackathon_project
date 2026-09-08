/** "or" rule between the OAuth button and the password form. */
export function AuthDivider({ label = "or continue with email" }) {
  return (
    <div className="my-6 flex items-center gap-4" aria-hidden="true">
      <span className="h-px flex-1 bg-line" />

      <span className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
        {label}
      </span>

      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export default AuthDivider;
