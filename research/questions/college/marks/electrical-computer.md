# Re-marked plan: electrical and computer (`docs/plans/he.electrical-computer.md`)

Research group R4, 2026-10-02. The plan lists each topic’s question types as "Asks: type → page"; an ask with a page is marked Solves, one with "no page yet" No. Each record in `../electrical.jsonl` and `../computer.jsonl` names the page that answers it (or none). "keep" means at least one item is fully answered by that page; "keep (items ask more)" means every matched item goes past the page (the record says how, mark Partly); "no item" means none was found. New asks come from item types no ask covers; they are added to the plan as "type → [new-page]" (No). Reference only.

## circuits-1#0

Records: 13 (Partly 6, Solves 7).

| Ask                                                          | Page             | Old mark | New mark     | Items                                                                                               |
| ------------------------------------------------------------ | ---------------- | -------- | ------------ | --------------------------------------------------------------------------------------------------- |
| current and drops in a series loop                           | main             | Solves   | keep         | MODEL-SERIES-13, MODEL-SERIES-14, MODEL-SERIES-15, MODEL-SERIES-16, MODEL-SERIES-17, MODEL-KVL-11 … |
| equivalent resistance and branch currents of a parallel pair | ~parallel        | Solves   | keep         | MODEL-PARALLEL-13, MODEL-PARALLEL-15, MODEL-PARALLEL-17, MODEL-KCL-11                               |
| series-parallel reduction                                    | ~series-parallel | Solves   | keep         | MODEL-SERIESPARALLEL-15, MODEL-SERIESPARALLEL-16                                                    |
| power absorbed or delivered with the passive sign convention | ~power-sign      | Solves   | no item      |                                                                                                     |
| voltage divider                                              | main             | Solves   | keep         | MODEL-SERIES-13, MODEL-SERIES-14, MODEL-SERIES-15, MODEL-SERIES-16, MODEL-SERIES-17, MODEL-KVL-11 … |
| shunt resistor for an ammeter range                          | [new-page]       | —        | No (new ask) | MODEL-PARALLEL-17                                                                                   |

## circuits-1#1

Records: 2 (Partly 2).

| Ask                                                   | Page       | Old mark | New mark              | Items                                 |
| ----------------------------------------------------- | ---------- | -------- | --------------------- | ------------------------------------- |
| two node voltages with a voltage and a current source | main       | Solves   | keep (items ask more) | MODEL-SERIESPARALLEL-19, MODEL-KCL-15 |
| two mesh currents                                     | ~mesh      | Solves   | no item               |                                       |
| the current in a shared branch                        | ~mesh      | Solves   | no item               |                                       |
| supernode                                             | ~supernode | Solves   | no item               |                                       |

## circuits-1#2

Records: 6 (Partly 1, Solves 5).

| Ask                          | Page           | Old mark | New mark | Items                                                                       |
| ---------------------------- | -------------- | -------- | -------- | --------------------------------------------------------------------------- |
| V_Th, R_Th seen by a load    | main           | Solves   | keep     | MODEL-THEVENIN_NORTON-9, MODEL-THEVENIN_NORTON-12, MODEL-THEVENIN_NORTON-13 |
| the load current             | main           | Solves   | keep     | MODEL-THEVENIN_NORTON-9, MODEL-THEVENIN_NORTON-12, MODEL-THEVENIN_NORTON-13 |
| Norton form                  | ~norton        | Solves   | no item  |                                                                             |
| maximum power transfer       | ~max-power     | Solves   | keep     | MODEL-MAXPOWER-6                                                            |
| superposition of two sources | ~superposition | Solves   | keep     | MODEL-SUPER-6, MODEL-SUPER-7                                                |

## circuits-1#3

Records: 5 (Partly 1, Solves 4).

| Ask                         | Page           | Old mark | New mark              | Items                          |
| --------------------------- | -------------- | -------- | --------------------- | ------------------------------ |
| inverting gain and output   | main           | Solves   | keep                  | MODEL-OPAMP-33, MODEL-OPAMP-34 |
| non-inverting               | ~non-inverting | Solves   | keep (items ask more) | MODEL-OPAMP-36                 |
| summing amplifier           | ~summing       | Solves   | keep                  | MODEL-OPAMP-45                 |
| difference amplifier        | ~difference    | Solves   | keep                  | MODEL-OPAMP-44                 |
| output clipped at the rails | main's limit   | Solves   | keep                  | MODEL-OPAMP-33, MODEL-OPAMP-34 |

## circuits-1#4

Records: 6 (Solves 6).

| Ask                                           | Page         | Old mark | New mark | Items                                                      |
| --------------------------------------------- | ------------ | -------- | -------- | ---------------------------------------------------------- |
| capacitor voltage at time t while charging    | main         | Solves   | keep     | MODEL-CAPACITOR-18, MODEL-CAPACITOR-22, MODEL-CAPACITOR-28 |
| time to discharge to a level                  | ~discharge   | Solves   | keep     | MODEL-CAPACITOR-23, MODEL-CAPACITOR-25                     |
| inductor current                              | ~rl          | Solves   | no item  |                                                            |
| switching with a nonzero start                | ~general     | Solves   | keep     | MODEL-CAPACITOR-26                                         |
| is the RLC over-, under- or critically damped | ~rlc-damping | Solves   | no item  |                                                            |

## circuits-2#0

Records: 5 (Partly 1, Solves 4).

| Ask                                                 | Page                | Old mark | New mark | Items                                     |
| --------------------------------------------------- | ------------------- | -------- | -------- | ----------------------------------------- |
| reactances at a frequency                           | ~reactance          | Solves   | no item  |                                           |
| impedance and current of a series RLC               | main                | Solves   | keep     | MODEL-RXZ-12, MODEL-AC_S-5, MODEL-AC_S-12 |
| convert a sinusoid to a phasor, polar ↔ rectangular | ~phasor-form        | Solves   | keep     | MODEL-PHASOR-7                            |
| parallel RC impedance                               | ~parallel-rc        | Solves   | keep     | MODEL-RXZ-15                              |
| parallel complex impedances                         | ⏳ E2 (no page yet) | No       | no item  |                                           |

