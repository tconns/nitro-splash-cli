import sharp from "sharp";
import fs from "fs-extra";
import path from "path";

export interface AssetSize {
  width: number;
  height: number;
  name: string;
  description?: string;
}

export interface PlatformConfig {
  name: string;
  sizes: AssetSize[];
  outputPath: string;
  formats: string[];
}

export interface ThemeConfig {
  name: string;
  backgroundColor: string;
  foregroundColor?: string;
  logoTint?: string;
}

export class AssetGenerator {
  private sourceLogo: string;
  private outputDir: string;

  constructor(sourceLogo: string, outputDir: string) {
    this.sourceLogo = sourceLogo;
    this.outputDir = outputDir;
  }

  /**
   * Generate assets for multiple platforms and themes
   */
  async generateMultiPlatformAssets(
    platforms: PlatformConfig[],
    themes: ThemeConfig[]
  ): Promise<void> {
    console.log("🎨 Starting multi-platform asset generation...");

    for (const platform of platforms) {
      console.log(`📱 Generating assets for ${platform.name}...`);

      for (const theme of themes) {
        await this.generatePlatformAssets(platform, theme);
      }
    }

    console.log("✅ Multi-platform asset generation completed!");
  }

  /**
   * Generate assets for a specific platform and theme
   */
  private async generatePlatformAssets(
    platform: PlatformConfig,
    theme: ThemeConfig
  ): Promise<void> {
    const platformDir = path.join(this.outputDir, platform.name, theme.name);
    await fs.ensureDir(platformDir);

    for (const size of platform.sizes) {
      for (const format of platform.formats) {
        await this.generateAsset(size, format, theme, platformDir);
      }
    }
  }

  /**
   * Generate a single asset
   */
  private async generateAsset(
    size: AssetSize,
    format: string,
    theme: ThemeConfig,
    outputDir: string
  ): Promise<void> {
    const filename = `${size.name}.${format}`;
    const outputPath = path.join(outputDir, filename);

    // Skip unsupported formats
    if (format === "svg" || format === "ico") {
      console.log(
        `  ⚠️ Skipped ${filename} (${format.toUpperCase()} format not supported)`
      );
      return;
    }

    // Create background
    const background = await sharp({
      create: {
        width: size.width,
        height: size.height,
        channels: 4,
        background: theme.backgroundColor,
      },
    });

    // Process logo
    const logoSize = Math.min(size.width, size.height) * 0.4; // Logo is 40% of container
    let logoBuffer = await sharp(this.sourceLogo)
      .resize(Math.round(logoSize), Math.round(logoSize), {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    // Apply logo tint if specified
    if (theme.logoTint) {
      logoBuffer = await this.applyTint(logoBuffer, theme.logoTint);
    }

    // Composite logo on background
    await background
      .composite([
        {
          input: logoBuffer,
          gravity: "center",
        },
      ])
      .toFormat(format as any)
      .toFile(outputPath);

    console.log(`  ✓ Generated ${filename} (${size.width}x${size.height})`);
  }

  /**
   * Apply color tint to logo
   */
  private async applyTint(
    logoBuffer: Buffer,
    tintColor: string
  ): Promise<Buffer> {
    return await sharp(logoBuffer).tint(tintColor).toBuffer();
  }

  /**
   * Generate icon from logo for different use cases
   */
  async generateIcons(sizes: number[], outputDir: string): Promise<void> {
    await fs.ensureDir(outputDir);

    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}.png`);

      await sharp(this.sourceLogo)
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(outputPath);

      console.log(`🔷 Generated icon: ${size}x${size}`);
    }
  }

  /**
   * Generate adaptive icons for Android
   */
  async generateAdaptiveIcons(outputDir: string): Promise<void> {
    const adaptiveDir = path.join(outputDir, "adaptive");
    await fs.ensureDir(adaptiveDir);

    // Generate foreground (logo)
    const foregroundPath = path.join(adaptiveDir, "ic_launcher_foreground.png");
    await sharp(this.sourceLogo)
      .resize(432, 432, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(foregroundPath);

    // Generate background (solid color)
    const backgroundPath = path.join(adaptiveDir, "ic_launcher_background.png");
    await sharp({
      create: {
        width: 432,
        height: 432,
        channels: 4,
        background: "#FFFFFF",
      },
    })
      .png()
      .toFile(backgroundPath);

    console.log("🎭 Generated adaptive icons for Android");
  }

  /**
   * Generate app store assets
   */
  async generateAppStoreAssets(outputDir: string): Promise<void> {
    const appStoreDir = path.join(outputDir, "appstore");
    await fs.ensureDir(appStoreDir);

    const appStoreSizes = [
      { size: 1024, name: "ios-appstore" },
      { size: 512, name: "google-play" },
      { size: 180, name: "ios-app-icon" },
      { size: 192, name: "android-app-icon" },
    ];

    for (const config of appStoreSizes) {
      const outputPath = path.join(
        appStoreDir,
        `${config.name}-${config.size}.png`
      );

      await sharp(this.sourceLogo)
        .resize(config.size, config.size, { fit: "contain" })
        .png()
        .toFile(outputPath);

      console.log(`🏪 Generated app store asset: ${config.name}`);
    }
  }
}

/**
 * Predefined platform configurations
 */
export const PLATFORM_CONFIGS: { [key: string]: PlatformConfig } = {
  ios: {
    name: "ios",
    outputPath: "ios",
    formats: ["png"],
    sizes: [
      { width: 128, height: 128, name: "logo-1x" },
      { width: 256, height: 256, name: "logo-2x" },
      { width: 512, height: 512, name: "logo-3x" },
    ],
  },
  android: {
    name: "android",
    outputPath: "android",
    formats: ["png"],
    sizes: [
      { width: 64, height: 64, name: "ldpi", description: "Low density" },
      { width: 128, height: 128, name: "mdpi", description: "Medium density" },
      { width: 192, height: 192, name: "hdpi", description: "High density" },
      {
        width: 256,
        height: 256,
        name: "xhdpi",
        description: "Extra high density",
      },
      {
        width: 512,
        height: 512,
        name: "xxhdpi",
        description: "Extra extra high density",
      },
      {
        width: 1024,
        height: 1024,
        name: "xxxhdpi",
        description: "Extra extra extra high density",
      },
    ],
  },
  web: {
    name: "web",
    outputPath: "web",
    formats: ["png"],
    sizes: [
      { width: 16, height: 16, name: "favicon-16" },
      { width: 32, height: 32, name: "favicon-32" },
      { width: 48, height: 48, name: "favicon-48" },
      { width: 192, height: 192, name: "pwa-192" },
      { width: 512, height: 512, name: "pwa-512" },
    ],
  },
};

/**
 * Predefined theme configurations
 */
export const THEME_CONFIGS: { [key: string]: ThemeConfig } = {
  light: {
    name: "light",
    backgroundColor: "#FFFFFF",
    foregroundColor: "#000000",
  },
  dark: {
    name: "dark",
    backgroundColor: "#000000",
    foregroundColor: "#FFFFFF",
  },
  blue: {
    name: "blue",
    backgroundColor: "#007AFF",
    foregroundColor: "#FFFFFF",
  },
  green: {
    name: "green",
    backgroundColor: "#34C759",
    foregroundColor: "#FFFFFF",
  },
};
