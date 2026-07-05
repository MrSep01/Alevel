import { useMemo, useState } from 'react'
import CalculatedValue from './CalculatedValue.jsx'
import { formatFormula, toSuperscript } from './chemistryHelpers.js'

const halfCells = [
  {
    id: 'zn',
    symbol: 'Zn',
    name: 'Zinc',
    ionName: 'zinc ions',
    charge: 2,
    solution: 'ZnSO4',
    potential: -0.76,
    metalColor: '#c8ccd2',
    solutionColor: 'rgba(188, 216, 255, 0.42)',
  },
  {
    id: 'cu',
    symbol: 'Cu',
    name: 'Copper',
    ionName: 'copper ions',
    charge: 2,
    solution: 'CuSO4',
    potential: 0.34,
    metalColor: '#c87542',
    solutionColor: 'rgba(64, 156, 230, 0.36)',
  },
  {
    id: 'ag',
    symbol: 'Ag',
    name: 'Silver',
    ionName: 'silver ions',
    charge: 1,
    solution: 'AgNO3',
    potential: 0.80,
    metalColor: '#d9dee7',
    solutionColor: 'rgba(230, 236, 246, 0.68)',
  },
  {
    id: 'fe',
    symbol: 'Fe',
    name: 'Iron',
    ionName: 'iron(II) ions',
    charge: 2,
    solution: 'FeSO4',
    potential: -0.44,
    metalColor: '#a3a6aa',
    solutionColor: 'rgba(157, 218, 177, 0.36)',
  },
  {
    id: 'mg',
    symbol: 'Mg',
    name: 'Magnesium',
    ionName: 'magnesium ions',
    charge: 2,
    solution: 'MgSO4',
    potential: -2.37,
    metalColor: '#d9d9d3',
    solutionColor: 'rgba(238, 244, 248, 0.9)',
  },
  {
    id: 'pb',
    symbol: 'Pb',
    name: 'Lead',
    ionName: 'lead(II) ions',
    charge: 2,
    solution: 'Pb(NO3)2',
    potential: -0.13,
    metalColor: '#89909b',
    solutionColor: 'rgba(224, 231, 239, 0.7)',
  },
]

