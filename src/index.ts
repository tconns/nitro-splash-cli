#!/usr/bin/env node
import { Command } from "commander";
import { generateSplash } from "./generate";
import { createAdvancedCommand } from "./commands/advanced";

const program = new Command();

program
  .name("nitro-splash")
  .description(
    "Generate splash screen assets for React Native with Nitro Module support"
  )
  .version("0.1.0");

// Basic generation command
program
  .command("generate")
  .description(
    "Generate splash assets (logo, background, platform-specific assets)"
  )
  .option(
    "-c, --config <path>",
    "Path to splash.config.json",
    "splash.config.json"
  )
  .option(
    "-o, --output <path>",
    "Output directory for generated assets",
    "splash-build"
  )
  .option("--verbose", "Enable verbose logging", false)
  .action(async (opts) => {
    try {
      if (opts.verbose) {
        console.log("🔧 Configuration:");
        console.log(`  Config file: ${opts.config}`);
        console.log(`  Output directory: ${opts.output}`);
      }

      await generateSplash(opts.config);

      console.log("\n📚 Documentation:");
      console.log(
        "  Check the generated SPLASH_README.md for integration instructions"
      );
      console.log(
        "  Asset manifest available at: splash-build/asset-manifest.json"
      );
    } catch (error) {
      console.error("❌ Generation failed:", error);
      process.exit(1);
    }
  });

// Add advanced commands
program.addCommand(createAdvancedCommand());

// Quick start command
program
  .command("init")
  .description("Quick start: Initialize splash screen configuration")
  .option("-n, --name <name>", "Project name", "MyApp")
  .option("--logo <path>", "Logo file path", "./assets/logo.png")
  .action(async (opts) => {
    const fs = await import("fs-extra");

    console.log("🚀 Quick initialization...");

    // Create basic config
    const config = {
      logo: opts.logo,
      backgroundLight: "#FFFFFF",
      backgroundDark: "#1F1F1F",
      iosAppName: opts.name,
      androidPackageName: `com.example.${opts.name.toLowerCase()}`,
      platforms: ["ios", "android"],
      sizes: {
        all: [64, 128, 192, 256, 512, 1024],
      },
    };

    await fs.writeJSON("./splash.config.json", config, { spaces: 2 });

    // Create assets directory if it doesn't exist
    await fs.ensureDir("./assets");

    console.log("✅ Configuration created!");
    console.log("\nNext steps:");
    console.log(`1. Add your logo file to: ${opts.logo}`);
    console.log("2. Run: nitro-splash generate");
    console.log("3. For advanced features, run: nitro-splash advanced init");
  });

// Info command
program
  .command("info")
  .description("Show configuration and status information")
  .option("-c, --config <path>", "Config file to analyze", "splash.config.json")
  .action(async (opts) => {
    const fs = await import("fs-extra");
    const path = await import("path");

    try {
      console.log("ℹ️  Nitro Splash Information\n");

      // Check config file
      if (await fs.pathExists(opts.config)) {
        const config = await fs.readJSON(opts.config);
        console.log("📋 Configuration:");
        console.log(
          `  Logo: ${config.logo} ${
            (await fs.pathExists(config.logo)) ? "✅" : "❌"
          }`
        );
        console.log(`  Light theme: ${config.backgroundLight}`);
        console.log(`  Dark theme: ${config.backgroundDark}`);
        console.log(
          `  Platforms: ${(config.platforms || ["ios", "android"]).join(", ")}`
        );

        if (config.sizes) {
          console.log(
            `  Sizes configured: ${Object.keys(config.sizes).join(", ")}`
          );
        }
      } else {
        console.log("❌ No configuration file found");
        console.log("   Run 'nitro-splash init' to create one");
      }

      console.log("\n🔧 Generated Assets:");
      const buildDir = "splash-build";
      if (await fs.pathExists(buildDir)) {
        const files = await fs.readdir(buildDir);
        console.log(`  Build directory: ${files.length} items`);

        const manifestPath = path.join(buildDir, "asset-manifest.json");
        if (await fs.pathExists(manifestPath)) {
          const manifest = await fs.readJSON(manifestPath);
          console.log(
            `  Last generated: ${new Date(manifest.generated).toLocaleString()}`
          );
        }
      } else {
        console.log("  No assets generated yet");
        console.log("  Run 'nitro-splash generate' to create assets");
      }
    } catch (error) {
      console.error("❌ Error reading information:", error);
    }
  });

program.parse(process.argv);
