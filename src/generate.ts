import fs from "fs-extra";
import sharp from "sharp";
import path from "path";
import { generateIOS } from "./ios";
import { generateAndroid } from "./android";

interface SplashConfig {
  logo: string;
  backgroundLight: string;
  backgroundDark: string;
  iosAppName?: string;
  sizes?: {
    mobile: number[];
    desktop: number[];
    web: number[];
    all: number[];
  };
  platforms?: string[];
  outputFormats?: string[];
}

interface AssetVariant {
  size: number;
  theme: "light" | "dark";
  platform: string;
  density?: string;
  scale?: string;
}

export async function generateSplash(configPath: string) {
  const config: SplashConfig = await fs.readJSON(configPath);

  console.log("⚙️  Generating splash screen with config:", config);

  const outDir = path.resolve("splash-build");
  await fs.emptyDir(outDir);

  // Enhanced size configurations for different platforms
  const defaultSizes = {
    mobile: [64, 128, 192, 256, 512],
    desktop: [16, 32, 48, 64, 128, 256, 512],
    web: [32, 48, 72, 96, 144, 192, 256, 512],
    all: [16, 32, 48, 64, 72, 96, 128, 144, 192, 256, 512, 1024],
  };

  const sizes = config.sizes?.all || defaultSizes.all;
  const platforms = config.platforms || ["ios", "android"];
  const outputFormats = config.outputFormats || ["png"];

  // Generate base logo assets in multiple sizes
  console.log("🎨 Generating logo assets...");
  await generateLogoAssets(config, outDir, sizes, outputFormats);

  // Generate themed splash screens
  console.log("🌓 Generating themed splash screens...");
  await generateThemedAssets(config, outDir, sizes);

  // Generate platform-specific assets
  if (platforms.includes("ios")) {
    await generateIOS(config, outDir);
  }

  if (platforms.includes("android")) {
    await generateAndroid(config, outDir);
  }

  // Generate asset manifest
  await generateAssetManifest(config, outDir, sizes);

  console.log("✅ Splash assets generated successfully!");
}

async function generateLogoAssets(
  config: SplashConfig,
  outDir: string,
  sizes: number[],
  formats: string[]
) {
  for (const size of sizes) {
    for (const format of formats) {
      const outFile = path.join(outDir, `logo-${size}.${format}`);
      await sharp(config.logo)
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toFormat(format as any)
        .toFile(outFile);
      console.log(`� Generated logo: ${size}x${size} ${format.toUpperCase()}`);
    }
  }
}

async function generateThemedAssets(
  config: SplashConfig,
  outDir: string,
  sizes: number[]
) {
  const themes = [
    { name: "light", background: config.backgroundLight },
    { name: "dark", background: config.backgroundDark },
  ];

  for (const theme of themes) {
    const themeDir = path.join(outDir, `theme-${theme.name}`);
    await fs.ensureDir(themeDir);

    for (const size of sizes) {
      // Generate splash screen with background color
      const splashFile = path.join(themeDir, `splash-${size}.png`);

      // Create colored background
      const background = await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: theme.background,
        },
      }).png();

      // Composite logo on background
      const logoSize = Math.floor(size * 0.3); // Logo is 30% of splash size
      const logoBuffer = await sharp(config.logo)
        .resize(logoSize, logoSize, { fit: "contain" })
        .png()
        .toBuffer();

      await background
        .composite([
          {
            input: logoBuffer,
            gravity: "center",
          },
        ])
        .toFile(splashFile);

      console.log(`🎭 Generated ${theme.name} splash: ${size}x${size}`);
    }
  }
}

async function generateAssetManifest(
  config: SplashConfig,
  outDir: string,
  sizes: number[]
) {
  const manifest = {
    generated: new Date().toISOString(),
    config: {
      logo: config.logo,
      backgroundLight: config.backgroundLight,
      backgroundDark: config.backgroundDark,
      iosAppName: config.iosAppName,
    },
    assets: {
      logos: sizes.map((size) => ({
        size,
        filename: `logo-${size}.png`,
        path: `./logo-${size}.png`,
      })),
      splashScreens: {
        light: sizes.map((size) => ({
          size,
          filename: `splash-${size}.png`,
          path: `./theme-light/splash-${size}.png`,
        })),
        dark: sizes.map((size) => ({
          size,
          filename: `splash-${size}.png`,
          path: `./theme-dark/splash-${size}.png`,
        })),
      },
    },
    platforms: {
      ios: {
        imagesets: ["SplashLogo.imageset"],
        launchscreen: "LaunchScreen.storyboard",
      },
      android: {
        densities: ["mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"],
        colors: ["values/colors.xml", "values-night/colors.xml"],
      },
    },
  };

  await fs.writeJSON(path.join(outDir, "asset-manifest.json"), manifest, {
    spaces: 2,
  });
  console.log("📋 Generated asset manifest");
}
