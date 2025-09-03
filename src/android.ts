import fs from "fs-extra";
import path from "path";
import sharp from "sharp";

interface AndroidDensityMapping {
  [key: string]: {
    folder: string;
    size: number;
    description: string;
  };
}

const DENSITY_MAPPINGS: AndroidDensityMapping = {
  ldpi: {
    folder: "drawable-ldpi",
    size: 64,
    description: "Low density (~120dpi)",
  },
  mdpi: {
    folder: "drawable-mdpi",
    size: 128,
    description: "Medium density (~160dpi)",
  },
  hdpi: {
    folder: "drawable-hdpi",
    size: 192,
    description: "High density (~240dpi)",
  },
  xhdpi: {
    folder: "drawable-xhdpi",
    size: 256,
    description: "Extra-high density (~320dpi)",
  },
  xxhdpi: {
    folder: "drawable-xxhdpi",
    size: 512,
    description: "Extra-extra-high density (~480dpi)",
  },
  xxxhdpi: {
    folder: "drawable-xxxhdpi",
    size: 1024,
    description: "Extra-extra-extra-high density (~640dpi)",
  },
};

export async function generateAndroid(config: any, logoDir: string) {
  console.log("🤖 Generating Android assets...");
  const resDir = path.resolve("android/app/src/main/res");

  // Generate drawable resources for different densities
  await generateDrawableResources(resDir, logoDir, config);

  // Generate splash background drawables for light/dark
  await generateSplashBackgrounds(resDir, config);

  // Generate color resources
  await generateColorResources(resDir, config);

  // Generate splash drawable XML
  await generateSplashDrawable(resDir);

  console.log("🤖 Android assets generated successfully");
}

async function generateDrawableResources(
  resDir: string,
  logoDir: string,
  config: any
) {
  console.log("📱 Generating drawable resources for different densities...");

  for (const [density, mapping] of Object.entries(DENSITY_MAPPINGS)) {
    const destDir = path.join(resDir, mapping.folder);
    await fs.ensureDir(destDir);

    // Copy logo with appropriate size
    const logoSource = path.join(logoDir, `logo-${mapping.size}.png`);
    const logoDestination = path.join(destDir, "splash_logo.png");

    if (await fs.pathExists(logoSource)) {
      await fs.copyFile(logoSource, logoDestination);
      console.log(
        `📦 Generated ${density} (${mapping.size}px): ${mapping.description}`
      );
    } else {
      // Generate from the source logo if specific size doesn't exist
      await sharp(path.join(logoDir, "../test/assets/logo.png"))
        .resize(mapping.size, mapping.size, { fit: "contain" })
        .png()
        .toFile(logoDestination);
      console.log(`🔧 Generated ${density} from source (${mapping.size}px)`);
    }
  }
}

async function generateSplashBackgrounds(resDir: string, config: any) {
  console.log("🎨 Generating splash background drawables...");

  // Generate light theme splash background
  const lightDrawableDir = path.join(resDir, "drawable");
  await fs.ensureDir(lightDrawableDir);

  const lightSplashDrawable = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_background" />
    <item>
        <bitmap
            android:gravity="center"
            android:src="@drawable/splash_logo" />
    </item>
</layer-list>`;

  await fs.writeFile(
    path.join(lightDrawableDir, "splash_background.xml"),
    lightSplashDrawable
  );

  // Generate dark theme splash background
  const darkDrawableDir = path.join(resDir, "drawable-night");
  await fs.ensureDir(darkDrawableDir);

  const darkSplashDrawable = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_background" />
    <item>
        <bitmap
            android:gravity="center"
            android:src="@drawable/splash_logo" />
    </item>
</layer-list>`;

  await fs.writeFile(
    path.join(darkDrawableDir, "splash_background.xml"),
    darkSplashDrawable
  );

  console.log("🌓 Generated light/dark splash backgrounds");
}

async function generateColorResources(resDir: string, config: any) {
  console.log("🎨 Generating color resources...");

  // Generate light theme colors
  const lightColorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Splash Screen Colors -->
    <color name="splash_background">${config.backgroundLight}</color>
    <color name="splash_primary">${config.backgroundLight}</color>
    
    <!-- Additional theme colors -->
    <color name="primary_color">${config.backgroundLight}</color>
    <color name="primary_dark_color">${adjustColorBrightness(
      config.backgroundLight,
      -20
    )}</color>
    <color name="accent_color">${config.backgroundLight}</color>
</resources>`;

  await fs.outputFile(path.join(resDir, "values/colors.xml"), lightColorsXml);

  // Generate dark theme colors
  const darkColorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Splash Screen Colors -->
    <color name="splash_background">${config.backgroundDark}</color>
    <color name="splash_primary">${config.backgroundDark}</color>
    
    <!-- Additional theme colors -->
    <color name="primary_color">${config.backgroundDark}</color>
    <color name="primary_dark_color">${adjustColorBrightness(
      config.backgroundDark,
      20
    )}</color>
    <color name="accent_color">${config.backgroundDark}</color>
</resources>`;

  await fs.outputFile(
    path.join(resDir, "values-night/colors.xml"),
    darkColorsXml
  );

  console.log("🎨 Generated light/dark color resources");
}

async function generateSplashDrawable(resDir: string) {
  // Generate splash drawable that can be used in styles
  const splashDrawableXml = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_background" />
    <item android:width="200dp" android:height="200dp" android:gravity="center">
        <bitmap android:src="@drawable/splash_logo" />
    </item>
</layer-list>`;

  await fs.outputFile(
    path.join(resDir, "drawable/splash_screen.xml"),
    splashDrawableXml
  );
  await fs.outputFile(
    path.join(resDir, "drawable-night/splash_screen.xml"),
    splashDrawableXml
  );

  // Generate styles for splash screen
  const stylesXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="SplashTheme" parent="Theme.AppCompat.Light.NoActionBar">
        <item name="android:windowBackground">@drawable/splash_screen</item>
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowActionBar">false</item>
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowContentOverlay">@null</item>
        <item name="android:windowDrawsSystemBarBackgrounds">false</item>
    </style>
</resources>`;

  await fs.outputFile(path.join(resDir, "values/styles.xml"), stylesXml);

  console.log("🎭 Generated splash screen drawable and styles");
}

function adjustColorBrightness(hexColor: string, percent: number): string {
  // Remove # if present
  const hex = hexColor.replace("#", "");

  // Parse r, g, b values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate new values
  const newR = Math.min(
    255,
    Math.max(0, Math.round((r * (100 + percent)) / 100))
  );
  const newG = Math.min(
    255,
    Math.max(0, Math.round((g * (100 + percent)) / 100))
  );
  const newB = Math.min(
    255,
    Math.max(0, Math.round((b * (100 + percent)) / 100))
  );

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, "0")}${newG
    .toString(16)
    .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}
