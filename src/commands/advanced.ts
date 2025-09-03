import { Command } from "commander";
import { TemplateGenerator } from "../utils/template-generator";
import {
  AssetGenerator,
  PLATFORM_CONFIGS,
  THEME_CONFIGS,
} from "../utils/asset-generator";
import path from "path";
import fs from "fs-extra";

export function createAdvancedCommand(): Command {
  const advanced = new Command("advanced");
  advanced.description(
    "Advanced splash screen generation with multiple themes and platforms"
  );

  // Template generation command
  advanced
    .command("init")
    .description("Initialize advanced splash screen configuration")
    .option("-n, --name <name>", "Project name", "MyReactNativeApp")
    .option("-p, --package <package>", "Android package name")
    .option("-b, --bundle <bundle>", "iOS bundle identifier")
    .option("-l, --logo <path>", "Logo file path", "./assets/logo.png")
    .option("--light <color>", "Light theme background color", "#FFFFFF")
    .option("--dark <color>", "Dark theme background color", "#000000")
    .action(async (options) => {
      try {
        console.log("🚀 Initializing advanced splash screen configuration...");

        const config = {
          projectName: options.name,
          bundleId:
            options.bundle || `com.example.${options.name.toLowerCase()}`,
          packageName:
            options.package || `com.example.${options.name.toLowerCase()}`,
          logoPath: options.logo,
          themes: {
            light: options.light,
            dark: options.dark,
          },
          platforms: ["ios", "android", "web"],
        };

        // Generate enhanced splash config
        await TemplateGenerator.generateSplashConfig(
          "./splash.config.json",
          config
        );

        // Generate integration templates
        await TemplateGenerator.generateReactNativeIntegration("./", config);

        // Generate npm scripts
        await TemplateGenerator.generateNpmScripts("./package-scripts.json");

        // Generate documentation
        await TemplateGenerator.generateDocumentation("./", config);

        console.log("✅ Advanced splash screen configuration initialized!");
        console.log("\nNext steps:");
        console.log("1. Place your logo file at: " + config.logoPath);
        console.log("2. Run: npm run splash:generate");
        console.log(
          "3. Integrate generated assets using the integration guides"
        );
      } catch (error) {
        console.error("❌ Error initializing configuration:", error);
        process.exit(1);
      }
    });

  // Multi-theme generation command
  advanced
    .command("generate-themes")
    .description("Generate assets for multiple themes")
    .option(
      "-c, --config <path>",
      "Configuration file path",
      "./splash.config.json"
    )
    .option("-o, --output <path>", "Output directory", "./splash-build")
    .option("-t, --themes <themes...>", "Themes to generate", ["light", "dark"])
    .action(async (options) => {
      try {
        console.log("🎨 Generating multi-theme assets...");

        const config = await fs.readJSON(options.config);
        const generator = new AssetGenerator(config.logo, options.output);

        // Prepare platforms
        const platforms = config.platforms
          ?.map((p: string) => PLATFORM_CONFIGS[p])
          .filter(Boolean) || [PLATFORM_CONFIGS.ios, PLATFORM_CONFIGS.android];

        // Prepare themes
        const themes = options.themes
          .map((themeName: string) => {
            if (config.themes && config.themes[themeName]) {
              return {
                name: themeName,
                backgroundColor: config.themes[themeName].background,
                foregroundColor: config.themes[themeName].foreground,
              };
            }
            return THEME_CONFIGS[themeName];
          })
          .filter(Boolean);

        // Generate multi-platform assets
        await generator.generateMultiPlatformAssets(platforms, themes);

        // Generate additional asset types
        await generator.generateIcons(
          [16, 32, 48, 64, 128, 256, 512, 1024],
          path.join(options.output, "icons")
        );
        await generator.generateAdaptiveIcons(options.output);
        await generator.generateAppStoreAssets(options.output);

        console.log("✅ Multi-theme assets generated successfully!");
      } catch (error) {
        console.error("❌ Error generating themes:", error);
        process.exit(1);
      }
    });

  // Platform-specific generation
  advanced
    .command("generate-platform")
    .description("Generate assets for specific platform")
    .option("-p, --platform <platform>", "Platform to generate for", "ios")
    .option(
      "-c, --config <path>",
      "Configuration file path",
      "./splash.config.json"
    )
    .option("-o, --output <path>", "Output directory", "./splash-build")
    .action(async (options) => {
      try {
        console.log(`📱 Generating ${options.platform} specific assets...`);

        const config = await fs.readJSON(options.config);
        const generator = new AssetGenerator(config.logo, options.output);

        const platformConfig = PLATFORM_CONFIGS[options.platform];
        if (!platformConfig) {
          throw new Error(`Platform ${options.platform} not supported`);
        }

        const themes = [
          {
            name: "light",
            backgroundColor: config.backgroundLight,
            foregroundColor: "#000000",
          },
          {
            name: "dark",
            backgroundColor: config.backgroundDark,
            foregroundColor: "#FFFFFF",
          },
        ];

        await generator.generateMultiPlatformAssets([platformConfig], themes);

        console.log(`✅ ${options.platform} assets generated successfully!`);
      } catch (error) {
        console.error("❌ Error generating platform assets:", error);
        process.exit(1);
      }
    });

  // Asset validation command
  advanced
    .command("validate")
    .description("Validate generated assets")
    .option(
      "-d, --dir <path>",
      "Assets directory to validate",
      "./splash-build"
    )
    .action(async (options) => {
      try {
        console.log("🔍 Validating generated assets...");

        const assetsDir = options.dir;
        if (!(await fs.pathExists(assetsDir))) {
          throw new Error(`Assets directory not found: ${assetsDir}`);
        }

        // Check for required files
        const manifestPath = path.join(assetsDir, "asset-manifest.json");
        if (await fs.pathExists(manifestPath)) {
          const manifest = await fs.readJSON(manifestPath);
          console.log("📋 Asset manifest found:");
          console.log(`  Generated: ${manifest.generated}`);
          console.log(
            `  Total assets: ${manifest.assets?.logos?.length || 0} logos`
          );
          console.log(
            `  Themes: ${Object.keys(manifest.assets?.splashScreens || {}).join(
              ", "
            )}`
          );
        }

        // Validate iOS assets
        const iosAssetsPath = path.join(assetsDir, "../ios");
        if (await fs.pathExists(iosAssetsPath)) {
          console.log("🍏 iOS assets validation:");
          const imagesetPath = path.join(
            iosAssetsPath,
            "ReactNativeApp/Assets.xcassets/SplashLogo.imageset"
          );
          const colorsetPath = path.join(
            iosAssetsPath,
            "ReactNativeApp/Assets.xcassets/SplashBackground.colorset"
          );

          console.log(
            `  SplashLogo.imageset: ${
              (await fs.pathExists(imagesetPath)) ? "✅" : "❌"
            }`
          );
          console.log(
            `  SplashBackground.colorset: ${
              (await fs.pathExists(colorsetPath)) ? "✅" : "❌"
            }`
          );
        }

        // Validate Android assets
        const androidAssetsPath = path.join(assetsDir, "../android");
        if (await fs.pathExists(androidAssetsPath)) {
          console.log("🤖 Android assets validation:");
          const resPath = path.join(androidAssetsPath, "app/src/main/res");
          const colorsPath = path.join(resPath, "values/colors.xml");
          const colorsNightPath = path.join(resPath, "values-night/colors.xml");

          console.log(
            `  colors.xml: ${(await fs.pathExists(colorsPath)) ? "✅" : "❌"}`
          );
          console.log(
            `  colors-night.xml: ${
              (await fs.pathExists(colorsNightPath)) ? "✅" : "❌"
            }`
          );
        }

        console.log("✅ Asset validation completed!");
      } catch (error) {
        console.error("❌ Error validating assets:", error);
        process.exit(1);
      }
    });

  return advanced;
}
