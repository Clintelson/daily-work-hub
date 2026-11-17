const { withAndroidStyles, withDangerousMod } = require("expo/config-plugins");
const fs = require("node:fs/promises");
const path = require("node:path");

// SDK 58 executes styles mods in reverse registration order. Register BEFORE
// expo-splash-screen so its theme exists by the time this override runs.
module.exports = function withAnimatedSplash(config) {
  config = withAndroidStyles(config, (config) => {
    const theme = config.modResults.resources.style?.find(
      (style) => style.$.name === "Theme.App.SplashScreen",
    );
    if (!theme) throw new Error("Register animated splash before expo-splash-screen.");
    theme.item = (theme.item || []).filter(
      (item) => !["windowSplashScreenAnimatedIcon", "windowSplashScreenAnimationDuration"].includes(item.$.name),
    );
    theme.item.push(
      { $: { name: "windowSplashScreenAnimatedIcon" }, _: "@drawable/dwh_splash_icon" },
      { $: { name: "windowSplashScreenAnimationDuration" }, _: "1000" },
    );
    return config;
  });

  return withDangerousMod(config, ["android", async (config) => {
    const res = path.join(config.modRequest.platformProjectRoot, "app/src/main/res");
    const artwork = path.join(__dirname, "../assets/branding/android");
    await fs.mkdir(path.join(res, "drawable"), { recursive: true });
    await fs.mkdir(path.join(res, "drawable-v31"), { recursive: true });
    await fs.copyFile(path.join(artwork, "dwh_splash_logo.xml"), path.join(res, "drawable/dwh_splash_logo.xml"));
    // Pre-Android 12 receives the vector directly, never an unsupported AVD splash.
    await fs.copyFile(path.join(artwork, "dwh_splash_logo.xml"), path.join(res, "drawable/dwh_splash_icon.xml"));
    await fs.copyFile(path.join(artwork, "dwh_splash_icon.xml"), path.join(res, "drawable-v31/dwh_splash_icon.xml"));
    return config;
  }]);
};
