import { Composition } from "remotion";
import { BridgeShort } from "./bridge/Bridge";
import { SubaruShort } from "./subaru/Subaru";

// Define compositions using JSX (for auto-discovery)
// Resolution reduced to 720x1280 for low-RAM devices (Chromebook)
// Change back to 1080x1920 or 1440x2560 for production renders
export const BridgeShortComposition = () => (
  <Composition
    id="BridgeShort"
    component={BridgeShort}
    width={720}
    height={1280}
    fps={30}
    durationInFrames={2025}
  />
);

export const SubaruShortComposition = () => (
  <Composition
    id="SubaruShort"
    component={SubaruShort}
    width={720}
    height={1280}
    fps={30}
    durationInFrames={1800}
  />
);