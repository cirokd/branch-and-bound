// @flow
import React, { Component } from 'react'

import ProblemInput from './ProblemInput'

import Optimizer from './Optimizer'

import type { Problem } from './types'

type Props = {}

type State = {
  initializing: boolean,
  problem: Problem
}

class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      initializing: true,
      problem: {
        coefficients: [[]],
        bVector: [],
        cVector: []
      }
    }
  }

  submitProblem = (
    coefficients: Array<Array<number>>,
    bVector: Array<number>,
    cVector: Array<number>
  ) => {
    this.setState({
      initializing: false,
      problem: {
        coefficients,
        bVector,
        cVector
      }
    })
  }

  render() {
    const { initializing, problem } = this.state
    return (
      <div>
        {initializing ? (
          <ProblemInput submitProblem={this.submitProblem} />
        ) : (
          <Optimizer problem={problem} />
        )}
      </div>
    )
  }
}

export default App
