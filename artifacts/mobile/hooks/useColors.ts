import { useColorScheme } from "react-native";

import colors from "@/constants/colors";
import { useData } from "@/contexts/DataContext";

/**
 * Returns the design tokens for the current color scheme.
 *
 * The returned object contains all color tokens for the active palette
 * plus scheme-independent values like `radius`.
 *
 * Falls back to the light palette when no dark key is defined in
 * constants/colors.ts (the scaffold ships light-only by default).
 * When a sibling web artifact's dark tokens are synced into a `dark`
 * key, this hook will automatically switch palettes based on the
 * device's appearance setting.
 *
 * If the organization has a custom theme, those colors will override
 * the default palette colors.
 */
export function useColors() {
  const scheme = useColorScheme();
  const { data } = useData();

  const defaultPalette =
    scheme === "dark" && "dark" in colors
      ? (colors as Record<string, typeof colors.light>).dark
      : colors.light;

  // Get organization theme if available
  const theme = data?.organization?.theme;

  // Merge theme colors with default palette
  const palette = {
    ...defaultPalette,
    // Override with organization theme colors if available
    ...(theme?.primary_color && { primary: theme.primary_color }),
    ...(theme?.secondary_color && { secondary: theme.secondary_color }),
    ...(theme?.success_color && { success: theme.success_color }),
    ...(theme?.warning_color && { warning: theme.warning_color }),
    ...(theme?.danger_color && { destructive: theme.danger_color }),
  };

  return { ...palette, radius: colors.radius };
}