## circuits-2#1

Records: 4 (Solves 4).

| Ask                                             | Page           | Old mark | New mark | Items                                      |
| ----------------------------------------------- | -------------- | -------- | -------- | ------------------------------------------ |
| real, reactive, apparent power and power factor | main           | Solves   | keep     | MODEL-POWERFACTOR-7, MODEL-POWERFACTOR-8   |
| power drawn by a given impedance                | ~load-from-z   | Solves   | no item  |                                            |
| capacitor for power-factor correction           | ~pf-correction | Solves   | keep     | MODEL-POWERFACTOR-17, MODEL-POWERFACTOR-18 |
| rms from peak                                   | ~rms           | Solves   | no item  |                                            |

## circuits-2#2

Records: 5 (Solves 5).

| Ask                                 | Page           | Old mark | New mark | Items                                |
| ----------------------------------- | -------------- | -------- | -------- | ------------------------------------ |
| cutoff of an RC filter              | main           | Solves   | keep     | MODEL-FILTERS-22, MODEL-FILTERS-23   |
| gain in dB and phase at a frequency | main           | Solves   | keep     | MODEL-FILTERS-22, MODEL-FILTERS-23   |
| high-pass response                  | ~high-pass     | Solves   | keep     | MODEL-FILTERS-24                     |
| resonance, Q and bandwidth          | ~band-pass     | Solves   | keep     | MODEL-FILTERS-26, MODEL-RESONANCE-10 |
| dB conversions                      | ~decibels      | Solves   | no item  |                                      |
| sketch a Bode plot                  | main's picture | Solves   | keep     | MODEL-FILTERS-22, MODEL-FILTERS-23   |

## circuits-2#3

Records: 3 (Partly 1, Solves 2).

| Ask                                                    | Page      | Old mark | New mark | Items                                                            |
| ------------------------------------------------------ | --------- | -------- | -------- | ---------------------------------------------------------------- |
| secondary voltage and currents of an ideal transformer | main      | Solves   | keep     | MODEL-TRANSFORMER-10, MODEL-TRANSFORMER-12, MODEL-TRANSFORMER-13 |
| reflected impedance                                    | main      | Solves   | keep     | MODEL-TRANSFORMER-10, MODEL-TRANSFORMER-12, MODEL-TRANSFORMER-13 |
| turns ratio for matching                               | ~matching | Solves   | no item  |                                                                  |
| coupling coefficient, mutual voltage                   | ~coupling | Solves   | no item  |                                                                  |

## circuits-2#4

Records: 4 (No 1, Partly 1, Solves 2).

| Ask                                        | Page           | Old mark | New mark     | Items                                 |
| ------------------------------------------ | -------------- | -------- | ------------ | ------------------------------------- |
| phase and line values of a balanced Y load | main           | Solves   | keep         | MODEL-POLYPHASE-8, MODEL-POLYPHASE-10 |
| delta load                                 | ~delta         | Solves   | keep         | MODEL-POLYPHASE-7                     |
| Y–Δ conversion                             | ~wye-delta     | Solves   | no item      |                                       |
| total power from two wattmeters            | ~two-wattmeter | Solves   | no item      |                                       |
| unbalanced three-phase load: line currents | [new-page]     | —        | No (new ask) | MODEL-POLYPHASE-14                    |

## electronics#0

Records: 3 (Solves 3).

| Ask                                                        | Page       | Old mark | New mark | Items                   |
| ---------------------------------------------------------- | ---------- | -------- | -------- | ----------------------- |
| current through a diode and resistor (constant-drop model) | main       | Solves   | keep     | MODEL-PN-9, MODEL-PN-10 |
| LED series resistor                                        | main       | Solves   | keep     | MODEL-PN-9, MODEL-PN-10 |
| diode equation, 60 mV per decade                           | ~shockley  | Solves   | no item  |                         |
| zener regulator resistor                                   | ~zener     | Solves   | no item  |                         |
| rectifier ripple and DC output                             | ~rectifier | Solves   | keep     | MODEL-RECTIFIER-12      |

## electronics#1

Records: 2 (Solves 2).

| Ask                                    | Page           | Old mark | New mark | Items        |
| -------------------------------------- | -------------- | -------- | -------- | ------------ |
| DC bias point of a voltage-divider BJT | main           | Solves   | keep     | MODEL-BJT-13 |
| I_C, I_E, α from β                     | ~beta          | Solves   | no item  |              |
| MOSFET drain current in saturation     | ~mosfet-sat    | Solves   | keep     | MODEL-FET-14 |
| in triode                              | ~mosfet-triode | Solves   | no item  |              |
| which region                           | ~regions       | Solves   | no item  |              |

## electronics#2

Records: 4 (No 1, Partly 1, Solves 2).

| Ask                                                            | Page       | Old mark | New mark     | Items                                             |
| -------------------------------------------------------------- | ---------- | -------- | ------------ | ------------------------------------------------- |
| g_m, r_π and the voltage gain of a common-emitter stage        | main       | Solves   | keep         | MODEL-BJTAMP-17, MODEL-BJTAMP-18, MODEL-BJTAMP-19 |
| MOSFET common-source gain                                      | ~cs-mosfet | Solves   | no item      |                                                   |
| gain with source resistance                                    | ~loading   | Solves   | no item      |                                                   |
| cascaded stages in dB                                          | ~cascade   | Solves   | no item      |                                                   |
| emitter follower (common collector): gain and quiescent values | [new-page] | —        | No (new ask) | MODEL-BJTAMP-15                                   |

## electronics#3

Records: 0 ().

