import { useMemo, useEffect, useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

function useAppThemeMode() {
  const [mode, setMode] = useState(
    () => document.documentElement.getAttribute("data-theme") || "light"
  );

  useEffect(() => {
    const sync = () => {
      setMode(document.documentElement.getAttribute("data-theme") || "light");
    };
    window.addEventListener("kubeintel-settings", sync);
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => {
      window.removeEventListener("kubeintel-settings", sync);
      obs.disconnect();
    };
  }, []);

  return mode === "dark" ? "dark" : "light";
}

export default function MuiThemeBridge({ children }) {
  const mode = useAppThemeMode();
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: mode === "dark" ? "#3b82f6" : "#2563eb" },
          background: {
            default: mode === "dark" ? "#0b1220" : "#f1f5f9",
            paper: mode === "dark" ? "#1e293b" : "#ffffff",
          },
        },
        typography: {
          fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
        },
        shape: { borderRadius: 10 },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
