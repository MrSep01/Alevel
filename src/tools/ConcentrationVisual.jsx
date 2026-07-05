const particlePositions = [
  [212, 226], [238, 208], [268, 228], [302, 206], [332, 232],
  [226, 254], [262, 264], [294, 248], [338, 262], [246, 238],
  [316, 224], [280, 270], [352, 246], [220, 276], [304, 278],
]

const dilutionParticles = [
  [450, 218], [474, 232], [500, 222], [432, 246], [462, 258], [494, 250],
  [520, 266], [446, 282], [486, 288],
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
  return Math.min(0.86, Math.max(0.34, volume / 320))
}

function particleOpacity(modeId) {
  if (modeId === 'dilution') return 0.46
  if (modeId === 'titration') return 0.58
  if (modeId === 'moles') return 0.70
  return 0.82
}

function Callout({ x, y, label, tone = 'blue', width = 98 }) {
  return (
    <g className={`lab-callout ${tone}`} transform={`translate(${x} ${y})`}>
      <rect className="lab-callout-box" width={width} height="30" rx="9" />
      <text className="lab-callout-text" x="10" y="20">{label}</text>
    </g>
  )
}

function BeakerScene({ modeId, values }) {
  const level = solutionLevel(modeId, values)
  const solutionTop = 278 - (level * 150)
  const opacity = particleOpacity(modeId)

  return (
    <svg className="concentration-svg lab-svg" viewBox="0 0 620 340" role="img" aria-label="Realistic beaker model showing solute, solvent, solution, and meniscus">
      <defs>
        <linearGradient id="labSolutionGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#b5ecff" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#4cb7df" stopOpacity="0.82" />
        </linearGradient>
        <linearGradient id="labGlassGradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.62" />
          <stop offset="48%" stopColor="#f8fbff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.36" />
        </linearGradient>
      </defs>

      <ellipse className="lab-bench-shadow" cx="308" cy="294" rx="154" ry="18" />

      <g className="lab-pourer">
        <path className="lab-glass-soft" d="M76 44 L122 66 L116 84 L66 60 Z" />
        <path className="lab-glass-line" d="M116 78 C146 92 164 116 174 151" />
        <path className="lab-water-stream" d="M126 78 C150 104 164 124 174 154" />
      </g>
      <path className="lab-callout-line" d="M128 56 L178 126" />
      <Callout x="34" y="26" label="Solvent" tone="blue" width="88" />

      <g className="lab-powder-boat">
        <path className="lab-watch-glass" d="M412 72 C442 58 492 63 520 82 C490 100 438 98 412 72 Z" />
        <rect className="lab-crystal" x="446" y="64" width="10" height="10" rx="2" transform="rotate(12 451 69)" />
        <rect className="lab-crystal" x="468" y="74" width="9" height="9" rx="2" transform="rotate(-10 472 78)" />
        <rect className="lab-crystal muted" x="430" y="78" width="8" height="8" rx="2" transform="rotate(8 434 82)" />
      </g>
      <path className="lab-callout-line amber" d="M496 60 L454 76" />
      <Callout x="498" y="34" label="Solute" tone="amber" width="80" />

      <g className="lab-beaker">
        <path className="lab-glass" d="M170 75 C222 68 346 68 398 75 L368 282 C326 298 242 298 198 282 Z" />
        <path className="lab-rim" d="M170 75 C222 66 346 66 398 75" />
        <path className="lab-spout" d="M398 75 C414 78 414 88 396 93" />
        <path className="lab-liquid" d={`M184 ${solutionTop} C226 ${solutionTop - 7} 342 ${solutionTop + 7} 382 ${solutionTop} L368 282 C326 298 242 298 198 282 Z`} />
        <path className="lab-meniscus" d={`M184 ${solutionTop} C226 ${solutionTop - 7} 342 ${solutionTop + 7} 382 ${solutionTop}`} />
        <path className="lab-highlight" d="M204 93 L214 270" />
        <path className="lab-highlight thin" d="M360 96 L344 272" />
        {[0, 1, 2, 3, 4, 5, 6].map(index => (
          <line
            className="lab-graduation"
            key={index}
            x1={338}
            x2={index % 2 ? 362 : 374}
            y1={112 + index * 23}
            y2={112 + index * 23}
          />
        ))}
        {particlePositions.map(([x, y], index) => (
          <circle
            className="lab-particle"
            cx={x}
            cy={Math.max(solutionTop + 16, y)}
            key={`${x}-${y}`}
            r={3.3 + (index % 3) * 0.8}
            style={{ animationDelay: `${index * 0.16}s`, opacity }}
          />
        ))}
      </g>

      <path className="lab-callout-line green" d={`M88 238 L206 ${Math.max(solutionTop + 58, 218)}`} />
      <Callout x="44" y="222" label="Solution" tone="green" width="90" />
      <path className="lab-callout-line purple" d={`M470 ${Math.max(solutionTop - 14, 95)} L380 ${solutionTop}`} />
      <Callout x="468" y={Math.max(solutionTop - 30, 78)} label="Meniscus" tone="purple" width="98" />
    </svg>
  )
}

