const sceneCopy = {
  concentration: {
    title: 'Solution = solute + solvent',
    note: 'A solution is prepared by measuring the solute, adding solvent, then mixing until the solute dissolves.',
    imageKey: 'solution',
    terms: [
      ['Solute', 'the measured solid that dissolves'],
      ['Solvent', 'the liquid used to make the solution'],
      ['Solution', 'the dissolved mixture in the beaker'],
      ['Meniscus', 'read the bottom of the curve at eye level'],
    ],
  },
  moles: {
    title: 'Moles in a measured solution',
    note: 'Concentration tells you how many moles of dissolved solute are present in each dm³.',
    imageKey: 'solution',
    terms: [
      ['Aliquot', 'a measured sample of solution'],
      ['Volume', 'convert cm³ to dm³ using × 10⁻³'],
      ['Solute particles', 'the dissolved particles being counted'],
      ['n = c × V', 'moles come from concentration and volume'],
    ],
  },
  volume: {
    title: 'Volume needed for a chosen number of moles',
    note: 'A more concentrated solution needs a smaller measured volume to supply the same moles.',
    imageKey: 'solution',
    terms: [
      ['Required volume', 'the volume of solution you need to measure'],
      ['Concentration', 'moles of solute in each dm³'],
      ['Mark', 'the final measured volume line'],
      ['V = n ÷ c', 'find volume in dm³, then convert to cm³'],
    ],
  },
  dilution: {
    title: 'Dilution keeps moles but increases volume',
    note: 'A measured volume of stock solution is transferred, then solvent is added to the calibration mark.',
    imageKey: 'dilution',
    terms: [
      ['Stock solution', 'the concentrated starting solution'],
      ['Volumetric flask', 'made up exactly to the calibration mark'],
      ['Dilution', 'same moles of solute, more solvent'],
      ['c₁V₁ = c₂V₂', 'moles before dilution = moles after dilution'],
    ],
  },
  titration: {
    title: 'Titre is volume delivered from the burette',
    note: 'The titre is the measured burette volume needed to reach the indicator endpoint.',
    imageKey: 'titration',
    terms: [
      ['Burette', 'delivers measured volume into the flask'],
      ['Titre', 'final reading − initial reading'],
      ['Endpoint', 'indicator colour change'],
      ['Aliquot', 'known volume in the conical flask'],
    ],
  },
}

const sceneImages = {
  solution: {
    src: '/assets/images/tools/concentration-solution-prep.png',
    alt: 'Realistic chemistry lab setup with a beaker of blue solution, solid solute on a weighing boat, spatula, and solvent bottle.',
    focus: [
      ['Solid measured first', 'The solute is weighed before it is dissolved.'],
      ['Solvent added after', 'The solvent is used to make up the solution volume.'],
      ['Final mixture', 'The beaker shows the dissolved solution, not particles being poured in.'],
    ],
  },
  dilution: {
    src: '/assets/images/tools/concentration-dilution.png',
    alt: 'Realistic dilution setup with a beaker of stock solution, pipette, and volumetric flask containing diluted solution.',
    focus: [
      ['Stock solution', 'Start with a measured volume of the concentrated solution.'],
      ['Transfer', 'Use a pipette to move a known volume accurately.'],
      ['Make to mark', 'Add solvent until the flask reaches the calibration line.'],
    ],
  },
  titration: {
    src: '/assets/images/tools/concentration-titration.png',
    alt: 'Realistic titration setup with a burette clamped above a conical flask containing pale pink endpoint solution.',
    focus: [
      ['Burette reading', 'The titre comes from final reading minus initial reading.'],
      ['Aliquot in flask', 'The conical flask contains a known measured volume.'],
      ['Endpoint', 'The colour change shows when the reaction is just complete.'],
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

export default function ConcentrationVisual({ modeId, result, resultUnit }) {
  const copy = sceneCopy[modeId] || sceneCopy.concentration
  const image = sceneImages[copy.imageKey] || sceneImages.solution

  return (
    <section className={`concentration-visual-panel ${modeId}`}>
      <div className="concentration-visual-copy">
        <span>Real lab view</span>
        <h3>{copy.title}</h3>
        <p>{copy.note}</p>
        <div className="concentration-result-chip">
          <span>Current answer</span>
          <strong>{formatResult(result, resultUnit)}</strong>
        </div>
      </div>

      <figure className="concentration-scene-card concentration-photo-card">
        <img className="concentration-photo" src={image.src} alt={image.alt} />
        <figcaption className="concentration-photo-notes">
          {image.focus.map(([label, detail]) => (
            <span key={label}>
              <strong>{label}</strong>
              {detail}
            </span>
          ))}
        </figcaption>
      </figure>

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
