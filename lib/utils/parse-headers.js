/**
 * Email header parser.
 *
 * This is real, working forensics rather than a mock: paste the raw headers of
 * a message and it reconstructs the routing path, reads the authentication
 * results and extracts indicators. It runs entirely in the browser, so a
 * suspicious message never leaves the analyst's machine.
 *
 * Scope is deliberately limited to what headers can actually tell you. Where a
 * value is absent the parser reports "none" rather than guessing.
 */

/** Header names worth surfacing first, in the order an analyst reads them. */
const PRIORITY_HEADERS = [
  "from",
  "reply-to",
  "return-path",
  "to",
  "subject",
  "date",
  "message-id",
  "authentication-results",
  "received-spf",
  "dkim-signature",
];

/**
 * Unfold continuation lines, then split into `{ name, value }` pairs.
 *
 * RFC 5322 folds long header values across lines, with continuations
 * indented by whitespace. Splitting on newlines alone would shred them.
 */
export function unfoldHeaders(raw) {
  if (!raw || typeof raw !== "string") {
    return [];
  }

  // Normalise line endings, then join folded continuation lines.
  const unfolded = raw
    .replace(/\r\n/g, "\n")
    .replace(/\n[ \t]+/g, " ")
    .split("\n");

  const headers = [];

  for (const line of unfolded) {
    if (!line.trim()) {
      // A blank line terminates the header block; the body starts here.
      break;
    }

    const separator = line.indexOf(":");

    if (separator < 1) {
      continue;
    }

    headers.push({
      name: line.slice(0, separator).trim(),
      key: line.slice(0, separator).trim().toLowerCase(),
      value: line.slice(separator + 1).trim(),
    });
  }

  return headers;
}

/** First value for a header name, or null. */
export function headerValue(headers, name) {
  return headers.find((header) => header.key === name.toLowerCase())?.value ?? null;
}

/** All values for a header name that may legitimately repeat (e.g. Received). */
export function headerValues(headers, name) {
  return headers
    .filter((header) => header.key === name.toLowerCase())
    .map((header) => header.value);
}

/** Pull the addr-spec out of a display-name form: `"A B" <a@b.c>` -> `a@b.c`. */
export function extractAddress(value) {
  if (!value) {
    return null;
  }

  const angled = value.match(/<([^>]+)>/);
  const candidate = (angled ? angled[1] : value).trim();

  return /^[^\s@]+@[^\s@]+$/.test(candidate) ? candidate.toLowerCase() : null;
}

/** Domain part of an address. */
export function addressDomain(address) {
  return address?.split("@")[1] ?? null;
}