| Ask                                       | Page            | Old mark | New mark | Items |
| ----------------------------------------- | --------------- | -------- | -------- | ----- |
| closed-loop bandwidth from gain-bandwidth | main            | Solves   | no item  |       |
| full-power bandwidth from slew rate       | main            | Solves   | no item  |       |
| integrator output ramp                    | ~integrator     | Solves   | no item  |       |
| active low-pass gain and cutoff           | ~active-lowpass | Solves   | no item  |       |
| Schmitt-trigger thresholds                | ~schmitt        | Solves   | no item  |       |

## signals-systems#0

Records: 1 (No 1).

| Ask                                                  | Page             | Old mark | New mark | Items |
| ---------------------------------------------------- | ---------------- | -------- | -------- | ----- |
| amplitude, period, frequency and phase of a sinusoid | main             | Solves   | no item  |       |
| time shift and scale of a signal                     | ~shift-scale     | Solves   | no item  |       |
| period of a discrete sinusoid                        | ~discrete-period | Solves   | no item  |       |
| energy or power of a signal                          | ~energy-power    | Solves   | no item  |       |
| is the system linear, time-invariant                 | ~properties      | Solves   | no item  |       |

## signals-systems#1

Records: 2 (Partly 1, Solves 1).

| Ask                               | Page      | Old mark | New mark              | Items          |
| --------------------------------- | --------- | -------- | --------------------- | -------------- |
| y[n] for two short sequences      | main      | Solves   | keep                  | OCW-6.02-PS5-2 |
| length of the result              | main      | Solves   | keep                  | OCW-6.02-PS5-2 |
| convolving two rectangular pulses | ~pulses   | Solves   | keep (items ask more) | OCW-6.003-Q2-3 |
| step into a first-order system    | ~exp-step | Solves   | no item               |                |

## signals-systems#2

Records: 3 (No 2, Partly 1).

| Ask                                                     | Page            | Old mark | New mark              | Items          |
| ------------------------------------------------------- | --------------- | -------- | --------------------- | -------------- |
| harmonics of a square wave and their size               | main            | Solves   | no item               |                |
| share of power in a harmonic                            | main            | Solves   | no item               |                |
| spectrum of a rectangular pulse, first null             | ~pulse-spectrum | Solves   | keep (items ask more) | OCW-6.003-Q3-1 |
| what a delay or time scale does to a spectrum           | ~properties     | Solves   | no item               |                |
| discrete-time frequency response: output for a sinusoid | [new-page]      | —        | No (new ask)          | OCW-6.003-Q3-4 |

## signals-systems#3

Records: 3 (No 1, Partly 2).

| Ask                                                | Page           | Old mark | New mark              | Items          |
| -------------------------------------------------- | -------------- | -------- | --------------------- | -------------- |
| inverse Laplace by partial fractions               | main           | Solves   | keep (items ask more) | OCW-6.003-Q1-3 |
| final and initial value                            | ~final-value   | Solves   | no item               |                |
| step response of a first-order difference equation | ~difference-eq | Solves   | no item               |                |
| stability from pole positions                      | ~poles         | Solves   | keep (items ask more) | OCW-6.003-Q1-2 |

## signals-systems#4

Records: 0 ().

| Ask                        | Page          | Old mark | New mark | Items |
| -------------------------- | ------------- | -------- | -------- | ----- |
| Nyquist rate               | main          | Solves   | no item  |       |
| alias frequency            | main          | Solves   | no item  |       |
| quantization step and SQNR | ~quantization | Solves   | no item  |       |
| data rate of sampled audio | ~data-rate    | Solves   | no item  |       |
| DFT bin spacing            | ~dft-bins     | Solves   | no item  |       |

## control-systems#0

Records: 0 ().

| Ask                                                         | Page         | Old mark | New mark | Items |
| ----------------------------------------------------------- | ------------ | -------- | -------- | ----- |
| transfer function and step response of a first-order system | main         | Solves   | no item  |       |
| mass–spring– damper parameters                              | ~mass-spring | Solves   | no item  |       |
| closed-loop transfer function of a simple loop              | ~feedback    | Solves   | no item  |       |

## control-systems#1

Records: 1 (No 1).

| Ask                                                                        | Page        | Old mark | New mark | Items |
| -------------------------------------------------------------------------- | ----------- | -------- | -------- | ----- |
| poles, overshoot, peak and settling time of a standard second-order system | main        | Solves   | no item  |       |
| ζ and ω_n from specifications                                              | ~from-spec  | Solves   | no item  |       |
| DC gain from poles and zeros                                               | ~dc-gain    | Solves   | no item  |       |
| steady-state error to a step                                               | ~step-error | Solves   | no item  |       |

## control-systems#2

Records: 4 (Partly 2, Solves 2).

| Ask                                          | Page         | Old mark | New mark | Items                                          |
| -------------------------------------------- | ------------ | -------- | -------- | ---------------------------------------------- |
| range of K for stability (Routh)             | main         | Solves   | keep     | WB-CS-routh-stable                             |
| frequency of oscillation at the limit        | main         | Solves   | keep     | WB-CS-routh-stable                             |
| right-half-plane poles from the Routh column | ~routh-count | Solves   | no item  |                                                |
| root-locus asymptotes and breakaway          | ~root-locus  | Solves   | keep     | WB-CS-rl-first, WB-CS-rl-third, WB-CS-rl-zeros |

## control-systems#3

Records: 1 (No 1).

| Ask                                            | Page         | Old mark | New mark     | Items            |
| ---------------------------------------------- | ------------ | -------- | ------------ | ---------------- |
| gain crossover and phase margin                | main         | Solves   | no item      |                  |
| Bode asymptotes and the exact gain             | ~asymptotes  | Solves   | no item      |                  |
| gain margin                                    | ~gain-margin | Solves   | no item      |                  |
| closed-loop bandwidth from ζ and ω_n           | ~bandwidth   | Solves   | no item      |                  |
| lead or lag compensator to meet a phase margin | [new-page]   | —        | No (new ask) | OCW-16.06-PS10-4 |

## control-systems#4

Records: 0 ().

