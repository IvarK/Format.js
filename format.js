/**
 * 
 * Format.js, for all your formatting needs!
 */


var not = "Scientific"

const PLACES = 2 // Decimal places

const PLACES_UNDER_1000 = 2 // Decimal places when number is under 1000

const MIXED_POWER_THRESHOLD = 33 // Threshold, under which always displays the standard notation on mixed scientific and mixed engineering

const FORMATLIST = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qt', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 
                    'UDc', 'DDc', 'TDc', 'QaDc', 'QtDc', 'SxDc', 'SpDc', 'ODc', 'NDc', 
                    'Vg', 'UVg', 'DVg', 'TVg', 'QaVg', 'QtVg', 'SxVg', 'SpVg', 'OVg', 
                    'NVg', 'Tg', 'UTg', 'DTg', 'TTg', 'QaTg', 'QtTg', 'SxTg', 'SpTg', 
                    'OTg', 'NTg', 'Qd', 'UQd', 'DQd', 'TQd', 'QaQd', 'QtQd', 'SxQd', 
                    'SpQd', 'OQd', 'NQd', 'Qi', 'UQi', 'DQi', 'TQi', 'QaQi', 'QtQi', 
                    'SxQi', 'SpQi', 'OQi', 'NQi', 'Se', 'USe', 'DSe', 'TSe', 'QaSe', 
                    'QtSe', 'SxSe', 'SpSe', 'OSe', 'NSe', 'St', 'USt', 'DSt', 'TSt', 
                    'QaSt', 'QtSt', 'SxSt', 'SpSt', 'OSt', 'NSt', 'Og', 'UOg', 'DOg', 
                    'TOg', 'QaOg', 'QtOg', 'SxOg', 'SpOg', 'OOg', 'NOg', 'Nn', 'UNn', 
                    'DNn', 'TNn', 'QaNn', 'QtNn', 'SxNn', 'SpNn', 'ONn', 'NNn', 'Ce',];

const commaRegexp = /\B(?=(\d{3})+(?!\d))/g;

const HAS_DECIMAL_LIBRARY = typeof Decimal === "function" // This checks whether Decimal has been imported or not, so we know to use Decimal or Math libraries

const m = HAS_DECIMAL_LIBRARY ? "Decimal" : "Math"

function letter(power,str) {
  const len = str.length;
  function lN(n) {
    let result = 1;
    for (var j = 0; j < n; ++j) result = len*result+1;
    return result;
  }
  if (power <= 5) return str[0];
  power = Math.floor(power / 3);
  let i=0;
  while (power >= lN(++i));
  if (i==1) return str[power-1];
  power -= lN(i-1);
  let ret = '';
  while (i>0) ret += str[Math.floor(power/Math.pow(len,--i))%len]
  return ret;
}

/**
 * 
 * used to get names for very large numbers
 */
function getAbbreviation(e) {
  const prefixes = [
  ['', 'U', 'D', 'T', 'Qa', 'Qt', 'Sx', 'Sp', 'O', 'N'],
  ['', 'Dc', 'Vg', 'Tg', 'Qd', 'Qi', 'Se', 'St', 'Og', 'Nn'],
  ['', 'Ce', 'Dn', 'Tc', 'Qe', 'Qu', 'Sc', 'Si', 'Oe', 'Ne']]
  const prefixes2 = ['', 'MI-', 'MC-', 'NA-', 'PC-', 'FM-']
  e = Math.floor(e/3)-1;
  let index2 = 0;
  let prefix = [prefixes[0][e%10]];
  while (e >= 10) {
    e = Math.floor(e/10);
    prefix.push(prefixes[(++index2)%3][e%10])
  }
  index2 = Math.floor(index2/3)
  while (prefix.length%3 != 0) prefix.push("");
  let ret = "";
  while (index2 >= 0) ret += prefix[index2*3] + prefix[index2*3+1] + prefix[index2*3+2] + prefixes2[index2--];
  if (ret.endsWith("-")) ret = ret.slice(0,ret.length-1)
  return ret.replace("UM","M").replace("UNA","NA").replace("UPC","PC").replace("UFM","FM")
}

const inflog = Math.log10(Number.MAX_VALUE)

const Format = {
  addCommas: function(power) {
    return power.toString().replace(commaRegexp, ",")
  },
  scientific: function(power, mantissa) {
    if (power > 100000) return (mantissa + "e" + this.addCommas(power))    
    else return (mantissa + "e" + power);
  },
  engineering: function(power, mantissa) {
    let pow = power - (power % 3)
    if (pow > 100000) pow = addCommas(pow)
    return (mantissa + "e" + pow);
  },
  standard: function(power, mantissa) {
    let pow = power - (power % 3)
    if (pow <= 303) return mantissa + " " + FORMATLIST[pow / 3];
    else return mantissa + " " + getAbbreviation(pow);
  },
  logarithm: function(value, power) {
    if (power > 100000) return "e" + addCommas(window[m].log10(value).toFixed(PLACES))
    else return "e"+window[m].log10(value).toFixed(Math.max(PLACES, 1))
  },
  letters: function(power, mantissa) {
    return mantissa + letter(power,'abcdefghijklmnopqrstuvwxyz');
  }
}


function format(value, notation) {
  if (notation === undefined) notation = not
  if ( value >= 1000 ) {
    
    let power, mantissa;
    if (HAS_DECIMAL_LIBRARY && value instanceof Decimal) {
      power = value.e
      mantissa = value.mantissa
    } else {
      mantissa = value / Math.pow(10, Math.floor(Math.log10(value)));
      power = Math.floor(Math.log10(value));
    }
    
    if ((notation === "Mixed scientific" && power >= MIXED_POWER_THRESHOLD) || notation === "Scientific") {
      mantissa = mantissa.toFixed(PLACES)
      if (mantissa >= 10) {
        mantissa /= 10;
        power++;
      }
      return Format.scientific(power, mantissa)
    }

    if (notation === "Logarithm") return Format.logarithm(value, power)

    mantissa = (mantissa * window[m].pow(10, power % 3)).toFixed(PLACES)
    if (mantissa >= 1000) {
        mantissa /= 1000;
        power++;
    }

    if (notation === "Standard" || notation === "Mixed scientific" || 
       (notation === "Mixed Engineering" && power <= MIXED_POWER_THRESHOLD)) return Format.standard(power, mantissa)
    else if (notation === "Engineering" || notation === "Mixed Engineering") return Format.engineering(power, mantissa);
    else if (notation === "Letters") return Format.letters(power, mantissa)
  }
  
  return (value).toFixed(PLACES_UNDER_1000);
}

Object.defineProperty(Number.prototype, "format", { value: function(notation) { return format(this, notation) }})
if (HAS_DECIMAL_LIBRARY) Object.defineProperty(Decimal.prototype, "format", { value: function(notation) { return format(this, notation) }})

