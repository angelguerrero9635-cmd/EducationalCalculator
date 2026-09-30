/**
 * Grade 12 science layout pages (explore, sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../science/12.ts`. Data only: no UI code.
 */
import type { LayoutDef } from './types';

export const SCIENCE_12_LAYOUTS: LayoutDef[] = [
  // ── Minerals and rocks: properties and how they form (HS-ESS2-1, HS-ESS2-3) ──
  {
    kind: 'explore',
    id: 's.12.minerals-rocks',
    assumptions: [
      'A mineral scratches every mineral below it on the scale and is scratched by those above it.',
      'The scale ranks hardness only; the steps are not equal.',
    ],
    figure: { kind: 'mohsScale' },
    scenes: [
      {
        label: 'The ten minerals',
        lines: [
          'Talc, at 1, is the softest mineral on the scale; diamond, at 10, is the hardest.',
          'The dashed lines are everyday tools: a fingernail, a copper coin, glass and a steel file.',
        ],
        mohs: {},
      },
      {
        label: 'Scratched by a coin, not a fingernail',
        lines: [
          'A fingernail (2.5) can’t scratch it, but a copper coin (3.5) can.',
          'Its hardness is between 2.5 and 3.5: calcite, at 3, fits.',
        ],
        mohs: { between: [2.5, 3.5], lit: 3 },
      },
      {
        label: 'Scratches glass, not a steel file',
        lines: [
          'It scratches glass (5.5), but a steel file (6.5) scratches it.',
          'Its hardness is between 5.5 and 6.5: feldspar, at 6, fits.',
        ],
        mohs: { between: [5.5, 6.5], lit: 6 },
      },
      {
        label: 'Scratches glass and steel',
        lines: [
          'It scratches both glass and a steel file, so it is harder than 6.5.',
          'Quartz, at 7, is the common mineral that does this.',
        ],
        mohs: { lit: 7 },
      },
      {
        label: 'How far apart the ranks are',
        lines: [
          'The ranks are equal steps, but the hardness is not.',
          'Diamond is about four times as hard as corundum, but only one rank above it.',
        ],
        mohs: { absolute: true },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.12.minerals-rocks~mineral-groups',
    title: 'Silicate or not?',
    use: 'Use this for “Which of these minerals is a silicate?”',
    assumptions: [
      'Silicon and oxygen are the two most common elements in Earth’s crust.',
      'Silicates are built on units of one silicon atom joined to four oxygen atoms.',
    ],
    question: 'Is it a silicate?',
    bins: [
      {
        id: 'silicate',
        label: 'Silicate (built on silicon and oxygen)',
        why: 'Silicates make up most of the crust: quartz, feldspar and mica are the commonest.',
      },
      {
        id: 'other',
        label: 'Not a silicate',
        why: 'Carbonates, halides, sulfides and oxides have no silicon-oxygen units.',
      },
    ],
    cards: [
      { label: 'Quartz (SiO₂)', bin: 'silicate', figure: { kind: 'icon', icon: 'quartz' } },
      { label: 'Feldspar', bin: 'silicate', figure: { kind: 'icon', icon: 'feldspar' } },
      { label: 'Mica', bin: 'silicate', figure: { kind: 'icon', icon: 'mica' } },
      { label: 'Calcite (CaCO₃)', bin: 'other', figure: { kind: 'icon', icon: 'calcite' } },
      { label: 'Halite (NaCl)', bin: 'other', figure: { kind: 'icon', icon: 'halite' } },
      { label: 'Pyrite (FeS₂)', bin: 'other', figure: { kind: 'icon', icon: 'pyrite' } },
      { label: 'Hematite (Fe₂O₃)', bin: 'other', figure: { kind: 'icon', icon: 'hematite' } },
    ],
  },
  {
    kind: 'sort',
    id: 's.12.minerals-rocks~cleavage',
    title: 'Cleavage or fracture?',
    use: 'Use this for “Does this mineral break along flat planes or along curved surfaces?”',
    assumptions: [
      'Cleavage follows planes where the bonds in the crystal are weakest.',
      'Where the bonds are equally strong in every direction, the mineral fractures.',
    ],
    question: 'How does it break?',
    bins: [
      {
        id: 'cleavage',
        label: 'Cleavage (flat planes)',
        why: 'Mica splits one way into sheets, feldspar two ways at 90°, halite three ways at 90° and calcite three ways, not at 90°.',
      },
      {
        id: 'fracture',
        label: 'Fracture (uneven or curved)',
        why: 'Quartz breaks in smooth curved shells; pyrite and hematite break unevenly.',
      },
    ],
    cards: [
      { label: 'Mica', bin: 'cleavage', figure: { kind: 'icon', icon: 'mica' } },
      { label: 'Feldspar', bin: 'cleavage', figure: { kind: 'icon', icon: 'feldspar' } },
      { label: 'Halite', bin: 'cleavage', figure: { kind: 'icon', icon: 'halite' } },
      { label: 'Calcite', bin: 'cleavage', figure: { kind: 'icon', icon: 'calcite' } },
      { label: 'Quartz', bin: 'fracture', figure: { kind: 'icon', icon: 'quartz' } },
      { label: 'Pyrite', bin: 'fracture', figure: { kind: 'icon', icon: 'pyrite' } },
      { label: 'Hematite', bin: 'fracture', figure: { kind: 'icon', icon: 'hematite' } },
    ],
  },
  {
    kind: 'sort',
    id: 's.12.minerals-rocks~igneous',
    title: 'Intrusive or extrusive?',
    use: 'Use this for “A rock has large crystals. Did it cool quickly or slowly?”',
    assumptions: [
      'Slow cooling gives crystals time to grow large; fast cooling leaves tiny crystals or glass.',
      'Gas escaping from lava as it cools leaves holes.',
    ],
    question: 'Where did this rock cool?',
    bins: [
      {
        id: 'intrusive',
        label: 'Slowly, underground (intrusive)',
        why: 'Buried magma cools over thousands of years, so its crystals are big enough to see.',
      },
      {
        id: 'extrusive',
        label: 'Quickly, at the surface (extrusive)',
        why: 'Lava cools in days or years: tiny crystals, glass, or holes where gas escaped.',
      },
    ],
    cards: [
      { label: 'Granite', bin: 'intrusive', figure: { kind: 'rock', texture: 'crystals' } },
      { label: 'Gabbro', bin: 'intrusive', figure: { kind: 'rock', texture: 'crystals' } },
      { label: 'Diorite', bin: 'intrusive', figure: { kind: 'rock', texture: 'crystals' } },
      { label: 'Peridotite', bin: 'intrusive', figure: { kind: 'rock', texture: 'crystals' } },
      { label: 'Basalt', bin: 'extrusive', figure: { kind: 'rock', texture: 'fine' } },
      { label: 'Rhyolite', bin: 'extrusive', figure: { kind: 'rock', texture: 'fine' } },
      { label: 'Andesite', bin: 'extrusive', figure: { kind: 'rock', texture: 'fine' } },
      { label: 'Obsidian', bin: 'extrusive', figure: { kind: 'rock', texture: 'glassy' } },
      { label: 'Pumice', bin: 'extrusive', figure: { kind: 'rock', texture: 'holes' } },
    ],
  },
  {
    kind: 'sort',
    id: 's.12.minerals-rocks~metamorphic',
    title: 'Foliated or nonfoliated?',
    use: 'Use this for “Is gneiss foliated? What was its parent rock?”',
    assumptions: [
      'Heat and pressure change a rock without melting it.',
      'Pressure from one direction lines up flat minerals into layers or bands.',
    ],
    question: 'Are the minerals lined up?',
    bins: [
      {
        id: 'foliated',
        label: 'Foliated',
        why: 'Flat minerals such as mica line up across the squeeze, in layers or bands.',
      },
      {
        id: 'nonfoliated',
        label: 'Nonfoliated',
        why: 'The minerals recrystallize into grains with no lined-up layers, often from one mineral.',
      },
    ],
    cards: [
      { label: 'Slate, from shale', bin: 'foliated', figure: { kind: 'rock', texture: 'layers' } },
      { label: 'Schist, from slate', bin: 'foliated', figure: { kind: 'rock', texture: 'layers' } },
      {
        label: 'Gneiss, from granite',
        bin: 'foliated',
        figure: { kind: 'rock', texture: 'bands' },
      },
      {
        label: 'Marble, from limestone',
        bin: 'nonfoliated',
        figure: { kind: 'rock', texture: 'crystals' },
      },
      {
        label: 'Quartzite, from sandstone',
        bin: 'nonfoliated',
        figure: { kind: 'rock', texture: 'grains' },
      },
      {
        label: 'Hornfels, from shale baked by magma',
        bin: 'nonfoliated',
        figure: { kind: 'rock', texture: 'fine' },
      },
    ],
  },

  // ── Earthquakes, seismic waves and Earth's interior (HS-ESS2-3, HS-ESS1-5) ──
  {
    kind: 'sort',
    id: 's.12.earth-interior~wave-types',
    title: 'P, S or surface wave?',
    use: 'Use this for “Which seismic wave cannot travel through the liquid outer core?”',
    assumptions: [
      'P and S waves travel through Earth’s inside; surface waves travel along the ground.',
      'Liquids cannot be sheared, so S waves stop at the liquid outer core.',
    ],
    question: 'Which wave is it?',
    bins: [
      {
        id: 'p',
        label: 'P wave',
        why: 'The fastest wave pushes and pulls rock along its path, through solids and liquids.',
      },
      {
        id: 's',
        label: 'S wave',
        why: 'The slower wave shakes rock side to side, which only a solid can pass on.',
      },
      {
        id: 'surface',
        label: 'Surface wave',
        why: 'The slowest waves roll along the ground with the biggest motion.',
      },
    ],
    cards: [
      { label: 'Arrives first', bin: 'p' },
      { label: 'Squeezes and stretches rock along its path', bin: 'p' },
      { label: 'Crosses the liquid outer core', bin: 'p' },
      { label: 'Arrives second', bin: 's' },
      { label: 'Shakes rock across its path', bin: 's' },
      { label: 'Stopped by liquid', bin: 's' },
      { label: 'Travels along the ground and arrives last', bin: 'surface' },
      { label: 'Causes most damage to buildings', bin: 'surface' },
    ],
  },
  {
    kind: 'sort',
    id: 's.12.earth-interior~heat-sources',
    title: 'Earth’s heat or the Sun’s?',
    use: 'Use this for “Which of these is powered by Earth’s internal heat, like hot springs?”',
    assumptions: [
      'Earth’s internal heat comes from radioactive decay and heat left from its formation.',
      'The Sun’s energy drives the winds, the water cycle and the surface currents.',
    ],
    question: 'What powers it?',
    bins: [
      {
        id: 'inside',
        label: 'Earth’s internal heat',
        why: 'Heat flowing out from the hot interior melts rock and moves the mantle.',
      },
      {
        id: 'sun',
        label: 'Energy from the Sun',
        why: 'Sunlight warms the air, land and sea unevenly, which drives wind and water.',
      },
    ],
    cards: [
      { label: 'Hot springs', bin: 'inside' },
      { label: 'A geyser', bin: 'inside' },
      { label: 'Lava from a volcano', bin: 'inside' },
      { label: 'Mantle convection moving plates', bin: 'inside' },
      { label: 'Magma cooling into granite', bin: 'inside' },
      { label: 'Wind', bin: 'sun' },
      { label: 'Evaporation from the ocean', bin: 'sun' },
      { label: 'A hurricane', bin: 'sun' },
      { label: 'Surface ocean currents', bin: 'sun' },
      { label: 'A glacier melting in summer', bin: 'sun' },
    ],
  },

  // ── Geologic time and radiometric dating (HS-ESS1-5, HS-ESS1-6) ──
  {
    kind: 'sequence',
    id: 's.12.radiometric-dating~relative-order',
    title: 'Putting rock events in order',
    use: 'Use this for “A dike cuts three layers and stops at an eroded surface under a lava flow. Which happened first?”',
    assumptions: [
      'Superposition: lower layers are older unless folded or overturned.',
      'Cross-cutting: a rock is younger than what it cuts.',
      'An eroded surface is a gap in the record.',
    ],
    question:
      'A cliff has limestone at the bottom, then shale, then sandstone. A dike cuts all three and ends at an eroded surface under a lava flow. Put the events in order.',
    stages: [
      { label: 'Limestone is laid down', figure: { kind: 'rock', texture: 'shells' } },
      { label: 'Shale is laid down', figure: { kind: 'rock', texture: 'layers' } },
      { label: 'Sandstone is laid down', figure: { kind: 'rock', texture: 'grains' } },
      { label: 'Magma cuts through as a dike', figure: { kind: 'rock', texture: 'crystals' } },
      { label: 'Erosion cuts the top flat' },
      { label: 'Lava flows over the eroded surface', figure: { kind: 'rock', texture: 'fine' } },
    ],
  },
  {
    kind: 'sequence',
    id: 's.12.radiometric-dating~time-scale',
    title: 'The geologic time scale',
    use: 'Use this for “Order the eras of Earth’s history. How long was each?”',
    assumptions: [
      'The eras are named for their life: Paleozoic means old life, Mesozoic middle and Cenozoic new.',
      'The boundaries are dated from ash beds and lava flows by radiometric dating.',
    ],
    question: 'Put Earth’s history in order, from its formation to today.',
    stages: [
      {
        label: 'Precambrian: Earth forms; oxygen builds up and iron rusts into red beds',
        span: 4059,
      },
      { label: 'Paleozoic: shelled animals, fish, the first land plants', span: 289 },
      { label: 'Mesozoic: dinosaurs; ends with an asteroid impact', span: 186 },
      { label: 'Cenozoic: mammals spread; humans appear', span: 66 },
    ],
    unit: 'million years',
    totalLabel: 'Earth’s age',
  },

  // ── The ocean: seafloor, currents and ocean–atmosphere interaction (HS-ESS2-4, HS-ESS2-5) ──
  {
    kind: 'explore',
    id: 's.12.ocean-atmosphere~currents',
    title: 'Surface currents and the deep conveyor',
    use: 'Use this for “Why is the current on the west side of an ocean basin warm?” and “What drives the deep conveyor?”',
    assumptions: [
      'Winds drive the surface currents; differences in density drive the deep ones.',
      'Currents carry heat from the tropics toward the poles.',
    ],
    figure: { kind: 'oceanCurrents' },
    scenes: [
      {
        label: 'Gyres',
        lines: [
          'Trade winds and westerlies push the surface water.',
          'The Coriolis effect turns the flow into gyres, clockwise in the north and counterclockwise in the south.',
        ],
        currents: { view: 'gyres' },
      },
      {
        label: 'Warm and cold sides',
        lines: [
          'Warm water flows toward the poles on each basin’s west side, like the Gulf Stream.',
          'Cold water flows back toward the equator on the east side, like the California Current.',
        ],
        currents: { view: 'gyres' },
      },
      {
        label: 'The conveyor',
        lines: [
          'Cold, salty water sinks near Greenland and Antarctica.',
          'It creeps through the deep ocean and rises again; one loop takes about 1,000 years.',
        ],
        currents: { view: 'conveyor' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.12.ocean-atmosphere~density',
    title: 'Sinks or rises?',
    use: 'Use this for “Why does warm air rise at the equator?” and “Why does water sink near Greenland?”',
    assumptions: [
      'Colder and saltier water is denser; warmer and fresher water is less dense.',
      'Air works the same way: cold air sinks and warm air rises.',
    ],
    question: 'Does it sink or rise compared with what is around it?',
    bins: [
      {
        id: 'sinks',
        label: 'Sinks (denser)',
        why: 'Cold or salty fluid packs more mass into each liter, so it sinks under lighter fluid.',
      },
      {
        id: 'rises',
        label: 'Rises or stays on top (less dense)',
        why: 'Warm or fresh fluid is lighter than what is around it, so it is pushed up.',
      },
    ],
    cards: [
      { label: 'Cold, salty water near Greenland', bin: 'sinks' },
      { label: 'Seawater left saltier as sea ice forms', bin: 'sinks' },
      { label: 'Cold air over the poles', bin: 'sinks' },
      { label: 'Warm tropical surface water', bin: 'rises' },
      { label: 'Fresh river water entering the sea', bin: 'rises' },
      { label: 'Warm, moist air over the equator', bin: 'rises' },
    ],
  },

  // ── The atmosphere: structure, air pressure, wind and severe weather (HS-ESS2-4, HS-ESS3-1) ──
  {
    kind: 'sequence',
    id: 's.12.atmosphere-weather~hurricane',
    title: 'How a hurricane grows and dies',
    use: 'Use this for “Put the stages of a hurricane in order. Why does it weaken over land?”',
    assumptions: [
      'Warm ocean water is the fuel: water vapor gives off heat as it condenses in the storm.',
      'The wind speeds are sustained winds, not gusts.',
    ],
    question: 'Put the stages of a hurricane in order.',
    stages: [
      { label: 'Thunderstorms cluster over ocean water warmer than about 27 °C' },
      { label: 'Tropical depression: winds circle a low, under 63 km/h' },
      { label: 'Tropical storm: winds 63–118 km/h; it gets a name' },
      { label: 'Hurricane: winds of 119 km/h or more; an eye forms' },
      { label: 'Landfall: cut off from warm water, it weakens' },
    ],
  },
  {
    kind: 'sort',
    id: 's.12.atmosphere-weather~air-masses',
    title: 'Which air mass is it?',
    use: 'Use this for “Which air mass brings hot, humid summer weather to the southeastern United States?”',
    assumptions: [
      'An air mass takes on the temperature and moisture of the land or sea it forms over.',
      'Continental means dry, maritime means moist; polar means cold, tropical means warm.',
    ],
    question: 'Which air mass is this?',
    bins: [
      {
        id: 'cP',
        label: 'Continental polar (cP)',
        why: 'It forms over cold northern land, so it is cold and dry.',
      },
      {
        id: 'mP',
        label: 'Maritime polar (mP)',
        why: 'It forms over cold northern seas, so it is cool and damp.',
      },
      {
        id: 'mT',
        label: 'Maritime tropical (mT)',
        why: 'It forms over warm seas, so it is warm and humid.',
      },
      {
        id: 'cT',
        label: 'Continental tropical (cT)',
        why: 'It forms over hot deserts, so it is hot and dry.',
      },
    ],
    cards: [
      {
        label: 'Cold and dry, from northern Canada',
        bin: 'cP',
        figure: { kind: 'map', area: 'northAmerica', region: 'northern canada' },
      },
      { label: 'Brings lake-effect snow', bin: 'cP' },
      {
        label: 'Cool and damp, from the North Pacific',
        bin: 'mP',
        figure: { kind: 'map', area: 'northAmerica', region: 'north pacific' },
      },
      { label: 'Brings drizzle to the Pacific Northwest', bin: 'mP' },
      {
        label: 'Warm and humid, from the Gulf of Mexico',
        bin: 'mT',
        figure: { kind: 'map', area: 'northAmerica', region: 'gulf of mexico' },
      },
      { label: 'Brings summer thunderstorms to the Southeast', bin: 'mT' },
      {
        label: 'Hot and dry, from the deserts of northern Mexico',
        bin: 'cT',
        figure: { kind: 'map', area: 'northAmerica', region: 'northern mexico' },
      },
      { label: 'Brings heat waves to the southern Plains', bin: 'cT' },
    ],
  },

  // ── The solar system: formation, planets and small bodies (HS-ESS1-4, HS-ESS1-6) ──
  {
    kind: 'sequence',
    id: 's.12.solar-system~formation',
    title: 'How the solar system formed',
    use: 'Use this for “Put the stages of the solar system’s formation in order.”',
    assumptions: [
      'It all began about 4.6 billion years ago with a cloud of gas and dust.',
      'Near the Sun only rock and metal stay solid; past the frost line ice does too, so the outer planets grew big.',
    ],
    question: 'Put the stages of the solar system’s formation in order.',
    stages: [
      {
        label: 'A cloud of gas and dust collapses',
        figure: { kind: 'icon', icon: 'solar nebula' },
      },
      {
        label: 'It spins faster and flattens into a disk',
        figure: { kind: 'icon', icon: 'spinning disk' },
      },
      { label: 'The center heats into the protosun', figure: { kind: 'icon', icon: 'protosun' } },
      {
        label: 'Dust clumps into planetesimals: rock near the Sun, ice beyond the frost line',
        figure: { kind: 'icon', icon: 'planetesimals' },
      },
      {
        label: 'Planetesimals collide into planets; the Sun’s wind clears the gas',
        figure: { kind: 'icon', icon: 'young planets' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.12.solar-system~planet-types',
    title: 'Terrestrial, Jovian or small body?',
    use: 'Use this for “Is Neptune a terrestrial or a Jovian planet? What about Pluto?”',
    assumptions: [
      'Terrestrial planets are small, rocky and dense; Jovian planets are huge balls of gas and ice.',
      'Dwarf planets, asteroids and comets are leftover pieces too small to clear their orbits.',
    ],
    question: 'What kind of body is it?',
    bins: [
      {
        id: 'terrestrial',
        label: 'Terrestrial planet',
        why: 'Rock and metal, formed close to the Sun where only they could stay solid.',
      },
      {
        id: 'jovian',
        label: 'Jovian planet',
        why: 'Giant worlds of hydrogen, helium and ice, formed beyond the frost line.',
      },
      {
        id: 'small',
        label: 'Dwarf planet or small body',
        why: 'Too small to sweep its orbit clear of other bodies.',
      },
    ],
    cards: [
      { label: 'Mercury', bin: 'terrestrial' },
      { label: 'Venus', bin: 'terrestrial' },
      { label: 'Earth', bin: 'terrestrial' },
      { label: 'Mars', bin: 'terrestrial' },
      { label: 'Jupiter', bin: 'jovian' },
      { label: 'Saturn', bin: 'jovian' },
      { label: 'Uranus', bin: 'jovian' },
      { label: 'Neptune', bin: 'jovian' },
      { label: 'Pluto', bin: 'small' },
      { label: 'Ceres', bin: 'small' },
      { label: 'Halley’s Comet', bin: 'small' },
      { label: 'The asteroid Vesta', bin: 'small' },
    ],
  },

  // ── Light, spectra and telescopes: how we study stars (HS-ESS1-1, HS-PS4-3) ──
  {
    kind: 'sort',
    id: 's.12.starlight-spectra~space-telescopes',
    title: 'From the ground or only from space?',
    use: 'Use this for “Why must X-ray telescopes be put in space?”',
    assumptions: [
      'The air lets through visible light and radio waves, and blocks most of the rest.',
      'Ozone absorbs ultraviolet; water vapor absorbs most infrared.',
    ],
    question: 'Can a telescope on the ground see it?',
    bins: [
      {
        id: 'ground',
        label: 'From the ground',
        why: 'These waves pass through the atmosphere, so telescopes on mountaintops can catch them.',
      },
      {
        id: 'space',
        label: 'Only from space',
        why: 'The atmosphere absorbs these waves before they reach the ground.',
      },
    ],
    cards: [
      { label: 'Radio waves from a galaxy', bin: 'ground' },
      { label: 'Visible light from a star', bin: 'ground' },
      { label: 'X-rays from hot gas', bin: 'space' },
      { label: 'Gamma rays from an explosion', bin: 'space' },
      { label: 'Ultraviolet from a young star', bin: 'space' },
      { label: 'Far infrared from cold dust', bin: 'space' },
    ],
  },

  // ── The sun and stellar evolution (HS-ESS1-1, HS-ESS1-3) ──
  {
    kind: 'sequence',
    id: 's.12.stellar-evolution~sunlike',
    title: 'The life of a Sun-like star',
    use: 'Use this for “Put the stages of a Sun-like star’s life in order. What is left at the end?”',
    assumptions: [
      'A star’s mass sets its life: stars up to about 8 Sun masses end quietly.',
      'The white dwarf is the old core, about the size of Earth, slowly cooling.',
    ],
    question: 'Put the stages of a Sun-like star’s life in order.',
    stages: [
      { label: 'Stellar nebula', figure: { kind: 'icon', icon: 'stellar nebula' } },
      { label: 'Protostar', figure: { kind: 'icon', icon: 'protostar' } },
      {
        label: 'Main sequence: hydrogen fuses in the core',
        figure: { kind: 'icon', icon: 'Sun-like star' },
      },
      {
        label: 'Red giant: the core’s hydrogen runs out',
        figure: { kind: 'icon', icon: 'red giant' },
      },
      { label: 'Planetary nebula', figure: { kind: 'icon', icon: 'planetary nebula' } },
      { label: 'White dwarf', figure: { kind: 'icon', icon: 'white dwarf' } },
    ],
  },
  {
    kind: 'sequence',
    id: 's.12.stellar-evolution~massive',
    title: 'The life of a massive star',
    use: 'Use this for “What is left after a massive star explodes as a supernova?”',
    assumptions: [
      'Massive stars burn hot and fast, fusing elements up to iron in a few million years.',
      'The collapsed core is a neutron star; above about 20 Sun masses, a black hole.',
    ],
    question: 'Put the stages of a massive star’s life in order.',
    stages: [
      { label: 'Stellar nebula', figure: { kind: 'icon', icon: 'stellar nebula' } },
      { label: 'Protostar', figure: { kind: 'icon', icon: 'protostar' } },
      { label: 'Massive main-sequence star', figure: { kind: 'icon', icon: 'massive star' } },
      { label: 'Red supergiant', figure: { kind: 'icon', icon: 'red supergiant' } },
      { label: 'Supernova', figure: { kind: 'icon', icon: 'supernova' } },
      { label: 'Neutron star', figure: { kind: 'icon', icon: 'neutron star' } },
    ],
  },
  {
    kind: 'sort',
    id: 's.12.stellar-evolution~elements',
    title: 'Where the atoms were made',
    use: 'Use this for “Which two elements are the most common in the universe, and where were they made?”',
    assumptions: [
      'Hydrogen and helium are most of the Sun and the solar system.',
      'Stars fuse elements up to iron; heavier ones need a supernova or a neutron-star merger.',
    ],
    question: 'Where were most of these atoms made?',
    bins: [
      {
        id: 'bigbang',
        label: 'The Big Bang',
        why: 'The first minutes made the lightest nuclei, hydrogen and most of the helium.',
      },
      {
        id: 'stars',
        label: 'Fusion inside stars',
        why: 'Stars fuse light nuclei into heavier ones, up to iron in the most massive.',
      },
      {
        id: 'explosions',
        label: 'Supernovas and neutron-star mergers',
        why: 'Only these violent events pack in enough neutrons to build the heaviest nuclei.',
      },
    ],
    cards: [
      { label: 'Hydrogen', bin: 'bigbang', figure: { kind: 'molecule', formula: 'H' } },
      { label: 'Most of the helium', bin: 'bigbang', figure: { kind: 'molecule', formula: 'He' } },
      { label: 'Carbon in your body', bin: 'stars', figure: { kind: 'molecule', formula: 'C' } },
      { label: 'Oxygen in the air', bin: 'stars', figure: { kind: 'molecule', formula: 'O' } },
      {
        label: 'Iron in a massive star’s core',
        bin: 'stars',
        figure: { kind: 'molecule', formula: 'Fe' },
      },
      { label: 'Gold', bin: 'explosions', figure: { kind: 'molecule', formula: 'Au' } },
      { label: 'Uranium', bin: 'explosions', figure: { kind: 'molecule', formula: 'U' } },
    ],
  },

  // ── Galaxies, the Big Bang and the expanding universe (HS-ESS1-2) ──
  {
    kind: 'sort',
    id: 's.12.cosmology~galaxies',
    title: 'Kinds of galaxies',
    use: 'Use this for “What do all galaxies have in common?” and for sorting galaxies by shape.',
    assumptions: [
      'Every galaxy holds millions to trillions of stars bound by gravity.',
      'Galaxies are sorted by shape: spiral, elliptical or irregular.',
    ],
    question: 'What type of galaxy is it?',
    bins: [
      {
        id: 'spiral',
        label: 'Spiral',
        why: 'A bulge and a flat disk with arms, where gas forms young blue stars.',
      },
      {
        id: 'elliptical',
        label: 'Elliptical',
        why: 'A smooth ball or oval of old red stars, with little gas left to make new ones.',
      },
      {
        id: 'irregular',
        label: 'Irregular',
        why: 'Patchy clumps of stars and gas with no clear shape.',
      },
    ],
    cards: [
      {
        label: 'The Milky Way',
        bin: 'spiral',
        figure: { kind: 'icon', icon: 'barred spiral galaxy' },
      },
      { label: 'Andromeda', bin: 'spiral', figure: { kind: 'icon', icon: 'spiral galaxy' } },
      { label: 'A disk with arms and young blue stars', bin: 'spiral' },
      {
        label: 'A giant ball of old red stars',
        bin: 'elliptical',
        figure: { kind: 'icon', icon: 'elliptical galaxy' },
      },
      { label: 'Round or oval, with little gas', bin: 'elliptical' },
      {
        label: 'The Large Magellanic Cloud',
        bin: 'irregular',
        figure: { kind: 'icon', icon: 'irregular galaxy' },
      },
      { label: 'No clear shape, lots of gas and new stars', bin: 'irregular' },
    ],
  },
  {
    kind: 'sequence',
    id: 's.12.cosmology~big-bang',
    title: 'The history of the universe',
    use: 'Use this for “Put the events since the Big Bang in order. What is the microwave background?”',
    assumptions: [
      'The times are since the Big Bang, 13.8 billion years ago.',
      'The microwave background is the oldest light we can see, stretched by expansion into microwaves.',
    ],
    question: 'Put the events since the Big Bang in order.',
    stages: [
      { label: 'Space expands from a hot, dense state' },
      { label: 'Protons and neutrons form in the first second' },
      { label: 'Hydrogen and helium nuclei form in the first minutes' },
      {
        label:
          'Atoms form and light goes free, seen today as the microwave background (380,000 years)',
      },
      { label: 'The first stars shine (about 200 million years)' },
      { label: 'The Sun and Earth form (about 9 billion years)' },
      { label: 'Today (13.8 billion years)' },
    ],
  },
];
