# Direction plan: higher education, electrical and computer engineering (15 courses, 65 topics)

Written from the brief, `src/data/taxonomy.ts` (`COURSES`, read as text), `docs/MODULE_GUIDE.md`
("Standards"), `docs/LAYOUTS.md`, `docs/EQUATION_INPUTS.md`, `docs/PICTURES.md`, the type files
for the kinds reused here, `src/engine/units.ts` and the pilot `he.engineering.circuits-1#0` in
`src/data/modules/college.ts`. Nothing was copied from `research/`; no college questions have
been collected yet, so each topic lists the common exam and textbook question types instead of
released items (Part 4 plans the collection). Every example was worked by hand.

Courses, in the order to build (prerequisites first within each field):

| #   | Course id                              | Title                                | Field      | Topics |
| --- | -------------------------------------- | ------------------------------------ | ---------- | ------ |
| 1   | `he.engineering.circuits-1`            | Circuit Analysis I                   | electrical | 5      |
| 2   | `he.engineering.circuits-2`            | Circuit Analysis II                  | electrical | 5      |
| 3   | `he.engineering.electronics`           | Electronics                          | electrical | 4      |
| 4   | `he.engineering.signals-systems`       | Signals & Systems                    | electrical | 5      |
| 5   | `he.engineering.control-systems`       | Control Systems                      | electrical | 5      |
| 6   | `he.engineering.electromagnetics`      | Engineering Electromagnetics         | electrical | 4      |
| 7   | `he.engineering.power-systems`         | Power Systems                        | electrical | 4      |
| 8   | `he.engineering.communication-systems` | Communication Systems                | electrical | 4      |
| 9   | `he.engineering.digital-logic`         | Digital Logic Design                 | computer   | 4      |
| 10  | `he.engineering.discrete-math`         | Discrete Mathematics                 | computer   | 5      |
| 11  | `he.engineering.data-structures`       | Data Structures & Algorithms         | computer   | 4      |
| 12  | `he.engineering.computer-architecture` | Computer Organization & Architecture | computer   | 4      |
| 13  | `he.engineering.embedded-systems`      | Embedded Systems                     | computer   | 4      |
| 14  | `he.engineering.operating-systems`     | Operating Systems                    | computer   | 4      |
| 15  | `he.engineering.networks`              | Computer Networks                    | computer   | 4      |

## Part 1. Decisions

- **Word rules.** The Grades 9–12 rules hold: sentences ≤ 35 words, ≤ 10 values a page, every
  value named first with its symbol after ("Load resistance (R_L)", "Damping ratio (ζ)"). A page
  that needs more than 10 values is split into problem types, never widened. No exception is
  argued for: every college page below fits in 10.
- **Symbols and notation (electrical).** SI with engineering prefixes (kΩ, μF, mH, MHz, ns).
  The imaginary unit is **j** (j² = −1) on every electrical page, as circuits and signals texts
  write it; the first assumption of each phasor page says so, because the math pages use i.
  Phasors are written in polar form with the angle sign, "10∠30° V", and in rectangular form
  "8 + j6 Ω"; phase angles in degrees, angular frequency ω in rad/s, f in Hz. Amplitudes are
  peak unless the name says rms ("RMS voltage (V_rms)"); every AC power page uses rms.
  Passive sign convention throughout (current enters the + terminal: P > 0 absorbs).
  Decibels: 20 log₁₀ for voltage and current ratios, 10 log₁₀ for power; dBm is referred to
  1 mW, dBi to an isotropic antenna. Per-unit values carry the unit "pu".
- **Symbols and notation (computer).** Binary with a subscript (101101₂), hexadecimal with
  0x on architecture and embedded pages (as assembly writes it: 0x2D) and ₁₆ on digital-logic
  pages; log₂, ⌈ ⌉, ⌊ ⌋ and mod written as symbols (the courses write them). Memory sizes in
  binary prefixes (1 KiB = 1024 bytes; the assumption names it, since many texts write KB),
  link rates and file sizes on network pages in decimal prefixes (1 Mb/s = 10⁶ bits/s,
  1 MB = 10⁶ bytes); bits are "b", bytes "B".
- **Constants (one place, used everywhere).** ε₀ = 8.854 × 10⁻¹² F/m, μ₀ = 4π × 10⁻⁷ H/m,
  c = 3.00 × 10⁸ m/s, η₀ = 376.7 Ω (≈ 120π), k = 1.381 × 10⁻²³ J/K, thermal voltage
  V_T = kT/q = 25.85 mV at 300 K (the assumption names the temperature; Sedra–Smith's 25 mV is
  accepted as a rounding), noise reference T₀ = 290 K (so kT₀ = −174 dBm/Hz), copper
  σ = 5.8 × 10⁷ S/m, diode drop 0.7 V (silicon, constant-drop model), V_BE = 0.7 V.
- **Calculus in steps.** No symbolic calculus: every derivative, integral or transform is used
  through its closed form, and the assumption names the form ("The capacitor charges as
  v(t) = V_f + (V₀ − V_f)e^(−t/τ)", "From the transform table, 1/(s + a) ↔ e^(−at)"). Steps show
  the substitution and one line per stage (`simplify.ts`), never "integrate". Laplace and
  z-transform pages work with coefficients (poles, residues), not expressions. Partial-fraction
  residues are shown as the cover-up rule, one line each.
- **Linear systems.** Node and mesh pages solve a 2 × 2 system; the step-by-step shows the
  system as a matrix and Cramer's rule with the `matrixGrid` determinant mode (as the Grade 12
  pages do), not elimination by words. 3 × 3 systems are left to a later need (E8).
- **Complex numbers.** Until the solver has complex values (E2), a phasor or impedance is two
  values: magnitude and angle, or real and imaginary part, with the conversions as relations
  (|Z| = √(R² + X²), θ = atan2(X, R)). Pages that need complex division or products of phasors
  (parallel impedances, transmission-line input impedance, symmetrical components, the
  synchronous-generator phasor) are ⏳ E2.
- **Calculators vs layouts.** A topic is a calculator when its exam questions are numbers from
  a relation (most of electrical, and the counting, timing and sizing parts of computer
  engineering). It is a layout when the answer is a classification, an order or a structure:
  sorts (gate identity, process states, protocol traits, logical equivalence, valid argument
  forms, Euler graphs, hazards, addressing modes, layers, file allocation, Maxwell's laws,
  function properties, transistor regions, system properties, pole positions), sequences
  (induction proof, FSM design, interrupt entry, encapsulation, TCP handshake, growth rates,
  merge-sort passes, Dijkstra's finalised order, BST traversal) and explorations whose figure is
  a structure (K-map, truth table, state diagram, stack and queue). Five main pages are layouts
  (`digital-logic#1`, `digital-logic#3`, `discrete-math#0`, `data-structures#0`,
  `operating-systems#0`); every other main page is a calculator. Proof-writing itself gets no page (a proof is an essay; the
  induction sequence and the equivalence sort carry what a page can check).
- **Text answers.** A page whose answer is a word (cutoff, triode or saturation; stable or not;
  O(n log n)) is a sort, or a calculator whose numeric answer the step-by-step names in words
  (the master-theorem exponent, then "so T(n) = Θ(n² log n)"). Named outputs wait on E10.
- **Ranges.** Ranges come from the devices and data a course uses, and impossible inputs are
  closed with `allowed` or `derived`, not narrower ranges: logic levels `allowed: [0, 1]`; bit
  widths `allowed: [4, 8, 10, 12, 16, 24, 32, 64]` where a page means hardware widths; prefix
  lengths 0–32; damping ratio 0–5; probabilities 0–1 with the sum checked as a page limit
  ("The probabilities add to 1"), never as a relation.
- **Value caps.** Main pages 5–10 values; problem types 3–8.
- **Pilot.** `he.engineering.circuits-1#0` is kept as the course's model (its relations,
  steps and `seriesCircuit` picture stay). One change: its value names are things, not
  measures ("Resistor 1" reads as a part); rename to "Resistance 1 (R₁)", "Resistance 2 (R₂)",
  and the voltages "Voltage across R₁ (V₁)" stay.
- **What the engine can't do yet** (Part 4, "Engine needs"): the units these courses use (E1),
  complex values (E2), numbers shown in base 2 and 16 and IPv4 dotted quads (E3), floor,
  ceiling, mod and minimum in steps (E4), iterated and simulated steps (E5), short sequences as
  values (E6), Q-function and sinc (E7), simultaneous linear solves (E8), exact integers past
  2⁵³ (E9) and named outputs (E10).
- **Page count:** 65 main + 191 problem types = **256 pages**: 223 calculators and 33 layouts
  (19 sorts, 10 sequences, 4 explorations); 118 wait on an engine or picture need (⏳), 138 can
  be built today.

## Part 2. Courses and topics

Each topic gives: what exams and textbooks ask (→ the page that answers it), the main page and
its problem types (purpose, picture, values with ranges, relations, assumptions where they
matter, a worked example, `startWith`, a use line), and a verdict. ⏳ marks a page that waits on
an engine need (E#) or a picture (P#); a ⏳ page can be built with the stand-in named.

## 1. he.engineering.circuits-1 — Circuit Analysis I (after he.physics.university-2)

- **Textbooks:** Fiore, _DC Electrical Circuit Analysis_ (ch. 2–8); Kuphaldt, _Lessons in
  Electric Circuits_ vol. I (ch. 5–10, 13–16); Johnson, _Fundamentals of Electrical
  Engineering I_ (ch. 3); MIT OCW 6.002 (lectures 1–4, 7, 14–16). Titles only: Alexander &
  Sadiku ch. 2–7, Nilsson & Riedel ch. 2–7, Hayt ch. 2–8.
- **Order:** the course's own order (laws, analysis methods, theorems, op-amps, first-order
  transients); the RLC natural response sits at the end of #4 as a problem type, since half
  the programs teach it in Circuits I and half in II.

### 1.0 `he.engineering.circuits-1#0` — Ohm's and Kirchhoff's laws

- **Asks:** current and drops in a series loop → main; equivalent resistance and branch
  currents of a parallel pair → ~parallel; series-parallel reduction → ~series-parallel; power
  absorbed or delivered with the passive sign convention → ~power-sign; voltage divider → main.
- **Main — KEEP (pilot):** `seriesCircuit`, values V, I, R₁, R₂, V₁, V₂, Rₜ, P (rename the two
  resistances, Part 1). Example 12 V, 2 Ω, 4 Ω → I = 2 A, V₁ = 4 V, V₂ = 8 V, P = 24 W.
- **~parallel — BUILD ⏳ P1 (stand-in `circuit` parallel, two bulbs):** values source voltage V
  (0–1000 V), R₁, R₂ (0.1 Ω–1 MΩ), equivalent resistance R_eq, branch currents I₁, I₂, total
  current I. Relations: R_eq = R₁R₂ ÷ (R₁ + R₂); I₁ = V ÷ R₁; I₂ = V ÷ R₂; I = I₁ + I₂ (KCL);
  I₁ = I × R₂ ÷ (R₁ + R₂) (current divider). Assumptions: both resistors see the full source
  voltage; R_eq is less than the smaller resistor. Example 12 V, 6 Ω, 3 Ω → R_eq = 2 Ω,
  I₁ = 2 A, I₂ = 4 A, I = 6 A. startWith V, R₁, R₂. Use: "Use this for 'A 6 Ω and a 3 Ω resistor
  are in parallel across 12 V. Find each current.'"
- **~series-parallel — BUILD:** `circuit` `mixed` (H68, R₁ + R₂ ∥ R₃). Values V, R₁, R₂, R₃,
  R₂∥R₃, Rₜ, I, V₁, I₂, I₃. Relations: R_p = R₂R₃ ÷ (R₂ + R₃); Rₜ = R₁ + R_p; I = V ÷ Rₜ;
  V₁ = IR₁; I₂ = (V − V₁) ÷ R₂; I₃ = I − I₂. Example 24 V, 4 Ω, 6 Ω, 12 Ω → R_p = 4 Ω, Rₜ = 8 Ω,
  I = 3 A, V₁ = 12 V, I₂ = 2 A, I₃ = 1 A.
- **~power-sign — BUILD ⏳ P1 (one element, + and − marked, current arrow):** values voltage
  across V (−1000–1000 V), current into + terminal I (−1000–1000 A), power absorbed P. Relation:
  P = VI. Assumptions: passive sign convention; P > 0 absorbs, P < 0 delivers; the powers in a
  circuit add to 0. Example V = 5 V, I = −2 A → P = −10 W: the element delivers 10 W.
- **Verdict:** 4 pages; the pilot stays, three types cover the rest of the chapter.

### 1.1 `he.engineering.circuits-1#1` — Node and mesh analysis

- **Asks:** two node voltages with a voltage and a current source → main; two mesh currents
  → ~mesh; the current in a shared branch → ~mesh; supernode → ~supernode.
- **Main — BUILD ⏳ P1 (`net: 'twoNode'`) and E8 (stand-in: the relations solved in closed
  form, below):** values source voltage V_s (−100–100 V), current source I_s (−1–1 A, mA
  shown), R₁ … R₄ (1 Ω–1 MΩ), node voltages V₁, V₂. Circuit: V_s through R₁ to node 1, R₂
  node 1 to ground, R₃ between the nodes, R₄ node 2 to ground, I_s into node 2. Relations (KCL
  at each node): (V₁ − V_s)/R₁ + V₁/R₂ + (V₁ − V₂)/R₃ = 0; (V₂ − V₁)/R₃ + V₂/R₄ = I_s. Steps: the
  conductance matrix [G₁ + G₂ + G₃, −G₃; −G₃, G₃ + G₄][V₁; V₂] = [V_s G₁; I_s], then Cramer
  (`matrixGrid` determinant lines). Example V_s = 10 V, I_s = 1 mA, R₁ = 1 kΩ, R₂ = R₃ = R₄ = 2 kΩ
  → matrix [2, −0.5; −0.5, 1] mS, right side [10, 1] mA, det = 1.75, V₁ = (10 + 0.5) ÷ 1.75 = 6 V,
  V₂ = (2 + 5) ÷ 1.75 = 4 V. Check: −4 + 3 + 1 = 0 mA at node 1. startWith V_s, I_s, R₁–R₄.
  Use: "Use this for 'Find the node voltages V₁ and V₂ by nodal analysis.'"
- **~mesh — BUILD ⏳ P1 (`net: 'twoMesh'`):** values V_a, V_b (−100–100 V), R₁, R₂ (shared),
  R₃, mesh currents I₁, I₂, shared-branch current I_R2. Relations: (R₁ + R₂)I₁ − R₂I₂ = V_a;
  −R₂I₁ + (R₂ + R₃)I₂ = −V_b; I_R2 = I₁ − I₂. Assumptions: both mesh currents clockwise; V_b's
  - terminal meets I₂ first. Example R₁ = 2 Ω, R₂ = 4 Ω, R₃ = 2 Ω, V_a = 8 V, V_b = 2 V →
    [6, −4; −4, 6], det = 20, I₁ = (48 − 8) ÷ 20 = 2 A, I₂ = (−12 + 32) ÷ 20 = 1 A, I_R2 = 1 A.
- **~supernode — BUILD ⏳ P1:** a voltage source V_x between the two nodes, R₁ node 1 to
  ground, R₂ node 2 to ground, I_s into node 1. Relations: V₁ − V₂ = V_x; V₁/R₁ + V₂/R₂ = I_s.
  Example V_x = 6 V, R₁ = 2 Ω, R₂ = 4 Ω, I_s = 6 A → V₁/2 + (V₁ − 6)/4 = 6 → V₁ = 10 V, V₂ = 4 V.
- **Verdict:** 3 pages; all wait on the schematic; the 2 × 2 solve can ship in closed form.

### 1.2 `he.engineering.circuits-1#2` — Thévenin and Norton equivalents

- **Asks:** V_Th, R_Th seen by a load → main; the load current → main; Norton form → ~norton;
  maximum power transfer → ~max-power; superposition of two sources → ~superposition.
- **Main — BUILD ⏳ P1 (`net: 'thevenin'`, the circuit and its equivalent side by side):**
  values V_s (0–1000 V), R₁ (series), R₂ (shunt), load R_L (0.1 Ω–1 MΩ), V_Th, R_Th, load current
  I_L, load voltage V_L. Relations: V_Th = V_s R₂ ÷ (R₁ + R₂); R_Th = R₁R₂ ÷ (R₁ + R₂) (source
  zeroed); I_L = V_Th ÷ (R_Th + R_L); V_L = I_L R_L. Assumptions: an independent voltage source
  is zeroed by a short; the equivalent is exact for any load. Example 12 V, 3 Ω, 6 Ω, 6 Ω →
  V_Th = 8 V, R_Th = 2 Ω, I_L = 1 A, V_L = 6 V (check: 6 Ω ∥ 6 Ω = 3 Ω, 12 ÷ 6 = 2 A, node 6 V).
  startWith V_s, R₁, R₂, R_L. Use: "Use this for 'Find the Thévenin equivalent seen by R_L and
  the current through it.'"
- **~norton — BUILD ⏳ P1:** values V_Th, R_Th, I_N. Relation V_Th = I_N R_Th. Example 8 V,
  2 Ω → I_N = 4 A.
- **~max-power — BUILD ⏳ P1:** values V_Th, R_Th, R_L, P_L, P_max. Relations:
  P_L = V_Th² R_L ÷ (R_Th + R_L)²; P_max = V_Th² ÷ (4R_Th) (at R_L = R_Th). Example 8 V, 2 Ω →
  P_max = 8 W; at R_L = 6 Ω, P_L = 64 × 6 ÷ 64 = 6 W.
- **~superposition — BUILD ⏳ P1:** values V_s, I_s, R₁, R₂, node voltage V, each part V′, V″.
  Relations: V′ = V_s R₂ ÷ (R₁ + R₂) (current source opened); V″ = I_s R₁R₂ ÷ (R₁ + R₂) (voltage
  source shorted); V = V′ + V″. Example 12 V, 3 A, 3 Ω, 6 Ω → V′ = 8 V, V″ = 6 V, V = 14 V
  (check KCL: 2/3 + 7/3 = 3 A).
- **Verdict:** 4 pages.

### 1.3 `he.engineering.circuits-1#3` — Op-amps

- **Asks:** inverting gain and output → main; non-inverting → ~non-inverting; summing amplifier
  → ~summing; difference amplifier → ~difference; output clipped at the rails → main's limit.
- **Main — BUILD ⏳ P2 (`amp: 'inverting'`; stand-in `none`):** values input voltage v_in
  (−15–15 V), input resistance R_in, feedback resistance R_f (10 Ω–10 MΩ), gain A_v, output
  v_out, supply rail V_sat (1–30 V). Relations: A_v = −R_f ÷ R_in; v_out = A_v v_in. Page limit
  (not a relation): |v_out| ≤ V_sat, rejected with "The output can't pass the supply rail."
  Assumptions: ideal op-amp: no input current, v₊ = v₋ (virtual ground); the output stays inside
  the rails. Example 10 kΩ, 47 kΩ, 0.2 V → A_v = −4.7, v_out = −0.94 V. startWith v_in, R_in, R_f.
  Use: "Use this for 'An inverting amplifier has R_in = 10 kΩ and R_f = 47 kΩ. Find v_out for
  0.2 V in.'"
- **~non-inverting — BUILD ⏳ P2:** A_v = 1 + R_f ÷ R_g. Example 10 kΩ, 30 kΩ, 0.5 V → 4, 2 V.
- **~summing — BUILD ⏳ P2:** v_out = −R_f(v₁/R₁ + v₂/R₂). Example all 10 kΩ, 1 V, 2 V → −3 V.
- **~difference — BUILD ⏳ P2:** v_out = (R₂ ÷ R₁)(v₂ − v₁), matched pairs (assumption).
  Example 10 kΩ, 50 kΩ, 1.2 V, 1.0 V → 1 V.
- **Verdict:** 4 pages, one picture need.

### 1.4 `he.engineering.circuits-1#4` — RC and RL transients

- **Asks:** capacitor voltage at time t while charging → main; time to discharge to a level
  → ~discharge; inductor current → ~rl; switching with a nonzero start → ~general; is the RLC
  over-, under- or critically damped → ~rlc-damping.
- **Main — BUILD ⏳ P4 (`functionGraph` exponential with τ marks; stand-in: family
  `exponential`, a = −V_s, k = V_s) and E1 (μF, ms):** values source V_s (0–1000 V), R (1 Ω–10 MΩ),
  C (1 pF–1 F), time constant τ, time t (0–10⁴ s), capacitor voltage v_C, current i. Relations:
  τ = RC; v_C = V_s(1 − e^(−t/τ)); i = (V_s − v_C) ÷ R. Assumptions: the capacitor starts empty;
  the switch closes at t = 0; after 5τ it is within 1% of full. Example 10 V, 10 kΩ, 100 μF →
  τ = 1 s; at t = 1 s, v_C = 10(1 − 0.368) = 6.32 V, i = 0.368 mA. startWith V_s, R, C, t.
  Use: "Use this for 'A 100 μF capacitor charges through 10 kΩ from 10 V. Find v_C after 1 s.'"
