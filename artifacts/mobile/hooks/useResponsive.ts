import { useWindowDimensions } from 'react-native';
import { breakpoints } from '@/constants/theme';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;
  const isLandscape = !isPortrait;

  const isSmallPhone = width < breakpoints.smallPhone;
  const isMediumPhone = width >= breakpoints.smallPhone && width < breakpoints.mediumPhone;
  const isLargePhone = width >= breakpoints.mediumPhone && width < breakpoints.tablet;
  const isTablet = width >= breakpoints.tablet;

  const isSmall = width < breakpoints.mediumPhone;
  const isMedium = width >= breakpoints.mediumPhone && width < breakpoints.tablet;
  const isLarge = width >= breakpoints.tablet;

  const getColumns = (defaultCols: number = 1) => {
    if (isTablet) return Math.max(defaultCols, 2);
    return defaultCols;
  };

  const getSpacing = () => {
    if (isTablet) return 'lg';
    return 'md';
  };

  const getFontSize = () => {
    if (isTablet) return 'lg';
    return 'md';
  };

  return {
    width,
    height,
    isPortrait,
    isLandscape,
    isSmallPhone,
    isMediumPhone,
    isLargePhone,
    isTablet,
    isSmall,
    isMedium,
    isLarge,
    getColumns,
    getSpacing,
    getFontSize,
  };
}
