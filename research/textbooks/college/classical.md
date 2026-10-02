# College crosswalk: Classical engineering mechanics (statics, dynamics, mechanics of materials, materials science, programming, CAD, numerical methods, advanced solids, FEA)

Generated from `research/textbooks/toc/college/*.json` and `research/questions/college/*.jsonl` (research group R3, 2026-10-02). Reference only: nothing here goes into a lesson, a picture or a test (`research/README.md`). For each topic: the chapter or section of each book that teaches it (in the book's own order), the worked-example kinds and number sizes recorded for that unit, and the question records filed under it. Titles-only books show titles; open books also show example kinds.

## `he.engineering.statics`

### `he.engineering.statics#0` Force vectors and equilibrium

| Book                                                                               | Unit                                             | Example kinds                                                                                                      | Ranges                  |
| ---------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| Engineering Statics: Open and Interactive                                          | 1 Introduction to Statics                        | —                                                                                                                  | —                       |
| Engineering Statics: Open and Interactive                                          | 2 Forces and Other Vectors                       | components from magnitude and angle; resultant of three forces by components; unit vectors, dot and cross products | forces 10–1,000 N or lb |
| Engineering Statics: Open and Interactive                                          | 3 Equilibrium of Particles                       | two-cable tensions; ring held by ropes with slopes; smooth cylinder in a trough; 3-D cable systems                 | loads 10–5,000 N        |
| Engineering Statics: Open and Interactive                                          | 4 Moments and Static Equivalence                 | moment by r × F and by Varignon; moment of a couple; equivalent force–couple system                                | —                       |
| Engineering Statics: Open and Interactive                                          | 5 Rigid Body Equilibrium                         | pin-and-roller reactions; cantilever reactions; three-force bodies; car on a slope                                 | —                       |
| Strength of Materials                                                              | 1 Statics Review                                 | —                                                                                                                  | —                       |
| Mechanics Map                                                                      | 1 Basics of Newtonian Mechanics                  | —                                                                                                                  | —                       |
| Mechanics Map                                                                      | 2 Static Equilibrium in Concurrent Force Systems | normal forces on a barrel in a handcart; two-cable and three-cable systems                                         | —                       |
| Mechanics Map                                                                      | 3 Static Equilibrium in Rigid Body Systems       | moment by scalar, Varignon and vector methods; moment about an axis; 2-D and 3-D rigid-body reactions              | —                       |
| Mechanics Map                                                                      | 4 Statically Equivalent Systems                  | equivalent force–couple systems; equivalent point load of a distributed force                                      | —                       |
| NCEES FE Civil CBT exam specifications                                             | 4 Statics                                        | —                                                                                                                  | —                       |
| NCEES FE Mechanical CBT exam specifications                                        | 6 Statics                                        | —                                                                                                                  | —                       |
| NCEES FE Other Disciplines CBT exam specifications                                 | 8 Statics                                        | —                                                                                                                  | —                       |
| Introductory Dynamics: 2D Kinematics and Kinetics of Point Masses and Rigid Bodies | 3 Vectors and Coordinates                        | —                                                                                                                  | —                       |

Questions: **80** filed here (Engineering Statics: Open and Interactive 50, Mechanics Map 30).
Question kinds seen: free-body diagram of a block on a pulley; free-body diagram of a parked car; free-body diagram of a dragged pole; normal forces on a barrel in a tilted handcart; normal forces on a ball in a smooth corner; second cable tension and the mass from one tension; pull on a pulley cable to hold an engine; weight of one of two blocks on one cable from the cable angles.

### `he.engineering.statics#1` Trusses and frames

| Book                                               | Unit                                  | Example kinds                                                                               | Ranges      |
| -------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------- | ----------- |
| Engineering Statics: Open and Interactive          | 6 Equilibrium of Structures           | method of joints; method of sections (Howe, Pratt); zero-force members; A-frames and pliers | kN and kips |
| Mechanics Map                                      | 5 Engineering Structures              | method of joints and sections; frames and machines (shelf, can crusher, suspension)         | —           |
| NCEES FE Civil CBT exam specifications             | 4 Statics                             | —                                                                                           | —           |
| NCEES FE Mechanical CBT exam specifications        | 6 Statics                             | —                                                                                           | —           |
| NCEES FE Other Disciplines CBT exam specifications | 8 Statics                             | —                                                                                           | —           |
| Mechanics of Materials                             | 2 Simple Tensile and Shear Structures | truss forces and deflection; thin-walled vessels; torsion of shafts                         | —           |

Questions: **33** filed here (Engineering Statics: Open and Interactive 20, Mechanics Map 12, Mechanics of Materials 1).
Question kinds seen: all member forces of a gantry truss by joints; member forces of a truss hung from cables; member forces of a truss on a pin and a cable; member forces of a space truss; three member forces of a gantry truss by sections; compare member forces of two crane truss designs; K truss: two members by a cut through four; members by a hybrid of sections and joints.

### `he.engineering.statics#2` Centroids

| Book                                               | Unit                               | Example kinds                                                                                                    | Ranges |
| -------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------ |
| Engineering Statics: Open and Interactive          | 7 Centroids and Centers of Gravity | composite centroid by table; centroid by integration (vertical or horizontal strips); distributed-load reactions | —      |
| Strength of Materials                              | 8 Geometric Properties             | —                                                                                                                | —      |
| Mechanics Map                                      | 4 Statically Equivalent Systems    | equivalent force–couple systems; equivalent point load of a distributed force                                    | —      |
| NCEES FE Civil CBT exam specifications             | 4 Statics                          | —                                                                                                                | —      |
| NCEES FE Mechanical CBT exam specifications        | 6 Statics                          | —                                                                                                                | —      |
| NCEES FE Other Disciplines CBT exam specifications | 8 Statics                          | —                                                                                                                | —      |

Questions: **15** filed here (Engineering Statics: Open and Interactive 10, Mechanics Map 3, Mechanics of Materials 2).
Question kinds seen: equivalent point load of a distributed force by integration; equivalent point load by composite parts; support reactions for distributed loads; centroids of four areas; centroids of three basic shapes on a grid; centroid of a shape with a hole by a table; centroid of a polygon of rectangles and triangles added or cut; area and centroid of a differential strip.

### `he.engineering.statics#3` Moments of inertia

| Book                                               | Unit                   | Example kinds                                                                                                                             | Ranges |
| -------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Engineering Statics: Open and Interactive          | 10 Moments of Inertia  | I by the parallel-axis theorem; composite T, U and box sections; built-up steel sections from tables; polar moment and radius of gyration | —      |
| Strength of Materials                              | 8 Geometric Properties | —                                                                                                                                         | —      |
| NCEES FE Civil CBT exam specifications             | 4 Statics              | —                                                                                                                                         | —      |
| NCEES FE Mechanical CBT exam specifications        | 6 Statics              | —                                                                                                                                         | —      |
| NCEES FE Other Disciplines CBT exam specifications | 8 Statics              | —                                                                                                                                         | —      |

Questions: **15** filed here (Engineering Statics: Open and Interactive 13, DoITPoMS Teaching and Learning Packages 1, Mechanics of Materials 1).
Question kinds seen: which section shape gives the highest beam stiffness; centroidal moment of inertia of four areas; moment of inertia of a basic shape about x and y from the table; I of rectangles about their base by bh³/3; parallel-axis expression for a common shape; I of a rectangle and a triangle by the parallel-axis theorem; I and radius of gyration of semicircles and quarter circles; area, I and k of a composite of a triangle and rectangles.

### `he.engineering.statics#4` Friction

| Book                                               | Unit                                 | Example kinds                                                                                                                                                          | Ranges |
| -------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Engineering Statics: Open and Interactive          | 9 Friction                           | slip or tip; range of P on an incline; wedges, screws, belts, bearings and discs                                                                                       | —      |
| MIT OCW 2.007 Design and Manufacturing I           | 1 mit2_007s09_hw01                   | capstan: tension to raise and to lower a weight                                                                                                                        | —      |
| MIT OCW 2.007 Design and Manufacturing I           | 4 mit2_007s09_exam01a                | drum brake: braking torque from the cylinder force; isometric sketch from three views; name features of a part (rib, boss, fillet)                                     | —      |
| MIT OCW 2.007 Design and Manufacturing I           | 5 mit2_007s09_exam01b                | degrees of freedom of a mechanism; holding force of a rope wrapped once around a pipe; synthesize a four-bar for three positions; three-view drawing from an isometric | —      |
| Mechanics Map                                      | 6 Friction and Friction Applications | slip or tip; wedges, power screws, bearings, discs and belts                                                                                                           | —      |
| NCEES FE Civil CBT exam specifications             | 4 Statics                            | —                                                                                                                                                                      | —      |
| NCEES FE Mechanical CBT exam specifications        | 6 Statics                            | —                                                                                                                                                                      | —      |
| NCEES FE Other Disciplines CBT exam specifications | 8 Statics                            | —                                                                                                                                                                      | —      |

Questions: **21** filed here (Mechanics Map 11, Engineering Statics: Open and Interactive 7, MIT OCW 2.007 Design and Manufacturing I 3).
Question kinds seen: ladder against a wall: normals and friction; pull at an angle to keep a sled moving; force to start a box up a slope and whether it slides back; least friction coefficient to keep a wheelbarrow from sliding; steepest hill a car can climb with rear or front drive; least friction coefficient so a pushed fridge tips first; pull that tips a bookcase and the μ for sliding first; normal force on a log from a wedge with friction.

## `he.engineering.dynamics`

### `he.engineering.dynamics#0` Particle kinematics

| Book                                                                               | Unit                                   | Example kinds                                                                                                                                                                          | Ranges |
| ---------------------------------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| MIT OCW 2.003SC Engineering Dynamics                                               | 1 mit2_003scf11_pset1                  | does a spring–mass on an incline have a natural frequency that depends on the angle; kicked ball: horizontal speed at the top, height and range                                        | —      |
| MIT OCW 2.003SC Engineering Dynamics                                               | 2 mit2_003scf11_pset2                  | ball guided on a circle by a rotating arm (polar coordinates); normal and tangential acceleration of a box sliding on a parabola; velocity of a rotor-blade tip of a moving helicopter | —      |
| Mechanics Map                                                                      | 7 Particle Kinematics                  | constant acceleration; motion graphs; n–t and polar coordinates; dependent and relative motion                                                                                         | —      |
| NCEES FE Civil CBT exam specifications                                             | 5 Dynamics                             | —                                                                                                                                                                                      | —      |
| NCEES FE Mechanical CBT exam specifications                                        | 7 Dynamics, Kinematics, and Vibrations | —                                                                                                                                                                                      | —      |
| NCEES FE Other Disciplines CBT exam specifications                                 | 9 Dynamics                             | —                                                                                                                                                                                      | —      |
| Introductory Dynamics: 2D Kinematics and Kinetics of Point Masses and Rigid Bodies | 4 Introduction to Dynamics             | —                                                                                                                                                                                      | —      |
| Introductory Dynamics: 2D Kinematics and Kinetics of Point Masses and Rigid Bodies | 5 Kinematics of Point Masses           | —                                                                                                                                                                                      | —      |

Questions: **14** filed here (Mechanics Map 10, MIT OCW 2.003SC Engineering Dynamics 4).
Question kinds seen: time and distance at constant acceleration; deceleration needed to stop in a distance; v–t and s–t from a piecewise a–t graph, total distance; a–t and s–t from a piecewise v–t graph, total distance; where a projectile hits a slope; tangential acceleration and turn radius from an acceleration at an angle; radial and angular rates of a tracked rocket; load speed in a block-and-tackle.

### `he.engineering.dynamics#1` Kinetics of particles

| Book                                                                               | Unit                                   | Example kinds                                                                                        | Ranges |
| ---------------------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------ |
| MIT OCW 2.003SC Engineering Dynamics                                               | 7 mit2_003scf11_quiz1                  | acceleration of one of two connected carts; normal force on a skateboard at a point of a curved ramp | —      |
| Mechanics Map                                                                      | 8 Newton's Second Law for Particles    | —                                                                                                    | —      |
| NCEES FE Chemical CBT exam specifications                                          | 3 Engineering Sciences                 | —                                                                                                    | —      |
| NCEES FE Civil CBT exam specifications                                             | 5 Dynamics                             | —                                                                                                    | —      |
| NCEES FE Mechanical CBT exam specifications                                        | 7 Dynamics, Kinematics, and Vibrations | —                                                                                                    | —      |
| NCEES FE Other Disciplines CBT exam specifications                                 | 9 Dynamics                             | —                                                                                                    | —      |
| Introductory Dynamics: 2D Kinematics and Kinetics of Point Masses and Rigid Bodies | 6 Kinetics of Point Masses             | —                                                                                                    | —      |
| Introductory Dynamics: 2D Kinematics and Kinetics of Point Masses and Rigid Bodies | 14 Solution Strategy Dynamics          | —                                                                                                    | —      |

Questions: **6** filed here (Mechanics Map 4, MIT OCW 2.003SC Engineering Dynamics 2).
Question kinds seen: acceleration and distance of a box pulled at an angle with friction; range of a cannonball against a constant headwind; highest spin rate before a block on a turntable slips; tension and angular acceleration as a tether is reeled in; normal force on a skateboard at a point of a curved ramp; acceleration of one of two connected carts.

### `he.engineering.dynamics#2` Work–energy and impulse–momentum

| Book                                                                               | Unit                                   | Example kinds                                                                                                                                                    | Ranges |
| ---------------------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| MIT OCW 2.003SC Engineering Dynamics                                               | 3 mit2_003scf11_pset3                  | cart speeds after a girl leaps from one cart onto another; how far a free ramp moves as a crate slides down; speed of a towed mass from a winch force–time graph | —      |
| Mechanics Map                                                                      | 9 Work and Energy in Particles         | skid distance; power on an incline; bungee spring constant                                                                                                       | —      |
| Mechanics Map                                                                      | 10 Impulse and Momentum in Particles   | impulse from a force–time graph; restitution; 2-D collisions; steady-flow devices                                                                                | —      |
| NCEES FE Chemical CBT exam specifications                                          | 3 Engineering Sciences                 | —                                                                                                                                                                | —      |
| NCEES FE Civil CBT exam specifications                                             | 5 Dynamics                             | —                                                                                                                                                                | —      |
| NCEES FE Mechanical CBT exam specifications                                        | 7 Dynamics, Kinematics, and Vibrations | —                                                                                                                                                                | —      |
| NCEES FE Other Disciplines CBT exam specifications                                 | 9 Dynamics                             | —                                                                                                                                                                | —      |
| Introductory Dynamics: 2D Kinematics and Kinetics of Point Masses and Rigid Bodies | 7 Work and Energy                      | —                                                                                                                                                                | —      |
| Introductory Dynamics: 2D Kinematics and Kinetics of Point Masses and Rigid Bodies | 8 Impulse and Momentum                 | —                                                                                                                                                                | —      |

Questions: **13** filed here (Mechanics Map 10, MIT OCW 2.003SC Engineering Dynamics 3).
Question kinds seen: skid distance at a higher speed with the same friction; stopping distance against a barrier force profile; power to haul a car up an incline at constant speed; bungee: speed at the cord's slack length and the cord's k; truck lifting a box by a rope: distance, speed and work; speed of a bit from a force–time impulse graph; arrow lodges in an apple: how far the apple flies; speed and angle of a ball after an oblique bounce.

### `he.engineering.dynamics#3` Rigid-body dynamics

| Book                                                                               | Unit                                    | Example kinds                                                                                                                                                                                                                      | Ranges |
| ---------------------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| MIT OCW 2.003SC Engineering Dynamics                                               | 4 mit2_003scf11_pset4                   | equations of motion of two masses with springs and a dashpot; natural frequency of a pendulum with a torsional spring; spin rate of a mass on a string pulled through a hole; velocity of a rim point of a spool pulled by a cable | —      |
| MIT OCW 2.003SC Engineering Dynamics                                               | 5 mit2_003scf11_pset5                   | acceleration of welded cylinders unwound by a hanging string; wheel rolling down a hill: does it slip, and its acceleration                                                                                                        | —      |
| MIT OCW 2.003SC Engineering Dynamics                                               | 6 mit2_003scf11_pset6                   | particle sticks to a pivoted rod: swing after impact                                                                                                                                                                               | —      |
| Mechanics Map                                                                      | 11 Rigid Body Kinematics                | fixed-axis rotation; belt and gear trains; absolute and relative motion                                                                                                                                                            | —      |
| Mechanics Map                                                                      | 12 Newton's Second Law for Rigid Bodies | —                                                                                                                                                                                                                                  | —      |
| Mechanics Map                                                                      | 13 Work and Energy in Rigid Bodies      | —                                                                                                                                                                                                                                  | —      |
| Mechanics Map                                                                      | 14 Impulse and Momentum in Rigid Bodies | —                                                                                                                                                                                                                                  | —      |
| NCEES FE Civil CBT exam specifications                                             | 5 Dynamics                              | —                                                                                                                                                                                                                                  | —      |
| NCEES FE Mechanical CBT exam specifications                                        | 7 Dynamics, Kinematics, and Vibrations  | —                                                                                                                                                                                                                                  | —      |
| NCEES FE Other Disciplines CBT exam specifications                                 | 9 Dynamics                              | —                                                                                                                                                                                                                                  | —      |
| Introductory Dynamics: 2D Kinematics and Kinetics of Point Masses and Rigid Bodies | 9 Kinematics of Rigid Bodies            | —                                                                                                                                                                                                                                  | —      |
| Introductory Dynamics: 2D Kinematics and Kinetics of Point Masses and Rigid Bodies | 10 Kinetics of Rigid Bodies             | —                                                                                                                                                                                                                                  | —      |
| Introductory Dynamics: 2D Kinematics and Kinetics of Point Masses and Rigid Bodies | 11 Work and Energy of Rigid Bodies      | —                                                                                                                                                                                                                                  | —      |
| Introductory Dynamics: 2D Kinematics and Kinetics of Point Masses and Rigid Bodies | 12 Angular Impulse and Angular Momentum | —                                                                                                                                                                                                                                  | —      |

Questions: **19** filed here (Mechanics Map 14, MIT OCW 2.003SC Engineering Dynamics 5).
Question kinds seen: angular acceleration to reach a speed and the rim speed; output speed of a belt-driven pulley train; crank angular velocity and acceleration from the piston motion; trapdoor angular velocity and acceleration from a cylinder rate; velocity and acceleration of a two-link arm's tip; wheel normal forces of a braking SUV; thruster force for an angular acceleration of a ring; acceleration of a barrel rolling down a slope.

## `he.engineering.mechanics-of-materials`

### `he.engineering.mechanics-of-materials#0` Stress and strain

| Book                                               | Unit                                  | Example kinds                                                                                                 | Ranges |
| -------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------ |
| Strength of Materials                              | 2 Stress                              | —                                                                                                             | —      |
| Strength of Materials                              | 3 Strain                              | —                                                                                                             | —      |
| Strength of Materials                              | 4 Mechanical Properties of Materials  | —                                                                                                             | —      |
| Strength of Materials                              | 12 Stress Transformation              | —                                                                                                             | —      |
| Strength of Materials                              | 13 Thin-Walled Pressure Vessels       | —                                                                                                             | —      |
| NCEES FE Civil CBT exam specifications             | 6 Mechanics of Materials              | —                                                                                                             | —      |
| NCEES FE Mechanical CBT exam specifications        | 8 Mechanics of Materials              | —                                                                                                             | —      |
| NCEES FE Other Disciplines CBT exam specifications | 10 Strength of Materials              | —                                                                                                             | —      |
| Mechanics of Materials                             | 1 Tensile Response of Materials       | rod stress and elongation; true stress–strain and necking; rule of mixtures for composites; rubber elasticity | —      |
| Mechanics of Materials                             | 2 Simple Tensile and Shear Structures | truss forces and deflection; thin-walled vessels; torsion of shafts                                           | —      |

Questions: **11** filed here (Mechanics of Materials 8, DoITPoMS Teaching and Learning Packages 2, Problem Set for Strength of Materials 1).
Question kinds seen: stresses in thin-walled spherical and cylindrical vessels; which stress state differs (Mohr's circle); principal stress and its angle by Mohr's circle; stress and elongation of a loaded wire; hoop and axial stresses in a closed steel cylinder; safe pressure of the vessel with a factor of safety; contact pressure of a copper cylinder fitted inside a steel one; pressure to inflate a rubber balloon to a diameter.

### `he.engineering.mechanics-of-materials#1` Axial loading

| Book                                                        | Unit                                  | Example kinds                                                       | Ranges |
| ----------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------- | ------ |
| DoITPoMS Teaching and Learning Packages (materials science) | 17 Thermal Expansion                  | —                                                                   | —      |
| DoITPoMS Teaching and Learning Packages (materials science) | 18 Fibre Composites                   | —                                                                   | —      |
| Strength of Materials                                       | 5 Axial Loading                       | —                                                                   | —      |
| MIT OCW 2.002 Mechanics and Materials II                    | 5 practice_quiz1                      | thermal stresses in an aluminium–polycarbonate laminate             | —      |
| NCEES FE Civil CBT exam specifications                      | 6 Mechanics of Materials              | —                                                                   | —      |
| NCEES FE Mechanical CBT exam specifications                 | 8 Mechanics of Materials              | —                                                                   | —      |
| NCEES FE Other Disciplines CBT exam specifications          | 10 Strength of Materials              | —                                                                   | —      |
| Mechanics of Materials                                      | 2 Simple Tensile and Shear Structures | truss forces and deflection; thin-walled vessels; torsion of shafts | —      |

Questions: **8** filed here (Mechanics of Materials 5, DoITPoMS Teaching and Learning Packages 2, MIT OCW 2.002 Mechanics and Materials II 1).
Question kinds seen: what the two α's in the misfit strain of a bimetal mean; axial stiffness of a long-fibre composite (rule of mixtures); thermal stresses in an aluminium–polycarbonate laminate; stresses and deformations of two rods in series (nylon and steel); elongation of a long cable under a load and its own weight; elongation of a hanging rod under its weight and an end load; bolt and sleeve forces when the nut is tightened a turn; longitudinal and transverse stiffness of a glass-epoxy lamina.

### `he.engineering.mechanics-of-materials#2` Torsion

| Book                                                        | Unit                                  | Example kinds                                                       | Ranges |
| ----------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------- | ------ |
| DoITPoMS Teaching and Learning Packages (materials science) | 19 Beam Bending                       | —                                                                   | —      |
| Strength of Materials                                       | 6 Torsion                             | —                                                                   | —      |
| NCEES FE Civil CBT exam specifications                      | 6 Mechanics of Materials              | —                                                                   | —      |
| NCEES FE Mechanical CBT exam specifications                 | 8 Mechanics of Materials              | —                                                                   | —      |
| NCEES FE Other Disciplines CBT exam specifications          | 10 Strength of Materials              | —                                                                   | —      |
| Mechanics of Materials                                      | 2 Simple Tensile and Shear Structures | truss forces and deflection; thin-walled vessels; torsion of shafts | —      |

Questions: **7** filed here (Mechanics of Materials 6, DoITPoMS Teaching and Learning Packages 1).
Question kinds seen: shear modulus of a tube from a torque and twist; shear stress and torque in a twisted torsion bar; modulus of rupture from the failure torque; diameter of a shaft transmitting a power at a speed; power of a hollow shaft of the same material; rotation of the loaded end of two geared shafts; torque shared by a composite shaft (aluminium core, steel sleeve).

### `he.engineering.mechanics-of-materials#3` Bending and shear

| Book                                                        | Unit                      | Example kinds                                                                                                           | Ranges |
| ----------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------ |
| Engineering Statics: Open and Interactive                   | 8 Internal Forces         | internal forces at a point; V and M diagrams by section cuts, graphical and integration methods                         | —      |
| DoITPoMS Teaching and Learning Packages (materials science) | 19 Beam Bending           | —                                                                                                                       | —      |
| Strength of Materials                                       | 7 Beams                   | —                                                                                                                       | —      |
| Strength of Materials                                       | 9 Bending Loads           | —                                                                                                                       | —      |
| Strength of Materials                                       | 10 Shear Loading in Beams | —                                                                                                                       | —      |
| Strength of Materials                                       | 14 Combined Loads         | —                                                                                                                       | —      |
| NCEES FE Civil CBT exam specifications                      | 6 Mechanics of Materials  | —                                                                                                                       | —      |
| NCEES FE Mechanical CBT exam specifications                 | 8 Mechanics of Materials  | —                                                                                                                       | —      |
| NCEES FE Other Disciplines CBT exam specifications          | 10 Strength of Materials  | —                                                                                                                       | —      |
| Mechanics of Materials                                      | 4 Bending                 | V–M diagrams with singularity functions; bending and shear stresses; beam deflection by superposition; laminated plates | —      |

Questions: **19** filed here (Engineering Statics: Open and Interactive 11, Mechanics of Materials 5, Problem Set for Strength of Materials 2, DoITPoMS Teaching and Learning Packages 1).
Question kinds seen: how axial stress varies with distance from the neutral axis; compressive stress in a column carrying an eccentric load; maximum normal stress at the base of a leaning pole; shear and moment diagrams for eight beams; maximum bending stress in eight beams; maximum shear stress in the same beams; best height-to-width ratio of a beam cut from round stock; stresses in a T beam with a load.

### `he.engineering.mechanics-of-materials#4` Beam deflection

| Book                                               | Unit                                   | Example kinds                                                                                                           | Ranges |
| -------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------ |
| Strength of Materials                              | 11 Beam Deflection                     | —                                                                                                                       | —      |
| MIT OCW 2.002 Mechanics and Materials II           | 1 hw1                                  | tip deflection of a microcantilever under a surface load                                                                | —      |
| NCEES FE Civil CBT exam specifications             | 6 Mechanics of Materials               | —                                                                                                                       | —      |
| NCEES FE Mechanical CBT exam specifications        | 8 Mechanics of Materials               | —                                                                                                                       | —      |
| NCEES FE Other Disciplines CBT exam specifications | 10 Strength of Materials               | —                                                                                                                       | —      |
| Mechanics of Materials                             | 4 Bending                              | V–M diagrams with singularity functions; bending and shear stresses; beam deflection by superposition; laminated plates | —      |
| Structural Mechanics                               | 4 Solution Method for Beam Deflections | —                                                                                                                       | —      |

Questions: **3** filed here (Mechanics of Materials 2, MIT OCW 2.002 Mechanics and Materials II 1).
Question kinds seen: tip deflection of a microcantilever under a surface load; slope and deflection curves of eight beams; deflection curves by superposition.

### `he.engineering.mechanics-of-materials#5` Column buckling

| Book                                               | Unit                                | Example kinds                                                                                                           | Ranges |
| -------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------ |
| Strength of Materials                              | 15 Columns                          | —                                                                                                                       | —      |
| NCEES FE Civil CBT exam specifications             | 6 Mechanics of Materials            | —                                                                                                                       | —      |
| NCEES FE Mechanical CBT exam specifications        | 8 Mechanics of Materials            | —                                                                                                                       | —      |
| NCEES FE Other Disciplines CBT exam specifications | 10 Strength of Materials            | —                                                                                                                       | —      |
| Mechanics of Materials                             | 4 Bending                           | V–M diagrams with singularity functions; bending and shear stresses; beam deflection by superposition; laminated plates | —      |
| Structural Mechanics                               | 8 Stability of Elastic Structures   | —                                                                                                                       | —      |
| Structural Mechanics                               | 9 Advanced Topic in Column Buckling | —                                                                                                                       | —      |

Questions: **2** filed here (Mechanics of Materials 2).
Question kinds seen: critical buckling load of a steel column; diameter at which a column buckles before it yields.

## `he.engineering.materials-science`

### `he.engineering.materials-science#0` Crystal structures

| Book                                                        | Unit                                  | Example kinds                           | Ranges |
| ----------------------------------------------------------- | ------------------------------------- | --------------------------------------- | ------ |
| DoITPoMS Teaching and Learning Packages (materials science) | 1 Atomic Scale Structure of Materials | —                                       | —      |
| DoITPoMS Teaching and Learning Packages (materials science) | 2 Crystallography                     | —                                       | —      |
| DoITPoMS Teaching and Learning Packages (materials science) | 3 Miller Indices                      | —                                       | —      |
| MIT OCW 2.002 Mechanics and Materials II                    | 2 hw2                                 | density of a crystal from its unit cell | —      |
| NCEES FE Chemical CBT exam specifications                   | 4 Materials Science                   | —                                       | —      |
| NCEES FE Civil CBT exam specifications                      | 7 Materials                           | —                                       | —      |
| NCEES FE Electrical and Computer CBT exam specifications    | 5 Properties of Electrical Materials  | —                                       | —      |
| NCEES FE Mechanical CBT exam specifications                 | 9 Material Properties and Processing  | —                                       | —      |
| NCEES FE Other Disciplines CBT exam specifications          | 11 Materials                          | —                                       | —      |

Questions: **7** filed here (DoITPoMS Teaching and Learning Packages 6, MIT OCW 2.002 Mechanics and Materials II 1).
Question kinds seen: how many Bravais lattices there are; packing efficiency of diamond with hard-sphere atoms; does a direction lie in a plane; which <110> directions lie in a (112) plane; common direction of two planes; which planes are close packed in an FCC metal; density of a crystal from its unit cell.

### `he.engineering.materials-science#1` Defects and diffusion

| Book                                                        | Unit                                  | Example kinds                                                                                                | Ranges |
| ----------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------ |
| DoITPoMS Teaching and Learning Packages (materials science) | 1 Atomic Scale Structure of Materials | —                                                                                                            | —      |
| DoITPoMS Teaching and Learning Packages (materials science) | 4 Diffusion                           | —                                                                                                            | —      |
| DoITPoMS Teaching and Learning Packages (materials science) | 5 Introduction to Dislocations        | —                                                                                                            | —      |
| MIT OCW 3.032 Mechanical Behavior of Materials              | 3 ps6_07                              | creep activation energy from rates at two temperatures; why hardness is about three times the yield strength | —      |
| NCEES FE Chemical CBT exam specifications                   | 4 Materials Science                   | —                                                                                                            | —      |
| NCEES FE Civil CBT exam specifications                      | 7 Materials                           | —                                                                                                            | —      |
| NCEES FE Electrical and Computer CBT exam specifications    | 5 Properties of Electrical Materials  | —                                                                                                            | —      |
| NCEES FE Mechanical CBT exam specifications                 | 9 Material Properties and Processing  | —                                                                                                            | —      |
| NCEES FE Other Disciplines CBT exam specifications          | 11 Materials                          | —                                                                                                            | —      |

Questions: **9** filed here (DoITPoMS Teaching and Learning Packages 8, MIT OCW 3.032 Mechanical Behavior of Materials 1).
Question kinds seen: what flux is proportional to in Fick's first law; which diffusion mechanism is not observed; which equation is Fick's second law; how diffusivity changes with temperature; volume fraction in grain boundaries for cubic grains; units of dislocation density; energy per unit length of a dislocation from G and b; edge, screw or mixed from line and Burgers vector.

### `he.engineering.materials-science#2` Phase diagrams

| Book                                                        | Unit                                   | Example kinds                                       | Ranges |
| ----------------------------------------------------------- | -------------------------------------- | --------------------------------------------------- | ------ |
| DoITPoMS Teaching and Learning Packages (materials science) | 6 Solid Solutions                      | —                                                   | —      |
| DoITPoMS Teaching and Learning Packages (materials science) | 7 Phase Diagrams and Solidification    | —                                                   | —      |
| DoITPoMS Teaching and Learning Packages (materials science) | 8 Solidification of Alloys             | —                                                   | —      |
| DoITPoMS Teaching and Learning Packages (materials science) | 9 Steel (making and life-cycle energy) | —                                                   | —      |
| DoITPoMS Teaching and Learning Packages (materials science) | 10 The Jominy End Quench Test          | —                                                   | —      |
| NCEES FE Chemical CBT exam specifications                   | 4 Materials Science                    | —                                                   | —      |
| NCEES FE Civil CBT exam specifications                      | 7 Materials                            | —                                                   | —      |
| NCEES FE Electrical and Computer CBT exam specifications    | 5 Properties of Electrical Materials   | —                                                   | —      |
| NCEES FE Mechanical CBT exam specifications                 | 9 Material Properties and Processing   | —                                                   | —      |
| NCEES FE Other Disciplines CBT exam specifications          | 11 Materials                           | —                                                   | —      |
| Manufacturing Processes 4-5                                 | 6 Heat Treating                        | hardening and tempering; Rockwell and Brinell tests | —      |

Questions: **8** filed here (DoITPoMS Teaching and Learning Packages 8).
Question kinds seen: structure of slowly cooled pure aluminium after a long time; what a hypoeutectic alloy is; composition of the solid in equilibrium with the liquid at a temperature; weight fraction of a compound at the eutectic temperature by the lever rule; fractions of primary β and eutectic in an alloy; which regions of the Fe–C diagram are solid solutions; when eutectic solid forms while a hypoeutectic alloy solidifies; partition coefficient and liquidus slope from a phase diagram.

### `he.engineering.materials-science#3` Mechanical properties

| Book                                                        | Unit                                            | Example kinds                                                                                                  | Ranges |
| ----------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------ |
| DoITPoMS Teaching and Learning Packages (materials science) | 11 Mechanical Properties                        | —                                                                                                              | —      |
| DoITPoMS Teaching and Learning Packages (materials science) | 12 Mechanical Testing of Metals                 | —                                                                                                              | —      |
| DoITPoMS Teaching and Learning Packages (materials science) | 13 Slip in Single Crystals                      | —                                                                                                              | —      |
| DoITPoMS Teaching and Learning Packages (materials science) | 14 Work Hardening                               | —                                                                                                              | —      |
| DoITPoMS Teaching and Learning Packages (materials science) | 15 Brittle Fracture                             | —                                                                                                              | —      |
| DoITPoMS Teaching and Learning Packages (materials science) | 16 Creep Deformation of Metals                  | —                                                                                                              | —      |
| DoITPoMS Teaching and Learning Packages (materials science) | 20 Mechanics of Cellular Materials (honeycombs) | —                                                                                                              | —      |
| Strength of Materials                                       | 4 Mechanical Properties of Materials            | —                                                                                                              | —      |
| MIT OCW 2.002 Mechanics and Materials II                    | 6 practice_quiz2                                | fatigue crack growth and final fracture of a part                                                              | —      |
| MIT OCW 3.032 Mechanical Behavior of Materials              | 3 ps6_07                                        | creep activation energy from rates at two temperatures; why hardness is about three times the yield strength   | —      |
| MIT OCW 3.032 Mechanical Behavior of Materials              | 4 ps7_07                                        | life of a spring from a fatigue fracture surface; plastic-zone size at a crack tip in several materials        | —      |
| MIT OCW 3.35 Fracture and Fatigue                           | 1 ps3                                           | toughness from a critical crack-tip opening displacement and the J-integral                                    | —      |
| NCEES FE Chemical CBT exam specifications                   | 4 Materials Science                             | —                                                                                                              | —      |
| NCEES FE Civil CBT exam specifications                      | 7 Materials                                     | —                                                                                                              | —      |
| NCEES FE Electrical and Computer CBT exam specifications    | 5 Properties of Electrical Materials            | —                                                                                                              | —      |
| NCEES FE Mechanical CBT exam specifications                 | 9 Material Properties and Processing            | —                                                                                                              | —      |
| NCEES FE Other Disciplines CBT exam specifications          | 11 Materials                                    | —                                                                                                              | —      |
| Mechanics of Materials                                      | 1 Tensile Response of Materials                 | rod stress and elongation; true stress–strain and necking; rule of mixtures for composites; rubber elasticity  | —      |
| Mechanics of Materials                                      | 6 Yield and Fracture                            | von Mises and Tresca checks; dislocation basis of yield; Weibull strength; fracture toughness; S–N and Goodman | —      |
| Manufacturing Processes 4-5                                 | 6 Heat Treating                                 | hardening and tempering; Rockwell and Brinell tests                                                            | —      |

Questions: **24** filed here (DoITPoMS Teaching and Learning Packages 13, Mechanics of Materials 7, MIT OCW 3.032 Mechanical Behavior of Materials 2, MIT OCW 3.35 Fracture and Fatigue 1, MIT OCW 2.002 Mechanics and Materials II 1).
Question kinds seen: primary slip system for a tensile axis in an FCC crystal; Schmid factor of the primary slip system; yield stress of a polycrystal from the critical resolved shear stress; ratio of Frank–Read source stresses for two dislocation densities; Young's modulus from the elastic line of a test; true against nominal stress and strain; statements about tensile testing of metals; statements about hardness testing.

## `he.engineering.engineering-programming`

### `he.engineering.engineering-programming#0` Variables, arrays and control flow

| Book                                                                      | Unit                                      | Example kinds                                                                                                                                                                                                                             | Ranges |
| ------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| MIT OCW 2.086 Numerical Computation for Mechanical Engineers              | 1 mit2_086f14_assignment_1                | area of a surface of revolution from radius data; build a row array of the first N terms; build the array of terms up to a limit with a while loop; finite-difference derivative of tabulated data; index of the interval holding a point | —      |
| MIT OCW 6.0001 Introduction to Computer Science and Programming in Python | 2 for-loops                               | sum built by a for loop over a range with a step                                                                                                                                                                                          | —      |
| MIT OCW 6.0001 Introduction to Computer Science and Programming in Python | 3 while-loops                             | trace a while loop over user input                                                                                                                                                                                                        | —      |
| MIT OCW 6.0001 Introduction to Computer Science and Programming in Python | 4 for-loops-with-strings                  | compare two strings character by character in a loop                                                                                                                                                                                      | —      |
| NCEES FE Electrical and Computer CBT exam specifications                  | 17 Software Engineering                   | —                                                                                                                                                                                                                                         | —      |
| Math, Numerics, and Programming (for Mechanical Engineers)                | 1 Motivation                              | —                                                                                                                                                                                                                                         | —      |
| Math, Numerics, and Programming (for Mechanical Engineers)                | 4 Elements of a Program and Matlab Basics | —                                                                                                                                                                                                                                         | —      |

Questions: **8** filed here (MIT OCW 2.086 Numerical Computation for Mechanical Engineers 5, MIT OCW 6.0001 Introduction to Computer Science and Programming in Python 3).
Question kinds seen: script for the Nth Fibonacci number with a loop; loop until a Fibonacci term passes a limit; sum of terms whose last digit is 0 or 1; sum of a geometric series by a loop; index of the interval holding a point; sum built by a for loop over a range with a step; trace a while loop over user input; compare two strings character by character in a loop.

### `he.engineering.engineering-programming#1` Vectorized computation

| Book                                                         | Unit                                                 | Example kinds                                                                                                                                                                                                                             | Ranges |
| ------------------------------------------------------------ | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| MIT OCW 2.086 Numerical Computation for Mechanical Engineers | 1 mit2_086f14_assignment_1                           | area of a surface of revolution from radius data; build a row array of the first N terms; build the array of terms up to a limit with a while loop; finite-difference derivative of tabulated data; index of the interval holding a point | —      |
| MIT OCW 2.086 Numerical Computation for Mechanical Engineers | 2 mit2_086f14_assignment_2                           | fraction of springs within a stiffness band by sampling; function returning a Monte Carlo area and its confidence interval; sequence of array operations on a 20 × 40 matrix                                                              | —      |
| NCEES FE Electrical and Computer CBT exam specifications     | 17 Software Engineering                              | —                                                                                                                                                                                                                                         | —      |
| Math, Numerics, and Programming (for Mechanical Engineers)   | 4 Elements of a Program and Matlab Basics            | —                                                                                                                                                                                                                                         | —      |
| Math, Numerics, and Programming (for Mechanical Engineers)   | 5 Matlab Arrays                                      | —                                                                                                                                                                                                                                         | —      |
| Math, Numerics, and Programming (for Mechanical Engineers)   | 16 Matrices and Vectors - Definitions and Operations | —                                                                                                                                                                                                                                         | —      |
| Math, Numerics, and Programming (for Mechanical Engineers)   | 18 Matlab Linear Algebra (Briefly)                   | —                                                                                                                                                                                                                                         | —      |
| Math, Numerics, and Programming (for Mechanical Engineers)   | 28 Sparse Matrices in Matlab                         | —                                                                                                                                                                                                                                         | —      |

Questions: **4** filed here (MIT OCW 2.086 Numerical Computation for Mechanical Engineers 4).
Question kinds seen: build the array of terms up to a limit with a while loop; build a row array of the first N terms; finite-difference derivative of tabulated data; sequence of array operations on a 20 × 40 matrix.

### `he.engineering.engineering-programming#2` Plotting and data import

| Book                                                         | Unit                       | Example kinds                                                                                                                                                                                                                             | Ranges |
| ------------------------------------------------------------ | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| MIT OCW 2.086 Numerical Computation for Mechanical Engineers | 1 mit2_086f14_assignment_1 | area of a surface of revolution from radius data; build a row array of the first N terms; build the array of terms up to a limit with a while loop; finite-difference derivative of tabulated data; index of the interval holding a point | —      |
| NCEES FE Electrical and Computer CBT exam specifications     | 17 Software Engineering    | —                                                                                                                                                                                                                                         | —      |

Questions: **1** filed here (MIT OCW 2.086 Numerical Computation for Mechanical Engineers 1).
Question kinds seen: plot four functions with set line styles.

### `he.engineering.engineering-programming#3` Scripting engineering calculations

| Book                                                                      | Unit                                           | Example kinds                                                                                                                                                                                                                             | Ranges |
| ------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| MIT OCW 2.086 Numerical Computation for Mechanical Engineers              | 1 mit2_086f14_assignment_1                     | area of a surface of revolution from radius data; build a row array of the first N terms; build the array of terms up to a limit with a while loop; finite-difference derivative of tabulated data; index of the interval holding a point | —      |
| MIT OCW 2.086 Numerical Computation for Mechanical Engineers              | 2 mit2_086f14_assignment_2                     | fraction of springs within a stiffness band by sampling; function returning a Monte Carlo area and its confidence interval; sequence of array operations on a 20 × 40 matrix                                                              | —      |
| MIT OCW 2.086 Numerical Computation for Mechanical Engineers              | 3 mit2_086f14_assignment_4                     | Euler solution of a lumped cooling ODE with a forcing term; falling ball with drag by an ODE solver; pass a function handle to another function                                                                                           | —      |
| MIT OCW 6.0001 Introduction to Computer Science and Programming in Python | 1 mit6_0001f16_ps1                             | months to save a down payment with a monthly return; saving rate by bisection search to reach a goal in 36 months; the same with a semi-annual raise                                                                                      | —      |
| MIT OCW 6.0001 Introduction to Computer Science and Programming in Python | 5 black-box-and-glass-box-testing              | glass-box test cases for a function with a bug                                                                                                                                                                                            | —      |
| NCEES FE Electrical and Computer CBT exam specifications                  | 17 Software Engineering                        | —                                                                                                                                                                                                                                         | —      |
| Math, Numerics, and Programming (for Mechanical Engineers)                | 6 Functions in Matlab                          | —                                                                                                                                                                                                                                         | —      |
| Math, Numerics, and Programming (for Mechanical Engineers)                | 11 Monte Carlo- Areas and Volumes              | —                                                                                                                                                                                                                                         | —      |
| Math, Numerics, and Programming (for Mechanical Engineers)                | 12 Monte Carlo- General Integration Procedures | —                                                                                                                                                                                                                                         | —      |

Questions: **7** filed here (MIT OCW 2.086 Numerical Computation for Mechanical Engineers 4, MIT OCW 6.0001 Introduction to Computer Science and Programming in Python 3).
Question kinds seen: area of a surface of revolution from radius data; fraction of springs within a stiffness band by sampling; function returning a Monte Carlo area and its confidence interval; pass a function handle to another function; months to save a down payment with a monthly return; the same with a semi-annual raise; glass-box test cases for a function with a bug.

## `he.engineering.cad-graphics`

### `he.engineering.cad-graphics#0` Orthographic and isometric projection

| Book                                      | Unit                                                              | Example kinds                                                                                                                                                          | Ranges |
| ----------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Fundamentals: Drawings and Specifications | 1 Describe the drafting tools and materials used in drawing plans | —                                                                                                                                                                      | —      |
| Fundamentals: Drawings and Specifications | 2 Describe lines lettering and dimensioning in drawings           | line types; size and location dimensions; sections                                                                                                                     | —      |
| Fundamentals: Drawings and Specifications | 4 Describe drawing projections                                    | isometric, oblique and perspective; plan and elevation views                                                                                                           | —      |
| Fundamentals: Drawings and Specifications | 7 Exercises                                                       | —                                                                                                                                                                      | —      |
| MIT OCW 2.007 Design and Manufacturing I  | 4 mit2_007s09_exam01a                                             | drum brake: braking torque from the cylinder force; isometric sketch from three views; name features of a part (rib, boss, fillet)                                     | —      |
| MIT OCW 2.007 Design and Manufacturing I  | 5 mit2_007s09_exam01b                                             | degrees of freedom of a mechanism; holding force of a rope wrapped once around a pipe; synthesize a four-bar for three positions; three-view drawing from an isometric | —      |

Questions: **9** filed here (Fundamentals: Drawings and Specifications 7, MIT OCW 2.007 Design and Manufacturing I 2).
Question kinds seen: isometric sketch from three views; three-view drawing from an isometric; which line type is darkest and thickest; name the line of alternating long and short dashes; how alternate positions of moving parts are drawn; what the arrows on a cutting-plane line mean; angle of receding lines in an isometric drawing; common name for the top view.

### `he.engineering.cad-graphics#1` Dimensioning and GD&T basics

| Book                                           | Unit                                                    | Example kinds                                                                                                                                                                                                                                | Ranges |
| ---------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Introduction to Drafting and Autodesk Inventor | 4 Part 4                                                | —                                                                                                                                                                                                                                            | —      |
| Fundamentals: Drawings and Specifications      | 2 Describe lines lettering and dimensioning in drawings | line types; size and location dimensions; sections                                                                                                                                                                                           | —      |
| MIT OCW 2.007 Design and Manufacturing I       | 6 mit2_007s09_exam02a                                   | centre distance and speed of two catalogue gears; conjugate action and the involute profile; hydraulic cylinder: stresses and factor of safety; match gear and spring types to pictures; three-view drawing with dimensions on the best view | —      |
| NCEES FE Mechanical CBT exam specifications    | 14 Mechanical Design and Analysis                       | —                                                                                                                                                                                                                                            | —      |

Questions: **2** filed here (MIT OCW 2.007 Design and Manufacturing I 1, Fundamentals: Drawings and Specifications 1).
Question kinds seen: three-view drawing with dimensions on the best view; should every dimension appear in every view.

### `he.engineering.cad-graphics#2` Parametric solid modeling

| Book                                           | Unit                  | Example kinds                                                                                                                                                                          | Ranges |
| ---------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Introduction to Drafting and Autodesk Inventor | 1 Part 1              | —                                                                                                                                                                                      | —      |
| Introduction to Drafting and Autodesk Inventor | 2 Part 2              | —                                                                                                                                                                                      | —      |
| Introduction to Drafting and Autodesk Inventor | 3 Part 3              | —                                                                                                                                                                                      | —      |
| Introduction to Drafting and Autodesk Inventor | 4 Part 4              | —                                                                                                                                                                                      | —      |
| MIT OCW 2.007 Design and Manufacturing I       | 2 mit2_007s09_hw02    | assembly with concentric and coincident mates; gear ratio for servos to climb a ramp; parametric solid model of a car chassis and wheels; window-glass linkage: links, pins and motion | —      |
| MIT OCW 2.007 Design and Manufacturing I       | 4 mit2_007s09_exam01a | drum brake: braking torque from the cylinder force; isometric sketch from three views; name features of a part (rib, boss, fillet)                                                     | —      |

Questions: **7** filed here (Introduction to Drafting and Autodesk Inventor 5, MIT OCW 2.007 Design and Manufacturing I 2).
Question kinds seen: parametric solid model of a car chassis and wheels; name features of a part (rib, boss, fillet); when to add fillets and chamfers in the build order; which two commands make a solid from a sketch; constraint that makes circles the same size; name for applying geometric relations in a sketch; what a consumed sketch is.

### `he.engineering.cad-graphics#3` Assemblies and drawings

| Book                                           | Unit                                                            | Example kinds                                                                                                                                                                                                   | Ranges |
| ---------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Introduction to Drafting and Autodesk Inventor | 5 Part 5                                                        | —                                                                                                                                                                                                               | —      |
| Fundamentals: Drawings and Specifications      | 3 Use scale rulers to determine actual dimensions from drawings | reading a scale ruler; length at a drawing scale                                                                                                                                                                | —      |
| Fundamentals: Drawings and Specifications      | 5 Interpret mechanical drawings                                 | title block, specifications, bill of materials                                                                                                                                                                  | —      |
| Fundamentals: Drawings and Specifications      | 6 Creating drawings and sketches                                | —                                                                                                                                                                                                               | —      |
| MIT OCW 2.007 Design and Manufacturing I       | 2 mit2_007s09_hw02                                              | assembly with concentric and coincident mates; gear ratio for servos to climb a ramp; parametric solid model of a car chassis and wheels; window-glass linkage: links, pins and motion                          | —      |
| MIT OCW 2.007 Design and Manufacturing I       | 3 mit2_007s09_hw03                                              | energy to fill a bottle with compressed air and the work it gives back; engineering drawing of a part: three aligned views and dimensions; spur gears of a diametral pitch: pitch diameters and centre distance | —      |
| MIT OCW 2.007 Design and Manufacturing I       | 5 mit2_007s09_exam01b                                           | degrees of freedom of a mechanism; holding force of a rope wrapped once around a pipe; synthesize a four-bar for three positions; three-view drawing from an isometric                                          | —      |

Questions: **9** filed here (MIT OCW 2.007 Design and Manufacturing I 5, Fundamentals: Drawings and Specifications 4).
Question kinds seen: window-glass linkage: links, pins and motion; assembly with concentric and coincident mates; engineering drawing of a part: three aligned views and dimensions; synthesize a four-bar for three positions; degrees of freedom of a mechanism; length of a line at a ¼ in = 1 ft scale; best way to get exact dimensions from a drawing; where the scale of a drawing is found.

## `he.engineering.numerical-methods`

### `he.engineering.numerical-methods#0` Root finding

| Book                                                                      | Unit                         | Example kinds                                                                                                                                        | Ranges |
| ------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Holistic Numerical Methods                                                | 3 Nonlinear Equations        | bisection steps; Newton–Raphson step and relative error; secant step; false position                                                                 | —      |
| MIT OCW 2.086 Numerical Computation for Mechanical Engineers              | 4 mit2_086f14_assignment_5   | equilibrium of three masses on springs as Au = f; function that finds a root for a parameter                                                         | —      |
| MIT OCW 6.0001 Introduction to Computer Science and Programming in Python | 1 mit6_0001f16_ps1           | months to save a down payment with a monthly return; saving rate by bisection search to reach a goal in 36 months; the same with a semi-annual raise | —      |
| NCEES FE Chemical CBT exam specifications                                 | 1 Mathematics                | —                                                                                                                                                    | —      |
| NCEES FE Civil CBT exam specifications                                    | 1 Mathematics and Statistics | —                                                                                                                                                    | —      |
| NCEES FE Electrical and Computer CBT exam specifications                  | 1 Mathematics                | —                                                                                                                                                    | —      |
| NCEES FE Environmental CBT exam specifications                            | 1 Mathematics                | —                                                                                                                                                    | —      |
| NCEES FE Mechanical CBT exam specifications                               | 1 Mathematics                | —                                                                                                                                                    | —      |
| NCEES FE Other Disciplines CBT exam specifications                        | 1 Mathematics                | —                                                                                                                                                    | —      |
| Math, Numerics, and Programming (for Mechanical Engineers)                | 29 Newton Iteration          | —                                                                                                                                                    | —      |

Questions: **17** filed here (Holistic Numerical Methods 15, MIT OCW 2.086 Numerical Computation for Mechanical Engineers 1, MIT OCW 6.0001 Introduction to Computer Science and Programming in Python 1).
Question kinds seen: bracketing or open: which family a method is; root estimate after two bisection steps; formula for the approximate relative error of a bisection step; why bisection fails for a double root at zero; a good starting guess for a van der Waals volume; class of the false-position method; false-position and secant update formulas compared; false-position iterations to reach a stopping error.

### `he.engineering.numerical-methods#1` Solving linear systems

| Book                                                         | Unit                                          | Example kinds                                                                                                      | Ranges |
| ------------------------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------ |
| Holistic Numerical Methods                                   | 4 Simultaneous Linear Equations               | naive and pivoted Gaussian elimination with chopping; LU decomposition; Gauss–Seidel sweeps and diagonal dominance | —      |
| MIT OCW 2.086 Numerical Computation for Mechanical Engineers | 4 mit2_086f14_assignment_5                    | equilibrium of three masses on springs as Au = f; function that finds a root for a parameter                       | —      |
| NCEES FE Chemical CBT exam specifications                    | 1 Mathematics                                 | —                                                                                                                  | —      |
| NCEES FE Civil CBT exam specifications                       | 1 Mathematics and Statistics                  | —                                                                                                                  | —      |
| NCEES FE Electrical and Computer CBT exam specifications     | 1 Mathematics                                 | —                                                                                                                  | —      |
| NCEES FE Environmental CBT exam specifications               | 1 Mathematics                                 | —                                                                                                                  | —      |
| NCEES FE Mechanical CBT exam specifications                  | 1 Mathematics                                 | —                                                                                                                  | —      |
| NCEES FE Other Disciplines CBT exam specifications           | 1 Mathematics                                 | —                                                                                                                  | —      |
| Math, Numerics, and Programming (for Mechanical Engineers)   | 25 Linear Systems                             | —                                                                                                                  | —      |
| Math, Numerics, and Programming (for Mechanical Engineers)   | 26 Gaussian Elimination and Back Substitution | —                                                                                                                  | —      |
| Math, Numerics, and Programming (for Mechanical Engineers)   | 27 Gaussian Elimination - Sparse Matrices     | —                                                                                                                  | —      |

Questions: **14** filed here (Holistic Numerical Methods 13, MIT OCW 2.086 Numerical Computation for Mechanical Engineers 1).
Question kinds seen: matrix shape after forward elimination; what division by zero in naive elimination means; naive elimination with four-digit chopping; elimination with partial pivoting and four-digit chopping; a coefficient after forward elimination of a 3 × 3 system; quadratic coefficients through three rocket-velocity points by elimination; definition of diagonal dominance; values after three Gauss–Seidel sweeps.

### `he.engineering.numerical-methods#2` Interpolation and curve fitting

| Book                                                         | Unit                                  | Example kinds                                                                                                                                                                                                                             | Ranges                     |
| ------------------------------------------------------------ | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Holistic Numerical Methods                                   | 5 Interpolation                       | direct, Newton divided-difference and Lagrange interpolation; linear, quadratic and cubic splines                                                                                                                                         | rocket velocity t = 0–30 s |
| Holistic Numerical Methods                                   | 6 Regression                          | least-squares line and r²; exponential and power models by linearization                                                                                                                                                                  | —                          |
| MIT OCW 2.086 Numerical Computation for Mechanical Engineers | 1 mit2_086f14_assignment_1            | area of a surface of revolution from radius data; build a row array of the first N terms; build the array of terms up to a limit with a while loop; finite-difference derivative of tabulated data; index of the interval holding a point | —                          |
| MIT OCW 2.086 Numerical Computation for Mechanical Engineers | 5 mit2_086f14_assignment_3            | acceleration of a ball from noisy heights by a quadratic fit; calibrate an IR distance sensor by least squares                                                                                                                            | —                          |
| NCEES FE Chemical CBT exam specifications                    | 1 Mathematics                         | —                                                                                                                                                                                                                                         | —                          |
| NCEES FE Civil CBT exam specifications                       | 1 Mathematics and Statistics          | —                                                                                                                                                                                                                                         | —                          |
| NCEES FE Electrical and Computer CBT exam specifications     | 1 Mathematics                         | —                                                                                                                                                                                                                                         | —                          |
| NCEES FE Environmental CBT exam specifications               | 1 Mathematics                         | —                                                                                                                                                                                                                                         | —                          |
| NCEES FE Mechanical CBT exam specifications                  | 1 Mathematics                         | —                                                                                                                                                                                                                                         | —                          |
| NCEES FE Other Disciplines CBT exam specifications           | 1 Mathematics                         | —                                                                                                                                                                                                                                         | —                          |
| Math, Numerics, and Programming (for Mechanical Engineers)   | 2 Interpolation                       | —                                                                                                                                                                                                                                         | —                          |
| Math, Numerics, and Programming (for Mechanical Engineers)   | 17 Least Squares                      | —                                                                                                                                                                                                                                         | —                          |
| Math, Numerics, and Programming (for Mechanical Engineers)   | 19 Regression - Statistical Inference | —                                                                                                                                                                                                                                         | —                          |

Questions: **16** filed here (Holistic Numerical Methods 13, MIT OCW 2.086 Numerical Computation for Mechanical Engineers 3).
Question kinds seen: the linear Lagrange polynomial through two points; Lagrange weights at a point for three data; quadratic interpolation of velocity at a time; which three points to pick for quadratic interpolation; what is continuous at knots in cubic splines; a missing value from quadratic spline pieces; slope of a least-squares line; slope of a line through the origin y = a₁x.

### `he.engineering.numerical-methods#3` Numerical integration

| Book                                                         | Unit                         | Example kinds                                                                                                                                                                                                                             | Ranges |
| ------------------------------------------------------------ | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Holistic Numerical Methods                                   | 7 Integration                | trapezoid, Simpson 1/3 and 3/8; Romberg; Gauss quadrature; discrete data                                                                                                                                                                  | —      |
| MIT OCW 2.086 Numerical Computation for Mechanical Engineers | 1 mit2_086f14_assignment_1   | area of a surface of revolution from radius data; build a row array of the first N terms; build the array of terms up to a limit with a while loop; finite-difference derivative of tabulated data; index of the interval holding a point | —      |
| NCEES FE Chemical CBT exam specifications                    | 1 Mathematics                | —                                                                                                                                                                                                                                         | —      |
| NCEES FE Civil CBT exam specifications                       | 1 Mathematics and Statistics | —                                                                                                                                                                                                                                         | —      |
| NCEES FE Electrical and Computer CBT exam specifications     | 1 Mathematics                | —                                                                                                                                                                                                                                         | —      |
| NCEES FE Environmental CBT exam specifications               | 1 Mathematics                | —                                                                                                                                                                                                                                         | —      |
| NCEES FE Mechanical CBT exam specifications                  | 1 Mathematics                | —                                                                                                                                                                                                                                         | —      |
| NCEES FE Other Disciplines CBT exam specifications           | 1 Mathematics                | —                                                                                                                                                                                                                                         | —      |
| Math, Numerics, and Programming (for Mechanical Engineers)   | 3 Differentiation            | —                                                                                                                                                                                                                                         | —      |
| Math, Numerics, and Programming (for Mechanical Engineers)   | 7 Integration                | —                                                                                                                                                                                                                                         | —      |

Questions: **20** filed here (Holistic Numerical Methods 19, MIT OCW 2.086 Numerical Computation for Mechanical Engineers 1).
Question kinds seen: order of polynomials the trapezoid rule integrates exactly; one-segment trapezoid estimate of an integral; three-segment trapezoid estimate; distance by trapezoid for a piecewise velocity; area of a plot of land from boundary data; distance from tabulated velocity by the trapezoid rule; highest polynomial order Simpson's 1/3 rule integrates exactly; two-segment Simpson's 1/3 estimate.

### `he.engineering.numerical-methods#4` Numerical ODE solvers (Euler, Runge–Kutta)

| Book                                                         | Unit                              | Example kinds                                                                                                                                   | Ranges |
| ------------------------------------------------------------ | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Holistic Numerical Methods                                   | 8 Ordinary Differential Equations | Euler; Heun, midpoint, Ralston; RK4; shooting and finite differences for BVPs                                                                   | —      |
| MIT OCW 2.086 Numerical Computation for Mechanical Engineers | 3 mit2_086f14_assignment_4        | Euler solution of a lumped cooling ODE with a forcing term; falling ball with drag by an ODE solver; pass a function handle to another function | —      |
| MIT OCW 2.092 Finite Element Analysis of Solids and Fluids I | 5 mit2_092f09_hw7                 | fill-in during Gauss elimination of a four-node model; steps until central difference blows up just above the critical step                     | —      |
| NCEES FE Chemical CBT exam specifications                    | 1 Mathematics                     | —                                                                                                                                               | —      |
| NCEES FE Civil CBT exam specifications                       | 1 Mathematics and Statistics      | —                                                                                                                                               | —      |
| NCEES FE Electrical and Computer CBT exam specifications     | 1 Mathematics                     | —                                                                                                                                               | —      |
| NCEES FE Environmental CBT exam specifications               | 1 Mathematics                     | —                                                                                                                                               | —      |
| NCEES FE Mechanical CBT exam specifications                  | 1 Mathematics                     | —                                                                                                                                               | —      |
| NCEES FE Other Disciplines CBT exam specifications           | 1 Mathematics                     | —                                                                                                                                               | —      |
| Math, Numerics, and Programming (for Mechanical Engineers)   | 21 Initial Value Problems         | —                                                                                                                                               | —      |
| Math, Numerics, and Programming (for Mechanical Engineers)   | 22 Boundary Value Problems        | —                                                                                                                                               | —      |

Questions: **15** filed here (Holistic Numerical Methods 12, MIT OCW 2.086 Numerical Computation for Mechanical Engineers 2, MIT OCW 2.092 Finite Element Analysis of Solids and Fluids I 1).
Question kinds seen: y after Euler steps; slope after Euler steps; distance by Euler on a velocity function; time of death by Newton cooling and Euler steps; y after Heun steps; distance by Ralston's RK2 method; temperature of a cooling ball by RK2 (radiation); y after RK4 steps.

## `he.engineering.advanced-solid-mechanics`

### `he.engineering.advanced-solid-mechanics#0` Stress and strain tensors

| Book                                                        | Unit                                                          | Example kinds                                              | Ranges |
| ----------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------- | ------ |
| DoITPoMS Teaching and Learning Packages (materials science) | 21 Tensors                                                    | —                                                          | —      |
| MIT OCW 3.032 Mechanical Behavior of Materials              | 1 ps4_07                                                      | resolve a stress state onto axes along fibres              | —      |
| Mechanics of Materials                                      | 3 General Concepts of Stress and Strain                       | Mohr's circle; 3-D principal stresses; compliance matrices | —      |
| Structural Mechanics                                        | 1 The Concept of Strain                                       | —                                                          | —      |
| Structural Mechanics                                        | 2 The Concept of Stress, Generalized Stresses and Equilibrium | —                                                          | —      |

Questions: **11** filed here (Mechanics of Materials 5, DoITPoMS Teaching and Learning Packages 3, Problem Set for Strength of Materials 2, MIT OCW 3.032 Mechanical Behavior of Materials 1).
Question kinds seen: rotation matrix about an axis; pure shear is pure normal stress rotated by 45°; direction of zero conductivity of a crystal from its tensor; resolve a stress state onto axes along fibres; in-plane and absolute maximum shear from two principal stresses; σ_2 and absolute maximum shear from σ_1 and τ_max; principal stresses of a 3-D stress state; invariants and principal stresses of a full stress tensor.

### `he.engineering.advanced-solid-mechanics#1` Generalized Hooke's law

| Book                                     | Unit                                                                   | Example kinds                                                                                    | Ranges |
| ---------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------ |
| MIT OCW 2.002 Mechanics and Materials II | 3 hw3                                                                  | onset of yield in the layer by von Mises; stresses in a thin surface layer bonded to a substrate | —      |
| Mechanics of Materials                   | 3 General Concepts of Stress and Strain                                | Mohr's circle; 3-D principal stresses; compliance matrices                                       | —      |
| Structural Mechanics                     | 3 Development of Constitutive Equations of Continuum, Beams and Plates | —                                                                                                | —      |

Questions: **3** filed here (Mechanics of Materials 2, MIT OCW 2.002 Mechanics and Materials II 1).
Question kinds seen: stresses in a thin surface layer bonded to a substrate; compliance matrix and strains of polycarbonate under a stress state; show volume change is the trace of the strain tensor.

### `he.engineering.advanced-solid-mechanics#2` Energy methods

| Book                 | Unit                           | Example kinds | Ranges |
| -------------------- | ------------------------------ | ------------- | ------ |
| Structural Mechanics | 7 Energy Methods in Elasticity | —             | —      |

Questions: **2** filed here (Mechanics of Materials 2).
Question kinds seen: load-point deflection of each truss by geometry; load-point deflection of each truss by Castigliano.

### `he.engineering.advanced-solid-mechanics#3` Plasticity and failure criteria

| Book                                                        | Unit                                             | Example kinds                                                                                                                                                                              | Ranges |
| ----------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| DoITPoMS Teaching and Learning Packages (materials science) | 22 Metal Forming I (stress, strain, yield)       | —                                                                                                                                                                                          | —      |
| MIT OCW 2.002 Mechanics and Materials II                    | 3 hw3                                            | onset of yield in the layer by von Mises; stresses in a thin surface layer bonded to a substrate                                                                                           | —      |
| MIT OCW 2.002 Mechanics and Materials II                    | 4 hw4                                            | first-yield moment of a square section bent about its diagonal; limit-to-yield moment ratio (shape factor) of the diamond section; residual stresses after unloading from the limit moment | —      |
| MIT OCW 3.032 Mechanical Behavior of Materials              | 2 ps5_07                                         | pressure-dependent yield of a glassy polymer; show the von Mises forms (octahedral shear, J2) agree                                                                                        | —      |
| Mechanics of Materials                                      | 6 Yield and Fracture                             | von Mises and Tresca checks; dislocation basis of yield; Weibull strength; fracture toughness; S–N and Goodman                                                                             | —      |
| Structural Mechanics                                        | 11 Fundamental Concepts in Structural Plasticity | —                                                                                                                                                                                          | —      |

Questions: **9** filed here (MIT OCW 2.002 Mechanics and Materials II 4, MIT OCW 3.032 Mechanical Behavior of Materials 2, Mechanics of Materials 2, DoITPoMS Teaching and Learning Packages 1).
Question kinds seen: von Mises or Tresca: which fits the alloy's data; onset of yield in the layer by von Mises; first-yield moment of a square section bent about its diagonal; limit-to-yield moment ratio (shape factor) of the diamond section; residual stresses after unloading from the limit moment; pressure-dependent yield of a glassy polymer; show the von Mises forms (octahedral shear, J2) agree; torque to start yield and to make a shaft fully plastic.

### `he.engineering.advanced-solid-mechanics#4` Plates and shells

| Book                   | Unit                                                          | Example kinds                                                                                        | Ranges |
| ---------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------ |
| Mechanics of Materials | 5 General Stress Analysis                                     | thick-walled vessels (Lamé); strain-gauge rosettes; FEA of trusses and plane stress; viscoelasticity | —      |
| Structural Mechanics   | 2 The Concept of Stress, Generalized Stresses and Equilibrium | —                                                                                                    | —      |
| Structural Mechanics   | 5 Moderately Large Deflection Theory of Beams                 | —                                                                                                    | —      |
| Structural Mechanics   | 6 Bending Response of Plates and Optimum Design               | —                                                                                                    | —      |
| Structural Mechanics   | 10 Buckling of Plates and Sections                            | —                                                                                                    | —      |

Questions: **1** filed here (Mechanics of Materials 1).
Question kinds seen: stresses in a thick-walled vessel under internal pressure.

## `he.engineering.finite-element-analysis`

### `he.engineering.finite-element-analysis#0` Direct stiffness method

| Book                                                         | Unit                      | Example kinds                                                                                        | Ranges |
| ------------------------------------------------------------ | ------------------------- | ---------------------------------------------------------------------------------------------------- | ------ |
| MIT OCW 2.092 Finite Element Analysis of Solids and Fluids I | 1 mit2_092f09_hw1         | truss stiffness matrix with no supports: rigid-body modes                                            | —      |
| MIT OCW 2.092 Finite Element Analysis of Solids and Fluids I | 6 mit2_092f09_exam1       | interpolation functions of a 4-node plane-stress element; spinning rod modelled by two bar elements  | —      |
| Mechanics of Materials                                       | 5 General Stress Analysis | thick-walled vessels (Lamé); strain-gauge rosettes; FEA of trusses and plane stress; viscoelasticity | —      |

Questions: **4** filed here (MIT OCW 2.092 Finite Element Analysis of Solids and Fluids I 2, Mechanics of Materials 2).
Question kinds seen: truss stiffness matrix with no supports: rigid-body modes; spinning rod modelled by two bar elements; global stiffness matrices and solution for small trusses; global stiffness matrices and the solution for three trusses.

### `he.engineering.finite-element-analysis#1` Shape functions

| Book                                                         | Unit                     | Example kinds                                                                                       | Ranges |
| ------------------------------------------------------------ | ------------------------ | --------------------------------------------------------------------------------------------------- | ------ |
| DoITPoMS Teaching and Learning Packages (materials science)  | 27 Finite Element Method | —                                                                                                   | —      |
| MIT OCW 2.092 Finite Element Analysis of Solids and Fluids I | 6 mit2_092f09_exam1      | interpolation functions of a 4-node plane-stress element; spinning rod modelled by two bar elements | —      |

Questions: **6** filed here (DoITPoMS Teaching and Learning Packages 5, MIT OCW 2.092 Finite Element Analysis of Solids and Fluids I 1).
Question kinds seen: true statements about second-order elements; true statements about first-order elements; value at a point by three linear elements; value at a point by three quadratic elements; four linear elements: value and error against the exact function; interpolation functions of a 4-node plane-stress element.

### `he.engineering.finite-element-analysis#2` Truss, beam and 2D elements

| Book                                                         | Unit                      | Example kinds                                                                                        | Ranges |
| ------------------------------------------------------------ | ------------------------- | ---------------------------------------------------------------------------------------------------- | ------ |
| MIT OCW 2.092 Finite Element Analysis of Solids and Fluids I | 2 mit2_092f09_hw4         | linear truss analysis compared with the hand solution                                                | —      |
| MIT OCW 2.092 Finite Element Analysis of Solids and Fluids I | 3 mit2_092f09_hw5         | force–deflection curve of a snap-through toggle                                                      | —      |
| Mechanics of Materials                                       | 5 General Stress Analysis | thick-walled vessels (Lamé); strain-gauge rosettes; FEA of trusses and plane stress; viscoelasticity | —      |

Questions: **4** filed here (MIT OCW 2.092 Finite Element Analysis of Solids and Fluids I 2, Mechanics of Materials 2).
Question kinds seen: linear truss analysis compared with the hand solution; force–deflection curve of a snap-through toggle; load-point deflection and forces by finite elements; member forces of eight trusses by FEA.

### `he.engineering.finite-element-analysis#3` Meshing and convergence

| Book                                                         | Unit                     | Example kinds                                                                                                               | Ranges |
| ------------------------------------------------------------ | ------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------ |
| DoITPoMS Teaching and Learning Packages (materials science)  | 27 Finite Element Method | —                                                                                                                           | —      |
| MIT OCW 2.092 Finite Element Analysis of Solids and Fluids I | 4 mit2_092f09_hw6        | mesh convergence of a cantilever under pressure (9-node elements); temperature in a beam with four meshes                   | —      |
| MIT OCW 2.092 Finite Element Analysis of Solids and Fluids I | 5 mit2_092f09_hw7        | fill-in during Gauss elimination of a four-node model; steps until central difference blows up just above the critical step | —      |

Questions: **4** filed here (MIT OCW 2.092 Finite Element Analysis of Solids and Fluids I 3, DoITPoMS Teaching and Learning Packages 1).
Question kinds seen: what always reduces the finite-element error; mesh convergence of a cantilever under pressure (9-node elements); temperature in a beam with four meshes; fill-in during Gauss elimination of a four-node model.

### `he.engineering.finite-element-analysis#4` Interpreting FEA results

No unit of the books read maps here.

Questions: **2** filed here (Mechanics of Materials 2).
Question kinds seen: plane-stress FE solution of a cantilever compared with beam theory; axisymmetric FE solution for a thick vessel.

## Taught by the books, not in the taxonomy

- Mechanics Map, 16 Appendix 1 - Vector and Matrix Math: No college topic of this group fits (outside the earth and geography courses, or a taxonomy gap).
- Mechanics Map, 17 Appendix 2 - Moment Integrals: No college topic of this group fits (outside the earth and geography courses, or a taxonomy gap).
- Math, Numerics, and Programming (for Mechanical Engineers), 8 Introduction: Unit introduction.
- Math, Numerics, and Programming (for Mechanical Engineers), 9 Introduction to Random Variables: Probability: no topic in this group.
- Math, Numerics, and Programming (for Mechanical Engineers), 10 Statistical Estimation- the Normal Density: No college topic of this group fits (outside the earth and geography courses, or a taxonomy gap).
- Math, Numerics, and Programming (for Mechanical Engineers), 13 Statistical Estimation- the Normal Density: No college topic of this group fits (outside the earth and geography courses, or a taxonomy gap).
- Math, Numerics, and Programming (for Mechanical Engineers), 14 Monte Carlo- Failure Probabilities: No college topic of this group fits (outside the earth and geography courses, or a taxonomy gap).
- Math, Numerics, and Programming (for Mechanical Engineers), 15 Motivation: No college topic of this group fits (outside the earth and geography courses, or a taxonomy gap).
- Math, Numerics, and Programming (for Mechanical Engineers), 20 Motivation: No college topic of this group fits (outside the earth and geography courses, or a taxonomy gap).
- Math, Numerics, and Programming (for Mechanical Engineers), 23 Partial Differential Equations: PDEs: no topic in this group.
- Math, Numerics, and Programming (for Mechanical Engineers), 24 Motivation: No college topic of this group fits (outside the earth and geography courses, or a taxonomy gap).
- Mechanics of Materials, 7 Appendices: No college topic of this group fits (outside the earth and geography courses, or a taxonomy gap).
- Introductory Dynamics: 2D Kinematics and Kinetics of Point Masses and Rigid Bodies, 1 Preface: No college topic of this group fits (outside the earth and geography courses, or a taxonomy gap).
- Introductory Dynamics: 2D Kinematics and Kinetics of Point Masses and Rigid Bodies, 2 Notation Math and Engineering Basics: Notation, math and engineering basics (no dynamics topic).