- **~discharge — BUILD ⏳ P4:** v = V₀e^(−t/τ); t = τ ln(V₀ ÷ v). Example 9 V, 2 kΩ, 50 μF →
  τ = 0.1 s; to 3 V: t = 0.1 ln 3 = 0.110 s.
- **~rl — BUILD ⏳ P4, E1 (H):** τ = L ÷ R; i = (V_s ÷ R)(1 − e^(−t/τ)). Example 12 V, 4 Ω, 2 H →
  τ = 0.5 s, final 3 A; at 1 s, i = 3(1 − e^(−2)) = 2.59 A.
- **~general — BUILD ⏳ P4:** x(t) = x_f + (x₀ − x_f)e^(−t/τ). Example v₀ = 2 V, v_f = 10 V,
  τ = 0.5 ms, t = 1 ms → 10 − 8e^(−2) = 8.92 V.
- **~rlc-damping — BUILD ⏳ P5, E10 (the name):** series RLC; values R, L, C, α = R ÷ (2L),
  ω₀ = 1 ÷ √(LC), damped frequency ω_d = √(ω₀² − α²). Example 10 Ω, 1 mH, 10 μF → α = 5000 s⁻¹,
  ω₀ = 10 000 rad/s, α < ω₀ so underdamped, ω_d = √(7.5 × 10⁷) = 8660 rad/s.
- **Verdict:** 5 pages.

## 2. he.engineering.circuits-2 — Circuit Analysis II (after circuits-1)

- **Textbooks:** Fiore, _AC Electrical Circuit Analysis_ (ch. 1–9); Kuphaldt vol. II (ch. 2–5,
  8–10); Johnson ch. 3.10–3.20; MIT OCW 6.002 (lectures 17–22). Titles only: Alexander &
  Sadiku ch. 9–14, Nilsson & Riedel ch. 9–14.
- **Order:** phasors, power, frequency response, transformers, three-phase (the course's order).

### 2.0 `he.engineering.circuits-2#0` — Phasors and AC steady state

- **Asks:** reactances at a frequency → ~reactance; impedance and current of a series RLC →
  main; convert a sinusoid to a phasor, polar ↔ rectangular → ~phasor-form; parallel RC
  impedance → ~parallel-rc; parallel complex impedances → ⏳ E2 (no page yet).
- **Main — BUILD ⏳ P6 (`complexPlane` with j, axes R and X; stand-in `complexPlane` z = R + iX)
  and E1 (rad/s, mH):** values source amplitude V (0–10⁵ V), angular frequency ω (1–10⁹ rad/s),
  R, L, C, inductive reactance X_L, capacitive reactance X_C, impedance magnitude |Z|, impedance
  angle θ, current amplitude I. Relations: X_L = ωL; X_C = 1 ÷ (ωC); |Z| = √(R² + (X_L − X_C)²);
  θ = atan2(X_L − X_C, R); I = V ÷ |Z|. Assumptions: j² = −1 and Z = R + j(X_L − X_C); steady
  state, every voltage at the source's frequency; the current lags the voltage by θ (leads when
  θ < 0). Example ω = 1000 rad/s, R = 30 Ω, L = 60 mH, C = 50 μF, V = 100 V → X_L = 60 Ω,
  X_C = 20 Ω, Z = 30 + j40 Ω, |Z| = 50 Ω, θ = 53.13°, I = 2 A lagging. startWith V, ω, R, L, C.
  Use: "Use this for 'A series RLC circuit at 1000 rad/s has R = 30 Ω, L = 60 mH, C = 50 μF.
  Find Z and the current.'"
- **~phasor-form — BUILD ⏳ P6:** values magnitude A, angle θ (−180°–180°), real part a,
  imaginary part b. Relations: a = A cos θ; b = A sin θ; A = √(a² + b²); θ = atan2(b, a). Example
  10∠36.87° = 8 + j6; v(t) = 170 cos(377t + 30°) V → 170∠30° V.
- **~reactance — BUILD, E1 (Hz, H):** values f, L, C, X_L = 2πfL, X_C = 1 ÷ (2πfC), resonant
  f₀ = 1 ÷ (2π√(LC)). Example 60 Hz, 0.1 H, 100 μF → X_L = 37.70 Ω, X_C = 26.53 Ω, f₀ = 50.33 Hz.
- **~parallel-rc — BUILD ⏳ P6:** values R, X_C, G = 1/R, B = 1/X_C, |Y| = √(G² + B²), |Z| = 1/|Y|,
  θ = −atan(B ÷ G). Example 50 Ω, 25 Ω → G = 20 mS, B = 40 mS, |Z| = 22.36 Ω, θ = −63.43°.
- **Verdict:** 4 pages; parallel complex impedances wait on E2.

### 2.1 `he.engineering.circuits-2#1` — AC power

- **Asks:** real, reactive, apparent power and power factor → main; power drawn by a given
  impedance → ~load-from-z; capacitor for power-factor correction → ~pf-correction; rms from peak
  → ~rms.
- **Main — BUILD, E1 (VA, var):** `vectorDiagram`, one arrow by components (P along, Q up,
  unit VA), `components: true`, axes named "Real power P (W)" and "Reactive power Q (var)".
  Values RMS voltage V_rms, RMS current I_rms, angle θ (−90°–90°), power factor pf, apparent power
  S, real power P, reactive power Q. Relations: S = V_rms I_rms; P = S cos θ; Q = S sin θ;
  pf = cos θ. Assumptions: θ is the voltage angle minus the current angle; Q > 0 is an inductive
  (lagging) load; the meter's numbers are rms. Example 120 V, 10 A, 36.87° → S = 1200 VA,
  P = 960 W, Q = 720 var, pf = 0.8 lagging. startWith V_rms, I_rms, θ. Use: "Use this for 'A load
  draws 10 A at 120 V with power factor 0.8 lagging. Find P, Q and S.'"
- **~load-from-z — BUILD:** values V_rms, R, X, |Z|, I_rms, P = I²R, Q = I²X. Example 120 V,
  8 + j6 Ω → 10 Ω, 12 A, P = 1152 W, Q = 864 var.
- **~pf-correction — BUILD, E1:** values P, pf₁, pf₂, V_rms, f, Q₁ = P tan(acos pf₁),
  Q₂ = P tan(acos pf₂), capacitor Q_C = Q₁ − Q₂, C = Q_C ÷ (2πfV²). Example 960 W, 0.8 → 0.95,
  120 V, 60 Hz → Q₁ = 720 var, Q₂ = 315.5 var, Q_C = 404.5 var, C = 74.5 μF.
- **~rms — BUILD:** values peak V_m, V_rms = V_m ÷ √2, R, average power P = V_rms² ÷ R. Example
  170 V → 120.2 V; across 60 Ω, P = 240.8 W. Assumption: a sine wave (a square wave's rms is its
  peak).
- **Verdict:** 4 pages, buildable once E1 lands.

### 2.2 `he.engineering.circuits-2#2` — Frequency response and filters

- **Asks:** cutoff of an RC filter → main; gain in dB and phase at a frequency → main;
  high-pass response → ~high-pass; resonance, Q and bandwidth → ~band-pass; dB conversions →
  ~decibels; sketch a Bode plot → main's picture.
- **Main — BUILD ⏳ P7 (`bode`; stand-in `table` with `graph`, rows f = fc/100 … 100fc):** RC
  low-pass. Values R, C, cutoff f_c, frequency f, gain |H|, gain in dB G, phase φ. Relations:
  f_c = 1 ÷ (2πRC); |H| = 1 ÷ √(1 + (f ÷ f_c)²); G = 20 log₁₀|H|; φ = −atan(f ÷ f_c). Assumptions:
  no load on the output; at f_c the gain is −3.01 dB and the phase −45°; far above f_c it falls
  20 dB per decade. Example 1 kΩ, 0.1 μF → f_c = 1592 Hz; at 10 kHz, f ÷ f_c = 6.283, |H| = 0.157,
  G = −16.1 dB, φ = −81.0°. startWith R, C, f. Use: "Use this for 'Find the cutoff frequency of an
  RC low-pass filter with R = 1 kΩ and C = 0.1 μF, and its gain at 10 kHz.'"
- **~high-pass — BUILD ⏳ P7:** |H| = (f/f_c) ÷ √(1 + (f/f_c)²); φ = 90° − atan(f/f_c). Example
  same R, C at 159.2 Hz → |H| = 0.0995, −20.0 dB, φ = 84.3°.
- **~band-pass — BUILD ⏳ P7:** series RLC across R; values R, L, C, f₀ = 1 ÷ (2π√(LC)),
  Q = (1/R)√(L/C), bandwidth B = f₀ ÷ Q. Example 10 Ω, 10 mH, 1 μF → f₀ = 1592 Hz, Q = 10,
  B = 159 Hz.
- **~decibels — BUILD:** G_V = 20 log₁₀(V_out/V_in), G_P = 10 log₁₀(P_out/P_in). Example 0.1 →
  −20 dB; a power ratio of 2 → 3.01 dB.
- **Verdict:** 4 pages; the Bode picture serves 4 more pages in control and electronics.

### 2.3 `he.engineering.circuits-2#3` — Transformers

- **Asks:** secondary voltage and currents of an ideal transformer → main; reflected impedance
  → main; turns ratio for matching → ~matching; coupling coefficient, mutual voltage →
  ~coupling.
- **Main — BUILD:** `induction` `mode: 'transformer'` (primary N₁, secondary N₂, voltage V₁,
  output V₂, current I₁, outputCurrent I₂). Values N₁, N₂ (1–10⁵), V₁, V₂, load R_L, I₂, I₁,
  input resistance R_in. Relations: V₂ = V₁N₂ ÷ N₁; I₂ = V₂ ÷ R_L; I₁ = I₂N₂ ÷ N₁;
  R_in = (N₁ ÷ N₂)² R_L. Assumptions: ideal: no losses, all flux links both coils; power in
  equals power out. Example 500 and 50 turns, 120 V, 4 Ω → V₂ = 12 V, I₂ = 3 A, I₁ = 0.3 A,
  R_in = 400 Ω. startWith N₁, N₂, V₁, R_L. Use: "Use this for 'A 10:1 transformer has 120 V on
  its primary and a 4 Ω load. Find the currents.'"
- **~matching — BUILD:** a = √(R_s ÷ R_L). Example 800 Ω source, 8 Ω speaker → 10:1.
- **~coupling — BUILD, E1 (mH):** k = M ÷ √(L₁L₂); v₂ = M di₁/dt. Example 4 mH, 9 mH, M = 3 mH
  → k = 0.5; at 1000 A/s, v₂ = 3 V.
- **Verdict:** 3 pages.

### 2.4 `he.engineering.circuits-2#4` — Three-phase circuits

- **Asks:** phase and line values of a balanced Y load → main; delta load → ~delta; Y–Δ
  conversion → ~wye-delta; total power from two wattmeters → ~two-wattmeter.
- **Main — BUILD ⏳ P6 (`complexPlane` `phasors` three-phase star with one line voltage):**
  values line voltage V_L, phase voltage V_ph, phase impedance |Z|, power factor pf, line current
  I_L, S, P, Q. Relations: V_ph = V_L ÷ √3; I_L = V_ph ÷ |Z|; S = √3 V_L I_L; P = S × pf;
  Q = S sin(acos pf). Assumptions: balanced load and source; rms values; in Y the line current is
  the phase current. Example 208 V, 12 Ω, pf 0.8 lagging → V_ph = 120.1 V, I_L = 10.0 A,
  S = 3.61 kVA, P = 2.88 kW, Q = 2.16 kvar. startWith V_L, |Z|, pf. Use: "Use this for 'A balanced
  Y load of 12 Ω per phase at pf 0.8 is fed at 208 V line to line. Find the line current and
  power.'"
- **~delta — BUILD ⏳ P6:** V_ph = V_L; I_ph = V_ph ÷ |Z|; I_L = √3 I_ph. Example 240 V, 20 Ω,
  pf 1 → I_ph = 12 A, I_L = 20.78 A, P = 8640 W.
- **~wye-delta — BUILD:** Z_Y = Z_Δ ÷ 3 (balanced). Example 30 Ω → 10 Ω.
- **~two-wattmeter — BUILD:** P = W₁ + W₂; tan θ = √3(W₂ − W₁) ÷ (W₁ + W₂). Example 1000 W,
  2000 W → P = 3000 W, θ = 30°, pf = 0.866.
- **Verdict:** 4 pages.

## 3. he.engineering.electronics — Electronics (after circuits-1)

- **Textbooks:** Fiore, _Semiconductor Devices: Theory and Application_ (ch. 2–10) and
  _Operational Amplifiers & Linear Integrated Circuits_ (ch. 3–10); Kuphaldt vol. III; MIT OCW
  6.012. Titles only: Sedra & Smith ch. 4–10, Razavi _Fundamentals of Microelectronics_.
