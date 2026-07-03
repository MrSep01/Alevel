import { useMemo, useState } from 'react'
import { Atom, Beaker, BookOpen, CheckCircle2, FlaskConical, GraduationCap, Lock, Scale, Wind } from 'lucide-react'
import Flashcards from './Flashcards.jsx'
import QuizBlock from './QuizBlock.jsx'
import MoleCalculator from '../tools/MoleCalculator.jsx'
import ConcentrationCalculator from '../tools/ConcentrationCalculator.jsx'
import FormulaMassCalculator from '../tools/FormulaMassCalculator.jsx'
import { quizzes } from '../data/quizzes.js'
import { useLocalStorage } from '../utils/useLocalStorage.js'

const PASS_MARK = 80

const amountLessons = [
  {
    id: 'lesson-1',
    label: 'Lesson 1',
    title: 'Mole Concept',
    icon: Atom,
    nextLessonId: 'lesson-2',
    summary: 'Define the mole, connect it to Avogadro constant, and calculate amount of substance from a number of particles.',
    objectives: [
      'Use the Cambridge definition of the mole in terms of the Avogadro constant.',
      'Use the Cambridge data-book value L = 6.022 × 10²³ mol⁻¹.',
      'Identify the counted particles in atoms, molecules, ions, electrons, and formula units.',
      'Use n = N / L and N = nL in particle-counting calculations.',
      'Give answers to a sensible number of significant figures and include the particle type.'
    ],
    priorKnowledge: [
      'I can use standard form such as 3.01 × 10²².',
      'I know atoms, molecules, and ions are particles.',
      'I can rearrange a simple equation.',
      'I understand that chemists often measure mass instead of counting particles directly.'
    ],
    teachingSections: [
      {
        title: 'Cambridge definition',
        body: 'For Cambridge International AS Chemistry 9701, amount of substance is represented by n and measured in mol. One mole contains L particles, where L is the Avogadro constant. The Cambridge data booklet gives L = 6.022 × 10²³ mol⁻¹.'
      },
      {
        title: 'What counts as a particle?',
        body: 'A particle can be an atom, molecule, ion, electron, or formula unit. The formula tells you what is being counted. 1 mol of Mg contains 6.022 × 10²³ Mg atoms. 1 mol of CO₂ contains 6.022 × 10²³ CO₂ molecules. 1 mol of NaCl contains 6.022 × 10²³ NaCl formula units, not separate NaCl molecules.'
      },
      {
        title: 'Formula choice',
        body: 'Use n = N / L when the question gives a number of particles and asks for amount of substance. Use N = nL when the question gives amount of substance and asks for number of particles. N is the number of particles and has no unit; n is the amount of substance and has unit mol; L is the Avogadro constant and has unit mol⁻¹.'
      },
      {
        title: 'Common Cambridge marking point',
        body: 'Questions often require the identity of particles in the answer. For example, 1.204 × 10²⁴ is not enough by itself; write 1.204 × 10²⁴ CO₂ molecules, Mg atoms, electrons, or formula units as appropriate.'
      }
    ],
    workedExamples: [
      {
        title: 'Particles to moles',
        question: 'Calculate the amount of Mg atoms in 3.01 × 10²² atoms of Mg.',
        steps: [
          'Write the relationship: n = N / L.',
          'Substitute: n = (3.01 × 10²²) / (6.022 × 10²³).',
          'Calculate: n = 0.0500 mol.'
        ],
        answer: '0.0500 mol of Mg atoms'
      },
      {
        title: 'Moles to particles',
        question: 'How many CO₂ molecules are present in 0.250 mol of CO₂? Use L = 6.022 × 10²³ mol⁻¹.',
        steps: [
          'Write the relationship: N = n × L.',
          'Substitute: N = 0.250 × 6.022 × 10²³.',
          'Calculate: N = 1.51 × 10²³ molecules.'
        ],
        answer: '1.51 × 10²³ CO₂ molecules'
      },
      {
        title: 'Formula units',
        question: 'Calculate the number of formula units in 0.0400 mol of sodium chloride.',
        steps: [
          'NaCl is ionic, so the counted particles are formula units.',
          'Use N = nL.',
          'Substitute: N = 0.0400 × 6.022 × 10²³.',
          'Calculate: N = 2.41 × 10²² formula units.'
        ],
        answer: '2.41 × 10²² NaCl formula units'
      }
    ],
    guidedQuestions: [
      {
        prompt: 'A sample contains 1.204 × 10²⁴ atoms of helium. Calculate the amount, in mol, of helium atoms.',
        hint: 'The question gives N, the number of particles. Use n = N / L.',
        answer: 'n = (1.204 × 10²⁴) / (6.022 × 10²³) = 2.00 mol He atoms.'
      },
      {
        prompt: 'In 2.00 mol of water molecules, calculate the amount of hydrogen atoms present.',
        hint: 'Each H₂O molecule contains two H atoms, so compare molecules to atoms before calculating particles.',
        answer: '2.00 mol H₂O contains 2 × 2.00 = 4.00 mol of H atoms.'
      },
      {
        prompt: 'A student writes that 0.100 mol of CO₂ contains 0.100 mol of atoms. Explain the error.',
        hint: 'Look at the formula CO₂ and count the atoms inside one molecule.',
        answer: '0.100 mol CO₂ means 0.100 mol of CO₂ molecules. Each molecule contains three atoms, so it contains 0.300 mol of atoms in total.'
      }
    ],
    checkpoints: [
      {
        prompt: 'Calculate the number of oxygen molecules in 0.125 mol of O₂.',
        hint: 'Use N = nL.',
        answer: 'N = 0.125 × 6.022 × 10²³ = 7.53 × 10²² O₂ molecules.'
      },
      {
        prompt: 'Calculate the amount of substance in 9.033 × 10²² sodium ions.',
        hint: 'Use n = N / L.',
        answer: 'n = (9.033 × 10²²) / (6.022 × 10²³) = 0.150 mol Na⁺ ions.'
      },
      {
        prompt: 'Calculate the number of electrons in 0.0200 mol of electrons.',
        hint: 'Electrons can be counted using the mole in the same way as atoms or molecules.',
        answer: 'N = 0.0200 × 6.022 × 10²³ = 1.20 × 10²² electrons.'
      },
      {
        prompt: '0.500 mol of CH₄ molecules contains how many moles of hydrogen atoms?',
        hint: 'Each CH₄ molecule contains four H atoms.',
        answer: '0.500 mol CH₄ contains 4 × 0.500 = 2.00 mol of H atoms.'
      }
    ],
    exitTicket: [
      {
        id: 'l1-q1',
        prompt: 'One mole contains:',
        options: [
          { id: 'a', text: '6.022 × 10²³ particles' },
          { id: 'b', text: '6.02 × 10⁻²³ particles' },
          { id: 'c', text: '24.0 particles' }
        ],
        answer: 'a',
        explanation: 'One mole contains the Avogadro constant of particles, L = 6.022 × 10²³ mol⁻¹.'
      },
      {
        id: 'l1-q2',
        prompt: 'Which equation calculates moles from number of particles?',
        options: [
          { id: 'a', text: 'n = N × L' },
          { id: 'b', text: 'n = N / L' },
          { id: 'c', text: 'n = L / N' }
        ],
        answer: 'b',
        explanation: 'Amount in moles equals number of particles divided by the Avogadro constant.'
      },
      {
        id: 'l1-q3',
        prompt: 'How many moles are in 3.01 × 10²³ molecules?',
        options: [
          { id: 'a', text: '0.500 mol' },
          { id: 'b', text: '1.00 mol' },
          { id: 'c', text: '2.00 mol' }
        ],
        answer: 'a',
        explanation: '3.01 × 10²³ is half of 6.02 × 10²³, so it is 0.500 mol.'
      },
      {
        id: 'l1-q4',
        prompt: 'How many molecules are present in 2.00 mol of oxygen molecules?',
        options: [
          { id: 'a', text: '3.01 × 10²³' },
          { id: 'b', text: '6.02 × 10²³' },
          { id: 'c', text: '1.204 × 10²⁴' }
        ],
        answer: 'c',
        explanation: 'N = n × L = 2.00 × 6.02 × 10²³ = 1.204 × 10²⁴ molecules.'
      },
      {
        id: 'l1-q5',
        prompt: 'One mole of CO₂ contains:',
        options: [
          { id: 'a', text: '6.022 × 10²³ CO₂ molecules' },
          { id: 'b', text: 'one mole of carbon atoms only' },
          { id: 'c', text: 'three molecules in total' }
        ],
        answer: 'a',
        explanation: 'The formula CO₂ identifies the counted particle as a molecule of carbon dioxide. Therefore, 1 mol of CO₂ contains 6.022 × 10²³ CO₂ molecules.'
      },
      {
        id: 'l1-q6',
        prompt: 'Using L = 6.022 × 10²³ mol⁻¹, calculate the number of atoms in 0.750 mol of Ne.',
        options: [
          { id: 'a', text: '4.52 × 10²³ atoms' },
          { id: 'b', text: '8.03 × 10²³ atoms' },
          { id: 'c', text: '1.25 × 10⁻²⁴ atoms' }
        ],
        answer: 'a',
        explanation: 'N = nL = 0.750 × 6.022 × 10²³ = 4.52 × 10²³ atoms.'
      },
      {
        id: 'l1-q7',
        prompt: 'A sample contains 1.8066 × 10²⁴ molecules of NH₃. What is the amount of NH₃?',
        options: [
          { id: 'a', text: '0.300 mol' },
          { id: 'b', text: '3.00 mol' },
          { id: 'c', text: '30.0 mol' }
        ],
        answer: 'b',
        explanation: 'n = N / L = (1.8066 × 10²⁴) / (6.022 × 10²³) = 3.00 mol.'
      },
      {
        id: 'l1-q8',
        prompt: 'How many moles of atoms are present in 0.200 mol of CO₂ molecules?',
        options: [
          { id: 'a', text: '0.200 mol atoms' },
          { id: 'b', text: '0.400 mol atoms' },
          { id: 'c', text: '0.600 mol atoms' }
        ],
        answer: 'c',
        explanation: 'Each CO₂ molecule contains three atoms, so 0.200 mol molecules contains 0.600 mol atoms.'
      },
      {
        id: 'l1-q9',
        prompt: 'Which particle description is most appropriate for one mole of magnesium chloride, MgCl₂?',
        options: [
          { id: 'a', text: 'one mole of MgCl₂ formula units' },
          { id: 'b', text: 'one mole of MgCl₂ molecules' },
          { id: 'c', text: 'one mole of magnesium atoms only' }
        ],
        answer: 'a',
        explanation: 'MgCl₂ is ionic, so it is best described as formula units.'
      },
      {
        id: 'l1-q10',
        prompt: 'A sample contains 0.250 mol of sulfate ions, SO₄²⁻. How many oxygen atoms are present?',
        options: [
          { id: 'a', text: '0.250 mol O atoms' },
          { id: 'b', text: '1.00 mol O atoms' },
          { id: 'c', text: '1.51 × 10²³ mol O atoms' }
        ],
        answer: 'b',
        explanation: 'Each sulfate ion contains four oxygen atoms, so 0.250 mol sulfate ions contains 1.00 mol oxygen atoms.'
      }
    ],
    teacherNotes: [
      'Students often say one mole is a mass. Keep returning to one mole as a number of particles.',
      'Ask students to name the counted particle every time: atoms, molecules, ions, or formula units.'
    ]
  },
  {
    id: 'lesson-2',
    label: 'Lesson 2',
    title: 'Moles and Mass',
    icon: Scale,
    nextLessonId: 'lesson-3',
    summary: 'Use relative formula mass to convert between mass and amount of substance.',
    objectives: [
      'Calculate Mᵣ from a formula using relative atomic masses.',
      'Use n = m / Mᵣ to calculate amount of substance from mass.',
      'Use m = n × Mᵣ to calculate mass from amount of substance.',
      'Include units correctly: mass in g, amount in mol, and molar mass in g mol⁻¹.',
      'Give answers to a sensible number of significant figures.'
    ],
    priorKnowledge: [
      'I can read chemical formulae and count atoms in a formula.',
      'I can add relative atomic masses from the periodic table.',
      'I understand that n means amount of substance in mol.',
      'I can rearrange equations such as n = m / Mᵣ.'
    ],
    teachingSections: [
      {
        title: 'Key quantities',
        body: 'In mass calculations, m is the mass of a substance in g, n is the amount of substance in mol, and Mᵣ is the relative formula mass. For molecular substances, Mᵣ is also called relative molecular mass.'
      },
      {
        title: 'Finding Mᵣ',
        body: 'Add the relative atomic masses, Aᵣ, of every atom in the formula. For CO₂, Mᵣ = 12.0 + (2 × 16.0) = 44.0. For Ca(OH)₂, Mᵣ = 40.1 + 2 × (16.0 + 1.0) = 74.1.'
      },
      {
        title: 'Mass to moles',
        body: 'Use n = m / Mᵣ when the question gives mass and asks for amount of substance. The mass must be in grams. For example, 2.20 g of CO₂ contains n = 2.20 / 44.0 = 0.0500 mol of CO₂ molecules.'
      },
      {
        title: 'Moles to mass',
        body: 'Use m = n × Mᵣ when the question gives amount of substance and asks for mass. For example, 0.250 mol of H₂O has mass m = 0.250 × 18.0 = 4.50 g.'
      }
    ],
    workedExamples: [
      {
        title: 'Calculate Mᵣ',
        question: 'Calculate Mᵣ for magnesium nitrate, Mg(NO₃)₂. Aᵣ values: Mg = 24.3, N = 14.0, O = 16.0.',
        steps: [
          'Count the atoms: 1 Mg, 2 N, and 6 O.',
          'Substitute: Mᵣ = 24.3 + (2 × 14.0) + (6 × 16.0).',
          'Calculate: Mᵣ = 148.3.'
        ],
        answer: 'Mᵣ(Mg(NO₃)₂) = 148.3'
      },
      {
        title: 'Mass to moles',
        question: 'Calculate the amount of substance in 5.00 g of calcium carbonate, CaCO₃. Mᵣ(CaCO₃) = 100.1.',
        steps: [
          'Write the relationship: n = m / Mᵣ.',
          'Substitute: n = 5.00 / 100.1.',
          'Calculate: n = 0.04995 mol.'
        ],
        answer: '0.0500 mol CaCO₃'
      },
      {
        title: 'Moles to mass',
        question: 'Calculate the mass of 0.125 mol of sodium chloride, NaCl. Mᵣ(NaCl) = 58.5.',
        steps: [
          'Write the relationship: m = n × Mᵣ.',
          'Substitute: m = 0.125 × 58.5.',
          'Calculate: m = 7.31 g.'
        ],
        answer: '7.31 g NaCl'
      }
    ],
    guidedQuestions: [
      {
        prompt: 'Calculate Mᵣ for sulfuric acid, H₂SO₄. Aᵣ values: H = 1.0, S = 32.1, O = 16.0.',
        hint: 'Count 2 H atoms, 1 S atom, and 4 O atoms.',
        answer: 'Mᵣ(H₂SO₄) = (2 × 1.0) + 32.1 + (4 × 16.0) = 98.1.'
      },
      {
        prompt: 'Calculate the amount of substance in 9.80 g of H₂SO₄. Use Mᵣ(H₂SO₄) = 98.1.',
        hint: 'The question gives mass and asks for mol, so use n = m / Mᵣ.',
        answer: 'n = 9.80 / 98.1 = 0.0999 mol, so the amount is 0.100 mol H₂SO₄.'
      },
      {
        prompt: 'Calculate the mass of 0.200 mol of glucose, C₆H₁₂O₆. Mᵣ(C₆H₁₂O₆) = 180.0.',
        hint: 'The question gives mol and asks for g, so use m = n × Mᵣ.',
        answer: 'm = 0.200 × 180.0 = 36.0 g.'
      }
    ],
    checkpoints: [
      {
        prompt: 'Calculate Mᵣ for aluminium oxide, Al₂O₃. Aᵣ values: Al = 27.0, O = 16.0.',
        hint: 'There are 2 aluminium atoms and 3 oxygen atoms.',
        answer: 'Mᵣ(Al₂O₃) = (2 × 27.0) + (3 × 16.0) = 102.0.'
      },
      {
        prompt: 'Calculate the amount of substance in 2.40 g of magnesium, Mg. Aᵣ(Mg) = 24.3.',
        hint: 'For an element, use Aᵣ in the same place as Mᵣ.',
        answer: 'n = 2.40 / 24.3 = 0.0988 mol Mg.'
      },
      {
        prompt: 'Calculate the mass of 0.0500 mol of carbon dioxide, CO₂. Mᵣ(CO₂) = 44.0.',
        hint: 'Use m = n × Mᵣ.',
        answer: 'm = 0.0500 × 44.0 = 2.20 g CO₂.'
      },
      {
        prompt: 'A student uses n = Mᵣ / m to calculate moles from mass. Explain the error.',
        hint: 'Check which quantity should become larger when mass increases.',
        answer: 'The formula is n = m / Mᵣ. Dividing Mᵣ by mass reverses the relationship and gives the wrong unit.'
      }
    ],
    exitTicket: [
      {
        id: 'l2-q1',
        prompt: 'What does m represent in n = m / Mᵣ?',
        options: [
          { id: 'a', text: 'mass in g' },
          { id: 'b', text: 'amount of substance in mol' },
          { id: 'c', text: 'relative formula mass' }
        ],
        answer: 'a',
        explanation: 'm is mass, usually measured in g for mole calculations.'
      },
      {
        id: 'l2-q2',
        prompt: 'Which equation calculates amount of substance from mass?',
        options: [
          { id: 'a', text: 'n = m / Mᵣ' },
          { id: 'b', text: 'm = n / Mᵣ' },
          { id: 'c', text: 'Mᵣ = n / m' }
        ],
        answer: 'a',
        explanation: 'Amount of substance equals mass divided by relative formula mass.'
      },
      {
        id: 'l2-q3',
        prompt: 'Calculate Mᵣ for CO₂. Aᵣ values: C = 12.0, O = 16.0.',
        options: [
          { id: 'a', text: '28.0' },
          { id: 'b', text: '44.0' },
          { id: 'c', text: '56.0' }
        ],
        answer: 'b',
        explanation: 'Mᵣ(CO₂) = 12.0 + (2 × 16.0) = 44.0.'
      },
      {
        id: 'l2-q4',
        prompt: 'How many moles are in 4.40 g of CO₂? Mᵣ(CO₂) = 44.0.',
        options: [
          { id: 'a', text: '0.100 mol' },
          { id: 'b', text: '10.0 mol' },
          { id: 'c', text: '193.6 mol' }
        ],
        answer: 'a',
        explanation: 'n = m / Mᵣ = 4.40 / 44.0 = 0.100 mol.'
      },
      {
        id: 'l2-q5',
        prompt: 'Calculate the mass of 0.250 mol of NaCl. Mᵣ(NaCl) = 58.5.',
        options: [
          { id: 'a', text: '14.6 g' },
          { id: 'b', text: '58.8 g' },
          { id: 'c', text: '234 g' }
        ],
        answer: 'a',
        explanation: 'm = n × Mᵣ = 0.250 × 58.5 = 14.6 g.'
      },
      {
        id: 'l2-q6',
        prompt: 'What is the unit of molar mass used with n = m / Mᵣ?',
        options: [
          { id: 'a', text: 'g mol⁻¹' },
          { id: 'b', text: 'mol g⁻¹' },
          { id: 'c', text: 'cm³ mol⁻¹' }
        ],
        answer: 'a',
        explanation: 'Molar mass is measured in g mol⁻¹.'
      },
      {
        id: 'l2-q7',
        prompt: 'Calculate Mᵣ for CaCO₃. Aᵣ values: Ca = 40.1, C = 12.0, O = 16.0.',
        options: [
          { id: 'a', text: '68.1' },
          { id: 'b', text: '100.1' },
          { id: 'c', text: '112.1' }
        ],
        answer: 'b',
        explanation: 'Mᵣ(CaCO₃) = 40.1 + 12.0 + (3 × 16.0) = 100.1.'
      },
      {
        id: 'l2-q8',
        prompt: 'How many moles are in 10.0 g of CaCO₃? Mᵣ(CaCO₃) = 100.1.',
        options: [
          { id: 'a', text: '0.0999 mol' },
          { id: 'b', text: '1.00 mol' },
          { id: 'c', text: '1001 mol' }
        ],
        answer: 'a',
        explanation: 'n = 10.0 / 100.1 = 0.0999 mol.'
      },
      {
        id: 'l2-q9',
        prompt: 'Which statement is correct for 1 mol of Mg atoms?',
        options: [
          { id: 'a', text: 'It has a mass of 24.3 g if Aᵣ(Mg) = 24.3.' },
          { id: 'b', text: 'It has a mass of 1.00 g.' },
          { id: 'c', text: 'It contains 24.3 atoms.' }
        ],
        answer: 'a',
        explanation: 'For Mg, 1 mol has mass equal to its molar mass: 24.3 g.'
      },
      {
        id: 'l2-q10',
        prompt: 'A 0.500 mol sample of H₂O has Mᵣ = 18.0. What is its mass?',
        options: [
          { id: 'a', text: '9.00 g' },
          { id: 'b', text: '18.5 g' },
          { id: 'c', text: '36.0 g' }
        ],
        answer: 'a',
        explanation: 'm = n × Mᵣ = 0.500 × 18.0 = 9.00 g.'
      }
    ],
    teacherNotes: [
      'Keep the triangle m, n, Mᵣ linked to units: g, mol, and g mol⁻¹.',
      'Students often forget brackets in formulae such as Mg(NO₃)₂ and Ca(OH)₂.',
      'Ask students to write the formula before substituting numbers so their method is visible.'
    ]
  },
  {
    id: 'lesson-3',
    label: 'Lesson 3',
    title: 'Moles and Solutions',
    icon: Beaker,
    nextLessonId: 'lesson-4',
    summary: 'Connect concentration, amount, and solution volume using dm³.',
    objectives: [
      'Convert volume from cm³ to dm³ before using concentration equations.',
      'Use c = n / V to calculate concentration in mol dm⁻³.',
      'Use n = cV to calculate amount of substance in a solution.',
      'Use V = n / c to calculate solution volume in dm³.',
      'Keep units visible in every substitution.'
    ],
    priorKnowledge: [
      'I can convert cm³ to dm³ by dividing by 1000.',
      'I know that n means amount of substance in mol.',
      'I can rearrange equations such as c = n / V.',
      'I can read solution concentrations written in mol dm⁻³.'
    ],
    teachingSections: [
      {
        title: 'Key quantities',
        body: 'For solutions, c is concentration in mol dm⁻³, n is amount of substance in mol, and V is volume in dm³. The equation is c = n / V.'
      },
      {
        title: 'Volume conversion',
        body: 'The most common mistake is using cm³ directly in c = n / V. Convert cm³ to dm³ first: V in dm³ = volume in cm³ / 1000. For example, 25.0 cm³ = 0.0250 dm³.'
      },
      {
        title: 'Calculating moles',
        body: 'Use n = cV when the question gives concentration and volume. For example, 50.0 cm³ of 0.200 mol dm⁻³ NaOH has V = 0.0500 dm³, so n = 0.200 × 0.0500 = 0.0100 mol.'
      },
      {
        title: 'Calculating concentration or volume',
        body: 'Use c = n / V to find concentration, and V = n / c to find volume. The volume answer from V = n / c is in dm³, so convert back to cm³ if the question asks for cm³.'
      }
    ],
    workedExamples: [
      {
        title: 'Convert and calculate moles',
        question: 'Calculate the amount of NaOH in 25.0 cm³ of 0.100 mol dm⁻³ NaOH.',
        steps: [
          'Convert volume: 25.0 cm³ = 0.0250 dm³.',
          'Write the relationship: n = cV.',
          'Substitute: n = 0.100 × 0.0250.',
          'Calculate: n = 0.00250 mol.'
        ],
        answer: '0.00250 mol NaOH'
      },
      {
        title: 'Calculate concentration',
        question: 'A solution contains 0.0150 mol of HCl in 250 cm³ of solution. Calculate its concentration.',
        steps: [
          'Convert volume: 250 cm³ = 0.250 dm³.',
          'Write the relationship: c = n / V.',
          'Substitute: c = 0.0150 / 0.250.',
          'Calculate: c = 0.0600 mol dm⁻³.'
        ],
        answer: '0.0600 mol dm⁻³ HCl'
      },
      {
        title: 'Calculate volume',
        question: 'What volume of 0.500 mol dm⁻³ Na₂CO₃ contains 0.0200 mol of Na₂CO₃?',
        steps: [
          'Write the relationship: V = n / c.',
          'Substitute: V = 0.0200 / 0.500.',
          'Calculate: V = 0.0400 dm³.',
          'Convert if needed: 0.0400 dm³ = 40.0 cm³.'
        ],
        answer: '0.0400 dm³, or 40.0 cm³'
      }
    ],
    guidedQuestions: [
      {
        prompt: 'Convert 18.5 cm³ to dm³.',
        hint: 'Divide by 1000.',
        answer: '18.5 cm³ = 0.0185 dm³.'
      },
      {
        prompt: 'Calculate the amount of H₂SO₄ in 20.0 cm³ of 0.150 mol dm⁻³ H₂SO₄.',
        hint: 'Convert cm³ to dm³ first, then use n = cV.',
        answer: 'V = 0.0200 dm³, so n = 0.150 × 0.0200 = 0.00300 mol H₂SO₄.'
      },
      {
        prompt: 'A solution contains 0.00500 mol of KOH in 100 cm³. Calculate the concentration.',
        hint: 'Use c = n / V after converting 100 cm³ to dm³.',
        answer: 'V = 0.100 dm³, so c = 0.00500 / 0.100 = 0.0500 mol dm⁻³.'
      }
    ],
    checkpoints: [
      {
        prompt: 'Calculate the amount of NaCl in 250 cm³ of 0.200 mol dm⁻³ NaCl.',
        hint: '250 cm³ = 0.250 dm³.',
        answer: 'n = cV = 0.200 × 0.250 = 0.0500 mol NaCl.'
      },
      {
        prompt: 'Calculate the concentration of a solution containing 0.0300 mol of glucose in 200 cm³.',
        hint: 'Convert 200 cm³ to 0.200 dm³, then use c = n / V.',
        answer: 'c = 0.0300 / 0.200 = 0.150 mol dm⁻³.'
      },
      {
        prompt: 'Calculate the volume, in cm³, of 0.100 mol dm⁻³ HCl needed to contain 0.0125 mol HCl.',
        hint: 'Find V in dm³ first using V = n / c, then multiply by 1000.',
        answer: 'V = 0.0125 / 0.100 = 0.125 dm³ = 125 cm³.'
      },
      {
        prompt: 'A student calculates n = 0.100 × 25.0 for 25.0 cm³ of 0.100 mol dm⁻³ NaOH. Explain the error.',
        hint: 'Check the volume unit required in n = cV.',
        answer: 'The student used 25.0 cm³ directly. They must convert to 0.0250 dm³ first, so n = 0.100 × 0.0250 = 0.00250 mol.'
      }
    ],
    exitTicket: [
      {
        id: 'l3-q1',
        prompt: 'What is 25.0 cm³ in dm³?',
        options: [
          { id: 'a', text: '0.0250 dm³' },
          { id: 'b', text: '0.250 dm³' },
          { id: 'c', text: '25 000 dm³' }
        ],
        answer: 'a',
        explanation: 'Divide cm³ by 1000: 25.0 cm³ = 0.0250 dm³.'
      },
      {
        id: 'l3-q2',
        prompt: 'Which equation calculates moles from concentration and volume?',
        options: [
          { id: 'a', text: 'n = cV' },
          { id: 'b', text: 'n = c / V' },
          { id: 'c', text: 'n = V / c' }
        ],
        answer: 'a',
        explanation: 'From c = n / V, rearrange to n = cV.'
      },
      {
        id: 'l3-q3',
        prompt: 'What is the unit of concentration in this lesson?',
        options: [
          { id: 'a', text: 'mol dm⁻³' },
          { id: 'b', text: 'g mol⁻¹' },
          { id: 'c', text: 'dm³ mol⁻¹' }
        ],
        answer: 'a',
        explanation: 'Solution concentration is measured in mol dm⁻³.'
      },
      {
        id: 'l3-q4',
        prompt: 'How many moles are in 40.0 cm³ of 0.100 mol dm⁻³ NaOH?',
        options: [
          { id: 'a', text: '0.00400 mol' },
          { id: 'b', text: '4.00 mol' },
          { id: 'c', text: '400 mol' }
        ],
        answer: 'a',
        explanation: 'V = 0.0400 dm³, so n = cV = 0.100 × 0.0400 = 0.00400 mol.'
      },
      {
        id: 'l3-q5',
        prompt: 'A solution contains 0.0200 mol in 0.500 dm³. What is its concentration?',
        options: [
          { id: 'a', text: '0.0400 mol dm⁻³' },
          { id: 'b', text: '0.250 mol dm⁻³' },
          { id: 'c', text: '25.0 mol dm⁻³' }
        ],
        answer: 'a',
        explanation: 'c = n / V = 0.0200 / 0.500 = 0.0400 mol dm⁻³.'
      },
      {
        id: 'l3-q6',
        prompt: 'What volume of 0.200 mol dm⁻³ HCl contains 0.0100 mol HCl?',
        options: [
          { id: 'a', text: '0.0500 dm³' },
          { id: 'b', text: '0.00200 dm³' },
          { id: 'c', text: '20.0 dm³' }
        ],
        answer: 'a',
        explanation: 'V = n / c = 0.0100 / 0.200 = 0.0500 dm³.'
      },
      {
        id: 'l3-q7',
        prompt: 'What is 0.0500 dm³ in cm³?',
        options: [
          { id: 'a', text: '50.0 cm³' },
          { id: 'b', text: '0.0500 cm³' },
          { id: 'c', text: '5000 cm³' }
        ],
        answer: 'a',
        explanation: 'Multiply dm³ by 1000: 0.0500 dm³ = 50.0 cm³.'
      },
      {
        id: 'l3-q8',
        prompt: 'Which volume should be substituted into n = cV for 32.0 cm³?',
        options: [
          { id: 'a', text: '0.0320 dm³' },
          { id: 'b', text: '32.0 dm³' },
          { id: 'c', text: '3200 dm³' }
        ],
        answer: 'a',
        explanation: '32.0 cm³ = 0.0320 dm³.'
      },
      {
        id: 'l3-q9',
        prompt: 'Calculate n for 0.250 dm³ of 0.400 mol dm⁻³ KOH.',
        options: [
          { id: 'a', text: '0.100 mol' },
          { id: 'b', text: '0.625 mol' },
          { id: 'c', text: '1.60 mol' }
        ],
        answer: 'a',
        explanation: 'n = cV = 0.400 × 0.250 = 0.100 mol.'
      },
      {
        id: 'l3-q10',
        prompt: 'Why must cm³ be converted to dm³ in concentration calculations?',
        options: [
          { id: 'a', text: 'Because mol dm⁻³ uses dm³ as the volume unit.' },
          { id: 'b', text: 'Because cm³ is never used in chemistry.' },
          { id: 'c', text: 'Because moles are measured in cm³.' }
        ],
        answer: 'a',
        explanation: 'The concentration unit mol dm⁻³ means moles per dm³, so volume must be in dm³.'
      }
    ],
    teacherNotes: [
      'Make students write the converted volume before substituting into n = cV.',
      'Use unit cancellation language: mol dm⁻³ × dm³ gives mol.',
      'Emphasise that V in this lesson is solution volume, not gas volume.'
    ]
  },
  {
    id: 'lesson-4',
    label: 'Lesson 4',
    title: 'Moles and Gases',
    icon: Wind,
    nextLessonId: 'lesson-5',
    summary: 'Use molar gas volume and reacting gas ratios.',
    objectives: [
      'Use molar gas volume at room temperature and pressure, RTP.',
      'Convert gas volumes between cm³ and dm³.',
      'Use n = V / 24.0 for gases at RTP when V is in dm³.',
      'Use V = n × 24.0 to calculate gas volume at RTP.',
      'Use balanced equations to compare reacting gas volumes.'
    ],
    priorKnowledge: [
      'I can convert cm³ to dm³ and dm³ to cm³.',
      'I understand that n means amount of substance in mol.',
      'I can read mole ratios from balanced equations.',
      'I can decide whether a question is asking for moles, volume, or mass.'
    ],
    teachingSections: [
      {
        title: 'Molar gas volume',
        body: 'At room temperature and pressure, RTP, 1 mol of any gas occupies 24.0 dm³. This is called the molar gas volume. It applies only to gases under the stated conditions.'
      },
      {
        title: 'Key equations',
        body: 'Use n = V / 24.0 when the question gives gas volume at RTP and asks for amount of substance. Use V = n × 24.0 when the question gives amount of gas and asks for volume. In these equations, V is gas volume in dm³.'
      },
      {
        title: 'Volume units',
        body: 'Gas volumes may be given in cm³ or dm³. Convert before substituting: 1000 cm³ = 1 dm³. For example, 96.0 cm³ = 0.0960 dm³, so n = 0.0960 / 24.0 = 0.00400 mol.'
      },
      {
        title: 'Reacting gas volumes',
        body: 'When gases are measured at the same temperature and pressure, their volume ratio is the same as their mole ratio. In CH₄ + 2O₂ → CO₂ + 2H₂O, the gas volume ratio CH₄:O₂ is 1:2.'
      }
    ],
    workedExamples: [
      {
        title: 'Gas volume to moles',
        question: 'At RTP, calculate the amount of CO₂ in 120 cm³ of CO₂ gas.',
        steps: [
          'Convert volume: 120 cm³ = 0.120 dm³.',
          'Write the relationship: n = V / 24.0.',
          'Substitute: n = 0.120 / 24.0.',
          'Calculate: n = 0.00500 mol.'
        ],
        answer: '0.00500 mol CO₂'
      },
      {
        title: 'Moles to gas volume',
        question: 'At RTP, calculate the volume of 0.250 mol of oxygen gas, O₂.',
        steps: [
          'Write the relationship: V = n × 24.0.',
          'Substitute: V = 0.250 × 24.0.',
          'Calculate: V = 6.00 dm³.',
          'Convert if needed: 6.00 dm³ = 6000 cm³.'
        ],
        answer: '6.00 dm³ O₂'
      },
      {
        title: 'Reacting gas volume',
        question: 'At the same temperature and pressure, 50.0 cm³ of hydrogen reacts with oxygen. Equation: 2H₂ + O₂ → 2H₂O. Calculate the volume of oxygen needed.',
        steps: [
          'Use the balanced equation ratio: H₂:O₂ = 2:1.',
          'For gases under the same conditions, volume ratio = mole ratio.',
          'O₂ volume = 50.0 / 2.',
          'Calculate: O₂ volume = 25.0 cm³.'
        ],
        answer: '25.0 cm³ O₂'
      }
    ],
    guidedQuestions: [
      {
        prompt: 'At RTP, calculate the amount of gas in 240 cm³ of nitrogen, N₂.',
        hint: 'Convert 240 cm³ to dm³, then use n = V / 24.0.',
        answer: 'V = 0.240 dm³, so n = 0.240 / 24.0 = 0.0100 mol N₂.'
      },
      {
        prompt: 'At RTP, calculate the volume of 0.0750 mol of ammonia gas, NH₃.',
        hint: 'Use V = n × 24.0.',
        answer: 'V = 0.0750 × 24.0 = 1.80 dm³ NH₃.'
      },
      {
        prompt: '100 cm³ of carbon monoxide reacts with oxygen. Equation: 2CO + O₂ → 2CO₂. Calculate the volume of O₂ needed at the same temperature and pressure.',
        hint: 'Use the gas volume ratio CO:O₂ = 2:1.',
        answer: 'O₂ volume = 100 / 2 = 50.0 cm³.'
      }
    ],
    checkpoints: [
      {
        prompt: 'At RTP, calculate the amount of chlorine gas, Cl₂, in 48.0 dm³.',
        hint: 'The volume is already in dm³, so use n = V / 24.0.',
        answer: 'n = 48.0 / 24.0 = 2.00 mol Cl₂.'
      },
      {
        prompt: 'At RTP, calculate the volume, in cm³, of 0.0200 mol of CO₂.',
        hint: 'Find volume in dm³ first, then multiply by 1000.',
        answer: 'V = 0.0200 × 24.0 = 0.480 dm³ = 480 cm³ CO₂.'
      },
      {
        prompt: 'Methane burns in oxygen: CH₄ + 2O₂ → CO₂ + 2H₂O. Calculate the volume of O₂ needed for 35.0 cm³ of CH₄.',
        hint: 'Use the gas volume ratio CH₄:O₂ = 1:2.',
        answer: 'O₂ volume = 35.0 × 2 = 70.0 cm³.'
      },
      {
        prompt: 'A student uses n = 240 / 24.0 for 240 cm³ of gas at RTP. Explain the error.',
        hint: 'Check the required volume unit in n = V / 24.0.',
        answer: 'The student used cm³ directly. They must convert 240 cm³ to 0.240 dm³ first, so n = 0.240 / 24.0 = 0.0100 mol.'
      }
    ],
    exitTicket: [
      {
        id: 'l4-q1',
        prompt: 'At RTP, what volume is occupied by 1 mol of gas?',
        options: [
          { id: 'a', text: '24.0 dm³' },
          { id: 'b', text: '24.0 cm³' },
          { id: 'c', text: '1.00 dm³' }
        ],
        answer: 'a',
        explanation: 'At RTP, 1 mol of gas occupies 24.0 dm³.'
      },
      {
        id: 'l4-q2',
        prompt: 'Which equation calculates moles from gas volume at RTP?',
        options: [
          { id: 'a', text: 'n = V / 24.0' },
          { id: 'b', text: 'n = V × 24.0' },
          { id: 'c', text: 'n = 24.0 / V' }
        ],
        answer: 'a',
        explanation: 'At RTP, n = gas volume in dm³ divided by 24.0 dm³ mol⁻¹.'
      },
      {
        id: 'l4-q3',
        prompt: 'What is 600 cm³ in dm³?',
        options: [
          { id: 'a', text: '0.600 dm³' },
          { id: 'b', text: '6.00 dm³' },
          { id: 'c', text: '60 000 dm³' }
        ],
        answer: 'a',
        explanation: 'Divide by 1000: 600 cm³ = 0.600 dm³.'
      },
      {
        id: 'l4-q4',
        prompt: 'At RTP, how many moles are in 6.00 dm³ of O₂?',
        options: [
          { id: 'a', text: '0.250 mol' },
          { id: 'b', text: '4.00 mol' },
          { id: 'c', text: '144 mol' }
        ],
        answer: 'a',
        explanation: 'n = V / 24.0 = 6.00 / 24.0 = 0.250 mol.'
      },
      {
        id: 'l4-q5',
        prompt: 'At RTP, what volume is occupied by 0.500 mol of CO₂?',
        options: [
          { id: 'a', text: '12.0 dm³' },
          { id: 'b', text: '24.5 dm³' },
          { id: 'c', text: '48.0 dm³' }
        ],
        answer: 'a',
        explanation: 'V = n × 24.0 = 0.500 × 24.0 = 12.0 dm³.'
      },
      {
        id: 'l4-q6',
        prompt: 'For 2H₂ + O₂ → 2H₂O, what is the gas volume ratio H₂:O₂?',
        options: [
          { id: 'a', text: '2:1' },
          { id: 'b', text: '1:2' },
          { id: 'c', text: '2:2' }
        ],
        answer: 'a',
        explanation: 'Gas volume ratios follow the balanced equation ratio under the same conditions.'
      },
      {
        id: 'l4-q7',
        prompt: 'For CH₄ + 2O₂ → CO₂ + 2H₂O, what volume of O₂ reacts with 20.0 cm³ of CH₄?',
        options: [
          { id: 'a', text: '40.0 cm³' },
          { id: 'b', text: '20.0 cm³' },
          { id: 'c', text: '10.0 cm³' }
        ],
        answer: 'a',
        explanation: 'The ratio CH₄:O₂ is 1:2, so O₂ volume = 20.0 × 2 = 40.0 cm³.'
      },
      {
        id: 'l4-q8',
        prompt: 'At RTP, how many moles are in 96.0 cm³ of CO₂?',
        options: [
          { id: 'a', text: '0.00400 mol' },
          { id: 'b', text: '4.00 mol' },
          { id: 'c', text: '2304 mol' }
        ],
        answer: 'a',
        explanation: '96.0 cm³ = 0.0960 dm³, so n = 0.0960 / 24.0 = 0.00400 mol.'
      },
      {
        id: 'l4-q9',
        prompt: 'At RTP, what volume in cm³ is occupied by 0.0100 mol of gas?',
        options: [
          { id: 'a', text: '240 cm³' },
          { id: 'b', text: '0.240 cm³' },
          { id: 'c', text: '2400 cm³' }
        ],
        answer: 'a',
        explanation: 'V = 0.0100 × 24.0 = 0.240 dm³ = 240 cm³.'
      },
      {
        id: 'l4-q10',
        prompt: 'When can gas volume ratios be read directly from a balanced equation?',
        options: [
          { id: 'a', text: 'When gases are measured at the same temperature and pressure.' },
          { id: 'b', text: 'Only when every substance is a liquid.' },
          { id: 'c', text: 'Only when volume is measured in g.' }
        ],
        answer: 'a',
        explanation: 'For gases under the same conditions, volume ratio equals mole ratio.'
      }
    ],
    teacherNotes: [
      'Keep RTP tied to 24.0 dm³ mol⁻¹ and avoid using this value for non-gases.',
      'Make students label V as gas volume here, since Lesson 3 used V for solution volume.',
      'For reacting volumes, emphasise same temperature and pressure before using equation coefficients.'
    ]
  },
  {
    id: 'lesson-5',
    label: 'Lesson 5',
    title: 'Empirical Formula',
    icon: BookOpen,
    nextLessonId: 'lesson-6',
    summary: 'Turn composition data into the simplest whole-number formula.',
    objectives: [
      'Define empirical formula as the simplest whole-number ratio of atoms.',
      'Convert masses or percentages into amounts in mol.',
      'Divide mole values by the smallest value to find a ratio.',
      'Scale decimal ratios to whole numbers when needed.',
      'Use experimental mass data to determine formulae.'
    ],
    priorKnowledge: [
      'I can calculate moles from mass using n = m / Mᵣ.',
      'I can use Aᵣ values for individual elements.',
      'I can simplify number ratios.',
      'I can recognise when a ratio needs multiplying to become whole numbers.'
    ],
    teachingSections: [
      {
        title: 'Empirical formula',
        body: 'The empirical formula is the simplest whole-number ratio of atoms of each element in a compound. For example, C₂H₆ has molecular formula C₂H₆ but empirical formula CH₃ because the ratio 2:6 simplifies to 1:3.'
      },
      {
        title: 'The core method',
        body: 'For each element, calculate moles using n = mass / Aᵣ. Then divide every mole value by the smallest mole value. The resulting whole-number ratio gives the empirical formula.'
      },
      {
        title: 'Using percentages',
        body: 'If percentage composition is given, assume 100 g of compound. Then each percentage becomes a mass in grams. For example, 40.0% carbon means 40.0 g carbon in a 100 g sample.'
      },
      {
        title: 'Scaling ratios',
        body: 'Ratios sometimes include decimals such as 1:1.5 or 1:1.33. Multiply all parts by the smallest number that makes whole numbers: 1:1.5 becomes 2:3, and 1:1.33 is usually 3:4.'
      }
    ],
    workedExamples: [
      {
        title: 'Mass composition',
        question: 'A compound contains 2.40 g carbon and 0.600 g hydrogen. Determine its empirical formula. Aᵣ values: C = 12.0, H = 1.0.',
        steps: [
          'Calculate moles: n(C) = 2.40 / 12.0 = 0.200 mol.',
          'Calculate moles: n(H) = 0.600 / 1.0 = 0.600 mol.',
          'Divide by the smallest: C:H = 0.200 / 0.200 : 0.600 / 0.200.',
          'Simplify: C:H = 1:3.'
        ],
        answer: 'Empirical formula = CH₃'
      },
      {
        title: 'Percentage composition',
        question: 'A compound is 52.2% carbon, 13.0% hydrogen, and 34.8% oxygen by mass. Determine its empirical formula. Aᵣ values: C = 12.0, H = 1.0, O = 16.0.',
        steps: [
          'Assume 100 g: C = 52.2 g, H = 13.0 g, O = 34.8 g.',
          'Calculate moles: C = 52.2 / 12.0 = 4.35, H = 13.0 / 1.0 = 13.0, O = 34.8 / 16.0 = 2.175.',
          'Divide by the smallest: C:H:O = 4.35 / 2.175 : 13.0 / 2.175 : 2.175 / 2.175.',
          'Ratio = 2.00:5.98:1.00, which rounds to 2:6:1.'
        ],
        answer: 'Empirical formula = C₂H₆O'
      },
      {
        title: 'Combustion data',
        question: 'A sample of magnesium burns in oxygen. 0.720 g Mg forms 1.194 g magnesium oxide. Determine the empirical formula. Aᵣ values: Mg = 24.3, O = 16.0.',
        steps: [
          'Find oxygen mass: 1.194 - 0.720 = 0.474 g O.',
          'Calculate moles: n(Mg) = 0.720 / 24.3 = 0.0296 mol.',
          'Calculate moles: n(O) = 0.474 / 16.0 = 0.0296 mol.',
          'Ratio Mg:O = 1:1.'
        ],
        answer: 'Empirical formula = MgO'
      }
    ],
    guidedQuestions: [
      {
        prompt: 'A compound contains 1.20 g carbon and 0.200 g hydrogen. Determine the empirical formula.',
        hint: 'Calculate n(C) using Aᵣ(C) = 12.0 and n(H) using Aᵣ(H) = 1.0, then divide by the smallest.',
        answer: 'n(C) = 1.20 / 12.0 = 0.100 mol; n(H) = 0.200 / 1.0 = 0.200 mol. Ratio C:H = 1:2, so empirical formula = CH₂.'
      },
      {
        prompt: 'A compound is 75.0% carbon and 25.0% hydrogen by mass. Determine the empirical formula.',
        hint: 'Assume 100 g, so the masses are 75.0 g C and 25.0 g H.',
        answer: 'n(C) = 75.0 / 12.0 = 6.25 mol; n(H) = 25.0 / 1.0 = 25.0 mol. Ratio C:H = 1:4, so empirical formula = CH₄.'
      },
      {
        prompt: 'A compound gives a mole ratio N:O = 1:2.5. Convert this to an empirical formula.',
        hint: 'Multiply both parts of 1:2.5 by 2.',
        answer: 'N:O = 2:5, so empirical formula = N₂O₅.'
      }
    ],
    checkpoints: [
      {
        prompt: 'A compound contains 4.80 g carbon and 1.20 g hydrogen. Determine the empirical formula.',
        hint: 'Convert both masses to moles, then divide by the smallest mole value.',
        answer: 'n(C) = 4.80 / 12.0 = 0.400 mol; n(H) = 1.20 / 1.0 = 1.20 mol. Ratio C:H = 1:3, so empirical formula = CH₃.'
      },
      {
        prompt: 'A compound is 40.0% carbon, 6.7% hydrogen, and 53.3% oxygen by mass. Determine the empirical formula.',
        hint: 'Assume 100 g. Use Aᵣ values C = 12.0, H = 1.0, O = 16.0.',
        answer: 'n(C) = 40.0 / 12.0 = 3.33; n(H) = 6.7 / 1.0 = 6.7; n(O) = 53.3 / 16.0 = 3.33. Ratio C:H:O = 1:2:1, so empirical formula = CH₂O.'
      },
      {
        prompt: '0.540 g aluminium reacts with oxygen to form 1.020 g aluminium oxide. Determine the empirical formula.',
        hint: 'Find oxygen mass by subtraction first. Use Aᵣ(Al) = 27.0 and Aᵣ(O) = 16.0.',
        answer: 'Mass O = 1.020 - 0.540 = 0.480 g. n(Al) = 0.540 / 27.0 = 0.0200 mol; n(O) = 0.480 / 16.0 = 0.0300 mol. Ratio Al:O = 2:3, so empirical formula = Al₂O₃.'
      },
      {
        prompt: 'A student gets a ratio C:H:O = 1:1.5:1. Explain the next step.',
        hint: 'All formula subscripts must be whole numbers.',
        answer: 'Multiply every part by 2 to make whole numbers: C:H:O = 2:3:2, so the empirical formula is C₂H₃O₂.'
      }
    ],
    exitTicket: [
      {
        id: 'l5-q1',
        prompt: 'What is an empirical formula?',
        options: [
          { id: 'a', text: 'The simplest whole-number ratio of atoms in a compound.' },
          { id: 'b', text: 'The exact number of atoms in one molecule.' },
          { id: 'c', text: 'The mass of one mole of a compound.' }
        ],
        answer: 'a',
        explanation: 'An empirical formula shows the simplest whole-number atom ratio.'
      },
      {
        id: 'l5-q2',
        prompt: 'Which formula has empirical formula CH₂?',
        options: [
          { id: 'a', text: 'C₂H₄' },
          { id: 'b', text: 'C₂H₆' },
          { id: 'c', text: 'CH₄' }
        ],
        answer: 'a',
        explanation: 'C₂H₄ simplifies from 2:4 to 1:2, giving CH₂.'
      },
      {
        id: 'l5-q3',
        prompt: 'A compound has mole ratio C:H = 1:4. What is its empirical formula?',
        options: [
          { id: 'a', text: 'CH₄' },
          { id: 'b', text: 'C₄H' },
          { id: 'c', text: 'C₂H₈' }
        ],
        answer: 'a',
        explanation: 'The ratio 1:4 gives empirical formula CH₄.'
      },
      {
        id: 'l5-q4',
        prompt: 'When using percentage composition, what mass should you assume?',
        options: [
          { id: 'a', text: '100 g' },
          { id: 'b', text: '1 g' },
          { id: 'c', text: '24.0 g' }
        ],
        answer: 'a',
        explanation: 'Assuming 100 g lets percentages become masses in grams.'
      },
      {
        id: 'l5-q5',
        prompt: 'Which step comes after converting masses to moles?',
        options: [
          { id: 'a', text: 'Divide all mole values by the smallest mole value.' },
          { id: 'b', text: 'Multiply all masses by 24.0.' },
          { id: 'c', text: 'Add all mole values together.' }
        ],
        answer: 'a',
        explanation: 'Dividing by the smallest mole value gives the simplest ratio.'
      },
      {
        id: 'l5-q6',
        prompt: 'A ratio of C:H = 1:1.5 should be scaled to:',
        options: [
          { id: 'a', text: '2:3' },
          { id: 'b', text: '1:3' },
          { id: 'c', text: '3:2' }
        ],
        answer: 'a',
        explanation: 'Multiply both parts by 2: 1:1.5 becomes 2:3.'
      },
      {
        id: 'l5-q7',
        prompt: 'A compound contains 12.0 g C and 4.0 g H. What is the empirical formula?',
        options: [
          { id: 'a', text: 'CH₄' },
          { id: 'b', text: 'C₄H' },
          { id: 'c', text: 'CH₂' }
        ],
        answer: 'a',
        explanation: 'n(C) = 12.0 / 12.0 = 1.00; n(H) = 4.0 / 1.0 = 4.0, so CH₄.'
      },
      {
        id: 'l5-q8',
        prompt: 'A compound contains 2.70 g Al and 2.40 g O. What is the ratio Al:O?',
        options: [
          { id: 'a', text: '2:3' },
          { id: 'b', text: '3:2' },
          { id: 'c', text: '1:1' }
        ],
        answer: 'a',
        explanation: 'n(Al) = 2.70 / 27.0 = 0.100; n(O) = 2.40 / 16.0 = 0.150. Ratio = 2:3.'
      },
      {
        id: 'l5-q9',
        prompt: 'What is the empirical formula for a ratio Al:O = 2:3?',
        options: [
          { id: 'a', text: 'Al₂O₃' },
          { id: 'b', text: 'Al₃O₂' },
          { id: 'c', text: 'AlO' }
        ],
        answer: 'a',
        explanation: 'The subscripts follow the simplest ratio: Al₂O₃.'
      },
      {
        id: 'l5-q10',
        prompt: 'Why can C₆H₁₂O₆ and CH₂O have the same empirical formula?',
        options: [
          { id: 'a', text: 'C₆H₁₂O₆ simplifies to the ratio 1:2:1.' },
          { id: 'b', text: 'They have the same molecular formula.' },
          { id: 'c', text: 'Empirical formulae ignore oxygen atoms.' }
        ],
        answer: 'a',
        explanation: 'C₆H₁₂O₆ has ratio 6:12:6, which simplifies to 1:2:1, giving CH₂O.'
      }
    ],
    teacherNotes: [
      'Make students show the mole table: element, mass, Aᵣ, moles, ratio.',
      'Watch for rounding too early. Keep at least three significant figures until the ratio step.',
      'When ratios are close to whole numbers, connect small differences to experimental error.'
    ]
  },
  {
    id: 'lesson-6',
    label: 'Lesson 6',
    title: 'Limiting Reagents',
    icon: FlaskConical,
    nextLessonId: null,
    summary: 'Identify the reactant used up first and calculate maximum product.',
    objectives: [
      'Define limiting reagent and excess reagent.',
      'Use balanced equation mole ratios to compare reactants.',
      'Identify which reactant is used up first.',
      'Calculate the maximum amount of product formed.',
      'Calculate leftover excess reactant when required.'
    ],
    priorKnowledge: [
      'I can convert mass to moles using n = m / Mᵣ.',
      'I can calculate moles in solution using n = cV.',
      'I can read mole ratios from balanced equations.',
      'I can compare two calculated amounts and choose the smaller possible product.'
    ],
    teachingSections: [
      {
        title: 'Limiting and excess',
        body: 'The limiting reagent is the reactant that is completely used up first. It controls the maximum amount of product formed. Any reactant left over is in excess.'
      },
      {
        title: 'Best comparison method',
        body: 'Convert each reactant to moles. Then use the balanced equation to calculate how much product each reactant could make. The reactant that makes the smaller amount of product is the limiting reagent.'
      },
      {
        title: 'Why ratios matter',
        body: 'Balanced equations give mole ratios, not mass ratios. For 2Mg + O₂ → 2MgO, 2 mol Mg reacts with 1 mol O₂ and forms 2 mol MgO.'
      },
      {
        title: 'Leftover reactant',
        body: 'To calculate excess left over, use the limiting reagent to find how much of the excess reactant actually reacts. Then subtract reacted amount from the starting amount.'
      }
    ],
    workedExamples: [
      {
        title: 'Compare possible product',
        question: '2.40 mol H₂ reacts with 1.00 mol O₂. Equation: 2H₂ + O₂ → 2H₂O. Identify the limiting reagent and calculate moles of H₂O formed.',
        steps: [
          'From H₂: 2 mol H₂ forms 2 mol H₂O, so 2.40 mol H₂ could form 2.40 mol H₂O.',
          'From O₂: 1 mol O₂ forms 2 mol H₂O, so 1.00 mol O₂ could form 2.00 mol H₂O.',
          'The smaller possible product is 2.00 mol H₂O.',
          'Therefore O₂ is the limiting reagent.'
        ],
        answer: 'O₂ is limiting; maximum H₂O formed = 2.00 mol'
      },
      {
        title: 'Masses of reactants',
        question: '4.80 g Mg reacts with 3.20 g O₂. Equation: 2Mg + O₂ → 2MgO. Identify the limiting reagent. Aᵣ(Mg) = 24.3, Mᵣ(O₂) = 32.0.',
        steps: [
          'Calculate moles: n(Mg) = 4.80 / 24.3 = 0.1975 mol.',
          'Calculate moles: n(O₂) = 3.20 / 32.0 = 0.100 mol.',
          '0.1975 mol Mg needs half as many moles of O₂: 0.0988 mol O₂.',
          'There is 0.100 mol O₂ available, so Mg runs out first.'
        ],
        answer: 'Mg is the limiting reagent'
      },
      {
        title: 'Solution limiting reagent',
        question: '25.0 cm³ of 0.200 mol dm⁻³ HCl reacts with 0.00300 mol Na₂CO₃. Equation: Na₂CO₃ + 2HCl → 2NaCl + CO₂ + H₂O. Identify the limiting reagent.',
        steps: [
          'Convert and calculate HCl: V = 0.0250 dm³, so n(HCl) = 0.200 × 0.0250 = 0.00500 mol.',
          'Ratio Na₂CO₃:HCl is 1:2.',
          '0.00300 mol Na₂CO₃ needs 0.00600 mol HCl.',
          'Only 0.00500 mol HCl is available, so HCl runs out first.'
        ],
        answer: 'HCl is the limiting reagent'
      }
    ],
    guidedQuestions: [
      {
        prompt: '1.50 mol N₂ reacts with 4.00 mol H₂. Equation: N₂ + 3H₂ → 2NH₃. Identify the limiting reagent.',
        hint: '1 mol N₂ needs 3 mol H₂. Work out how much H₂ is needed for 1.50 mol N₂.',
        answer: '1.50 mol N₂ needs 4.50 mol H₂, but only 4.00 mol H₂ is available. H₂ is the limiting reagent.'
      },
      {
        prompt: '0.200 mol CH₄ reacts with 0.300 mol O₂. Equation: CH₄ + 2O₂ → CO₂ + 2H₂O. Calculate maximum moles of CO₂ formed.',
        hint: 'Compare possible CO₂ from each reactant.',
        answer: '0.200 mol CH₄ could form 0.200 mol CO₂. 0.300 mol O₂ could form 0.150 mol CO₂. O₂ is limiting, so maximum CO₂ = 0.150 mol.'
      },
      {
        prompt: '0.100 mol Zn reacts with 0.150 mol HCl. Equation: Zn + 2HCl → ZnCl₂ + H₂. Identify the excess reagent.',
        hint: '0.100 mol Zn would need 0.200 mol HCl.',
        answer: 'Only 0.150 mol HCl is available, so HCl is limiting and Zn is in excess.'
      }
    ],
    checkpoints: [
      {
        prompt: '2.00 mol CO reacts with 1.20 mol O₂. Equation: 2CO + O₂ → 2CO₂. Identify the limiting reagent and moles of CO₂ formed.',
        hint: 'Calculate possible CO₂ from CO and from O₂.',
        answer: '2.00 mol CO could form 2.00 mol CO₂. 1.20 mol O₂ could form 2.40 mol CO₂. CO is limiting, so 2.00 mol CO₂ forms.'
      },
      {
        prompt: '6.50 g Zn reacts with 0.150 mol HCl. Equation: Zn + 2HCl → ZnCl₂ + H₂. Identify the limiting reagent. Aᵣ(Zn) = 65.4.',
        hint: 'Convert Zn mass to moles first.',
        answer: 'n(Zn) = 6.50 / 65.4 = 0.0994 mol. This would need 0.1988 mol HCl, but only 0.150 mol HCl is available. HCl is limiting.'
      },
      {
        prompt: '0.500 mol Al reacts with 0.600 mol Cl₂. Equation: 2Al + 3Cl₂ → 2AlCl₃. Identify the limiting reagent.',
        hint: '0.500 mol Al needs 0.750 mol Cl₂.',
        answer: 'Only 0.600 mol Cl₂ is available, so Cl₂ is the limiting reagent.'
      },
      {
        prompt: 'A student says the reactant with the smaller mass is always limiting. Explain the error.',
        hint: 'Limiting reagent depends on moles and equation ratio, not mass alone.',
        answer: 'Masses cannot be compared directly because substances have different molar masses and react in different mole ratios. Convert to moles and use the balanced equation.'
      }
    ],
    exitTicket: [
      {
        id: 'l6-q1',
        prompt: 'A limiting reagent is the reactant that:',
        options: [
          { id: 'a', text: 'is used up first and limits product formed' },
          { id: 'b', text: 'has the largest mass' },
          { id: 'c', text: 'is always a gas' }
        ],
        answer: 'a',
        explanation: 'The limiting reagent is completely used up first and controls the maximum amount of product.'
      },
      {
        id: 'l6-q2',
        prompt: 'What is an excess reagent?',
        options: [
          { id: 'a', text: 'A reactant left over after the reaction finishes' },
          { id: 'b', text: 'The product with the largest mass' },
          { id: 'c', text: 'A reactant with no mole ratio' }
        ],
        answer: 'a',
        explanation: 'An excess reagent is not fully used up, so some remains after the limiting reagent is used.'
      },
      {
        id: 'l6-q3',
        prompt: 'For 2H₂ + O₂ → 2H₂O, 3.00 mol H₂ needs how many moles of O₂?',
        options: [
          { id: 'a', text: '1.50 mol O₂' },
          { id: 'b', text: '3.00 mol O₂' },
          { id: 'c', text: '6.00 mol O₂' }
        ],
        answer: 'a',
        explanation: 'The ratio H₂:O₂ is 2:1, so 3.00 mol H₂ needs 1.50 mol O₂.'
      },
      {
        id: 'l6-q4',
        prompt: '2.00 mol H₂ reacts with 0.750 mol O₂. Equation: 2H₂ + O₂ → 2H₂O. Which reactant is limiting?',
        options: [
          { id: 'a', text: 'O₂' },
          { id: 'b', text: 'H₂' },
          { id: 'c', text: 'Neither' }
        ],
        answer: 'a',
        explanation: '2.00 mol H₂ needs 1.00 mol O₂, but only 0.750 mol O₂ is available.'
      },
      {
        id: 'l6-q5',
        prompt: 'For CH₄ + 2O₂ → CO₂ + 2H₂O, 0.400 mol O₂ can make how many moles of CO₂?',
        options: [
          { id: 'a', text: '0.200 mol CO₂' },
          { id: 'b', text: '0.400 mol CO₂' },
          { id: 'c', text: '0.800 mol CO₂' }
        ],
        answer: 'a',
        explanation: 'The ratio O₂:CO₂ is 2:1, so 0.400 mol O₂ forms 0.200 mol CO₂.'
      },
      {
        id: 'l6-q6',
        prompt: '0.250 mol Mg reacts with 0.100 mol O₂. Equation: 2Mg + O₂ → 2MgO. What is limiting?',
        options: [
          { id: 'a', text: 'O₂' },
          { id: 'b', text: 'Mg' },
          { id: 'c', text: 'MgO' }
        ],
        answer: 'a',
        explanation: '0.250 mol Mg needs 0.125 mol O₂, but only 0.100 mol O₂ is available.'
      },
      {
        id: 'l6-q7',
        prompt: 'In the same reaction, 0.100 mol O₂ forms how many moles of MgO?',
        options: [
          { id: 'a', text: '0.200 mol MgO' },
          { id: 'b', text: '0.100 mol MgO' },
          { id: 'c', text: '0.0500 mol MgO' }
        ],
        answer: 'a',
        explanation: 'The ratio O₂:MgO is 1:2, so 0.100 mol O₂ forms 0.200 mol MgO.'
      },
      {
        id: 'l6-q8',
        prompt: 'Why should reactant masses not be compared directly to find the limiting reagent?',
        options: [
          { id: 'a', text: 'Reactants have different molar masses and mole ratios.' },
          { id: 'b', text: 'Mass is never measured in chemistry.' },
          { id: 'c', text: 'Balanced equations use mass ratios only.' }
        ],
        answer: 'a',
        explanation: 'You must convert to moles and use the balanced equation ratio.'
      },
      {
        id: 'l6-q9',
        prompt: '0.100 mol Zn reacts with 0.300 mol HCl. Equation: Zn + 2HCl → ZnCl₂ + H₂. Which reactant is in excess?',
        options: [
          { id: 'a', text: 'HCl' },
          { id: 'b', text: 'Zn' },
          { id: 'c', text: 'H₂' }
        ],
        answer: 'a',
        explanation: '0.100 mol Zn needs 0.200 mol HCl. There is 0.300 mol HCl, so HCl is in excess.'
      },
      {
        id: 'l6-q10',
        prompt: 'What should you calculate to identify the limiting reagent most reliably?',
        options: [
          { id: 'a', text: 'The amount of product each reactant could make' },
          { id: 'b', text: 'The colour of each reactant' },
          { id: 'c', text: 'Only the total mass of all reactants' }
        ],
        answer: 'a',
        explanation: 'The reactant that can make the smaller amount of product is limiting.'
      }
    ],
    teacherNotes: [
      'The strongest method is comparing possible product from each reactant.',
      'Make students state both the limiting reagent and the maximum product amount.',
      'Use the simulator after examples so students can see excess reactant left over.'
    ]
  }
]

