import { describe, expect, it } from "vitest";

import {
  unfoldHeaders,
  headerValue,
  headerValues,
  extractAddress,
  addressDomain,
  parseReceivedChain,
  parseAuthentication,
  extractIndicators,
  assessHeaders,
  parseEmailHeaders,
  SAMPLE_HEADERS,
} from "@/lib/utils/parse-headers";

describe("unfoldHeaders", () => {
  it("splits simple headers into name/value pairs", () => {
    const headers = unfoldHeaders("From: a@b.com\nSubject: Hello");

    expect(headers).toHaveLength(2);
    expect(headers[0]).toMatchObject({ name: "From", key: "from", value: "a@b.com" });
    expect(headers[1].value).toBe("Hello");
  });

  it("rejoins folded continuation lines per RFC 5322", () => {
    const headers = unfoldHeaders(
      "Authentication-Results: mx.example.com;\n\tspf=pass;\n\tdkim=pass",
    );

    expect(headers).toHaveLength(1);
    expect(headers[0].value).toBe("mx.example.com; spf=pass; dkim=pass");
  });

  it("normalises CRLF line endings", () => {
    const headers = unfoldHeaders("From: a@b.com\r\nTo: c@d.com");

    expect(headers).toHaveLength(2);
    expect(headers[1].key).toBe("to");
  });

  it("stops at the blank line that ends the header block", () => {
    const headers = unfoldHeaders(
      "From: a@b.com\n\nThis is the body\nFrom: not-a-header@evil.com",
    );

    expect(headers).toHaveLength(1);
  });

  it("lowercases the lookup key but preserves the original casing", () => {
    const headers = unfoldHeaders("MIME-Version: 1.0");

    expect(headers[0].name).toBe("MIME-Version");
    expect(headers[0].key).toBe("mime-version");
  });

  it("skips malformed lines with no colon", () => {
    const headers = unfoldHeaders("From: a@b.com\ngarbage line\nTo: c@d.com");

    expect(headers.map((header) => header.key)).toEqual(["from", "to"]);
  });

  it("returns an empty list for absent or non-string input", () => {
    expect(unfoldHeaders("")).toEqual([]);
    expect(unfoldHeaders(null)).toEqual([]);
    expect(unfoldHeaders(undefined)).toEqual([]);
    expect(unfoldHeaders(42)).toEqual([]);
  });
});

describe("headerValue and headerValues", () => {
  const headers = unfoldHeaders(
    "Received: hop-two\nReceived: hop-one\nFrom: a@b.com",
  );

  it("finds a value case-insensitively", () => {
    expect(headerValue(headers, "FROM")).toBe("a@b.com");
  });

  it("returns null for a header that is not present", () => {
    expect(headerValue(headers, "x-missing")).toBeNull();
  });

  it("returns every value for a repeated header", () => {
    expect(headerValues(headers, "received")).toEqual(["hop-two", "hop-one"]);
  });
});

describe("extractAddress and addressDomain", () => {
  it("pulls the address out of a display-name form", () => {
    expect(extractAddress('"Finance Department" <finance@example.com>')).toBe(
      "finance@example.com",
    );
  });

  it("accepts a bare address", () => {
    expect(extractAddress("plain@example.com")).toBe("plain@example.com");
  });

  it("lowercases the result so comparisons are reliable", () => {
    expect(extractAddress("<Finance@Example.COM>")).toBe("finance@example.com");
  });

  it("returns null when there is no valid address", () => {
    expect(extractAddress("Finance Department")).toBeNull();
    expect(extractAddress("")).toBeNull();
    expect(extractAddress(null)).toBeNull();
  });

  it("extracts the domain part", () => {
    expect(addressDomain("finance@example.com")).toBe("example.com");
    expect(addressDomain(null)).toBeNull();
  });
});