| Ask                                                  | Page             | Old mark | New mark | Items |
| ---------------------------------------------------- | ---------------- | -------- | -------- | ----- |
| offset and speed of P control on a first-order plant | main             | Solves   | no item  |       |
| PI gains for a damping ratio                         | ~pi              | Solves   | no item  |       |
| Ziegler–Nichols tuning                               | ~ziegler-nichols | Solves   | no item  |       |
| what each term does                                  | ~terms           | Solves   | no item  |       |

## electromagnetics#0

Records: 4 (No 2, Partly 1, Solves 1).

| Ask                                                            | Page             | Old mark | New mark              | Items           |
| -------------------------------------------------------------- | ---------------- | -------- | --------------------- | --------------- |
| reflection coefficient, VSWR, return loss for a resistive load | main             | Solves   | keep                  | OCW-6.013-PS7-1 |
| Z₀ and speed from per-length L and C                           | ~line-params     | Solves   | no item               |                 |
| quarter-wave transformer                                       | ~quarter-wave    | Solves   | no item               |                 |
| shorted-stub reactance                                         | ~stub            | Solves   | keep (items ask more) | OCW-6.013-PS7-2 |
| input impedance of a loaded line                               | ~input-impedance | Solves   | no item               |                 |
| echo time and distance to a fault on a cable (TDR)             | [new-page]       | —        | No (new ask)          | MODEL-TLINE-10  |
| resonant frequencies of a shorted or open line section         | [new-page]       | —        | No (new ask)          | OCW-6.013-PS8-1 |

## electromagnetics#1

Records: 0 ().

| Ask                                 | Page          | Old mark | New mark | Items |
| ----------------------------------- | ------------- | -------- | -------- | ----- |
| B near a long wire (Ampère)         | main          | Solves   | no item  |       |
| E of a line charge (Gauss)          | ~gauss-line   | Solves   | no item  |       |
| EMF in a coil (Faraday)             | ~faraday      | Solves   | no item  |       |
| displacement current in a capacitor | ~displacement | Solves   | no item  |       |
| which law describes it              | ~laws         | Solves   | no item  |       |

## electromagnetics#2

Records: 0 ().

| Ask                                                  | Page        | Old mark | New mark | Items |
| ---------------------------------------------------- | ----------- | -------- | -------- | ----- |
| speed, wavelength and wave impedance in a dielectric | main        | Solves   | no item  |       |
| power density from E                                 | main        | Solves   | no item  |       |
| skin depth                                           | ~skin-depth | Solves   | no item  |       |
| reflection at a boundary                             | ~boundary   | Solves   | no item  |       |

## electromagnetics#3

Records: 10 (No 3, Partly 3, Solves 4).

| Ask                                  | Page       | Old mark | New mark     | Items                                                                                                                 |
| ------------------------------------ | ---------- | -------- | ------------ | --------------------------------------------------------------------------------------------------------------------- |
| received power by the Friis equation | main       | Solves   | keep         | MODEL-ANTENNA-11, MODEL-LINKBUDGET-9, MODEL-LINKBUDGET-13, MODEL-LINKBUDGET-14, MODEL-LINKBUDGET-15, OCW-6.013-PS11-1 |
| free-space path loss                 | main       | Solves   | keep         | MODEL-ANTENNA-11, MODEL-LINKBUDGET-9, MODEL-LINKBUDGET-13, MODEL-LINKBUDGET-14, MODEL-LINKBUDGET-15, OCW-6.013-PS11-1 |
| half-wave dipole length              | ~dipole    | Solves   | keep         | MODEL-ANTENNA-10                                                                                                      |
| dish gain, beamwidth and far field   | ~dish      | Solves   | no item      |                                                                                                                       |
| two-element array pattern            | [new-page] | —        | No (new ask) | OCW-6.013-PS10-2                                                                                                      |
| Fresnel-zone clearance               | [new-page] | —        | No (new ask) | MODEL-LINKBUDGET-10                                                                                                   |

## power-systems#0

Records: 1 (Solves 1).

| Ask                                    | Page          | Old mark | New mark | Items          |
| -------------------------------------- | ------------- | -------- | -------- | -------------- |
| real power over a lossless line from δ | main          | Solves   | keep     | OCW-6.061-Q1-2 |
| per-unit impedance                     | ~per-unit     | Solves   | no item  |                |
| change of base                         | ~change-base  | Solves   | no item  |                |
| approximate voltage drop               | ~voltage-drop | Solves   | no item  |                |
| line losses                            | ~line-losses  | Solves   | no item  |                |
| a Gauss–Seidel iteration               | ~load-flow    | Solves   | no item  |                |

## power-systems#1

Records: 4 (No 2, Partly 1, Solves 1).

| Ask                                                                       | Page                    | Old mark | New mark              | Items          |
| ------------------------------------------------------------------------- | ----------------------- | -------- | --------------------- | -------------- |
| synchronous speed, slip, rotor frequency and torque of an induction motor | main                    | Solves   | keep (items ask more) | OCW-6.061-Q2-3 |
| transformer efficiency at part load                                       | ~transformer-efficiency | Solves   | no item               |                |
| DC motor speed from voltage and current                                   | ~dc-motor               | Solves   | keep                  | OCW-6.061-Q2-1 |
| synchronous generator internal EMF                                        | ~sync-generator         | Solves   | no item               |                |
| magnetic circuit: flux and pull of an electromagnet                       | [new-page]              | —        | No (new ask)          | OCW-6.061-Q2-2 |

## power-systems#2

Records: 0 ().

| Ask                                            | Page            | Old mark | New mark | Items |
| ---------------------------------------------- | --------------- | -------- | -------- | ----- |
| three-phase fault current in pu, kA and MVA    | main            | Solves   | no item  |       |
| single-line-to-ground fault                    | ~slg            | Solves   | no item  |       |
| Thévenin reactance from a short-circuit rating | ~source-mva     | Solves   | no item  |       |
| symmetrical components                         | ~sym-components | Solves   | no item  |       |

## power-systems#3

Records: 0 ().