const pageTabs = [
  { id: 'overview', label: 'Overview' },
  ...amountLessons.map(lesson => ({ id: lesson.id, label: lesson.label })),
  { id: 'practice', label: 'Practice' },
  { id: 'exam', label: 'Exam Questions' },
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'quiz', label: 'Quiz' }
]

const calculationWalkthroughs = [
  {
    title: 'Mass -> moles -> product mass',
    prompt: '4.80 g Mg reacts with oxygen. Calculate mass of MgO formed. Equation: 2Mg + O2 -> 2MgO.',
    steps: [
      'Moles Mg = 4.80 / 24.3 = 0.1975 mol.',
      'Ratio Mg:MgO is 2:2, so moles MgO = 0.1975 mol.',
      'Mr(MgO) = 24.3 + 16.0 = 40.3.',
      'Mass MgO = 0.1975 x 40.3 = 7.96 g.'
    ]
  },
  {
    title: 'Solution -> moles -> concentration',
    prompt: '25.0 cm3 NaOH neutralises 20.0 cm3 of 0.150 mol dm-3 H2SO4. Equation: 2NaOH + H2SO4 -> Na2SO4 + 2H2O.',
    steps: [
      'Moles H2SO4 = 0.150 x 0.0200 = 0.00300 mol.',
      'Ratio H2SO4:NaOH is 1:2, so moles NaOH = 0.00600 mol.',
      'Volume NaOH = 25.0 cm3 = 0.0250 dm3.',
      'Concentration NaOH = 0.00600 / 0.0250 = 0.240 mol dm-3.'
    ]
  },
  {
    title: 'Gas volume -> moles -> reacting volume',
    prompt: '120 cm3 of methane burns completely. Calculate the volume of oxygen needed at the same temperature and pressure. Equation: CH4 + 2O2 -> CO2 + 2H2O.',
    steps: [
      'For gases at the same temperature and pressure, volume ratio follows mole ratio.',
      'Ratio CH4:O2 is 1:2.',
      'Oxygen volume = 120 x 2 = 240 cm3.',
      'This shortcut works because both substances are gases under the stated conditions.'
    ]
  }
]

