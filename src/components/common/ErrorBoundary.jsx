import { Component } from 'react'
import { Icon } from './Icon'
import './ErrorBoundary.css'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('DevFlow crashed:', error, info)
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="error-boundary" role="alert">
        <Icon name="close" size={28} />
        <h2>Something went wrong</h2>
        <p>
          {this.props.label ?? 'This part of DevFlow hit an unexpected error.'} Your data is
          safe in local storage — this only affects the current view.
        </p>
        <button className="error-boundary__retry" onClick={this.handleReset}>
          Try again
        </button>
      </div>
    )
  }
}
