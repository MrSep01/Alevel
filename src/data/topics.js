export const asTopics = [
  {
    id: 'amount-of-substance',
    level: 'AS',
    unit: 'Physical Chemistry',
    title: 'Amount of Substance',
    difficulty: 'Foundation',
    lessons: 6,
    progress: 20,
    description: 'Moles, molar mass, solution concentration, gas volume, empirical formula, and limiting reagents.',
    vocabulary: ['mole', 'molar mass', 'Avogadro constant', 'empirical formula', 'limiting reagent']
  },
  {
    id: 'bonding',
    level: 'AS',
    unit: 'Physical Chemistry',
    title: 'Chemical Bonding',
    difficulty: 'Foundation',
    lessons: 5,
    progress: 0,
    description: 'Ionic, covalent, metallic bonding, shapes of molecules, polarity, and intermolecular forces.',
    vocabulary: ['ionic bond', 'covalent bond', 'electronegativity', 'dipole', 'hydrogen bonding']
  },
  {
    id: 'kinetics',
    level: 'AS/A2',
    unit: 'Physical Chemistry',
    title: 'Kinetics',
    difficulty: 'Core to Advanced',
    lessons: 7,
    progress: 10,
    description: 'Collision theory, rate graphs, rate equations, orders, rate constants, and mechanisms.',
    vocabulary: ['rate', 'activation energy', 'order', 'rate constant', 'rate-determining step']
  },
  {
    id: 'periodicity',
    level: 'AS',
    unit: 'Inorganic Chemistry',
    title: 'Periodicity',
    difficulty: 'Core',
    lessons: 4,
    progress: 0,
    description: 'Period 3 trends, first ionisation energy, atomic radius, oxides, and chlorides.',
    vocabulary: ['periodic trend', 'ionisation energy', 'shielding', 'nuclear charge']
  },
  {
    id: 'organic-mechanisms',
    level: 'AS/A2',
    unit: 'Organic Chemistry',
    title: 'Organic Mechanisms',
    difficulty: 'Core to Advanced',
    lessons: 8,
    progress: 5,
    description: 'Curly arrows, nucleophiles, electrophiles, substitution, addition, elimination, and aromatic mechanisms.',
    vocabulary: ['nucleophile', 'electrophile', 'curly arrow', 'carbocation', 'mechanism']
  }
]

export const a2Topics = [
  {
    id: 'acid-base-equilibria',
    level: 'A2',
    unit: 'Physical Chemistry',
    title: 'Acid-Base Equilibria',
    difficulty: 'Advanced',
    lessons: 7,
    progress: 0,
    description: 'Ka, pH, weak acids, strong acids, buffer solutions, titration curves, and indicators.',
    vocabulary: ['Ka', 'pKa', 'buffer', 'equivalence point', 'indicator']
  },
  {
    id: 'electrochemistry',
    level: 'A2',
    unit: 'Physical Chemistry',
    title: 'Electrochemistry',
    difficulty: 'Advanced',
    lessons: 6,
    progress: 0,
    description: 'Electrode potentials, electrochemical cells, feasibility, and redox equilibria.',
    vocabulary: ['electrode potential', 'standard conditions', 'cell potential', 'redox']
  },
  {
    id: 'transition-metals',
    level: 'A2',
    unit: 'Inorganic Chemistry',
    title: 'Transition Metals',
    difficulty: 'Advanced',
    lessons: 6,
    progress: 0,
    description: 'Complex ions, ligand exchange, variable oxidation states, catalysis, and colour.',
    vocabulary: ['ligand', 'complex ion', 'coordination number', 'oxidation state']
  },
  {
    id: 'spectroscopy',
    level: 'A2',
    unit: 'Organic Chemistry',
    title: 'NMR and Spectroscopy',
    difficulty: 'Advanced',
    lessons: 6,
    progress: 0,
    description: 'Mass spectrometry, infrared spectroscopy, carbon-13 NMR, proton NMR, and structure determination.',
    vocabulary: ['chemical shift', 'splitting pattern', 'integration', 'molecular ion peak']
  }
]

export const allTopics = [...asTopics, ...a2Topics]
