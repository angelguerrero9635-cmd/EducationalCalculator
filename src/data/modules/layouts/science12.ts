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
        why: 'Buried magma cools over thousands to millions of years, so its crystals grow big enough to see.',
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
    kind: 'explore',
    id: 's.12.earth-interior~wave-arrivals',
    title: 'Which waves reach a station',
    use: 'Use this for “Which seismic waves reach a station 120° from an earthquake, and why?”',
    assumptions: [
      'P waves travel through solids and liquids; S waves travel only through solids.',
      'The outer core, 2,890 km down, is liquid, and waves bend where they cross into it.',
      'Angles are measured round Earth’s center from the earthquake’s focus.',
    ],
    figure: { kind: 'earthLayers' },
    scenes: [
      {
        label: '60°',
        lines: [
          'A station 60° away gets both P and S waves, straight through the mantle.',
          'P waves arrive first because they are faster.',
        ],
        earthSection: { distance: 60 },
      },
      {
        label: '104°',
        lines: [
          'At 104° the deepest direct waves just graze the core.',
          'Farther away, no wave reaches a station straight through the mantle.',
        ],
        earthSection: { distance: 104 },
      },
      {
        label: '120°',
        lines: [
          'At 120° the station is in the P-wave shadow zone: P waves that meet the core bend away from it.',
          'No S waves arrive, since they cannot cross the liquid outer core.',
        ],
        earthSection: { distance: 120 },
      },
      {
        label: '150°',
        lines: [
          'At 150° P waves arrive again, bent through the core.',
          'Still no S waves: the liquid outer core stops them, which is how we know it is liquid.',
        ],
        earthSection: { distance: 150 },
      },
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

  // ── Volcanoes, crustal deformation and mountain building (HS-ESS2-1, HS-ESS2-3) ──
  {
    kind: 'explore',
    id: 's.12.volcanoes-mountains',
    assumptions: [
      'Silica makes magma sticky; sticky magma traps gas.',
      'Trapped gas makes eruptions explosive.',
    ],
    figure: { kind: 'landforms' },
    scenes: [
      {
        label: 'Shield volcano',
        lines: [
          'Runny basalt flows spread thin before they cool, building gentle slopes.',
          'Eruptions are mostly quiet lava flows, as on Hawaii.',
        ],
        landform: { kind: 'shield' },
      },
      {
        label: 'Composite volcano',
        lines: [
          'Layers of sticky lava and ash build a tall cone with steep sides.',
          'Gas trapped in the sticky magma makes its eruptions explosive.',
        ],
        landform: { kind: 'composite' },
      },
      {
        label: 'Cinder cone',
        lines: [
          'Gassy lava blasts into the air and falls as cinders, piling into a small, steep cone.',
          'Lava often leaks out from its base.',
        ],
        landform: { kind: 'cinderCone' },
      },
    ],
  },
  {
    kind: 'explore',
    id: 's.12.volcanoes-mountains~deformation',
    title: 'Folds and faults',
    use: 'Use this for “The hanging wall dropped down along the fault. Which kind of fault is it, and what stress made it?”',
    assumptions: [
      'Compression shortens rock, tension stretches it, shear slides it sideways.',
      'Deep, warm rock bends into folds; rock near the surface breaks along faults.',
    ],
    figure: { kind: 'landforms' },
    scenes: [
      {
        label: 'Folds',
        lines: [
          'Slow compression bends layers into arches (anticlines) and troughs (synclines).',
          'Rock that is deep and warm bends instead of breaking.',
        ],
        landform: { kind: 'folds' },
      },
      {
        label: 'Normal fault',
        lines: [
          'Tension pulls the crust apart, and the hanging wall drops down the fault.',
          'The hanging wall is the block above a sloping fault.',
        ],
        landform: { kind: 'normalFault' },
      },
      {
        label: 'Reverse fault',
        lines: [
          'Compression pushes the hanging wall up the fault.',
          'Older rock ends up stacked on younger rock.',
        ],
        landform: { kind: 'reverseFault' },
      },
      {
        label: 'Strike-slip fault',
        lines: [
          'Shear slides the blocks past each other sideways, as on the San Andreas Fault.',
          'A fence across the fault is offset.',
        ],
        landform: { kind: 'strikeSlip' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.12.volcanoes-mountains~magma',
    title: 'Low-silica or high-silica magma?',
    use: 'Use this for “Why do volcanoes above subduction zones erupt explosively?”',
    assumptions: [
      'Silica chains make magma thick; thick magma holds its gas until it bursts out.',
      'Basalt is low in silica, andesite is in between, and rhyolite is highest.',
    ],
    question: 'Which magma does this describe?',
    bins: [
      {
        id: 'low',
        label: 'Low silica (basaltic)',
        why: 'Runny magma lets gas bubble out gently, so lava flows far.',
      },
      {
        id: 'high',
        label: 'High silica (andesitic to rhyolitic)',
        why: 'Sticky magma traps gas until the pressure blasts it apart.',
      },
    ],
    cards: [
      { label: 'Runny lava that flows far', bin: 'low' },
      { label: 'Gas escapes easily', bin: 'low' },
      { label: 'Builds broad shield volcanoes', bin: 'low' },
      { label: 'Erupts at mid-ocean ridges and hot spots', bin: 'low' },
      { label: 'Sticky lava that traps gas', bin: 'high' },
      { label: 'Explosive eruptions of ash and pumice', bin: 'high' },
      { label: 'Builds steep composite volcanoes', bin: 'high' },
      { label: 'Forms above subduction zones', bin: 'high' },
    ],
  },
  {
    kind: 'explore',
    id: 's.12.volcanoes-mountains~mountain-building',
    title: 'How plates build mountains',
    use: 'Use this for “Why are there volcanic mountains along a coast where an ocean plate sinks?” and “What happens as a rift valley widens?”',
    assumptions: [
      'Mantle convection and the pull of sinking slabs move the plates.',
      'Where plates push together the crust thickens into mountains; where they pull apart it thins and sinks.',
    ],
    figure: { kind: 'plates' },
    scenes: [
      {
        label: 'Subduction',
        lines: [
          'The dense ocean plate sinks under the continent. Water squeezed out of it melts the mantle above.',
          'The magma rises to build a volcanic arc and coastal mountains, like the Andes.',
        ],
        plates: { boundary: 'subduction' },
      },
      {
        label: 'Collision',
        lines: [
          'Two continents meet and neither sinks.',
          'The crust folds and thickens into high ranges like the Himalayas.',
        ],
        plates: { boundary: 'collision' },
      },
      {
        label: 'Rift',
        lines: [
          'The crust stretches and breaks on normal faults.',
          'The valley widens and deepens, and the sea may flood it.',
        ],
        plates: { boundary: 'rift' },
      },
      {
        label: 'Ridge and mantle',
        lines: [
          'Convection currents in the mantle rise under the ridge and spread outward.',
          'They carry the plates apart, and new ocean floor forms in the gap.',
        ],
        plates: { boundary: 'divergent', mantle: true },
      },
    ],
  },

  // ── Earth's history: the early Earth, its atmosphere and life (HS-ESS2-7, HS-ESS1-6) ──
  {
    kind: 'sequence',
    id: 's.12.earth-history~oxygen',
    title: 'How oxygen filled the air',
    use: 'Use this for “How did the first photosynthesis change Earth’s air, and what did it leave in the rocks?”',
    assumptions: [
      'Oxygen first reacted with iron; only after the iron was used up did it build up in the air.',
      'Red beds need oxygen in the air, so they date its rise.',
    ],
    question: 'Put the changes to Earth’s early air and oceans in order.',
    stages: [
      { label: 'Volcanoes release water vapor, carbon dioxide and nitrogen' },
      { label: 'Water vapor condenses, and rain fills the first oceans' },
      { label: 'Cyanobacteria in the sea release oxygen by photosynthesis' },
      {
        label: 'The oxygen rusts dissolved iron into banded iron layers on the seafloor',
        figure: { kind: 'rock', texture: 'layers' },
      },
      {
        label: 'Oxygen builds up in the air, and iron rusts on land into red beds',
        figure: { kind: 'rock', texture: 'grains' },
      },
      { label: 'An ozone layer forms and blocks UV, so life can move onto land' },
    ],
  },
  {
    kind: 'sort',
    id: 's.12.earth-history~atmosphere',
    title: 'Early Earth’s air and today’s',
    use: 'Use this for “How was Earth’s early atmosphere different from today’s, and what changed it?”',
    assumptions: [
      'The first lasting air came from gases released by volcanoes.',
      'Photosynthesis added the oxygen; rain, rock and life took out most of the carbon dioxide.',
    ],
    question: 'Does it describe early Earth’s air or today’s air?',
    bins: [
      {
        id: 'early',
        label: 'Early Earth (about 4 billion years ago)',
        why: 'Volcanic gases made this air before any life could release oxygen.',
      },
      {
        id: 'today',
        label: 'Today',
        why: 'Billions of years of photosynthesis made this air.',
      },
    ],
    cards: [
      { label: 'Almost no free oxygen', bin: 'early' },
      { label: 'Far more carbon dioxide', bin: 'early' },
      { label: 'No ozone layer, so UV reaches the ground', bin: 'early' },
      { label: 'Rich in water vapor that later rained out', bin: 'early' },
      { label: 'About 21% oxygen', bin: 'today' },
      { label: 'Mostly nitrogen and oxygen', bin: 'today' },
      { label: 'An ozone layer blocks most UV', bin: 'today' },
      { label: 'Its oxygen was made by photosynthesis', bin: 'today' },
    ],
  },
  {
    kind: 'sequence',
    id: 's.12.earth-history~life',
    title: 'The history of life',
    use: 'Use this for “Put the major steps in the history of life in order, from the first cells to humans.”',
    assumptions: [
      'Each step built on the ones before.',
      'Mass extinctions cleared the way for new groups.',
    ],
    question: 'Put the steps in the history of life in order.',
    stages: [
      { label: 'The first single-celled life appears in the sea' },
      { label: 'Cells with a nucleus appear after oxygen builds up' },
      { label: 'Soft-bodied many-celled animals live on the seafloor' },
      { label: 'Animals with shells and skeletons spread in the Cambrian' },
      { label: 'Plants, then animals, move onto land' },
      { label: 'Dinosaurs and the first mammals appear' },
      { label: 'An asteroid ends the dinosaurs, and mammals spread' },
      { label: 'Humans appear' },
    ],
  },

  // ── Weathering, erosion, groundwater, glaciers and wind (HS-ESS2-1, HS-ESS2-5) ──
  {
    kind: 'explore',
    id: 's.12.surface-processes',
    assumptions: [
      'Weathering breaks rock in place; erosion carries it away.',
      'Water, ice and wind each leave their own shapes.',
    ],
    figure: { kind: 'landforms' },
    scenes: [
      {
        label: 'River valley',
        lines: [
          'A stream cuts down into its bed, and the slopes slide in.',
          'The valley is a narrow V.',
        ],
        landform: { kind: 'vValley' },
      },
      {
        label: 'Glacial valley',
        lines: [
          'A glacier scrapes the valley’s floor and walls wide.',
          'When the ice melts, a U shape with steep walls is left.',
        ],
        landform: { kind: 'uValley' },
      },
      {
        label: 'Meander',
        lines: [
          'The fastest water erodes the cut bank on the outside of a bend; slow water drops a point bar inside.',
          'A cut-off loop leaves an oxbow lake.',
        ],
        landform: { kind: 'meander' },
      },
      {
        label: 'Aquifer',
        lines: [
          'Water fills the pores in the rock below the water table.',
          'Pumping faster than rain refills it lowers the table, and a shallow well goes dry.',
        ],
        landform: { kind: 'aquifer' },
      },
      {
        label: 'Dunes',
        lines: [
          'Wind bounces sand up the gentle side of the dune.',
          'At the top the sand slides down the 33° slip face, so the dune creeps downwind.',
        ],
        landform: { kind: 'dunes' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.12.surface-processes~weathering',
    title: 'Mechanical or chemical weathering?',
    use: 'Use this for “Is frost wedging mechanical or chemical weathering? What about rust?”',
    assumptions: [
      'Mechanical weathering breaks rock into smaller pieces of the same minerals.',
      'Chemical weathering changes the minerals into new substances, faster where it is warm and wet.',
    ],
    question: 'How does this break rock down?',
    bins: [
      {
        id: 'mechanical',
        label: 'Mechanical (pieces, same minerals)',
        why: 'A force pries or splits the rock, but what it is made of stays the same.',
      },
      {
        id: 'chemical',
        label: 'Chemical (new substances)',
        why: 'Water, acids and oxygen react with the minerals and make new ones.',
      },
    ],
    cards: [
      { label: 'Frost wedging', bin: 'mechanical' },
      { label: 'Roots growing in cracks', bin: 'mechanical' },
      { label: 'Salt crystals growing', bin: 'mechanical' },
      { label: 'Sheets peeling off as rock above erodes', bin: 'mechanical' },
      { label: 'Carbonic acid dissolving limestone', bin: 'chemical' },
      { label: 'Iron minerals rusting', bin: 'chemical' },
      { label: 'Feldspar turning to clay', bin: 'chemical' },
      { label: 'Acid rain on marble', bin: 'chemical' },
    ],
  },
  {
    kind: 'sort',
    id: 's.12.surface-processes~agents',
    title: 'Water, ice or wind?',
    use: 'Use this for “Which agent of erosion carved a U-shaped valley?”',
    assumptions: [
      'Each agent erodes and drops sediment in its own way.',
      'Water sorts sediment by size; ice drops it all mixed together.',
    ],
    question: 'What made this landform?',
    bins: [
      {
        id: 'water',
        label: 'Running water or groundwater',
        why: 'Streams cut down and drop sediment where they slow; groundwater dissolves limestone.',
      },
      {
        id: 'ice',
        label: 'Glacier ice',
        why: 'Moving ice scrapes and plucks rock, then drops it in unsorted heaps.',
      },
      {
        id: 'wind',
        label: 'Wind',
        why: 'Wind lifts only fine grains, piling sand and dust and blasting rock with them.',
      },
    ],
    cards: [
      { label: 'V-shaped valley', bin: 'water' },
      { label: 'Delta', bin: 'water' },
      { label: 'Oxbow lake', bin: 'water' },
      { label: 'Limestone cave', bin: 'water' },
      { label: 'U-shaped valley', bin: 'ice' },
      { label: 'Moraine', bin: 'ice' },
      { label: 'Cirque', bin: 'ice' },
      { label: 'Erratic boulder', bin: 'ice' },
      { label: 'Sand dune', bin: 'wind' },
      { label: 'Loess', bin: 'wind' },
      { label: 'Desert pavement', bin: 'wind' },
      { label: 'Ventifact', bin: 'wind' },
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
    use: 'Use this for “Order the spans of Earth’s history, from Precambrian time to the Cenozoic Era. How long was each?”',
    assumptions: [
      'The eras are named for their life: Paleozoic means old life, Mesozoic middle and Cenozoic new.',
      'The boundaries are dated from ash beds and lava flows by radiometric dating.',
      'Earth is about 4,600 million years old.',
    ],
    question: 'Put Earth’s history in order, from its formation to today.',
    stages: [
      {
        label: 'Precambrian time: Earth forms; oxygen builds up and iron rusts into red beds',
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

  // ── Climate systems, feedbacks and climate change (HS-ESS2-4, HS-ESS3-5) ──
  {
    kind: 'explore',
    id: 's.12.climate-systems',
    assumptions: [
      'Sunlight passes through the air; the warm ground sends out infrared.',
      'CO₂ and water vapor absorb infrared and send some back down.',
    ],
    figure: { kind: 'greenhouse' },
    scenes: [
      {
        label: 'No greenhouse gases',
        lines: [
          'All the infrared from the ground escapes to space.',
          'Earth would average about −18 °C.',
        ],
        greenhouse: { view: 'energy', co2: 'none' },
      },
      {
        label: 'Before 1800',
        lines: [
          'Greenhouse gases send some infrared back down, warming the surface.',
          'With about 280 ppm of CO₂, Earth averaged about 14 °C.',
        ],
        greenhouse: { view: 'energy', co2: 'preindustrial' },
      },
      {
        label: 'Today',
        lines: [
          'Burning fossil fuels has raised CO₂ to about 420 ppm.',
          'More CO₂ sends more infrared back, and Earth averages about 15.2 °C.',
        ],
        greenhouse: { view: 'energy', co2: 'today' },
      },
      {
        label: 'Ash and smoke',
        lines: [
          'A big eruption sends sulfur gas high into the air, where it forms tiny droplets; smoke from big fires adds particles too.',
          'They reflect sunlight before it reaches the ground, which cools Earth for a year or two.',
        ],
        greenhouse: { view: 'energy', co2: 'today', particles: true },
      },
    ],
  },
  {
    kind: 'explore',
    id: 's.12.climate-systems~zones',
    title: 'Climate zones by latitude',
    use: 'Use this for “Which climate zone has warm summers and cold winters?” and why the poles are cold.',
    assumptions: [
      'The same beam of sunlight covers more ground where it strikes at a low angle.',
      'The zones’ edges, 23.5° and 66.5°, come from the tilt of Earth’s axis.',
    ],
    figure: { kind: 'greenhouse' },
    scenes: [
      {
        label: 'Tropical',
        lines: [
          'Between 23.5° N and 23.5° S the Sun is high all year.',
          'It is warm in every month.',
        ],
        greenhouse: { view: 'zones', lit: 'tropical' },
      },
      {
        label: 'Temperate',
        lines: [
          'From 23.5° to 66.5° the Sun is high in summer and low in winter.',
          'Summers are warm and winters are cold.',
        ],
        greenhouse: { view: 'zones', lit: 'temperate' },
      },
      {
        label: 'Polar',
        lines: [
          'Past 66.5° the Sun is always low, so the same beam spreads over more ground.',
          'It is cold all year.',
        ],
        greenhouse: { view: 'zones', lit: 'polar' },
      },
    ],
  },
  {
    kind: 'explore',
    id: 's.12.climate-systems~feedbacks',
    title: 'Climate feedbacks',
    use: 'Use this for “Sea ice melts as Earth warms. Does that speed up the warming or slow it down?”',
    assumptions: [
      'A positive feedback makes a change bigger; a negative feedback works against it.',
      'Feedbacks decide how much the climate changes for each added bit of CO₂.',
    ],
    figure: { kind: 'feedbackLoop' },
    scenes: [
      {
        label: 'Ice and albedo',
        lines: [
          'Ice reflects most sunlight; dark ground and sea absorb most of it.',
          'Melting ice lets in more sunlight, which melts more ice: a positive feedback.',
        ],
        loop: {
          sign: 'positive',
          back: 'more warming',
          steps: [
            { text: 'Earth warms.' },
            { text: 'Sea ice and snow melt.' },
            { text: 'Darker ground and sea absorb more sunlight.' },
          ],
        },
      },
      {
        label: 'Water vapor',
        lines: [
          'Warmer air holds more water vapor, and water vapor is a greenhouse gas.',
          'So warming adds vapor, and the vapor adds warming: a positive feedback.',
        ],
        loop: {
          sign: 'positive',
          back: 'more warming',
          steps: [
            { text: 'The air warms.' },
            { text: 'Warmer air holds more water vapor.' },
            { text: 'The vapor traps more infrared.' },
          ],
        },
      },
      {
        label: 'Rock weathering',
        lines: [
          'Rain weathers silicate rock faster when it is warm and wet, and the reaction uses up CO₂.',
          'Less CO₂ means cooling: a slow negative feedback over thousands of years.',
        ],
        loop: {
          sign: 'negative',
          back: 'cooling',
          steps: [
            { text: 'The climate gets warmer and wetter.' },
            { text: 'Silicate rock weathers faster.' },
            { text: 'CO₂ is drawn out of the air.' },
          ],
        },
      },
    ],
  },
  {
    kind: 'explore',
    id: 's.12.climate-systems~carbon-cycle',
    title: 'The fast and slow carbon cycles',
    use: 'Use this for “How do volcanoes and burning fuels return buried carbon to the air, and which is faster?”',
    assumptions: [
      'Every arrow is carbon moving from one store to another; the dashed arrow takes millions of years.',
      'Photosynthesis, respiration, decay and the ocean move carbon within years: the fast cycle.',
      'Burial, weathering and volcanoes move it over millions of years: the slow cycle.',
    ],
    figure: { kind: 'carbonCycle', volcano: true },
    scenes: [
      {
        label: 'Whole cycle',
        lines: [
          'Carbon is stored in the air, living things, dead matter, the ocean, fossil fuels and rock deep underground.',
          'Most of Earth’s carbon sits in rock, where it stays for millions of years.',
        ],
        carbon: {},
      },
      {
        label: 'Fast cycle',
        lines: [
          'Plants take CO₂ out of the air in spring and summer; respiration and decay give it back.',
          'This swap is why the CO₂ in the air rises and falls a little every year.',
        ],
        carbon: { process: 'photosynthesis' },
      },
      {
        label: 'Burial',
        lines: [
          'A little dead matter is buried before it decays and, over millions of years, becomes coal, oil and gas.',
          'Burial takes carbon out of the fast cycle.',
        ],
        carbon: { process: 'burial' },
      },
      {
        label: 'Volcanoes',
        lines: [
          'Rock carried down into the mantle melts, and volcanoes let its carbon out as CO₂.',
          'Over millions of years this balances the carbon that weathering and burial lock away.',
        ],
        carbon: { process: 'volcano' },
      },
      {
        label: 'Burning',
        lines: [
          'Burning coal, oil and gas returns carbon buried for millions of years in a few decades.',
          'People now release about 100 times as much CO₂ each year as all the world’s volcanoes.',
        ],
        carbon: { process: 'burning' },
      },
      {
        label: 'Dissolving',
        lines: [
          'The ocean takes in about a quarter of the CO₂ people release.',
          'The dissolved CO₂ makes seawater more acidic.',
        ],
        carbon: { process: 'dissolving' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.12.climate-systems~carbon',
    title: 'Adds CO₂ or takes it out?',
    use: 'Use this for “Which of these releases carbon dioxide into the atmosphere?”',
    assumptions: [
      'Carbon moves between the air, living things, the ocean and rock.',
      'Burning and breathing release it; photosynthesis and burial store it.',
    ],
    question: 'Does this add CO₂ to the air or take it out?',
    bins: [
      {
        id: 'adds',
        label: 'Adds CO₂ to the air',
        why: 'Carbon stored in rock, fuel or living things is released as CO₂.',
      },
      {
        id: 'removes',
        label: 'Takes CO₂ out of the air',
        why: 'CO₂ is built into sugars, dissolved in water or locked into rock.',
      },
    ],
    cards: [
      { label: 'A volcanic eruption', bin: 'adds' },
      {
        label: 'Burning coal in a power plant',
        bin: 'adds',
        figure: { kind: 'icon', icon: 'lumps of coal' },
      },
      { label: 'Animals breathing out', bin: 'adds' },
      { label: 'Dead leaves decaying', bin: 'adds' },
      { label: 'A forest fire', bin: 'adds' },
      { label: 'Photosynthesis making sugars', bin: 'removes' },
      { label: 'The ocean dissolving CO₂', bin: 'removes' },
      { label: 'Rain weathering silicate rock', bin: 'removes' },
      { label: 'Buried plants turning to coal', bin: 'removes' },
    ],
  },
  {
    kind: 'observe',
    id: 's.12.climate-systems~co2-record',
    title: 'The CO₂ record at Mauna Loa',
    use: 'Use this for “How fast did CO₂ rise each decade, and is the rise speeding up?”',
    assumptions: [
      'Yearly means from the air on Mauna Loa, Hawaii, far from cities, rounded to whole ppm.',
      'ppm means parts per million: molecules of CO₂ in every million molecules of air.',
    ],
    columns: ['1960', '1970', '1980', '1990', '2000', '2010', '2020'],
    rowLabel: 'CO₂',
    unit: 'ppm',
    max: 450,
    step: 1,
    initial: [317, 326, 339, 354, 370, 390, 414],
    pattern: (v) => {
      const rises = v.slice(1).map((x, i) => x - v[i]!);
      const first = rises[0]!;
      const last = rises[rises.length - 1]!;
      if (rises.some((r) => r <= 0))
        return 'The real record rises every decade. Check the values against the data.';
      if (rises.every((r, i) => i === 0 || r > rises[i - 1]!))
        return `CO₂ rises every decade, and faster each time: about ${first} ppm in the 1960s and ${last} ppm in the 2010s.`;
      return `CO₂ rises every decade, from ${v[0]} ppm to ${v[v.length - 1]} ppm, by ${first} ppm in the 1960s and ${last} ppm in the 2010s.`;
    },
  },

  // ── Human impacts and resource management (HS-ESS3-1, HS-ESS3-2) ──
  {
    kind: 'sort',
    id: 's.12.resource-management',
    assumptions: [
      'Renewable resources are replaced by nature within a human lifetime.',
      'Fossil fuels took millions of years to form.',
    ],
    question: 'Can people use it up?',
    bins: [
      {
        id: 'renewable',
        label: 'Renewable',
        why: 'Sunlight, wind, rain, Earth’s heat and regrown trees keep coming as we use them.',
      },
      {
        id: 'nonrenewable',
        label: 'Nonrenewable',
        why: 'Coal, oil, gas and uranium are dug or pumped from the ground, and there is a limited amount.',
      },
    ],
    cards: [
      { label: 'Solar panels', bin: 'renewable', figure: { kind: 'icon', icon: 'solar panel' } },
      { label: 'Wind turbine', bin: 'renewable', figure: { kind: 'icon', icon: 'wind turbine' } },
      { label: 'Hydroelectric dam', bin: 'renewable', figure: { kind: 'icon', icon: 'dam' } },
      { label: 'Heat from deep underground', bin: 'renewable' },
      { label: 'Wood from a replanted forest', bin: 'renewable' },
      { label: 'Coal', bin: 'nonrenewable', figure: { kind: 'icon', icon: 'lumps of coal' } },
      {
        label: 'Oil from an oil rig',
        bin: 'nonrenewable',
        figure: { kind: 'icon', icon: 'oil rig' },
      },
      {
        label: 'Natural gas',
        bin: 'nonrenewable',
        figure: { kind: 'icon', icon: 'gas stove flame' },
      },
      {
        label: 'Nuclear power: uranium is mined and runs out',
        bin: 'nonrenewable',
        figure: { kind: 'icon', icon: 'nuclear power plant' },
      },
    ],
  },
  {
    kind: 'sequence',
    id: 's.12.resource-management~fossil-fuels',
    title: 'How coal forms',
    use: 'Use this for “Describe how fossil fuels such as coal form.”',
    assumptions: [
      'Oil and gas form the same way from tiny sea organisms buried in mud.',
      'The whole change takes millions of years, so fossil fuels are nonrenewable.',
    ],
    question: 'Put the steps in the formation of coal in order.',
    stages: [
      { label: 'Swamp plants die and sink into water with little oxygen' },
      { label: 'Sediment buries them; they pack into peat' },
      { label: 'Heat and pressure turn peat into lignite' },
      { label: 'Deeper burial makes bituminous coal' },
      {
        label: 'Folding and more heat make anthracite',
        figure: { kind: 'icon', icon: 'lumps of coal' },
      },
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
    kind: 'explore',
    id: 's.12.starlight-spectra~lines',
    title: 'Matching a star’s lines to elements',
    use: 'Use this for “Which elements are in this star?” from its dark lines and lab spectra.',
    assumptions: [
      'Each element absorbs and gives off light only at its own wavelengths: its lines are a fingerprint.',
      'Cooler gas in a star’s outer layers absorbs those wavelengths, leaving dark lines in its rainbow.',
      'An element is in the star only if every one of its lines appears there.',
    ],
    figure: { kind: 'spectra' },
    scenes: [
      {
        label: 'The star',
        lines: [
          'The star’s light, spread into a rainbow, has dark lines where some wavelengths are missing.',
          'Below it are the bright lines of hydrogen, helium and sodium measured in a lab.',
        ],
        spectra: { star: ['H', 'Na'] },
      },
      {
        label: 'Hydrogen',
        lines: [
          'Each of hydrogen’s four visible lines matches a dark line in the star.',
          'The star contains hydrogen.',
        ],
        spectra: { star: ['H', 'Na'], lit: 'H' },
      },
      {
        label: 'Helium',
        lines: [
          'Helium’s yellow line sits close to sodium’s, but its blue and red lines have no dark line to match.',
          'Helium does not show in this star’s spectrum.',
        ],
        spectra: { star: ['H', 'Na'], lit: 'He' },
      },
      {
        label: 'Sodium',
        lines: [
          'Sodium’s pair of yellow lines and its fainter lines all match dark lines in the star.',
          'The star contains sodium.',
        ],
        spectra: { star: ['H', 'Na'], lit: 'Na' },
      },
    ],
  },
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

  // ── Exoplanets and the search for life (HS-ESS1-4, HS-ESS1-1) ──
  {
    kind: 'sort',
    id: 's.12.exoplanets~methods',
    title: 'How exoplanets are found',
    use: 'Use this for “Which planets are easiest to find by transits, by the Doppler wobble or by imaging?”',
    assumptions: [
      'A planet is far fainter than its star, so most are found by what they do to the star.',
      'Big planets close to their star are the easiest to find by transits and by wobble.',
    ],
    question: 'Which method is it?',
    bins: [
      {
        id: 'transit',
        label: 'Transit (the star dims)',
        why: 'The planet passes in front of the star and blocks a little of its light.',
      },
      {
        id: 'wobble',
        label: 'Radial velocity (the star wobbles)',
        why: 'The planet’s pull swings the star toward and away from us, shifting its lines.',
      },
      {
        id: 'image',
        label: 'Direct imaging',
        why: 'A telescope blocks the star and records the planet’s own light.',
      },
    ],
    cards: [
      { label: 'Gives the planet’s size', bin: 'transit' },
      { label: 'Needs the orbit edge-on to us', bin: 'transit' },
      { label: 'The star dims on a regular schedule', bin: 'transit' },
      { label: 'Gives a lowest possible mass for the planet', bin: 'wobble' },
      { label: 'The star’s lines shift red, then blue', bin: 'wobble' },
      { label: 'Measures the star’s speed toward and away from us', bin: 'wobble' },
      { label: 'Blocks the star’s glare to catch the planet’s own light', bin: 'image' },
      { label: 'Works best for big, young planets far from their star', bin: 'image' },
    ],
  },
  {
    kind: 'sort',
    id: 's.12.exoplanets~life',
    title: 'Searching for life',
    use: 'Use this for “Which findings would show a world could hold life, and which would show life itself?”',
    assumptions: [
      'Life as we know it needs liquid water, energy and carbon-based chemistry.',
      'A world that could hold life is not proof that it does.',
    ],
    question: 'What does this finding tell us?',
    bins: [
      {
        id: 'habitable',
        label: 'Habitable: life could live there',
        why: 'These make a world able to hold life, but no life has been found yet.',
      },
      {
        id: 'bio',
        label: 'Biosignature: a sign of life',
        why: 'Living things leave these, and they are hard to explain without life.',
      },
      {
        id: 'techno',
        label: 'Technosignature: a sign of technology',
        why: 'Only a technology would send these; SETI listens and looks for them.',
      },
    ],
    cards: [
      { label: 'Liquid water on its surface', bin: 'habitable' },
      { label: 'An orbit inside the habitable zone', bin: 'habitable' },
      { label: 'A rocky surface under a thick enough atmosphere', bin: 'habitable' },
      { label: 'Oxygen and methane together in its air', bin: 'bio' },
      { label: 'Fossil microbes in a rock', bin: 'bio' },
      { label: 'A narrow radio signal no natural source makes', bin: 'techno' },
      { label: 'Laser flashes repeating in a pattern', bin: 'techno' },
    ],
  },
];
