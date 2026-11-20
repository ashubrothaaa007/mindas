import { Component, type ReactNode } from 'react'
import { Minu } from '../mascot/Minu'

export class ErrorBoundary extends Component<{ children: ReactNode; onExit?: () => void }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error) {
    console.error('[MINDA] Scene error', error)
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="absolute inset-0 grid place-items-center bg-ink">
        <div className="flex max-w-md flex-col items-center text-center">
          <Minu mood="sad" size={150} />
          <h2 className="mt-4 font-display text-2xl font-semibold text-cream">Kochi couldn’t load</h2>
          <p className="mt-2 text-sage">Your browser may have WebGL disabled or ran out of graphics memory. Try lowering graphics quality, or reload the page.</p>
          <div className="mt-6 flex gap-3">
            <button className="btn-primary px-5 py-3" onClick={() => location.reload()}>
              Reload
            </button>
            {this.props.onExit && (
              <button className="btn-ghost px-5 py-3" onClick={() => { this.setState({ error: null }); this.props.onExit?.() }}>
                Back to menu
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }
}