const examQuestions = [
  {
    marks: 4,
    question: 'Calcium carbonate reacts with hydrochloric acid: CaCO3 + 2HCl -> CaCl2 + CO2 + H2O. Calculate the volume of 0.500 mol dm-3 HCl needed to react exactly with 2.50 g of CaCO3.',
    markScheme: [
      'Mr(CaCO3) = 100.1.',
      'n(CaCO3) = 2.50 / 100.1 = 0.02498 mol.',
      'n(HCl) = 2 x 0.02498 = 0.04996 mol.',
      'V = n / c = 0.04996 / 0.500 = 0.0999 dm3 = 99.9 cm3.'
    ]
  },
  {
    marks: 5,
    question: 'At room temperature and pressure, 96.0 cm3 of carbon dioxide is produced. Calculate the amount, in moles, of carbon dioxide and the mass of carbon dioxide produced.',
    markScheme: [
      'Convert volume: 96.0 cm3 = 0.0960 dm3.',
      'Use n = V / 24.0.',
      'n(CO2) = 0.0960 / 24.0 = 0.00400 mol.',
      'Mr(CO2) = 44.0.',
      'mass = 0.00400 x 44.0 = 0.176 g.'
    ]
  },
  {
    marks: 5,
    question: 'A student burns 0.720 g of Mg in oxygen and obtains 1.194 g of magnesium oxide. Determine the empirical formula of the oxide.',
    markScheme: [
      'Mass O = 1.194 - 0.720 = 0.474 g.',
      'n(Mg) = 0.720 / 24.3 = 0.0296 mol.',
      'n(O) = 0.474 / 16.0 = 0.0296 mol.',
      'Ratio Mg:O = 1:1.',
      'Empirical formula = MgO.'
    ]
  },
  {
    marks: 6,
    question: '5.00 g of Zn reacts with 50.0 cm3 of 1.20 mol dm-3 HCl. Equation: Zn + 2HCl -> ZnCl2 + H2. Identify the limiting reagent and calculate moles of H2 formed.',
    markScheme: [
      'n(Zn) = 5.00 / 65.4 = 0.0765 mol.',
      'n(HCl) = 1.20 x 0.0500 = 0.0600 mol.',
      '0.0600 mol HCl reacts with 0.0300 mol Zn.',
      'HCl is limiting.',
      'Ratio HCl:H2 is 2:1.',
      'n(H2) = 0.0300 mol.'
    ]
  }
]

