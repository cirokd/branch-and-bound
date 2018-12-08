/* eslint-disable */

// based on http://web.archive.org/web/20130202141934/http://wildreason.com/wildreason-blog/2010/javascript-convert-a-decimal-into-a-simplified-fraction

function HCF(u, v) {
  var U = u,
    V = v
  while (true) {
    if (!(U %= V)) return V
    if (!(V %= U)) return U
  }
}
//convert a decimal into a fraction
export default function fraction(decimal) {
  decimal = decimal.toFixed(2)
  var whole = String(decimal).split('.')[0]
  var decimal = parseFloat('.' + String(decimal).split('.')[1])
  var num = '1'
  var z
  for (z = 0; z < String(decimal).length - 2; z++) {
    num += '0'
  }
  decimal = decimal * num
  num = parseInt(num)
  for (z = 2; z < decimal + 1; z++) {
    if (decimal % z == 0 && num % z == 0) {
      decimal = decimal / z
      num = num / z
      z = 2
    }
  }
  //if format of fraction is xx/xxx
  if (decimal.toString().length == 2 && num.toString().length == 3) {
    //reduce by removing trailing 0's
    decimal = Math.round(Math.round(decimal) / 10)
    num = Math.round(Math.round(num) / 10)
  }
  //if format of fraction is xx/xx
  else if (decimal.toString().length == 2 && num.toString().length == 2) {
    decimal = Math.round(decimal / 10)
    num = Math.round(num / 10)
  }
  //get highest common factor to simplify
  var t = HCF(decimal, num)

  //return the fraction after simplifying it
  // return (whole == 0 ? '' : whole + ' ') + decimal / t + '/' + num / t
  if (num / t == 1) {
    return (whole * num) / t + decimal / t
  } else {
    return (whole * num) / t + decimal / t + '/' + num / t
  }
}
