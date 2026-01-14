/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";

export type Platform = "mac" | "windows" | "linux" | "unknown";

export function usePlatform() {
  const [platform, setPlatform] = useState<Platform>("unknown");

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();

    if (platform.includes("mac") || userAgent.includes("mac")) {
      setPlatform("mac");
    } else if (platform.includes("win") || userAgent.includes("win")) {
      setPlatform("windows");
    } else if (platform.includes("linux") || userAgent.includes("linux")) {
      setPlatform("linux");
    } else {
      setPlatform("unknown");
    }
  }, []);

  return {
    platform,
    isMac: platform === "mac",
    isWindows: platform === "windows",
    isLinux: platform === "linux",
    modifierKey: platform === "mac" ? "⌘" : "Ctrl",
  };
}
