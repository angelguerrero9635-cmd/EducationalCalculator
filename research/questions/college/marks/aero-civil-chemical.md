# Re-marked plan: aero, civil and chemical (`docs/plans/he.aero-civil-chemical.md`)

Research group R4, 2026-10-02. Each plan row ("Question type | Page | Mark") was matched to the question records in `../aerospace.jsonl`, `../civil.jsonl` and `../chemical.jsonl` by the page each record names. "keep" means the items confirm the row; "keep (items ask more)" means every matched item goes past the page (the record says how, mark Partly); rows with no item are listed as "no item". New rows come from item types no row covers; they are added to the plan as `[new-page]` rows marked No. Reference only.

## aerodynamics#0

Records: 14 (No 8, Partly 6).

| Row                                              | Page                  | Old mark | New mark              | Items                                            |
| ------------------------------------------------ | --------------------- | -------- | --------------------- | ------------------------------------------------ |
| lift coefficient of a thin airfoil at α          | main                  | Solves   | keep (items ask more) | OCW-16.100-HW2-P3, OCW-16.01-F2                  |
| zero-lift angle from c_l at one α                | main                  | Solves   | keep (items ask more) | OCW-16.100-HW2-P3, OCW-16.01-F2                  |
| pressure coefficient from local speed            | ~pressure-coefficient | Solves   | keep (items ask more) | NASA-BGA-PITOT                                   |
| lift per span from circulation (Kutta–Joukowski) | ~circulation          | Solves   | keep (items ask more) | OCW-16.100-HW3-P2, OCW-16.01-F1, OCW-16.01-Q2F-1 |
| what NACA 2412 means; thickness in meters        | ~naca                 | Solves   | no item               |                                                  |

## aerodynamics#1

Records: 14 (No 6, Partly 6, Solves 2).

| Row                                                                      | Page        | Old mark | New mark              | Items                                                                      |
| ------------------------------------------------------------------------ | ----------- | -------- | --------------------- | -------------------------------------------------------------------------- |
| lift and drag from C_L, C_D, speed, area                                 | main        | Solves   | keep                  | NASA-BGA-LIFT-VELOCITY, NASA-BGP-DRAG, NASA-BGA-DENSITY-LIFT               |
| drag polar, maximum L/D                                                  | ~drag-polar | Solves   | no item               |                                                                            |
| Reynolds number of a wing chord                                          | ~reynolds   | Solves   | keep (items ask more) | OCW-16.100-HW7-P1, OCW-16.100-HW8-P3, OCW-16.100-HW9-P1, OCW-16.100-TH2-P3 |
| which drag is skin friction, form, induced or wave                       | ~drag-types | Solves   | keep (items ask more) | OCW-16.100-HW9-P2                                                          |
| skin-friction drag of a plate or wing from Re (laminar or turbulent c_f) | [new-page]  | —        | No (new row)          | OCW-16.100-HW8-P3, OCW-16.100-HW9-P1, OCW-16.100-TH2-P3                    |

## aerodynamics#2

Records: 8 (No 4, Partly 4).

| Row                                             | Page          | Old mark | New mark              | Items                                |
| ----------------------------------------------- | ------------- | -------- | --------------------- | ------------------------------------ |
| induced drag coefficient and induced angle      | main          | Solves   | keep (items ask more) | OCW-16.100-HW5-P1                    |
| finite-wing lift slope from a₀ and AR           | ~lift-slope   | Solves   | keep (items ask more) | OCW-16.01-F5                         |
| aspect ratio, taper, mean chord from a planform | ~aspect-ratio | Solves   | keep (items ask more) | OCW-16.01-F8, NASA-BGA-ELLIPTIC-WING |

## aerodynamics#3

Records: 4 (No 2, Partly 1, Solves 1).

| Row                                           | Page             | Old mark | New mark | Items                        |
| --------------------------------------------- | ---------------- | -------- | -------- | ---------------------------- |
| Mach number at an altitude's temperature      | main             | Solves   | keep     | OCW-16.01-F14, NASA-BGA-MACH |
| Prandtl–Glauert correction of C_p             | ~prandtl-glauert | Solves   | no item  |                              |
| subsonic, transonic, supersonic or hypersonic | ~flow-regimes    | Solves   | no item  |                              |

## compressible-flow#0

Records: 3 (No 1, Solves 2).

| Row                                             | Page       | Old mark       | New mark | Items         |
| ----------------------------------------------- | ---------- | -------------- | -------- | ------------- |
| T₀/T, p₀/p, ρ₀/ρ at a Mach number               | main       | Solves         | keep     | OCW-16.01-F13 |
| A/A* at M; M from A/A* (subsonic or supersonic) | ~area-mach | Solves (⏳ N3) | no item  |               |
| choked mass flow through a throat               | ~choked    | Solves         | keep     | OCW-16.01-F19 |
| stagnation temperature on a probe tip           | main       | Solves         | keep     | OCW-16.01-F13 |

## compressible-flow#1

Records: 4 (No 2, Partly 2).

| Row                                             | Page     | Old mark       | New mark              | Items                        |
| ----------------------------------------------- | -------- | -------------- | --------------------- | ---------------------------- |
| M₂, p₂/p₁, T₂/T₁, p₀₂/p₀₁ across a normal shock | main     | Solves         | keep (items ask more) | OCW-16.01-F15, OCW-16.50-HW8 |
| oblique shock: θ from β and M₁; M₂              | ~oblique | Solves         | no item               |                              |
| β from θ and M₁ (weak or strong)                | ~oblique | Partly (⏳ N3) | no item               |                              |
| pitot tube in supersonic flow                   | ~pitot   | Solves (⏳ N2) | no item               |                              |

## compressible-flow#2

Records: 3 (No 2, Partly 1).

| Row                                                | Page           | Old mark       | New mark              | Items         |
| -------------------------------------------------- | -------------- | -------------- | --------------------- | ------------- |
| design exit Mach, pressure, temperature from Ae/At | main           | Solves (⏳ N3) | no item               |               |
| mass flow of a choked nozzle                       | main           | Solves         | no item               |               |
| what happens as back pressure is lowered           | ~back-pressure | Solves         | keep (items ask more) | OCW-16.01-F20 |
| over- or underexpanded at a given back pressure    | ~expansion     | Solves         | no item               |               |

## compressible-flow#3

Records: 6 (No 4, Partly 1, Solves 1).

| Row                                                                 | Page           | Old mark       | New mark              | Items                            |
| ------------------------------------------------------------------- | -------------- | -------------- | --------------------- | -------------------------------- |
| lift and wave drag of a thin airfoil (Ackeret)                      | main           | Solves         | keep                  | OCW-16.100-TH2-P1                |
| Mach angle                                                          | ~mach-angle    | Solves         | no item               |                                  |
| Prandtl–Meyer expansion round a corner                              | ~expansion-fan | Solves (⏳ N2) | keep (items ask more) | OCW-16.01-F17                    |
| lift and drag of a diamond or flat-plate airfoil by shock-expansion | [new-page]     | —              | No (new row)          | OCW-16.01-F17, OCW-16.100-TH2-P1 |

## flight-mechanics#0

Records: 4 (No 2, Partly 2).

| Row                                                    | Page        | Old mark | New mark              | Items                          |
| ------------------------------------------------------ | ----------- | -------- | --------------------- | ------------------------------ |
| C_L, drag and thrust required in level flight          | main        | Solves   | no item               |                                |
| stall speed                                            | ~stall      | Solves   | no item               |                                |
| jet range (Breguet)                                    | ~range      | Solves   | keep (items ask more) | NASA-BGA-RANGE                 |
| rate of climb from excess thrust                       | ~climb      | Solves   | keep (items ask more) | NASA-BGP-CLIMB                 |
| load factor and radius of a level turn                 | ~turn       | Solves   | no item               |                                |
| density at an altitude (standard atmosphere)           | ~atmosphere | Solves   | no item               |                                |
| glide range and minimum-sink speed; best-endurance C_L | [new-page]  | —        | No (new row)          | OCW-16.333-HW1-1, OCW-16.01-F7 |

