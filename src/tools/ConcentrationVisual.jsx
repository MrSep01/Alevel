const particlePositions = [
  [42, 104], [64, 130], [92, 112], [118, 142], [150, 116], [174, 148],
  [56, 166], [86, 184], [124, 172], [164, 188], [194, 128], [208, 168],
  [76, 222], [116, 234], [158, 216], [196, 232],
]

const sceneCopy = {
  concentration: {
    title: 'Solution = solute + solvent',
    note: 'The same moles in a smaller volume gives a more concentrated solution.',
    terms: [
      ['Solute', 'the chemical dissolved in the liquid'],
      ['Solvent', 'the liquid that dissolves the solute'],
      ['Solution', 'solute particles spread through solvent'],
      ['Meniscus', 'read the bottom of the curve at eye level'],
    ],
  },
  moles: {
    title: 'Moles in a measured solution',
    note: 'Concentration tells you how many moles are present in each dm³.',
    terms: [
      ['Aliquot', 'a measured sample of solution'],
      ['Volume', 'convert cm³ to dm³ using × 10⁻³'],
      ['Solute particles', 'the dissolved particles being counted'],
      ['n = c × V', 'moles come from concentration and volume'],
    ],
  },
  volume: {
    title: 'Volume needed for a chosen number of moles',
    note: 'A more concentrated solution needs a smaller volume to supply the same moles.',
    terms: [
      ['Required volume', 'the volume of solution you need to measure'],
      ['Concentration', 'moles of solute in each dm³'],
      ['Mark', 'the final measured volume line'],
      ['V = n ÷ c', 'find volume in dm³, then convert to cm³'],
    ],
  },
  dilution: {
    title: 'Dilution keeps moles but increases volume',
    note: 'Adding solvent spreads the same solute particles through a larger volume.',
    terms: [
      ['Stock solution', 'the concentrated starting solution'],
      ['Volumetric flask', 'made up exactly to the calibration mark'],
      ['Dilution', 'same moles of solute, more solvent'],
      ['c₁V₁ = c₂V₂', 'moles before dilution = moles after dilution'],
    ],
  },
  titration: {
    title: 'Titre is volume delivered from the burette',
    note: 'The titre is the burette volume used to reach the endpoint.',
    terms: [
      ['Burette', 'delivers measured volume into the flask'],
      ['Titre', 'final reading − initial reading'],
      ['Endpoint', 'indicator colour change'],
      ['Aliquot', 'known volume in the conical flask'],
    ],
  },
}

