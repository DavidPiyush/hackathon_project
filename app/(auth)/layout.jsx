/**
 * Auth route group.
 *
 * A route group `(auth)` so /login and /signup share this layout without
 * adding a URL segment. It deliberately does not render the marketing header
 * or the console shell — an auth screen should not offer navigation into
 * either.
 */
export default function AuthLayout({ children }) {
  return children;
}