- **Order:** diodes, transistors at DC, amplifiers, op-amp circuits (Sedra–Smith puts op-amps
  first; the taxonomy's order is the more common lab order and is kept).

### 3.0 `he.engineering.electronics#0` — Diodes

- **Asks:** current through a diode and resistor (constant-drop model) → main; LED series
  resistor → main; diode equation, 60 mV per decade → ~shockley; zener regulator resistor →
  ~zener; rectifier ripple and DC output → ~rectifier.
- **Main — BUILD ⏳ P8 (`deviceCurves` diode I–V with the load line and Q point; stand-in P3
  or `none`):** values source V_s (0–1000 V), diode drop V_D (0.2–3.5 V; 0.7 silicon, 1.8–3.3 V
  LEDs), R, current I, resistor voltage V_R, diode power P_D. Relations: V_R = V_s − V_D;
  I = V_R ÷ R; P_D = V_D I. Page limit: V_s > V_D ("Below its drop the diode is off; no current
  flows."). Assumptions: constant-drop model; the diode points with the current. Example 5 V,
  0.7 V, 1 kΩ → V_R = 4.3 V, I = 4.3 mA, P_D = 3.01 mW. startWith V_s, V_D, R. Use: "Use this for
  'A silicon diode and a 1 kΩ resistor are in series with 5 V. Find the current.'"
- **~shockley — BUILD ⏳ P8:** values saturation current I_S (10⁻¹⁸–10⁻⁶ A), ideality n (1–2),
  V_T (25.85 mV), V, I; I = I_S(e^(V/(nV_T)) − 1); ΔV = nV_T ln(I₂/I₁). Example 10⁻¹⁴ A, n = 1,
  0.65 V → I = 0.83 mA; ten times the current takes 59.5 mV more.
- **~zener — BUILD ⏳ P3:** values V_s, V_Z, load current I_L, minimum zener current I_Z, R =
  (V_s − V_Z) ÷ (I_L + I_Z), zener power with no load P_Z = V_Z(V_s − V_Z) ÷ R. Example 12 V,
  5.1 V, 20 mA, 5 mA → R = 276 Ω, P_Z = 127.5 mW.
- **~rectifier — BUILD ⏳ P3 (bridge with the ripple drawn):** values secondary peak V_sec,
  diode drops (2 × 0.7 V in a bridge), peak V_p, ripple frequency f_r (2 × 60 Hz), R, C, ripple
  V_r = V_p ÷ (f_r RC), V_dc ≈ V_p − V_r/2. Example 12 V, 120 Hz, 1 kΩ, 470 μF → V_p = 10.6 V,
  V_r = 0.188 V, V_dc = 10.5 V.
- **Verdict:** 4 pages.

### 3.1 `he.engineering.electronics#1` — BJTs and MOSFETs

- **Asks:** DC bias point of a voltage-divider BJT → main; I_C, I_E, α from β → ~beta; MOSFET
  drain current in saturation → ~mosfet-sat; in triode → ~mosfet-triode; which region →
  ~regions.
- **Main — BUILD ⏳ P3 (`bjtDivider`):** values V_CC (0–100 V), R₁, R₂, R_C, R_E, base voltage
  V_B, collector current I_C, V_CE. Relations: V_B = V_CC R₂ ÷ (R₁ + R₂); I_C ≈ (V_B − 0.7) ÷ R_E;
  V_CE = V_CC − I_C(R_C + R_E). Page limit: V_CE > 0.2 V ("Past this the transistor saturates;
  the active-mode formulas no longer hold."). Assumptions: stiff divider (base current
  negligible, β large); V_BE = 0.7 V; I_E ≈ I_C. Example 12 V, 40 kΩ, 10 kΩ, R_C = 3 kΩ, R_E = 1 kΩ
  → V_B = 2.4 V, I_C = 1.7 mA, V_CE = 5.2 V (active). startWith V_CC, R₁, R₂, R_C, R_E. Use: "Use
  this for 'Find I_C and V_CE for the voltage-divider bias circuit.'"
- **~beta — BUILD:** I_C = βI_B; I_E = (β + 1)I_B; α = β ÷ (β + 1). Example β = 100,
  I_B = 20 μA → I_C = 2 mA, I_E = 2.02 mA, α = 0.990.
- **~mosfet-sat — BUILD ⏳ P8 (output curves, Q point), E1 (mA/V²):** values k_n (0.01–100
  mA/V²), V_GS, V_t, overdrive V_OV = V_GS − V_t, I_D = ½k_n V_OV², least V_DS = V_OV. Assumption:
  k_n = μₙC_ox W/L (texts writing I_D = K V_OV² use K = k_n/2). Example 2 mA/V², 3 V, 1 V → V_OV =
  2 V, I_D = 4 mA, saturation needs V_DS ≥ 2 V.
- **~mosfet-triode — BUILD ⏳ P8:** I_D = k_n(V_OV V_DS − ½V_DS²). Example V_DS = 0.5 V →
  2(1 − 0.125) = 1.75 mA.
- **~regions — BUILD (sort):** n-channel, V_t = 1 V. Bins "Cutoff", "Triode", "Saturation".
  Cards: "V_GS = 0.6 V, V_DS = 5 V" and "V_GS = 0 V, V_DS = 3 V" → Cutoff; "V_GS = 3 V,
  V_DS = 0.5 V" and "V_GS = 4 V, V_DS = 1 V" → Triode; "V_GS = 3 V, V_DS = 4 V" and "V_GS = 2 V,
  V_DS = 3 V" → Saturation. Sentence: "Above V_t a channel forms; once V_DS passes V_GS − V_t it
  pinches off and the current saturates."
- **Verdict:** 5 pages.

### 3.2 `he.engineering.electronics#2` — Amplifiers

- **Asks:** g_m, r_π and the voltage gain of a common-emitter stage → main; MOSFET
  common-source gain → ~cs-mosfet; gain with source resistance → ~loading; cascaded stages in dB
  → ~cascade.
- **Main — BUILD ⏳ P3 (`smallSignal`: the hybrid-π model with R_C ∥ R_L):** values collector
  current I_C (0.01–100 mA), β, transconductance g_m, input resistance r_π, R_C, R_L,
  R_C ∥ R_L, gain A_v. Relations: g_m = I_C ÷ V_T; r_π = β ÷ g_m; R_p = R_C R_L ÷ (R_C + R_L);
  A_v = −g_m R_p. Assumptions: V_T = 25.85 mV; small signals (a few mV at the base); bypassed
  emitter; r_o ignored. Example 1 mA, β = 100, 4 kΩ, 4 kΩ → g_m = 38.7 mS, r_π = 2.59 kΩ,
  R_p = 2 kΩ, A_v = −77.4. startWith I_C, β, R_C, R_L. Use: "Use this for 'A CE amplifier biased
  at I_C = 1 mA has R_C = R_L = 4 kΩ. Find the voltage gain.'"
- **~cs-mosfet — BUILD ⏳ P3:** g_m = 2I_D ÷ V_OV; A_v = −g_m R_D. Example 0.5 mA, 0.25 V,
  10 kΩ → 4 mS, −40.
- **~loading — BUILD:** G_v = A_v R_in ÷ (R_in + R_sig). Example −60, 5 kΩ, 1 kΩ → −50.
- **~cascade — BUILD:** P12 `waterfall` in dB. A = A₁A₂; G = 20 log₁₀ A. Example 20 × 50 = 1000
  → 26.0 + 34.0 = 60 dB.
- **Verdict:** 4 pages.

### 3.3 `he.engineering.electronics#3` — Op-amp circuits

- **Asks:** closed-loop bandwidth from gain-bandwidth → main; full-power bandwidth from slew
  rate → main; integrator output ramp → ~integrator; active low-pass gain and cutoff →
  ~active-lowpass; Schmitt-trigger thresholds → ~schmitt.
- **Main — BUILD ⏳ P7 (`bode`: open-loop line at −20 dB/decade, the closed-loop gain meeting
  it):** values gain-bandwidth product GBW (1 kHz–10 GHz), closed-loop gain G, bandwidth
  f_3dB, slew rate SR (0.01–10⁴ V/μs), output peak V_p, full-power frequency f_max. Relations:
  f_3dB = GBW ÷ G; f_max = SR ÷ (2πV_p). Assumptions: single-pole op-amp; G is the noise gain
  (1 + R_f/R_g); the smaller of f_3dB and f_max limits a full swing. Example 1 MHz, G = 20,
  0.5 V/μs, 10 V → f_3dB = 50 kHz, f_max = 7.96 kHz (slew limits). startWith GBW, G, SR, V_p.
  Use: "Use this for 'An op-amp with GBW = 1 MHz has a gain of 20. Find its bandwidth.'"
- **~integrator — BUILD ⏳ P2, P4:** v_out = v₀ − v_in t ÷ (RC) for a constant input. Example
  10 kΩ, 1 μF, 0.5 V, 4 ms → −0.2 V.
- **~active-lowpass — BUILD ⏳ P2, P7:** A = −R_f ÷ R₁; f_c = 1 ÷ (2πR_f C). Example 10 kΩ,
  100 kΩ, 1.59 nF → A = −10 (20 dB), f_c = 1.00 kHz.
- **~schmitt — BUILD ⏳ P2:** inverting Schmitt, R₁ to ground, R₂ from output; V_TH = ±V_sat R₁ ÷
  (R₁ + R₂). Example 12 V, 10 kΩ, 50 kΩ → ±2 V, hysteresis 4 V.
- **Verdict:** 4 pages.

## 4. he.engineering.signals-systems — Signals & Systems (after he.math.diff-eq)

- **Textbooks:** Baraniuk et al., _Signals and Systems_ (OpenStax CNX, on LibreTexts); MIT OCW
  6.003 (2011, lectures 1–20); Downey, _Think DSP_. Titles only: Oppenheim & Willsky ch. 1–7, 9,
  10; Lathi _Linear Systems and Signals_.
- **Order:** the taxonomy's; continuous and discrete side by side in each topic, as 6.003 does.

### 4.0 `he.engineering.signals-systems#0` — Continuous and discrete signals

- **Asks:** amplitude, period, frequency and phase of a sinusoid → main; time shift and scale
  of a signal → ~shift-scale; period of a discrete sinusoid → ~discrete-period; energy or power
  of a signal → ~energy-power; is the system linear, time-invariant → ~properties.
- **Main — BUILD:** `functionGraph` `family: 'cos'` (a = A, b = ω, phase φ, `unitsOf` ms and
  V). Values amplitude A, frequency f (0.001–10⁹ Hz), period T, angular frequency ω, phase φ
  (−180°–180°), time t, value x. Relations: T = 1 ÷ f; ω = 2πf; x = A cos(ωt + φ). Assumptions: φ
  in degrees, ωt converted to degrees in the steps; a sine is a cosine shifted −90°. Example
  A = 3, f = 50 Hz, φ = 30°, t = 5 ms → T = 20 ms, ω = 314.2 rad/s, ωt = 90°, x = 3 cos 120° =
  −1.5. startWith A, f, φ, t. Use: "Use this for 'Find the period, angular frequency and value at
  t = 5 ms of x(t) = 3 cos(100πt + 30°).'"
- **~shift-scale — BUILD:** `functionGraph` `transform`. y(t) = x(at − b): x's feature at t₀
  lands at t = (t₀ + b) ÷ a. Example a = 2, b = 4, t₀ = 2 → t = 3 (shift by 4, then squeeze).
- **~discrete-period — BUILD ⏳ P9, E4:** cos(Ω₀n) with Ω₀ = 2π(k/N) in lowest terms → period
  N; not periodic when Ω₀/2π is irrational (the assumption says so; the page takes k and N).
  Example Ω₀ = 3π/4 → k/N = 3/8 → N = 8.
- **~energy-power — BUILD:** E = A² ÷ (2a) for Ae^(−at)u(t); P = A² ÷ 2 for A cos(ωt + φ).
  Example A = 2, a = 4 → E = 0.5; a sinusoid with A = 3 → P = 4.5.
- **~properties — BUILD (sort):** bins "Linear and time-invariant", "Not linear", "Not
  time-invariant". Cards: "y(t) = 3x(t − 2)" and "y[n] = x[n] − x[n − 1]" → LTI; "y(t) = x(t)²",
  "y(t) = x(t) + 1", "y(t) = cos(x(t))" → Not linear; "y(t) = t·x(t)", "y(t) = x(2t)",
  "y[n] = x[−n]" → Not time-invariant (each is linear, so one bin). Sentence: "Linear: scaled
  and added inputs give scaled and added outputs. Time-invariant: a delayed input gives the
  same output, delayed."
- **Verdict:** 5 pages.

### 4.1 `he.engineering.signals-systems#1` — Convolution

- **Asks:** y[n] for two short sequences → main; length of the result → main; convolving two
  rectangular pulses → ~pulses; step into a first-order system → ~exp-step.
- **Main — BUILD ⏳ E6 (short sequences as values), P9 (`stemPlot` flip-and-shift):** values
  x[0], x[1], x[2], h[0], h[1], h[2] (−100–100), index n (0–4), output y[n]. Relation:
  y[n] = Σₖ x[k]h[n − k]; the step lists each product, one line. Assumptions: both sequences
  are 0 outside 0–2, so y has 3 + 3 − 1 = 5 terms; Σy = Σx × Σh is the check. Example x = 1, 2, 3;
  h = 1, 1, 2 → y = 1, 3, 7, 7, 6; at n = 2, y = 1·2 + 2·1 + 3·1 = 7; check 24 = 6 × 4.
  startWith the six samples, n. Use: "Use this for 'Convolve x[n] = {1, 2, 3} with h[n] = {1, 1,
  2}.'"
- **~pulses — BUILD:** `functionGraph` `family: 'piecewise'` (the trapezoid). Heights A, B,
  widths w₁ ≥ w₂: length w₁ + w₂, peak ABw₂, flat top w₁ − w₂. Example 2 for 3 s with 1 for 1 s →
  length 4 s, peak 2, flat 2 s.
- **~exp-step — BUILD ⏳ P4:** y(t) = (1 − e^(−at)) ÷ a for u(t) * e^(−at)u(t). Example a = 2,
  t = 1 s → 0.432.
- **Verdict:** 3 pages; the main waits on short sequences.

### 4.2 `he.engineering.signals-systems#2` — Fourier series and transforms

- **Asks:** harmonics of a square wave and their size → main; share of power in a harmonic →
  main; spectrum of a rectangular pulse, first null → ~pulse-spectrum; what a delay or time scale
  does to a spectrum → ~properties.
- **Main — BUILD ⏳ P10 (`functionGraph` `fourier`, partial sum over the square wave, stems
  of bₖ beside it):** values amplitude A (±A square wave), fundamental f₀, harmonic k (odd,
  1–99, `allowed` odd), harmonic frequency fₖ, coefficient bₖ, power share. Relations: fₖ = kf₀;
  bₖ = 4A ÷ (kπ); share = 8 ÷ (k²π²). Assumptions: odd square wave, so only odd sine terms;
  Parseval: the harmonics' powers bₖ²/2 add to A². Example A = 1, f₀ = 1 kHz, k = 3 → 3 kHz,
  b₃ = 0.424, share 9.0% (the fundamental holds 81.1%). startWith A, f₀, k. Use: "Use this for
  'Find the amplitude of the third harmonic of a ±1 V, 1 kHz square wave.'"
- **~pulse-spectrum — BUILD ⏳ E7 (sinc):** X(f) = Aτ sinc(fτ); X(0) = Aτ; first null 1/τ.
  Example 2 V for 1 ms → X(0) = 2 mV·s, null at 1 kHz, X(500 Hz) = 1.27 mV·s.
- **~properties — BUILD:** time scale x(at) widens the spectrum by a; delay t₀ adds phase
  −360° f t₀. Example a = 2 on a 5 kHz band → 10 kHz; 1 ms delay at 250 Hz → −90°.
- **Verdict:** 3 pages.

### 4.3 `he.engineering.signals-systems#3` — Laplace and z-transforms

- **Asks:** inverse Laplace by partial fractions → main; final and initial value → ~final-value;
  step response of a first-order difference equation → ~difference-eq; stability from pole
  positions → ~poles.
- **Main — BUILD ⏳ P6 (s-plane poles, each with its residue):** X(s) = (s + c) ÷ ((s + a)(s + b)).
  Values zero c, poles a, b (a ≠ b, page limit), residues A, B, time t, x(t). Relations:
  A = (c − a) ÷ (b − a); B = (c − b) ÷ (a − b); x(t) = Ae^(−at) + Be^(−bt). Assumptions: the
  cover-up rule for distinct poles; 1/(s + a) ↔ e^(−at)u(t). Example c = 3, a = 1, b = 2 → A = 2,
  B = −1, x(t) = 2e^(−t) − e^(−2t), x(1) = 0.600. startWith c, a, b, t. Use: "Use this for 'Find
  x(t) when X(s) = (s + 3)/((s + 1)(s + 2)).'"
- **~final-value — BUILD:** X(s) = K ÷ (s(s + a)) → x(∞) = K ÷ a, x(0⁺) = 0. Example K = 10,
  a = 5 → 2. Assumption: the poles other than 0 are in the left half-plane.
- **~difference-eq — BUILD ⏳ P9:** y[n] = αy[n − 1] + x[n], unit step in → y[n] = (1 − αⁿ⁺¹) ÷
  (1 − α); H(z) = z ÷ (z − α). Example α = 0.5, n = 3 → 1.875 (1, 1.5, 1.75, 1.875), final 2.
- **~poles — BUILD (sort):** bins "Dies out", "Oscillates without dying", "Grows". Cards:
  "pole at s = −2", "poles at s = −1 ± j2", "pole at z = 0.5" → Dies out; "poles at s = ±j3",
  "poles at z = ±j" → Oscillates; "pole at s = +1", "poles at s = 0.5 ± j4", "pole at
  z = −1.2" → Grows. Sentence: "Left of the jω axis (inside the unit circle for z) dies out."
- **Verdict:** 4 pages.

### 4.4 `he.engineering.signals-systems#4` — Sampling

- **Asks:** Nyquist rate → main; alias frequency → main; quantization step and SQNR →
  ~quantization; data rate of sampled audio → ~data-rate; DFT bin spacing → ~dft-bins.
- **Main — BUILD ⏳ P9 (`stemPlot` samples on the sine with the alias sine dashed), E4
  (round):** values signal frequency f, sampling rate f_s, Nyquist frequency f_s/2, Nyquist rate
  2f, alias f_a. Relations: f_a = |f − f_s × round(f ÷ f_s)|. Assumptions: a pure tone; f_a is
  the frequency between 0 and f_s/2 that the samples can't tell from f. Example f_s = 8 kHz,
  f = 5 kHz → Nyquist rate 10 kHz, alias 3 kHz. startWith f, f_s. Use: "Use this for 'A 5 kHz
  tone is sampled at 8 kHz. What frequency appears?'"
- **~quantization — BUILD ⏳ P26:** levels 2ᵇ; Δ = range ÷ 2ᵇ; SQNR = 6.02b + 1.76 dB. Example
  8 bits, 2 V → 256 levels, 7.81 mV, 49.9 dB.
- **~data-rate — BUILD, E1 (b/s):** R = f_s × b × channels. Example 44.1 kHz, 16 bits, 2 →
  1.411 Mb/s; one minute = 10.6 MB.
- **~dft-bins — BUILD:** Δf = f_s ÷ N; bin k at kΔf. Example 1 kHz, 256 → 3.91 Hz; 100 Hz falls
  at bin 25.6, between bins (leakage).
- **Verdict:** 4 pages.

## 5. he.engineering.control-systems — Control Systems (after he.math.diff-eq)

- **Textbooks:** Åström & Murray, _Feedback Systems_ (ch. 2, 5–7, 9–11); Wikibooks _Control
  Systems_; MIT OCW 6.302 and 16.06. Titles only: Nise ch. 2–10, Ogata, Dorf & Bishop.
- **Order:** the taxonomy's (modeling, transfer functions, stability, frequency response,
  PID), as Nise teaches it.

### 5.0 `he.engineering.control-systems#0` — Laplace-domain modeling

- **Asks:** transfer function and step response of a first-order system → main; mass–spring–
  damper parameters → ~mass-spring; closed-loop transfer function of a simple loop →
  ~feedback.
- **Main — BUILD ⏳ P4:** G(s) = K ÷ (τs + 1). Values DC gain K, time constant τ, step size u,
  time t, output y, final value y_∞. Relations: y_∞ = Ku; y = y_∞(1 − e^(−t/τ)). Assumptions: τ
  dy/dt + y = Ku with y(0) = 0; the step starts at t = 0. Example K = 2, τ = 0.5 s, u = 3 → y_∞ = 6,
  y(1 s) = 5.19. startWith K, τ, u, t. Use: "Use this for 'A system with G(s) = 2/(0.5s + 1) gets
  a step of 3. Find y after 1 s.'"
- **~mass-spring — BUILD ⏳ P30 (`oscillator` `damper`):** G(s) = 1 ÷ (ms² + bs + k);
  ω_n = √(k/m); ζ = b ÷ (2√(km)); DC gain 1/k. Example 2 kg, 8 N·s/m, 50 N/m → 5 rad/s, ζ = 0.4,
  0.02 m/N.
- **~feedback — BUILD ⏳ P6 (open- and closed-loop poles):** G = K ÷ (s + a), feedback H →
  T = K ÷ (s + a + KH); pole −(a + KH); DC gain K ÷ (a + KH). Example K = 4, a = 1, H = 1 → pole
  −5, DC gain 0.8, τ = 0.2 s.
- **Verdict:** 3 pages.

### 5.1 `he.engineering.control-systems#1` — Transfer functions

- **Asks:** poles, overshoot, peak and settling time of a standard second-order system → main;
  ζ and ω_n from specifications → ~from-spec; DC gain from poles and zeros → ~dc-gain;
  steady-state error to a step → ~step-error.
- **Main — BUILD ⏳ P5 (`stepResponse`, %OS, T_p, T_s band marked) :** ω_n² ÷ (s² + 2ζω_n s +
  ω_n²). Values ω_n (0.01–10⁵ rad/s), ζ (0–0.99 here), σ = ζω_n, ω_d = ω_n√(1 − ζ²), percent
  overshoot %OS = 100e^(−ζπ/√(1 − ζ²)), peak time T_p = π ÷ ω_d, settling time T_s = 4 ÷ σ.
  Assumptions: underdamped (0 < ζ < 1); 2% settling band; no zeros. Example ω_n = 5, ζ = 0.4 →
  poles −2 ± j4.58, %OS = 25.4%, T_p = 0.686 s, T_s = 2 s. startWith ω_n, ζ. Use: "Use this for
  'Find the percent overshoot and settling time of 25/(s² + 4s + 25).'"
- **~from-spec — BUILD ⏳ P5:** ζ = −ln(OS) ÷ √(π² + ln²(OS)); ω_n = 4 ÷ (ζT_s). Example 10%,
  2 s → ζ = 0.591, ω_n = 3.38 rad/s.
- **~dc-gain — BUILD ⏳ P6:** G = K(s + z) ÷ ((s + p₁)(s + p₂)) → G(0) = Kz ÷ (p₁p₂). Example
  K = 5, z = 2, p = 1, 4 → 2.5.
- **~step-error — BUILD:** unity feedback, type 0, G = K ÷ ((s + a)(s + b)): K_p = K ÷ (ab),
  e_ss = 1 ÷ (1 + K_p). Example 30, 1, 5 → K_p = 6, e_ss = 0.143. (Ramp error needs E10's
  type choice.)
- **Verdict:** 4 pages.

### 5.2 `he.engineering.control-systems#2` — Stability and root locus

- **Asks:** range of K for stability (Routh) → main; frequency of oscillation at the limit →
  main; right-half-plane poles from the Routh column → ~routh-count; root-locus asymptotes and
  breakaway → ~root-locus.
- **Main — BUILD ⏳ P29 (`matrixGrid` `routh`):** characteristic s³ + a₂s² + a₁s + K. Values
  a₂, a₁ (0.01–10⁴), gain K, largest gain K_max, crossing frequency ω_c. Relations:
  K_max = a₂a₁; ω_c = √a₁. Page limit: K > 0. Assumptions: the Routh first column 1, a₂,
  (a₂a₁ − K)/a₂, K must stay positive; at K_max the s¹ row is 0 and the auxiliary a₂s² + K gives
  ω_c. Example a₂ = 6, a₁ = 8 → K_max = 48, ω_c = 2.83 rad/s. startWith a₂, a₁, K. Use: "Use this
  for 'For what K is s³ + 6s² + 8s + K = 0 stable?'"
- **~routh-count — BUILD ⏳ P29:** s³ + a₂s² + a₁s + a₀ → first column, sign changes = poles in
  the right half-plane. Example s³ + s² + 2s + 8 → 1, 1, −6, 8: 2 changes, 2 unstable poles
  (−2 and 0.5 ± j1.94).
- **~root-locus — BUILD ⏳ P6 (locus branches):** poles p₁–p₃, no zeros: centroid
  σ_a = Σp ÷ 3, angles 60°, 180°, 300°, breakaway from d/ds[s(s + 2)(s + 4)] = 0. Example 0, −2,
  −4 → σ_a = −2, breakaway −0.845.
- **Verdict:** 3 pages.

### 5.3 `he.engineering.control-systems#3` — Frequency response

- **Asks:** gain crossover and phase margin → main; Bode asymptotes and the exact gain →
  ~asymptotes; gain margin → ~gain-margin; closed-loop bandwidth from ζ and ω_n → ~bandwidth.
- **Main — BUILD ⏳ P7:** G = K ÷ (s(s + a)). Values K, a, gain crossover ω_c, phase margin
  PM. Relations: ω_c² = (−a² + √(a⁴ + 4K²)) ÷ 2; PM = 90° − atan(ω_c ÷ a). Assumptions: unity
  feedback; |G(jω_c)| = 1; PM above about 45° means little overshoot. Example K = 20, a = 3 →
  ω_c = 4 rad/s, PM = 36.9°. startWith K, a. Use: "Use this for 'Find the phase margin of
  G(s) = 20/(s(s + 3)).'"
- **~asymptotes — BUILD ⏳ P7:** K ÷ (s + p): DC 20 log(K/p) dB, corner p, exact 20 log(K ÷
  √(ω² + p²)). Example 100, 10 → 20 dB, corner 10 rad/s, at 100 rad/s −0.04 dB (asymptote 0 dB).
- **~gain-margin — BUILD ⏳ P7:** K ÷ (s(s + 1)(s + 2)): phase −180° at ω = √2, |G| = K/6,
  GM = 6/K. Example K = 2 → 3 (9.54 dB); agrees with Routh's K_max = 6.
- **~bandwidth — BUILD ⏳ P5:** ω_BW = ω_n√(1 − 2ζ² + √(4ζ⁴ − 4ζ² + 2)). Example ζ = 0.4,
  ω_n = 5 → 6.87 rad/s.
- **Verdict:** 4 pages.

### 5.4 `he.engineering.control-systems#4` — PID control

- **Asks:** offset and speed of P control on a first-order plant → main; PI gains for a
  damping ratio → ~pi; Ziegler–Nichols tuning → ~ziegler-nichols; what each term does →
  ~terms.
- **Main — BUILD ⏳ P4 (open- and closed-loop step responses):** plant K ÷ (τs + 1),
  controller K_p. Values K, τ, K_p, loop gain L = KK_p, closed-loop DC gain L ÷ (1 + L),
  closed-loop τ_cl = τ ÷ (1 + L), step error e_ss = 1 ÷ (1 + L). Assumptions: unity feedback, unit
  step; the actuator doesn't saturate. Example K = 2, τ = 4 s, K_p = 4.5 → L = 9, DC gain 0.9,
  τ_cl = 0.4 s, e_ss = 0.1. startWith K, τ, K_p. Use: "Use this for 'A plant 2/(4s + 1) under
  proportional control K_p = 4.5: find the steady-state error and time constant.'"
- **~pi — BUILD ⏳ P5:** closed loop τs² + (1 + KK_p)s + KK_i: ω_n = √(KK_i/τ),
  ζ = (1 + KK_p) ÷ (2√(τKK_i)). Example τ = 1, K = 1, K_p = 3, K_i = 8 → ω_n = 2.83, ζ = 0.707.
- **~ziegler-nichols — BUILD:** ultimate gain K_u, period T_u: K_p = 0.6K_u, T_i = T_u/2,
  T_d = T_u/8, K_i = K_p/T_i, K_d = K_pT_d. Example K_u = 48, T_u = 2.22 s (from 5.2) → K_p = 28.8,
  T_i = 1.11 s, T_d = 0.278 s, K_i = 25.9, K_d = 8.0.