function numberOrNull(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

function formatResult(value, unit) {
  const number = numberOrNull(value)
  return number ? `${number.toPrecision(3)} ${unit}` : 'waiting for values'
}

function solutionLevel(modeId, values) {
  if (modeId === 'dilution') return 0.82
  if (modeId === 'titration') return 0.38
  const volume = numberOrNull(values.volumeCm3 || values.finalVolume || values.titre)
  if (!volume) return 0.56
  return Math.min(0.86, Math.max(0.30, volume / 320))
}

function particleOpacity(modeId) {
  if (modeId === 'dilution') return 0.48
  if (modeId === 'titration') return 0.58
  if (modeId === 'moles') return 0.72
  return 0.84
}

function BeakerScene({ modeId, values }) {
  const level = solutionLevel(modeId, values)
  const solutionTop = 286 - (level * 190)
  const opacity = particleOpacity(modeId)

  return (
    <svg className="concentration-svg" viewBox="0 0 520 330" role="img" aria-label="Animated solution diagram">
      <defs>
        <linearGradient id="solutionGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#9ee8ff" />
          <stop offset="100%" stopColor="#45b7e8" />
        </linearGradient>
        <linearGradient id="flaskGlass" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f8fbff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#d6edf8" stopOpacity="0.42" />
        </linearGradient>
      </defs>

      <path className="solvent-pour" d="M104 48 C132 82 144 112 136 152" />
      <text className="visual-label solvent" x="54" y="36">solvent</text>
      <g className="solute-crystals">
        <rect x="326" y="38" width="16" height="16" rx="4" />
        <rect x="350" y="58" width="13" height="13" rx="3" />
        <rect x="318" y="72" width="11" height="11" rx="3" />
      </g>
      <text className="visual-label solute" x="372" y="58">solute</text>

      <path className="glass-shape" d="M182 64 L338 64 L362 286 Q260 310 158 286 Z" fill="url(#flaskGlass)" />
      <path className="solution-fill" d={`M169 ${solutionTop} Q260 ${solutionTop - 12} 351 ${solutionTop} L362 286 Q260 310 158 286 Z`} fill="url(#solutionGradient)" />
      <path className="meniscus" d={`M169 ${solutionTop} Q260 ${solutionTop - 12} 351 ${solutionTop}`} />
      <text className="visual-label meniscus" x="364" y={Math.max(92, solutionTop - 6)}>meniscus</text>
      <text className="visual-label solution" x="218" y="304">solution</text>

      {particlePositions.map(([x, y], index) => (
        <circle
          className="solute-particle"
          cx={x + 92}
          cy={Math.max(solutionTop + 14, y)}
          key={`${x}-${y}`}
          r={5 + (index % 3)}
          style={{ animationDelay: `${index * 0.16}s`, opacity }}
        />
      ))}
    </svg>
  )
}

function DilutionScene() {
  return (
    <svg className="concentration-svg dilution-svg" viewBox="0 0 520 330" role="img" aria-label="Dilution diagram">
      <defs>
        <linearGradient id="dilutionFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#bff4ff" />
          <stop offset="100%" stopColor="#5cc4ee" />
        </linearGradient>
        <marker id="arrow" markerHeight="8" markerWidth="10" orient="auto" refX="9" refY="4">
          <path d="M0,0 L10,4 L0,8 Z" fill="#6b2cb2" />
        </marker>
      </defs>
      <g className="stock-beaker">
        <path d="M48 92 L156 92 L142 258 Q102 272 62 258 Z" />
        <path className="solution-fill-soft" d="M60 160 Q102 150 144 160 L142 258 Q102 272 62 258 Z" />
        <text x="54" y="78">stock solution</text>
      </g>
      <path className="transfer-arrow" d="M172 168 C226 136 274 136 322 168" />
      <text className="visual-label" x="200" y="118">same solute moles</text>
      <g className="volumetric-flask">
        <path d="M382 58 L414 58 L414 146 Q458 184 444 266 Q398 296 352 266 Q338 184 382 146 Z" />
        <path d="M364 224 Q398 202 434 224 L444 266 Q398 296 352 266 Z" fill="url(#dilutionFill)" />
        <line x1="374" x2="422" y1="132" y2="132" />
        <text x="360" y="42">make up to mark</text>
      </g>
      {[0, 1, 2, 3, 4, 5, 6].map(index => (
        <circle className="solute-particle diluted" cx={370 + (index % 4) * 18} cy={218 + Math.floor(index / 4) * 18} key={index} r="5" />
      ))}
      <text className="visual-label solution" x="342" y="306">diluted solution</text>
    </svg>
  )
}

function TitrationScene() {
  return (
    <svg className="concentration-svg titration-svg" viewBox="0 0 520 330" role="img" aria-label="Titration diagram">
      <g className="burette">
        <rect x="238" y="28" width="36" height="186" rx="10" />
        <line x1="274" x2="292" y1="64" y2="64" />
        <line x1="274" x2="292" y1="100" y2="100" />
        <line x1="274" x2="292" y1="136" y2="136" />
        <line x1="274" x2="292" y1="172" y2="172" />
        <path d="M246 214 L266 214 L260 238 L252 238 Z" />
      </g>
      <text className="visual-label" x="296" y="54">burette</text>
      <text className="visual-label" x="302" y="130">titre</text>
      <circle className="titre-drop one" cx="256" cy="252" r="5" />
      <circle className="titre-drop two" cx="256" cy="276" r="4" />
      <g className="conical-flask">
        <path d="M184 286 L328 286 L294 168 L218 168 Z" />
        <path className="solution-fill-soft endpoint" d="M204 252 Q256 236 308 252 L328 286 L184 286 Z" />
        <text x="168" y="154">aliquot + indicator</text>
        <text x="336" y="258">endpoint</text>
      </g>
    </svg>
  )
}

export default function ConcentrationVisual({ modeId, values, result, resultUnit }) {
  const copy = sceneCopy[modeId] || sceneCopy.concentration
  const isTitration = modeId === 'titration'
  const isDilution = modeId === 'dilution'

  return (
    <section className={`concentration-visual-panel ${modeId}`}>
      <div className="concentration-visual-copy">
        <span>Visual model</span>
        <h3>{copy.title}</h3>
        <p>{copy.note}</p>
        <div className="concentration-result-chip">
          <span>Current answer</span>
          <strong>{formatResult(result, resultUnit)}</strong>
        </div>
      </div>

      <div className="concentration-scene-card">
        {isTitration ? <TitrationScene /> : isDilution ? <DilutionScene /> : <BeakerScene modeId={modeId} values={values} />}
      </div>

      <div className="concentration-term-grid">
        {copy.terms.map(([term, definition]) => (
          <article key={term}>
            <span>{term}</span>
            <strong>{definition}</strong>
          </article>
        ))}
      </div>
    </section>
  )
}
