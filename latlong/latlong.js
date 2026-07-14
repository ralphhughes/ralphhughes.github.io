function createLatLongTools() {
  const FORMAT_LABELS = {
    dd: 'Decimal degrees (DD)',
    dm: 'Degrees and decimal minutes (DM)',
    dms: 'Degrees, minutes and seconds (DMS)'
  };

  function trimTrailingZeros(value, digits) {
    return value.toFixed(digits).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
  }

  function normalizeSymbols(text) {
    return text
      .replace(/[°º]/g, '°')
      .replace(/[′’']/g, "'")
      .replace(/[″“”]/g, '"')
      .replace(/[\t\r\n]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function extractNumbers(text) {
    return text.match(/-?\d+(?:\.\d+)?/g) ?? [];
  }

  function detectHemisphere(text) {
    const matches = text.toUpperCase().match(/[NSEW]/g) ?? [];
    return matches[matches.length - 1] ?? '';
  }

  function inferFormat(text, numberCount) {
    if (/["″]/.test(text) || numberCount >= 3) {
      return 'dms';
    }
    if (/[°']/.test(text) || numberCount === 2) {
      return 'dm';
    }
    return 'dd';
  }

  function decimalResolution(numberText) {
    const trimmed = numberText.trim().replace(/^[+-]/, '');
    const parts = trimmed.split('.');
    if (parts.length < 2) {
      return 1;
    }
    return 10 ** (-parts[1].length);
  }

  function componentResolution(format, partIndex, numberText) {
    const base = decimalResolution(numberText);
    if (format === 'dd') {
      return base;
    }
    if (format === 'dm') {
      return partIndex === 0 ? 1 : base / 60;
    }
    if (partIndex === 0) {
      return 1;
    }
    if (partIndex === 1) {
      return 1 / 60;
    }
    return base / 3600;
  }

  function coordinateUncertainty(numberTexts, format) {
    const lastIndex = Math.max(0, numberTexts.length - 1);
    return componentResolution(format, lastIndex, numberTexts[lastIndex]);
  }

  function splitCompactPair(raw) {
    const tokens = raw.match(/-?\d+(?:\.\d+)?|[NSEW]|[°º]|['′’]|["″“”]/gi) ?? [];
    if (!tokens.length) {
      return null;
    }

    let hemisphereCount = 0;
    const parts = [];
    let current = [];

    for (const token of tokens) {
      current.push(token);
      if (/^[NSEW]$/i.test(token)) {
        hemisphereCount += 1;
        parts.push(current.join(' '));
        current = [];
      }
    }

    if (hemisphereCount === 2 && !current.length && parts.length === 2) {
      return parts;
    }

    return null;
  }

  function splitPair(raw) {
    const trimmed = normalizeSymbols(raw);
    if (!trimmed) {
      throw new Error('Enter a latitude/longitude pair first.');
    }

    const commaSplit = trimmed.split(/\s*,\s*/).filter(Boolean);
    if (commaSplit.length === 2) {
      return commaSplit;
    }

    const hemisphereSplit = trimmed
      .split(/(?<=[NSEW])\s+/i)
      .map((part) => part.trim())
      .filter(Boolean);
    if (hemisphereSplit.length === 2) {
      return hemisphereSplit;
    }

    const compactSplit = splitCompactPair(trimmed);
    if (compactSplit) {
      return compactSplit;
    }

    throw new Error('Enter both latitude and longitude, for example 53.0, -3.5 or 53 00 00 N 3 30 00 W.');
  }

  function parseSingleCoordinate(raw, axis) {
    const normalized = normalizeSymbols(raw);
    if (!normalized) {
      throw new Error(`Missing ${axis === 'lat' ? 'latitude' : 'longitude'} value.`);
    }

    const hemisphere = detectHemisphere(normalized);
    const cleaned = normalized.replace(/[NSEW]/gi, ' ').replace(/[°'" ]/g, ' ');
    const numberTexts = extractNumbers(cleaned);
    const numbers = numberTexts.map(Number);

    if (!numbers.length) {
      throw new Error(`No numeric ${axis === 'lat' ? 'latitude' : 'longitude'} value found.`);
    }

    if (numbers.length > 3) {
      throw new Error(`Too many numeric parts in the ${axis === 'lat' ? 'latitude' : 'longitude'} value.`);
    }

    const format = inferFormat(normalized, numbers.length);
    const degrees = Math.abs(numbers[0]);
    const minutes = numbers[1] ?? 0;
    const seconds = numbers[2] ?? 0;

    if (minutes >= 60 || seconds >= 60) {
      throw new Error(`${axis === 'lat' ? 'Latitude' : 'Longitude'} minutes and seconds must be less than 60.`);
    }

    let value = degrees + minutes / 60 + seconds / 3600;
    if (numbers[0] < 0) {
      value *= -1;
    }

    if (hemisphere === 'S' || hemisphere === 'W') {
      value = -Math.abs(value);
    }
    if (hemisphere === 'N' || hemisphere === 'E') {
      value = Math.abs(value);
    }

    const absLimit = axis === 'lat' ? 90 : 180;
    if (Math.abs(value) > absLimit) {
      throw new Error(`${axis === 'lat' ? 'Latitude' : 'Longitude'} is outside the valid range.`);
    }

    return {
      value,
      hemisphere,
      format,
      source: raw,
      uncertaintyDegrees: coordinateUncertainty(numberTexts, format)
    };
  }

  function guessAxes(first, second) {
    if ((/[NS]/.test(first.hemisphere) && /[EW]/.test(second.hemisphere)) || /[NS]/.test(first.hemisphere) || /[EW]/.test(second.hemisphere)) {
      return {
        lat: first,
        lon: second,
        detail: `Assumed first value is latitude and second is longitude from hemisphere letters in "${first.source}" and "${second.source}".`
      };
    }

    if ((/[EW]/.test(first.hemisphere) && /[NS]/.test(second.hemisphere)) || /[EW]/.test(first.hemisphere) || /[NS]/.test(second.hemisphere)) {
      return {
        lat: second,
        lon: first,
        detail: `Assumed first value is longitude and second is latitude from hemisphere letters in "${first.source}" and "${second.source}".`
      };
    }

    if (Math.abs(first.value) <= 90 && Math.abs(second.value) <= 180) {
      return {
        lat: first,
        lon: second,
        detail: 'Assumed the first value is latitude and the second is longitude based on normal numeric ranges.'
      };
    }

    if (Math.abs(second.value) <= 90 && Math.abs(first.value) <= 180) {
      return {
        lat: second,
        lon: first,
        detail: 'Assumed the first value is longitude and the second is latitude because the second value fits the latitude range.'
      };
    }

    throw new Error('Could not work out which value is latitude and which is longitude. Add N/S/E/W if needed.');
  }

  function formatDecimal(value, axis) {
    const hemisphere = axis === 'lat' ? (value < 0 ? 'S' : 'N') : (value < 0 ? 'W' : 'E');
    return `${trimTrailingZeros(Math.abs(value), 6)}° ${hemisphere}`;
  }

  function formatDM(value, axis) {
    const abs = Math.abs(value);
    const degrees = Math.floor(abs);
    const minutes = (abs - degrees) * 60;
    const hemisphere = axis === 'lat' ? (value < 0 ? 'S' : 'N') : (value < 0 ? 'W' : 'E');
    return `${degrees}° ${trimTrailingZeros(minutes, 4)}' ${hemisphere}`;
  }

  function formatDMS(value, axis) {
    const abs = Math.abs(value);
    const degrees = Math.floor(abs);
    const totalMinutes = (abs - degrees) * 60;
    const minutes = Math.floor(totalMinutes);
    const seconds = (totalMinutes - minutes) * 60;
    const hemisphere = axis === 'lat' ? (value < 0 ? 'S' : 'N') : (value < 0 ? 'W' : 'E');
    return `${degrees}° ${minutes}' ${trimTrailingZeros(seconds, 3)}" ${hemisphere}`;
  }

  function formatPair(result, formatter) {
    return `Latitude: ${formatter(result.lat, 'lat')} | Longitude: ${formatter(result.lon, 'lon')}`;
  }

  function metresPerDegreeLatitude() {
    return 111320;
  }

  function metresPerDegreeLongitude(latitude) {
    return 111320 * Math.cos(latitude * Math.PI / 180);
  }

  function buildUncertainty(latCoordinate, lonCoordinate) {
    const diameterDegrees = Math.max(latCoordinate.uncertaintyDegrees, lonCoordinate.uncertaintyDegrees);
    const radiusLatDegrees = latCoordinate.uncertaintyDegrees / 2;
    const radiusLonDegrees = lonCoordinate.uncertaintyDegrees / 2;
    const latRadiusMetres = radiusLatDegrees * metresPerDegreeLatitude();
    const lonRadiusMetres = radiusLonDegrees * metresPerDegreeLongitude(latCoordinate.value);

    const radiusMetres = Math.max(latRadiusMetres, Math.abs(lonRadiusMetres));

    return {
      latDegrees: latCoordinate.uncertaintyDegrees,
      lonDegrees: lonCoordinate.uncertaintyDegrees,
      diameterDegrees,
      radiusLatMetres: latRadiusMetres,
      radiusLonMetres: Math.abs(lonRadiusMetres),
      radiusMetres,
      diameterMetres: radiusMetres * 2,
      detail: `Approximate uncertainty: latitude ${trimTrailingZeros(latCoordinate.uncertaintyDegrees, 6)}° wide, longitude ${trimTrailingZeros(lonCoordinate.uncertaintyDegrees, 6)}° wide.`
    };
  }

  function parsePair(raw) {
    const [firstRaw, secondRaw] = splitPair(raw);
    const first = parseSingleCoordinate(firstRaw, 'lat');
    const second = parseSingleCoordinate(secondRaw, 'lon');
    const axes = guessAxes(first, second);
    const uncertainty = buildUncertainty(axes.lat, axes.lon);

    return {
      lat: axes.lat.value,
      lon: axes.lon.value,
      assumedFormat: axes.lat.format === axes.lon.format
        ? FORMAT_LABELS[axes.lat.format]
        : `${FORMAT_LABELS[axes.lat.format]} latitude + ${FORMAT_LABELS[axes.lon.format]} longitude`,
      assumptionDetail: axes.detail,
      uncertainty
    };
  }

  return {
    parsePair,
    formatDecimalPair(result) {
      return formatPair(result, formatDecimal);
    },
    formatDMPair(result) {
      return formatPair(result, formatDM);
    },
    formatDMSPair(result) {
      return formatPair(result, formatDMS);
    },
    trimTrailingZeros
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createLatLongTools };
}