- **~terms — BUILD (sort):** bins "Proportional", "Integral", "Derivative". Cards: "pushes in
  proportion to the present error", "shrinks but doesn't remove a P loop's offset" →
  Proportional; "removes the steady-state error to a step", "winds up when the actuator
  saturates" → Integral; "damps overshoot by reacting to how fast the error changes",
  "amplifies sensor noise the most" → Derivative.
- **Verdict:** 4 pages.

## 6. he.engineering.electromagnetics — Engineering Electromagnetics (after he.physics.university-2, he.math.calc-3)

- **Textbooks:** Ellingson, _Electromagnetics_ vol. 1 (ch. 3 transmission lines, 5–9) and
  vol. 2 (ch. 9–10 antennas); MIT OCW 6.013. Titles only: Ulaby & Ravaioli, Hayt & Buck, Cheng.
- **Order:** transmission lines first (Ellingson and Ulaby both start there); Maxwell, waves,
  antennas.

### 6.0 `he.engineering.electromagnetics#0` — Transmission lines

- **Asks:** reflection coefficient, VSWR, return loss for a resistive load → main; Z₀ and
  speed from per-length L and C → ~line-params; quarter-wave transformer → ~quarter-wave;
  shorted-stub reactance → ~stub; input impedance of a loaded line → ~input-impedance.
- **Main — BUILD ⏳ P11 (`wave` `line`: the standing-wave envelope, V_max and V_min marked):**
  values Z₀ (1–1000 Ω), load R_L (0–10⁶ Ω), Γ, VSWR, return loss RL, reflected power share.
  Relations: Γ = (R_L − Z₀) ÷ (R_L + Z₀); VSWR = (1 + |Γ|) ÷ (1 − |Γ|); RL = −20 log₁₀|Γ|;
  share = Γ². Assumptions: lossless line; a resistive load (complex loads wait on E2); Γ = 0
  means matched, ±1 open or short. Example 50 Ω, 100 Ω → Γ = 1/3, VSWR = 2, RL = 9.54 dB, 11.1%
  reflected. startWith Z₀, R_L. Use: "Use this for 'A 50 Ω line ends in a 100 Ω load. Find Γ and
  the VSWR.'"
- **~line-params — BUILD, E1 (nH/m, pF/m):** Z₀ = √(L′/C′); v = 1 ÷ √(L′C′). Example 250 nH/m,
  100 pF/m → 50 Ω, 2 × 10⁸ m/s.
- **~quarter-wave — BUILD:** Z_T = √(Z₀R_L); length λ/4 = v ÷ (4f). Example 50 Ω to 200 Ω →
  100 Ω; at 1 GHz with v = 2 × 10⁸ m/s → 5 cm.
- **~stub — BUILD:** shorted stub X = Z₀ tan(2πℓ/λ) (inductive while ℓ < λ/4). Example 50 Ω,
  ℓ = λ/8 → +50 Ω.
- **~input-impedance — BUILD ⏳ E2:** Z_in = Z₀(Z_L + jZ₀ tan βℓ) ÷ (Z₀ + jZ_L tan βℓ). Example
  50 Ω line, 100 Ω load, ℓ = λ/8 → Z_in = 40 − j30 Ω.
- **Verdict:** 5 pages; one waits on complex values.

### 6.1 `he.engineering.electromagnetics#1` — Maxwell's equations

- **Asks:** B near a long wire (Ampère) → main; E of a line charge (Gauss) → ~gauss-line; EMF
  in a coil (Faraday) → ~faraday; displacement current in a capacitor → ~displacement; which law
  describes it → ~laws.
- **Main — BUILD ⏳ P31 (`induction` `wire`: field circles round a current, B at r):** values
  current I (0–10⁵ A), distance r (1 μm–10 km), magnetic flux density B, field intensity H.
  Relations: H = I ÷ (2πr); B = μ₀H. Assumptions: a long straight wire, r measured from its
  center; Ampère's law with a circle of radius r. Example 10 A, 2 cm → H = 79.6 A/m, B = 100 μT.
  startWith I, r. Use: "Use this for 'Find B 2 cm from a long wire carrying 10 A.'"
- **~gauss-line — BUILD ⏳ P31 (`charges` `line`):** E = λ ÷ (2πε₀r). Example 1 nC/m, 0.1 m →
  180 V/m.
- **~faraday — BUILD:** `induction` `mode: 'coil'` (turns, flux, time, emf). emf = NAΔB ÷ Δt.
  Example 100 turns, 0.01 m², 0.2 T in 0.1 s → 2 V.
- **~displacement — BUILD:** `capacitor`. i_d = C dV/dt. Example 1 μF, 1000 V/s → 1 mA (equal
  to the wire's conduction current).
- **~laws — BUILD (sort):** bins "Gauss's law for E", "Gauss's law for B", "Faraday's law",
  "Ampère–Maxwell law". Cards: "charge is where electric field lines start", "E outside a
  charged sphere falls as 1/r²" → Gauss E; "there are no magnetic monopoles", "a bar magnet's
  field lines close on themselves" → Gauss B; "a changing current in one coil drives a voltage in
  another", "a generator coil turning in a field" → Faraday; "a current is circled by magnetic
  field", "a changing E between capacitor plates makes B" → Ampère–Maxwell.
- **Verdict:** 5 pages.

### 6.2 `he.engineering.electromagnetics#2` — Wave propagation

- **Asks:** speed, wavelength and wave impedance in a dielectric → main; power density from
  E → main; skin depth → ~skin-depth; reflection at a boundary → ~boundary.
- **Main — BUILD ⏳ P11 (`wave` `em`: E and H crossed, λ marked):** values frequency f,
  relative permittivity ε_r (1–100), speed v, wavelength λ, wave impedance η, E amplitude E₀,
  H amplitude H₀, power density S. Relations: v = c ÷ √ε_r; λ = v ÷ f; η = η₀ ÷ √ε_r; H₀ = E₀ ÷ η;
  S = E₀² ÷ (2η). Assumptions: lossless, nonmagnetic (μ_r = 1) medium; a uniform plane wave.
  Example 3 GHz, ε_r = 4, 10 V/m → v = 1.5 × 10⁸ m/s, λ = 5 cm, η = 188 Ω, H₀ = 53.1 mA/m,
  S = 0.265 W/m². startWith f, ε_r, E₀. Use: "Use this for 'A 3 GHz plane wave travels in a medium
  with ε_r = 4. Find λ and η.'"
- **~skin-depth — BUILD, E1 (S/m):** δ = 1 ÷ √(πfμσ). Example copper at 1 MHz → 66.1 μm; at
  60 Hz → 8.53 mm.
- **~boundary — BUILD:** normal incidence: Γ = (η₂ − η₁) ÷ (η₂ + η₁); τ = 1 + Γ; transmitted power
  1 − Γ². Example air to ε_r = 4 → Γ = −1/3, τ = 2/3, 88.9% through.
- **Verdict:** 3 pages.

### 6.3 `he.engineering.electromagnetics#3` — Antennas

- **Asks:** received power by the Friis equation → main; free-space path loss → main;
  half-wave dipole length → ~dipole; dish gain, beamwidth and far field → ~dish.
- **Main — BUILD ⏳ P12 (`waterfall` in dB: P_t, G_t, path loss, G_r → P_r), E1 (dBm, dBi):**
  values transmit power P_t (dBm), gains G_t, G_r (dBi), frequency f, distance d, wavelength λ,
  path loss L_fs, received power P_r. Relations: λ = c ÷ f; L_fs = 20 log₁₀(4πd ÷ λ);
  P_r = P_t + G_t + G_r − L_fs. Assumptions: free space, far field, matched polarisation.
  Example 30 dBm, 3 dBi each, 2.4 GHz, 1 km → λ = 0.125 m, L_fs = 100.0 dB, P_r = −64.0 dBm.
  startWith P_t, G_t, G_r, f, d. Use: "Use this for 'A 1 W, 2.4 GHz link with 3 dBi antennas spans
  1 km. Find the received power.'"
- **~dipole — BUILD:** length λ/2; R_r ≈ 73 Ω; G = 2.15 dBi. Example 100 MHz → 1.5 m
  (cut about 5% shorter in practice, the assumption says).
- **~dish — BUILD:** G = e(πD/λ)²; beamwidth ≈ 70°λ/D; far field r = 2D²/λ. Example D = 1 m,
  12 GHz, e = 0.6 → G = 9475 (39.8 dBi), 1.75°, 80 m.
- **Verdict:** 3 pages.

## 7. he.engineering.power-systems — Power Systems (after circuits-2)

- **Textbooks:** MIT OCW 6.061 (Kirtley, chapters 1–10 notes); Kuphaldt, _Lessons in
  Industrial Instrumentation_ (electric power measurement and control chapter). Titles only:
  Glover, Sarma & Overbye; Grainger & Stevenson; Chapman _Electric Machinery Fundamentals_.
- **Order:** the taxonomy's; per-unit is taught as a problem type of power flow, first.

### 7.0 `he.engineering.power-systems#0` — Power flow

- **Asks:** real power over a lossless line from δ → main; per-unit impedance → ~per-unit;
  change of base → ~change-base; approximate voltage drop → ~voltage-drop; line losses →
  ~line-losses; a Gauss–Seidel iteration → ~load-flow.
- **Main — BUILD, P14 (`functionGraph` sin, the P–δ curve with the operating point; works
  today as `family: 'sin'`):** values sending V₁ and receiving V₂ (0.5–1.5 pu), line reactance X
  (0.001–5 pu), power angle δ (0°–90°), power P (pu), maximum P_max, base S_base (MVA), power in
  MW. Relations: P = V₁V₂ sin δ ÷ X; P_max = V₁V₂ ÷ X; P_MW = P × S_base. Assumptions: lossless
  line (R ≪ X); V₁ leads V₂ by δ; past δ = 90° the line can't carry more. Example 1.0, 1.0,
  0.5 pu, 30°, 100 MVA → P = 1.0 pu = 100 MW, P_max = 2.0 pu. startWith V₁, V₂, X, δ. Use: "Use this
  for 'Two buses at 1.0 pu are joined by X = 0.5 pu. Find P at δ = 30°.'"
- **~per-unit — BUILD, E1 (MVA, kV, pu):** Z_base = V_base² ÷ S_base; Z_pu = Z ÷ Z_base.
  Example 138 kV, 100 MVA → 190.4 Ω; 19.04 Ω = 0.100 pu.
- **~change-base — BUILD:** Z_new = Z_old(V_old/V_new)²(S_new/S_old). Example 0.1 pu on 50 MVA →
  0.2 pu on 100 MVA (same kV).
- **~voltage-drop — BUILD:** ΔV ≈ RP + XQ (pu, V ≈ 1). Example R = 0.02, X = 0.1, P = 0.8,
  Q = 0.6 → 0.076 pu, so the sending end ≈ 1.076 pu.
- **~line-losses — BUILD:** I = P ÷ (√3 V_L pf); loss = 3I²R. Example 10 MW, 33 kV, 0.9, 5 Ω per
  phase → 194 A, 567 kW (5.7%).
- **~load-flow — BUILD ⏳ E2, E5:** one Gauss–Seidel update V₂ ← (1/Y₂₂)[(P − jQ)/V₂* − Y₂₁V₁]
  for a two-bus system, iterated in a table. No example until E2.
- **Verdict:** 6 pages; one waits on complex values and iteration.

### 7.1 `he.engineering.power-systems#1` — Transformers and machines

- **Asks:** synchronous speed, slip, rotor frequency and torque of an induction motor → main;
  transformer efficiency at part load → ~transformer-efficiency; DC motor speed from voltage and
  current → ~dc-motor; synchronous generator internal EMF → ~sync-generator.
- **Main — BUILD, E1 (rpm):** `waterfall` (air-gap power, minus rotor copper loss, = power
  converted). Values supply frequency f, poles p (`allowed` even 2–24), synchronous speed n_s,
  rotor speed n, slip s, rotor frequency f_r, air-gap power P_ag, rotor copper loss P_cu,
  converted power P_conv, torque T. Relations: n_s = 120f ÷ p; s = (n_s − n) ÷ n_s; f_r = sf;
  P_cu = sP_ag; P_conv = (1 − s)P_ag; T = P_conv ÷ (2πn/60). Assumptions: steady state; friction
  and windage left out of T (the shaft torque is a little less). Example 60 Hz, 4 poles,
  1746 rpm, 10 kW → n_s = 1800 rpm, s = 0.03, f_r = 1.8 Hz, P_cu = 300 W, P_conv = 9.7 kW,
  T = 53.1 N·m. startWith f, p, n, P_ag. Use: "Use this for 'A 4-pole, 60 Hz induction motor runs
  at 1746 rpm. Find the slip and rotor frequency.'"
- **~transformer-efficiency — BUILD:** `waterfall`. P_out = xS pf; losses = P_core + x²P_cu;
  η = P_out ÷ (P_out + losses); maximum η at x = √(P_core/P_cu). Example 50 kVA, pf 0.8, full
  load, 300 W, 600 W → 40 kW, η = 97.8%; best at x = 0.707.
- **~dc-motor — BUILD:** E_a = V_t − I_aR_a; ω = E_a ÷ kΦ; T = kΦI_a. Example 240 V, 20 A,
  0.5 Ω, kΦ = 2.3 V·s/rad → E_a = 230 V, ω = 100 rad/s (955 rpm), T = 46 N·m.
- **~sync-generator — BUILD ⏳ E2:** E = V + jX_sI. No example until E2.
- **Verdict:** 4 pages.

### 7.2 `he.engineering.power-systems#2` — Fault analysis

- **Asks:** three-phase fault current in pu, kA and MVA → main; single-line-to-ground fault →
  ~slg; Thévenin reactance from a short-circuit rating → ~source-mva; symmetrical components
  → ~sym-components.
- **Main — BUILD ⏳ P13 (`oneLine` with the fault bolt):** values prefault voltage V_f (pu),
  Thévenin reactance X_th (pu), fault current I_f (pu), S_base, V_base (kV), base current
  I_base, fault current in kA, fault MVA. Relations: I_f = V_f ÷ X_th; I_base = S_base ÷
  (√3V_base); I_kA = I_f I_base; MVA = I_f S_base (V_f = 1). Assumptions: bolted fault; loads
  ignored; reactances only. Example 1.0 pu, 0.2 pu, 100 MVA, 13.8 kV → I_f = 5 pu, I_base =
  4184 A, 20.9 kA, 500 MVA. startWith V_f, X_th, S_base, V_base. Use: "Use this for 'Find the
  fault current for a bolted three-phase fault with X_th = 0.2 pu on a 100 MVA, 13.8 kV base.'"
- **~slg — BUILD ⏳ P13:** I_a = 3V_f ÷ (X₁ + X₂ + X₀). Example 0.2, 0.2, 0.1 → 6 pu (25.1 kA on
  the same base).
- **~source-mva — BUILD:** X_th = S_base ÷ S_sc. Example 500 MVA available on 100 MVA → 0.2 pu.
- **~sym-components — BUILD ⏳ E2:** the a-operator transform of three phase currents. No
  example until E2.
- **Verdict:** 4 pages.

### 7.3 `he.engineering.power-systems#3` — Grid stability

- **Asks:** critical clearing angle and time by the equal-area criterion → main; frequency drop
  under droop → ~droop; initial rate of change of frequency → ~rocof; swing frequency → ~swing.
- **Main — BUILD ⏳ P14 (`equalArea`: A₁ and A₂ shaded on P–δ):** values mechanical power P_m,
  P_max (pu), initial angle δ₀, critical angle δ_cr, inertia H (1–20 s), frequency f, critical
  clearing time t_cr. Relations: δ₀ = asin(P_m/P_max); cos δ_cr = (π − 2δ₀) sin δ₀ − cos δ₀ (δ in
  radians); t_cr = √(4H(δ_cr − δ₀) ÷ (2πf P_m)). Assumptions: the fault drops the transfer to 0
  until cleared; the same line returns after; damping ignored. Example P_m = 1, P_max = 2, H = 5 s,
  60 Hz → δ₀ = 30°, δ_cr = 79.6°, t_cr = 0.214 s. startWith P_m, P_max, H, f. Use: "Use this for
  'Find the critical clearing time for a generator with H = 5 s delivering 1 pu with P_max = 2
  pu.'"
- **~droop — BUILD:** Δf = −RΔP f_nom (pu on the unit's base). Example R = 5%, ΔP = 0.1 pu, 60 Hz
  → −0.3 Hz.
- **~rocof — BUILD:** df/dt = ΔP f ÷ (2H). Example 0.1 pu, 60 Hz, 5 s → 0.6 Hz/s.
- **~swing — BUILD:** ω_n = √(2πf P_max cos δ₀ ÷ (2H)). Example 2 pu, 30°, 5 s, 60 Hz →
  8.08 rad/s (1.29 Hz).
- **Verdict:** 4 pages.

## 8. he.engineering.communication-systems — Communication Systems (after signals-systems)

- **Textbooks:** MIT OCW 6.02 (Balakrishnan, Verghese notes), 6.450; Johnson ch. 6
  (information communication). Titles only: Haykin, Proakis & Salehi, Lathi & Ding.
- **Order:** the taxonomy's (analog, digital, noise, information), as Haykin.

### 8.0 `he.engineering.communication-systems#0` — AM and FM

- **Asks:** AM power, sideband power, efficiency and bandwidth → main; FM bandwidth (Carson)
  → ~fm; modulation index from an envelope → ~mod-index; superheterodyne LO and image →
  ~superhet.
- **Main — BUILD ⏳ P15 (`rfSpectrum`: carrier and sidebands, the envelope above):** values
  carrier power P_c, modulation index μ (0–1), total power P_t, sideband power P_sb, efficiency
  η, message frequency f_m, bandwidth B, carrier f_c. Relations: P_t = P_c(1 + μ²/2);
  P_sb = P_t − P_c; η = μ² ÷ (2 + μ²); B = 2f_m. Assumptions: tone modulation; μ ≤ 1 (no
  overmodulation); sidebands at f_c ± f_m. Example 100 W, 0.5, 5 kHz, 1 MHz → 112.5 W, 12.5 W,
  11.1%, 10 kHz, sidebands 995 and 1005 kHz. startWith P_c, μ, f_m, f_c. Use: "Use this for 'A
  100 W carrier is modulated to μ = 0.5. Find the total and sideband power.'"
- **~fm — BUILD ⏳ P15:** β = Δf ÷ f_m; B = 2(Δf + f_m). Example 75 kHz, 15 kHz → β = 5, 180 kHz.
- **~mod-index — BUILD:** μ = (A_max − A_min) ÷ (A_max + A_min). Example 1.5 V, 0.5 V → 0.5.
- **~superhet — BUILD:** f_LO = f_c + f_IF; image = f_c + 2f_IF. Example 1000 kHz, 455 kHz →
  1455 kHz, 1910 kHz.
- **Verdict:** 4 pages.

### 8.1 `he.engineering.communication-systems#1` — Digital modulation

- **Asks:** bit rate, bandwidth and spectral efficiency of M-ary schemes → main; BPSK bit
  error rate → ~bpsk-ber; E_b/N₀ from SNR → ~eb-n0.
- **Main — BUILD ⏳ P16 (`complexPlane` `constellation`):** values levels M (`allowed` 2, 4, 8,
  16, 64, 256), symbol rate R_s, bit rate R_b, roll-off α (0–1), bandwidth B, efficiency η.
  Relations: R_b = R_s log₂M; B = R_s(1 + α); η = R_b ÷ B. Example 16-QAM, 1 Msym/s, 0.25 →
  4 Mb/s, 1.25 MHz, 3.2 b/s/Hz. startWith M, R_s, α. Use: "Use this for 'A 16-QAM link sends
  1 Msymbol/s with roll-off 0.25. Find the bit rate and bandwidth.'"
- **~bpsk-ber — BUILD ⏳ E7 (Q-function):** `normalCurve` tail. P_b = Q(√(2E_b/N₀)). Example
  9.6 dB → 9.12 → Q(4.27) ≈ 1 × 10⁻⁵.
- **~eb-n0 — BUILD:** E_b/N₀ = SNR × B ÷ R_b. Example 10 dB, 1 MHz, 2 Mb/s → 5 (6.99 dB).
- **Verdict:** 3 pages.

### 8.2 `he.engineering.communication-systems#2` — Noise

- **Asks:** thermal noise power → main; SNR at a receiver with a noise figure → main;
  cascaded noise figure (Friis) → ~friis-noise; noise temperature → ~noise-temp.
- **Main — BUILD ⏳ P12 (`waterfall` dB: kTB, + NF → noise floor; signal above it), E1:**
  values temperature T (1–10⁴ K), bandwidth B, noise power N (dBm), noise figure NF (dB), signal
  P_s (dBm), SNR (dB). Relations: N = 10 log₁₀(kTB ÷ 1 mW); SNR = P_s − (N + NF). Assumptions: T₀ =
  290 K gives −174 dBm/Hz; NF is the receiver's. Example 290 K, 1 MHz, 6 dB, −90 dBm → N = −114
  dBm, floor −108 dBm, SNR = 18 dB. startWith T, B, NF, P_s. Use: "Use this for 'Find the noise
  floor of a 1 MHz receiver with a 6 dB noise figure.'"
- **~friis-noise — BUILD:** F = F₁ + (F₂ − 1) ÷ G₁ (linear). Example 3 dB, 20 dB gain, 10 dB →
  2 + 9/100 = 2.09 → 3.20 dB.
- **~noise-temp — BUILD:** T_e = (F − 1) × 290 K. Example F = 2 → 290 K.
- **Verdict:** 3 pages.

### 8.3 `he.engineering.communication-systems#3` — Information theory basics

- **Asks:** entropy of a source → main; Shannon capacity → ~capacity; average Huffman code
  length → ~code-length; binary symmetric channel capacity → ~bsc; block-code rate and
  correction → ~block-code.
- **Main — BUILD:** `pieChart` (each symbol's share, labelled with −log₂p). Values p₁–p₄ (0–1;
  page limit "The probabilities add to 1"), entropy H, largest H_max = log₂4, efficiency H/H_max.
  Relation: H = −Σ pᵢ log₂ pᵢ (a 0 term counts 0). Example 0.5, 0.25, 0.125, 0.125 → H = 1.75
  bits/symbol, 2, 87.5%. startWith p₁–p₄. Use: "Use this for 'A source sends four symbols with
  probabilities 1/2, 1/4, 1/8, 1/8. Find its entropy.'"
- **~capacity — BUILD:** C = B log₂(1 + SNR). Example 3 kHz, 30 dB → 29.9 kb/s.
- **~code-length — BUILD ⏳ P22 (`graph` tree mode, the code tree):** L = Σ pᵢlᵢ; Kraft
  Σ2^(−lᵢ) ≤ 1 (page limit). Example lengths 1, 2, 3, 3 → L = 1.75 = H, Kraft sum 1.
- **~bsc — BUILD:** C = 1 − H(p). Example p = 0.1 → H = 0.469, C = 0.531 bit per use.
- **~block-code — BUILD, E4:** rate k/n; corrects ⌊(d − 1)/2⌋, detects d − 1. Example (7, 4),
  d = 3 → 0.571, 1, 2.
- **Verdict:** 5 pages.

## 9. he.engineering.digital-logic — Digital Logic Design (no prerequisite)

- **Textbooks:** Kuphaldt, _Lessons in Electric Circuits_ vol. IV (Digital, ch. 1–10); MIT
  OCW 6.004 (Computation Structures, L01–L07); Kuphaldt ModEL modules on Boolean algebra and
  flip-flops. Titles only: Harris & Harris ch. 1–3, Mano & Ciletti, Roth & Kinney.
- **Order:** the taxonomy's; two's complement sits in #0 (as Harris & Harris ch. 1).

### 9.0 `he.engineering.digital-logic#0` — Number systems and Boolean algebra

- **Asks:** decimal ↔ binary ↔ hex → main; two's complement of a negative number → main;
  signed and unsigned range, overflow → ~twos-range; BCD → ~bcd; which law simplifies it →
  ~laws.
- **Main — BUILD ⏳ E3 (base 2 and 16 display), P17 (`placeValueChart` `base`):** values
  number N (0–2³² − 1), width n (`allowed` 4, 8, 16, 32), binary, hexadecimal, the n-bit pattern
  of −N. Relations: the binary digits are the remainders of repeated ÷ 2 (each a line);
  hex groups the bits in fours; −N = invert every bit, then add 1. Page limit: N < 2ⁿ⁻¹ for −N.
  Example 45 → 101101₂ = 2D₁₆; 8-bit −45 = 11010011₂ = D3₁₆. startWith N, n. Use: "Use this for
  'Write 45 in binary and hex, and −45 in 8-bit two's complement.'"
- **~twos-range — BUILD:** unsigned 0 to 2ⁿ − 1; signed −2ⁿ⁻¹ to 2ⁿ⁻¹ − 1; a sum outside wraps by
  2ⁿ. Example 8 bits: −128 to 127; 100 + 50 = 150 overflows to −106.
- **~bcd — BUILD ⏳ E3:** each decimal digit in 4 bits. Example 59 → 0101 1001.
- **~laws — BUILD (sort):** bins "De Morgan's law", "Absorption", "Distributive law",
  "Complement or identity". Cards: "(A + B)′ = A′B′", "(AB)′ = A′ + B′" → De Morgan;
  "A + AB = A", "A(A + B) = A" → Absorption; "A(B + C) = AB + AC", "A + BC = (A + B)(A + C)" →
  Distributive; "A + A′ = 1", "A · 1 = A" → Complement or identity.
- **Verdict:** 4 pages; the main waits on base display.

### 9.1 `he.engineering.digital-logic#1` — Combinational logic

- **Asks:** minimal sum of products from a K-map (with don't-cares) → main; which gate a truth
  table is → ~gates; select lines and decoder outputs → ~mux-decoder; ripple-carry delay →
  ~ripple-adder.
- **Main — BUILD (explore) ⏳ P19 (`karnaugh` explore figure):** scenes, each lighting its
  groups and writing the product terms: "f = Σm(0, 2, 5, 7) of A, B, C: two pairs, f = A′C′ + AC";
  "f = Σm(1, 3, 5, 7): one block of four, f = C"; "f = Σm(0, 2, 8, 10) of A, B, C, D: the four
  corners wrap, f = B′D′"; "f = Σm(1, 3) + d(5, 7): the don't-cares finish a block of four,
  f = C"; "f = Σm(1, 2) of A, B: no pair, f = A′B + AB′". Sentence: "Group the 1s in blocks of 1,
  2, 4 or 8, as large as you can; each block is one product term." Use: "Use this for 'Simplify
  f(A, B, C) = Σm(0, 2, 5, 7) with a K-map.'" (The answer is an expression, not a number, so a
  calculator would be beside the point.)
- **~gates — BUILD (sort):** bins AND, OR, XOR, NAND, NOR, XNOR. Cards: output columns for
  AB = 00, 01, 10, 11: "0 0 0 1", "0 1 1 1", "0 1 1 0", "1 1 1 0", "1 0 0 0", "1 0 0 1", and in
  words "1 only when both are 1", "0 only when both are 0", "1 when the inputs differ",
  "0 only when both are 1", "1 only when both are 0", "1 when the inputs match".
- **~mux-decoder — BUILD, E4:** select lines ⌈log₂N⌉; a decoder of n inputs has 2ⁿ outputs; a
  truth table of n inputs has 2ⁿ rows and 2^(2ⁿ) possible functions. Example 8-to-1 → 3 lines;
  3 inputs → 8 rows, 256 functions.
- **~ripple-adder — BUILD:** t = n × t_carry; f_max = 1/t. Example 32 bits, 0.5 ns → 16 ns,
  62.5 MHz.
- **Verdict:** 4 pages; main is a layout waiting on its figure.

### 9.2 `he.engineering.digital-logic#2` — Sequential logic and flip-flops

- **Asks:** maximum clock frequency from setup, clock-to-Q and logic delay → main; hold
  check → main; counter modulus and output frequency → ~counter; JK next state → ~jk; shift
  right → ~shift.
- **Main — BUILD ⏳ P20 (`timingDiagram`: clock, D, Q with t_cq, t_logic, t_setup bars),
  E1 (ns, MHz):** values clock-to-Q t_cq, longest logic delay t_logic, setup time t_setup,
  shortest period T_min, f_max, hold time t_hold, shortest path t_cd. Relations:
  T_min = t_cq + t_logic + t_setup; f_max = 1 ÷ T_min; page limit t_cq + t_cd ≥ t_hold ("A path this
  short changes D before the hold time ends."). Example 1 ns, 6 ns, 0.5 ns → 7.5 ns, 133 MHz.
  startWith t_cq, t_logic, t_setup. Use: "Use this for 'Find the fastest clock for a register
  path with t_cq = 1 ns, 6 ns of logic and t_setup = 0.5 ns.'"
- **~counter — BUILD, E4:** modulus 2ⁿ; MSB frequency f ÷ 2ⁿ; flip-flops for modulus M =
  ⌈log₂M⌉. Example 4 bits at 1 MHz → 62.5 kHz; mod-10 needs 4.
- **~jk — BUILD:** J, K, Q (`allowed` 0, 1); Q⁺ = JQ′ + K′Q. Example J = K = 1, Q = 0 → 1 (toggle).
- **~shift — BUILD ⏳ E3, E4:** a right shift by k is ⌊N ÷ 2ᵏ⌋. Example 10110110₂ (182) by 2 →
  00101101₂ (45).
- **Verdict:** 4 pages.

### 9.3 `he.engineering.digital-logic#3` — State machines

- **Asks:** trace a state diagram on an input string → main; flip-flops for S states →
  ~encoding; design procedure in order → ~design-steps; Moore or Mealy → ~moore-mealy.
- **Main — BUILD (explore) ⏳ P21 (`stateDiagram` figure):** a Moore detector for 101
  (overlapping): S0 none, S1 "1", S2 "10", S3 "101" (output 1); S0 –1→ S1, –0→ S0; S1 –1→ S1,
  –0→ S2; S2 –1→ S3, –0→ S0; S3 –1→ S1, –0→ S2. Scenes trace the input 1, 1, 0, 1, 0, 1 one bit at
  a time: S1, S1, S2, S3 (output 1), S2, S3 (output 1). Sentence: "Each state remembers just
  enough of the input to decide what comes next." Use: "Use this for 'Trace the 101 detector on
  the input 110101.'"
- **~encoding — BUILD, E4:** binary ⌈log₂S⌉ flip-flops; one-hot S; unused codes 2^⌈log₂S⌉ − S.
  Example 5 states → 3, 5, 3 unused.
- **~design-steps — BUILD (sequence):** "Draw the state diagram from the description"; "Write
  the state table"; "Give each state a binary code"; "Write next-state and output equations
  with K-maps"; "Choose flip-flops and find their input equations"; "Draw the circuit and check
  the unused states".
- **~moore-mealy — BUILD (sort):** bins Moore, Mealy. Cards: "output written inside the state
  bubble", "output changes only at a clock edge", "the 101 detector needs 4 states" → Moore;
  "output written on the arrow", "output can change as soon as an input changes", "the 101
  detector needs 3 states" → Mealy.
- **Verdict:** 4 pages.

## 10. he.engineering.discrete-math — Discrete Mathematics (after m.11.binomial-theorem)

- **Textbooks:** Levin, _Discrete Mathematics: An Open Introduction_ (ch. 0–4); Lehman,
  Leighton & Meyer, _Mathematics for Computer Science_ (ch. 1–5, 12–15, 22); Hammack, _Book of
  Proof_ (ch. 1–10). Titles only: Rosen ch. 1, 2, 5, 6, 8, 10, 11; Epp.
- **Order:** the taxonomy's (Rosen's).

### 10.0 `he.engineering.discrete-math#0` — Logic and proofs

- **Asks:** which statements are equivalent to a conditional (contrapositive, converse,
  inverse) → main; is an argument valid → ~arguments; build a truth table → ~truth-table;
  structure of an induction proof → ~induction.
- **Main — BUILD (sort):** bins "Equivalent to p → q", "Not equivalent". Cards: "¬q → ¬p (the
  contrapositive)", "¬p ∨ q", "¬(p ∧ ¬q)" → Equivalent; "q → p (the converse)", "¬p → ¬q (the
  inverse)", "p ∧ q" → Not equivalent. Sentence: "p → q is false only when p is true and q is
  false; the contrapositive is false in exactly that row too." Use: "Use this for 'Which
  statement is equivalent to: if it rains, the game is cancelled?'"
- **~arguments — BUILD (sort):** bins "Valid", "Not valid". Cards: "p → q; p; so q",
  "p → q; ¬q; so ¬p", "p → q; q → r; so p → r", "p ∨ q; ¬p; so q" → Valid; "p → q; q; so p",
  "p → q; ¬p; so ¬q" → Not valid (affirming the consequent, denying the antecedent).
- **~truth-table — BUILD (explore) ⏳ P19 (truth-table figure):** scenes p → q, its
  contrapositive (the same column), its converse (a different one), p ↔ q, ¬(p ∧ q) beside
  ¬p ∨ ¬q.
- **~induction — BUILD (sequence):** "State P(n) and the claim for every n ≥ n₀"; "Base case:
  check P(n₀)"; "Assume P(k) for some k ≥ n₀"; "Use P(k) to prove P(k + 1)"; "Conclude P(n) for
  every n ≥ n₀".
- **No page:** writing proofs (an essay; the sorts and the sequence carry what a page can check).
- **Verdict:** 4 pages, all layouts; 3 build today.

### 10.1 `he.engineering.discrete-math#1` — Sets and functions

- **Asks:** size of a union of three sets → main; power set and Cartesian product sizes →
  ~set-sizes; number of functions, one-to-one and onto → ~count-functions; injective, surjective,
  bijective → ~function-types.
- **Main — BUILD ⏳ P27 (`venn` `three`):** values |A|, |B|, |C|, |A ∩ B|, |A ∩ C|, |B ∩ C|,
  |A ∩ B ∩ C|, |A ∪ B ∪ C|. Relation: |A ∪ B ∪ C| = |A| + |B| + |C| − |A ∩ B| − |A ∩ C| − |B ∩ C| +
  |A ∩ B ∩ C|. Page limit: each overlap at most the smaller set. Example 40, 35, 30, 15, 10, 12, 5
  → 73. startWith the seven counts. Use: "Use this for '40 students take art, 35 band, 30 drama…
  how many take at least one?'"
- **~set-sizes — BUILD:** |P(A)| = 2ⁿ; |A × B| = mn. Example n = 5 → 32; 3 × 4 = 12.
- **~count-functions — BUILD:** functions mⁿ; one-to-one m!/(m − n)!; onto
  Σᵢ(−1)ⁱC(m, i)(m − i)ⁿ (m ≤ 4 on the page). Example n = 3 to m = 4 → 64, 24; n = 4 onto m = 3 →
  81 − 48 + 3 = 36.
- **~function-types — BUILD (sort):** bins "One-to-one only", "Onto only", "Both (a
  bijection)", "Neither". Cards: "f(n) = 2n, ℤ → ℤ", "f(x) = eˣ, ℝ → ℝ" → One-to-one only;
  "f(n) = ⌊n/2⌋, ℤ → ℤ", "f(x) = x³ − x, ℝ → ℝ" → Onto only; "f(x) = x³, ℝ → ℝ", "f(n) = n + 1,
  ℤ → ℤ" → Both; "f(x) = x², ℝ → ℝ", "f(n) = n², ℤ → ℤ" → Neither.
