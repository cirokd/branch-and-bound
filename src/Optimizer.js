// @flow
import React, { Component } from 'react'
import simplex from 'simplex-solver'
import { InlineMath } from 'react-katex'
// $FlowFixMe
import 'katex/dist/katex.min.css'

import fraction from './fraction-helper'
import type { Problem, Coordinates } from './types'

type BranchStatus =
  | { label: 'unknown' }
  | { label: 'not feasible' }
  | { label: 'unbounded' }
  | { label: 'local optimum' }
  | {
      label: 'optimum',
      at: { [string]: number },
      value: number,
      displayValue: string
    }

type BranchType = { constraints: Array<string>, status: BranchStatus }

const getBranchId = (branch: BranchType): string => branch.constraints.join('')

const getOptimumLocation = simplexResult => {
  const { tableaus, max, ...location } = simplexResult
  return location
}

type Props = {
  problem: Problem
}

type State = {
  branches: Array<BranchType>,
  optimum: number,
  optimumLocation: Coordinates | null
}

class Optimizer extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      branches: [
        {
          constraints: [],
          status: { label: 'unknown' }
        }
      ],
      optimum: 0,
      optimumLocation: null
    }
  }

  optimizeBranch = (branch: BranchType) => {
    const { coefficients, bVector, cVector } = this.props.problem
    const { optimum, optimumLocation } = this.state

    const result = simplex.maximize(
      cVector.map((c, i) => `${c}x${i + 1}`).join(' + '),
      [
        ...coefficients.map(
          (row, i) =>
            `${row.map((a, j) => `${a}x${j + 1}`).join(' + ')} <= ${bVector[i]}`
        ),
        ...branch.constraints
      ]
    )

    const newStatus =
      result == null
        ? { label: 'unbounded' }
        : result.max === 0
        ? { label: 'not feasible' }
        : result.max <= optimum
        ? { label: 'local optimum' }
        : {
            label: 'optimum',
            at: getOptimumLocation(result),
            value: result.max,
            displayValue: fraction(result.max)
          }
    const newBranch = { ...branch, status: newStatus }

    const brandNewBranches =
      newStatus.label === 'optimum' && newStatus.value > optimum
        ? Object.keys(newStatus.at).reduce((acc, curr) => {
            const value = newStatus.at[curr]
            if (isInteger(value)) {
              return acc
            } else {
              const newConstraint1 = `${curr} <= ${Math.floor(value)}`
              const newConstraint2 = `${curr} >= ${Math.ceil(value)}`
              return [
                ...acc,
                {
                  constraints: [...branch.constraints, newConstraint1],
                  status: { label: 'unknown' }
                },
                {
                  constraints: [...branch.constraints, newConstraint2],
                  status: { label: 'unknown' }
                }
              ]
            }
          }, [])
        : []

    const newBranches = [
      ...this.state.branches.map(b =>
        getBranchId(b) === getBranchId(newBranch) ? newBranch : b
      ),
      ...brandNewBranches
    ]

    const newOptimum =
      newStatus.label === 'optimum' && areCoordsIntegers(newStatus.at)
        ? Math.max(newStatus.value, optimum)
        : optimum

    const newOptimumLocation =
      newStatus.label === 'optimum' &&
      areCoordsIntegers(newStatus.at) &&
      optimum !== newOptimum
        ? newStatus.at
        : optimumLocation

    this.setState({
      branches: newBranches,
      optimum: newOptimum,
      optimumLocation: newOptimumLocation
    })
  }

  isDone = () => this.state.branches.every(b => b.status.label !== 'unknown')

  render() {
    const { coefficients, bVector, cVector } = this.props.problem
    const { branches, optimum, optimumLocation } = this.state

    return (
      <div>
        <div>
          <h2>Original problem:</h2>
          <div>
            {coefficients.map((row, i) => (
              <div>
                <InlineMath>{`${row
                  .map((a, j) => `${a}x_${j + 1}`)
                  .join(' + ')} \\leq ${bVector[i]}`}</InlineMath>
              </div>
            ))}
            <div>
              <InlineMath>
                {`${cVector
                  .map((c, i) => `${c}x_${i + 1}`)
                  .join(' + ')} \\to max`}
              </InlineMath>
            </div>
          </div>
          <hr />
          <h2>Branches</h2>
          <div>
            <strong>
              {this.isDone() ? 'Final' : 'Current'} optimum: {fraction(optimum)}
            </strong>{' '}
            {optimumLocation != null && coordinatesToString(optimumLocation)}
          </div>
          <div className="branch-container">
            {branches.map(b => (
              <Branch branch={b} optimize={() => this.optimizeBranch(b)} />
            ))}
          </div>
        </div>
      </div>
    )
  }
}

const coordinatesToString = coordinates => (
  <InlineMath>
    {`(${Object.keys(coordinates)
      .reduce((acc, curr) => {
        const latexVariable = curr.slice(0, 1) + '_' + curr.slice(1)
        return [...acc, `${latexVariable}=${fraction(coordinates[curr])}`]
      }, [])
      .join(',')})`}
  </InlineMath>
)

const Branch = ({ branch, optimize }) => {
  const { constraints, status } = branch

  const label =
    status.label === 'optimum' && areCoordsIntegers(status.at)
      ? 'integer optimum'
      : status.label === 'optimum'
      ? 'non-integer optimum'
      : status.label

  console.log(constraints)

  const latexConstraints = constraints
    .map(c => c.slice(0, 1) + '_' + c.slice(1))
    .join(', ')
    .replace(/>=/g, '\\geq')
    .replace(/<=/g, '\\leq')

  return (
    <div className={`branch ${label.replace(' ', '-')}`}>
      <strong>Extra constraints: </strong>
      {constraints.length === 0 ? (
        '(none)'
      ) : (
        <InlineMath math={latexConstraints} />
      )}
      <div>Status: {label}</div>
      {status.label === 'unknown' && (
        <button onClick={optimize}>Optimize branch</button>
      )}
      {status.label === 'optimum' && (
        <>
          value: <InlineMath math={`${status.displayValue}`} />
          <br />
          {coordinatesToString(status.at)}
        </>
      )}
    </div>
  )
}

const isInteger = (n: number): boolean => n % 1 === 0

const areCoordsIntegers = (coords: Coordinates) =>
  Object.keys(coords).every(x => isInteger(coords[x]))

export default Optimizer
