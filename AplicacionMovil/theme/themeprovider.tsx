// theme/ThemeProvider.tsx
import React, { useState, useEffect, ReactNode } from 'react';
import * as Font from 'expo-font';

interface Props {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: Props) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Roboto-Regular': require('../assets/Roboto-Regular.ttf'),
        'Roboto-Bold': require('../assets/Roboto-Bold.ttf'),
        'Roboto-Medium': require('../assets/Roboto-Medium.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) return null; // O un loader

  return <>{children}</>;
};