- **Verdict:** 4 pages.

### 10.2 `he.engineering.discrete-math#2` — Combinatorics

- **Asks:** arrangements and selections with and without repetition → main; identical items
  into boxes → ~stars-bars; pigeonhole → ~pigeonhole; derangements → ~derangements; words with
  repeated letters → ~multinomial.
- **Main — BUILD:** `pascalTriangle` (C(n, r) lit; `fraction` slots for P(n, r) ÷ r!). Values
  n (0–60), r (0–n), P(n, r), C(n, r), with repetition nʳ, multisets C(n + r − 1, r).
  Relations: P(n, r) = n! ÷ (n − r)!; C(n, r) = P(n, r) ÷ r!; the other two as written. E9 past
  2⁵³. Example n = 10, r = 3 → 720, 120, 1000, 220. startWith n, r. Use: "Use this for 'How many
  ways can a club of 10 choose a president, secretary and treasurer? A 3-person committee?'"
- **~stars-bars — BUILD:** C(n + k − 1, k − 1); each box at least one: C(n − 1, k − 1). Example 10
  balls, 4 boxes → 286; at least one each → 84.
- **~pigeonhole — BUILD, E4:** some box holds at least ⌈N/k⌉. Example 50 people, 12 months → 5.
- **~derangements — BUILD:** Dₙ = n! Σ(−1)ᵏ/k!. Example D₄ = 9, D₅ = 44; chance → 1/e.
- **~multinomial — BUILD:** n! ÷ (n₁!n₂!…). Example 11 letters with 4, 4, 2, 1 alike → 34 650.
- **Verdict:** 5 pages.

### 10.3 `he.engineering.discrete-math#3` — Graph theory

- **Asks:** edges from degrees (handshake), planar faces (Euler) → main; Euler path or
  circuit → ~euler; trees and m-ary trees → ~trees; edges of Kₙ and K_{m,n} → ~complete.
- **Main — BUILD ⏳ P22 (`graph`):** values vertices V, edges E, degree sum, average degree,
  faces F. Relations: degree sum = 2E; average = 2E ÷ V; V − E + F = 2. Page limit: E ≤ 3V − 6
  for a simple planar graph (V ≥ 3). Example V = 6, E = 9 (a triangular prism) → 18, 3, F = 5.
  startWith V, E. Use: "Use this for 'A connected planar graph has 6 vertices and 9 edges. How
  many faces?'"
- **~euler — BUILD (sort):** connected graphs by degree list. Bins "Euler circuit", "Euler
  path, no circuit", "Neither". Cards: "2, 2, 2, 2", "4, 2, 2, 2, 2" → circuit; "3, 3, 2, 2",
  "1, 1, 2, 2" → path; "3, 3, 3, 3", "3, 1, 1, 1" → neither. Sentence: "Count the odd
  degrees: 0 gives a circuit, 2 a path, more gives neither."
- **~trees — BUILD:** n − 1 edges; full m-ary with i internal: n = mi + 1, leaves (m − 1)i + 1.
  Example m = 3, i = 4 → 13 vertices, 9 leaves, 12 edges.
- **~complete — BUILD:** Kₙ: n(n − 1)/2; K_{m,n}: mn. Example K₇ → 21; K₃,₄ → 12.
- **Verdict:** 4 pages.

### 10.4 `he.engineering.discrete-math#4` — Recurrences

- **Asks:** closed form of a second-order linear recurrence → main; first-order with a
  constant (Tower of Hanoi) → ~first-order; repeated root → ~repeated-root.
- **Main — BUILD:** `termsChart` `type: 'recursive'`. Values c₁, c₂ (aₙ = c₁aₙ₋₁ + c₂aₙ₋₂), a₀,
  a₁, roots r₁, r₂, constants A, B, index n, term aₙ. Relations: r² = c₁r + c₂;
  A + B = a₀; Ar₁ + Br₂ = a₁; aₙ = Ar₁ⁿ + Br₂ⁿ. Page limit: c₁² + 4c₂ > 0 (distinct real roots;
  the repeated root has its own page). Example aₙ = 5aₙ₋₁ − 6aₙ₋₂, a₀ = 1, a₁ = 4 → r = 2, 3; A = −1,
  B = 2; aₙ = −2ⁿ + 2·3ⁿ; a₅ = 454 (check 1, 4, 14, 46, 146, 454). startWith c₁, c₂, a₀, a₁, n.
  Use: "Use this for 'Solve aₙ = 5aₙ₋₁ − 6aₙ₋₂ with a₀ = 1, a₁ = 4.'"
- **~first-order — BUILD:** aₙ = raₙ₋₁ + d → aₙ = rⁿ(a₀ + d/(r − 1)) − d/(r − 1). Example r = 2,
  d = 1, a₀ = 0 → 2ⁿ − 1; n = 10 → 1023 moves.
- **~repeated-root — BUILD:** aₙ = (A + Bn)rⁿ. Example aₙ = 4aₙ₋₁ − 4aₙ₋₂, a₀ = 1, a₁ = 4 →
  (1 + n)2ⁿ; a₃ = 32.
- **Verdict:** 3 pages (the master theorem is in 11.3).

## 11. he.engineering.data-structures — Data Structures & Algorithms (after discrete-math)

- **Textbooks:** Morin, _Open Data Structures_ (ch. 1–3, 6, 10–12); Erickson, _Algorithms_
  (ch. 1, 5, 8); MIT OCW 6.006 (2020, lectures 1–14). Titles only: CLRS, Sedgewick & Wayne,
  Goodrich & Tamassia.
- **Order:** the taxonomy's; Big-O last as the taxonomy has it, though CLRS teaches it first,
  so each earlier page's assumptions name the cost in words ("each push is constant time").

### 11.0 `he.engineering.data-structures#0` — Lists, stacks and queues

- **Asks:** what a stack or queue holds after a list of operations → main; circular-buffer
  indices → ~circular-queue; address of an array element → ~array-address; evaluate postfix →
  ~postfix; cost of a growing array → ~dynamic-array.