describe("parseReceivedChain", () => {
  it("reverses the chain so hop 1 is the origin", () => {
    // Received headers are prepended by each hop, so the raw order is
    // newest-first. An investigation reads oldest-first.
    const headers = unfoldHeaders(
      [
        "Received: from second.example.com by final.example.com; Mon, 07 Sep 2026 10:00:02 +0000",
        "Received: from first.example.com by second.example.com; Mon, 07 Sep 2026 10:00:01 +0000",
      ].join("\n"),
    );

    const hops = parseReceivedChain(headers);

    expect(hops).toHaveLength(2);
    expect(hops[0].hop).toBe(1);
    expect(hops[0].from).toBe("first.example.com");
    expect(hops[1].from).toBe("second.example.com");
  });

  it("extracts the relay, protocol and timestamp", () => {
    const headers = unfoldHeaders(
      "Received: from mail.example.com by mx.internal.com with ESMTPS id abc; Mon, 07 Sep 2026 10:42:03 +0000",
    );

    const [hop] = parseReceivedChain(headers);

    expect(hop.by).toBe("mx.internal.com");
    expect(hop.protocol).toBe("ESMTPS");
    expect(hop.timestamp).toBe("Mon, 07 Sep 2026 10:42:03 +0000");
  });

  it("extracts IPv4 addresses and de-duplicates them", () => {
    const headers = unfoldHeaders(
      "Received: from x (x [185.203.116.42]) by y (185.203.116.42)",
    );

    const [hop] = parseReceivedChain(headers);

    expect(hop.ips).toEqual(["185.203.116.42"]);
  });

  it("does not treat an out-of-range dotted quad as an address", () => {
    const headers = unfoldHeaders("Received: from x (999.999.999.999)");

    expect(parseReceivedChain(headers)[0].ips).toEqual([]);
  });

  it("returns an empty chain when no Received headers exist", () => {
    expect(parseReceivedChain(unfoldHeaders("From: a@b.com"))).toEqual([]);
  });
});

describe("parseAuthentication", () => {
  it("reads results from Authentication-Results", () => {
    const headers = unfoldHeaders(
      "Authentication-Results: mx.example.com; spf=pass; dkim=pass; dmarc=pass",
    );

    const auth = parseAuthentication(headers);

    expect(auth.spf.result).toBe("pass");
    expect(auth.dkim.result).toBe("pass");
    expect(auth.dmarc.result).toBe("pass");
  });

  it("falls back to Received-SPF when no consolidated result exists", () => {
    const headers = unfoldHeaders(
      "Received-SPF: softfail (mailfrom) identity=mailfrom; client-ip=1.2.3.4",
    );

    expect(parseAuthentication(headers).spf.result).toBe("softfail");
  });

  it("reports 'none' rather than guessing when nothing is present", () => {
    const auth = parseAuthentication(unfoldHeaders("From: a@b.com"));

    expect(auth.spf.result).toBe("none");
    expect(auth.dkim.result).toBe("none");
    expect(auth.dmarc.result).toBe("none");
  });

  it("detects a DKIM signature header when no result was recorded", () => {
    const headers = unfoldHeaders("DKIM-Signature: v=1; a=rsa-sha256; d=example.com");

    expect(parseAuthentication(headers).dkim.result).toBe("present");
  });

  it("fails alignment when the From and Return-Path domains differ", () => {
    const headers = unfoldHeaders(
      "From: <finance@secure-payments.com>\nReturn-Path: <bounce@other-domain.net>",
    );

    const { alignment } = parseAuthentication(headers);

    expect(alignment.result).toBe("fail");
    expect(alignment.detail).toContain("secure-payments.com");
  });

  it("passes alignment when the domains match", () => {
    const headers = unfoldHeaders(
      "From: <a@example.com>\nReturn-Path: <bounce@example.com>",
    );

    expect(parseAuthentication(headers).alignment.result).toBe("pass");
  });

  it("reports alignment as unknown when a required header is missing", () => {
    const headers = unfoldHeaders("From: <a@example.com>");

    expect(parseAuthentication(headers).alignment.result).toBe("unknown");
  });
});

describe("extractIndicators", () => {
  it("extracts addresses, domains and hop IPs", () => {
    const result = extractIndicators(unfoldHeaders(SAMPLE_HEADERS));

    const values = result.map((indicator) => indicator.value);

    expect(values).toContain("finance@secure-payments.com");
    expect(values).toContain("secure-payments.com");
    expect(values).toContain("185.203.116.42");
  });

  it("flags a Reply-To domain that differs from the From domain", () => {
    const result = extractIndicators(unfoldHeaders(SAMPLE_HEADERS));

    const replyDomain = result.find(
      (indicator) => indicator.value === "mail-reply-service.net",
    );

    expect(replyDomain).toBeDefined();
    expect(replyDomain.note).toMatch(/differs/i);
  });

  it("de-duplicates repeated indicators", () => {
    const result = extractIndicators(unfoldHeaders(SAMPLE_HEADERS));
    const values = result.map((indicator) => indicator.value);

    expect(new Set(values).size).toBe(values.length);
  });

  it("marks every extracted indicator unknown, since headers cannot assign a verdict", () => {
    const result = extractIndicators(unfoldHeaders(SAMPLE_HEADERS));

    expect(result.every((indicator) => indicator.verdict === "unknown")).toBe(
      true,
    );
  });
});

