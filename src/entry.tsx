import { registerRoot, Composition } from "remotion";
import { BridgeShort } from "./bridge/Bridge";
import { SubaruShort } from "./subaru/Subaru";

// Root component that renders compositions for discovery
// Resolution reduced to 720x1280 for low-RAM devices (Chromebook)
// Change back to 1080x1920 or 1440x2560 for production renders
const Root = () => (
  <>
    <Composition
      id="BridgeShort"
      component={BridgeShort}
      width={720}
      height={1280}
      fps={30}
      durationInFrames={2025}
    />
    <Composition
      id="SubaruShort"
      component={SubaruShort}
      width={720}
      height={1280}
      fps={30}
      durationInFrames={1800}
    />
  </>
);

registerRoot(Root);