- **Main — BUILD (explore) ⏳ P25 (`dataStructure` figure):** scenes: "push 3, push 5, push 2,
  pop: 2 comes out (last in, first out)"; "enqueue 3, 5, 2, dequeue: 3 comes out (first in,
  first out)"; "a circular queue of 8 wraps from slot 7 to slot 0"; "insert 4 at the head of a
  linked list: one pointer change, no shifting". Sentence: "A stack takes from the end it
  added to; a queue from the other end." Use: "Use this for 'After push 3, push 5, push 2, pop,
  what is on top?'"
- **~circular-queue — BUILD, E4:** last item at (front + count − 1) mod N; next enqueue at
  (front + count) mod N. Example N = 8, front 6, count 4 → last at 1, next at 2.
- **~array-address — BUILD:** row-major address = base + (r × columns + c) × size. Example
  base 2000, 10 columns, (3, 4), 8 bytes → 2272.
- **~postfix — BUILD (sequence):** evaluate "3 4 + 2 × 7 −": "push 3"; "push 4"; "+ pops 4 and 3,
  pushes 7"; "push 2"; "× pops 2 and 7, pushes 14"; "push 7"; "− pops 7 and 14, pushes 7".
- **~dynamic-array — BUILD, E4:** doubling from 1 to hold n copies 2^⌈log₂n⌉ − 1 items in all.
  Example n = 1000 → 1023 copies, about 1 per push (amortized constant).
- **Verdict:** 5 pages.

### 11.1 `he.engineering.data-structures#1` — Trees and graphs

- **Asks:** least height and most nodes of a binary tree → main; heap array indices →
  ~heap-index; traversal order → ~traversal; adjacency matrix or list size → ~adjacency.
- **Main — BUILD ⏳ P22 (`graph` tree mode, levels filled), E4:** values nodes n, least height
  h_min, height h, most nodes at h, most leaves at h. Relations: h_min = ⌈log₂(n + 1)⌉ − 1; most
  nodes 2^(h+1) − 1; most leaves 2ʰ. Assumptions: height counts edges (a single node has height
  0). Example n = 100 → h_min = 6; at h = 6, 127 nodes, 64 leaves. startWith n, h. Use: "Use this
  for 'What is the least height of a binary tree with 100 nodes?'"
- **~heap-index — BUILD, E4:** 0-based: parent ⌊(i − 1)/2⌋, children 2i + 1, 2i + 2. Example
  i = 5 → 2; 11, 12.
- **~traversal — BUILD (sequence):** the BST from inserting 50, 30, 70, 20, 40, 60, 80; order of a
  preorder visit: 50, 30, 20, 40, 70, 60, 80. Sentence: "Preorder: the node, then its left
  subtree, then its right."
- **~adjacency — BUILD:** matrix n² cells; list n + 2e entries (undirected). Example n = 1000,
  e = 5000 → 1 000 000 vs 11 000.
- **Verdict:** 4 pages.

### 11.2 `he.engineering.data-structures#2` — Sorting and searching

- **Asks:** worst-case comparisons of binary vs linear search → main; comparisons of
  quadratic sorts vs merge sort → ~sort-counts; merge-sort passes → ~merge-passes; hash table
  probes → ~hashing.
- **Main — BUILD ⏳ P25 (array with low, mid, high), E4:** values n, binary worst
  ⌊log₂n⌋ + 1, linear worst n, linear average (n + 1)/2. Example 1000 → 10, 1000, 500.5.
  startWith n. Use: "Use this for 'At most how many comparisons does binary search make in a
  sorted list of 1000?'"
- **~sort-counts — BUILD, E4:** n(n − 1)/2 vs n⌈log₂n⌉. Example 1000 → 499 500 vs 10 000.
- **~merge-passes — BUILD (sequence, spans in comparisons):** "Start: 5 2 8 1 9 3 7 4" (0);
  "Pairs merged: 2 5 | 1 8 | 3 9 | 4 7" (4); "Fours merged: 1 2 5 8 | 3 4 7 9" (6); "All merged:
  1 2 3 4 5 7 8 9" (7); total 17 comparisons, under n log₂n = 24.
- **~hashing — BUILD:** α = n/m; linear probing hits ½(1 + 1/(1 − α)), misses ½(1 + 1/(1 − α)²);
  chaining hits 1 + α/2. Example 750 keys, 1000 slots → 0.75, 2.5, 8.5, 1.375.
- **Verdict:** 4 pages.

### 11.3 `he.engineering.data-structures#3` — Big-O analysis

- **Asks:** how running time grows with n → main; master theorem → ~master; count of a nested
  loop → ~loop-count; order functions by growth → ~growth-order.
- **Main — BUILD:** `table` with `graph` (n doubling, time per row). Values power p
  (`allowed` 1, 2, 3), log factor g (`allowed` 0, 1), n₁, time T₁, n₂, time T₂. Relation:
  T₂ = T₁ × n₂ᵖ(log₂n₂)ᵍ ÷ (n₁ᵖ(log₂n₁)ᵍ). Assumptions: the leading term dominates at these n;
  constants cancel in the ratio. Example p = 2, 1 s at 1000 → 16 s at 4000; p = 1, g = 1 → 4.80 s.
  startWith p, g, n₁, T₁, n₂. Use: "Use this for 'A quadratic algorithm takes 1 s for 1000 items.
  About how long for 4000?'"
- **~master — BUILD, E10:** T(n) = aT(n/b) + Θ(nᵈ): compare log_b a with d. Example a = 2, b = 2,
  d = 1 → equal → Θ(n log n); a = 8, b = 2, d = 2 → 3 > 2 → Θ(n³).
- **~loop-count — BUILD:** inner loop to i: n(n − 1)/2; three nested increasing: C(n, 3).
  Example n = 100 → 4950; 161 700.
- **~growth-order — BUILD (sequence):** slowest to fastest: 1, log n, √n, n, n log n, n², 2ⁿ, n!.
- **Verdict:** 4 pages.

## 12. he.engineering.computer-architecture — Computer Organization & Architecture (after digital-logic)

- **Textbooks:** MIT OCW 6.004 (L09–L22); Matthews, Newhall & Webb, _Dive into Systems_
  (ch. 5, 11); the RISC-V ISA specification (encoding tables). Titles only: Patterson &
  Hennessy _Computer Organization and Design_ (RISC-V and MIPS editions) ch. 1–5; Hennessy &
  Patterson _Computer Architecture_.
- **Order:** the taxonomy's (Patterson & Hennessy's). RISC-V is the ISA of the examples, with
  MIPS named where its rule differs (branch offsets), since both editions are in use.

### 12.0 `he.engineering.computer-architecture#0` — Instruction sets

- **Asks:** field widths and immediate range of an instruction format → main; branch target
  address → ~branch-target; addressing mode of an instruction → ~addressing.
- **Main — BUILD ⏳ P18 (`bitFields`), E4:** values word w (`allowed` 16, 32, 64), opcode bits o,
  registers R (`allowed` 8, 16, 32, 64), register field r = log₂R, register fields k, function
  bits f, immediate bits i, smallest immediate, largest immediate. Relations: r = log₂R;
  i = w − o − kr − f; range −2ⁱ⁻¹ to 2ⁱ⁻¹ − 1. Example RISC-V I-type: 32, 7, 32 registers (5 bits),
  2 fields, 3 → i = 12, −2048 to 2047. startWith w, o, R, k, f. Use: "Use this for 'A 32-bit
  instruction has a 7-bit opcode, two 5-bit register fields and a 3-bit funct. What immediates
  fit?'"
- **~branch-target — BUILD ⏳ E3:** MIPS: PC + 4 + 4 × offset; RISC-V: PC + offset (bytes, even).
  Example MIPS PC = 0x00400020, offset 3 → 0x00400030.
- **~addressing — BUILD (sort):** bins "Register", "Immediate", "Base + offset",
  "PC-relative". Cards: "add x5, x6, x7", "sub x1, x2, x3" → Register; "addi x5, x6, 10",
  "slti x5, x6, −4" → Immediate; "lw x5, 8(x2)", "sw x7, −4(x8)" → Base + offset; "beq x5, x6,
  loop", "jal x1, func" → PC-relative.
- **Verdict:** 3 pages.

### 12.1 `he.engineering.computer-architecture#1` — Datapath and control

- **Asks:** CPU time from instruction count, CPI and clock → main; MIPS rating → main;
  weighted CPI from a mix → ~weighted-cpi; Amdahl's law → ~amdahl; single-cycle clock from unit
  delays → ~critical-path.
- **Main — BUILD ⏳ P32 (`datapath`; stand-in `none`):** values instruction count IC (1–10¹⁵),
  CPI (0.1–100), clock rate f (1 kHz–10 GHz), clock period T, CPU time t, MIPS. Relations:
  T = 1 ÷ f; t = IC × CPI × T; MIPS = IC ÷ (t × 10⁶). Example 2 × 10⁹, 1.5, 3 GHz → T = 0.333 ns,
  t = 1.0 s, 2000 MIPS. startWith IC, CPI, f. Use: "Use this for 'A program runs 2 × 10⁹
  instructions at CPI 1.5 on a 3 GHz CPU. How long does it take?'"
- **~weighted-cpi — BUILD:** `pieChart` of the mix. CPI = Σ fraction × CPI. Example 50% at 1,
  30% at 2, 20% at 3 → 1.7.
- **~amdahl — BUILD:** speedup = 1 ÷ ((1 − f) + f/s); limit 1/(1 − f). Example f = 0.8, s = 4 →
  2.5; never past 5.
- **~critical-path — BUILD ⏳ P32:** single-cycle period = the slowest instruction's units in
  series. Example load: 200 + 100 + 200 + 200 + 100 = 800 ps → 1.25 GHz.
- **Verdict:** 4 pages.

### 12.2 `he.engineering.computer-architecture#2` — Pipelining

- **Asks:** time and speedup of a k-stage pipeline → main; CPI with stalls → ~hazard-cpi;
  which hazard → ~hazards.
- **Main — BUILD ⏳ P23 (`pipelineDiagram`):** values stages k (2–20), instructions n, stage
  time t_s, single-cycle period t_1, cycles k + n − 1, pipelined time, speedup. Relations:
  time = (k + n − 1)t_s; speedup = nt_1 ÷ time. Assumptions: no stalls; every stage takes t_s
  (the slowest stage plus register delay). Example 5, 100, 200 ps, 800 ps → 104 cycles, 20.8 ns,
  speedup 3.85 (→ 4 for long programs). startWith k, n, t_s, t_1. Use: "Use this for 'How long do
  100 instructions take on a 5-stage pipeline with 200 ps stages?'"
- **~hazard-cpi — BUILD:** CPI = 1 + load-use rate × stall + branch rate × mispredict × penalty.
  Example 25% × 40% × 1 + 20% × 10% × 3 → 1.16.
- **~hazards — BUILD (sort):** bins "Data hazard", "Control hazard", "Structural hazard".
  Cards: "sub x4, x1, x5 right after add x1, x2, x3", "a load's result used by the next
  instruction" → Data; "the instruction after beq is fetched before the branch is decided",
  "a jump's target isn't known in fetch" → Control; "one memory port for both fetch and a load",
  "one register-file write port, two writes in a cycle" → Structural.
- **Verdict:** 3 pages.

### 12.3 `he.engineering.computer-architecture#3` — Memory hierarchy

- **Asks:** tag, index and offset bits → main; average memory access time, one and two levels
  → ~amat; page-table size → ~page-table.
- **Main — BUILD ⏳ P18 (`bitFields`), E4:** values address bits A (`allowed` 16, 32, 48, 64),
  cache size C (KiB), block size B (bytes), associativity w (`allowed` 1, 2, 4, 8, 16), sets
  S, offset bits, index bits, tag bits. Relations: S = C ÷ (B × w); offset = log₂B; index =
  log₂S; tag = A − index − offset. Example 32 bits, 32 KiB, 64 B, direct-mapped → 512 sets,
  6, 9, 17; 4-way → 128 sets, 6, 7, 19. startWith A, C, B, w. Use: "Use this for 'A 32 KiB
  direct-mapped cache has 64-byte blocks and 32-bit addresses. How many tag bits?'"
- **~amat — BUILD:** AMAT = hit + miss rate × penalty; two levels hit₁ + m₁(hit₂ + m₂ × memory).
  Example 1 + 0.05 × 100 = 6 cycles; with L2 (10 cycles, 20% local miss) → 2.5 cycles.
- **~page-table — BUILD, E4:** offset log₂(page); entries 2^(VA − offset); size entries ×
  entry. Example 32-bit, 4 KiB pages, 4-byte entries → 12 bits, 2²⁰ entries, 4 MiB.
- **Verdict:** 3 pages.

## 13. he.engineering.embedded-systems — Embedded Systems (after computer-architecture, circuits-1)

- **Textbooks:** Lee & Seshia, _Introduction to Embedded Systems_ (ch. 7–12); Kuphaldt ModEL
  modules (microcontrollers, serial communication, ADC/DAC). Titles only: Valvano _Embedded
  Systems_ (free online), Wolf _Computers as Components_.
- **Order:** the taxonomy's; ADC, DAC and GPIO are #0, as the lab sequence teaches them.

### 13.0 `he.engineering.embedded-systems#0` — Microcontrollers

- **Asks:** ADC code for a voltage and its resolution → main; DAC output → ~dac; LED resistor
  on a pin → ~led-pin; divider for a 5 V → 3.3 V input → ~divider; set or clear a register bit →
  ~bit-mask.
- **Main — BUILD ⏳ P26 (`functionGraph` `quantizer` staircase), E4:** values bits n
  (`allowed` 8, 10, 12, 16), reference V_ref, input V_in, code D, step (LSB), voltage back
  D × LSB. Relations: LSB = V_ref ÷ 2ⁿ; D = ⌊V_in ÷ LSB⌋. Page limit: 0 ≤ V_in < V_ref.
  Assumptions: the converter truncates (some round; the steps name it); D runs 0 to 2ⁿ − 1.
  Example 10 bits, 3.3 V, 1.2 V → LSB = 3.22 mV, D = 372, back 1.199 V. startWith n, V_ref, V_in.
  Use: "Use this for 'A 10-bit ADC with a 3.3 V reference reads 1.2 V. What code does it give?'"
- **~dac — BUILD ⏳ P26:** V_out = D × V_ref ÷ 2ⁿ. Example 8 bits, 5 V, 200 → 3.906 V.
- **~led-pin — BUILD:** R = (V_DD − V_F) ÷ I; page limit I ≤ the pin's rating. Example 3.3 V,
  2.0 V, 10 mA → 130 Ω.
- **~divider — BUILD:** `seriesCircuit` (two resistors). V_out = V_in R₂ ÷ (R₁ + R₂). Example 5 V,
  1 kΩ, 2 kΩ → 3.33 V.
- **~bit-mask — BUILD ⏳ E3:** set bit k: reg | (1 << k); clear: reg & ~(1 << k). Example 0x41,
  set bit 3 → 0x49; then clear bit 6 → 0x09.
- **Verdict:** 5 pages.

### 13.1 `he.engineering.embedded-systems#1` — Interrupts and timers

- **Asks:** prescaler and compare value for a period → main; PWM frequency and duty cycle →
  ~pwm; longest period before overflow → ~overflow; CPU time spent in an ISR → ~cpu-load; what
  happens on an interrupt, in order → ~isr-steps.
- **Main — BUILD ⏳ P20 (`timingDiagram` timer count ramping to the compare value),
  E1 (MHz, μs):** values clock f_clk, prescaler N (`allowed` 1, 8, 64, 256, 1024), timer clock
  f_t, period P, ticks, compare value. Relations: f_t = f_clk ÷ N; ticks = P × f_t; compare =
  ticks − 1. Page limit: compare < 2ⁿ for the timer's n bits. Example 16 MHz, 64, 1 ms → 250 kHz,
  250 ticks, compare 249. startWith f_clk, N, P. Use: "Use this for 'Set a 16 MHz timer to
  interrupt every 1 ms with prescaler 64.'"
- **~pwm — BUILD ⏳ P20:** f_PWM = f_clk ÷ (N(TOP + 1)); duty = compare ÷ (TOP + 1); average
  V = duty × V_DD. Example 16 MHz, 8, 1999, 500 → 1 kHz, 25%, 1.25 V at 5 V.
- **~overflow — BUILD:** longest = 2ⁿ × N ÷ f_clk. Example 16 bits, 1024, 16 MHz → 4.19 s.
- **~cpu-load — BUILD:** load = rate × ISR time. Example 10 kHz × 20 μs → 20%.
- **~isr-steps — BUILD (sequence):** "the event sets the interrupt flag"; "the CPU finishes the
  current instruction"; "it saves the PC and status"; "it jumps to the vector's handler"; "the
  ISR runs and clears the flag"; "return restores the PC and status".
- **Verdict:** 5 pages.

### 13.2 `he.engineering.embedded-systems#2` — Serial protocols

- **Asks:** UART byte rate and frame time → main; baud-rate register and error → ~baud-error;
  SPI throughput → ~spi; I²C transaction time → ~i2c; which protocol → ~protocols.
- **Main — BUILD ⏳ P20 (UART frame: start, data bits LSB first, parity, stop):** values baud
  rate, data bits (`allowed` 5–9), parity bits (`allowed` 0, 1), stop bits (`allowed` 1, 2),
  frame bits, bytes per second, time per byte. Relations: frame = 1 + data + parity + stop;
  rate = baud ÷ frame; time = frame ÷ baud. Example 115 200, 8N1 → 10 bits, 11 520 B/s, 86.8 μs.
  startWith baud, data, parity, stop. Use: "Use this for 'How many bytes per second can a
  115 200-baud 8N1 UART send?'"
- **~baud-error — BUILD, E4:** UBRR = round(f_clk ÷ (16 × baud) − 1); actual = f_clk ÷
  (16(UBRR + 1)); error = actual ÷ baud − 1. Example 16 MHz, 115 200 → 8, 111 111, −3.5%.
- **~spi — BUILD:** bytes per second = f_SCK ÷ 8. Example 8 MHz → 1 MB/s; 16 bits in 2 μs.
- **~i2c — BUILD:** bits = 2 + 9 × (1 + data bytes) (start and stop as one bit time each).
  Example 400 kHz, 2 data bytes → 29 bit times, 72.5 μs.
- **~protocols — BUILD (sort):** bins UART, SPI, I²C. Cards: "no shared clock; both ends agree
  on a baud rate", "a start bit low, a stop bit high" → UART; "a chip-select line for each
  device", "full duplex on MOSI and MISO" → SPI; "two shared wires with device addresses",
  "open-drain lines with pull-up resistors" → I²C.
- **Verdict:** 5 pages.

### 13.3 `he.engineering.embedded-systems#3` — Real-time constraints

- **Asks:** is a task set schedulable under rate-monotonic (utilization bound) → main;
  worst-case response time → ~response-time; EDF schedulability → ~edf.
- **Main — BUILD ⏳ P24 (`scheduleChart` over the hyperperiod):** values C₁, T₁, C₂, T₂, C₃, T₃
  (ms), utilization U, bound. Relations: U = Σ Cᵢ/Tᵢ; bound = n(2^(1/n) − 1). Page limit Cᵢ ≤ Tᵢ.
  Assumptions: independent periodic tasks, deadline = period, shorter period = higher
  priority; U ≤ bound guarantees it, U above the bound needs the response-time test. Example
  (1, 4), (2, 8), (3, 12) → U = 0.75 ≤ 0.780: schedulable. startWith the six. Use: "Use this for
  'Can tasks (C, T) = (1, 4), (2, 8), (3, 12) ms be scheduled rate-monotonically?'"
- **~response-time — BUILD ⏳ E5 (iteration), P24:** R = C + Σ_{higher j} ⌈R/Tⱼ⌉Cⱼ, iterated from
  R = ΣC. Example task 3 above: 6 → 7 → 7; R₃ = 7 ms ≤ 12.
- **~edf — BUILD ⏳ P24:** EDF schedules any set with U ≤ 1. Example (2, 5), (2, 7), (1, 10) →
  U = 0.786: above the RM bound 0.780 (no guarantee), fine for EDF.
- **Verdict:** 3 pages.

## 14. he.engineering.operating-systems — Operating Systems (after computer-architecture, data-structures)

- **Textbooks:** Arpaci-Dusseau, _Operating Systems: Three Easy Pieces_ (free online);
  Hailperin, _Operating Systems and Middleware_; MIT OCW 6.828/6.1810 notes. Titles only:
  Silberschatz _Operating System Concepts_, Tanenbaum _Modern Operating Systems_.
- **Order:** the taxonomy's (Silberschatz's).

### 14.0 `he.engineering.operating-systems#0` — Processes and threads

- **Asks:** which state a process enters on an event → main; context-switch overhead →
  ~switch-cost; processes after n forks → ~fork; CPU use with I/O waiting → ~multiprogramming.