function formatPotential(value) {
  if (!Number.isFinite(value)) return 'Check value'
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)} V`
}

function formatIon(cell) {
  return `${cell.symbol}${cell.charge === 1 ? '⁺' : toSuperscript(`${cell.charge}+`)}`
}

function formatElectrons(count) {
  return count === 1 ? 'e⁻' : `${count}e⁻`
}

function coefficient(value) {
  return value === 1 ? '' : value
}

function gcd(first, second) {
  let a = Math.abs(first)
  let b = Math.abs(second)
  while (b) {
    const next = b
    b = a % b
    a = next
  }
  return a || 1
}

function lcm(first, second) {
  return (first * second) / gcd(first, second)
}

function halfReaction(cell, role) {
  if (role === 'Half-cell') return 'Enter valid electrode potentials to assign anode and cathode.'
  const ion = formatIon(cell)
  const electrons = formatElectrons(cell.charge)
  if (role === 'Anode') return `${cell.symbol}(s) → ${ion}(aq) + ${electrons}`
  return `${ion}(aq) + ${electrons} → ${cell.symbol}(s)`
}

function CellBeaker({ cell, role, side, reaction, potential }) {
  const ion = formatIon(cell)
  const process = role === 'Anode' ? 'Oxidation' : role === 'Cathode' ? 'Reduction' : 'Waiting'

  return (
    <div className={`electrochem-half-cell ${side}`} style={{ '--metal': cell.metalColor, '--solution': cell.solutionColor }}>
      <div className="electrochem-role">
        <span>{role}</span>
        <strong>{process}</strong>
      </div>
      <div className="electrochem-beaker" aria-label={`${cell.name} half-cell`}>
        <div className="electrode-label">{cell.symbol}(s)</div>
        <div className="electrode-strip" />
        <div className="electrochem-solution">
          <span className="floating-ion ion-one">{ion}</span>
          <span className="floating-ion ion-two">{ion}</span>
          <span className="floating-ion ion-three">{ion}</span>
          <small>{formatFormula(cell.solution)}(aq)</small>
        </div>
      </div>
      <div className="half-cell-caption">
        <strong>{cell.name} half-cell</strong>
        <span>{formatPotential(Number(potential))} standard reduction potential</span>
        <small>{reaction}</small>
      </div>
    </div>
  )
}

export default function ElectrochemicalCellCalculator() {
  const [leftId, setLeftId] = useState('zn')
  const [rightId, setRightId] = useState('cu')
  const [leftPotential, setLeftPotential] = useState('-0.76')
  const [rightPotential, setRightPotential] = useState('0.34')

  const leftCell = halfCells.find(cell => cell.id === leftId) || halfCells[0]
  const rightCell = halfCells.find(cell => cell.id === rightId) || halfCells[1]

  const cellData = useMemo(() => {
    const left = Number(leftPotential)
    const right = Number(rightPotential)
    if (!Number.isFinite(left) || !Number.isFinite(right)) return null

    const cathodeSide = right >= left ? 'right' : 'left'
    const anodeSide = cathodeSide === 'right' ? 'left' : 'right'
    const anode = anodeSide === 'left' ? leftCell : rightCell
    const cathode = cathodeSide === 'left' ? leftCell : rightCell
    const anodePotential = anodeSide === 'left' ? left : right
    const cathodePotential = cathodeSide === 'left' ? left : right
    const electrons = lcm(anode.charge, cathode.charge)
    const anodeCoefficient = electrons / anode.charge
    const cathodeCoefficient = electrons / cathode.charge

    return {
      anode,
      cathode,
      anodeSide,
      cathodeSide,
      anodePotential,
      cathodePotential,
      cellPotential: cathodePotential - anodePotential,
      electrons,
      anodeCoefficient,
      cathodeCoefficient,
    }
  }, [leftCell, leftPotential, rightCell, rightPotential])

  function chooseHalfCell(side, id) {
    const selected = halfCells.find(cell => cell.id === id)
    if (!selected) return
    if (side === 'left') {
      setLeftId(id)
      setLeftPotential(String(selected.potential))
    } else {
      setRightId(id)
      setRightPotential(String(selected.potential))
    }
  }

  const leftRole = !cellData ? 'Half-cell' : cellData.anodeSide === 'left' ? 'Anode' : 'Cathode'
  const rightRole = !cellData ? 'Half-cell' : cellData.anodeSide === 'right' ? 'Anode' : 'Cathode'
  const electronClass = cellData?.anodeSide === 'right' ? 'from-right' : 'from-left'
  const bridgeClass = cellData?.anodeSide === 'right' ? 'anode-right' : 'anode-left'
  const feasible = cellData && cellData.cellPotential > 0
  const overallEquation = cellData
    ? `${coefficient(cellData.anodeCoefficient)}${cellData.anode.symbol}(s) + ${coefficient(cellData.cathodeCoefficient)}${formatIon(cellData.cathode)}(aq) → ${coefficient(cellData.anodeCoefficient)}${formatIon(cellData.anode)}(aq) + ${coefficient(cellData.cathodeCoefficient)}${cellData.cathode.symbol}(s)`
    : 'Choose valid electrode potentials.'

  return (
    <section className="calculator-app electrochem-app">
      <div className="calculator-topline">
        <p className="eyebrow">Electrochemical cell simulator</p>
        <span className="calculator-badge">Eᶿcell = Eᶿcathode - Eᶿanode</span>
      </div>

      <div className="electrochem-layout">
        <div className="calculator-input-panel electrochem-controls">
          <label className="calculator-field">
            <span>Left half-cell</span>
            <div>
              <select value={leftId} onChange={event => chooseHalfCell('left', event.target.value)}>
                {halfCells.map(cell => <option key={cell.id} value={cell.id}>{cell.name} | {formatIon(cell)}/{cell.symbol}</option>)}
              </select>
            </div>
          </label>
          <label className="calculator-field">
            <span>Left Eᶿ reduction potential</span>
            <div>
              <input type="number" step="any" value={leftPotential} onChange={event => setLeftPotential(event.target.value)} />
              <b>V</b>
            </div>
          </label>
          <label className="calculator-field">
            <span>Right half-cell</span>
            <div>
              <select value={rightId} onChange={event => chooseHalfCell('right', event.target.value)}>
                {halfCells.map(cell => <option key={cell.id} value={cell.id}>{cell.name} | {formatIon(cell)}/{cell.symbol}</option>)}
              </select>
            </div>
          </label>
          <label className="calculator-field">
            <span>Right Eᶿ reduction potential</span>
            <div>
              <input type="number" step="any" value={rightPotential} onChange={event => setRightPotential(event.target.value)} />
              <b>V</b>
            </div>
          </label>

          <div className="calculator-display compact-display electrochem-result">
            <span>Cell potential</span>
            <CalculatedValue value={cellData?.cellPotential} sigFigs={2} unit="V" />
            <small>{feasible ? 'Spontaneous galvanic cell under standard conditions.' : 'No driving force with this exact pair of values.'}</small>
          </div>
        </div>

        <div className={`electrochem-simulation ${electronClass} ${bridgeClass}`}>
          <div className="wire-track" aria-hidden="true">
            <span className="electron-dot dot-one">e⁻</span>
            <span className="electron-dot dot-two">e⁻</span>
            <span className="electron-dot dot-three">e⁻</span>
          </div>
          <div className="voltmeter">
            <span>voltmeter</span>
            <strong>{cellData ? formatPotential(cellData.cellPotential) : '-- V'}</strong>
          </div>
          <div className="salt-bridge" aria-label="Salt bridge">
            <strong>KNO₃ salt bridge</strong>
            <span className="bridge-ion anion">NO₃⁻</span>
            <span className="bridge-ion cation">K⁺</span>
          </div>

          <CellBeaker cell={leftCell} role={leftRole} side="left" reaction={halfReaction(leftCell, leftRole)} potential={leftPotential} />
          <CellBeaker cell={rightCell} role={rightRole} side="right" reaction={halfReaction(rightCell, rightRole)} potential={rightPotential} />
        </div>
      </div>

      <div className="electrochem-summary">
        <div>
          <span>Electron flow</span>
          <strong>{cellData ? `${cellData.anode.symbol} anode → ${cellData.cathode.symbol} cathode` : 'Check values'}</strong>
          <small>Electrons leave the oxidation half-cell and travel through the wire to the reduction half-cell.</small>
        </div>
        <div>
          <span>Salt bridge</span>
          <strong>{cellData ? `Anions → ${cellData.anode.symbol} side, cations → ${cellData.cathode.symbol} side` : 'Check values'}</strong>
          <small>This keeps both solutions electrically neutral while the reaction continues.</small>
        </div>
        <div>
          <span>Overall reaction</span>
          <strong>{overallEquation}</strong>
          <small>Electrons cancel when the oxidation and reduction half-equations are combined.</small>
        </div>
      </div>

      <div className="calculator-working">
        <div>
          <span>Anode</span>
          <strong>{cellData ? `${cellData.anode.symbol}: ${halfReaction(cellData.anode, 'Anode')}` : 'Check values'}</strong>
        </div>
        <div>
          <span>Cathode</span>
          <strong>{cellData ? `${cellData.cathode.symbol}: ${halfReaction(cellData.cathode, 'Cathode')}` : 'Check values'}</strong>
        </div>
        <div>
          <span>Calculation</span>
          <strong>
            {cellData
              ? `${formatPotential(cellData.cathodePotential)} - (${formatPotential(cellData.anodePotential)}) = ${formatPotential(cellData.cellPotential)}`
              : 'Choose valid electrode potentials.'}
          </strong>
        </div>
      </div>
    </section>
  )
}