function DilutionScene() {
  return (
    <svg className="concentration-svg lab-svg dilution-svg" viewBox="0 0 660 340" role="img" aria-label="Realistic dilution model showing stock solution transferred to a volumetric flask">
      <defs>
        <linearGradient id="dilutionFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#bff4ff" stopOpacity="0.86" />
          <stop offset="100%" stopColor="#5cc4ee" stopOpacity="0.74" />
        </linearGradient>
        <marker id="labArrow" markerHeight="8" markerWidth="10" orient="auto" refX="9" refY="4">
          <path d="M0,0 L10,4 L0,8 Z" fill="#6b2cb2" />
        </marker>
      </defs>

      <ellipse className="lab-bench-shadow" cx="156" cy="281" rx="92" ry="13" />
      <ellipse className="lab-bench-shadow" cx="488" cy="286" rx="98" ry="15" />

      <g className="lab-small-beaker">
        <path className="lab-glass" d="M78 112 C112 106 196 106 230 112 L212 260 C186 270 124 270 98 260 Z" />
        <path className="lab-liquid compact" d="M94 168 C122 162 188 162 214 168 L212 260 C186 270 124 270 98 260 Z" />
        <path className="lab-meniscus" d="M94 168 C122 162 188 162 214 168" />
        <path className="lab-highlight" d="M110 124 L118 248" />
      </g>
      <Callout x="48" y="70" label="Stock solution" tone="blue" width="122" />
      <path className="lab-callout-line" d="M128 100 L130 150" />

      <g className="lab-pipette">
        <path className="lab-pipette-line" d="M248 126 C322 82 386 82 458 126" />
        <ellipse className="lab-pipette-bulb" cx="354" cy="94" rx="24" ry="13" />
        <path className="lab-transfer-flow" d="M250 128 C322 100 386 100 456 128" />
      </g>
      <Callout x="268" y="144" label="Measured transfer" tone="purple" width="140" />

      <g className="lab-volumetric-flask">
        <path className="lab-glass" d="M482 56 L518 56 L518 154 C562 191 556 260 522 286 C502 302 464 302 444 286 C410 260 404 191 448 154 L448 56 Z" />
        <line className="lab-calibration-mark" x1="438" x2="528" y1="136" y2="136" />
        <path className="lab-liquid flask-fill" d="M426 238 C456 216 510 216 540 238 L522 286 C502 302 464 302 444 286 Z" />
        <path className="lab-meniscus" d="M426 238 C456 216 510 216 540 238" />
        <path className="lab-highlight flask" d="M456 74 L456 270" />
        {dilutionParticles.map(([x, y], index) => (
          <circle
            className="lab-particle diluted"
            cx={x}
            cy={y}
            key={`${x}-${y}`}
            r={3.2}
            style={{ animationDelay: `${index * 0.18}s` }}
          />
        ))}
      </g>
      <Callout x="506" y="84" label="Calibration mark" tone="amber" width="134" />
      <path className="lab-callout-line amber" d="M518 116 L528 136" />
      <Callout x="438" y="306" label="Diluted solution" tone="green" width="132" />
    </svg>
  )
}

function TitrationScene() {
  return (
    <svg className="concentration-svg lab-svg titration-svg" viewBox="0 0 660 340" role="img" aria-label="Realistic titration model showing a burette, titre, endpoint, and aliquot">
      <defs>
        <linearGradient id="endpointFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffd8eb" stopOpacity="0.84" />
          <stop offset="100%" stopColor="#f3a3cb" stopOpacity="0.72" />
        </linearGradient>
      </defs>

      <ellipse className="lab-bench-shadow" cx="352" cy="292" rx="134" ry="16" />

      <g className="lab-stand">
        <line className="lab-metal" x1="118" x2="118" y1="38" y2="296" />
        <line className="lab-metal base" x1="70" x2="170" y1="296" y2="296" />
        <line className="lab-metal clamp" x1="118" x2="256" y1="82" y2="82" />
        <rect className="lab-clamp-pad" x="244" y="68" width="38" height="28" rx="7" />
      </g>

      <g className="lab-burette">
        <rect className="lab-glass" x="278" y="32" width="38" height="194" rx="15" />
        <path className="lab-liquid burette-fill" d="M284 48 L310 48 L310 202 L284 202 Z" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map(index => (
          <line
            className="lab-graduation"
            key={index}
            x1={316}
            x2={index % 2 ? 332 : 342}
            y1={62 + index * 20}
            y2={62 + index * 20}
          />
        ))}
        <path className="lab-stopcock" d="M272 228 L322 228" />
        <circle className="lab-stopcock-knob" cx="296" cy="228" r="8" />
        <path className="lab-nozzle" d="M288 236 L304 236 L300 258 L292 258 Z" />
      </g>
      <Callout x="350" y="54" label="Burette" tone="blue" width="84" />
      <path className="lab-callout-line" d="M350 76 L316 88" />
      <Callout x="358" y="146" label="Titre volume" tone="purple" width="118" />
      <path className="lab-callout-line purple" d="M356 166 L318 170" />

      <circle className="lab-drop one" cx="296" cy="266" r="4.5" />
      <circle className="lab-drop two" cx="296" cy="286" r="3.8" />

      <g className="lab-conical-flask">
        <path className="lab-glass" d="M220 292 L426 292 L370 166 L276 166 Z" />
        <path className="lab-liquid endpoint" d="M240 258 C286 240 360 240 406 258 L426 292 L220 292 Z" />
        <path className="lab-meniscus endpoint-line" d="M240 258 C286 240 360 240 406 258" />
        <path className="lab-highlight flask" d="M280 182 L244 282" />
      </g>
      <Callout x="126" y="182" label="Aliquot + indicator" tone="amber" width="150" />
      <path className="lab-callout-line amber" d="M270 202 L302 228" />
      <Callout x="416" y="246" label="Endpoint" tone="green" width="94" />
      <path className="lab-callout-line green" d="M414 262 L378 258" />
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
