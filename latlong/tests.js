const assert = require('node:assert/strict');
const { createLatLongTools } = require('./latlong.js');

const tools = createLatLongTools();

function approx(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${message}: expected ${expected}, got ${actual}`);
}

const cases = [
  {
    name: 'decimal degrees with comma separator',
    input: '53.0, -3.5',
    lat: 53,
    lon: -3.5,
    format: 'Decimal degrees (DD)',
    latUncertainty: 0.1,
    lonUncertainty: 0.1,
    diameter: 0.1
  },
  {
    name: 'decimal degrees with hemisphere letters',
    input: '53.0N 3.5W',
    lat: 53,
    lon: -3.5,
    format: 'Decimal degrees (DD)',
    latUncertainty: 0.1,
    lonUncertainty: 0.1,
    diameter: 0.1
  },
  {
    name: 'decimal degrees with extra spaces',
    input: '  53.0   ,   -3.5  ',
    lat: 53,
    lon: -3.5,
    format: 'Decimal degrees (DD)',
    latUncertainty: 0.1,
    lonUncertainty: 0.1,
    diameter: 0.1
  },
  {
    name: 'degrees and decimal minutes with symbols',
    input: "53° 0.000' N, 3° 30.000' W",
    lat: 53,
    lon: -3.5,
    format: 'Degrees and decimal minutes (DM)',
    latUncertainty: 0.000016666666666666667,
    lonUncertainty: 0.000016666666666666667,
    diameter: 0.000016666666666666667
  },
  {
    name: 'degrees and decimal minutes with apostrophes and spaces',
    input: "53 00.000 N 3 30.000 W",
    lat: 53,
    lon: -3.5,
    format: 'Degrees and decimal minutes (DM)',
    latUncertainty: 0.000016666666666666667,
    lonUncertainty: 0.000016666666666666667,
    diameter: 0.000016666666666666667
  },
  {
    name: 'degrees and decimal minutes with unicode apostrophes',
    input: '53 00.000 N 3 30.000 W'.replace(/'/g, '’'),
    lat: 53,
    lon: -3.5,
    format: 'Degrees and decimal minutes (DM)',
    latUncertainty: 0.000016666666666666667,
    lonUncertainty: 0.000016666666666666667,
    diameter: 0.000016666666666666667
  },
  {
    name: 'degrees minutes seconds with ASCII quotes',
    input: '53 00\' 00" N, 3 30\' 00" W',
    lat: 53,
    lon: -3.5,
    format: 'Degrees, minutes and seconds (DMS)',
    latUncertainty: 0.0002777777777777778,
    lonUncertainty: 0.0002777777777777778,
    diameter: 0.0002777777777777778
  },
  {
    name: 'degrees minutes seconds with unicode primes',
    input: '53°00′00″N 003°30′00″W',
    lat: 53,
    lon: -3.5,
    format: 'Degrees, minutes and seconds (DMS)',
    latUncertainty: 0.0002777777777777778,
    lonUncertainty: 0.0002777777777777778,
    diameter: 0.0002777777777777778
  },
  {
    name: 'degrees minutes seconds split by spaces only',
    input: '53 00 00 N 003 30 00 W',
    lat: 53,
    lon: -3.5,
    format: 'Degrees, minutes and seconds (DMS)',
    latUncertainty: 0.0002777777777777778,
    lonUncertainty: 0.0002777777777777778,
    diameter: 0.0002777777777777778
  },
  {
    name: 'degrees minutes seconds across newline',
    input: '53°00\'00"N\n003°30\'00"W',
    lat: 53,
    lon: -3.5,
    format: 'Degrees, minutes and seconds (DMS)',
    latUncertainty: 0.0002777777777777778,
    lonUncertainty: 0.0002777777777777778,
    diameter: 0.0002777777777777778
  },
  {
    name: 'longitude first inferred from hemisphere',
    input: '3.5W, 53.0N',
    lat: 53,
    lon: -3.5,
    format: 'Decimal degrees (DD)',
    latUncertainty: 0.1,
    lonUncertainty: 0.1,
    diameter: 0.1
  },
  {
    name: 'mixed formats latitude dms longitude dd',
    input: '53°00\'00"N, -3.5',
    lat: 53,
    lon: -3.5,
    format: 'Degrees, minutes and seconds (DMS) latitude + Decimal degrees (DD) longitude',
    latUncertainty: 0.0002777777777777778,
    lonUncertainty: 0.1,
    diameter: 0.1
  },
  {
    name: 'mixed precision decimal degrees chooses coarsest axis',
    input: '53.5 N, 3.677 W',
    lat: 53.5,
    lon: -3.677,
    format: 'Decimal degrees (DD)',
    latUncertainty: 0.1,
    lonUncertainty: 0.001,
    diameter: 0.1
  }
];

for (const testCase of cases) {
  const result = tools.parsePair(testCase.input);
  approx(result.lat, testCase.lat, `${testCase.name} latitude`);
  approx(result.lon, testCase.lon, `${testCase.name} longitude`);
  assert.equal(result.assumedFormat, testCase.format, `${testCase.name} format`);
  approx(result.uncertainty.latDegrees, testCase.latUncertainty, `${testCase.name} latitude uncertainty`);
  approx(result.uncertainty.lonDegrees, testCase.lonUncertainty, `${testCase.name} longitude uncertainty`);
  approx(result.uncertainty.diameterDegrees, testCase.diameter, `${testCase.name} uncertainty diameter`);
}

console.log(`Passed ${cases.length} lat/long parser tests.`);