describe("assessHeaders", () => {
  it("scores a failing message highly and explains every contribution", () => {
    const { score, signals } = assessHeaders(unfoldHeaders(SAMPLE_HEADERS));

    expect(score).toBeGreaterThan(50);
    expect(signals.length).toBeGreaterThan(0);
    expect(signals.every((signal) => signal.weight > 0)).toBe(true);
    expect(signals.every((signal) => Boolean(signal.detail))).toBe(true);
  });

  it("identifies the specific failures in the sample", () => {
    const { signals } = assessHeaders(unfoldHeaders(SAMPLE_HEADERS));
    const names = signals.map((signal) => signal.name);

    expect(names).toContain("SPF did not pass");
    expect(names).toContain("DMARC failed");
    expect(names).toContain("No DKIM signature");
    expect(names).toContain("Reply-To domain differs from From");
    expect(names).toContain("Urgency language in subject");
  });

  it("does not invent an alignment failure when From and Return-Path agree", () => {
    // In the sample both are secure-payments.com, so alignment genuinely
    // passes. That is the instructive part: alignment passing does not make a
    // message safe — here the diverging Reply-To is the real giveaway.
    const { signals, authentication } = assessHeaders(
      unfoldHeaders(SAMPLE_HEADERS),
    );

    expect(authentication.alignment.result).toBe("pass");

    expect(signals.map((signal) => signal.name)).not.toContain(
      "Sender alignment failed",
    );
  });

  it("never exceeds the score ceiling", () => {
    const hostile = unfoldHeaders(
      [
        "Authentication-Results: mx; spf=fail; dkim=fail; dmarc=fail",
        "From: <a@one.com>",
        "Reply-To: <b@two.com>",
        "Return-Path: <c@three.com>",
        "Subject: URGENT action required verify immediately",
      ].join("\n"),
    );

    expect(assessHeaders(hostile).score).toBeLessThanOrEqual(100);
  });

  it("produces a low score for a fully authenticated, aligned message", () => {
    const clean = unfoldHeaders(
      [
        "Received: from mail.example.com by mx.example.com with ESMTPS; Mon, 07 Sep 2026 10:00:00 +0000",
        "Authentication-Results: mx.example.com; spf=pass; dkim=pass; dmarc=pass",
        "From: <news@example.com>",
        "Return-Path: <news@example.com>",
        "Subject: Weekly summary",
      ].join("\n"),
    );

    expect(assessHeaders(clean).score).toBe(0);
  });
});

describe("parseEmailHeaders", () => {
  it("reports failure for input with no headers", () => {
    const result = parseEmailHeaders("this is not an email");

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/no headers/i);
  });

  it("reports failure for empty input", () => {
    expect(parseEmailHeaders("").ok).toBe(false);
    expect(parseEmailHeaders(null).ok).toBe(false);
  });

  it("returns a complete analysis for the sample message", () => {
    const result = parseEmailHeaders(SAMPLE_HEADERS);

    expect(result.ok).toBe(true);
    expect(result.from).toBe("finance@secure-payments.com");
    expect(result.subject).toBe("Urgent Invoice Payment Required");
    expect(result.messageId).toBe("<8812.1757241718@secure-payments.com>");
    expect(result.hops).toHaveLength(2);
    expect(result.headerCount).toBeGreaterThan(10);
    expect(result.score).toBeGreaterThan(0);
  });

  it("orders the summary by what an analyst reads first", () => {
    const { summary } = parseEmailHeaders(SAMPLE_HEADERS);

    expect(summary[0].key).toBe("from");
    // Only headers that are actually present appear in the summary.
    expect(summary.every((item) => item.value)).toBe(true);
  });

  it("puts the true origin first in the reconstructed path", () => {
    const { hops } = parseEmailHeaders(SAMPLE_HEADERS);

    expect(hops[0].ips).toContain("185.203.116.42");
    expect(hops[1].ips).toContain("203.0.113.24");
  });
});