## flight-mechanics#1

Records: 3 (Partly 3).

| Row                                     | Page    | Old mark | New mark              | Items                           |
| --------------------------------------- | ------- | -------- | --------------------- | ------------------------------- |
| neutral point and static margin         | main    | Solves   | keep (items ask more) | OCW-16.333-HW1-3                |
| trim angle of attack from C_m0 and C_mα | ~trim   | Solves   | keep (items ask more) | OCW-16.333-HW3-5, NASA-BGA-TRIM |
| stable or not from a C_m–α line         | ~stable | Solves   | no item               |                                 |

## flight-mechanics#2

Records: 6 (No 2, Partly 4).

| Row                                                    | Page        | Old mark | New mark              | Items                              |
| ------------------------------------------------------ | ----------- | -------- | --------------------- | ---------------------------------- |
| phugoid period and damping (Lanchester)                | main        | Solves   | keep (items ask more) | OCW-16.333-HW2-3                   |
| ω_n, ζ, period, time to half amplitude from λ = n ± iω | ~eigenvalue | Solves   | keep (items ask more) | OCW-16.333-HW1-2                   |
| which mode: short period, phugoid, Dutch roll, spiral  | ~modes      | Solves   | keep (items ask more) | OCW-16.333-HW1-4, OCW-16.333-HW3-2 |

## flight-mechanics#3

Records: 7 (No 6, Solves 1).

| Row                                       | Page              | Old mark | New mark | Items            |
| ----------------------------------------- | ----------------- | -------- | -------- | ---------------- |
| elevator angle to trim at α               | main              | Solves   | keep     | OCW-16.333-HW2-4 |
| which surface controls pitch, roll or yaw | ~surfaces         | Solves   | no item  |                  |
| bank angle for a coordinated turn rate    | ~coordinated-turn | Solves   | no item  |                  |

## aerospace-structures#0

Records: 16 (No 13, Partly 2, Solves 1).

| Row                                                   | Page       | Old mark | New mark              | Items                            |
| ----------------------------------------------------- | ---------- | -------- | --------------------- | -------------------------------- |
| shear flow and stress in a closed box under torque    | main       | Solves   | keep                  | OCW-16.20-HA7-1, OCW-16.20-HA9   |
| twist rate of a closed cell                           | main       | Solves   | keep                  | OCW-16.20-HA7-1, OCW-16.20-HA9   |
| hoop and axial stress in a pressurized fuselage       | ~cabin     | Solves   | keep (items ask more) | OCW-16.20-HA4-5                  |
| torsion of an open thin-walled section (J = Σbt³ ÷ 3) | [new-page] | —        | No (new row)          | OCW-16.20-HA6-5                  |
| thermal stress in a constrained bar                   | [new-page] | —        | No (new row)          | OCW-16.20-HA5-1, OCW-16.20-HA5-4 |

## aerospace-structures#1

Records: 6 (No 5, Partly 1).

| Row                                                     | Page        | Old mark | New mark              | Items                            |
| ------------------------------------------------------- | ----------- | -------- | --------------------- | -------------------------------- |
| longitudinal modulus by the rule of mixtures            | main        | Solves   | no item               |                                  |
| transverse modulus                                      | ~transverse | Solves   | no item               |                                  |
| density and specific stiffness                          | ~specific   | Solves   | keep (items ask more) | OCW-16.001-PS8-1                 |
| ply strains from the engineering constants (compliance) | [new-page]  | —        | No (new row)          | OCW-16.20-HA2-3, OCW-16.20-HA3-5 |

## aerospace-structures#2

Records: 3 (Partly 3).

| Row                                               | Page     | Old mark | New mark              | Items                               |
| ------------------------------------------------- | -------- | -------- | --------------------- | ----------------------------------- |
| Euler load of a pinned column                     | main     | Solves   | keep (items ask more) | OCW-16.20-HA10-1, OCW-16.001-PS13-1 |
| effect of end conditions (K)                      | main     | Solves   | keep (items ask more) | OCW-16.20-HA10-1, OCW-16.001-PS13-1 |
| critical stress of a skin panel between stringers | ~plate   | Solves   | no item               |                                     |
| short column: Johnson parabola                    | ~johnson | Solves   | keep (items ask more) | OCW-16.20-HA10-4                    |

## aerospace-structures#3

Records: 4 (No 4).

| Row                                                | Page       | Old mark | New mark     | Items           |
| -------------------------------------------------- | ---------- | -------- | ------------ | --------------- |
| mean and alternating stress, Goodman safety factor | main       | Solves   | no item      |                 |
| Miner's rule damage and repeats to failure         | ~miner     | Solves   | no item      |                 |
| cycles to failure from Basquin's law               | ~basquin   | Solves   | no item      |                 |
| margin of safety from limit and ultimate loads     | [new-page] | —        | No (new row) | OCW-16.20-HA1-8 |

## propulsion#0

Records: 6 (No 4, Partly 2).

| Row                                                      | Page        | Old mark | New mark              | Items                         |
| -------------------------------------------------------- | ----------- | -------- | --------------------- | ----------------------------- |
| ideal Brayton efficiency and net work                    | main        | Solves   | no item               |                               |
| compressor exit temperature with an efficiency           | ~compressor | Solves   | no item               |                               |
| turbojet thrust, propulsive efficiency, TSFC             | ~turbojet   | Solves   | keep (items ask more) | OCW-16.50-HW6                 |
| turbofan thrust with a bypass ratio                      | ~turbofan   | Solves   | keep (items ask more) | OCW-16.50-HW7                 |
| compressor or turbine stage: velocity triangles and work | [new-page]  | —        | No (new row)          | OCW-16.50-HW9, OCW-16.50-HW10 |

## propulsion#1

Records: 5 (No 1, Partly 3, Solves 1).

| Row                                          | Page     | Old mark | New mark              | Items                          |
| -------------------------------------------- | -------- | -------- | --------------------- | ------------------------------ |
| Δv from Isp and mass ratio (rocket equation) | main     | Solves   | keep (items ask more) | OCW-16.50-HW2                  |
| propellant fraction for a Δv                 | main     | Solves   | keep (items ask more) | OCW-16.50-HW2                  |
| thrust with a pressure term; Isp from thrust | ~thrust  | Solves   | keep (items ask more) | OCW-16.07-HW6-3B               |
| two-stage Δv                                 | ~staging | Solves   | keep                  | OCW-16.50-HW1, OCW-16.07-HW7-1 |

## propulsion#2

Records: 5 (No 2, Partly 3).

| Row                                                      | Page                          | Old mark     | New mark              | Items                          |
| -------------------------------------------------------- | ----------------------------- | ------------ | --------------------- | ------------------------------ |
| thrust from C_F, chamber pressure, throat area           | main                          | Solves       | keep (items ask more) | OCW-16.50-HW3, OCW-16.50-PQ-TF |
| c* and mass flow; I_sp from C_F and c*                   | main                          | Solves       | keep (items ask more) | OCW-16.50-HW3, OCW-16.50-PQ-TF |
| ideal exhaust velocity from chamber state                | ~exhaust-velocity             | Solves       | no item               |                                |
| over-, ideally or underexpanded                          | compressible-flow#2~expansion | cross-listed | keep (items ask more) | OCW-16.50-Q1-TF                |
| throat heat flux and wall temperature of a cooled nozzle | [new-page]                    | —            | No (new row)          | OCW-16.50-Q1-P, OCW-16.50-PQ-P |

## propulsion#3

Records: 1 (No 1).