const IPV4 = /\b(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b/g;

/**
 * Reconstruct the routing path.
 *
 * `Received` headers are prepended by each hop, so the raw list runs
 * newest-first. The result is reversed so hop 1 is the origin — which is the
 * order an investigation actually reads.
 */
export function parseReceivedChain(headers) {
  const received = headerValues(headers, "received");

  return received
    .slice()
    .reverse()
    .map((value, index) => {
      const from = value.match(/from\s+([^\s;()]+)/i)?.[1] ?? null;
      const by = value.match(/\bby\s+([^\s;()]+)/i)?.[1] ?? null;
      const withProtocol = value.match(/\bwith\s+([A-Z0-9]+)/i)?.[1] ?? null;

      // The timestamp follows the final semicolon in a Received value.
      const semicolon = value.lastIndexOf(";");
      const timestamp = semicolon > -1 ? value.slice(semicolon + 1).trim() : null;

      const ips = [...new Set(value.match(IPV4) ?? [])];

      return {
        hop: index + 1,
        from,
        by,
        protocol: withProtocol,
        timestamp,
        ips,
        raw: value,
      };
    });
}

/**
 * Read authentication results.
 *
 * Prefers the `Authentication-Results` header, falling back to `Received-SPF`
 * and the presence of a `DKIM-Signature` when the receiving MTA did not write
 * a consolidated result.
 */
export function parseAuthentication(headers) {
  const authResults = headerValues(headers, "authentication-results").join("; ");
  const receivedSpf = headerValue(headers, "received-spf");
  const hasDkimSignature = Boolean(headerValue(headers, "dkim-signature"));

  const read = (mechanism) => {
    const match = authResults.match(
      new RegExp(`${mechanism}\\s*=\\s*([a-z]+)`, "i"),
    );

    return match ? match[1].toLowerCase() : null;
  };

  const spfFromReceived = receivedSpf
    ? receivedSpf.trim().split(/\s+/)[0].toLowerCase()
    : null;

  const spf = read("spf") ?? spfFromReceived ?? "none";
  const dkim = read("dkim") ?? (hasDkimSignature ? "present" : "none");
  const dmarc = read("dmarc") ?? "none";

  // Alignment: does the visible From domain match the authenticated identity?
  const fromDomain = addressDomain(extractAddress(headerValue(headers, "from")));
  const returnPathDomain = addressDomain(
    extractAddress(headerValue(headers, "return-path")),
  );

  let alignment = "unknown";

  if (fromDomain && returnPathDomain) {
    alignment = fromDomain === returnPathDomain ? "pass" : "fail";
  }

  return {
    spf: { result: spf, detail: receivedSpf ?? "No Received-SPF header present" },
    dkim: {
      result: dkim,
      detail: hasDkimSignature
        ? "DKIM-Signature header present"
        : "No DKIM-Signature header present",
    },
    dmarc: {
      result: dmarc,
      detail: authResults || "No Authentication-Results header present",
    },
    alignment: {
      result: alignment,
      detail:
        fromDomain && returnPathDomain
          ? `From ${fromDomain} vs Return-Path ${returnPathDomain}`
          : "Cannot be established without both From and Return-Path",
    },
  };
}

/** Extract indicators worth registering: addresses, domains and IPs. */
export function extractIndicators(headers) {
  const indicators = [];
  const seen = new Set();

  const add = (type, value, note) => {
    const key = `${type}:${value}`;

    if (!value || seen.has(key)) {
      return;
    }

    seen.add(key);
    indicators.push({ type, value, note, verdict: "unknown" });
  };

  const from = extractAddress(headerValue(headers, "from"));
  const replyTo = extractAddress(headerValue(headers, "reply-to"));
  const returnPath = extractAddress(headerValue(headers, "return-path"));

  add("email", from, "Header From address");
  add("email", replyTo, "Reply-To address");
  add("email", returnPath, "Envelope Return-Path");

  add("domain", addressDomain(from), "Header From domain");

  if (replyTo && addressDomain(replyTo) !== addressDomain(from)) {
    add(
      "domain",
      addressDomain(replyTo),
      "Reply-To domain differs from From domain",
    );
  }

  for (const hop of parseReceivedChain(headers)) {
    for (const ip of hop.ips) {
      add("ip", ip, `Observed at hop ${hop.hop}`);
    }
  }

  return indicators;
}

/**
 * Heuristic risk assessment from headers alone.
 *
 * Every contribution is returned alongside the score, because an unexplained
 * number is not evidence. These weights are intentionally conservative:
 * headers can show a message is *suspicious*, rarely that it is safe.
 */
export function assessHeaders(headers) {
  const auth = parseAuthentication(headers);
  const signals = [];

  const push = (weight, name, detail) =>
    signals.push({ weight, name, detail });

  if (["fail", "softfail"].includes(auth.spf.result)) {
    push(22, "SPF did not pass", `SPF result: ${auth.spf.result}`);
  } else if (auth.spf.result === "none") {
    push(10, "No SPF result", "The receiving server recorded no SPF evaluation");
  }

  if (auth.dkim.result === "fail") {
    push(20, "DKIM signature failed", "The signature did not validate");
  } else if (auth.dkim.result === "none") {
    push(10, "No DKIM signature", "Message was not signed");
  }

  if (auth.dmarc.result === "fail") {
    push(20, "DMARC failed", "The domain policy was not satisfied");
  } else if (auth.dmarc.result === "none") {
    push(8, "No DMARC result", "No published policy, or none evaluated");
  }

  if (auth.alignment.result === "fail") {
    push(18, "Sender alignment failed", auth.alignment.detail);
  }

  const from = extractAddress(headerValue(headers, "from"));
  const replyTo = extractAddress(headerValue(headers, "reply-to"));

  if (from && replyTo && addressDomain(from) !== addressDomain(replyTo)) {
    push(
      14,
      "Reply-To domain differs from From",
      "Replies would leave the apparent sender's domain",
    );
  }

  const subject = headerValue(headers, "subject") ?? "";

  if (/\b(urgent|immediately|action required|verify|suspend|final notice)\b/i.test(subject)) {
    push(8, "Urgency language in subject", `Subject: ${subject}`);
  }

  const hops = parseReceivedChain(headers);

  if (hops.length === 0) {
    push(6, "No routing path", "No Received headers were present");
  }

  const score = Math.min(
    100,
    signals.reduce((total, signal) => total + signal.weight, 0),
  );

  return { score, signals, authentication: auth, hops };
}

/** Full parse. The single entry point used by the analysis page. */
export function parseEmailHeaders(raw) {
  const headers = unfoldHeaders(raw);

  if (headers.length === 0) {
    return {
      ok: false,
      error:
        "No headers found. Paste the full raw headers, starting with a line such as \"Received:\" or \"From:\".",
    };
  }

  const assessment = assessHeaders(headers);

  return {
    ok: true,
    headers,
    // Surface the headers an analyst reads first, in a stable order.
    summary: PRIORITY_HEADERS.map((key) => ({
      key,
      name: headers.find((header) => header.key === key)?.name ?? key,
      value: headerValue(headers, key),
    })).filter((item) => item.value),
    from: extractAddress(headerValue(headers, "from")),
    subject: headerValue(headers, "subject"),
    messageId: headerValue(headers, "message-id"),
    date: headerValue(headers, "date"),
    hops: assessment.hops,
    authentication: assessment.authentication,
    indicators: extractIndicators(headers),
    score: assessment.score,
    signals: assessment.signals,
    headerCount: headers.length,
  };
}

/** A realistic sample used to seed the analysis page. */
export const SAMPLE_HEADERS = `Received: from mail.company.com (mail.company.com [203.0.113.24])
	by mx.internal.company.com with ESMTPS id 4a91f2c8;
	Mon, 07 Sep 2026 10:42:03 +0000
Received: from unknown (HELO secure-payments.com) (185.203.116.42)
	by mail.company.com with SMTP;
	Mon, 07 Sep 2026 10:42:01 +0000
Authentication-Results: mx.internal.company.com;
	spf=softfail (domain of secure-payments.com does not designate 185.203.116.42 as permitted sender);
	dkim=none;
	dmarc=fail (p=NONE sp=NONE dis=NONE)
Received-SPF: softfail (mailfrom) identity=mailfrom; client-ip=185.203.116.42;
	helo=secure-payments.com; envelope-from=billing@secure-payments.com
From: "Finance Department" <finance@secure-payments.com>
Reply-To: "Finance Dept" <accounts.receivable@mail-reply-service.net>
Return-Path: <billing@secure-payments.com>
To: <accounts@company.com>
Subject: Urgent Invoice Payment Required
Date: Mon, 07 Sep 2026 10:41:58 +0000
Message-ID: <8812.1757241718@secure-payments.com>
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="----=_Part_8812_1757241718"`;
