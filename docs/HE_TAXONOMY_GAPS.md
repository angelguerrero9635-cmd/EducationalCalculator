# College taxonomy gaps

What the eight college direction plans (`docs/plans/he.*.md`) found that the textbooks teach
and the course topics in `src/data/taxonomy.ts` (`COURSES`) lack, merged and grouped by course,
plus the courses the plans propose. **For the owner to decide.** Nothing here changes
`taxonomy.ts` or `TAXONOMY_ISSUES.md`; a gap the owner accepts goes into `taxonomy.ts` (byte for
byte, as `CLAUDE.md` says) with its entry in `TAXONOMY_ISSUES.md`.

Six plans have a "Not in the taxonomy" part: math (**M**), physics (**P**), chemistry (**C**),
earth and geography (**EG**), mechanical (**ME**) and aero-civil-chemical (**ACC**). The biology
(**B**) and electrical-computer (**EC**) plans have none: biology says every topic has a page and
names no missing one; electrical-computer notes only order differences (for example CLRS teaches
Big-O first, the taxonomy last; Kurose and Ross teach delay in chapter 1, the taxonomy last) and
keeps the taxonomy's order. The research chat (`docs/RESEARCH_HE.md`) is asked to add gaps the
real tables of contents and questions show, for these two groups too.

Section numbers in the reasons are the plans' (from memory of the open books; the research chat
confirms them). "Served by" says where the plan put the idea meanwhile, if anywhere.

## Missing courses (proposed)

| Proposed course or home                                            | Raised by | Why                                                                                                            |
| ------------------------------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------- |
| Engineering Economics (or a topic in a shared course)              | ACC, ME   | The FE Civil and FE Mechanical exams test it; only chemical has a home (`process-design#2`, process economics) |
| Construction Engineering (CPM scheduling, earthwork)               | ACC       | Civil has no construction course; FE Civil tests both                                                          |
| Structural Geology (stress, strain, folds, faults, strike and dip) | EG        | No course or topic; Earle ch. 12 "Geological structures"; or a Physical Geology topic                          |
| Petrology and Sedimentology                                        | EG        | No course; Mineralogy and Historical Geology only touch them                                                   |
| Kinematics of Mechanisms (linkages, cams, gear trains)             | ME        | No course; Gruebler sits on `cad-graphics#3`, gear trains on `machine-design#3`                                |
| Spacecraft Attitude Dynamics                                       | ACC       | Aerospace has orbital mechanics but no attitude course                                                         |
| Aircraft Design (sizing)                                           | ACC       | Aerospace has no design course                                                                                 |
| Measurements and Instrumentation; Ethics                           | ME        | FE Mechanical topics with no course in this group                                                              |

## Mathematics

