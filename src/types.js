// @flow

export type Problem = {
  coefficients: Array<Array<number>>,
  bVector: Array<number>,
  cVector: Array<number>
}

export type Coordinates = { [key: string]: number }
