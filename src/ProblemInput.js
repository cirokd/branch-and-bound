// @flow
import React, { Component } from 'react'
import { InlineMath } from 'react-katex'
// $FlowFixMe
import 'katex/dist/katex.min.css'

type Props = {
  submitProblem: Function
}

type State = {
  coefficients: Array<Array<number>>,
  bVector: Array<number>,
  cVector: Array<number>
}

class ProblemInput extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      coefficients: [[-10, 20], [5, 10], [1, 0]],
      bVector: [22, 49, 5],
      cVector: [-1, 4]
    }
  }

  addRow = () => {
    const { coefficients, bVector } = this.state
    const nCols = coefficients[0].length
    const newRow = [...Array(nCols)].map(() => 1)
    const newCoeff = [...coefficients, newRow]
    const newBVec = [...bVector, 1]

    this.setState({
      coefficients: newCoeff,
      bVector: newBVec
    })
  }

  deleteRow = (i: number) => {
    const { coefficients, bVector } = this.state

    if (bVector.length === 2) {
      alert('You cannot have less than 2 rows.')
      return
    }

    const newCoeff = removeIndex(coefficients, i)
    const newBVec = removeIndex(bVector, i)

    this.setState({
      coefficients: newCoeff,
      bVector: newBVec
    })
  }

  addColumn = () => {
    const newCoeff = this.state.coefficients.map(row => [...row, 1])
    const newCVec = [...this.state.cVector, 1]

    this.setState({
      coefficients: newCoeff,
      cVector: newCVec
    })
  }

  deleteColumn = (i: number) => {
    const { coefficients, cVector } = this.state

    if (cVector.length === 2) {
      alert('You cannot have less than 2 columns.')
      return
    }

    const newCoeff = coefficients.map(row => removeIndex(row, i))
    const newCVec = removeIndex(cVector, i)

    this.setState({
      coefficients: newCoeff,
      cVector: newCVec
    })
  }

  coefficientChanged = (i: number, j: number) => (event: Object) => {
    const newValue = event.target.value
    const newCoeff = this.state.coefficients.map((row, rowIndex) =>
      i === rowIndex
        ? row.map((cell, cellIndex) => (j === cellIndex ? newValue : cell))
        : row
    )

    this.setState({
      coefficients: newCoeff
    })
  }

  bVectorChanged = (i: number) => (event: Object) => {
    const newValue = event.target.value
    const newBVec = this.state.bVector.map((b, index) =>
      i === index ? newValue : b
    )

    this.setState({
      bVector: newBVec
    })
  }

  cVectorChanged = (i: number) => (event: Object) => {
    const newValue = event.target.value
    const newCVec = this.state.cVector.map((c, index) =>
      i === index ? newValue : c
    )

    this.setState({
      cVector: newCVec
    })
  }

  render() {
    const { coefficients, bVector, cVector } = this.state
    const { submitProblem } = this.props

    return (
      <div className="problem-input">
        <h1>Problem input</h1>
        <div className="controls">
          <button onClick={this.addRow}>Add row</button>
          <button onClick={this.addColumn}>Add column</button>
        </div>
        <table>
          <tbody>
            {coefficients.map((row, i) => (
              <tr>
                {row.map((cell, j) => (
                  <>
                    <td>
                      <input
                        type="number"
                        value={coefficients[i][j]}
                        onChange={this.coefficientChanged(i, j)}
                      />{' '}
                      <InlineMath math={`x_${j + 1}`} />
                    </td>
                    {j !== row.length - 1 && (
                      <td>
                        <InlineMath math="+" />
                      </td>
                    )}
                  </>
                ))}
                <td>
                  <InlineMath math="\leq" />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={bVector[i]}
                    onChange={this.bVectorChanged(i)}
                  />
                </td>
                <td>
                  <button onClick={() => this.deleteRow(i)}>Delete row</button>
                </td>
              </tr>
            ))}
            <tr className="with-top-separator">
              {cVector.map((c, i) => (
                <>
                  <td>
                    <input
                      type="number"
                      value={c}
                      onChange={this.cVectorChanged(i)}
                    />{' '}
                    <InlineMath math={`x_${i + 1}`} />
                  </td>
                  {i !== cVector.length - 1 && (
                    <td>
                      <InlineMath math="+" />
                    </td>
                  )}
                </>
              ))}
              <td>
                <InlineMath math="\to" />
              </td>
              <td>
                <InlineMath math="max" />
              </td>
            </tr>
            <tr>
              {cVector.map((c, i) => (
                <>
                  <td>
                    <button onClick={() => this.deleteColumn(i)}>
                      Delete column
                    </button>
                  </td>
                  <td />
                </>
              ))}
              <td />
              <td>
                <button
                  onClick={() => submitProblem(coefficients, bVector, cVector)}
                >
                  Finalize
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

const removeIndex = <T>(arr: Array<T>, i: number): Array<T> => [
  ...arr.slice(0, i),
  ...arr.slice(i + 1)
]

export default ProblemInput
