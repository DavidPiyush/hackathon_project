"use client";

import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Layout";
import { Eyebrow } from "@/components/ui/Badge";

/**
 * Root error boundary.
 *
 * Error boundaries must be Client Components. `reset` re-renders the segment,
 * which recovers from a transient failure without a full page reload.
 *
 * The digest is shown because it is the only thing that links what the user
 * saw to the server-side log entry.
 */
export default function Error({ error, reset }) {
  return (
    <main id="main" className="flex min-h-dvh items-center">
      <Container size="sm" className="py-20">
        <Card className="p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-critical/25 bg-critical/10 text-critical">
            <Icon name="warning" className="text-xl" />
          </span>

          <Eyebrow tone="critical" className="mt-6 justify-center">
            Unexpected error
          </Eyebrow>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
            Something went wrong.
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-ink-soft">
            The page failed to render. Retrying often clears a transient
            failure; if it does not, the reference below identifies this
            specific error in our logs.
          </p>

          {error?.digest && (
            <p className="ioc mx-auto mt-5 inline-block rounded-lg border border-line bg-raise px-3 py-2 text-ink-muted">
              Reference: {error.digest}
            </p>
          )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={reset} icon="refresh">
              Try again
            </Button>

            <Button href="/" variant="secondary" icon="home">
              Back to home
            </Button>
          </div>
        </Card>
      </Container>
    </main>
  );
}
