/**
 * Builds an SVG path string for a simple line chart based on the provided values.
 *
 * @param values - Numeric values to plot in order.
 * @param width - Width of the chart viewport.
 * @param height - Height of the chart viewport.
 * @returns A path definition that can be used in an SVG path element.
 */
export const buildChartPath = (values: number[], width: number, height: number): string => {
  if (values.length === 0) return '';
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
};

