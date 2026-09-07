/**
 * Credential validation.
 *
 * A plain module with no server imports, so the rules are unit-testable and
 * the signup form can reuse `scorePassword` for its live strength meter
 * without duplicating the policy.
 *
 * Password policy follows NIST SP 800-63B rather than the usual complexity
 * theatre: length is what matters, a blocklist catches the passwords that
 * actually get tried, and there are no forced character classes or expiry —
 * both of which measurably push people toward `Password1!` and sticky notes.
 */

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 200;
export const NAME_MAX = 80;
export const EMAIL_MAX = 254;

/**
 * Passwords too common to allow at any length. A real deployment checks a
 * corpus of millions (or the Pwned Passwords range API); this is the short
 * head of that list, which is what unthrottled attacks actually try.
 */
const BLOCKED = new Set([
  "password", "password1", "password123", "passw0rd", "p@ssword",
  "12345678", "123456789", "1234567890", "qwertyuiop", "qwerty123",
  "letmein", "letmein123", "welcome1", "welcome123", "admin123",
  "iloveyou", "sunshine", "princess", "football", "baseball",
  "changeme", "trustno1", "dragon123", "monkey123", "abc12345",
  "threatdetect", "security", "security1",
]);

/** Deliberately permissive: only a confirmation email proves an address works. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Normalise an email for storage and lookup. */
export function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

export function validateEmail(email) {
  const value = normalizeEmail(email);

  if (value.length === 0) {
    return "Enter your email address.";
  }

  if (value.length > EMAIL_MAX) {
    return `Email must be ${EMAIL_MAX} characters or fewer.`;
  }

  if (!EMAIL_PATTERN.test(value)) {
    return "Enter a valid email address.";
  }

  return null;
}

export function validateName(name) {
  const value = String(name ?? "").trim();

  if (value.length < 2) {
    return "Enter your full name.";
  }

  if (value.length > NAME_MAX) {
    return `Name must be ${NAME_MAX} characters or fewer.`;
  }

  return null;
}

/** Longest run of sequential or repeated characters, e.g. "abcdef" or "aaaa". */
function longestRun(value) {
  let longest = 1;
  let current = 1;

  for (let i = 1; i < value.length; i += 1) {
    const step = value.charCodeAt(i) - value.charCodeAt(i - 1);

    if (step === 0 || step === 1 || step === -1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

/**
 * Password strength, 0-4, with the single most useful piece of advice.
 *
 * Shared by the server-side check and the live meter in the signup form, so
 * the two can never disagree about what is acceptable.
 */
export function scorePassword(password, context = {}) {
  const value = String(password ?? "");

  if (value.length === 0) {
    return { score: 0, label: "Empty", hint: "Enter a password.", blocking: true };
  }

  const lower = value.toLowerCase();

  if (BLOCKED.has(lower)) {
    return {
      score: 0,
      label: "Too common",
      hint: "This is one of the most commonly used passwords. Choose something else.",
      blocking: true,
    };
  }

  if (value.length < PASSWORD_MIN) {
    return {
      score: value.length >= 6 ? 1 : 0,
      label: "Too short",
      hint: `Use at least ${PASSWORD_MIN} characters. Length matters more than symbols.`,
      blocking: true,
    };
  }

  /*
    A password containing the account's own name or email local-part is
    trivially guessable by anyone who knows the target.

    Both sides are stripped of anything but letters and digits before
    comparing: checking the raw strings missed "adalovelace-1937" against a
    name of "Ada Lovelace", because the space and hyphen never line up.
    Individual name words are checked too, so a surname alone is caught.
  */
  const alphanumeric = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

  const strippedPassword = alphanumeric(value);
  const name = String(context.name ?? "");

  const identifiers = [
    alphanumeric(name),
    ...name.split(/\s+/).map(alphanumeric),
    alphanumeric(normalizeEmail(context.email).split("@")[0]),
  ].filter((part) => part.length >= 3);

  if (identifiers.some((part) => strippedPassword.includes(part))) {
    return {
      score: 1,
      label: "Too personal",
      hint: "Avoid using your name or email address in your password.",
      blocking: true,
    };
  }

  if (longestRun(value) >= 5) {
    return {
      score: 1,
      label: "Predictable",
      hint: "Long runs like “12345” or “aaaaa” are guessed early. Mix it up.",
      blocking: true,
    };
  }

  // Past the blocking rules, score on variety and length — advisory only.
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) =>
    pattern.test(value),
  ).length;

  const unique = new Set(value).size;

  let score = 2;

  if (value.length >= 14 || (value.length >= 12 && classes >= 3)) {
    score = 3;
  }

  if (value.length >= 18 || (value.length >= 14 && classes >= 3 && unique >= 10)) {
    score = 4;
  }

  const labels = { 2: "Fair", 3: "Strong", 4: "Very strong" };

  const hints = {
    2: "Acceptable. A few more characters would help more than adding symbols.",
    3: "Strong password.",
    4: "Excellent password.",
  };

  return {
    score,
    label: labels[score],
    hint: hints[score],
    blocking: false,
  };
}

export function validatePassword(password, context) {
  const value = String(password ?? "");

  if (value.length > PASSWORD_MAX) {
    return `Password must be ${PASSWORD_MAX} characters or fewer.`;
  }

  const { blocking, hint } = scorePassword(value, context);

  return blocking ? hint : null;
}

/** Validate a signup submission. Returns a map of field errors. */
export function validateSignup(fields) {
  const errors = {};

  const name = validateName(fields.name);
  const email = validateEmail(fields.email);

  if (name) {
    errors.name = name;
  }

  if (email) {
    errors.email = email;
  }

  const password = validatePassword(fields.password, {
    name: fields.name,
    email: fields.email,
  });

  if (password) {
    errors.password = password;
  }

  const confirm = String(fields.confirm ?? "");

  // Checked for emptiness separately: comparing two absent values coerced to
  // strings made a blank confirmation field silently "match" a blank password.
  if (confirm.length === 0) {
    errors.confirm = "Re-enter your password to confirm it.";
  } else if (confirm !== String(fields.password ?? "")) {
    errors.confirm = "Passwords do not match.";
  }

  // An explicit, unticked-by-default consent box. A pre-ticked one is not
  // consent, and the platform handles other people's email.
  if (fields.terms !== "on" && fields.terms !== true) {
    errors.terms = "Please confirm you accept the terms and privacy policy.";
  }

  return errors;
}

/**
 * Validate a login submission.
 *
 * Deliberately shallow: rejecting a login because the password is "too short"
 * tells an attacker the stored password is longer than what they tried. Only
 * emptiness is checked here; correctness is decided by the credential check.
 */
export function validateLogin(fields) {
  const errors = {};

  if (normalizeEmail(fields.email).length === 0) {
    errors.email = "Enter your email address.";
  }

  if (String(fields.password ?? "").length === 0) {
    errors.password = "Enter your password.";
  }

  return errors;
}
