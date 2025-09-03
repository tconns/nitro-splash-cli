import fs from "fs-extra";
import path from "path";

export interface TemplateConfig {
  projectName: string;
  bundleId: string;
  packageName: string;
  logoPath: string;
  themes: {
    light: string;
    dark: string;
  };
  platforms: string[];
}

export class TemplateGenerator {
  /**
   * Generate enhanced splash configuration template
   */
  static async generateSplashConfig(
    outputPath: string,
    config: Partial<TemplateConfig> = {}
  ): Promise<void> {
    const defaultConfig = {
      projectName: config.projectName || "MyReactNativeApp",
      logoPath: config.logoPath || "./assets/logo.png",
      themes: config.themes || {
        light: "#FFFFFF",
        dark: "#000000",
      },
      platforms: config.platforms || ["ios", "android", "web"],
    };

    const splashConfig = {
      // Basic configuration
      logo: defaultConfig.logoPath,
      backgroundLight: defaultConfig.themes.light,
      backgroundDark: defaultConfig.themes.dark,

      // Project settings
      iosAppName: defaultConfig.projectName,
      androidPackageName:
        config.packageName ||
        `com.example.${defaultConfig.projectName.toLowerCase()}`,

      // Advanced configuration
      sizes: {
        mobile: [64, 128, 192, 256, 512],
        desktop: [16, 32, 48, 64, 128, 256],
        web: [32, 48, 72, 96, 144, 192, 256, 512],
        all: [16, 32, 48, 64, 72, 96, 128, 144, 192, 256, 512, 1024, 2048],
      },

      // Platform specific settings
      platforms: defaultConfig.platforms,
      outputFormats: ["png", "webp"],

      // Theme variants
      themes: {
        light: {
          background: defaultConfig.themes.light,
          foreground: "#000000",
          accent: "#007AFF",
        },
        dark: {
          background: defaultConfig.themes.dark,
          foreground: "#FFFFFF",
          accent: "#0A84FF",
        },
        branded: {
          background: "#007AFF",
          foreground: "#FFFFFF",
          accent: "#FFFFFF",
        },
      },

      // iOS specific
      ios: {
        launchScreen: {
          generateStoryboard: true,
          logoSize: 100,
          centerLogo: true,
        },
        assets: {
          generateColorsets: true,
          generateImagesets: true,
        },
      },

      // Android specific
      android: {
        densities: ["ldpi", "mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"],
        generateAdaptiveIcons: true,
        splashScreenApi: "androidx",
        drawableNight: true,
      },

      // Web specific
      web: {
        generatePWAIcons: true,
        generateFavicons: true,
        generateManifest: true,
      },
    };

    await fs.writeJSON(outputPath, splashConfig, { spaces: 2 });
    console.log(`📝 Generated enhanced splash config: ${outputPath}`);
  }

  /**
   * Generate React Native splash screen integration template
   */
  static async generateReactNativeIntegration(
    outputPath: string,
    config: TemplateConfig
  ): Promise<void> {
    const integrationDir = path.join(outputPath, "integration");
    await fs.ensureDir(integrationDir);

    // Generate iOS integration files
    await this.generateIOSIntegration(integrationDir, config);

    // Generate Android integration files
    await this.generateAndroidIntegration(integrationDir, config);

    // Generate TypeScript definitions
    await this.generateTypeScriptDefinitions(integrationDir);

    console.log(
      `🔧 Generated React Native integration files at: ${integrationDir}`
    );
  }

