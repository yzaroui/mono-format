interface Formattable {
  format(formatString?: string): string;
}
declare global {
  interface Number extends Formattable{}
  interface Date extends Formattable{}
  interface StringConstructor {
    format(formatString: string, ...args: any[]): string;
  }
}

/*Number.prototype.format = function(format) {
  var number = Number(this),
    radixPoint = currentCulture._r,
    thousandSeparator = currentCulture._t;

  // If not finite, i.e. ±Intifity and NaN, return the default JavaScript string notation
  if (!isFinite(number)) {
    return "" + number;
  }

  // Default formatting if no format string is specified
  if (!format && format !== "0") {
    format = "G";
  }

  // EVALUATE STANDARD NUMERIC FORMAT STRING
  // See reference at
  // http://msdn.microsoft.com/en-us/library/dwhawy9k.aspx

  var standardFormatStringMatch = format.match(/^([a-zA-Z])(\d{0,2})$/);
  if (standardFormatStringMatch)
  {
    var standardFormatStringMatch_UpperCase = standardFormatStringMatch[1][toUpperCase](),
      precision = parseInt(standardFormatStringMatch[2], 10); // parseInt used to ensure empty string is aprsed to NaN

    // Standard numeric format string
    switch (standardFormatStringMatch_UpperCase) {
      case "D":
        // DECIMAL
        // Precision: number of digits

        // Note: the .NET implementation throws an exception if used with non-integral
        // data types. However, this implementation follows the JavaScript manner being
        // nice about arguments and thus rounds any floating point numbers to integers.

        return basicNumberFormatter(number, numberCoalesce(precision, 1), 0, 0);

      case "F":
        // FIXED-POINT
        // Precision: number of decimals

        thousandSeparator = "";
      // Fall through to N, which has the same format as F, except no thousand grouping

      case "N":
        // NUMBER
        // Precision: number of decimals

        return basicNumberFormatter(number, 1, numberCoalesce(precision, 2), numberCoalesce(precision, 2), radixPoint, thousandSeparator);

      case "G":
      // GENERAL
      // Precision: number of significant digits

      // Fall through to E, whose implementation is shared with G

      case "E":
        // EXPONENTIAL (SCIENTIFIC)
        // Precision: number of decimals

        // Note that we might have fell through from G above!

        // Determine coefficient and exponent for exponential notation
        var exponent = 0, coefficient = Math.abs(number);

        while (coefficient >= 10) {
          coefficient /= 10;
          exponent++;
        }

        while (coefficient > 0 && coefficient < 1) {
          coefficient *= 10;
          exponent--;
        }

        var exponentPrefix = standardFormatStringMatch[1],
          exponentPrecision = 3,
          minDecimals, maxDecimals;

        if (standardFormatStringMatch_UpperCase == "G") {
          // Default precision in .NET is dependent on the data type.
          // For double the default precision is 15.
          precision = precision || 15;

          // When (exponent <= -5) the exponential notation is always more compact.
          //   e.g. 0.0000123 vs 1.23E-05
          // When (exponent >= precision) the number cannot be represented
          //   with the right number of significant digits without using
          //   exponential notation.
          //   e.g. 123 (1.23E+02) cannot be represented using fixed-point
          //   notation with less than 3 significant digits.
          if (exponent > -5 && exponent < precision) {
            // Use fixed-point notation
            return basicNumberFormatter(number, 1, 0, precision - exponent - 1, radixPoint);
          }

          exponentPrefix = exponentPrefix == "G" ? "E" : "e";
          exponentPrecision = 2;

          // The precision of G is the number of significant digits
          minDecimals = 0;
          maxDecimals = precision - 1;
        } else {
          // The precision of E is the number of decimal digits
          minDecimals = maxDecimals = numberCoalesce(precision, 6);
        }

        // If the exponent is negative, then the minus is added when formatting the exponent as a number.
        // In the case of a positive exponent, we need to add the plus sign explicitly.
        if (exponent >= 0) {
          exponentPrefix += "+";
        }

        // Consider if the coefficient is positive or negative.
        // (the sign was lost when determining the coefficient)
        if (number < 0) {
          coefficient *= -1;
        }

        return (
          basicNumberFormatter(coefficient, 1, minDecimals, maxDecimals, radixPoint, thousandSeparator) +
          exponentPrefix +
          basicNumberFormatter(exponent, exponentPrecision, 0, 0)
        );

      case "P":
        // PERCENT
        // Precision: number of decimals

        return basicNumberFormatter(number * 100, 1, numberCoalesce(precision, 2), numberCoalesce(precision, 2), radixPoint, thousandSeparator) + " %";

      case "X":
        // HEXADECIMAL
        // Precision: number of digits

        // Note: the .NET implementation throws an exception if used with non-integral
        // data types. However, this implementation follows the JavaScript manner being
        // nice about arguments and thus rounds any floating point numbers to integers.

        var result = Math.round(number).toString(16);

        if (standardFormatStringMatch[1] == "X") {
          result = result[toUpperCase]();
        }

        // Add padding, remember precision might be NaN
        precision -= result.length;
        while (precision-- > 0) {
          result = "0" + result;
        }

        return result;

      case "C":
        // CURRENCY
        // Precision: ignored (number of decimals in the .NET implementation)

        // The currency format uses a custom format string specified by the culture.
        // Precision is not supported and probably won't be supported in the future.
        // Developers probably use explicit formatting of currencies anyway...
        format = currentCulture._c;
        radixPoint = currentCulture._cr;
        thousandSeparator = currentCulture._ct;
        break;

      case "R":
        // ROUND-TRIP
        // Precision: ignored

        // The result should be reparsable => just use Javascript default string representation.

        return "" + number;
    }
  }

  // EVALUATE CUSTOM NUMERIC FORMAT STRING
  return customNumberFormatter(number, format, radixPoint, thousandSeparator);
};*/

