---
title: "A software radio unit. Built to be measured."
description: "NeoRU is a software O-RU for O-RAN split 7.2x, developed at WPI’s CLIS Lab. It brings precise timing, a deterministic virtual radio and an evidence-led engineering process to an open radio project. The goal: one 20 MHz, 2×2 carrier on about one CPU core. End-to-end measurement is still ahead."
eyebrow: "Open radio research"
---

### Measured, not claimed.

Performance figures belong with the conditions that produced them. NeoRU will be compared with the reference only after both have been measured under the same conditions.

### Timing, made visible.

A precise slot clock is at the centre of the timing core now in development. Every late wake-up is to be recorded, making real-time behaviour something to inspect.

### Concurrency, checked carefully.

The configuration hand-off is the project’s one lock-free component. Its verification work uses GenMC under two memory models, with injected defects that the checks must catch.

### A radio without the hardware.

The deterministic virtual radio is complete. It provides a foundation for bit-exact testing without radio hardware; integrated real-time and real-DU testing remain ahead.

### Know the platform first.

The host platform profile is being built to check CPU isolation, NUMA locality, PCIe links and timers before startup. Predictable execution begins with an understood environment.

### Engineering in the open.

Specifications and tests come first. CI checks, human-approved gates and a provenance record govern AI-assisted development. The project is licensed under Apache 2.0; the code is not public yet.