  private static async generateIOSIntegration(
    outputPath: string,
    config: TemplateConfig
  ): Promise<void> {
    const iosDir = path.join(outputPath, "ios");
    await fs.ensureDir(iosDir);

    // Generate AppDelegate.swift modification
    const appDelegateSwift = `
// Add this to your AppDelegate.swift

import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Configure splash screen
        if #available(iOS 13.0, *) {
            // iOS 13+ uses scene delegate
        } else {
            // Configure for iOS 12 and below
            self.window = UIWindow(frame: UIScreen.main.bounds)
            self.window?.makeKeyAndVisible()
        }
        
        return true
    }

    // MARK: UISceneSession Lifecycle
    @available(iOS 13.0, *)
    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }
}`;

    await fs.writeFile(
      path.join(iosDir, "AppDelegate-integration.swift"),
      appDelegateSwift
    );

    // Generate Info.plist modification
    const infoPlistChanges = `
<!-- Add these keys to your Info.plist -->
<key>UILaunchStoryboardName</key>
<string>LaunchScreen</string>
<key>UIStatusBarStyle</key>
<string>UIStatusBarStyleDefault</string>
<key>UIUserInterfaceStyle</key>
<string>Automatic</string>`;

    await fs.writeFile(
      path.join(iosDir, "Info-plist-changes.txt"),
      infoPlistChanges
    );
  }

  private static async generateAndroidIntegration(
    outputPath: string,
    config: TemplateConfig
  ): Promise<void> {
    const androidDir = path.join(outputPath, "android");
    await fs.ensureDir(androidDir);

    // Generate MainActivity.java modification
    const mainActivityJava = `
// Add this to your MainActivity.java

package ${config.packageName};

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.splashscreen.SplashScreen;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Install splash screen
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
        
        super.onCreate(savedInstanceState);
        
        // Keep the splash screen on-screen for longer period
        splashScreen.setKeepOnScreenCondition(() -> {
            // Return true to keep splash screen
            return false;
        });
    }
}`;

    await fs.writeFile(
      path.join(androidDir, "MainActivity-integration.java"),
      mainActivityJava
    );

    // Generate AndroidManifest.xml modification
    const androidManifestChanges = `
<!-- Add these to your AndroidManifest.xml -->
<activity
    android:name=".MainActivity"
    android:theme="@style/SplashTheme"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>`;

    await fs.writeFile(
      path.join(androidDir, "AndroidManifest-changes.xml"),
      androidManifestChanges
    );

    // Generate build.gradle dependencies
    const buildGradleDeps = `
// Add these dependencies to your app/build.gradle
dependencies {
    implementation 'androidx.core:core-splashscreen:1.0.1'
    implementation 'androidx.appcompat:appcompat:1.6.1'
}`;

    await fs.writeFile(
      path.join(androidDir, "build-gradle-dependencies.txt"),
      buildGradleDeps
    );
  }

  private static async generateTypeScriptDefinitions(
    outputPath: string
  ): Promise<void> {
    const typeDefinitions = `
// splash-screen.d.ts
declare module 'react-native-splash-screen' {
  export interface SplashScreenConfig {
    logo: string;
    backgroundLight: string;
    backgroundDark: string;
    theme: 'light' | 'dark' | 'auto';
  }

  export class SplashScreen {
    static show(): void;
    static hide(): void;
    static isVisible(): boolean;
    static configure(config: SplashScreenConfig): void;
  }

  export default SplashScreen;
}

// asset-types.d.ts
export interface GeneratedAsset {
  platform: 'ios' | 'android' | 'web';
  size: number;
  theme: 'light' | 'dark';
  path: string;
  filename: string;
}

export interface AssetManifest {
  generated: string;
  assets: GeneratedAsset[];
  config: {
    logo: string;
    backgroundLight: string;
    backgroundDark: string;
  };
}`;

    await fs.writeFile(path.join(outputPath, "types.d.ts"), typeDefinitions);
  }

  /**
   * Generate package.json scripts for asset generation
   */
  static async generateNpmScripts(outputPath: string): Promise<void> {
    const scripts = {
      scripts: {
        "splash:generate": "nitro-splash generate",
        "splash:clean": "rimraf splash-build",
        "splash:build": "npm run splash:clean && npm run splash:generate",
        "splash:watch": "chokidar 'assets/**/*' -c 'npm run splash:generate'",
        postinstall: "npm run splash:generate",
      },
      devDependencies: {
        "chokidar-cli": "^3.0.0",
        rimraf: "^5.0.0",
      },
    };

    await fs.writeJSON(outputPath, scripts, { spaces: 2 });
    console.log(`📦 Generated npm scripts configuration`);
  }