- **Main — BUILD (sort):** bins "Ready", "Running", "Blocked", "Terminated". Cards (the event;
  the bin is the state it moves to): "it is created and loaded", "its disk read completes",
  "the timer ends its time slice" → Ready; "the scheduler dispatches it" → Running; "it asks to
  read from disk", "it waits for a lock another thread holds" → Blocked; "it calls exit()", "it
  is killed by a signal" → Terminated. Sentence: "Only a running process can block; a blocked
  one goes back to ready, never straight to running." Use: "Use this for 'A running process
  requests I/O. Which state does it enter?'"
- **~switch-cost — BUILD:** efficiency = q ÷ (q + s). Example q = 10 ms, s = 0.1 ms → 99.0%.
- **~fork — BUILD:** n forks in a row → 2ⁿ processes. Example 3 → 8 (7 children).
- **~multiprogramming — BUILD:** use = 1 − pⁿ. Example p = 0.8, n = 4 → 59.0%.
- **Verdict:** 4 pages.

### 14.1 `he.engineering.operating-systems#1` — Scheduling

- **Asks:** average waiting and turnaround time under FCFS and SJF → main; under round robin →
  ~round-robin.
- **Main — BUILD ⏳ P24 (Gantt), E4 (ordering):** values bursts b₁–b₄ (ms, all arriving at 0),
  FCFS average wait, FCFS average turnaround, SJF average wait, SJF average turnaround.
  Relations: FCFS wait of job i = sum of the bursts before it; SJF the same after sorting;
  turnaround = wait + burst. Assumptions: arrival order 1, 2, 3, 4; no I/O; a tie keeps
  arrival order. Example 10, 4, 2, 6 → FCFS waits 0, 10, 14, 16 (10 ms), turnaround 15.5 ms; SJF
  waits 0, 2, 6, 12 (5 ms), turnaround 10.5 ms. startWith b₁–b₄. Use: "Use this for 'Four jobs of
  10, 4, 2 and 6 ms arrive together. Compare FCFS and SJF waiting times.'"
- **~round-robin — BUILD ⏳ E5, P24:** quantum q; the steps list each slice. Example jobs A, B,
  C with bursts 5, 3, 1 ms, q = 2 → A 0–2, B 2–4, C 4–5, A 5–7, B 7–8, A 8–9; waits 4, 5, 4 →
  4.33 ms.
- **Verdict:** 2 pages.

### 14.2 `he.engineering.operating-systems#2` — Memory management

- **Asks:** page number, offset and physical address → main; effective access time with a
  TLB → ~tlb; with page faults → ~page-faults; faults under FIFO and LRU → ~replacement.
- **Main — BUILD ⏳ P28 (`memoryMap` paging), E4:** values page size (`allowed` powers of 2,
  256 B–1 MiB), virtual address VA, page number, offset, frame (from the table), physical
  address PA. Relations: page = ⌊VA ÷ size⌋; offset = VA mod size; PA = frame × size + offset.
  Example 4096, VA 20 500 → page 5, offset 20; frame 9 → PA 36 884. startWith size, VA, frame.
  Use: "Use this for 'With 4 KiB pages, virtual address 20 500 is on which page, at what offset?'"
- **~tlb — BUILD:** EAT = h(t + m) + (1 − h)(t + 2m). Example 90%, 10 ns, 100 ns → 120 ns.
- **~page-faults — BUILD:** EAT = (1 − p)m + p × fault time. Example 100 ns, 8 ms, 1 in 100 000
  → 180 ns.
- **~replacement — BUILD ⏳ E5:** references 1, 3, 1, 2, 4, 3, 1, 4 with 3 frames: FIFO 5
  faults, LRU 6 (LRU isn't always better).
- **Verdict:** 4 pages.

### 14.3 `he.engineering.operating-systems#3` — File systems

- **Asks:** largest file with direct and indirect pointers → main; disk access time →
  ~disk-access; blocks and wasted space → ~blocks; allocation method → ~allocation.
- **Main — BUILD ⏳ P28 (`memoryMap` inode):** values block size B, pointer size p,
  pointers per block k = B/p, direct pointers d (default 12), largest file in blocks
  d + k + k² + k³, largest file in bytes. Example 4 KiB, 4 B → k = 1024, 1 074 791 436 blocks,
  4.40 × 10¹² bytes (about 4 TiB). startWith B, p, d. Use: "Use this for 'An inode has 12 direct
  pointers and single, double and triple indirect ones. With 4 KiB blocks, what is the largest
  file?'"
- **~disk-access — BUILD, E1 (rpm):** seek + ½ × 60/rpm + size ÷ rate. Example 9 ms, 7200 rpm,
  4 KiB at 100 MB/s → 9 + 4.17 + 0.04 = 13.2 ms.
- **~blocks — BUILD, E4:** ⌈size ÷ B⌉ blocks; waste = blocks × B − size. Example 10 000 B, 4096 →
  3 blocks, 2288 B wasted.
- **~allocation — BUILD (sort):** bins Contiguous, Linked, Indexed. Cards: "fast random access
  but external fragmentation", "a file can't grow past the free gap after it" → Contiguous;
  "each block holds the next block's address", "a FAT table chains the blocks" → Linked; "an
  inode lists the file's blocks", "a block of pointers per file" → Indexed.
- **Verdict:** 4 pages.

## 15. he.engineering.networks — Computer Networks (after data-structures)

- **Textbooks:** Peterson & Davie, _Computer Networks: A Systems Approach_ (ch. 1–5);
  Bonaventure, _Computer Networking: Principles, Protocols and Practice_. Titles only: Kurose &
  Ross _Computer Networking: A Top-Down Approach_, Tanenbaum & Wetherall.
- **Order:** the taxonomy's; performance is last in the taxonomy but Kurose & Ross teach delay
  in ch. 1, so its pages need nothing from #1–#2.

### 15.0 `he.engineering.networks#0` — Layered models

- **Asks:** header overhead and efficiency → main; which layer a protocol or device is →
  ~layers; encapsulation order → ~encapsulation.
- **Main — BUILD ⏳ P18 (`bitFields` `headers`: nested header bars):** values payload (bytes),
  TCP header (20–60), IP header (20–60), link overhead (Ethernet 18), frame size, efficiency.
  Relations: frame = payload + TCP + IP + link; efficiency = payload ÷ frame. Example 1460, 20,
  20, 18 → 1518 B, 96.2%. startWith payload, TCP, IP, link. Use: "Use this for 'What fraction
  of a full Ethernet frame is application data?'"
- **~layers — BUILD (sort):** bins Application, Transport, Network, Link. Cards: "HTTP", "DNS"
  → Application; "TCP", "UDP", "port numbers" → Transport; "IP", "ICMP", "routers forward by
  destination address" → Network; "Ethernet", "MAC addresses", "switches forward frames" → Link.
- **~encapsulation — BUILD (sequence):** "the application writes a message"; "TCP adds its
  header: a segment"; "IP adds its header: a datagram"; "Ethernet adds its header and FCS: a
  frame"; "the network card sends the frame as bits".
- **Verdict:** 3 pages.

### 15.1 `he.engineering.networks#1` — TCP/IP

- **Asks:** network, broadcast and hosts of an address with a prefix → main; subnets from a
  block → ~subnet-split; TCP throughput limited by window → ~window; sequence and ACK numbers →
  ~seq-ack; the handshake in order → ~handshake.
- **Main — BUILD ⏳ P18 (32 bits split at the prefix), E3 (dotted quads), E4:** values prefix
  n (24–30 here; page limit), block size 2^(32 − n), mask's last octet 256 − block, address's last
  octet a, network octet ⌊a ÷ block⌋ × block, broadcast octet network + block − 1, usable hosts
  block − 2. Example 192.168.10.77/26 → block 64, mask 255.255.255.192, network .64, broadcast
  .127, 62 hosts. startWith n, a. Use: "Use this for 'Find the network and broadcast address of
  192.168.10.77/26.'"
- **~subnet-split — BUILD, E4:** borrow ⌈log₂k⌉ bits. Example /24 into 5 subnets → 3 bits, /27,
  8 subnets of 30 hosts.
- **~window — BUILD:** throughput ≤ window ÷ RTT. Example 64 KiB, 50 ms → 10.5 Mb/s.
- **~seq-ack — BUILD:** ACK = seq + bytes. Example seq 1000, 500 bytes → ACK 1500.
- **~handshake — BUILD (sequence):** "client sends SYN (seq x)"; "server replies SYN-ACK (seq y,
  ack x + 1)"; "client sends ACK (ack y + 1)"; "data flows both ways"; "one side sends FIN";
  "the other acknowledges and sends its own FIN, which is acknowledged".
- **Verdict:** 5 pages.

### 15.2 `he.engineering.networks#2` — Routing

- **Asks:** distance-vector update → main; Dijkstra's order of finalised nodes →
  ~dijkstra; longest-prefix match → ~prefix-match.
