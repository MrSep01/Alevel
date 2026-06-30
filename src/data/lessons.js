export const lessonContent = {
  'amount-of-substance': {
    title: 'Amount of Substance: From Particles to Calculations',
    overview: 'This topic connects the invisible particle model to measurable laboratory quantities such as mass, volume, and concentration.',
    priorKnowledge: [
      'I can rearrange simple equations.',
      'I can convert cm³ to dm³.',
      'I can balance symbol equations.',
      'I know that atoms, ions, and molecules are particles.'
    ],
    vocabulary: [
      { term: 'mole', definition: 'The amount of substance containing 6.02 × 10²³ particles.' },
      { term: 'molar mass', definition: 'The mass of one mole of a substance, usually in g mol⁻¹.' },
      { term: 'Avogadro constant', definition: 'The number of particles in one mole: 6.02 × 10²³ mol⁻¹.' },
      { term: 'empirical formula', definition: 'The simplest whole-number ratio of atoms of each element in a compound.' },
      { term: 'limiting reagent', definition: 'The reactant that is used up first and limits the amount of product formed.' }
    ],
    flashcards: [
      { front: 'mole', back: 'A counting unit for particles: 6.02 × 10²³ particles.' },
      { front: 'n = m / Mr', back: 'Used to calculate moles from mass and molar mass.' },
      { front: 'c = n / V', back: 'Concentration equals moles divided by volume in dm³.' },
      { front: 'limiting reagent', back: 'The reactant that runs out first.' }
    ],
    steps: [
      {
        title: 'Connect particles to moles',
        content: 'Chemists use the mole to count particles indirectly. One mole of any substance contains the same number of particles, but different substances have different masses per mole.'
      },
      {
        title: 'Use mass and molar mass',
        content: 'When mass is given, divide by molar mass to find amount of substance. Always check that mass is in grams and molar mass is in g mol⁻¹.'
      },
      {
        title: 'Use concentration and volume',
        content: 'For solutions, amount of substance depends on concentration and volume. The volume must be converted from cm³ to dm³ before using c = n/V.'
      },
      {
        title: 'Apply stoichiometric ratios',
        content: 'Balanced equations show mole ratios. Use the ratio to move from moles of a known substance to moles of the unknown substance.'
      }
    ],
    misconception: 'Students often treat mole ratio and mass ratio as the same. Balanced equations give mole ratios, not mass ratios.'
  },

  kinetics: {
    title: 'Kinetics: Rate, Order, and Mechanism',
    overview: 'This topic explains how quickly reactions happen and how evidence from rate data can reveal the rate-determining step.',
    priorKnowledge: [
      'I can explain collision theory.',
      'I can calculate gradient from a graph.',
      'I can interpret concentration changes.',
      'I understand that catalysts provide an alternative route.'
    ],
    vocabulary: [
      { term: 'rate of reaction', definition: 'Change in concentration of a reactant or product per unit time.' },
      { term: 'order', definition: 'The power to which a concentration term is raised in the rate equation.' },
      { term: 'rate constant', definition: 'The proportionality constant in the rate equation.' },
      { term: 'rate-determining step', definition: 'The slow step in a mechanism that controls the overall rate.' }
    ],
    flashcards: [
      { front: 'zero order', back: 'Changing concentration has no effect on rate.' },
      { front: 'first order', back: 'Doubling concentration doubles the rate.' },
      { front: 'second order', back: 'Doubling concentration quadruples the rate.' },
      { front: 'RDS', back: 'The slow step in a reaction mechanism.' }
    ],
    steps: [
      {
        title: 'Measure rate',
        content: 'Rate can be found from concentration-time data by calculating the gradient. Initial rate is taken near the start of the reaction.'
      },
      {
        title: 'Determine order',
        content: 'Compare experiments where one concentration changes and the other concentrations stay constant.'
      },
      {
        title: 'Write the rate equation',
        content: 'The rate equation includes only species that affect rate. It is determined experimentally, not from the overall balanced equation.'
      }
    ],
    misconception: 'The rate equation cannot usually be predicted from the overall balanced equation.'
  },

  'organic-mechanisms': {
    title: 'Organic Mechanisms: Evidence and Electron Movement',
    overview: 'This topic focuses on how organic reactions happen, using curly arrows to show electron-pair movement.',
    priorKnowledge: [
      'I can identify functional groups.',
      'I can distinguish a nucleophile from an electrophile.',
      'I can recognise polar bonds.',
      'I can draw displayed and skeletal formulae.'
    ],
    vocabulary: [
      { term: 'nucleophile', definition: 'An electron-pair donor attracted to electron-deficient centres.' },
      { term: 'electrophile', definition: 'An electron-pair acceptor attracted to electron-rich centres.' },
      { term: 'curly arrow', definition: 'A symbol showing movement of an electron pair.' },
      { term: 'carbocation', definition: 'A positively charged carbon intermediate.' }
    ],
    flashcards: [
      { front: 'curly arrow', back: 'Shows movement of an electron pair.' },
      { front: 'nucleophile', back: 'Electron-pair donor.' },
      { front: 'electrophile', back: 'Electron-pair acceptor.' },
      { front: 'SN2', back: 'One-step nucleophilic substitution with backside attack.' }
    ],
    steps: [
      {
        title: 'Identify electron-rich and electron-poor sites',
        content: 'Nucleophiles attack electron-deficient atoms. Electrophiles react with electron-rich regions such as pi bonds.'
      },
      {
        title: 'Draw curly arrows correctly',
        content: 'Curly arrows start at an electron pair and point to where the electron pair moves.'
      },
      {
        title: 'Connect mechanism to evidence',
        content: 'Rate data, stereochemical outcomes, and substrate structure can support one pathway over another.'
      }
    ],
    misconception: 'Curly arrows do not show atoms moving. They show movement of electron pairs.'
  }
}