| Row                                             | Page    | Old mark | New mark | Items |
| ----------------------------------------------- | ------- | -------- | -------- | ----- |
| stoichiometric fuel–air ratio of a hydrocarbon  | main    | Solves   | no item  |       |
| equivalence ratio                               | main    | Solves   | no item  |       |
| fuel–air ratio for a combustor exit temperature | ~burner | Solves   | no item  |       |

## orbital-mechanics#0

Records: 4 (No 3, Solves 1).

| Row                                      | Page           | Old mark | New mark | Items               |
| ---------------------------------------- | -------------- | -------- | -------- | ------------------- |
| circular speed and period at an altitude | main           | Solves   | no item  |                     |
| escape speed                             | main           | Solves   | no item  |                     |
| speed anywhere on an ellipse (vis-viva)  | ~vis-viva      | Solves   | keep     | OCW-16.07-FINAL04-3 |
| geostationary radius and altitude        | ~geostationary | Solves   | no item  |                     |

## orbital-mechanics#1

Records: 8 (No 5, Partly 2, Solves 1).

| Row                                       | Page            | Old mark        | New mark              | Items                              |
| ----------------------------------------- | --------------- | --------------- | --------------------- | ---------------------------------- |
| a, e, period, h from perigee and apogee   | main            | Solves          | keep                  | OCW-16.07-HW7-2                    |
| radius at a true anomaly (orbit equation) | ~orbit-equation | Solves          | no item               |                                    |
| position after a time (Kepler's equation) | ~kepler         | Solves (⏳ N2)  | keep (items ask more) | OCW-16.346-EX04-2, OCW-16.346-EX05 |
| what i, Ω, ω and ν describe               | ~elements       | Solves (⏳ P13) | no item               |                                    |

## orbital-mechanics#2

Records: 4 (No 2, Solves 2).

| Row                                          | Page          | Old mark | New mark | Items               |
| -------------------------------------------- | ------------- | -------- | -------- | ------------------- |
| Hohmann transfer Δv₁, Δv₂, time of flight    | main          | Solves   | keep     | OCW-16.07-FINAL07-2 |
| plane-change Δv                              | ~plane-change | Solves   | no item  |                     |
| combined circularize-and-turn burn at apogee | ~combined     | Solves   | keep     | OCW-16.07-HW7-3     |

## orbital-mechanics#3

Records: 6 (No 5, Solves 1).

| Row                                                      | Page       | Old mark | New mark     | Items             |
| -------------------------------------------------------- | ---------- | -------- | ------------ | ----------------- |
| v∞ and departure Δv from a parking orbit (patched conic) | main       | Solves   | keep         | OCW-16.346-EX04-1 |
| synodic period, next launch window                       | ~synodic   | Solves   | no item      |                   |
| sphere of influence radius                               | ~soi       | Solves   | no item      |                   |
| gravity-assist turn angle and the new heliocentric orbit | [new-page] | —        | No (new row) | OCW-16.346-EX12   |

## structural-analysis#0

Records: 13 (No 8, Partly 2, Solves 3).

| Row                                                | Page         | Old mark        | New mark              | Items                  |
| -------------------------------------------------- | ------------ | --------------- | --------------------- | ---------------------- |
| reactions and maximum moment, point load on a span | main         | Solves          | keep                  | UDO-SA-3.2             |
| shear and moment of a uniform load                 | ~udl         | Solves          | keep (items ask more) | UDO-SA-4.1             |
| cantilever end reaction and fixed-end moment       | ~cantilever  | Solves          | no item               |                        |
| truss member force by the method of sections       | ~truss       | Solves (⏳ P15) | keep (items ask more) | UDO-SA-5.2             |
| determinate, indeterminate or unstable             | ~determinacy | Solves          | keep                  | UDO-SA-3.1, UDO-SA-5.1 |
| dead load on a beam from tributary width           | [new-page]   | —               | No (new row)          | UDO-SA-2.3             |

## structural-analysis#1

Records: 3 (Partly 2, Solves 1).

| Row                                                   | Page            | Old mark        | New mark              | Items       |
| ----------------------------------------------------- | --------------- | --------------- | --------------------- | ----------- |
| maximum moment at a section from a moving load        | main            | Solves          | keep (items ask more) | UDO-SA-9.2  |
| moment from a uniform live load on the influence area | main            | Solves          | keep (items ask more) | UDO-SA-9.2  |
| shear influence line ordinates                        | ~shear          | Solves          | keep                  | UDO-SA-9.1  |
| where to place live load on a continuous beam         | ~muller-breslau | Solves (⏳ P14) | keep (items ask more) | UDO-SA-13.1 |

## structural-analysis#2

Records: 9 (No 5, Partly 3, Solves 1).

| Row                                             | Page                 | Old mark        | New mark              | Items                            |
| ----------------------------------------------- | -------------------- | --------------- | --------------------- | -------------------------------- |
| propped cantilever reactions (force method)     | main                 | Solves          | keep (items ask more) | UDO-SA-10.1                      |
| fixed-end moments                               | ~fixed-end           | Solves          | keep (items ask more) | OCW-1.571-PS1-1, OCW-1.571-PS1-3 |
| two-span continuous beam by moment distribution | ~moment-distribution | Solves (⏳ P14) | keep                  | UDO-SA-12.1                      |
| end moments by slope-deflection                 | [new-page]           | —               | No (new row)          | UDO-SA-11.1, UDO-SA-11.2         |

## structural-analysis#3

Records: 1 (No 1).

| Row                                               | Page     | Old mark          | New mark | Items |
| ------------------------------------------------- | -------- | ----------------- | -------- | ----- |
| element stiffness AE ÷ L                          | main     | Solves            | no item  |       |
| displacements of two bars in series (assembled K) | main     | Solves            | no item  |       |
| spring system by the direct stiffness method      | ~springs | Solves            | no item  |       |
| beam element stiffness matrix                     | —        | No (⏳ N9, 4 × 4) | no item  |       |

## soil-mechanics#0

Records: 3 (Partly 1, Solves 2).

| Row                                                  | Page        | Old mark       | New mark | Items                              |
| ---------------------------------------------------- | ----------- | -------------- | -------- | ---------------------------------- |
| void ratio, porosity, dry unit weight from w, G_s, S | main        | Solves         | keep     | VER-SM-3.1, VER-SM-3.2, VER-SM-3.3 |
| C_u, C_c and well or poorly graded                   | ~gradation  | Solves (⏳ N5) | no item  |                                    |
| plasticity index and the A-line                      | ~plasticity | Solves (⏳ N5) | no item  |                                    |
| USCS group from gradation and limits                 | ~uscs       | Solves         | no item  |                                    |

## soil-mechanics#1

Records: 0 ().

| Row                                           | Page       | Old mark | New mark | Items |
| --------------------------------------------- | ---------- | -------- | -------- | ----- |
| dry unit weight from a Proctor point          | main       | Solves   | no item  |       |
| zero-air-voids unit weight                    | main       | Solves   | no item  |       |
| relative compaction against the specification | main       | Solves   | no item  |       |
| sand-cone field density                       | ~sand-cone | Solves   | no item  |       |

## soil-mechanics#2

Records: 12 (No 5, Partly 2, Solves 5).

| Row                                                | Page              | Old mark       | New mark | Items                                |
| -------------------------------------------------- | ----------------- | -------------- | -------- | ------------------------------------ |
| primary settlement of a normally consolidated clay | main              | Solves         | keep     | VER-SM-3.4, VER-SM-14.1, VER-SM-14.3 |
| effective stress at a depth (layers, water table)  | ~effective-stress | Solves         | keep     | VER-SM-5.1, VER-SM-5.2, VER-SM-5.3   |
| settlement of an overconsolidated clay             | ~overconsolidated | Solves (⏳ N9) | no item  |                                      |
| time for a degree of consolidation                 | ~time-rate        | Solves         | keep     | VER-SM-16.1                          |

## soil-mechanics#3

Records: 4 (No 2, Partly 1, Solves 1).

| Row                                       | Page          | Old mark | New mark | Items                    |
| ----------------------------------------- | ------------- | -------- | -------- | ------------------------ |
| σ′₁ at failure in a drained triaxial test | main          | Solves   | keep     | VER-SM-20.1, VER-SM-21.1 |
| failure plane angle                       | main          | Solves   | keep     | VER-SM-20.1, VER-SM-21.1 |
| c′ and φ′ from two direct shear tests     | ~direct-shear | Solves   | no item  |                          |
| undrained shear strength from a UU test   | ~undrained    | Solves   | no item  |                          |

## soil-mechanics#4

Records: 6 (No 4, Partly 1, Solves 1).

| Row                                               | Page    | Old mark | New mark | Items                      |
| ------------------------------------------------- | ------- | -------- | -------- | -------------------------- |
| ultimate and allowable bearing of a strip footing | main    | Solves   | keep     | OCW-1.364-HW2, VER-SM-43.2 |
| bearing factors from φ′                           | main    | Solves   | keep     | OCW-1.364-HW2, VER-SM-43.2 |
| square footing (shape factors)                    | ~square | Solves   | no item  |                            |

## hydraulics-hydrology#0

Records: 12 (No 5, Partly 4, Solves 3).

| Row                                               | Page            | Old mark       | New mark              | Items                                                                                |
| ------------------------------------------------- | --------------- | -------------- | --------------------- | ------------------------------------------------------------------------------------ |
| discharge by Manning's equation                   | main            | Solves         | keep                  | OCW-1.060-PS7-2, OCW-1.060-PS7-3, OCW-1.060-PS7-4, OCW-1.060-PS9-1, FHWA-HEC22-EX5-1 |
| Froude number, sub- or supercritical              | main            | Solves         | keep                  | OCW-1.060-PS7-2, OCW-1.060-PS7-3, OCW-1.060-PS7-4, OCW-1.060-PS9-1, FHWA-HEC22-EX5-1 |
| normal depth for a discharge                      | main (type Q)   | Solves (⏳ N2) | keep                  | OCW-1.060-PS7-2, OCW-1.060-PS7-3, OCW-1.060-PS7-4, OCW-1.060-PS9-1, FHWA-HEC22-EX5-1 |
| critical depth and specific energy                | ~critical-depth | Solves         | keep (items ask more) | OCW-1.060-PS8-2                                                                      |
| hydraulic jump depth and head loss                | ~jump           | Solves         | keep                  | OCW-1.060-PS8-3                                                                      |
| gradually varied flow: profile type behind a gate | [new-page]      | —              | No (new row)          | OCW-1.060-PS9-1, OCW-1.060-PS9-3                                                     |

## hydraulics-hydrology#1

Records: 7 (No 4, Partly 3).

| Row                                                     | Page            | Old mark        | New mark              | Items                                             |
| ------------------------------------------------------- | --------------- | --------------- | --------------------- | ------------------------------------------------- |
| head loss by Darcy–Weisbach with a friction factor      | main            | Solves          | keep (items ask more) | OCW-1.060-PS5-1, OCW-1.060-PS5-2, OCW-1.060-PS5-3 |
| head loss by Hazen–Williams                             | ~hazen-williams | Solves          | no item               |                                                   |
| flow split between two parallel pipes                   | ~parallel       | Solves          | no item               |                                                   |
| one Hardy Cross correction of a loop                    | ~hardy-cross    | Solves (⏳ P20) | no item               |                                                   |
| pump or turbine power with pipe losses; operating point | [new-page]      | —               | No (new row)          | OCW-1.060-PS6-1, OCW-1.060-PS6-2, OCW-1.060-PS6-3 |
| minor losses (entrance, exit, fittings) in a pipe line  | [new-page]      | —               | No (new row)          | OCW-1.060-PS5-3                                   |

## hydraulics-hydrology#2

Records: 5 (No 1, Partly 3, Solves 1).

| Row                                           | Page       | Old mark                         | New mark              | Items                              |
| --------------------------------------------- | ---------- | -------------------------------- | --------------------- | ---------------------------------- |
| runoff depth by the NRCS curve number         | main       | Solves                           | keep (items ask more) | FHWA-HEC22-EX3-5                   |
| peak flow by the rational method              | ~rational  | Solves                           | keep                  | FHWA-HEC22-EX3-1, FHWA-HEC22-EX3-3 |
| time of concentration (Kirpich)               | ~kirpich   | Solves                           | keep (items ask more) | FHWA-HEC22-EX3-2                   |
| unit hydrograph convolution                   | —          | No (⏳ N7, a table of ordinates) | no item               |                                    |
| time of concentration by flow segments (NRCS) | [new-page] | —                                | No (new row)          | FHWA-HEC22-EX3-2                   |
| triangular SCS unit hydrograph (q_p, t_p)     | [new-page] | —                                | No (new row)          | FHWA-HEC22-EX3-7                   |

## hydraulics-hydrology#3

Records: 9 (No 5, Partly 1, Solves 3).

| Row                                                    | Page          | Old mark | New mark     | Items                              |
| ------------------------------------------------------ | ------------- | -------- | ------------ | ---------------------------------- |
| storm sewer diameter flowing full (Manning)            | main          | Solves   | keep         | FHWA-HEC22-EX7-1, FHWA-HEC22-EX7-2 |
| detention volume from inflow and allowed outflow peaks | ~detention    | Solves   | keep         | OCW-1.85-MID-1, FHWA-HEC22-EX8-1   |
| order of the design steps                              | ~design-steps | Solves   | no item      |                                    |
| gutter spread at a flow (modified Manning)             | [new-page]    | —        | No (new row) | FHWA-HEC22-EX4-1, FHWA-HEC22-EX4-6 |
| orifice or weir outlet rating                          | [new-page]    | —        | No (new row) | FHWA-HEC22-EX8-5                   |

## transportation#0

Records: 9 (No 5, Partly 2, Solves 2).

| Row                                              | Page       | Old mark | New mark     | Items                         |
| ------------------------------------------------ | ---------- | -------- | ------------ | ----------------------------- |
| speed and flow at a density (Greenshields)       | main       | Solves   | no item      |                               |
| capacity and the density at capacity             | main       | Solves   | no item      |                               |
| shock wave speed at a queue                      | ~shockwave | Solves   | keep         | WB-FOT-SW-EX1, WB-FOT-SW-PROB |
| headway and spacing                              | ~headway   | Solves   | keep         | WB-FOT-TF-EX2, WB-FOT-TF-PROB |
| time-mean and space-mean speed of a speed sample | [new-page] | —        | No (new row) | WB-FOT-TF-EX1, WB-FOT-TF-PROB |

## transportation#1

Records: 19 (No 10, Partly 5, Solves 4).

| Row                                                                | Page              | Old mark       | New mark     | Items                                                                      |
| ------------------------------------------------------------------ | ----------------- | -------------- | ------------ | -------------------------------------------------------------------------- |
| stopping sight distance at a design speed and grade                | main              | Solves         | keep         | WB-FOT-SD-EX1, WB-FOT-SD-EX2, WB-FOT-SD-EX3, WB-FOT-SD-EX5, WB-FOT-SD-PROB |
| minimum radius of a horizontal curve                               | ~horizontal-curve | Solves         | keep         | WB-FOT-HC-EX1, WB-FOT-HC-PROB                                              |
| curve length and tangent from R and Δ                              | ~curve-elements   | Solves         | keep         | WB-FOT-HC-EX2                                                              |
| length of a crest vertical curve for SSD                           | ~crest-curve      | Solves (⏳ N9) | keep         | WB-FOT-VC-EX3                                                              |
| braking distance on a grade; friction or initial speed from a skid | [new-page]        | —              | No (new row) | WB-FOT-SD-EX2, WB-FOT-SD-EX4, WB-FOT-SD-HW2                                |
| sightline offset (middle ordinate) on a horizontal curve           | [new-page]        | —              | No (new row) | WB-FOT-HC-EX3                                                              |
| elevations and the low or high point on a vertical curve           | [new-page]        | —              | No (new row) | WB-FOT-VC-EX1, WB-FOT-VC-EX2, WB-FOT-VC-PROB                               |
| vehicle resistances: maximum acceleration or grade                 | [new-page]        | —              | No (new row) | WB-FOT-GR-EX1, WB-FOT-GR-EX2                                               |

## transportation#2

Records: 0 ().

| Row                                        | Page  | Old mark | New mark | Items |
| ------------------------------------------ | ----- | -------- | -------- | ----- |
| structural number of a flexible pavement   | main  | Solves   | no item  |       |
| ESALs from an axle load (fourth-power law) | ~esal | Solves   | no item  |       |
| layer thickness for a required SN          | main  | Solves   | no item  |       |

## transportation#3

Records: 9 (No 8, Solves 1).

| Row                                                           | Page       | Old mark       | New mark     | Items                         |
| ------------------------------------------------------------- | ---------- | -------------- | ------------ | ----------------------------- |
| flow rate in passenger cars, density, level of service        | main       | Solves (⏳ N5) | no item      |                               |
| heavy-vehicle factor                                          | main       | Solves         | no item      |                               |
| optimum signal cycle (Webster)                                | ~webster   | Solves         | keep         | WB-FOT-TS-EX3                 |
| queue at a signal (D/D/1): maximum queue and delay            | [new-page] | —              | No (new row) | WB-FOT-TS-EX1, WB-FOT-TS-PROB |
| M/M/1 queue at a toll booth: utilization, queue length, waits | [new-page] | —              | No (new row) | WB-FOT-Q-EX1, WB-FOT-Q-PROB   |
| signal approach delay (HCM uniform and random terms)          | [new-page] | —              | No (new row) | WB-FOT-TS-EX2                 |

## steel-design#0

Records: 4 (No 1, Partly 1, Solves 2).

| Row                                           | Page        | Old mark       | New mark              | Items                  |
| --------------------------------------------- | ----------- | -------------- | --------------------- | ---------------------- |
| governing factored load from D, L, S          | main        | Solves (⏳ N5) | keep                  | UDO-SA-2.1, UDO-SA-2.2 |
| design strength φR_n against R_u; ASD R_n ÷ Ω | ~phi-omega  | Solves         | no item               |                        |
| dead, live or environmental load              | ~load-types | Solves         | keep (items ask more) | OCW-1.051-PS1-1        |

## steel-design#1

Records: 3 (Partly 1, Solves 2).

| Row                                       | Page     | Old mark           | New mark | Items                           |
| ----------------------------------------- | -------- | ------------------ | -------- | ------------------------------- |
| column design strength φP_n (W-shape, KL) | main     | Solves (⏳ N4, N9) | keep     | OCW-1.051-Q2-3                  |
| tension member: yielding against rupture  | ~tension | Solves (⏳ N9)     | keep     | OCW-1.051-PS5-1, OCW-1.051-Q2-2 |
| slenderness limit KL ÷ r ≤ 200            | main     | Solves             | keep     | OCW-1.051-Q2-3                  |

## steel-design#2

Records: 0 ().

| Row                                              | Page        | Old mark       | New mark | Items |
| ------------------------------------------------ | ----------- | -------------- | -------- | ----- |
| plastic moment strength of a braced compact beam | main        | Solves (⏳ N4) | no item  |       |
| L_p and whether lateral bracing is close enough  | main        | Solves         | no item  |       |
| live-load deflection against L ÷ 360             | ~deflection | Solves         | no item  |       |
| shear strength of a rolled W-shape               | ~shear      | Solves         | no item  |       |

## steel-design#3

Records: 1 (Solves 1).

| Row                                     | Page         | Old mark       | New mark | Items           |
| --------------------------------------- | ------------ | -------------- | -------- | --------------- |
| bolt group in single shear              | main         | Solves         | no item  |                 |
| fillet weld strength per inch and total | ~weld        | Solves         | no item  |                 |
| block shear rupture                     | ~block-shear | Solves (⏳ N9) | keep     | OCW-1.051-PS5-2 |

## concrete-design#0

Records: 2 (Partly 1, Solves 1).

| Row                                          | Page             | Old mark       | New mark | Items                           |
| -------------------------------------------- | ---------------- | -------------- | -------- | ------------------------------- |
| φM_n of a singly reinforced rectangular beam | main             | Solves         | keep     | OCW-1.051-PS2-1, OCW-1.051-Q1-1 |
| tension-controlled check (ε_t ≥ 0.005)       | main             | Solves (⏳ N5) | keep     | OCW-1.051-PS2-1, OCW-1.051-Q1-1 |
| minimum steel                                | ~min-steel       | Solves (⏳ N9) | no item  |                                 |
| steel needed for a factored moment           | main (type φM_n) | Solves (⏳ N3) | keep     | OCW-1.051-PS2-1, OCW-1.051-Q1-1 |

## concrete-design#1

Records: 4 (No 2, Solves 2).

| Row                                  | Page | Old mark | New mark | Items                           |
| ------------------------------------ | ---- | -------- | -------- | ------------------------------- |
| concrete shear strength φV_c         | main | Solves   | keep     | OCW-1.051-PS3-1, OCW-1.051-Q1-2 |
| stirrup spacing for a factored shear | main | Solves   | keep     | OCW-1.051-PS3-1, OCW-1.051-Q1-2 |
| maximum spacing d ÷ 2                | main | Solves   | keep     | OCW-1.051-PS3-1, OCW-1.051-Q1-2 |

## concrete-design#2

Records: 5 (No 3, Partly 2).

| Row                                     | Page         | Old mark                     | New mark              | Items           |
| --------------------------------------- | ------------ | ---------------------------- | --------------------- | --------------- |
| maximum axial strength of a tied column | main         | Solves                       | keep (items ask more) | OCW-1.051-Q2-1  |
| spiral column                           | ~spiral      | Solves                       | keep (items ask more) | OCW-1.054-EX1-1 |
| steel ratio between 1% and 8%           | main         | Solves                       | keep (items ask more) | OCW-1.051-Q2-1  |
| short or slender (kℓ_u ÷ r ≤ 22)        | ~slenderness | Solves (⏳ N5)               | no item               |                 |
| P–M interaction diagram                 | —            | No (⏳ P6 `interaction`, N9) | no item               |                 |

## concrete-design#3

Records: 2 (No 2).

| Row                                                  | Page            | Old mark | New mark | Items |
| ---------------------------------------------------- | --------------- | -------- | -------- | ----- |
| spread footing size from the allowable soil pressure | main            | Solves   | no item  |       |
| two-way (punching) shear check                       | main            | Solves   | no item  |       |
| minimum thickness of a one-way slab                  | ~slab-thickness | Solves   | no item  |       |

## environmental#0

Records: 14 (No 9, Partly 2, Solves 3).

| Row                                                 | Page             | Old mark | New mark              | Items                                                           |
| --------------------------------------------------- | ---------------- | -------- | --------------------- | --------------------------------------------------------------- |
| overflow rate and detention time of a settling tank | main             | Solves   | keep                  | OCW-1.85-HW3-1, OCW-1.85-HW3-3, OCW-1.85-HW4-2, OCW-1.061-P10-1 |
| settling velocity (Stokes) and fraction removed     | main             | Solves   | keep                  | OCW-1.85-HW3-1, OCW-1.85-HW3-3, OCW-1.85-HW4-2, OCW-1.061-P10-1 |
| CT for disinfection                                 | ~ct              | Solves   | no item               |                                                                 |
| order of a conventional treatment plant             | ~treatment-train | Solves   | keep (items ask more) | OCW-1.85-HW1-3                                                  |
| breakpoint chlorination from a demand curve         | [new-page]       | —        | No (new row)          | OCW-1.85-HW6-2                                                  |
| lime–soda softening doses                           | [new-page]       | —        | No (new row)          | OCW-1.85-HW5-1                                                  |

## environmental#1

Records: 9 (No 6, Partly 3).

| Row                                             | Page              | Old mark | New mark              | Items                                          |
| ----------------------------------------------- | ----------------- | -------- | --------------------- | ---------------------------------------------- |
| BOD exerted by day t; ultimate BOD              | main              | Solves   | no item               |                                                |
| BOD from a dilution test                        | ~dilution         | Solves   | no item               |                                                |
| food-to-microorganism ratio, HRT                | ~activated-sludge | Solves   | keep (items ask more) | OCW-1.85-HW7-1, OCW-1.85-HW8-2                 |
| order of a secondary treatment plant            | ~plant-order      | Solves   | keep (items ask more) | OCW-1.85-HW1-2                                 |
| first-order removal in a CSTR or plug-flow tank | [new-page]        | —        | No (new row)          | OCW-1.85-HW1-4, OCW-1.85-HW2-1, OCW-1.85-HW2-2 |

## environmental#2

Records: 6 (No 4, Partly 1, Solves 1).

| Row                                                     | Page       | Old mark | New mark     | Items                          |
| ------------------------------------------------------- | ---------- | -------- | ------------ | ------------------------------ |
| ground-level centerline concentration (Gaussian plume)  | main       | Solves   | keep         | OCW-1.061-P6-3, OCW-1.061-P9-1 |
| ppm to μg/m³                                            | ~ppm       | Solves   | no item      |                                |
| overall efficiency of control devices in series         | ~control   | Solves   | no item      |                                |
| instantaneous puff (1-D or 3-D diffusion) concentration | [new-page] | —        | No (new row) | OCW-1.061-P3-1, OCW-1.061-P3-2 |

## environmental#3

Records: 8 (No 7, Partly 1).

| Row                                           | Page           | Old mark | New mark              | Items          |
| --------------------------------------------- | -------------- | -------- | --------------------- | -------------- |
| landfill volume a year and the life of a site | main           | Solves   | no item               |                |
| area needed for a depth                       | main           | Solves   | no item               |                |
| waste hierarchy order                         | ~hierarchy     | Solves   | keep (items ask more) | OCW-1.34-HW6-1 |
| heating value of mixed waste                  | ~heating-value | Solves   | no item               |                |

## surveying#0

Records: 0 ().

| Row                                                   | Page           | Old mark       | New mark | Items |
| ----------------------------------------------------- | -------------- | -------------- | -------- | ----- |
| horizontal and vertical distance from a slope reading | main           | Solves (⏳ N6) | no item  |       |
| temperature correction of a steel tape                | ~tape          | Solves         | no item  |       |
| interior angle sum and misclosure of a polygon        | ~angle-closure | Solves (⏳ N6) | no item  |       |

## surveying#1

Records: 0 ().

| Row                                             | Page       | Old mark | New mark | Items |
| ----------------------------------------------- | ---------- | -------- | -------- | ----- |
| elevation by differential leveling (two setups) | main       | Solves   | no item  |       |
| arithmetic check ΣBS − ΣFS                      | main       | Solves   | no item  |       |
| curvature and refraction over a long sight      | ~curvature | Solves   | no item  |       |
| trigonometric leveling                          | ~trig      | Solves   | no item  |       |

## surveying#2

Records: 0 ().

| Row                                      | Page          | Old mark       | New mark | Items |
| ---------------------------------------- | ------------- | -------------- | -------- | ----- |
| latitude and departure of a course       | main          | Solves (⏳ N6) | no item  |       |
| linear misclosure and relative precision | ~closure      | Solves         | no item  |       |
| compass-rule correction of one course    | ~compass-rule | Solves         | no item  |       |
| area from coordinates                    | ~area         | Solves         | no item  |       |

## surveying#3

Records: 0 ().

| Row                                                   | Page         | Old mark | New mark | Items |
| ----------------------------------------------------- | ------------ | -------- | -------- | ----- |
| orthometric height from ellipsoid height and geoid    | main         | Solves   | no item  |       |
| range from signal travel time; a clock error's effect | ~pseudorange | Solves   | no item  |       |
| expected position error from DOP                      | ~dop         | Solves   | no item  |       |
| which error source is which                           | ~errors      | Solves   | no item  |       |

## material-energy-balances#0

Records: 4 (No 2, Partly 2).

| Row                                                    | Page     | Old mark        | New mark              | Items                    |
| ------------------------------------------------------ | -------- | --------------- | --------------------- | ------------------------ |
| mass flow to molar flow and mole fractions of a stream | main     | Solves          | keep (items ask more) | WB-ICEP-2.3, WB-ICEP-3.1 |
| degrees of freedom of a unit                           | ~dof     | Solves          | no item               |                          |
| what each PFD symbol does                              | ~symbols | Solves (⏳ P36) | no item               |                          |

## material-energy-balances#1

Records: 5 (No 2, Partly 2, Solves 1).

| Row                                         | Page      | Old mark | New mark              | Items                    |
| ------------------------------------------- | --------- | -------- | --------------------- | ------------------------ |
| mixer: outlet flow and composition          | main      | Solves   | keep                  | WB-ICEP-2.1, WB-ICEP-2.5 |
| column split: distillate, bottoms, recovery | ~splitter | Solves   | keep (items ask more) | WB-ICEP-3.2              |
| bypass around a unit                        | ~bypass   | Solves   | no item               |                          |

## material-energy-balances#2

Records: 1 (Partly 1).

| Row                                               | Page        | Old mark | New mark              | Items           |
| ------------------------------------------------- | ----------- | -------- | --------------------- | --------------- |
| outlet flows from conversion (extent of reaction) | main        | Solves   | keep (items ask more) | OCW-10.37-HW1-1 |
| limiting reactant and percent excess              | main        | Solves   | keep (items ask more) | OCW-10.37-HW1-1 |
| combustion with excess air; dry-basis CO₂ %       | ~combustion | Solves   | no item               |                 |

## material-energy-balances#3

Records: 0 ().

| Row                                  | Page              | Old mark                    | New mark | Items |
| ------------------------------------ | ----------------- | --------------------------- | -------- | ----- |
| heat duty to warm a stream           | main              | Solves                      | no item  |       |
| steam needed for that duty           | main              | Solves                      | no item  |       |
| heat released by a reaction at 25 °C | ~heat-of-reaction | Solves                      | no item  |       |
| enthalpy from steam tables           | —                 | No (⏳ N4 steam table rows) | no item  |       |

## chemical-thermodynamics#0

Records: 4 (No 3, Partly 1).

| Row                                                  | Page           | Old mark           | New mark              | Items           |
| ---------------------------------------------------- | -------------- | ------------------ | --------------------- | --------------- |
| compressibility factor from the virial (Pitzer) form | main           | Solves             | keep (items ask more) | OCW-10.40-EX2-1 |
| pressure from van der Waals at a molar volume        | ~van-der-waals | Solves             | no item               |                 |
| volume from van der Waals at a pressure (cubic)      | ~van-der-waals | Partly (⏳ N2, N3) | no item               |                 |
| Peng–Robinson                                        | —              | No (⏳ N2, N3, N4) | no item               |                 |

## chemical-thermodynamics#1

Records: 1 (No 1).

| Row                                       | Page      | Old mark | New mark | Items |
| ----------------------------------------- | --------- | -------- | -------- | ----- |
| fugacity coefficient from the virial form | main      | Solves   | no item  |       |
| liquid fugacity with the Poynting factor  | ~poynting | Solves   | no item  |       |

## chemical-thermodynamics#2

Records: 2 (No 1, Partly 1).

| Row                                            | Page          | Old mark       | New mark              | Items           |
| ---------------------------------------------- | ------------- | -------------- | --------------------- | --------------- |
| bubble pressure and vapor composition (Raoult) | main          | Solves (⏳ N4) | keep (items ask more) | OCW-10.32-EX1-1 |
| dew pressure                                   | ~dew          | Solves         | no item               |                 |
| binary flash: phase fractions at T and P       | ~flash        | Solves         | no item               |                 |
| activity coefficients (one-parameter Margules) | ~margules     | Solves         | no item               |                 |
| bubble temperature at a pressure               | main (type P) | Solves (⏳ N2) | keep (items ask more) | OCW-10.32-EX1-1 |

## chemical-thermodynamics#3

Records: 0 ().

| Row                                    | Page        | Old mark | New mark | Items |
| -------------------------------------- | ----------- | -------- | -------- | ----- |
| K from ΔG° at 298 K                    | main        | Solves   | no item  |       |
| K at another temperature (van 't Hoff) | ~van-t-hoff | Solves   | no item  |       |
| equilibrium conversion of A ⇌ B        | ~conversion | Solves   | no item  |       |

## transport-phenomena#0

Records: 0 ().

| Row                                             | Page     | Old mark | New mark | Items |
| ----------------------------------------------- | -------- | -------- | -------- | ----- |
| laminar flow rate in a tube (Hagen–Poiseuille)  | main     | Solves   | no item  |       |
| average and maximum velocity; wall shear stress | main     | Solves   | no item  |       |
| shear stress and force in Couette flow          | ~couette | Solves   | no item  |       |
| falling film average velocity                   | ~film    | Solves   | no item  |       |

## transport-phenomena#1

Records: 3 (No 2, Partly 1).

| Row                                                | Page         | Old mark | New mark              | Items            |
| -------------------------------------------------- | ------------ | -------- | --------------------- | ---------------- |
| heat flux through a composite wall with convection | main         | Solves   | no item               |                  |
| heat loss from an insulated pipe; critical radius  | ~cylinder    | Solves   | no item               |                  |
| center temperature of a wire with heat generation  | ~heated-wire | Solves   | keep (items ask more) | OCW-10.302-EX1-1 |

## transport-phenomena#2

Records: 1 (Partly 1).

| Row                                              | Page            | Old mark | New mark              | Items            |
| ------------------------------------------------ | --------------- | -------- | --------------------- | ---------------- |
| equimolar counterdiffusion flux (Fick)           | main            | Solves   | keep (items ask more) | OCW-10.302-PS9-1 |
| evaporation through a stagnant gas (Stefan tube) | ~stagnant-film  | Solves   | no item               |                  |
| time to diffuse a distance                       | ~diffusion-time | Solves   | no item               |                  |

## transport-phenomena#3

Records: 1 (Partly 1).

| Row                                                       | Page           | Old mark | New mark              | Items            |
| --------------------------------------------------------- | -------------- | -------- | --------------------- | ---------------- |
| Nusselt number from the friction factor (Chilton–Colburn) | main           | Solves   | no item               |                  |
| Sherwood number by the same analogy                       | ~mass-analogy  | Solves   | keep (items ask more) | OCW-10.302-FIN-1 |
| Prandtl and Schmidt numbers and what they compare         | ~dimensionless | Solves   | no item               |                  |

## separations#0

Records: 3 (Partly 2, Solves 1).

| Row                                               | Page            | Old mark        | New mark              | Items                            |
| ------------------------------------------------- | --------------- | --------------- | --------------------- | -------------------------------- |
| minimum stages (Fenske)                           | main            | Solves          | keep                  | OCW-10.32-EX1-2                  |
| minimum reflux (Underwood, saturated liquid feed) | ~min-reflux     | Solves          | no item               |                                  |
| rectifying operating line                         | ~operating-line | Solves          | no item               |                                  |
| stages by McCabe–Thiele stepping                  | ~mccabe-thiele  | Solves (⏳ P30) | keep (items ask more) | OCW-10.32-PS2-1, OCW-10.32-PS2-2 |

## separations#1

Records: 1 (Partly 1).

| Row                            | Page        | Old mark | New mark              | Items           |
| ------------------------------ | ----------- | -------- | --------------------- | --------------- |
| stages by the Kremser equation | main        | Solves   | keep (items ask more) | OCW-10.32-EX2-2 |
| minimum liquid-to-gas ratio    | ~min-liquid | Solves   | no item               |                 |

## separations#2

Records: 2 (No 2).

| Row                                                  | Page          | Old mark | New mark     | Items           |
| ---------------------------------------------------- | ------------- | -------- | ------------ | --------------- |
| fraction left after one equilibrium stage            | main          | Solves   | no item      |                 |
| crosscurrent stages with split solvent               | ~crosscurrent | Solves   | no item      |                 |
| one large wash or several small ones                 | ~crosscurrent | Solves   | no item      |                 |
| fixed-bed adsorber breakthrough and unused bed (LUB) | [new-page]    | —        | No (new row) | OCW-10.32-EX3-2 |

## separations#3

Records: 3 (No 1, Partly 2).

| Row                                   | Page            | Old mark | New mark              | Items           |
| ------------------------------------- | --------------- | -------- | --------------------- | --------------- |
| reverse-osmosis water flux            | main            | Solves   | keep (items ask more) | OCW-10.32-PS3   |
| osmotic pressure of seawater          | main            | Solves   | keep (items ask more) | OCW-10.32-PS3   |
| ideal selectivity and permeate purity | ~gas-permeation | Solves   | keep (items ask more) | OCW-10.32-EX2-1 |

## reaction-engineering#0

Records: 4 (No 2, Partly 2).

| Row                                            | Page            | Old mark | New mark              | Items           |
| ---------------------------------------------- | --------------- | -------- | --------------------- | --------------- |
| rate constant at a new temperature (Arrhenius) | main            | Solves   | no item               |                 |
| activation energy from two rate constants      | main (type E)   | Solves   | no item               |                 |
| reaction order from initial rates              | ~order          | Solves   | keep (items ask more) | OCW-10.37-HW1-2 |
| Arrhenius plot: E from the slope               | ~arrhenius-plot | Solves   | no item               |                 |

## reaction-engineering#1

Records: 7 (No 1, Partly 4, Solves 2).

| Row                                              | Page          | Old mark        | New mark              | Items                            |
| ------------------------------------------------ | ------------- | --------------- | --------------------- | -------------------------------- |
| CSTR and PFR volume for a first-order conversion | main          | Solves          | keep                  | OCW-10.37-PS4-1, OCW-10.37-MT1-1 |
| second-order liquid reaction in each reactor     | ~second-order | Solves          | keep                  | OCW-10.37-HW3-1, OCW-10.37-HW3-2 |
| batch time for a conversion                      | ~batch        | Solves          | no item               |                                  |
| CSTRs in series                                  | ~series       | Solves          | keep (items ask more) | OCW-10.37-HW3-3, OCW-10.37-FIN-1 |
| Levenspiel plot: which reactor is smaller        | ~levenspiel   | Solves (⏳ P33) | no item               |                                  |
| conversion from a residence-time distribution    | [new-page]    | —               | No (new row)          | OCW-10.37-MT1-2                  |

## reaction-engineering#2

Records: 1 (Solves 1).

| Row                                                       | Page         | Old mark        | New mark | Items           |
| --------------------------------------------------------- | ------------ | --------------- | -------- | --------------- |
| time and amount of the intermediate's maximum (A → B → C) | main         | Solves (⏳ P32) | no item  |                 |
| instantaneous selectivity of parallel reactions           | ~selectivity | Solves          | keep     | OCW-10.37-MT2-3 |

## reaction-engineering#3

Records: 2 (Partly 2).

| Row                                                 | Page           | Old mark       | New mark              | Items                            |
| --------------------------------------------------- | -------------- | -------------- | --------------------- | -------------------------------- |
| fractional coverage and rate (Langmuir)             | main           | Solves         | keep (items ask more) | OCW-10.37-PS2-3, OCW-10.37-MT2-2 |
| effectiveness factor of a spherical pellet (Thiele) | ~effectiveness | Solves (⏳ N8) | no item               |                                  |
| order of the steps on a catalyst                    | ~steps         | Solves         | no item               |                                  |

## process-control#0

Records: 4 (No 1, Partly 1, Solves 2).

| Row                                              | Page          | Old mark | New mark              | Items                              |
| ------------------------------------------------ | ------------- | -------- | --------------------- | ---------------------------------- |
| first-order step response at a time; 63.2% at τ  | main          | Solves   | keep                  | OCW-10.450-PS1-1, OCW-10.450-PS2-1 |
| second-order overshoot, decay ratio, period      | ~second-order | Solves   | no item               |                                    |
| time constant of a mixing tank                   | ~tank         | Solves   | keep (items ask more) | OCW-10.450-PS6                     |
| linearize a nonlinear model about a steady state | [new-page]    | —        | No (new row)          | OCW-10.450-PS8                     |

## process-control#1

Records: 3 (No 1, Solves 2).

| Row                              | Page       | Old mark | New mark | Items            |
| -------------------------------- | ---------- | -------- | -------- | ---------------- |
| offset with proportional control | main       | Solves   | keep     | OCW-10.450-PS3-1 |
| closed-loop time constant        | main       | Solves   | keep     | OCW-10.450-PS3-1 |
| what P, I and D action each do   | ~modes     | Solves   | keep     | WOOLF-9.6-EX1    |
| fail-open or fail-closed valve   | ~fail-safe | Solves   | no item  |                  |

## process-control#2

Records: 4 (No 1, Partly 1, Solves 2).

| Row                                                    | Page | Old mark | New mark | Items                         |
| ------------------------------------------------------ | ---- | -------- | -------- | ----------------------------- |
| Ziegler–Nichols settings from K_u and P_u              | main | Solves   | keep     | OCW-10.450-PS7, WOOLF-9.3-EX1 |
| IMC PI settings for a first-order-plus-dead-time model | ~imc | Solves   | no item  |                               |
| FOPDT model from a step test (two-point method)        | ~fit | Solves   | keep     | OCW-10.450-PS10               |

## process-control#3

Records: 10 (No 3, Partly 3, Solves 4).

| Row                                        | Page          | Old mark       | New mark | Items                                                                         |
| ------------------------------------------ | ------------- | -------------- | -------- | ----------------------------------------------------------------------------- |
| ultimate gain for three equal lags (Routh) | main          | Solves         | no item  |                                                                               |
| stable or not from a cubic's coefficients  | ~routh        | Solves (⏳ N5) | keep     | OCW-10.450-PS11, WOOLF-10.7-EX                                                |
| static feedforward gain                    | ~feedforward  | Solves         | no item  |                                                                               |
| feedback, feedforward, cascade or ratio    | ~architecture | Solves         | keep     | WOOLF-11.4-EX1, WOOLF-11.4-EX2, WOOLF-11.4-EX3, WOOLF-11.4-Q1, WOOLF-11.3-EX1 |

## process-design#0

Records: 0 ().

| Row                                              | Page                | Old mark | New mark | Items |
| ------------------------------------------------ | ------------------- | -------- | -------- | ----- |
| the order of design decisions (hierarchy)        | main                | Solves   | no item  |       |
| economic potential of the input–output structure | ~economic-potential | Solves   | no item  |       |
| separation-sequencing heuristics                 | ~heuristics         | Solves   | no item  |       |

## process-design#1

Records: 2 (Partly 1, Solves 1).

| Row                                       | Page  | Old mark | New mark | Items                              |
| ----------------------------------------- | ----- | -------- | -------- | ---------------------------------- |
| heat-exchanger area from duty, U and LMTD | main  | Solves   | keep     | OCW-10.302-EX2-1, OCW-10.302-EX3-1 |
| pump power                                | ~pump | Solves   | no item  |                                    |
| drum diameter from holdup time and L ÷ D  | ~drum | Solves   | no item  |                                    |

## process-design#2

Records: 0 ().

| Row                                                    | Page | Old mark | New mark | Items |
| ------------------------------------------------------ | ---- | -------- | -------- | ----- |
| equipment cost by the six-tenths rule and a cost index | main | Solves   | no item  |       |
| net present value of a project                         | ~npv | Solves   | no item  |       |
| simple payback                                         | ~npv | Solves   | no item  |       |

## process-design#3

Records: 1 (No 1).

| Row                                        | Page   | Old mark | New mark | Items |
| ------------------------------------------ | ------ | -------- | -------- | ----- |
| lower flammability limit of a fuel mixture | main   | Solves   | no item  |       |
| mitigated event frequency (LOPA)           | ~lopa  | Solves   | no item  |       |
| HAZOP guide word for a deviation           | ~hazop | Solves   | no item  |       |

## Not in the taxonomy (from the items)

- **Structural Analysis: deflections** (double integration, virtual work): Udoeyo chapters 7–8 and 1.571 PS2 (`UDO-SA-7.1`, `UDO-SA-8.1`, `OCW-1.571-PS2-1`). Confirms the plan’s gap.
- **Compressible Flow: Fanno and Rayleigh flow**: heat addition in a duct (`OCW-16.01-F11`, `OCW-16.01-Q4F-1`); 16.120 lectures 6–8. Confirms the plan’s gap.
- **Soil Mechanics: permeability and seepage; lateral earth pressure; slopes; deep foundations**: Verruijt chapters 6–10, 33–36, 46, 49 (`VER-SM-7.1`, `VER-SM-7.2`, `VER-SM-33.2`, `VER-SM-33.3`), 1.364 (`OCW-1.364-HW3-1`, `OCW-1.364-HW4-2`, `OCW-1.364-HW5`), 1.34 seepage velocity (`OCW-1.34-HW2-3`). Confirms permeability and lateral pressure; adds slope stability and piles.
- **Hydraulics & Hydrology: pumps**: system curve and operating point (`OCW-1.060-PS6-2`, `OCW-1.060-PS6-3`); HEC-22 chapter 9. Confirms.
- **Reaction Engineering: nonisothermal reactors and residence-time distribution**: `OCW-10.37-HW6-1`, `OCW-10.37-MT1-2`, `WOOLF-11.6-EX1`, `OCW-10.450-PS8`. Confirms the nonisothermal gap; adds RTD.
- **Separations: adsorption and chromatography** have no topic: `OCW-10.32-EX3-1`, `OCW-10.32-EX3-2`.
- **Aerospace Structures: structural dynamics** (16.20 units 19–23: `OCW-16.20-HA11-1` … `-3`) and **propulsion: rocket cooling and turbomachinery** (16.50, 16.512) have no topic; **electric propulsion** confirmed missing (`OCW-16.50-HW2`).
- **Orbital Mechanics: Lambert’s problem, rendezvous (Clohessy–Wiltshire) and perturbations** (16.346: `OCW-16.346-EX08`, `-EX26`) are graduate topics outside the four.
- **Environmental: site remediation and risk assessment** (1.34: `OCW-1.34-HW2-1`, `-HW6-3`) sit outside solid waste.
- **Transportation: queueing, vehicle dynamics and transit** are taught with traffic flow (Wikibooks) but have no topic; **pavement design** found no open problems.
- **Surveying**: no open source with problems was reached; the course rests on the plan’s own types.

## Totals

keep 140, new 34, no 162.
