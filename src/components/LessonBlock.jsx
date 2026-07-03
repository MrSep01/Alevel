export default function LessonBlock({ lesson }) {
  return (
    <section className="panel lesson-block">
      <div>
        <p className="eyebrow">Guided Lesson</p>
        <h2>{lesson.title}</h2>
        <p>{lesson.overview}</p>
      </div>

      {lesson.steps.map((step, index) => (
        <article className="lesson-step" key={step.title}>
          <p className="eyebrow">Step {index + 1}</p>
          <h3>{step.title}</h3>
          <p>{step.content}</p>
        </article>
      ))}

      <article className="warning-box">
        <strong>Common misconception:</strong> {lesson.misconception}
      </article>
    </section>
  )
}