- **Main — BUILD ⏳ P22 (`graph` with link costs), E4 (min), E10 (the next hop's name):**
  values link costs c_A, c_B, c_C to three neighbours, their distances D_A, D_B, D_C to the
  destination, best distance D. Relation: D = min(c_A + D_A, c_B + D_B, c_C + D_C) (Bellman–Ford).
  Example 2, 7, 4 and 6, 3, 5 → 8, 10, 9 → 8 via A. startWith the six. Use: "Use this for 'Router
  X's links cost 2, 7, 4 to A, B, C, which report distances 6, 3, 5. Find X's distance.'"
- **~dijkstra — BUILD (sequence, spans = the cost of the edge used) ⏳ P22:** graph S–A 1, S–B 4,
  A–B 2, A–C 5, B–C 1, C–D 3, B–D 6; from S: S (0), A (1), B (2, via A), C (1, via B), D (3, via
  C); distances 0, 1, 3, 4, 7.
- **~prefix-match — BUILD (sort):** bins "10.1.2.0/24", "10.1.0.0/16", "10.0.0.0/8", "Default
  route". Cards: 10.1.2.5, 10.1.2.200 → /24; 10.1.9.9, 10.1.250.1 → /16; 10.200.1.1, 10.0.0.1 →
  /8; 172.16.0.1, 8.8.8.8 → Default.
- **Verdict:** 3 pages.

### 15.3 `he.engineering.networks#3` — Network performance

- **Asks:** transmission and propagation delay → main; bandwidth-delay product → ~bdp;
  stop-and-wait utilisation → ~stop-and-wait; queueing delay → ~queue; file time over a
  bottleneck → ~bottleneck.
- **Main — BUILD ⏳ P20 (`timingDiagram` `link`: the space-time diagram), E1 (b/s, μs):**
  values packet L (bytes), rate R, transmission d_t, distance d, signal speed s
  (default 2 × 10⁸ m/s), propagation d_p, queueing d_q, total. Relations: d_t = 8L ÷ R; d_p = d ÷ s;
  total = d_t + d_p + d_q. Example 1500 B, 100 Mb/s, 2000 km, no queue → 120 μs + 10 ms = 10.12 ms.
  startWith L, R, d. Use: "Use this for 'How long does a 1500-byte packet take to cross a
  2000 km, 100 Mb/s link?'"
- **~bdp — BUILD:** R × RTT. Example 100 Mb/s, 20 ms → 2 Mb = 250 kB.
- **~stop-and-wait — BUILD:** U = d_t ÷ (RTT + d_t). Example 0.12 ms, 20 ms → 0.596%.
- **~queue — BUILD:** M/M/1: ρ = λ/μ; T = 1 ÷ (μ − λ); N = ρ ÷ (1 − ρ). Example 800, 1000 packets/s
  → 0.8, 5 ms, 4 packets.
- **~bottleneck — BUILD:** time = size ÷ min(rates). Example 4 MB over 10 and 2 Mb/s → 16 s.
- **Verdict:** 5 pages.

## Part 3. Pictures for the pictures chat

Kinds reused unchanged: `seriesCircuit` (pilot, ~divider), `circuit` `mixed`, `induction`
(`transformer`, `coil`), `capacitor`, `vectorDiagram` (power triangle), `complexPlane` (stand-in
for impedance), `functionGraph` (`cos`, `sin`, `exponential`, `piecewise`, `transform`),
`waterfall`, `pieChart`, `pascalTriangle`, `termsChart` (`recursive`), `table` (`graph`),
`normalCurve` (tail), `matrixGrid` (`determinant`, `cramer`). New requests, options on existing
kinds first (32: 17 options on existing kinds, 13 new kinds, of which `karnaugh` and
`graph` are also layout figures, and 2 layout-only figures):

1. **HE-electrical-computer-P1 — `seriesCircuit` option `net` (passive schematics).** Pages:
   circuits-1#0~parallel, ~power-sign; #1 main, ~mesh, ~supernode; #2 main, ~norton,
   ~max-power, ~superposition; #4 (as the switch circuit beside P4). Draws a schematic in
   textbook symbols (zig-zag R, plates C, coil L, circle V and I sources with + and arrow, ground)
   for a named `topology`: `parallel`, `twoNode`, `twoMesh`, `supernode`, `thevenin` (circuit and
   its equivalent side by side), `superposition` (the two one-source circuits under the full
   one), `rc`, `rl`, `rlc`, `element` (one box with + − and a current arrow). Fields: `elements:
{ id: valueId, kind: 'R' | 'C' | 'L' | 'V' | 'I' }[]`, `nodes: valueId[]` (node voltages
   written at their dots), `meshes: valueId[]` (circular arrows), `branches` (current arrows).
   Harness: KCL at every drawn node and KVL round every drawn mesh hold to 0.1% for the shown
   values; every label is a value on the page.
2. **P2 — `seriesCircuit` option `amp` (op-amp circuits).** Pages: circuits-1#3 (4 pages),
   electronics#3~integrator, ~active-lowpass, ~schmitt. `amp: 'inverting' | 'nonInverting' |
'summing' | 'difference' | 'integrator' | 'activeLowPass' | 'schmitt'`; fields `vin` (one or
   two), `rin`, `rf`, `rg`, `c`, `vout`, `rail`. Draws the triangle with − and + inputs, the
   resistors, the rails as ±V_sat, v_out at the output and, for `schmitt`, the hysteresis loop
   beside it. Harness: v₊ = v₋ within 1 mV (virtual short) unless the output is at a rail; |v_out|
   never past the rail.
3. **P3 — `seriesCircuit` option `device` (semiconductor circuits).** Pages: electronics#0
   main (stand-in), ~zener, ~rectifier; #1 main; #2 main, ~cs-mosfet. `device: 'diodeR' |
'zener' | 'bridge' | 'bjtDivider' | 'mosfetCS' | 'hybridPi'`; fields per device (V_s, R, V_D;
   V_CC, R₁, R₂, R_C, R_E, V_B, I_C, V_CE; g_m, r_π, R_p, A_v); `bridge` draws the rectified wave
   with ripple V_r above C. Harness: node voltages consistent with the page's relations; the
   BJT is drawn active only when V_CE > 0.2 V.
4. **P4 — `functionGraph` option `transient: { initial, final, tau, time? }`.** Pages:
   circuits-1#4 main, ~discharge, ~rl, ~general; control#0 main, #4 main (with `second` for the
   open-loop curve); electronics#3~integrator (a ramp, `tau` absent); signals#1~exp-step. Draws
   x(t) = x_f + (x₀ − x_f)e^(−t/τ) with the dashed final line, τ to 5τ ticks, the 63% point and
   the point at `time`. Harness: the point's height equals the page's value; τ ticks at the
   value τ.
5. **P5 — `functionGraph` option `stepResponse: { zeta, wn, overshoot?, peak?, settling? }`.**
   Pages: control#1 main, ~from-spec; #3~bandwidth; #4~pi; circuits-1#4~rlc-damping. Draws the
   second-order step response, the ±2% band, the peak marked at (T_p, 1 + %OS) and T_s where it
   enters the band; over- and critically damped curves for ζ ≥ 1. Harness: the drawn peak
   matches %OS and T_p to 0.5%.
6. **P6 — `complexPlane` options `j: true`, `axes: [name, name]`, `phasors`, `poles`, `locus`.**
   Pages: circuits-2#0 main, ~phasor-form, ~parallel-rc; #4 main, ~delta; control#0~feedback,
   #1~dc-gain, #2~root-locus; signals#3 main. `j` writes j for i; `axes` renames the axes (R,
   X; σ, jω); `phasors: { mag, angle, name }[]` draws several arrows from 0 (three-phase star with
   V_ab drawn tip to tail); `poles`, `zeros` mark × and ○; `locus: { poles, zeros?, gain }` draws
   the root-locus branches, the asymptotes from the centroid and the closed-loop poles at the
   gain. Harness: every arrow's length and angle match its values; the closed-loop poles solve
   the characteristic equation at the shown gain.
7. **P7 — new kind `bode`.** Pages: circuits-2#2 main, ~high-pass, ~band-pass; control#3 main,
   ~asymptotes, ~gain-margin; electronics#3 main, ~active-lowpass. Magnitude (dB) and phase (°)
   over a log-frequency axis (Hz or rad/s, decades labelled), straight-line asymptotes dashed,
   the corner frequencies, a marked frequency with its gain and phase, and for loops the gain
   crossover with PM and the phase crossover with GM. Fields: `poles`, `zeros`, `gain` (numbers or
   value ids), `integrators`, `at`, `crossover?`, `margin?`. Harness: the marked gain and phase
   equal the page's values to 0.1 dB and 0.5°.
8. **P8 — new kind `deviceCurves`.** Pages: electronics#0 main, ~shockley; #1~mosfet-sat,
   ~mosfet-triode. Diode mode: the exponential I–V with the load line from (V_s, 0) to (0, V_s/R)
   and the Q point; MOSFET mode: I_D–V_DS curves for 3–5 values of V_GS, the triode/saturation
   boundary V_DS = V_GS − V_t dashed, the Q point. Harness: Q lies on both the device curve and
   the load line.
9. **P9 — new kind `stemPlot`.** Pages: signals#0~discrete-period, #1 main, #3~difference-eq,
   #4 main. Stems of x[n]; `convolve: { x, h, n }` draws x[k], h[n − k] flipped and shifted under
   it, the products and their sum y[n]; `sampled: { f, fs }` draws the continuous sine, the
   samples and the alias sine dashed through the same samples. Harness: the sum equals y[n]; the
   alias passes through every sample.
10. **P10 — `functionGraph` option `fourier: { wave: 'square' | 'saw' | 'triangle', terms, k? }`.**
    Pages: signals#2 main. The partial sum over the wave (Gibbs overshoot visible) and a
    harmonic stem chart beside it with bₖ lit. Harness: the lit stem's height equals bₖ.
11. **P11 — `wave` options `line: { gamma }` and `em: true`.** Pages: electromagnetics#0 main,
    #2 main. `line` draws the standing-wave envelope on a line from source to load, V_max and
    V_min marked (their ratio = VSWR), a load box; `em` draws E (vertical) and H (horizontal)
    in step along the travel direction, λ marked. Harness: V_max/V_min equals the VSWR value.
12. **P12 — `waterfall` option `decibels: true`.** Pages: electromagnetics#3 main,
    communication#2 main, electronics#2~cascade. Items in dB and dBm, the running level in
    dBm, a dashed noise-floor line (`floor` value id) with the margin bracketed. Harness: the end
    bar equals the sum of the signed items.
13. **P13 — new kind `oneLine`.** Pages: power#2 main, ~slg. A one-line diagram: generator
    circle, transformer double circle, line, buses as bars, load arrow, a fault bolt on a bus,
    each element labelled with its pu reactance; the Thévenin reactance summed under it.
    Harness: the summed reactance equals X_th.
14. **P14 — `functionGraph` option `equalArea: { pm, pmax, d0, dc, dmax? }`.** Pages: power#3
    main (and power#0 main's P–δ point, which works today without it). The P–δ sine, the P_m
    line, the area A₁ (accelerating, from δ₀ to δ_cr under P_m) and A₂ (decelerating, above P_m
    to δ_max) shaded. Harness: A₁ = A₂ to 1% at the critical angle.
15. **P15 — new kind `rfSpectrum`.** Pages: communication#0 main, ~fm. A frequency axis with the
    carrier line and sidebands to scale (AM: two at f_c ± f_m with heights μ/2; FM: lines inside
    the Carson band, the band bracketed), and the time waveform with its envelope above. Harness:
    the bracketed bandwidth equals B; the sideband heights match P_sb.
16. **P16 — `complexPlane` option `constellation: { M, kind: 'psk' | 'qam' }`.** Pages:
    communication#1 main. M points with Gray-coded bit labels and the decision boundaries.
    Harness: M points drawn, log₂M bits per label, neighbours differ in one bit.
17. **P17 — `placeValueChart` option `base: 2 | 8 | 16`, `width`.** Pages: digital-logic#0
    main. Columns weighted 2ᵏ (or 16ᵏ), the digits, the weights of the 1s added under it; a
    `twos` row inverting and adding 1. Harness: Σ digit × weight equals N.
18. **P18 — new kind `bitFields`.** Pages: architecture#0 main, #3 main; networks#0 main
    (`headers` mode), #1 main. A word as a bar cut into named fields, widths to scale and
    written (opcode 7 | rd 5 | …; tag | index | offset; network | host), the bits of a given value
    written in; `headers` draws nested header boxes around a payload, each with its bytes.
    Harness: the field widths add to the word size; the bytes add to the frame.
19. **P19 — new calculator kind and explore figure `karnaugh` (with its truth table).** Pages:
    digital-logic#1 main (explore), discrete-math#0~truth-table (explore). A 2-, 3- or 4-variable
    K-map in Gray order with the truth table beside it; scenes give minterms, don't-cares and
    groups, each group ringed in its own outline style (not by colour alone) with its product
    term written. Truth-table mode: columns for sub-expressions, a lit column. Harness (layout
    test): every group is a power-of-two rectangle (wrapping allowed) of 1s and don't-cares;
    the written SOP's truth table equals the scene's.
20. **P20 — new kind `timingDiagram`.** Pages: digital-logic#2 main; embedded#1 main, ~pwm; #2
    main; networks#3 main (`link` mode). Stacked digital waveforms on one time axis (clock, D,
    Q; a timer count ramp with the compare level; a UART frame with start, data LSB first,
    parity, stop) with interval brackets (t_cq, t_setup, a bit time); `link` mode draws the
    space–time diagram of a packet (transmission as the slanted band's width, propagation as its
    slope). Harness: brackets equal their values; the frame has the stated bit count.
21. **P21 — explore figure `stateDiagram`.** Pages: digital-logic#3 main. State bubbles with
    outputs (Moore) or arrow labels in/out (Mealy), a scene's `input` string lighting the path
    one step at a time. Layout test: every state has one arrow per input value.
22. **P22 — new kind (and card figure) `graph`.** Pages: discrete-math#3 main;
    data-structures#1 main; networks#2 main, ~dijkstra; communication#3~code-length (tree mode).
    Vertices and edges laid out by a fixed embedding (no crossings when planar), degrees or edge
    costs written, a lit path; `tree` mode draws a rooted binary or code tree level by level
    with 0/1 on edges. Harness: degree sum = 2E; the lit path's cost equals the page's value.
23. **P23 — new kind `pipelineDiagram`.** Pages: architecture#2 main. A grid of instructions
    by clock cycles, each cell a stage (IF, ID, EX, MEM, WB), stall bubbles and forwarding arrows
    when given. Harness: the last cell is at cycle k + n − 1 (with no stalls); n is drawn up to 8
    rows with "…" past it.
24. **P24 — new kind `scheduleChart`.** Pages: embedded#3 main, ~response-time, ~edf;
    operating-systems#1 main, ~round-robin. A Gantt chart: one row per task (or one row of
    slices), release arrows and deadlines, the hyperperiod or the makespan; waits bracketed.
    Harness: the slices of each task add to its burst or C per period; no deadline is drawn
    missed unless the page says so.
25. **P25 — explore figure `dataStructure`.** Pages: data-structures#0 main, #2 main (array
    mode with low, mid, high pointers). Boxes for a stack (vertical, top marked), queue (front
    and rear), circular buffer (ring of N slots), linked list (nodes and arrows), array with
    pointers. Layout test: the scene's operations replayed give the drawn contents.
26. **P26 — `functionGraph` option `quantizer: { bits, vref, input?, mode: 'adc' | 'dac' }`.**
    Pages: embedded#0 main, ~dac; signals#4~quantization. The staircase transfer function (up
    to 16 steps drawn, then a zoom on the step holding the input), the input's step lit, 1 LSB
    bracketed. Harness: the lit step's code equals D.
27. **P27 — `venn` option `three`.** Pages: discrete-math#1 main. Three circles with the
    count in each of the 7 regions worked out from the 7 values and the union bracketed.
    Harness: the regions add to the union; no region negative (the page limit).
28. **P28 — new kind `memoryMap`.** Pages: operating-systems#2 main, #3 main. `paging`: a
    virtual space in pages, the page table, physical frames, the address's page and offset
    lit; `inode`: the inode with 12 direct pointer boxes and three indirect ones fanning out,
    the block counts written. Harness: PA = frame × size + offset; the counts equal k, k², k³.
29. **P29 — `matrixGrid` option `routh`.** Pages: control#2 main, ~routh-count. The Routh
    array for a cubic, each computed cell's 2 × 2 cross-product shown on tap, the first column
    lit with sign changes counted. Harness: the first column matches the page's values.
30. **P30 — `oscillator` option `damper: b`.** Pages: control#0~mass-spring. A dashpot beside
    the spring, labelled b, with the decaying x–t trace for ζ. Harness: ω_n and ζ in the caption
    equal the page's values.
31. **P31 — `induction` option `wire` and `charges` option `line`.** Pages: electromagnetics#1
    main, ~gauss-line. A long straight wire end-on with concentric B circles (right-hand
    direction), a point at r with its B; a line charge with its Gaussian cylinder and radial E.
    Harness: the field at r equals the page's value.
32. **P32 — new kind `datapath`.** Pages: architecture#1 main, ~critical-path. The five units
    (instruction memory, register file, ALU, data memory, write-back mux) in a row with each
    unit's delay; an instruction class lights the units it uses and sums their delays. Harness:
    the lit delays add to the period.

## Part 4. Research to do

For a separate research chat; nothing here has been collected. The reference-only rule of
`research/README.md` applies: no problem, number, figure or sentence goes into a lesson.
Licences marked "verified" were read on the publisher's page for this plan (2026-10-02);
"confirm" means from memory, to be checked and quoted in `research/textbooks/sources/` before
anything is fetched. robots.txt was not checked for any site below; check it first, and keep
the K–12 rules (one request a second, the project User-Agent). OpenStax stays off limits (its
robots.txt disallows `/books/` for AI crawlers, `research/questions/SOURCES.md`), which rules out
OpenStax University Physics vol. 2 as a bridge text here.

### Textbooks

Record per book a `toc/college/<book>.json` (chapters and sections mapped to
`<courseId>#<topic>`), and per topic: the worked-example types in order, typical number sizes
(component values, frequencies, word sizes), the notation (j or i, V or v for phasors, 0- or
1-based heaps, KB or KiB) and the order of topics. Titles-only for all-rights-reserved books.

| Book                                                                                                                                                                                                                                                                                      | URL                                                | Licence                          | Courses (topics)                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------- | ------------------------------------------------------ |
| Kuphaldt, _Lessons in Electric Circuits_ I–IV                                                                                                                                                                                                                                             | https://www.ibiblio.org/kuphaldt/electricCircuits/ | Design Science License (confirm) | circuits-1, circuits-2, electronics, digital-logic#0–2 |
| Kuphaldt, Modular Electronics Learning (ModEL) modules and worksheets                                                                                                                                                                                                                     | https://www.ibiblio.org/kuphaldt/socratic/model/   | CC BY 4.0 (verified)             | circuits-1/2, electronics, digital-logic, embedded     |
| Kuphaldt, _Lessons in Industrial Instrumentation_                                                                                                                                                                                                                                         | https://www.ibiblio.org/kuphaldt/socratic/sinst/   | CC BY 4.0 (confirm)              | power-systems, control#4 (PID tuning)                  |
| Fiore, _DC_ and _AC Electrical Circuit Analysis_, _Semiconductor Devices_, _Operational Amplifiers & Linear ICs_                                                                                                                                                                          | LibreTexts Engineering bookshelf                   | CC BY-NC-SA 4.0 (confirm)        | circuits-1, circuits-2, electronics                    |
| Johnson, _Fundamentals of Electrical Engineering I_                                                                                                                                                                                                                                       | LibreTexts Engineering bookshelf                   | CC BY (confirm)                  | circuits-1/2, signals#2, communication                 |
| Baraniuk et al., _Signals and Systems_                                                                                                                                                                                                                                                    | LibreTexts Engineering bookshelf                   | CC BY (confirm)                  | signals-systems                                        |
| Downey, _Think DSP_                                                                                                                                                                                                                                                                       | https://greenteapress.com/wp/think-dsp/            | CC BY-NC (confirm)               | signals#2, #4                                          |
| Åström & Murray, _Feedback Systems_ (2nd ed.)                                                                                                                                                                                                                                             | https://fbswiki.org/                               | free PDF; licence to confirm     | control-systems                                        |
| Wikibooks, _Control Systems_                                                                                                                                                                                                                                                              | https://en.wikibooks.org/wiki/Control_Systems      | CC BY-SA (confirm)               | control-systems                                        |
| Ellingson, _Electromagnetics_ vol. 1 and 2                                                                                                                                                                                                                                                | https://doi.org/10.21061/electromagnetics-vol-1    | CC BY-SA 4.0 (verified, vol. 1)  | electromagnetics (all four)                            |
| MIT OpenCourseWare 6.002, 6.003, 6.012, 6.013, 6.302, 6.061, 6.02, 6.450, 6.004, 6.006, 6.042J, 6.1810, 6.033, 6.829, 16.06                                                                                                                                                               | https://ocw.mit.edu                                | CC BY-NC-SA 4.0 (confirm)        | every course (one OCW course each, above)              |
| Levin, _Discrete Mathematics: An Open Introduction_                                                                                                                                                                                                                                       | https://discrete.openmathbooks.org/                | CC BY-SA 4.0 (confirm)           | discrete-math                                          |
| Lehman, Leighton & Meyer, _Mathematics for Computer Science_                                                                                                                                                                                                                              | MIT OCW 6.042J                                     | CC BY-SA 3.0 (confirm)           | discrete-math, data-structures#3                       |
| Hammack, _Book of Proof_                                                                                                                                                                                                                                                                  | https://www.people.vcu.edu/~rhammack/BookOfProof/  | CC BY-NC-ND (confirm)            | discrete-math#0, #1                                    |
| Morin, _Open Data Structures_                                                                                                                                                                                                                                                             | https://opendatastructures.org/                    | CC BY 2.5 (confirm)              | data-structures                                        |
| Erickson, _Algorithms_                                                                                                                                                                                                                                                                    | https://jeffe.cs.illinois.edu/teaching/algorithms/ | CC BY 4.0 (confirm)              | data-structures#2, #3; networks#2 (shortest paths)     |
| Matthews, Newhall & Webb, _Dive into Systems_                                                                                                                                                                                                                                             | https://diveintosystems.org/                       | CC BY-NC-ND 4.0 (confirm)        | architecture, operating-systems#0, #2                  |
| RISC-V ISA specification                                                                                                                                                                                                                                                                  | https://riscv.org/specifications/                  | CC BY 4.0 (confirm)              | architecture#0 (formats, immediates)                   |
| Lee & Seshia, _Introduction to Embedded Systems_                                                                                                                                                                                                                                          | https://ptolemy.berkeley.edu/books/leeseshia/      | CC BY-NC-ND 4.0 (verified)       | embedded-systems, digital-logic#3                      |
| Arpaci-Dusseau, _Operating Systems: Three Easy Pieces_                                                                                                                                                                                                                                    | https://pages.cs.wisc.edu/~remzi/OSTEP/            | free to read; licence to confirm | operating-systems                                      |
| Hailperin, _Operating Systems and Middleware_                                                                                                                                                                                                                                             | https://gustavus.edu/mcs/max/os-book/              | CC BY-SA 3.0 (confirm)           | operating-systems                                      |
| Peterson & Davie, _Computer Networks: A Systems Approach_                                                                                                                                                                                                                                 | https://book.systemsapproach.org/                  | CC BY 4.0 (verified)             | networks                                               |
| Bonaventure, _Computer Networking: Principles, Protocols and Practice_                                                                                                                                                                                                                    | https://www.computer-networking.info/              | CC BY (confirm)                  | networks                                               |
| Titles only: Alexander & Sadiku, Nilsson & Riedel, Sedra & Smith, Razavi, Oppenheim & Willsky, Nise, Ogata, Ulaby, Hayt & Buck, Glover–Sarma–Overbye, Chapman, Haykin, Proakis, Harris & Harris, Mano, Rosen, CLRS, Patterson & Hennessy, Silberschatz, Tanenbaum, Kurose & Ross, Valvano | publishers' public pages                           | all rights reserved              | chapter titles and order only, to check coverage       |

A college crosswalk (`research/textbooks/college/CROSSWALK.md`: topic → the chapter of each
book) should be generated by `tools/build.py` the way the K–12 one is.

### Questions

Record per question (`research/questions/college/<course>.jsonl`): course id, topic index,
the problem-type slug it would use, the question type in our words, the unknown and the given,
the number sizes (reference only), whether a figure carries it (schematic, Bode plot, K-map,
graph), source, licence, URL and retrieval date; the review later marks it Solves, Partly or No.

| Source                                                         | URL                                             | Licence                             | Courses                                  | Target                          |
| -------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------- | ---------------------------------------- | ------------------------------- |
| MIT OCW problem sets and exams (the courses above)             | https://ocw.mit.edu                             | CC BY-NC-SA 4.0 (confirm)           | all 15                                   | 15 per course                   |
| Kuphaldt ModEL and Socratic worksheets                         | https://www.ibiblio.org/kuphaldt/socratic/      | CC BY 4.0 (verified for ModEL)      | circuits-1/2, electronics, digital-logic | 15 per course                   |
| Ellingson end-of-section problems                              | https://doi.org/10.21061/electromagnetics-vol-1 | CC BY-SA 4.0 (verified)             | electromagnetics                         | 25                              |
| Levin and MCS exercises                                        | as above                                        | CC BY-SA (confirm)                  | discrete-math                            | 30                              |
| Erickson and Morin exercises; OpenDSA exercises                | as above; https://opendsa.org/                  | CC BY (confirm); OpenDSA to confirm | data-structures                          | 30                              |
| Peterson & Davie, Bonaventure exercises                        | as above                                        | CC BY (verified / confirm)          | networks                                 | 25                              |
| Lee & Seshia exercises                                         | as above                                        | CC BY-NC-ND 4.0 (verified)          | embedded-systems, digital-logic#3        | 15                              |
| Wikibooks _Control Systems_ examples                           | as above                                        | CC BY-SA (confirm)                  | control-systems                          | 15                              |
| AP Physics C: Electricity and Magnetism released free-response | AP Central (College Board)                      | all rights reserved, reference      | circuits-1#4 (RC), electromagnetics#1    | 10, bridge level                |
| AP Computer Science A released free-response                   | AP Central (College Board)                      | all rights reserved, reference      | data-structures#0, #2                    | 5, bridge level                 |
| NCEES FE Electrical and Computer exam specification            | https://ncees.org (public PDF)                  | all rights reserved, reference      | all electrical and computer topics       | the topic list and weights only |

Off limits: NCEES practice exams and the FE Reference Handbook (sold or behind a login), Chegg,
Course Hero, publisher solution manuals, and the GRE Computer Science test (discontinued; its
practice book is ETS copyright). **Target:** about 40 questions for each of the eight core
courses (circuits-1, circuits-2, signals-systems, control-systems, digital-logic,
discrete-math, data-structures, computer-architecture) and 25 for each of the other seven:
**about 495 questions**.

### Engine needs

| Need                         | What the solver, steps or harness must learn                                                                                                                                                                                                                                     | Pages waiting                                                                                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1 Units                     | H, mH, μH; Hz, kHz, MHz, GHz; rad/s; rpm; μs, ns, ps; VA, kVA, MVA; var, kvar; S, mS; T, μT; Wb; V/m, A/m; per-length nH/m, pF/m; S/m; N·s/m, N/m; mA/V²; dB, dBm, dBi (logarithmic, not converted with the others); pu; bits and bytes with KiB/MiB and kB/MB; b/s with k, M, G | 19 pages (circuits-1#4, circuits-2#0, #1, #3, electronics#1, signals#4, EM#0, #2, #3, power#0, #1, comm#2, digital-logic#2, embedded#1, OS#3, networks#3) |
| E2 Complex values            | a value that is a + jb (or A∠θ), relations and steps on it (product, quotient, conjugate, polar ↔ rectangular lines), the picture reading both parts                                                                                                                             | EM#0~input-impedance, power#0~load-flow, #1~sync-generator, #2~sym-components; later parallel impedances in circuits-2#0                                  |
| E3 Bases                     | show and type a whole number in base 2, 8 or 16 at a width (two's complement), and IPv4 dotted quads                                                                                                                                                                             | digital-logic#0 main, ~bcd, #2~shift; architecture#0~branch-target; embedded#0~bit-mask; networks#1 main                                                  |
| E4 Integer functions         | ⌊ ⌋, ⌈ ⌉, mod, round, exact log₂ of a power of 2, min and sort of a short list, each as a step line the harness reads                                                                                                                                                            | 25 pages (digital-logic, data-structures, architecture, OS, networks, signals#0, #4, discrete#2)                                                          |
| E5 Iteration                 | a step that repeats a rule until it stops (response time) or builds a table row by row (round robin, page replacement, Gauss–Seidel)                                                                                                                                             | embedded#3~response-time, OS#1~round-robin, OS#2~replacement, power#0~load-flow                                                                           |
| E6 Short sequences           | a value that is a list of 1–8 numbers (x[n], h[n]) with Σ over an index in steps                                                                                                                                                                                                 | signals#1 main                                                                                                                                            |
| E7 Special functions         | Q(x) (from the normal tail already drawn), sinc, atan2 in steps                                                                                                                                                                                                                  | comm#1~bpsk-ber, signals#2~pulse-spectrum; atan2 on every phasor page                                                                                     |
| E8 Simultaneous linear solve | 2 × 2 (later 3 × 3) relations solved together, with the `matrixGrid` Cramer lines as the steps                                                                                                                                                                                   | circuits-1#1 main (ships in closed form until then); mesh and supernode pages likewise                                                                    |
| E9 Exact big integers        | whole numbers past 2⁵³ exact (n!, C(n, r), 2⁶⁴)                                                                                                                                                                                                                                  | discrete-math#2 main at large n                                                                                                                           |
| E10 Named outputs            | an answer that is a word from a list (underdamped, Θ(n log n), via A, stable) with its own choice box                                                                                                                                                                            | circuits-1#4~rlc-damping, control#1~step-error (ramp), data-structures#3~master, networks#2 main                                                          |
| E11 Harness phrases          | dB, dBm, ∠, j, log₂, ⌈ ⌉, ⌊ ⌋, mod, Σ in `PHRASES`; picture checks for the 32 requests                                                                                                                                                                                           | every page                                                                                                                                                |

## Summary

- **Pages:** 15 courses, 65 topics, **256 pages** (65 main + 191 problem types): **223
  calculators** and **33 layouts** (19 sorts, 10 sequences, 4 explorations; 5 of the main pages
  are layouts). **118 pages are ⏳** (waiting on a picture, an engine need or both); 138 can be
  built today with existing kinds. The pilot `he.engineering.circuits-1#0` is kept (one rename).
- **Pictures:** 32 requests, HE-electrical-computer-P1 to P32: 17 options on existing kinds
  (`seriesCircuit` `net`, `amp`, `device`; `functionGraph` `transient`, `stepResponse`,
  `fourier`, `equalArea`, `quantizer`; `complexPlane` `phasors`/`poles`/`locus`,
  `constellation`; `wave` `line`, `em`; `waterfall` `decibels`; `placeValueChart` `base`;
  `venn` `three`; `matrixGrid` `routh`; `oscillator` `damper`; `induction` `wire` with
  `charges` `line`), 13 new kinds (`bode`, `deviceCurves`, `stemPlot`, `oneLine`, `rfSpectrum`,
  `bitFields`, `karnaugh`, `timingDiagram`, `graph`, `pipelineDiagram`, `scheduleChart`,
  `memoryMap`, `datapath`) and 2 layout-only figures (`stateDiagram`, `dataStructure`). The
  most-used: P1 schematics (10 pages), P6 phasors and poles (9), P4 transients (8), P7 Bode (8).
- **Engine needs:** E1 units (19 pages), E2 complex values (4 pages now, more later), E3 bases
  (6), E4 integer functions (25), E5 iteration (4), E6 sequences (1), E7 Q and sinc (2), E8
  simultaneous solve (3, with a closed-form stand-in), E9 big integers, E10 named outputs (4),
  E11 harness phrases.
- **Research:** 23 open or free sources (Fiore's four books counted once; 4 licences verified, the
  rest to confirm) plus titles
  of 22 commercial texts; about 495 questions, 40 per core course and 25 per other course, from
  MIT OCW, Kuphaldt, Ellingson, Levin, MCS, Erickson, Morin, Peterson & Davie, Bonaventure, Lee
  & Seshia and Wikibooks, with AP Physics C and AP CS A as the bridge level and the NCEES FE
  specification for topic weights only.
