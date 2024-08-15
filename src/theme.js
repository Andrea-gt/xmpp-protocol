export const colorTokens = {
    grey: {
      0: "#FFFFFF",
      10: "#F6F6F6",
      50: "#F0F0F0",
      100: "#E8E8E8",
      200: "#C2C2C2",
      300: "#A3A3A3",
      400: "#858585",
      500: "#666666",
      600: "#4D4D4D",
      700: "#333333",
      800: "#1A1A1A",
      900: "#0A0A0A",
      1000: "#000000",
      1100: "#5F5F5F",
    },
    whites: {
      0: "#FFFFFF",
      10: "#F9F9F9",
      50: "#F0F0F0",
      100: "#E0E0E0",
      200: "#D0D0D0",
      300: "#C0C0C0",
    },
    secondary: {
      200: "#151E2F",
      500: "#1B263B",
      800: "#485162",
    },
    primary: {
      200: "#005F8A", // Darker variant of the main color
      500: "#0077B6", // Updated main color
      800: "#0098E0", // Lighter variant of the main color
    },
  };
  
  export const themeSettings = (mode) => {
    return {
      palette: {
        mode: mode,
        ...(mode === "light"
          ? {
              // palette values for light mode
              primary: {
                dark: colorTokens.primary[200],
                main: colorTokens.primary[500],
                light: colorTokens.primary[800],
              },
              neutral: {
                dark: colorTokens.grey[100],
                main: colorTokens.grey[200],
                mediumMain: colorTokens.grey[300],
                medium: colorTokens.grey[400],
                light: colorTokens.grey[700],
                disabled: colorTokens.grey[1100],
              },
              background: {
                default: colorTokens.whites[0],
                alt: colorTokens.whites[10],
              },
            }
          : {
              primary: {
                dark: colorTokens.primary[200],
                main: colorTokens.primary[500],
                light: colorTokens.primary[800],
              },
              neutral: {
                dark: colorTokens.grey[700],
                main: colorTokens.grey[500],
                mediumMain: colorTokens.grey[400],
                medium: colorTokens.grey[300],
                light: colorTokens.grey[50],
                disabled: colorTokens.grey[1100],
              },
              background: {
                default: colorTokens.grey[10],
                alt: colorTokens.grey[0],
                form: colorTokens.grey[100],
              },
            }),
      },
      typography: {
        fontFamily: ["Montserrat", "sans-serif"].join(","), // Updated font family for all text
        fontSize: 12,
        h1: {
          fontFamily: ["Montserrat", "sans-serif"].join(","),
          fontSize: 36,
        },
        h2: {
          fontFamily: ["Montserrat", "sans-serif"].join(","),
          fontSize: 32,
        },
        h3: {
          fontFamily: ["Montserrat", "sans-serif"].join(","),
          fontSize: 24,
        },
        h4: {
          fontFamily: ["Montserrat", "sans-serif"].join(","),
          fontSize: 20,
        },
        h5: {
          fontFamily: ["Montserrat", "sans-serif"].join(","),
          fontSize: 16,
        },
        h6: {
          fontFamily: ["Montserrat", "sans-serif"].join(","),
          fontSize: 14,
        },
      },
    };
  };  