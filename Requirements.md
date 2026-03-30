# DX-Ray Hack

Every developer team has invisible friction — slow builds that nobody questions, flaky tests everyone reruns, onboarding docs that went stale six sprints ago. These problems hide in plain sight because nobody has time to look.

DX-Ray is a hackathon built around one metaphor: the diagnostic X-ray scan. Just like a medical X-ray reveals what's hidden beneath the surface, DX-Ray challenges you to build tools that scan development processes and reveal the friction nobody talks about.

Scan a real pain point. Build a tool that makes invisible problems visible — and fixable.

## The Challenge

Build a tool that diagnoses a real developer experience problem and makes it visible and fixable.
Think of it like a medical X-ray — your tool scans a development process and reveals what's broken underneath.

## Checklist

### CRITICAL

1 Slow CI/CD pipelines

Average build times exceed 15 minutes, blocking developer flow

2 Flaky test suites

23% of test failures are not related to actual code changes

3 Context switching tax

Developers switch tools 30+ times per hour during debugging

### Warning

4 Stale documentation

40% of internal docs haven't been updated in 6+ months

5 Onboarding bottlenecks

New developers take 3+ weeks to make their first meaningful commit

6 PR review lag

Average time-to-first-review exceeds 24 hours

### INFO

7 Dependency confusion

Teams average 847 transitive dependencies with unknown security status

8 Environment drift

"Works on my machine" accounts for 15% of bug reports

## 8 TRACKS

Pick one at a time. Finish it and then start another one.

### A · Build & CI Scanner

Slow or flaky CI/CD pipelines

Build time heatmap, CI bottleneck detector, flaky step identifier

### B · Test Health X-Ray

Unreliable test suites

Flaky test detector, coverage gap visualizer, test execution profiler

### C · Docs Freshness Scan

Stale or missing documentation

Doc staleness dashboard, code-to-doc drift detector, auto API changelog

### D · Onboarding Diagnostic

Painful new-developer experience

Onboarding progress tracker, environment setup validator, codebase map

### E · Dependency X-Ray

Hidden supply chain risks

Dependency risk scorer, supply chain visualizer, smart update advisor

### F · Developer Flow Scan

Context switching and lost focus

Focus time tracker, tool-switching heatmap, meeting impact analyzer

### G · Code Review Radar

Bottlenecks in the review process

Review time dashboard, smart reviewer assignment, PR complexity scorer

### H · Environment Integrity Check

"Works on my machine" problems

Environment diff tool, config drift detector, reproducibility scorer

## WHAT A GOOD SUBMISSION LOOKS LIKE

1. Scan

Detect a real DX problem (from code, git history, CI logs, configs, etc.)

2. Visualize

Make the invisible friction visible (dashboard, report, CLI output)

3. Act

Suggest or automate a fix

Example: A tool that scans your git log, finds that builds are 3x slower on Mondays, shows a heatmap, and recommends splitting the CI pipeline.
