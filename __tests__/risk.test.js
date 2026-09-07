import { describe, expect, it } from "vitest";

import {
  clampScore,
  riskBand,
  riskLabel,
  riskTone,
  needsReview,
  summarizeRisk,
  RISK_BANDS,
} from "@/lib/utils/risk";

describe("clampScore", () => {
  it("passes through a valid score", () => {
    expect(clampScore(72)).toBe(72);
  });

  it("clamps out-of-range values into 0-100", () => {
    expect(clampScore(-40)).toBe(0);
    expect(clampScore(140)).toBe(100);
  });

  it("rounds fractional scores", () => {
    expect(clampScore(72.4)).toBe(72);
    expect(clampScore(72.6)).toBe(73);
  });

  it("treats non-numeric input as zero rather than throwing", () => {
    expect(clampScore(undefined)).toBe(0);
    expect(clampScore(null)).toBe(0);
    expect(clampScore("not a number")).toBe(0);
    expect(clampScore(Number.NaN)).toBe(0);
    expect(clampScore(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it("accepts numeric strings, since form input arrives as text", () => {
    expect(clampScore("81")).toBe(81);
  });
});

describe("riskBand", () => {
  it("selects the band at each lower boundary", () => {
    expect(riskBand(90).id).toBe("critical");
    expect(riskBand(75).id).toBe("high");
    expect(riskBand(40).id).toBe("suspicious");
    expect(riskBand(20).id).toBe("low");
    expect(riskBand(0).id).toBe("safe");
  });

  it("selects the lower band just below each boundary", () => {
    expect(riskBand(89).id).toBe("high");
    expect(riskBand(74).id).toBe("suspicious");
    expect(riskBand(39).id).toBe("low");
    expect(riskBand(19).id).toBe("safe");
  });

  it("always returns a band, even for invalid input", () => {
    expect(riskBand(undefined).id).toBe("safe");
    expect(riskBand(1000).id).toBe("critical");
  });

  it("has bands ordered from highest to lowest threshold", () => {
    const thresholds = RISK_BANDS.map((band) => band.min);

    expect(thresholds).toEqual([...thresholds].sort((a, b) => b - a));
  });
});

describe("riskLabel and riskTone", () => {
  it("derives the label from the score", () => {
    expect(riskLabel(92)).toBe("Critical");
    expect(riskLabel(81)).toBe("High Risk");
    expect(riskLabel(46)).toBe("Suspicious");
    expect(riskLabel(6)).toBe("Safe");
  });

  it("derives a tone that exists in the tone system", () => {
    expect(riskTone(92)).toBe("critical");
    expect(riskTone(81)).toBe("high");
    expect(riskTone(46)).toBe("warn");
    expect(riskTone(34)).toBe("info");
    expect(riskTone(6)).toBe("safe");
  });
});

describe("needsReview", () => {
  it("flags anything at or above the suspicious threshold", () => {
    expect(needsReview(40)).toBe(true);
    expect(needsReview(92)).toBe(true);
  });

  it("does not flag scores below the threshold", () => {
    expect(needsReview(39)).toBe(false);
    expect(needsReview(0)).toBe(false);
  });
});

describe("summarizeRisk", () => {
  it("counts records into their bands", () => {
    const records = [
      { risk: 92 },
      { risk: 95 },
      { risk: 80 },
      { risk: 50 },
      { risk: 5 },
    ];

    expect(summarizeRisk(records)).toEqual({
      critical: 2,
      high: 1,
      suspicious: 1,
      low: 0,
      safe: 1,
    });
  });

  it("returns zeroed counts for an empty list", () => {
    const summary = summarizeRisk([]);

    expect(Object.values(summary).every((count) => count === 0)).toBe(true);
  });

  it("accepts a custom score accessor", () => {
    const records = [{ score: 92 }, { score: 10 }];

    const summary = summarizeRisk(records, (record) => record.score);

    expect(summary.critical).toBe(1);
    expect(summary.safe).toBe(1);
  });
});
