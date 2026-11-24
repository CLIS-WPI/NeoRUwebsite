---
title: "The process is part of the product."
description: "Specifications before implementation. Tests before confidence. NeoRU is developed with explicit review gates and a provenance record for every change."
eyebrow: "How we build"
---

## Specify the contract

The architecture RFC and seven interface specifications are complete. They establish the intended architecture and interfaces before implementation. The RFC also covers virtual-radio and ISAC extensions and the development plan; an extension in the design is not a completed product feature.

## Write the tests

The development process is test-first. Unit tests and the deterministic virtual radio provide ways to check behaviour without treating a successful demonstration as sufficient evidence.

## Implement within the gates

AI-assisted development operates under strict human-approved gates. A provenance record accompanies every change. Automation assists the work; human approval governs what moves forward.

## Run the automated checks

The isolated development environment and CI gates are complete. Checks include unit tests, AddressSanitizer (ASan), UndefinedBehaviorSanitizer (UBSan), ThreadSanitizer (TSan) and an AArch64 build under emulation.

Passing a CI check establishes what that check covers. It does not establish real-time behaviour or hardware performance.

## Check the concurrency boundary

Verification of the configuration hand-off is in progress. GenMC checks this lock-free component under two memory models, and deliberately injected defects must be caught. The model names and public verification report are pending release.

This work is confined to the configuration hand-off between the control process and data plane. It is not a claim that all concurrency or the entire system has been formally verified.

## Measure before comparing

The baseline measurement method and first reference O-RU baseline are complete. NeoRU’s real-DU and radio-bench validation remain planned. Any future comparison must use the same conditions as the reference and retain its measurement provenance.
