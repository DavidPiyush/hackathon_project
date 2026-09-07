import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * Auth form components.
 *
 * The Server Actions are covered separately in `auth-session.test.js`; these
 * mock them so the tests stay about the form: labels, error wiring, the live
 * strength meter, and the reveal toggle.
 */

const signupAction = vi.fn(async () => ({
  status: "error",
  message: "Please correct the highlighted fields.",
  errors: {},
  values: {},
}));

const loginAction = vi.fn(async () => ({
  status: "error",
  message: "Incorrect email or password.",
  errors: {},
  values: {},
}));

vi.mock("@/lib/actions/auth", () => ({
  signupAction: (state, formData) => signupAction(state, formData),
  loginAction: (state, formData) => loginAction(state, formData),
  logoutAction: vi.fn(),
  checkSessionAction: vi.fn(),
}));

const { LoginForm } = await import("@/components/auth/LoginForm");
const { SignupForm } = await import("@/components/auth/SignupForm");
const { PasswordField } = await import("@/components/auth/PasswordField");

const DEMO = { email: "analyst@threatdetect.com", password: "evidence-first-2026" };

describe("LoginForm", () => {
  it("labels both credentials fields", () => {
    render(<LoginForm demo={DEMO} />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/, { selector: "input" })).toBeInTheDocument();
  });

  it("uses the correct autocomplete hints so password managers work", () => {
    render(<LoginForm demo={DEMO} />);

    expect(screen.getByLabelText(/email address/i)).toHaveAttribute(
      "autocomplete",
      "email",
    );

    expect(screen.getByLabelText(/^Password/, { selector: "input" })).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
  });

  it("masks the password by default", () => {
    render(<LoginForm demo={DEMO} />);

    expect(screen.getByLabelText(/^Password/, { selector: "input" })).toHaveAttribute("type", "password");
  });

  it("reveals and re-hides the password on request", async () => {
    render(<LoginForm demo={DEMO} />);

    await userEvent.click(screen.getByRole("button", { name: "Show password" }));

    expect(screen.getByLabelText(/^Password/, { selector: "input" })).toHaveAttribute("type", "text");

    await userEvent.click(screen.getByRole("button", { name: "Hide password" }));

    expect(screen.getByLabelText(/^Password/, { selector: "input" })).toHaveAttribute("type", "password");
  });

  it("carries the return path through as a hidden field", () => {
    const { container } = render(
      <LoginForm demo={DEMO} next="/dashboard/inbox" />,
    );

    expect(container.querySelector('input[name="next"]')).toHaveValue(
      "/dashboard/inbox",
    );
  });

  it("shows the demo credentials and can fill them in", async () => {
    render(<LoginForm demo={DEMO} />);

    expect(screen.getByText(DEMO.email)).toBeInTheDocument();
    expect(screen.getByText(DEMO.password)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /fill these in/i }));

    expect(screen.getByLabelText(/email address/i)).toHaveValue(DEMO.email);
    expect(screen.getByLabelText(/^Password/, { selector: "input" })).toHaveValue(DEMO.password);
  });

  it("does not offer a password reset it cannot deliver", () => {
    // There is no mail backend, so this must not look like a working link.
    render(<LoginForm demo={DEMO} />);

    const reset = screen.getByText(/forgot password/i);

    expect(reset.tagName).not.toBe("A");
    expect(reset).toHaveAttribute("title", expect.stringMatching(/email service/i));
  });

  it("renders without a demo block when none is supplied", () => {
    render(<LoginForm />);

    expect(screen.queryByText(/demo account/i)).not.toBeInTheDocument();
  });
});

describe("SignupForm", () => {
  it("labels every field", () => {
    render(<SignupForm />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/, { selector: "input" })).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("leaves the consent box unticked", () => {
    // A pre-ticked consent box is not consent.
    render(<SignupForm />);

    expect(screen.getByRole("checkbox", { name: /accept the/i })).not.toBeChecked();
  });

  it("links the terms and privacy pages from the consent line", () => {
    render(<SignupForm />);

    expect(screen.getByRole("link", { name: /security terms/i })).toHaveAttribute(
      "href",
      "/security",
    );

    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute(
      "href",
      "/privacy",
    );
  });

  it("uses new-password autocomplete on both password fields", () => {
    render(<SignupForm />);

    for (const label of [/^Password/, /confirm password/i]) {
      expect(
        screen.getByLabelText(label, { selector: "input" }),
      ).toHaveAttribute("autocomplete", "new-password");
    }
  });

  it("flags a mismatched confirmation as the user types", async () => {
    render(<SignupForm />);

    await userEvent.type(
      screen.getByLabelText(/^Password/, { selector: "input" }),
      "marmalade tractor window",
    );

    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      "marmalade tractor windo",
    );

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("clears the mismatch once the confirmation agrees", async () => {
    render(<SignupForm />);

    await userEvent.type(screen.getByLabelText(/^Password/, { selector: "input" }), "marmalade tractor");
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      "marmalade tractor",
    );

    expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
  });

  it("states how the password is stored", () => {
    render(<SignupForm />);

    expect(screen.getByText(/scrypt/i)).toBeInTheDocument();
  });
});

describe("PasswordField strength meter", () => {
  /** Controlled wrapper, since the meter reflects the value it is given. */
  function Harness({ initial = "", context = {} }) {
    const [value, setValue] = useState(initial);

    return (
      <PasswordField
        id="pw"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        showStrength
        context={context}
      />
    );
  }

  it("exposes the strength as a meter for assistive tech", async () => {
    render(<Harness />);

    await userEvent.type(
      screen.getByLabelText(/^Password/, { selector: "input" }),
      "marmalade tractor window",
    );

    const meter = screen.getByRole("meter");

    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "4");
    expect(Number(meter.getAttribute("aria-valuenow"))).toBeGreaterThanOrEqual(3);
  });

  it("advises on length before anything is typed", () => {
    render(<Harness />);

    expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
  });

  it("calls out a blocked common password", async () => {
    render(<Harness />);

    await userEvent.type(screen.getByLabelText(/^Password/, { selector: "input" }), "password123");

    expect(screen.getByText(/Too common/)).toBeInTheDocument();
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "0");
  });

  it("calls out a password too short to accept", async () => {
    render(<Harness />);

    await userEvent.type(screen.getByLabelText(/^Password/, { selector: "input" }), "shortpw");

    expect(screen.getByText(/Too short/)).toBeInTheDocument();
  });

  it("rates a long passphrase strongly without demanding symbols", async () => {
    render(<Harness />);

    await userEvent.type(
      screen.getByLabelText(/^Password/, { selector: "input" }),
      "marmalade tractor window",
    );

    expect(screen.getByText(/Strong|Very strong/)).toBeInTheDocument();
  });

  it("rejects a password containing the user's own name", async () => {
    render(<Harness context={{ name: "Ada Lovelace" }} />);

    await userEvent.type(screen.getByLabelText(/^Password/, { selector: "input" }), "adalovelace-1937");

    expect(screen.getByText(/Too personal/)).toBeInTheDocument();
  });

  it("keeps the reveal toggle out of the tab order", () => {
    // Tabbing from the password field should reach submit, not the toggle.
    render(<Harness />);

    expect(screen.getByRole("button", { name: "Show password" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });

  it("hides the meter when strength is not requested", () => {
    render(
      <PasswordField id="pw2" value="anything" onChange={() => {}} />,
    );

    expect(screen.queryByRole("meter")).not.toBeInTheDocument();
  });
});
