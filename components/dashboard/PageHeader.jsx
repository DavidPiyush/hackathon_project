import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/Icon";
import { Eyebrow } from "@/components/ui/Badge";

/**
 * Standard header for every dashboard page.
 *
 * Owns the page's single `<h1>`, so no page has to remember to include one and
 * none of them end up with two.
 */
export function PageHeader({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  actions,
  meta,
  className,
}) {
  return (
    <header
      className={cn(
        "border-b border-line bg-surface/40 px-6 py-8 lg:px-8",
        className,
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          {eyebrow && <Eyebrow icon={eyebrowIcon}>{eyebrow}</Eyebrow>}

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {title}
          </h1>

          {description && (
            <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-ink-soft">
              {description}
            </p>
          )}

          {meta && meta.length > 0 && (
            <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              {meta.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  {item.icon && (
                    <Icon
                      name={item.icon}
                      className="text-[11px] text-ink-faint"
                    />
                  )}

                  <dt className="text-[11px] text-ink-faint">{item.label}</dt>

                  <dd className="font-mono text-[11px] font-semibold text-ink-soft">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

/** Consistent padding for the body of a dashboard page. */
export function PageBody({ children, className }) {
  return (
    <div className={cn("px-6 py-8 lg:px-8", className)}>{children}</div>
  );
}

export default PageHeader;