  /**
   * Generate documentation
   */
  static async generateDocumentation(
    outputPath: string,
    config: TemplateConfig
  ): Promise<void> {
    const documentation = `# ${config.projectName} Splash Screen Assets

## Overview
This project uses nitro-splash to generate splash screen assets for React Native applications with support for light/dark themes.

## Generated Assets

### iOS Assets
- \`SplashLogo.imageset/\` - Logo assets for different screen densities
- \`SplashBackground.colorset/\` - Dynamic background colors for light/dark mode
- \`LaunchScreen.storyboard\` - Launch screen storyboard with auto-layout

### Android Assets
- \`drawable-*/splash_logo.png\` - Logo assets for different densities (ldpi to xxxhdpi)
- \`values/colors.xml\` - Light theme colors
- \`values-night/colors.xml\` - Dark theme colors
- \`drawable/splash_screen.xml\` - Splash screen drawable

### Web Assets
- Favicons in multiple sizes (16px to 512px)
- PWA icons for web app manifest
- SVG versions for scalable display

## Configuration

The splash screen configuration is defined in \`splash.config.json\`:

\`\`\`json
{
  "logo": "./assets/logo.png",
  "backgroundLight": "#FFFFFF",
  "backgroundDark": "#000000",
  "platforms": ["ios", "android", "web"],
  "sizes": {
    "all": [16, 32, 48, 64, 128, 256, 512, 1024]
  }
}
\`\`\`

## Usage

### Generate Assets
\`\`\`bash
npm run splash:generate
\`\`\`

### Watch for Changes
\`\`\`bash
npm run splash:watch
\`\`\`

### Clean Generated Assets
\`\`\`bash
npm run splash:clean
\`\`\`

## Integration

### iOS Integration
1. Add generated assets to your Xcode project
2. Set LaunchScreen.storyboard as launch screen
3. Configure Info.plist for dynamic appearance

### Android Integration
1. Copy generated resources to \`android/app/src/main/res/\`
2. Update MainActivity to use SplashTheme
3. Add splash screen dependencies to build.gradle

### React Native Integration
\`\`\`typescript
import SplashScreen from 'react-native-splash-screen';

// Hide splash screen when app is ready
useEffect(() => {
  SplashScreen.hide();
}, []);
\`\`\`

## Theme Support

The generated assets automatically support:
- **Light Mode**: Uses \`backgroundLight\` color
- **Dark Mode**: Uses \`backgroundDark\` color
- **System Theme**: Automatically switches based on device settings

## Asset Optimization

All generated assets are optimized for:
- File size (using Sharp image processing)
- Platform requirements (iOS HIG, Material Design)
- Performance (appropriate resolutions for each density)

## Troubleshooting

### iOS Issues
- Ensure LaunchScreen.storyboard is set as launch screen in project settings
- Verify SplashBackground colorset is properly configured for appearance variants

### Android Issues
- Check that drawable resources are in correct density folders
- Verify SplashTheme is applied to MainActivity in AndroidManifest.xml
- Ensure values-night folder exists for dark theme support

## Generated Files Structure

\`\`\`
splash-build/
├── asset-manifest.json          # Asset metadata
├── logo-*.png                   # Logo in multiple sizes
├── theme-light/                 # Light theme assets
│   └── splash-*.png
├── theme-dark/                  # Dark theme assets
│   └── splash-*.png
├── ios/                         # iOS specific assets
└── android/                     # Android specific assets
\`\`\`
`;

    await fs.writeFile(
      path.join(outputPath, "SPLASH_README.md"),
      documentation
    );
    console.log(`📚 Generated documentation: ${outputPath}/SPLASH_README.md`);
  }
}
