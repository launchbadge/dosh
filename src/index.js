import find from "lodash/collection/find"

export default {
  cleanNumber,
  validateNumber,
  validateCVC,
  validateExpiryYear,
  validateExpiryMonth
}

// Listing of payment cards and their specifications taken from (MIT):
// https://github.com/stripe/jquery.payment/blob/master/lib/jquery.payment.js
const cards = [
  {
    type: "visaelectron",
    pattern: /^4(026|17500|405|508|844|91[37])/,
    length: [16],
    cvcLength: [3],
    luhn: true
  }, {
    type: "maestro",
    pattern: /^(5(018|0[23]|[68])|6(39|7))/,
    length: [12, 13, 14, 15, 16, 17, 18, 19],
    cvcLength: [3],
    luhn: true
  }, {
    type: "forbrugsforeningen",
    pattern: /^600/,
    length: [16],
    cvcLength: [3],
    luhn: true
  }, {
    type: "dankort",
    pattern: /^5019/,
    cvcLength: [3],
    luhn: true
  }, {
    type: "visa",
    pattern: /^4/,
    length: [13, 16],
    cvcLength: [3],
    luhn: true
  }, {
    type: "mastercard",
    pattern: /^5[0-5]/,
    length: [16],
    cvcLength: [3],
    luhn: true
  }, {
    type: "amex",
    pattern: /^3[47]/,
    length: [15],
    cvcLength: [3, 4],
    luhn: true
  }, {
    type: "dinersclub",
    pattern: /^3[0689]/,
    length: [14],
    cvcLength: [3],
    luhn: true
  }, {
    type: "discover",
    pattern: /^6([045]|22)/,
    length: [16],
    cvcLength: [3],
    luhn: true
  }, {
    type: "unionpay",
    pattern: /^(62|88)/,
    length: [16, 17, 18, 19],
    cvcLength: [3],
    luhn: false
  }, {
    type: "jcb",
    pattern: /^35/,
    length: [16],
    cvcLength: [3],
    luhn: true
  }
]

// Guess the card type from the given card number
function match(number) {
  // Strip any non-digit characters
  number = (number + "").replace(/\D/g, "")

  // Iterate through each card type schema
  for (let card of cards) {
    if (card.pattern.test(number)) {
      return card
    }
  }
}

function luhn(number) {
  // credit - https://gist.github.com/DiegoSalazar/4075533

  let even = false
  let sum = 0
  let digits = (number + "").split("").reverse()

  for (let digit of digits) {
    digit = parseInt(digit, 10)
    if (even) {
      digit *= 2
    }

    if (digit > 9) {
      digit -= 9
    }

    even = !even
    sum += digit
  }

  return sum % 10 === 0
}

export function cleanNumber(text) {
  // Remove all extra characters from the string
  return ("" + text).replace(/[\. ,:-]+/g, "")
}

export function validateNumber(number) {
  number = cleanNumber(number)

  // Attempt to match this number against our card schemas
  let card = match(number)
  if (!card) {
    return false
  }

  // Validate the card number length (if needed)
  if (card.length && card.length.indexOf(number.length) < 0) {
    return false
  }

  // Validate using the luhn algorithm (if needed)
  if (card.luhn && !luhn(number)) {
    return false
  }

  // Everything seems to check out return the card type
  return card.type
}

export function validateCVC(cvc, type) {
  // Trim spaces
  cvc = ("" + cvc).trim()

  // Ensure that this is strictly a digit sequence
  if (!/^\d+$/.test(cvc)) {
    return false
  }

  // Get the card schema for this type.
  let card = find(cards, {type})
  if (card) {
    // Check the CVC length against the expected lengths
    return (card.cvcLength.indexOf(cvc.length) >= 0)
  }

  // Could not match a card schema validate the CVC in a generic fashion
  return (cvc.length >= 3 && cvc.length <= 4)
}

export function validateExpiryYear(year) {
  let now = new Date()
  if (year < now.getFullYear()) {
    return false
  }

  return true
}

export function validateExpiryMonth(year, month) {
  let now = new Date()
  if (((year === now.getFullYear() && month && (month <= now.getMonth()))) ||
       (year < now.getFullYear())) {
    return false
  }

  return true
}
