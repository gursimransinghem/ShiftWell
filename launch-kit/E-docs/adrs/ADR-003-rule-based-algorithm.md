# ADR-003: Deterministic Rule-Based Algorithm Over Machine Learning

**Status:** Accepted
**Date:** 2026-04-18

## Context

ShiftWell's core value proposition is **science-backed circadian sleep optimization** for shift workers. The algorithm generates personalized sleep/nap/meal/light recommendations tied to shift schedules and personal calendar.

Key requirements:
- **Explainability:** Shift workers and healthcare providers need to understand *why* an app recommends sleep at 2 AM and light exposure at dawn (not a black-box ML model)
- **Regulatory clarity:** FDA/medical boards scrutinize health recommendations; deterministic algorithms are easier to validate and defend than ML black-box models
- **Reproducibility:** Same shift schedule + calendar input must produce identical outputs (testable, debuggable)
- **Science foundation:** Algorithm is based on published research: Borbely Two-Process Model (1982), AASM Guidelines (2015/2023), Eastman & Burgess circadian shifting (2009), NIOSH protocols, Czeisler et al. bright light timing, and Manoogian et al. time-restricted eating
- **Testing rigor:** 1,059 tests across 71 suites validate algorithm correctness; tests must pass before every commit

Alternatives considered:
- **Machine Learning (neural networks, regression):** Could personalize faster with more data, but requires training corpus, lacks transparency, and poses regulatory risk
- **Hybrid (rules + ML):** Rules for baseline, ML for personalization; adds complexity without MVP need

## Decision

Use a **deterministic, rule-based engine** (in `src/lib/circadian/`) anchored to published sleep science. Algorithm is parameterized (e.g., melatonin phase, sleep debt, circadian phase) but fully reproducible and testable.

## Consequences

### Positive
- **Explainable:** Every recommendation includes a reason ("You have 90 minutes sleep debt → nap 2–2:45 PM"; "Circadian phase 03:00 → dim lights until 07:00")
- **Testable:** 1,059 tests validate algorithm outputs; regressions caught immediately
- **Regulatory clarity:** Rule-based health recommendations face lower FDA scrutiny than ML; medically defensible
- **No training data needed:** Algorithm works from day 1; no cold-start problem with new users
- **Reproducibility:** Identical input → identical output; debugging and auditing are straightforward
- **Deterministic updates:** Algorithm improvements can be versioned and rolled back (not "model retraining uncertainty")

### Negative
- **Limited personalization:** Without ML, adaptation to individual circadian preferences is slower; relies on user feedback loops
- **Maintenance burden:** Algorithm rules must be manually tuned; scaling to 1M+ users requires A/B testing infrastructure
- **Edge case handling:** Some complex shift patterns (e.g., rotating 4-3-3 forward+backward) may not have rule-based solutions; deferred to phase 3 or ML layer
- **Competitive risk:** Competitors with ML personalization may eventually outpace on user satisfaction (mitigated by being first-to-market with science-backed approach)

### Neutral
- **Phase 2+ adaptivity:** User feedback loops (mood, energy, sleep quality logs) can feed back to rule parameters without ML; this is acceptable for now
- **Wearable integration:** WHOOP HRV data and Apple HealthKit inform rule parameters (sleep debt, circadian phase) but don't replace the rules themselves

---
**Linked Documents:**
- `docs/research/RECOVERY_ALGORITHM_SCIENCE.md` — scientific foundation and literature
- `src/lib/circadian/` — algorithm implementation

**Created:** 2026-04-18
**Last Reviewed:** 2026-04-18
**Last Edited:** 2026-04-18
**Review Notes:** Initial creation — launch documentation package. Emphasizes regulatory clarity, explainability, and science foundation for health app.
