---
title: "Precision starts with structure."
description: "A control process, a real-time data plane and an explicitly checked hand-off. The conceptual architecture below shows the work completed, the core now being built and the integration still ahead."
eyebrow: "Architecture"
---

## A deliberately small real-time core

The architecture centres on a precise slot clock, an event ring, an executor and a core plan. These components are in progress. The timing core is designed to record every late wake-up; deterministic real-time behaviour remains a measurement goal, not a completed end-to-end result.

The host platform profile is also in progress. It checks CPU isolation, NUMA locality, PCIe links and timers before startup.

## A bounded concurrency claim

The Rust control-process skeleton and configuration hand-off are in progress. The hand-off between the control process and the data plane is the one lock-free component being checked with GenMC under two memory models. Deliberately injected defects must be detected. This is a claim about that component, not a proof of the entire O-RU.

## A radio without hardware

The BFP compression codec is complete and has been checked against the O-RAN CUS-plane specification and real DU traffic. The deterministic virtual radio is also complete, providing the basis for bit-exact testing without radio hardware.

These completed components do not imply a complete, integrated radio system.

## What is still being integrated

Phase 2 covers fronthaul packet I/O, the slot table, integration and the real-time virtual radio. Level 3 will connect NeoRU to a real DU using the virtual radio. Level 4 will move to the real radio bench for a comparison under the same conditions as the reference baseline.

GPU and FPGA acceleration, integrated sensing and communication (ISAC), massive MIMO and a dedicated hardware board are later work.

## Architecture detail pending

Exact process boundaries, interface names and plane ownership will be added from an approved public specification. The diagram is a high-level explanation, not an interface contract or a claim of current end-to-end interoperability.
