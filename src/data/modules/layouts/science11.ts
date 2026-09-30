/**
 * Grade 11 science layout pages (explore, sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../science/11.ts`. Data only: no UI code.
 */
import type { LayoutDef } from './types';

export const SCIENCE_11_LAYOUTS: LayoutDef[] = [
  // ── Forces and Newton's laws (HS-PS2-1) ──
  {
    kind: 'sort',
    id: 's.11.dynamics-vectors~balanced',
    title: 'Is the net force zero?',
    use: 'Use this for “A cork floats still on water. What force balances its weight?” and other questions about balanced forces.',
    assumptions: [
      'Zero net force means constant velocity, not zero speed: a steady speed in a straight line counts.',
      'Any change in speed or direction needs a net force, even at a steady speed round a curve.',
      'A floating cork is still, so the water’s upward push (the buoyant force) equals its weight.',
    ],
    question: 'Is the net force on it zero?',
    bins: [
      {
        id: 'zero',
        label: 'Net force zero',
        why: 'Its velocity doesn’t change: at rest, or moving steadily in a straight line.',
      },
      {
        id: 'net',
        label: 'Net force not zero',
        why: 'Its velocity changes: it speeds up, slows down or turns.',
      },
    ],
    cards: [
      { label: 'A cork floating still on a pond', bin: 'zero' },
      { label: 'A book resting on a desk', bin: 'zero' },
      { label: 'A car at a steady 25 m/s on a straight road', bin: 'zero' },
      { label: 'A skydiver falling at terminal speed', bin: 'zero' },
      { label: 'A crate speeding up as it is pushed', bin: 'net' },
      { label: 'A ball at the top of its flight', bin: 'net' },
      { label: 'A car turning a corner at a steady speed', bin: 'net' },
    ],
  },

  // ── Work, energy, power and simple machines (HS-PS3-1, HS-PS3-2) ──
  {
    kind: 'sequence',
    id: 's.11.work-energy-power~pogo-energy',
    title: 'Energy on a pogo stick',
    use: 'Use this for “Describe the energy changes as a person bounces on a pogo stick (or a trampoline).”',
    assumptions: [
      'Three stores trade energy: elastic in the squeezed spring, kinetic in the motion, gravitational in the height.',
      'Friction and air are ignored, so the total stays the same and every bounce reaches the same height.',
      'The spans are for a 1 m hop: rising 1 m takes √(2 × 1 ÷ 9.8) = 0.45 s.',
    ],
    question: 'Put one bounce in order, starting at the bottom.',
    stages: [
      { label: 'Spring squeezed at the bottom, at rest: all elastic', span: 0.1 },
      { label: 'Spring pushes up: elastic to kinetic', span: 0.1 },
      { label: 'Rising: kinetic to gravitational', span: 0.45 },
      { label: 'At the top, still for an instant: all gravitational', span: 0 },
      { label: 'Falling: gravitational to kinetic', span: 0.45 },
      { label: 'Landing squeezes the spring: kinetic to elastic', span: 0.1 },
    ],
    unit: 's',
    totalLabel: 'One bounce',
  },

  // ── Thermal energy and the laws of thermodynamics (HS-PS3-4) ──
  {
    kind: 'sort',
    id: 's.11.thermodynamics~laws',
    title: 'Which law of thermodynamics?',
    use: 'Use this for “Which law of thermodynamics explains this?”',
    assumptions: [
      'Zeroth law: two things each in balance with a third (a thermometer) are at the same temperature.',
      'First law: energy is kept. The heat in equals the rise in internal energy plus the work done.',
      'Second law: heat flows by itself only from hot to cold, and no engine turns all its heat into work.',
    ],
    question: 'Which law does it show?',
    bins: [
      {
        id: 'zeroth',
        label: 'Zeroth law',
        why: 'Things in contact end at one temperature, which is what a thermometer reads.',
      },
      {
        id: 'first',
        label: 'First law',
        why: 'Energy is kept: ΔU = Q − W.',
      },
      {
        id: 'second',
        label: 'Second law',
        why: 'Heat goes from hot to cold by itself; going the other way, or into work, has a cost.',
      },
    ],
    cards: [
      { label: 'A thermometer reads the cup once the two match', bin: 'zeroth' },
      { label: 'Two blocks touching end at one temperature', bin: 'zeroth' },
      { label: 'A heated gas pushes a piston out and warms less', bin: 'first' },
      { label: 'Squeezing a gas quickly warms it', bin: 'first' },
      { label: 'Heat flows on its own from a hot mug to cool air', bin: 'second' },
      { label: 'No engine turns all its heat into work', bin: 'second' },
      { label: 'A refrigerator needs work to move heat out', bin: 'second' },
    ],
  },

  // ── Waves and sound (HS-PS4-1) ──
  {
    kind: 'sort',
    id: 's.11.sound-waves~wave-types',
    title: 'Transverse or longitudinal?',
    use: 'Use this for “Is a sound wave transverse or longitudinal?”',
    assumptions: [
      'Transverse: the medium moves at right angles to the way the wave travels.',
      'Longitudinal: the medium moves back and forth along the way the wave travels, in squeezes and stretches.',
      'Light needs no medium: its electric and magnetic fields swing across its path.',
    ],
    question: 'Which way does the medium move?',
    bins: [
      {
        id: 'transverse',
        label: 'Transverse',
        why: 'The medium moves across the wave’s path: crests and troughs.',
      },
      {
        id: 'longitudinal',
        label: 'Longitudinal',
        why: 'The medium moves along the wave’s path: compressions and rarefactions.',
      },
    ],
    cards: [
      { label: 'Sound in air', bin: 'longitudinal' },
      { label: 'A plucked guitar string', bin: 'transverse' },
      { label: 'Light', bin: 'transverse' },
      { label: 'A spring toy pushed and pulled along its length', bin: 'longitudinal' },
      { label: 'Ultrasound in the body', bin: 'longitudinal' },
      { label: 'A rope shaken up and down', bin: 'transverse' },
      { label: 'P waves in rock', bin: 'longitudinal' },
      { label: 'S waves in rock', bin: 'transverse' },
    ],
  },

  // ── Light: reflection, refraction and interference (HS-PS4-1, HS-PS4-3) ──
  {
    kind: 'sort',
    id: 's.11.optics~wave-behaviors',
    title: 'Reflection, refraction, diffraction or interference?',
    use: 'Use this for “Light through two narrow slits makes bright and dark bands. Which wave behaviors explain it?”',
    assumptions: [
      'Reflection bounces a wave back; refraction bends it as it changes speed into a new medium.',
      'Diffraction spreads a wave round an edge or through a gap about as wide as its wavelength.',
      'Interference adds overlapping waves: bright or loud where they meet in step, dark or quiet where they cancel.',
    ],
    question: 'Which behavior does it show?',
    bins: [
      { id: 'reflection', label: 'Reflection', why: 'The wave bounces off a surface.' },
      { id: 'refraction', label: 'Refraction', why: 'The wave bends as its speed changes.' },
      {
        id: 'diffraction',
        label: 'Diffraction',
        why: 'The wave spreads round an edge or through a gap.',
      },
      {
        id: 'interference',
        label: 'Interference',
        why: 'Two waves overlap and add up or cancel.',
      },
    ],
    cards: [
      { label: 'Your image in a bathroom mirror', bin: 'reflection' },
      { label: 'An echo off a cliff', bin: 'reflection' },
      { label: 'A straw looks bent in a glass of water', bin: 'refraction' },
      { label: 'A mirage over a hot road', bin: 'refraction' },
      { label: 'Sound heard round a corner', bin: 'diffraction' },
      { label: 'Light spreading out past a narrow slit', bin: 'diffraction' },
      { label: 'Bright and dark bands from two slits', bin: 'interference' },
      { label: 'Colors on a soap film', bin: 'interference' },
    ],
  },

  // ── Static electricity (HS-PS2-4, HS-PS3-5) ──
  {
    kind: 'sort',
    id: 's.11.electrostatics~charging',
    title: 'Charged by friction, conduction or induction?',
    use: 'Use this for “A charged rod is held near a metal can without touching it, and the can rolls toward it. How did the can become charged?”',
    assumptions: [
      'Charge is never made or destroyed: electrons move from one object to another.',
      'Friction rubs electrons off one material onto another; conduction shares charge by touch.',
      'Induction moves charges within an object by a nearby charge, without touching.',
    ],
    question: 'How does it get its charge?',
    bins: [
      {
        id: 'friction',
        label: 'Friction',
        why: 'Rubbing two different materials moves electrons from one to the other: opposite charges.',
      },
      {
        id: 'conduction',
        label: 'Conduction',
        why: 'Touching a charged object shares its charge: the same sign.',
      },
      {
        id: 'induction',
        label: 'Induction',
        why: 'A charge nearby pushes the electrons to one side, without touching.',
      },
    ],
    cards: [
      { label: 'A balloon rubbed on hair', bin: 'friction' },
      { label: 'Socks shuffled across a carpet', bin: 'friction' },
      { label: 'Tape pulled quickly off a roll', bin: 'friction' },
      { label: 'A charged rod touched to a metal sphere', bin: 'conduction' },
      { label: 'A hand on a charged dome, hair standing up', bin: 'conduction' },
      { label: 'A charged rod held near a can pulls it without touching', bin: 'induction' },
      {
        label: 'A sphere grounded while a rod is near, then the ground wire removed',
        bin: 'induction',
      },
    ],
  },

  // ── Magnetic fields, forces and induction (HS-PS2-5, HS-PS3-5) ──
  {
    kind: 'sort',
    id: 's.11.electromagnetism~motor-generator',
    title: 'Motor or generator?',
    use: 'Use this for “A generator turns. What energy change happens, and why does it make a current?”',
    assumptions: [
      'A motor: a current in a magnetic field feels a force, so electrical energy becomes motion.',
      'A generator: a coil turning in a magnetic field has a changing flux, so motion becomes electrical energy.',
      'They are the same device run in opposite directions.',
    ],
    question: 'Which way does the energy go?',
    bins: [
      {
        id: 'motor',
        label: 'Motor: electrical to motion',
        why: 'A current in a magnetic field is pushed, and the push turns the shaft.',
      },
      {
        id: 'generator',
        label: 'Generator: motion to electrical',
        why: 'Turning the coil changes the flux through it, which induces a current.',
      },
    ],
    cards: [
      { label: 'An electric fan', bin: 'motor' },
      { label: 'A blender', bin: 'motor' },
      { label: 'An electric car driving', bin: 'motor' },
      { label: 'A wind turbine', bin: 'generator' },
      { label: 'A hand-crank flashlight', bin: 'generator' },
      { label: 'A bike’s dynamo light', bin: 'generator' },
      { label: 'An electric car braking to charge its battery', bin: 'generator' },
    ],
  },
  {
    kind: 'explore',
    id: 's.11.electromagnetism~magnet-poles',
    title: 'Magnetic poles and field lines',
    use: 'Use this for “One magnet is turned round. How do the size and direction of the force change?”',
    assumptions: [
      'Like poles repel and unlike poles attract; turning one magnet round reverses the force.',
      'Turning it round doesn’t change the size of the force: the distance and the magnets are the same.',
      'Field lines leave N and enter S. A compass needle’s north end points along them.',
    ],
    figure: { kind: 'magnets' },
    scenes: [
      {
        label: 'N faces N',
        lines: ['The magnets push apart; the field lines squeeze away from each other.'],
        poles: 'N–N',
        field: {},
      },
      {
        label: 'One turned round',
        lines: [
          'Now N faces S: the force is just as big but the other way, a pull instead of a push.',
        ],
        poles: 'N–S',
        field: {},
      },
      {
        label: 'Field lines',
        lines: ['Lines run from N to S; they crowd where the field is strongest, at the poles.'],
        poles: 'N–S',
        field: { single: true },
      },
      {
        label: 'Compasses',
        lines: ['Each compass lines up with the field where it sits, pointing along the lines.'],
        poles: 'N–S',
        field: { single: true, lines: false, compasses: true },
      },
    ],
  },
];
