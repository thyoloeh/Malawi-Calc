/**
 * Comprehensive Unit Conversion Utilities for Smart Calc
 */

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  toBase: (val: number) => number;
  fromBase: (baseVal: number) => number;
}

export interface UnitCategory {
  id: string;
  name: string;
  iconName: string;
  baseUnit: string;
  units: UnitDefinition[];
}

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    name: 'Length & Distance',
    iconName: 'Ruler',
    baseUnit: 'm',
    units: [
      { id: 'm', name: 'Meters', symbol: 'm', toBase: (v) => v, fromBase: (b) => b },
      { id: 'km', name: 'Kilometers', symbol: 'km', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'cm', name: 'Centimeters', symbol: 'cm', toBase: (v) => v / 100, fromBase: (b) => b * 100 },
      { id: 'mm', name: 'Millimeters', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (b) => b * 1000 },
      { id: 'um', name: 'Micrometers', symbol: 'µm', toBase: (v) => v / 1e6, fromBase: (b) => b * 1e6 },
      { id: 'nm', name: 'Nanometers', symbol: 'nm', toBase: (v) => v / 1e9, fromBase: (b) => b * 1e9 },
      { id: 'mi', name: 'Miles', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (b) => b / 1609.344 },
      { id: 'yd', name: 'Yards', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (b) => b / 0.9144 },
      { id: 'ft', name: 'Feet', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (b) => b / 0.3048 },
      { id: 'in', name: 'Inches', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (b) => b / 0.0254 },
      { id: 'nmi', name: 'Nautical Miles', symbol: 'NM', toBase: (v) => v * 1852, fromBase: (b) => b / 1852 },
    ],
  },
  {
    id: 'mass',
    name: 'Weight & Mass',
    iconName: 'Scale',
    baseUnit: 'kg',
    units: [
      { id: 'kg', name: 'Kilograms', symbol: 'kg', toBase: (v) => v, fromBase: (b) => b },
      { id: 'g', name: 'Grams', symbol: 'g', toBase: (v) => v / 1000, fromBase: (b) => b * 1000 },
      { id: 'mg', name: 'Milligrams', symbol: 'mg', toBase: (v) => v / 1e6, fromBase: (b) => b * 1e6 },
      { id: 'ug', name: 'Micrograms', symbol: 'µg', toBase: (v) => v / 1e9, fromBase: (b) => b * 1e9 },
      { id: 't', name: 'Metric Tons', symbol: 't', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'lb', name: 'Pounds', symbol: 'lb', toBase: (v) => v * 0.45359237, fromBase: (b) => b / 0.45359237 },
      { id: 'oz', name: 'Ounces', symbol: 'oz', toBase: (v) => v * 0.028349523125, fromBase: (b) => b / 0.028349523125 },
      { id: 'st', name: 'Stones', symbol: 'st', toBase: (v) => v * 6.35029318, fromBase: (b) => b / 6.35029318 },
      { id: 'ct', name: 'Carats', symbol: 'ct', toBase: (v) => v * 0.0002, fromBase: (b) => b / 0.0002 },
    ],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    iconName: 'Thermometer',
    baseUnit: 'C',
    units: [
      { id: 'C', name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (b) => b },
      { id: 'F', name: 'Fahrenheit', symbol: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (b) => (b * 9) / 5 + 32 },
      { id: 'K', name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (b) => b + 273.15 },
      { id: 'R', name: 'Rankine', symbol: '°R', toBase: (v) => ((v - 491.67) * 5) / 9, fromBase: (b) => ((b + 273.15) * 9) / 5 },
    ],
  },
  {
    id: 'area',
    name: 'Area',
    iconName: 'Square',
    baseUnit: 'm2',
    units: [
      { id: 'm2', name: 'Square Meters', symbol: 'm²', toBase: (v) => v, fromBase: (b) => b },
      { id: 'km2', name: 'Square Kilometers', symbol: 'km²', toBase: (v) => v * 1e6, fromBase: (b) => b / 1e6 },
      { id: 'cm2', name: 'Square Centimeters', symbol: 'cm²', toBase: (v) => v / 1e4, fromBase: (b) => b * 1e4 },
      { id: 'mm2', name: 'Square Millimeters', symbol: 'mm²', toBase: (v) => v / 1e6, fromBase: (b) => b * 1e6 },
      { id: 'ha', name: 'Hectares', symbol: 'ha', toBase: (v) => v * 10000, fromBase: (b) => b / 10000 },
      { id: 'ac', name: 'Acres', symbol: 'ac', toBase: (v) => v * 4046.8564224, fromBase: (b) => b / 4046.8564224 },
      { id: 'sqmi', name: 'Square Miles', symbol: 'sq mi', toBase: (v) => v * 2589988.110336, fromBase: (b) => b / 2589988.110336 },
      { id: 'sqyd', name: 'Square Yards', symbol: 'sq yd', toBase: (v) => v * 0.83612736, fromBase: (b) => b / 0.83612736 },
      { id: 'sqft', name: 'Square Feet', symbol: 'sq ft', toBase: (v) => v * 0.09290304, fromBase: (b) => b / 0.09290304 },
      { id: 'sqin', name: 'Square Inches', symbol: 'sq in', toBase: (v) => v * 0.00064516, fromBase: (b) => b / 0.00064516 },
    ],
  },
  {
    id: 'volume',
    name: 'Volume & Capacity',
    iconName: 'Beaker',
    baseUnit: 'L',
    units: [
      { id: 'L', name: 'Liters', symbol: 'L', toBase: (v) => v, fromBase: (b) => b },
      { id: 'mL', name: 'Milliliters', symbol: 'mL', toBase: (v) => v / 1000, fromBase: (b) => b * 1000 },
      { id: 'm3', name: 'Cubic Meters', symbol: 'm³', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'cm3', name: 'Cubic Centimeters', symbol: 'cm³', toBase: (v) => v / 1000, fromBase: (b) => b * 1000 },
      { id: 'gal_us', name: 'Gallons (US)', symbol: 'gal', toBase: (v) => v * 3.785411784, fromBase: (b) => b / 3.785411784 },
      { id: 'qt_us', name: 'Quarts (US)', symbol: 'qt', toBase: (v) => v * 0.946352946, fromBase: (b) => b / 0.946352946 },
      { id: 'pt_us', name: 'Pints (US)', symbol: 'pt', toBase: (v) => v * 0.473176473, fromBase: (b) => b / 0.473176473 },
      { id: 'cup_us', name: 'Cups (US)', symbol: 'cup', toBase: (v) => v * 0.2365882365, fromBase: (b) => b / 0.2365882365 },
      { id: 'floz_us', name: 'Fluid Ounces (US)', symbol: 'fl oz', toBase: (v) => v * 0.0295735295625, fromBase: (b) => b / 0.0295735295625 },
      { id: 'tbsp', name: 'Tablespoons (US)', symbol: 'tbsp', toBase: (v) => v * 0.0147867647813, fromBase: (b) => b / 0.0147867647813 },
      { id: 'tsp', name: 'Teaspoons (US)', symbol: 'tsp', toBase: (v) => v * 0.00492892159375, fromBase: (b) => b / 0.00492892159375 },
      { id: 'gal_imp', name: 'Gallons (Imperial)', symbol: 'imp gal', toBase: (v) => v * 4.54609, fromBase: (b) => b / 4.54609 },
    ],
  },
  {
    id: 'speed',
    name: 'Speed',
    iconName: 'Gauge',
    baseUnit: 'm_s',
    units: [
      { id: 'm_s', name: 'Meters per Second', symbol: 'm/s', toBase: (v) => v, fromBase: (b) => b },
      { id: 'km_h', name: 'Kilometers per Hour', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (b) => b * 3.6 },
      { id: 'mph', name: 'Miles per Hour', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (b) => b / 0.44704 },
      { id: 'knot', name: 'Knots', symbol: 'kn', toBase: (v) => v * 0.5144444444, fromBase: (b) => b / 0.5144444444 },
      { id: 'ft_s', name: 'Feet per Second', symbol: 'ft/s', toBase: (v) => v * 0.3048, fromBase: (b) => b / 0.3048 },
      { id: 'mach', name: 'Mach (at sea level)', symbol: 'Mach', toBase: (v) => v * 340.29, fromBase: (b) => b / 340.29 },
    ],
  },
  {
    id: 'time',
    name: 'Time',
    iconName: 'Clock',
    baseUnit: 's',
    units: [
      { id: 's', name: 'Seconds', symbol: 's', toBase: (v) => v, fromBase: (b) => b },
      { id: 'ms', name: 'Milliseconds', symbol: 'ms', toBase: (v) => v / 1000, fromBase: (b) => b * 1000 },
      { id: 'us', name: 'Microseconds', symbol: 'µs', toBase: (v) => v / 1e6, fromBase: (b) => b * 1e6 },
      { id: 'ns', name: 'Nanoseconds', symbol: 'ns', toBase: (v) => v / 1e9, fromBase: (b) => b * 1e9 },
      { id: 'min', name: 'Minutes', symbol: 'min', toBase: (v) => v * 60, fromBase: (b) => b / 60 },
      { id: 'h', name: 'Hours', symbol: 'h', toBase: (v) => v * 3600, fromBase: (b) => b / 3600 },
      { id: 'd', name: 'Days', symbol: 'd', toBase: (v) => v * 86400, fromBase: (b) => b / 86400 },
      { id: 'wk', name: 'Weeks', symbol: 'wk', toBase: (v) => v * 604800, fromBase: (b) => b / 604800 },
      { id: 'mo', name: 'Months (30.44 d)', symbol: 'mo', toBase: (v) => v * 2629746, fromBase: (b) => b / 2629746 },
      { id: 'yr', name: 'Years (365.25 d)', symbol: 'yr', toBase: (v) => v * 31557600, fromBase: (b) => b / 31557600 },
    ],
  },
  {
    id: 'storage',
    name: 'Digital Storage',
    iconName: 'HardDrive',
    baseUnit: 'B',
    units: [
      { id: 'B', name: 'Bytes', symbol: 'B', toBase: (v) => v, fromBase: (b) => b },
      { id: 'b', name: 'Bits', symbol: 'b', toBase: (v) => v / 8, fromBase: (b) => b * 8 },
      { id: 'KB', name: 'Kilobytes (Decimal)', symbol: 'KB', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'MB', name: 'Megabytes (Decimal)', symbol: 'MB', toBase: (v) => v * 1e6, fromBase: (b) => b / 1e6 },
      { id: 'GB', name: 'Gigabytes (Decimal)', symbol: 'GB', toBase: (v) => v * 1e9, fromBase: (b) => b / 1e9 },
      { id: 'TB', name: 'Terabytes (Decimal)', symbol: 'TB', toBase: (v) => v * 1e12, fromBase: (b) => b / 1e12 },
      { id: 'PB', name: 'Petabytes (Decimal)', symbol: 'PB', toBase: (v) => v * 1e15, fromBase: (b) => b / 1e15 },
      { id: 'KiB', name: 'Kibibytes (Binary)', symbol: 'KiB', toBase: (v) => v * 1024, fromBase: (b) => b / 1024 },
      { id: 'MiB', name: 'Mebibytes (Binary)', symbol: 'MiB', toBase: (v) => v * 1048576, fromBase: (b) => b / 1048576 },
      { id: 'GiB', name: 'Gibibytes (Binary)', symbol: 'GiB', toBase: (v) => v * 1073741824, fromBase: (b) => b / 1073741824 },
      { id: 'TiB', name: 'Tebibytes (Binary)', symbol: 'TiB', toBase: (v) => v * 1099511627776, fromBase: (b) => b / 1099511627776 },
    ],
  },
  {
    id: 'energy',
    name: 'Energy',
    iconName: 'Zap',
    baseUnit: 'J',
    units: [
      { id: 'J', name: 'Joules', symbol: 'J', toBase: (v) => v, fromBase: (b) => b },
      { id: 'kJ', name: 'Kilojoules', symbol: 'kJ', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'cal', name: 'Calories', symbol: 'cal', toBase: (v) => v * 4.184, fromBase: (b) => b / 4.184 },
      { id: 'kcal', name: 'Kilocalories', symbol: 'kcal', toBase: (v) => v * 4184, fromBase: (b) => b / 4184 },
      { id: 'Wh', name: 'Watt-hours', symbol: 'Wh', toBase: (v) => v * 3600, fromBase: (b) => b / 3600 },
      { id: 'kWh', name: 'Kilowatt-hours', symbol: 'kWh', toBase: (v) => v * 3.6e6, fromBase: (b) => b / 3.6e6 },
      { id: 'eV', name: 'Electronvolts', symbol: 'eV', toBase: (v) => v * 1.602176634e-19, fromBase: (b) => b / 1.602176634e-19 },
      { id: 'btu', name: 'BTUs', symbol: 'BTU', toBase: (v) => v * 1055.05585, fromBase: (b) => b / 1055.05585 },
      { id: 'ft_lb', name: 'Foot-pounds', symbol: 'ft-lb', toBase: (v) => v * 1.35581794833, fromBase: (b) => b / 1.35581794833 },
    ],
  },
  {
    id: 'pressure',
    name: 'Pressure',
    iconName: 'Compass',
    baseUnit: 'Pa',
    units: [
      { id: 'Pa', name: 'Pascals', symbol: 'Pa', toBase: (v) => v, fromBase: (b) => b },
      { id: 'kPa', name: 'Kilopascals', symbol: 'kPa', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'MPa', name: 'Megapascals', symbol: 'MPa', toBase: (v) => v * 1e6, fromBase: (b) => b / 1e6 },
      { id: 'bar', name: 'Bars', symbol: 'bar', toBase: (v) => v * 1e5, fromBase: (b) => b / 1e5 },
      { id: 'mbar', name: 'Millibars', symbol: 'mbar', toBase: (v) => v * 100, fromBase: (b) => b / 100 },
      { id: 'atm', name: 'Standard Atmospheres', symbol: 'atm', toBase: (v) => v * 101325, fromBase: (b) => b / 101325 },
      { id: 'psi', name: 'Pounds per Square Inch', symbol: 'psi', toBase: (v) => v * 6894.75729317, fromBase: (b) => b / 6894.75729317 },
      { id: 'torr', name: 'Torr (mmHg)', symbol: 'Torr', toBase: (v) => v * 133.322368421, fromBase: (b) => b / 133.322368421 },
    ],
  },
  {
    id: 'power',
    name: 'Power',
    iconName: 'Activity',
    baseUnit: 'W',
    units: [
      { id: 'W', name: 'Watts', symbol: 'W', toBase: (v) => v, fromBase: (b) => b },
      { id: 'kW', name: 'Kilowatts', symbol: 'kW', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'MW', name: 'Megawatts', symbol: 'MW', toBase: (v) => v * 1e6, fromBase: (b) => b / 1e6 },
      { id: 'hp', name: 'Mechanical Horsepower', symbol: 'hp', toBase: (v) => v * 745.699872, fromBase: (b) => b / 745.699872 },
      { id: 'ft_lb_min', name: 'Foot-pounds per Min', symbol: 'ft-lb/min', toBase: (v) => v * 0.0225969658, fromBase: (b) => b / 0.0225969658 },
      { id: 'btu_hr', name: 'BTU per Hour', symbol: 'BTU/hr', toBase: (v) => v * 0.29307107, fromBase: (b) => b / 0.29307107 },
    ],
  },
];

export function convertUnit(
  value: number,
  fromUnitId: string,
  toUnitId: string,
  categoryId: string
): { result: number; formula: string } {
  const category = UNIT_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) throw new Error(`Category ${categoryId} not found`);

  const fromUnit = category.units.find((u) => u.id === fromUnitId);
  const toUnit = category.units.find((u) => u.id === toUnitId);

  if (!fromUnit || !toUnit) {
    throw new Error(`Invalid units for category ${category.name}`);
  }

  const baseValue = fromUnit.toBase(value);
  const finalValue = toUnit.fromBase(baseValue);

  let formula = `1 ${fromUnit.symbol} = `;
  const oneInBase = fromUnit.toBase(1);
  const oneInTarget = toUnit.fromBase(oneInBase);
  formula += `${parseFloat(oneInTarget.toFixed(6))} ${toUnit.symbol}`;

  return {
    result: finalValue,
    formula,
  };
}
