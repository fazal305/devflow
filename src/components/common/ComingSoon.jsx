import './ComingSoon.css'

/** Placeholder for pages whose real implementation lands in a later build step. */
export function ComingSoon({ step }) {
  return (
    <div className="coming-soon">
      <p>This module is built in {step} of the DevFlow build plan.</p>
    </div>
  )
}