/*Date.prototype.format = function(format) {
  var date        = this,
    year        = date.getFullYear(),
    month       = date.getMonth(),
    dayOfMonth  = date.getDate(),
    dayOfWeek   = date.getDay(),
    hour        = date.getHours(),
    minute      = date.getMinutes(),
    second      = date.getSeconds(),
    fracSecond  = date.getMilliseconds() / 1000,
    tzOffset    = date.getTimezoneOffset(),
    tzOffsetAbs = tzOffset < 0 ? -tzOffset : tzOffset;

  // If no format is specified, default to G format
  format = format || "G";

  // Resolve standard date/time format strings
  if (format.length == 1) {
    format = currentCulture[format] || format;
  }

  // Note that a leading percent is trimmed below. This is not completely compatible with .NET Framework,
  // which will treat a percent followed by more than a single character as two format tokens, e.g.
  // %yy is interpreted as ['y' 'y'], whereas this implementation will interpret it as ['yy']. This does
  // not seem to be a documented behavior and thus an acceptable deviation.
  return format.replace(/^%/, "").replace(/(\\.|'[^']*'|"[^"]*"|d{1,4}|M{1,4}|y+|HH?|hh?|mm?|ss?|[f]{1,7}|[F]{1,7}|z{1,3}|tt?)/g,
    function (match) {
      var char0 = match[0];

      // Day
      return  match == "dddd" ? currentCulture._D[dayOfWeek] :
        // Use three first characters from long day name if abbreviations are not specifed
        match == "ddd"  ? (currentCulture._d ? currentCulture._d[dayOfWeek] : currentCulture._D[dayOfWeek].substr(0, 3)) :
          char0 == "d"    ? zeroPad(dayOfMonth, match.length) :

            // Month
            match == "MMMM" ? currentCulture._M[month] :
              // Use three first characters from long month name if abbreviations are not specifed
              match == "MMM"  ? (currentCulture._m ? currentCulture._m[month] : currentCulture._M[month].substr(0, 3)) :
                char0 == "M"    ? zeroPad(month + 1, match.length) :

                  // Year
                  match == "yy"   ? zeroPad(year % 100, 2) :
                    match == "y"    ? year % 100 :
                      char0 == "y"    ? zeroPad(year, match.length) :

                        // Hour
                        char0 == "H"    ? zeroPad(hour, match.length) :
                          char0 == "h"    ? zeroPad(hour % 12 || 12, match.length) :

                            // Minute
                            char0 == "m"    ? zeroPad(minute, match.length) :

                              // Second
                              char0 == "s"    ? zeroPad(second, match.length) :

                                // Fractional second (substr is to remove "0.")
                                char0 == "f"    ? (fracSecond).toFixed(match.length).substr(2) :
                                  char0 == "F"    ? numberToString(fracSecond, match.length).substr(2) :

                                    // Timezone, "z" -> "+2", "zz" -> "+02", "zzz" -> "+02:00"
                                    char0 == "z"    ? (tzOffset < 0 ? "-" : "+") + // sign
                                      (zeroPad(0 | (tzOffsetAbs / 60), match == "z" ? 1 : 2)) + // hours
                                      (match == "zzz" ? ":" + zeroPad(tzOffsetAbs % 60, 2) : "") : // minutes

                                      // AM/PM
                                      match == "tt"   ? (hour < 12 ? currentCulture._am : currentCulture._pm) :
                                        char0 == "t"    ? (hour < 12 ? currentCulture._am : currentCulture._pm)[0] :

                                          // String literal => strip quotation marks
                                          match.substr(1, match.length - 1 - (match[0] != "\\"));
    });
};*/

String.format = function(str, obj0, obj1, obj2) {
  const outerArgs = arguments;

  return str.replace(/\{((\d+|[a-zA-Z_$]\w*(?:\.[a-zA-Z_$]\w*|\[\d+\])*)(?:\,(-?\d*))?(?:\:([^\}]*(?:(?:\}\})+[^\}]+)*))?)\}|(\{\{)|(\}\})/g, function () {
    const innerArgs = arguments;

    // Handle escaped {
    return innerArgs[5] ? "{" :

      // Handle escaped }
      innerArgs[6] ? "}" :

        // Valid format item
        processFormatItem(
          innerArgs[2],
          innerArgs[3],
          // Format string might contain escaped braces
          innerArgs[4] && innerArgs[4].replace(/\}\}/g, "}").replace(/\{\{/g, "{"),
          outerArgs);
  });
};

export default class MonoFormat {}