| Ask                                                          | Page   | Old mark | New mark | Items |
| ------------------------------------------------------------ | ------ | -------- | -------- | ----- |
| critical clearing angle and time by the equal-area criterion | main   | Solves   | no item  |       |
| frequency drop under droop                                   | ~droop | Solves   | no item  |       |
| initial rate of change of frequency                          | ~rocof | Solves   | no item  |       |
| swing frequency                                              | ~swing | Solves   | no item  |       |

## communication-systems#0

Records: 1 (Solves 1).

| Ask                                                | Page       | Old mark | New mark | Items              |
| -------------------------------------------------- | ---------- | -------- | -------- | ------------------ |
| AM power, sideband power, efficiency and bandwidth | main       | Solves   | no item  |                    |
| FM bandwidth (Carson)                              | ~fm        | Solves   | no item  |                    |
| modulation index from an envelope                  | ~mod-index | Solves   | no item  |                    |
| superheterodyne LO and image                       | ~superhet  | Solves   | keep     | MODEL-MODULATION-9 |

## communication-systems#1

Records: 3 (No 3).

| Ask                                                          | Page       | Old mark | New mark     | Items                          |
| ------------------------------------------------------------ | ---------- | -------- | ------------ | ------------------------------ |
| bit rate, bandwidth and spectral efficiency of M-ary schemes | main       | Solves   | no item      |                                |
| BPSK bit error rate                                          | ~bpsk-ber  | Solves   | no item      |                                |
| E_b/N₀ from SNR                                              | ~eb-n0     | Solves   | no item      |                                |
| read an eye diagram                                          | [new-page] | —        | No (new ask) | OCW-6.02-PS5-1                 |
| TDMA or slotted-Aloha throughput                             | [new-page] | —        | No (new ask) | OCW-6.02-PS7-1, OCW-6.02-PS7-3 |

## communication-systems#2

Records: 1 (No 1).

| Ask                                   | Page         | Old mark | New mark | Items |
| ------------------------------------- | ------------ | -------- | -------- | ----- |
| thermal noise power                   | main         | Solves   | no item  |       |
| SNR at a receiver with a noise figure | main         | Solves   | no item  |       |
| cascaded noise figure (Friis)         | ~friis-noise | Solves   | no item  |       |
| noise temperature                     | ~noise-temp  | Solves   | no item  |       |

## communication-systems#3

Records: 6 (Partly 3, Solves 3).

| Ask                               | Page         | Old mark | New mark              | Items                                         |
| --------------------------------- | ------------ | -------- | --------------------- | --------------------------------------------- |
| entropy of a source               | main         | Solves   | keep                  | OCW-6.02-PS1-1, OCW-6.02-PS1-2, OCW-6.02-Q1-1 |
| Shannon capacity                  | ~capacity    | Solves   | no item               |                                               |
| average Huffman code length       | ~code-length | Solves   | keep                  | OCW-6.02-PS1-3                                |
| binary symmetric channel capacity | ~bsc         | Solves   | keep (items ask more) | OCW-6.02-PS2-2                                |
| block-code rate and correction    | ~block-code  | Solves   | keep                  | OCW-6.02-PS2-1                                |

## digital-logic#0

Records: 7 (No 3, Solves 4).

| Ask                                   | Page        | Old mark | New mark     | Items                                           |
| ------------------------------------- | ----------- | -------- | ------------ | ----------------------------------------------- |
| decimal ↔ binary ↔ hex                | main        | Solves   | keep         | MODEL-NUMBER-7, MODEL-NUMBER-8, MODEL-NUMBER-11 |
| two's complement of a negative number | main        | Solves   | keep         | MODEL-NUMBER-7, MODEL-NUMBER-8, MODEL-NUMBER-11 |
| signed and unsigned range, overflow   | ~twos-range | Solves   | keep         | MODEL-NUMBER-10                                 |
| BCD                                   | ~bcd        | Solves   | no item      |                                                 |
| which law simplifies it               | ~laws       | Solves   | no item      |                                                 |
| fixed-point (scaled integer) codes    | [new-page]  | —        | No (new ask) | MODEL-NUMBER-15                                 |

## digital-logic#1

Records: 6 (No 2, Partly 2, Solves 2).

