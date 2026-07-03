export const quizzes = {
  'amount-of-substance': [
    {
      id: 'q1',
      prompt: 'Which equation calculates amount of substance from mass and molar mass?',
      options: [
        { id: 'a', text: 'n = m × Mr' },
        { id: 'b', text: 'n = m / Mr' },
        { id: 'c', text: 'n = Mr / m' }
      ],
      answer: 'b',
      explanation: 'Amount of substance equals mass divided by molar mass.'
    },
    {
      id: 'q2',
      prompt: 'What volume unit must be used when concentration is in mol dm-3?',
      options: [
        { id: 'a', text: 'cm³' },
        { id: 'b', text: 'mL' },
        { id: 'c', text: 'dm³' }
      ],
      answer: 'c',
      explanation: 'Concentration in mol dm⁻³ requires volume in dm³.'
    },
    {
      id: 'q3',
      prompt: 'A balanced equation gives the ratio between substances in terms of:',
      options: [
        { id: 'a', text: 'moles' },
        { id: 'b', text: 'grams' },
        { id: 'c', text: 'cm³ only' }
      ],
      answer: 'a',
      explanation: 'Coefficients in balanced equations represent mole ratios.'
    },
    {
      id: 'q4',
      prompt: 'How many moles are present in 12.0 g of carbon atoms? Ar(C) = 12.0',
      options: [
        { id: 'a', text: '0.500 mol' },
        { id: 'b', text: '1.00 mol' },
        { id: 'c', text: '12.0 mol' }
      ],
      answer: 'b',
      explanation: 'n = m / Ar = 12.0 / 12.0 = 1.00 mol.'
    },
    {
      id: 'q5',
      prompt: 'What is the volume in dm3 of 25.0 cm3?',
      options: [
        { id: 'a', text: '0.0250 dm3' },
        { id: 'b', text: '0.250 dm3' },
        { id: 'c', text: '25000 dm3' }
      ],
      answer: 'a',
      explanation: 'Divide cm3 by 1000, so 25.0 cm3 = 0.0250 dm3.'
    },
    {
      id: 'q6',
      prompt: 'How many moles are in 40.0 cm3 of 0.100 mol dm-3 NaOH?',
      options: [
        { id: 'a', text: '0.00400 mol' },
        { id: 'b', text: '0.400 mol' },
        { id: 'c', text: '4.00 mol' }
      ],
      answer: 'a',
      explanation: 'V = 0.0400 dm3, then n = c x V = 0.100 x 0.0400 = 0.00400 mol.'
    },
    {
      id: 'q7',
      prompt: 'At room temperature and pressure, what volume does 0.250 mol of gas occupy?',
      options: [
        { id: 'a', text: '6.00 dm3' },
        { id: 'b', text: '12.0 dm3' },
        { id: 'c', text: '24.0 dm3' }
      ],
      answer: 'a',
      explanation: 'At room temperature and pressure, volume = moles x 24.0 dm3 mol-1, so 0.250 x 24.0 = 6.00 dm3.'
    },
    {
      id: 'q8',
      prompt: 'For 2H2 + O2 -> 2H2O, what is the mole ratio H2:O2?',
      options: [
        { id: 'a', text: '1:1' },
        { id: 'b', text: '2:1' },
        { id: 'c', text: '1:2' }
      ],
      answer: 'b',
      explanation: 'The balanced equation shows 2 mol H2 reacts with 1 mol O2.'
    },
    {
      id: 'q9',
      prompt: 'A compound has mole ratio C:H = 1:4. What is its empirical formula?',
      options: [
        { id: 'a', text: 'CH4' },
        { id: 'b', text: 'C4H' },
        { id: 'c', text: 'C2H8' }
      ],
      answer: 'a',
      explanation: 'The empirical formula is the simplest whole-number ratio, so C:H = 1:4 gives CH4.'
    },
    {
      id: 'q10',
      prompt: 'A limiting reagent is the reactant that:',
      options: [
        { id: 'a', text: 'has the greatest mass at the start' },
        { id: 'b', text: 'is used up first' },
        { id: 'c', text: 'has the largest Mr' }
      ],
      answer: 'b',
      explanation: 'The limiting reagent is completely used up first and controls the maximum amount of product.'
    }
  ],
  kinetics: [
    {
      id: 'q1',
      prompt: 'What does a first-order relationship mean?',
      options: [
        { id: 'a', text: 'Doubling concentration has no effect on rate.' },
        { id: 'b', text: 'Doubling concentration doubles rate.' },
        { id: 'c', text: 'Doubling concentration quadruples rate.' }
      ],
      answer: 'b',
      explanation: 'First order means rate is directly proportional to concentration.'
    },
    {
      id: 'q2',
      prompt: 'How is the rate equation determined?',
      options: [
        { id: 'a', text: 'From the overall balanced equation only.' },
        { id: 'b', text: 'From experimental rate data.' },
        { id: 'c', text: 'From the colour of the solution.' }
      ],
      answer: 'b',
      explanation: 'Rate equations are determined experimentally.'
    }
  ],
  'organic-mechanisms': [
    {
      id: 'q1',
      prompt: 'What does a curly arrow show?',
      options: [
        { id: 'a', text: 'Movement of electron pairs.' },
        { id: 'b', text: 'Movement of nuclei.' },
        { id: 'c', text: 'Movement of heat energy.' }
      ],
      answer: 'a',
      explanation: 'Curly arrows show electron-pair movement.'
    }
  ]
}
