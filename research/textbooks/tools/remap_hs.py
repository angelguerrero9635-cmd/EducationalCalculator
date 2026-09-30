#!/usr/bin/env python3
"""Map grades 9-12 units, lessons and practice onto the skills added when the high-school
taxonomy was aligned with the textbooks (see TAXONOMY_ISSUES.md). Idempotent: run it after
changing the rules, then tools/build.py.

A rule matches a unit, lesson or section title and applies to books of its own grade (the
Grade 9 algebra and statistics rules also to the Grade 11 and 12 books, which review them).
"""
import glob, json, os, re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOT_ALG = r"quadratic|absolute|system|radical|exponential|logarithm|trig|rational|polynomial|matri"
RULES = [
    # (skill, grades the rule applies to, pattern, pattern that vetoes it)
    ("m.9.solving-equations", "9 11", r"solving (simple |multi-step |linear )?equations|rewriting (equations|formulas)|literal equations|rearranging formulas|equations in one.variable", NOT_ALG),
    ("m.9.linear-inequalities", "9 11", r"inequalit", r"system|absolute|quadratic|polynomial|rational|triangle"),
    ("m.9.function-notation", "9 11 12", r"function notation|domain and range|features of (functions|graphs)|relations and functions|characteristics of functions|introduction to functions|^functions$", ""),
    ("m.9.piecewise-functions", "9 11", r"piecewise|step function", ""),
    ("m.9.data-displays", "9 11 12", r"box plot|histogram|standard deviation|dot plot|measures of (center|variation|spread)|shapes? of (a )?distribution|outlier|descriptive statistics|one.variable statistics|data displays|data distributions|data analysis", ""),
    ("m.9.two-way-tables", "9 10 11 12", r"two.way|frequency table", ""),
    ("m.10.parallel-lines", "10", r"parallel|transversal", r"parallelogram"),
    ("m.10.rigid-motions", "10", r"rigid|compositions?|symmetry|translations|reflections|rotations|^transformations", r"dilation|similar"),
    ("m.10.triangle-relationships", "10", r"bisector|median|midsegment|altitude|triangle inequalit|inequalities in (one|two) triangles|relationships (with)?in triangles", ""),
    ("m.10.quadrilaterals", "10", r"quadrilateral|parallelogram|trapezoid|kite|rhomb|polygon", r"area|similar"),
    ("m.10.circle-equations", "10 11 12", r"equations? of (a )?circles?", ""),
    ("m.10.probability-rules", "10 11 12", r"permutation|combination|sample space|counting|addition rule|mutually exclusive|compound events|disjoint", ""),
    ("m.11.function-transformations", "11 12", r"transformations? of (functions|graphs|linear|quadratic|parent|exponential)|parent functions|shift|stretch", ""),
    ("m.11.polynomial-equations", "11 12", r"(rational|irrational) roots?|fundamental theorem of algebra|polynomial equations|solving polynomial|zeros of polynomial", ""),
    ("m.11.radical-functions", "11", r"radical (functions|equations)|square root functions|solving radical", ""),
    ("m.11.study-design", "11 12", r"study design|experiment|observational|surveys?|sampling method|random sampl|collecting data|data collection|sampling and data", r"probability"),
    ("m.12.inverse-trig", "11 12", r"inverse trig", ""),
    ("m.12.sampling-distributions", "11 12", r"sampling distribution|central limit", ""),
    ("m.12.confidence-intervals", "11 12", r"confidence interval", ""),
    ("m.12.chi-square", "12", r"chi.square", ""),
    ("s.9.cellular-energy", "9", r"photosynthesis|cellular respiration|metabolism|energy in cells|matter and energy in living|atp|fermentation", ""),
    ("s.9.biotechnology", "9", r"biotechnolog|genetic engineering|genom|gene expression|gene regulation|mutation|dna technology", ""),
    ("s.9.classification", "9", r"classification|taxonom|phylogen|diversity|prokaryotes|protists|fungi|plants|invertebrates|vertebrates|viruses", r"plant (form|reproduction|nutrition|systems)|soil"),
    ("s.9.ecosystem-dynamics", "9", r"ecosystem|biogeochemical|succession|biodiversity|community ecology|biosphere", r"human"),
    ("s.9.immune-disease", "9", r"immune|disease|pathogen", ""),
    ("s.10.measurement", "10", r"measurement|significant figures|analyzing data|essential ideas|dimensional analysis|introduction to chemistry", ""),
    ("s.10.electrons-in-atoms", "10", r"electrons? in atoms|electron configuration|electronic structure|quantum", ""),
    ("s.10.molecular-shape", "10", r"molecular (shape|geometry)|vsepr|intermolecular|polarity|liquids and solids|states of matter|physical properties of materials", ""),
    ("s.10.reaction-types", "10", r"chemical reactions|balancing|types of (chemical )?reactions|chemical equations", r"rates?|world"),
    ("s.10.redox", "10", r"redox|oxidation|electrochem", ""),
    ("s.10.organic", "10", r"organic|hydrocarbon|functional group", ""),
    ("s.10.nuclear-chemistry", "10", r"nuclear|radioactiv|half.life|fission|fusion", ""),
    ("s.11.kinematics-1d", "11", r"one dimension|representing motion|accelerated motion|^acceleration|position and motion|describing (position|motion)|displacement", r"two dimension"),
    ("s.11.thermodynamics", "11", r"thermal energy|thermodynamics|heat", ""),
    ("s.11.electrostatics", "11", r"static electricity|electric (fields?|forces|charge)|coulomb|electrostatic", ""),
    ("s.11.modern-physics", "11", r"quantum|relativity|photoelectric|particle physics|^the atom", ""),
    ("s.12.minerals-rocks", "12", r"minerals?|\brocks\b", r"ages of rocks"),
    ("s.12.volcanoes-mountains", "12", r"volcan|igneous activity|mountain|deformation", ""),
    ("s.12.surface-processes", "12", r"weathering|erosion|mass movement|running water|groundwater|glaciers?|deserts?", ""),
    ("s.12.atmosphere-weather", "12", r"atmosphere|air pressure|\bwind\b|weather|storms|moisture|clouds", r"ocean.atmosphere"),
    ("s.12.solar-system", "12", r"solar system|planets|comets|asteroids|moons|pluto|cosmic samples|other worlds|cratered", ""),
    ("s.12.starlight-spectra", "12", r"spectra|starlight|telescopes?|instruments|celestial census", ""),
    # Skills added after Grades 9–12 were built (TAXONOMY_ISSUES, "Grades 9–12 topics without a skill").
    ("m.9.units-precision", "9", r"accuracy|precision|reasoning with (units|quantities)|units and quantities", ""),
    ("m.10.modeling-density", "10", r"density|modeling with geometry|geometric modeling|design problems", ""),
    ("m.12.vectors-3d", "11 12", r"three.dimension|3.?d vectors|cross product|vectors in space", ""),
    ("m.12.matrix-transformations", "11 12", r"linear transformation|matri\w* (and|as) transformation|transformations? (with|using) matri", ""),
    ("m.12.polar-conics", "11 12", r"polar equations of conics|rotation of (the )?axes|rotating axes", ""),
    ("m.12.partial-fractions", "11 12", r"partial fraction", ""),
    ("m.12.induction", "11 12", r"induction", ""),
    ("m.12.area-under-curve", "11 12", r"area (under|problem)|limits? of sequences|integral", ""),
    ("m.12.regression-inference", "11 12", r"inference for regression|regression inference|slope of a regression|inference (about|for) (the )?slope", ""),
    ("m.12.anova", "11 12", r"anova|analysis of variance|f.distribution", ""),
    ("s.9.reproduction-development", "9", r"reproduction|development|embryo", r"plant|cell"),
    ("s.9.plant-biology", "9", r"plant (form|reproduction|nutrition|systems|structure|biology|diversity|growth|responses)|^plants", ""),
    ("s.9.biomes", "9", r"biomes?|aquatic ecosystem|land ecosystem", ""),
    ("s.9.nervous-system", "9", r"nervous|senses|sensory|neuron|brain", ""),
    ("s.10.phase-colligative", "10", r"colligative|vapor pressure|phase (change|diagram)|properties of solutions", ""),
    ("s.10.entropy-free-energy", "10", r"entropy|free energy|spontan", ""),
    ("s.11.rotation", "11", r"torque|rotation|rotational|static equilibrium", ""),
    ("s.11.oscillations", "11", r"harmonic|oscillat|periodic motion|pendulum|springs", ""),
    ("s.11.electric-potential", "11", r"electric potential|capacit|potential difference", ""),
    ("s.12.earth-history", "12", r"earth.s history|earth history|early earth|history of life|precambrian|paleozoic|mesozoic|cenozoic", ""),
    ("s.12.exoplanets", "12", r"exoplanet|life in the universe|extraterrestrial|astrobiology|search for life", ""),
    ("s.12.ocean-atmosphere", "12", r"ocean floor|seafloor|ocean basins", ""),
    ("m.10.circle-equations", "10", r"circles in the coordinate plane|completing the square|circle.s equation", ""),
]
RULES = [(s, g.split(), re.compile(p, re.I), re.compile(v, re.I) if v else None) for s, g, p, v in RULES]


