export const practicalCurricula = {
  igcse: {
    label: 'IGCSE',
    title: 'IGCSE Chemistry Practical Skills',
    subtitle: 'Core and Extended practical routines for Cambridge IGCSE chemistry.',
    required: [
      {
        title: 'Separation and purification',
        focus: 'Filtration, crystallisation, evaporation, chromatography, and purity checks.',
      },
      {
        title: 'Rates of reaction',
        focus: 'Measure gas volume, mass loss, or visible change while controlling variables.',
      },
      {
        title: 'Acids, bases, and salts',
        focus: 'Prepare salts, neutralise acids, use indicators, and record observations clearly.',
      },
      {
        title: 'Qualitative analysis',
        focus: 'Identify gases, cations, anions, and unknown solutions from test results.',
      },
      {
        title: 'Electrolysis observations',
        focus: 'Predict and observe electrode products in molten and aqueous systems.',
      },
    ],
    optional: [
      'Solubility curves and crystallisation yield',
      'Energy change by simple calorimetry',
      'Rusting and corrosion conditions',
      'Water purification and testing samples',
    ],
  },
  as: {
    label: 'AS',
    title: 'AS Chemistry Practicals',
    subtitle: 'Quantitative and qualitative practical work for AS chemistry.',
    required: [
      {
        title: 'Acid-base titration',
        focus: 'Prepare standard solutions, use pipettes and burettes, calculate concentration.',
      },
      {
        title: 'Enthalpy change by calorimetry',
        focus: 'Measure temperature change, calculate q = mcΔT, and evaluate heat loss.',
      },
      {
        title: 'Reaction rate investigation',
        focus: 'Collect time data, control variables, plot graphs, and compare initial rates.',
      },
      {
        title: 'Qualitative inorganic analysis',
        focus: 'Use test reagents to identify common ions and write concise observations.',
      },
      {
        title: 'Organic functional group tests',
        focus: 'Use observations to distinguish alkenes, alcohols, carbonyls, acids, and esters.',
      },
    ],
    optional: [
      'Redox titration introduction',
      'Clock reaction and order patterns',
      'Simple distillation and reflux setup',
      'Uncertainty comparison between apparatus',
    ],
  },
  a2: {
    label: 'A2',
    title: 'A2 Chemistry Practicals',
    subtitle: 'Advanced analysis, synthesis, equilibria, and data evaluation routines.',
    required: [
      {
        title: 'Redox titration',
        focus: 'Use manganate(VII), iodine/thiosulfate, or similar systems with balanced equations.',
      },
      {
        title: 'Equilibrium and Kc investigation',
        focus: 'Use concentration data, equilibrium expressions, and assumptions clearly.',
      },
      {
        title: 'Transition metal qualitative tests',
        focus: 'Record precipitate colours, ligand exchange, redox changes, and excess reagent effects.',
      },
      {
        title: 'Organic synthesis and purification',
        focus: 'Use reflux, distillation, separation funnels, drying agents, and yield calculations.',
      },
      {
        title: 'Kinetics and rate order',
        focus: 'Process rate data, determine order, and link evidence to a rate equation.',
      },
    ],
    optional: [
      'Buffer solution preparation and pH checks',
      'Electrode potentials and electrochemical cells',
      'Chromatography for organic analysis',
      'Melting point and purity evaluation',
    ],
  },
}

export const practicalSkillReadiness = [
  'Write a clear aim, independent variable, dependent variable, and control variables.',
  'Choose suitable apparatus and justify precision, range, and repeat measurements.',
  'Build a results table with headings, units, uncertainty, and space for repeats.',
  'Identify hazards, explain risks, and choose realistic safety precautions.',
  'Process data with correct units, significant figures, graphs, gradients, and conclusions.',
  'Evaluate accuracy, reliability, anomalies, percentage uncertainty, and improvements.',
]