| Ask                                                     | Page          | Old mark | New mark              | Items                                  |
| ------------------------------------------------------- | ------------- | -------- | --------------------- | -------------------------------------- |
| minimal sum of products from a K-map (with don't-cares) | main          | Solves   | keep                  | MODEL-COMBLOGIC-19, MODEL-COMBLOGIC-20 |
| which gate a truth table is                             | ~gates        | Solves   | keep (items ask more) | MODEL-COMBLOGIC-13, MODEL-COMBLOGIC-15 |
| select lines and decoder outputs                        | ~mux-decoder  | Solves   | no item               |                                        |
| ripple-carry delay                                      | ~ripple-adder | Solves   | no item               |                                        |
| gate circuit drawn from a Boolean expression            | [new-page]    | —        | No (new ask)          | MODEL-COMBLOGIC-16                     |

## digital-logic#2

Records: 5 (No 2, Partly 2, Solves 1).

| Ask                                                            | Page       | Old mark | New mark              | Items                                   |
| -------------------------------------------------------------- | ---------- | -------- | --------------------- | --------------------------------------- |
| maximum clock frequency from setup, clock-to-Q and logic delay | main       | Solves   | keep (items ask more) | OCW-6.004-Q2-1                          |
| hold check                                                     | main       | Solves   | keep (items ask more) | OCW-6.004-Q2-1                          |
| counter modulus and output frequency                           | ~counter   | Solves   | keep                  | MODEL-COUNTER-12, MODEL-COUNTER-13      |
| JK next state                                                  | ~jk        | Solves   | no item               |                                         |
| shift right                                                    | ~shift     | Solves   | no item               |                                         |
| latch and flip-flop timing diagrams                            | [new-page] | —        | No (new ask)          | MODEL-LATCHLOGIC-9, MODEL-LATCHLOGIC-12 |

## digital-logic#3

Records: 1 (Partly 1).

| Ask                                      | Page          | Old mark | New mark              | Items          |
| ---------------------------------------- | ------------- | -------- | --------------------- | -------------- |
| trace a state diagram on an input string | main          | Solves   | no item               |                |
| flip-flops for S states                  | ~encoding     | Solves   | keep (items ask more) | OCW-6.004-Q2-3 |
| design procedure in order                | ~design-steps | Solves   | no item               |                |
| Moore or Mealy                           | ~moore-mealy  | Solves   | no item               |                |

## discrete-math#0

Records: 11 (No 2, Partly 2, Solves 7).

| Ask                                                                                  | Page         | Old mark | New mark     | Items                                                                                                                        |
| ------------------------------------------------------------------------------------ | ------------ | -------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| which statements are equivalent to a conditional (contrapositive, converse, inverse) | main         | Solves   | keep         | LEVIN3-logic-proofs-1                                                                                                        |
| is an argument valid                                                                 | ~arguments   | Solves   | no item      |                                                                                                                              |
| build a truth table                                                                  | ~truth-table | Solves   | keep         | LEVIN3-intro-statements-3, LEVIN3-intro-statements-4, LEVIN3-propositional-1, LEVIN3-propositional-2, LEVIN3-propositional-4 |
| structure of an induction proof                                                      | ~induction   | Solves   | keep         | LEVIN3-seq-induction-2, LEVIN3-seq-induction-3, LEVIN3-seq-induction-4                                                       |
| choose a proof method and its first and last lines                                   | [new-page]   | —        | No (new ask) | LEVIN3-logic-proofs-2                                                                                                        |

## discrete-math#1

Records: 7 (No 1, Partly 2, Solves 4).

| Ask                                      | Page             | Old mark | New mark | Items                                                                        |
| ---------------------------------------- | ---------------- | -------- | -------- | ---------------------------------------------------------------------------- |
| size of a union of three sets            | main             | Solves   | no item  |                                                                              |
| power set and Cartesian product sizes    | ~set-sizes       | Solves   | keep     | LEVIN3-intro-sets-1, LEVIN3-intro-sets-3, LEVIN3-counting-binom-1            |
| number of functions, one-to-one and onto | ~count-functions | Solves   | no item  |                                                                              |
| injective, surjective, bijective         | ~function-types  | Solves   | keep     | LEVIN3-intro-functions-1, LEVIN3-intro-functions-2, LEVIN3-intro-functions-3 |

## discrete-math#2

Records: 15 (No 3, Partly 3, Solves 9).

| Ask                                                     | Page          | Old mark | New mark     | Items                                                                                                                                                            |
| ------------------------------------------------------- | ------------- | -------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| arrangements and selections with and without repetition | main          | Solves   | keep         | LEVIN3-counting-addmult-1, LEVIN3-counting-addmult-2, LEVIN3-counting-binom-2, LEVIN3-counting-binom-4, LEVIN3-counting-combperm-1, LEVIN3-counting-combperm-2 … |
| identical items into boxes                              | ~stars-bars   | Solves   | keep         | LEVIN3-stars-and-bars-1, LEVIN3-stars-and-bars-3, LEVIN3-stars-and-bars-4, LEVIN3-advPIE-1                                                                       |
| pigeonhole                                              | ~pigeonhole   | Solves   | keep         | LEVIN3-logic-proofs-4                                                                                                                                            |
| derangements                                            | ~derangements | Solves   | no item      |                                                                                                                                                                  |
| words with repeated letters                             | ~multinomial  | Solves   | no item      |                                                                                                                                                                  |
| stars and bars with upper bounds (inclusion–exclusion)  | [new-page]    | —        | No (new ask) | LEVIN3-advPIE-3, LEVIN3-advPIE-4                                                                                                                                 |

## discrete-math#3

Records: 12 (No 1, Partly 3, Solves 8).

| Ask                                                  | Page       | Old mark | New mark     | Items                                                                |
| ---------------------------------------------------- | ---------- | -------- | ------------ | -------------------------------------------------------------------- |
| edges from degrees (handshake), planar faces (Euler) | main       | Solves   | keep         | LEVIN3-gt-intro-2, LEVIN3-planar-1, LEVIN3-planar-2, LEVIN3-planar-4 |
| Euler path or circuit                                | ~euler     | Solves   | keep         | LEVIN3-paths-1, LEVIN3-paths-2, LEVIN3-paths-4                       |
| trees and m-ary trees                                | ~trees     | Solves   | keep         | LEVIN3-trees-1, LEVIN3-trees-2, LEVIN3-trees-4                       |
| edges of Kₙ and K_{m,n}                              | ~complete  | Solves   | keep         | LEVIN3-gt-intro-1                                                    |
| are two graphs isomorphic                            | [new-page] | —        | No (new ask) | LEVIN3-gt-intro-4                                                    |

## discrete-math#4

Records: 3 (No 1, Partly 2).

| Ask                                             | Page           | Old mark | New mark              | Items               |
| ----------------------------------------------- | -------------- | -------- | --------------------- | ------------------- |
| closed form of a second-order linear recurrence | main           | Solves   | keep (items ask more) | LEVIN3-recurrence-4 |
| first-order with a constant (Tower of Hanoi)    | ~first-order   | Solves   | keep (items ask more) | LEVIN3-recurrence-3 |
| repeated root                                   | ~repeated-root | Solves   | no item               |                     |

## data-structures#0

Records: 6 (No 3, Partly 3).

| Ask                                                    | Page            | Old mark | New mark              | Items                |
| ------------------------------------------------------ | --------------- | -------- | --------------------- | -------------------- |
| what a stack or queue holds after a list of operations | main            | Solves   | keep (items ask more) | ODS-EX1.3, ODS-EX1.4 |
| circular-buffer indices                                | ~circular-queue | Solves   | no item               |                      |
| address of an array element                            | ~array-address  | Solves   | keep (items ask more) | ODS-EX2.4            |
| evaluate postfix                                       | ~postfix        | Solves   | no item               |                      |
| cost of a growing array                                | ~dynamic-array  | Solves   | no item               |                      |
| linked-list pointer operations (reverse, second-last)  | [new-page]      | —        | No (new ask)          | ODS-EX3.4            |

## data-structures#1

Records: 12 (No 5, Partly 5, Solves 2).

| Ask                                          | Page        | Old mark | New mark              | Items                              |
| -------------------------------------------- | ----------- | -------- | --------------------- | ---------------------------------- |
| least height and most nodes of a binary tree | main        | Solves   | keep (items ask more) | ODS-EX6.1, ODS-EX6.2               |
| heap array indices                           | ~heap-index | Solves   | keep                  | ODS-EX10.1, ODS-EX10.2, ODS-EX10.4 |
| traversal order                              | ~traversal  | Solves   | keep (items ask more) | ODS-EX6.7                          |
| adjacency matrix or list size                | ~adjacency  | Solves   | keep                  | ODS-EX12.1                         |
| BFS and DFS visit order                      | [new-page]  | —        | No (new ask)          | ODS-EX12.3                         |
| heap after inserts and removals              | [new-page]  | —        | No (new ask)          | ODS-EX10.1, ODS-EX10.2             |

## data-structures#2

Records: 4 (No 1, Partly 3).

| Ask                                               | Page          | Old mark | New mark              | Items      |
| ------------------------------------------------- | ------------- | -------- | --------------------- | ---------- |
| worst-case comparisons of binary vs linear search | main          | Solves   | no item               |            |
| comparisons of quadratic sorts vs merge sort      | ~sort-counts  | Solves   | keep (items ask more) | ODS-EX11.3 |
| merge-sort passes                                 | ~merge-passes | Solves   | keep (items ask more) | ODS-EX11.1 |
| hash table probes                                 | ~hashing      | Solves   | keep (items ask more) | ODS-EX5.1  |

## data-structures#3

Records: 5 (No 3, Partly 1, Solves 1).

| Ask                           | Page          | Old mark | New mark              | Items           |
| ----------------------------- | ------------- | -------- | --------------------- | --------------- |
| how running time grows with n | main          | Solves   | no item               |                 |
| master theorem                | ~master       | Solves   | keep (items ask more) | OCW-6.006-Q1-1b |
| count of a nested loop        | ~loop-count   | Solves   | no item               |                 |
| order functions by growth     | ~growth-order | Solves   | keep                  | OCW-6.006-Q1-1a |

## computer-architecture#0

Records: 2 (No 1, Partly 1).

| Ask                                                       | Page           | Old mark | New mark              | Items          |
| --------------------------------------------------------- | -------------- | -------- | --------------------- | -------------- |
| field widths and immediate range of an instruction format | main           | Solves   | no item               |                |
| branch target address                                     | ~branch-target | Solves   | no item               |                |
| addressing mode of an instruction                         | ~addressing    | Solves   | keep (items ask more) | OCW-6.004-Q3-1 |
| stack frames when a procedure calls itself                | [new-page]     | —        | No (new ask)          | OCW-6.004-Q3-2 |

## computer-architecture#1

Records: 0 ().

| Ask                                            | Page           | Old mark | New mark | Items |
| ---------------------------------------------- | -------------- | -------- | -------- | ----- |
| CPU time from instruction count, CPI and clock | main           | Solves   | no item  |       |
| MIPS rating                                    | main           | Solves   | no item  |       |
| weighted CPI from a mix                        | ~weighted-cpi  | Solves   | no item  |       |
| Amdahl's law                                   | ~amdahl        | Solves   | no item  |       |
| single-cycle clock from unit delays            | ~critical-path | Solves   | no item  |       |

## computer-architecture#2

Records: 1 (Partly 1).

| Ask                                    | Page        | Old mark | New mark              | Items          |
| -------------------------------------- | ----------- | -------- | --------------------- | -------------- |
| time and speedup of a k-stage pipeline | main        | Solves   | no item               |                |
| CPI with stalls                        | ~hazard-cpi | Solves   | keep (items ask more) | OCW-6.004-Q5-3 |
| which hazard                           | ~hazards    | Solves   | no item               |                |

## computer-architecture#3

Records: 0 ().

| Ask                                            | Page        | Old mark | New mark | Items |
| ---------------------------------------------- | ----------- | -------- | -------- | ----- |
| tag, index and offset bits                     | main        | Solves   | no item  |       |
| average memory access time, one and two levels | ~amat       | Solves   | no item  |       |
| page-table size                                | ~page-table | Solves   | no item  |       |

## embedded-systems#0

Records: 2 (Solves 2).

| Ask                                       | Page      | Old mark | New mark | Items                  |
| ----------------------------------------- | --------- | -------- | -------- | ---------------------- |
| ADC code for a voltage and its resolution | main      | Solves   | keep     | MODEL-ANALOGDIGITAL-12 |
| DAC output                                | ~dac      | Solves   | keep     | MODEL-ANALOGDIGITAL-11 |
| LED resistor on a pin                     | ~led-pin  | Solves   | no item  |                        |
| divider for a 5 V → 3.3 V input           | ~divider  | Solves   | no item  |                        |
| set or clear a register bit               | ~bit-mask | Solves   | no item  |                        |

## embedded-systems#1

Records: 0 ().

| Ask                                      | Page       | Old mark | New mark | Items |
| ---------------------------------------- | ---------- | -------- | -------- | ----- |
| prescaler and compare value for a period | main       | Solves   | no item  |       |
| PWM frequency and duty cycle             | ~pwm       | Solves   | no item  |       |
| longest period before overflow           | ~overflow  | Solves   | no item  |       |
| CPU time spent in an ISR                 | ~cpu-load  | Solves   | no item  |       |
| what happens on an interrupt, in order   | ~isr-steps | Solves   | no item  |       |

## embedded-systems#2

Records: 1 (No 1).

| Ask                                | Page        | Old mark | New mark     | Items               |
| ---------------------------------- | ----------- | -------- | ------------ | ------------------- |
| UART byte rate and frame time      | main        | Solves   | no item      |                     |
| baud-rate register and error       | ~baud-error | Solves   | no item      |                     |
| SPI throughput                     | ~spi        | Solves   | no item      |                     |
| I²C transaction time               | ~i2c        | Solves   | no item      |                     |
| which protocol                     | ~protocols  | Solves   | no item      |                     |
| line coding (Manchester) of a byte | [new-page]  | —        | No (new ask) | MODEL-SERIALCOMM-16 |

## embedded-systems#3

Records: 0 ().

| Ask                                                                | Page           | Old mark | New mark | Items |
| ------------------------------------------------------------------ | -------------- | -------- | -------- | ----- |
| is a task set schedulable under rate-monotonic (utilization bound) | main           | Solves   | no item  |       |
| worst-case response time                                           | ~response-time | Solves   | no item  |       |
| EDF schedulability                                                 | ~edf           | Solves   | no item  |       |

## operating-systems#0

Records: 1 (No 1).

| Ask                                      | Page              | Old mark | New mark     | Items          |
| ---------------------------------------- | ----------------- | -------- | ------------ | -------------- |
| which state a process enters on an event | main              | Solves   | no item      |                |
| context-switch overhead                  | ~switch-cost      | Solves   | no item      |                |
| processes after n forks                  | ~fork             | Solves   | no item      |                |
| CPU use with I/O waiting                 | ~multiprogramming | Solves   | no item      |                |
| semaphores for a critical section        | [new-page]        | —        | No (new ask) | OCW-6.004-Q5-2 |

## operating-systems#1

Records: 0 ().

| Ask                                                    | Page         | Old mark | New mark | Items |
| ------------------------------------------------------ | ------------ | -------- | -------- | ----- |
| average waiting and turnaround time under FCFS and SJF | main         | Solves   | no item  |       |
| under round robin                                      | ~round-robin | Solves   | no item  |       |

## operating-systems#2

Records: 0 ().

| Ask                                      | Page         | Old mark | New mark | Items |
| ---------------------------------------- | ------------ | -------- | -------- | ----- |
| page number, offset and physical address | main         | Solves   | no item  |       |
| effective access time with a TLB         | ~tlb         | Solves   | no item  |       |
| with page faults                         | ~page-faults | Solves   | no item  |       |
| faults under FIFO and LRU                | ~replacement | Solves   | no item  |       |

## operating-systems#3

Records: 0 ().

| Ask                                            | Page         | Old mark | New mark | Items |
| ---------------------------------------------- | ------------ | -------- | -------- | ----- |
| largest file with direct and indirect pointers | main         | Solves   | no item  |       |
| disk access time                               | ~disk-access | Solves   | no item  |       |
| blocks and wasted space                        | ~blocks      | Solves   | no item  |       |
| allocation method                              | ~allocation  | Solves   | no item  |       |

## networks#0

Records: 0 ().

| Ask                                 | Page           | Old mark | New mark | Items |
| ----------------------------------- | -------------- | -------- | -------- | ----- |
| header overhead and efficiency      | main           | Solves   | no item  |       |
| which layer a protocol or device is | ~layers        | Solves   | no item  |       |
| encapsulation order                 | ~encapsulation | Solves   | no item  |       |

## networks#1

Records: 1 (Partly 1).

| Ask                                                      | Page          | Old mark | New mark              | Items         |
| -------------------------------------------------------- | ------------- | -------- | --------------------- | ------------- |
| network, broadcast and hosts of an address with a prefix | main          | Solves   | keep (items ask more) | MODEL-TCPIP-6 |
| subnets from a block                                     | ~subnet-split | Solves   | no item               |               |
| TCP throughput limited by window                         | ~window       | Solves   | no item               |               |
| sequence and ACK numbers                                 | ~seq-ack      | Solves   | no item               |               |
| the handshake in order                                   | ~handshake    | Solves   | no item               |               |

## networks#2

Records: 0 ().

| Ask                                 | Page          | Old mark | New mark | Items |
| ----------------------------------- | ------------- | -------- | -------- | ----- |
| distance-vector update              | main          | Solves   | no item  |       |
| Dijkstra's order of finalised nodes | ~dijkstra     | Solves   | no item  |       |
| longest-prefix match                | ~prefix-match | Solves   | no item  |       |

## networks#3

Records: 0 ().

| Ask                                | Page           | Old mark | New mark | Items |
| ---------------------------------- | -------------- | -------- | -------- | ----- |
| transmission and propagation delay | main           | Solves   | no item  |       |
| bandwidth-delay product            | ~bdp           | Solves   | no item  |       |
| stop-and-wait utilisation          | ~stop-and-wait | Solves   | no item  |       |
| queueing delay                     | ~queue         | Solves   | no item  |       |
| file time over a bottleneck        | ~bottleneck    | Solves   | no item  |       |

## Not in the taxonomy (from the items)

- **Communication Systems: multiple access** (TDMA, Aloha): `OCW-6.02-PS7-1`, `OCW-6.02-PS7-3`.
- **Power Systems: magnetic circuits and electromechanical force** (lift magnets, reluctance): `OCW-6.061-Q2-2`; 6.061 lectures 14–.
- **Data Structures: dynamic programming and shortest-path algorithms** are taught with the course (6.006 lectures 15–20); shortest paths sit in networks#2 only.
- **Digital Logic / Computer Architecture: information and reliability measures** (bits, Huffman codes, MTBF) open 6.004: `OCW-6.004-Q1-1`, `OCW-6.004-Q1-2`, `OCW-6.004-Q2-2`.
- **Discrete Math: number theory and generating functions** (Levin chapter 5) have no topic.
- **Circuits: troubleshooting (diagnostic reasoning)** fills a third of every ModEL module and has no topic.

## Totals

keep 98, new 24, no 178.