function format(value, places = 3) {
  if (!Number.isFinite(value)) return '0'
  return value.toPrecision(places)
}

function createInitialProgress() {
  return amountLessons.reduce((progress, lesson, index) => {
    progress[lesson.id] = {
      bestScore: 0,
      completed: false,
      unlocked: index === 0
    }
    return progress
  }, {})
}

function normaliseProgress(progress) {
  const initial = createInitialProgress()
  return amountLessons.reduce((nextProgress, lesson, index) => {
    const stored = progress?.[lesson.id] || {}
    const previousLesson = amountLessons[index - 1]
    const previousCompleted = index === 0 || Boolean(nextProgress[previousLesson.id]?.completed)
    nextProgress[lesson.id] = {
      bestScore: Number(stored.bestScore) || 0,
      completed: Boolean(stored.completed),
      unlocked: index === 0 || previousCompleted || Boolean(stored.unlocked)
    }
    return nextProgress
  }, initial)
}

function getLessonStatus(lessonId, progress, mode) {
  if (mode === 'teacher') return { unlocked: true, completed: progress[lessonId]?.completed || false }
  return {
    unlocked: progress[lessonId]?.unlocked || false,
    completed: progress[lessonId]?.completed || false
  }
}

function LimitingReagentSimulator() {
  const [h2, setH2] = useState('2.00')
  const [o2, setO2] = useState('1.20')

  const result = useMemo(() => {
    const h2Moles = Number(h2)
    const o2Moles = Number(o2)
    if (h2Moles <= 0 || o2Moles <= 0) return null

    const waterFromH2 = h2Moles
    const waterFromO2 = o2Moles * 2
    const h2IsLimiting = waterFromH2 < waterFromO2
    const equal = Math.abs(waterFromH2 - waterFromO2) < 0.000001
    const water = Math.min(waterFromH2, waterFromO2)
    const h2Used = water
    const o2Used = water / 2

    return {
      limiting: equal ? 'Neither: exact reacting amounts' : h2IsLimiting ? 'H2' : 'O2',
      water,
      h2Left: Math.max(0, h2Moles - h2Used),
      o2Left: Math.max(0, o2Moles - o2Used),
      waterFromH2,
      waterFromO2
    }
  }, [h2, o2])

  return (
    <section className="panel simulator-panel">
      <div className="section-header compact">
        <div>
          <p className="eyebrow">Interactive</p>
          <h3>Limiting Reagent Simulator</h3>
          <p>Equation: 2H2 + O2 {'->'} 2H2O. Change the starting moles and compare possible water formed.</p>
        </div>
      </div>

      <div className="input-grid">
        <div className="field">
          <label>Starting H2 / mol</label>
          <input type="number" min="0" step="0.01" value={h2} onChange={event => setH2(event.target.value)} />
        </div>
        <div className="field">
          <label>Starting O2 / mol</label>
          <input type="number" min="0" step="0.01" value={o2} onChange={event => setO2(event.target.value)} />
        </div>
      </div>

      {result ? (
        <div className="simulator-grid">
          <div className="result-box">
            Limiting reagent: <strong>{result.limiting}</strong>
          </div>
          <div className="metric-card">
            <span>H2 could make</span>
            <strong>{format(result.waterFromH2)} mol H2O</strong>
          </div>
          <div className="metric-card">
            <span>O2 could make</span>
            <strong>{format(result.waterFromO2)} mol H2O</strong>
          </div>
          <div className="metric-card">
            <span>Maximum product</span>
            <strong>{format(result.water)} mol H2O</strong>
          </div>
          <div className="metric-card">
            <span>H2 left over</span>
            <strong>{format(result.h2Left)} mol</strong>
          </div>
          <div className="metric-card">
            <span>O2 left over</span>
            <strong>{format(result.o2Left)} mol</strong>
          </div>
        </div>
      ) : (
        <p className="feedback needs-work">Enter positive starting amounts for both reactants.</p>
      )}
    </section>
  )
}

