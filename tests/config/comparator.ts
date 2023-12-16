import { getComparator } from '../../packages/playwright-core/lib/utils/comparators';

const pngComparator = getComparator('image/png');
type ComparatorResult = { diff?: Buffer; errorMessage: string; } | null;
type ImageComparatorOptions = { threshold?: number, maxDiffPixels?: number, maxDiffPixelRatio?: number };

export function comparePNGs(actual: Buffer, expected: Buffer, options: ImageComparatorOptions = {}): ComparatorResult {
  // Strict threshold by default in our tests.
  return pngComparator(actual, expected, { _comparator: 'ssim-cie94', threshold: 0, ...options });
}
