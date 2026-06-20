import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { AppLoader } from "@/components/AppLoader";

export default function Index() {
  const { user, isLoading: authLoading } = useAuth();
  const { isLoading: dataLoading, themeLoading } = useData();
  
  // Show loader only after login when user exists and data is being fetched or theme is loading
  if (user && (dataLoading || themeLoading)) {
    return <AppLoader />;
  }
  
  // Redirect based on auth state
  if (authLoading) {
    return <Redirect href="/login" />;
  }
  
  if (user) {
    // Check if user needs onboarding
    if (user.needs_onboarding && !user.onboarding_completed) {
      return <Redirect href="/onboarding/financial" />;
    }
    return <Redirect href="/(tabs)" />;
  }
  return <Redirect href="/login" />;
}