def matches(title, grade, subject):
    out = []
    for skill, grades, pat, veto in RULES:
        if skill[0] != subject[0] or grade not in grades:
            continue
        if title and pat.search(title) and not (veto and veto.search(title)):
            out.append(skill)
    return out


def remap_tocs():
    for path in glob.glob(os.path.join(BASE, "toc", "*", "*.json")):
        t = json.load(open(path, encoding="utf-8"))
        changed = False
        for book in t["books"]:
            g = str(book.get("grade"))
            if g not in ("9", "10", "11", "12"):
                continue
            for unit in book.get("units", []):
                found = matches(unit.get("title", ""), g, t["subject"])
                for lesson in unit.get("lessons", []):
                    ls = matches(lesson.get("title", ""), g, t["subject"])
                    if ls and "skills" in lesson:
                        new = [s for s in ls if s not in lesson["skills"]]
                        if new:
                            lesson["skills"] = new + lesson["skills"]
                            changed = True
                    found += ls
                new = [s for s in dict.fromkeys(found) if s not in unit.get("skills", [])]
                if new:
                    unit["skills"] = new + unit.get("skills", [])
                    changed = True
        if changed:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(t, f, ensure_ascii=False, indent=2)
                f.write("\n")


def remap_practice():
    for path in glob.glob(os.path.join(BASE, "practice", "*", "*.jsonl")):
        grade = os.path.basename(path).split(".")[0]
        if grade not in ("9", "10", "11", "12"):
            continue
        rows, changed = [], False
        for line in open(path, encoding="utf-8"):
            r = json.loads(line)
            ch = r.get("chapter") or {}
            title = " / ".join(x for x in (ch.get("lessonTitle"), ch.get("sectionTitle")) if x)
            found = matches(title, grade, r.get("subject", "math"))
            if found and r.get("skillId") != found[0]:
                old = r.get("skillId")
                r["skillId"] = found[0]
                r["alsoSkills"] = [s for s in [old, *r.get("alsoSkills", [])] if s and s != found[0]]
                changed = True
            rows.append(r)
        if changed:
            with open(path, "w", encoding="utf-8") as f:
                for r in rows:
                    f.write(json.dumps(r, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    remap_tocs()
    remap_practice()
