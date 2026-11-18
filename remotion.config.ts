import { Config } from "@remotion/cli/config";

// Use PNG for faster rendering (no JPEG compression overhead)
Config.setVideoImageFormat("png");

// Use SwiftShader for software rendering (no GPU needed)
Config.setChromiumOpenGlRenderer("swiftshader");

// Memory-optimized Chromium flags for low-RAM devices (Chromebook, no GPU)
Config.setChromiumFlags({
  // Use SwiftShader for WebGL (software rasterizer)
  "use-gl": "swiftshader",
  "use-angle": "swiftshader",
  // Disable GPU hardware acceleration
  "disable-gpu": true,
  "disable-gpu-compositing": true,
  "disable-gpu-rasterization": true,
  // Use shared memory from /tmp instead of /dev/shm (limited on Chromebook)
  "disable-dev-shm-usage": true,
  // Reduce memory usage
  "disable-software-rasterizer": false, // Keep SwiftShader
  "disable-background-networking": true,
  "disable-background-timer-throttling": true,
  "disable-renderer-backgrounding": true,
  "disable-features": "TranslateUI,BlinkGenPropertyTrees,SitePerProcess,IsolateOrigins",
  // Limit renderer processes
  "renderer-process-limit": "1",
  // Disable unnecessary features
  "no-sandbox": true, // Required in some container/Chromebook environments
  "disable-setuid-sandbox": true,
  "disable-web-security": true,
  "disable-site-isolation-trials": true,
});
Config.setEntryPoint("src/entry.tsx");