| Course         | Missing                                                    | Raised by | Why, and where it sits now                                                            |
| -------------- | ---------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------- |
| calc-1         | Mean value theorem and curve sketching                     | M         | Calculus Vol. 1 4.4–4.5; `calc-1#2~extrema` covers part                               |
| calc-1         | Linear approximation and L'Hôpital's rule                  | M         | Vol. 1 4.2, 4.8; placed under `calc-1#1` as problem types                             |
| calc-1         | Newton's method; antiderivatives as a topic                | M         | Vol. 1 4.9, 4.10; no topic (Newton's method is `numerical-methods#0` for engineering) |
| calc-2         | Moments and centroids, hydrostatic force                   | M         | Vol. 1 6.5–6.6; no topic (statics#2 has centroids for engineering)                    |
| calc-2         | Numerical integration (trapezoid, Simpson)                 | M         | Vol. 2 3.6; no math topic (`numerical-methods#3` for engineering)                     |
| calc-2         | Exponential growth as a differential equation              | M         | Vol. 1 6.8; `diff-eq#0` owns it                                                       |
| calc-3         | Vector-valued functions, arc length and curvature          | M         | Vol. 3 ch. 3; placed as `calc-3#0~helix`                                              |
| calc-3         | Cylindrical and spherical coordinates; change of variables | M         | Vol. 3 2.7, 5.5, 5.7; no topic                                                        |
| diff-eq        | Fourier series and PDEs                                    | M         | Lebl ch. 4–5; no math topic (`signals-systems#2` has Fourier series for engineering)  |
| diff-eq        | Exact equations; existence and uniqueness                  | M         | Standard first-order chapter; uniqueness stays in assumptions                         |
| linear-algebra | Linear transformations, kernel and range, change of basis  | M         | Every course; no topic                                                                |
| linear-algebra | Symmetric matrices and quadratic forms; the SVD            | M         | Austin ch. 7; no topic                                                                |

## Physics

| Course              | Missing                                                                      | Raised by | Why, and where it sits now                                                                                                                     |
| ------------------- | ---------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| university-1        | Gravitation; fluid mechanics                                                 | P         | University Physics Vol. 1 ch. 13–14 have no topic; gravitation partly in `classical-mechanics#2`. Add "Gravitation and fluids" or a topic each |
| university-1 or -2  | Heat and kinetic theory (temperature, kinetic theory, first and second laws) | P         | Vol. 2 ch. 1–4 are in no University Physics topic; `thermal-statistical#0` covers the laws at the upper level                                  |
| university-3        | Geometric optics (mirrors, lenses)                                           | P         | Vol. 3 ch. 2; no topic                                                                                                                         |
| university-3        | Atomic structure; condensed matter; particle physics and cosmology           | P         | Vol. 3 ch. 8, 9, 11; no topic                                                                                                                  |
| classical-mechanics | Noninertial frames                                                           | P         | Taylor ch. 9; `classical-mechanics#3~coriolis` sits under rigid bodies for now                                                                 |
| quantum             | The hydrogen atom                                                            | P         | The core of Griffiths ch. 4; `quantum#2` and `university-3#3~bohr` cover parts; `physical-2#2` (chemistry) has it: link it in Refresh          |

## Chemistry

| Course           | Missing                                                                                                                                                             | Raised by | Why, and where it sits now                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------- |
| gen-chem-1 or -2 | Intermolecular forces, liquids and solids                                                                                                                           | C         | Chemistry 2e ch. 10; no topic                                                         |
| gen-chem-2       | Solutions and colligative properties                                                                                                                                | C         | Ch. 11, taught in General Chemistry II at most colleges                               |
| gen-chem-2       | Solubility equilibria                                                                                                                                               | C         | Ch. 15; only `gen-chem-2#1~common-ion`                                                |
| gen-chem-2       | Nuclear chemistry; descriptive main-group and transition-metal chemistry                                                                                            | C         | Ch. 21, 18–19; no topic                                                               |
| organic-1        | Mass spectrometry; alcohols, ethers and epoxides; radical halogenation; structure puzzles from IR, NMR and MS together                                              | C         | McMurry 12.1–12.4, ch. 17–18                                                          |
| organic-2        | Conjugated dienes, Diels–Alder and UV; enolate alkylation; carbohydrates, amino acids, lipids, nucleic acids; synthetic polymers                                    | C         | McMurry ch. 14, 22, 25–28, 30–31                                                      |
| analytical       | Gravimetric analysis; sampling; kinetic methods; voltammetry and amperometry; mass spectrometry; quality assurance                                                  | C         | Harvey ch. 7, 8, 13, 15                                                               |
| physical-1       | Statistical thermodynamics; chemical potential and solutions; kinetic theory at the physical-chemistry level                                                        | C         | Standard P-chem chapters (`thermal-statistical` covers statistics for physics)        |
| physical-2       | Multi-electron atoms and term symbols; variational and perturbation methods; magnetic resonance theory                                                              | C         | Standard quantum-chemistry chapters (`quantum#3` has perturbation theory for physics) |
| biochemistry     | Carbohydrates; lipids and membranes; nucleic acids and the flow of genetic information; gluconeogenesis and glycogen; amino-acid metabolism; signaling              | C         | Biochemistry texts; partly in the biology courses (`cell-molecular#0`, `#1`)          |
| inorganic        | Descriptive main-group chemistry; organometallic reactions and catalysis; electronic spectra (Tanabe–Sugano); hard and soft acids and bases; bioinorganic chemistry | C         | Standard inorganic chapters                                                           |

## Earth science and geography

| Course                            | Missing                                                               | Raised by | Why, and where it sits now                                                                                                                 |
| --------------------------------- | --------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| physical-geography (or hydrology) | Soils: formation, horizons, texture triangle                          | EG        | Taught in every physical geography text; add a fifth topic, or under hydrology's infiltration; HC116 `ternary` serves the texture triangle |
| physical-geology                  | Structural geology (see Missing courses); coasts and glaciers         | EG        | Coasts and glaciers both sit inside "Surface processes"                                                                                    |
| human-geography                   | Political geography and development (states, boundaries, HDI, Rostow) | EG        | AP Human Geography units 4 and 7; the four topics leave them out                                                                           |
| remote-sensing                    | Active remote sensing (radar, lidar)                                  | EG        | The topics are passive optical only                                                                                                        |
| meteorology                       | Severe weather (thunderstorms, tornadoes, hurricanes)                 | EG        | Only partly in `meteorology#3`                                                                                                             |
| oceanography                      | Biological oceanography (productivity, food webs in the sea)          | EG        | No topic                                                                                                                                   |
| climatology or historical-geology | Paleoclimate proxies (δ¹⁸O, ice cores)                                | EG        | Neither course names them                                                                                                                  |

## Engineering: classical and mechanical

| Course                  | Missing                                                                                 | Raised by | Why, and where it sits now                                                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| mechanics-of-materials  | Stress transformation and Mohr's circle; combined loading; thin-walled pressure vessels | ME        | A chapter each in every Mechanics of Materials text; problem types under `#0` now. A seventh topic "Stress transformation and combined loading" |
| materials-science       | Fracture; creep; composites (rule of mixtures)                                          | ME        | Taught in materials courses; fracture is a problem type of `#3`; composites are `aerospace-structures#1` for aerospace                          |
| numerical-methods       | Eigenvalue methods; finite differences for PDEs                                         | ME        | Courses often end with them                                                                                                                     |
| finite-element-analysis | 2-D elements (CST, Q4, isoparametric quads)                                             | ME        | Named in "Truss, beam and 2D elements" but too big for one page; a topic, or an explore page                                                    |
| thermodynamics          | Gas mixtures and psychrometrics                                                         | ME        | In most thermodynamics courses (compressible flow is owned by `compressible-flow`)                                                              |
| fluid-mechanics         | Turbomachinery (pump curves, specific speed, cavitation)                                | ME        | Taught in fluid mechanics; only pump power here (see also hydraulics-hydrology below)                                                           |
| heat-transfer           | Transient conduction beyond lumped (1-D charts, finite differences); mass transfer      | ME        | Conduction is lumped only; mass transfer is `transport-phenomena#2` for chemical only                                                           |
| manufacturing           | Welding and joining                                                                     | ME        | Taught in manufacturing processes; only a sort card here                                                                                        |

## Engineering: aerospace, civil and chemical

| Course                         | Missing                                                                                        | Raised by | Why, and where it sits now                                                                                                                |
| ------------------------------ | ---------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| structural-analysis            | Deflections (virtual work, conjugate beam, double integration)                                 | ACC       | Every text teaches it before the force method, and `#2` leans on it. Add "Deflections" between determinate and indeterminate structures   |
| compressible-flow              | Fanno and Rayleigh flow (duct friction, heat addition)                                         | ACC       | Standard after shocks; a topic, or fold into "Nozzle flow"                                                                                |
| propulsion                     | Electric propulsion                                                                            | ACC       | No topic                                                                                                                                  |
| soil-mechanics                 | Permeability and seepage (Darcy, flow nets); lateral earth pressure (Rankine, retaining walls) | ACC       | Both core and on the FE Civil specification (Darcy is `hydrology#2` for earth science)                                                    |
| hydraulics-hydrology           | Pumps (system curve, NPSH); culverts                                                           | ACC       | No topic; pairs with mechanical's turbomachinery gap                                                                                      |
| reaction-engineering           | Nonisothermal reactors (energy balance, adiabatic temperature rise)                            | ACC       | Standard chapter                                                                                                                          |
| transportation (prerequisites) | Statics as a prerequisite                                                                      | ACC       | Listed with Calculus I only; geometric and pavement topics assume Statics. (`surveying` listing a Grade 10 skill is right for its level.) |

## Top ten, by how much they matter

1. **structural-analysis: Deflections** — every text, and an existing topic leans on it.
2. **soil-mechanics: Permeability and seepage; lateral earth pressure** — core, on FE Civil.
3. **mechanics-of-materials: Stress transformation, combined loading, pressure vessels** — a
   chapter each in every text.
4. **Engineering economics** (course or topic) — FE Civil and Mechanical; raised by two plans.
5. **university-1/-2: Gravitation and fluids; heat and kinetic theory** — whole chapters of the
   intro sequence with no topic.
6. **gen-chem-1/-2: Intermolecular forces, solutions and colligative properties, solubility
   equilibria** — standard general chemistry chapters.
7. **calc-1/-2: Mean value theorem and curve sketching, L'Hôpital, Newton's method; numerical
   integration** — in every calculus sequence.
8. **quantum: The hydrogen atom** — the core of the course's standard text.
9. **Soils (physical geography) and structural geology** — in every physical geography and
   geology text.
10. **compressible-flow: Fanno and Rayleigh flow; reaction-engineering: nonisothermal
    reactors** — the standard next chapters of each course.