function ModeToggle({ mode, setMode }) {
  return (
    <div className="mode-toggle" aria-label="Teacher or student mode">
      <button className={mode === 'student' ? 'active' : ''} onClick={() => setMode('student')}>
        <GraduationCap size={18} />
        Student
      </button>
      <button className={mode === 'teacher' ? 'active' : ''} onClick={() => setMode('teacher')}>
        <CheckCircle2 size={18} />
        Teacher
      </button>
    </div>
  )
}

function PriorKnowledgeChecklist({ checks }) {
  const [checked, setChecked] = useState({})

  function toggleCheck(check) {
    setChecked({ ...checked, [check]: !checked[check] })
  }

  return (
    <section className="lesson-section">
      <p className="eyebrow">Checking Prior Knowledge</p>
      <h3>Before You Start</h3>
      <ul className="check-list">
        {checks.map(check => (
          <li className="check-item" key={check}>
            <input type="checkbox" checked={Boolean(checked[check])} onChange={() => toggleCheck(check)} />
            <span>{check}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function SolveCard({ item, label }) {
  const [response, setResponse] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  return (
    <article className="solve-card">
      <p className="eyebrow">{label}</p>
      <h3>{item.prompt}</h3>
      <div className="field">
        <label>Your working or answer</label>
        <textarea
          value={response}
          onChange={event => setResponse(event.target.value)}
          placeholder="Write your formula, substitution, calculation, and final answer."
          rows="4"
        />
      </div>
      <div className="action-row compact-actions">
        <button className="btn" type="button" onClick={() => setShowHint(true)}>Show hint</button>
        <button className="btn primary" type="button" onClick={() => setShowAnswer(true)}>Reveal answer</button>
      </div>
      {showHint && <p className="feedback needs-work">Hint: {item.hint}</p>}
      {showAnswer && <p className="feedback good">Answer: {item.answer}</p>}
    </article>
  )
}

function GuidedQuestions({ questions }) {
  return (
    <section className="lesson-section">
      <p className="eyebrow">Guided Questions</p>
      <h3>Try First, Then Use Support</h3>
      <div className="guided-question-list">
        {questions.map((question, index) => (
          <SolveCard item={question} label={`Guided Question ${index + 1}`} key={question.prompt} />
        ))}
      </div>
    </section>
  )
}

function Checkpoints({ checkpoints }) {
  return (
    <section className="lesson-section">
      <p className="eyebrow">Checkpoints</p>
      <h3>Solve These Before the Exit Ticket</h3>
      <div className="checkpoint-grid">
        {checkpoints.length ? checkpoints.map((checkpoint, index) => (
          <SolveCard item={checkpoint} label={`Checkpoint ${index + 1}`} key={checkpoint.prompt} />
        )) : (
          <article className="mini-panel">
            <h3>Checkpoint questions pending</h3>
            <p>These will be added with the full lesson content.</p>
          </article>
        )}
      </div>
    </section>
  )
}

function ExitTicket({ lesson, progress, setProgress, setActivePageTab, mode }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const questions = lesson.exitTicket || []

  const score = questions.reduce((total, question) => {
    return total + (answers[question.id] === question.answer ? 1 : 0)
  }, 0)
  const percent = questions.length ? Math.round((score / questions.length) * 100) : 0
  const passed = percent >= PASS_MARK
  const nextLesson = amountLessons.find(item => item.id === lesson.nextLessonId)

  function selectAnswer(questionId, optionId) {
    setAnswers({ ...answers, [questionId]: optionId })
  }

  function submitExitTicket(event) {
    event.preventDefault()
    setSubmitted(true)

    setProgress(current => {
      const nextProgress = normaliseProgress(current)
      const existing = nextProgress[lesson.id] || { bestScore: 0, completed: false, unlocked: true }
      nextProgress[lesson.id] = {
        ...existing,
        bestScore: Math.max(existing.bestScore || 0, percent),
        completed: existing.completed || passed,
        unlocked: true
      }

      if (passed && lesson.nextLessonId) {
        nextProgress[lesson.nextLessonId] = {
          ...(nextProgress[lesson.nextLessonId] || {}),
          unlocked: true
        }
      }

      return nextProgress
    })
  }

  if (!questions.length) {
    return (
      <section className="lesson-section exit-ticket-panel">
        <p className="eyebrow">Exit Ticket Quiz</p>
        <h3>Coming Next</h3>
        <p>This lesson is part of the Phase 1 data model. Its full exit ticket will be added when this lesson is built out.</p>
      </section>
    )
  }

  return (
    <section className="lesson-section exit-ticket-panel">
      <p className="eyebrow">Exit Ticket Quiz</p>
      <h3>Score {PASS_MARK}% to Unlock the Next Lesson</h3>
      <p>Best saved score for this lesson: <strong>{progress[lesson.id]?.bestScore || 0}%</strong></p>

      <form onSubmit={submitExitTicket}>
        {questions.map(question => (
          <div className="quiz-question" key={question.id}>
            <strong>{question.prompt}</strong>
            {question.options.map(option => (
              <label className="quiz-option" key={option.id}>
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={answers[question.id] === option.id}
                  onChange={() => selectAnswer(question.id, option.id)}
                />
                <span>{option.text}</span>
              </label>
            ))}

            {submitted && (
              <p className={answers[question.id] === question.answer ? 'feedback good' : 'feedback needs-work'}>
                {answers[question.id] === question.answer ? 'Correct.' : `Review: ${question.explanation}`}
              </p>
            )}
          </div>
        ))}

        <button className="btn primary" type="submit">Submit exit ticket</button>

        {submitted && (
          <p className={passed ? 'feedback good' : 'feedback needs-work'}>
            Score: {score}/{questions.length} ({percent}%). {passed ? 'Lesson passed. The next lesson is unlocked.' : `You need at least ${PASS_MARK}%. Review the examples and try again.`}
          </p>
        )}
      </form>

      <div className="lesson-next-row">
        {nextLesson ? (
          <button
            className="btn primary"
            disabled={mode !== 'teacher' && !getLessonStatus(nextLesson.id, progress, mode).unlocked && !passed}
            onClick={() => setActivePageTab(nextLesson.id)}
          >
            Go to {nextLesson.label}: {nextLesson.title}
          </button>
        ) : (
          <span className="badge">Final lesson</span>
        )}
      </div>
    </section>
  )
}

function LessonPanel({ lesson, progress, setProgress, mode, setActivePageTab }) {
  const Icon = lesson.icon
  const lessonStatus = getLessonStatus(lesson.id, progress, mode)

  if (!lessonStatus.unlocked) {
    const index = amountLessons.findIndex(item => item.id === lesson.id)
    const previousLesson = amountLessons[index - 1]

    return (
      <section className="panel locked-lesson">
        <div className="lesson-feature compact-card">
          <div className="lesson-feature-icon locked">
            <Lock size={26} />
          </div>
          <div>
            <p className="eyebrow">Locked Lesson</p>
            <h3>{lesson.label}: {lesson.title}</h3>
            <p>Score {PASS_MARK}% or higher on {previousLesson.label} to unlock this lesson.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="panel lesson-panel">
      <div className="lesson-feature compact-card">
        <div className="lesson-feature-icon">
          <Icon size={28} />
        </div>
        <div>
          <p className="eyebrow">{lesson.label}</p>
          <h2>{lesson.title}</h2>
          <p>{lesson.summary}</p>
          <div className="topic-meta">
            <span className="badge">Best score: {progress[lesson.id]?.bestScore || 0}%</span>
            <span className="badge">{lessonStatus.completed ? 'Completed' : `Pass mark ${PASS_MARK}%`}</span>
          </div>
        </div>
      </div>

      <section className="lesson-section">
        <p className="eyebrow">Objectives</p>
        <h3>By the End of This Lesson</h3>
        <ul className="clean-list">
          {lesson.objectives.map(objective => <li key={objective}>{objective}</li>)}
        </ul>
      </section>

      <PriorKnowledgeChecklist checks={lesson.priorKnowledge} />

      <section className="lesson-section">
        <p className="eyebrow">Core Teaching</p>
        <h3>Lesson Notes</h3>
        <div className="calc-walkthroughs">
          {lesson.teachingSections.length ? lesson.teachingSections.map(section => (
            <article className="mini-panel" key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </article>
          )) : (
            <article className="mini-panel">
              <h3>Content phase placeholder</h3>
              <p>This lesson has its objectives and lock position set. Its full teaching sequence will be written in the next phase.</p>
            </article>
          )}
        </div>
      </section>

      {lesson.workedExamples.length > 0 && (
        <section className="lesson-section">
          <p className="eyebrow">Sample Examples</p>
          <h3>Worked Examples</h3>
          <div className="calc-walkthroughs">
            {lesson.workedExamples.map(example => (
              <article className="mini-panel worked-example" key={example.title}>
                <h3>{example.title}</h3>
                <p><strong>{example.question}</strong></p>
                <ol className="step-list">
                  {example.steps.map(step => <li key={step}>{step}</li>)}
                </ol>
                <div className="result-box">{example.answer}</div>
              </article>
            ))}
          </div>
        </section>
      )}

      {lesson.guidedQuestions.length > 0 && <GuidedQuestions questions={lesson.guidedQuestions} />}

      <Checkpoints checkpoints={lesson.checkpoints} />

      {mode === 'teacher' && (
        <section className="teacher-note">
          <strong>Teacher mode notes:</strong>
          <ul>
            {lesson.teacherNotes.map(note => <li key={note}>{note}</li>)}
          </ul>
        </section>
      )}

      <ExitTicket
        lesson={lesson}
        progress={progress}
        setProgress={setProgress}
        setActivePageTab={setActivePageTab}
        mode={mode}
      />
    </section>
  )
}

function OverviewPanel({ lesson, progress, mode, setActivePageTab }) {
  return (
    <section className="panel amount-overview">
      <p className="eyebrow">Model Topic</p>
      <h2>{lesson.title}</h2>
      <p>{lesson.overview}</p>

      <div className="topic-map">
        {amountLessons.map(item => {
          const Icon = item.icon
          const status = getLessonStatus(item.id, progress, mode)
          return (
            <button
              className={`metric-card topic-map-card ${status.unlocked ? '' : 'locked-card'}`}
              key={item.id}
              onClick={() => status.unlocked && setActivePageTab(item.id)}
            >
              {status.unlocked ? <Icon size={22} /> : <Lock size={22} />}
              <span>{item.label}: {item.title}</span>
              <strong>{item.summary}</strong>
              <small>{status.completed ? 'Completed' : status.unlocked ? `Best score ${progress[item.id]?.bestScore || 0}%` : 'Locked'}</small>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function PracticePanel() {
  return (
    <>
      <section className="panel">
        <p className="eyebrow">Practice</p>
        <h3>Step-by-Step Mole Calculations</h3>
        <div className="calc-walkthroughs">
          {calculationWalkthroughs.map(example => (
            <article className="mini-panel" key={example.title}>
              <h3>{example.title}</h3>
              <p><strong>{example.prompt}</strong></p>
              <ol className="step-list">
                {example.steps.map(step => <li key={step}>{step}</li>)}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <LimitingReagentSimulator />

      <section className="grid-2">
        <MoleCalculator />
        <ConcentrationCalculator />
        <FormulaMassCalculator />
      </section>
    </>
  )
}

function ExamQuestionsPanel() {
  return (
    <section className="panel">
      <p className="eyebrow">Exam Practice</p>
      <h3>Exam-Style Questions</h3>
      <div className="exam-question-list">
        {examQuestions.map((item, index) => (
          <details className="exam-question" key={item.question}>
            <summary>
              <span>Question {index + 1}</span>
              <strong>{item.marks} marks</strong>
            </summary>
            <p>{item.question}</p>
            <div className="mark-scheme">
              <h4>Mark scheme</h4>
              <ol className="step-list">
                {item.markScheme.map(point => <li key={point}>{point}</li>)}
              </ol>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

export default function AmountOfSubstanceTopic({ lesson }) {
  const [activePageTab, setActivePageTab] = useState('overview')
  const [mode, setMode] = useState('student')
  const [storedProgress, setStoredProgress] = useLocalStorage('amount-substance-lesson-progress', createInitialProgress())
  const progress = normaliseProgress(storedProgress)

  function updateProgress(updater) {
    setStoredProgress(current => normaliseProgress(updater(current)))
  }

  function selectTab(tabId) {
    const lessonTab = amountLessons.find(item => item.id === tabId)
    if (lessonTab && !getLessonStatus(lessonTab.id, progress, mode).unlocked) return
    setActivePageTab(tabId)
  }

  function renderActiveTab() {
    if (activePageTab === 'overview') {
      return <OverviewPanel lesson={lesson} progress={progress} mode={mode} setActivePageTab={setActivePageTab} />
    }

    const activeLesson = amountLessons.find(item => item.id === activePageTab)
    if (activeLesson) {
      return (
        <LessonPanel
          lesson={activeLesson}
          progress={progress}
          setProgress={updateProgress}
          mode={mode}
          setActivePageTab={setActivePageTab}
        />
      )
    }

    if (activePageTab === 'practice') return <PracticePanel />
    if (activePageTab === 'exam') return <ExamQuestionsPanel />
    if (activePageTab === 'flashcards') return <Flashcards cards={lesson.flashcards} />
    if (activePageTab === 'quiz') return <QuizBlock quizId="amount-of-substance" questions={quizzes['amount-of-substance'] || []} />
    return null
  }

  return (
    <div className="lesson-block amount-topic">
      <section className="panel topic-tab-shell">
        <div className="section-header compact">
          <div>
            <p className="eyebrow">Topic Workspace</p>
            <h2>Amount of Substance</h2>
            <p>Lessons unlock one at a time. Score {PASS_MARK}% or higher on each exit ticket to continue.</p>
          </div>
          <ModeToggle mode={mode} setMode={setMode} />
        </div>

        <div className="topic-page-tabs lesson-gate-tabs" role="tablist" aria-label="Amount of Substance topic sections">
          {pageTabs.map(tab => {
            const lessonTab = amountLessons.find(item => item.id === tab.id)
            const status = lessonTab ? getLessonStatus(lessonTab.id, progress, mode) : { unlocked: true, completed: false }
            return (
              <button
                key={tab.id}
                className={`${tab.id === activePageTab ? 'active' : ''} ${!status.unlocked ? 'locked' : ''}`}
                onClick={() => selectTab(tab.id)}
                role="tab"
                aria-selected={tab.id === activePageTab}
                disabled={!status.unlocked}
              >
                {lessonTab && !status.unlocked && <Lock size={15} />}
                {lessonTab && status.completed && <CheckCircle2 size={15} />}
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {renderActiveTab()}
    </div>
  )
}
