export const theme = {
  colors: {
    primary: '#6200ee', // Morado vibrante para botones y pestañas activas
    secondary: '#ff6f00', // Naranja para acentos (botones, banners)
    background: '#f8fafc', // Fondo claro y moderno
    cardBackground: '#ffffff', // Fondo de tarjetas
    textPrimary: '#1a1a1a', // Texto principal
    textSecondary: '#666666', // Texto secundario
    error: '#e53935', // Rojo para errores
    success: '#2e7d32', // Verde para confirmaciones
    discount: '#e91e63', // Rosa para descuentos
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fontSizes: {
    small: 14,
    medium: 16,
    large: 20,
    title: 24,
  },
  fonts: {
    regular: 'Roboto-Regular',
    bold: 'Roboto-Bold',
    medium: 'Roboto-Medium',
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2, // Para Android
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 20,
  },
};