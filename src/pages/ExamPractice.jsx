export default function ExamPractice() {
  return (
    <div className="page">
      <section className="hero">
        <p className="eyebrow">Exam Practice</p>
        <h1>Command words, exam frames, and mark-scheme thinking.</h1>
        <p>
          This starter page is ready for topic-specific exam questions, student response boxes,
          mark schemes, and self-assessment rubrics.
        </p>
      </section>

      <section className="section grid-3">
        <article className="card">
          <h3>Explain</h3>
          <p>State the chemistry principle, then connect it to the evidence or context using because/therefore.</p>
        </article>
        <article className="card">
          <h3>Calculate</h3>
          <p>Write formula, substitute values, show units, and round to the correct significant figures.</p>
        </article>
        <article className="card">
          <h3>Suggest</h3>
          <p>Apply familiar chemistry to an unfamiliar situation. Use patterns, bonding, structure, and data.</p>
        </article>
      </section>

      <section className="section panel">
        <p className="eyebrow">Student Response Frame</p>
        <h2>Exam Answer Builder</h2>
        <ol className="clean-list">
          <li>Identify the topic and command word.</li>
          <li>Write the relevant principle or equation.</li>
          <li>Apply the principle to the data in the question.</li>
          <li>Use correct symbols, units, state symbols, and significant figures.</li>
        </ol>
      </section>
    </div>
  )
}
