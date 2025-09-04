import fs from "fs-extra";
import path from "path";
import sharp from "sharp";
import { XmlMerger } from "./utils/xml-merger";

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

  // Check if we're merging with existing files
  const existingFiles = await checkExistingResourceFiles(resDir);
  if (existingFiles.length > 0) {
    console.log(
      "📂 Found existing resource files - will merge instead of replace:"
    );
    existingFiles.forEach((file: string) => console.log(`   • ${file}`));
  }

  // Generate drawable resources for different densities
  await generateDrawableResources(resDir, logoDir, config);

  // Generate splash background drawables for light/dark
  await generateSplashBackgrounds(resDir, config);

  // Generate responsive splash backgrounds for different screen densities
  await generateResponsiveSplashBackgrounds(resDir, config);

  // Generate color resources
  await generateColorResources(resDir, config);

  // Generate splash drawable XML
  await generateSplashDrawable(resDir);

  // Generate splash layout XML (LinearLayout format)
  await generateSplashLayout(resDir);

  console.log("🤖 Android assets generated successfully");
}

async function checkExistingResourceFiles(resDir: string): Promise<string[]> {
  const existingFiles: string[] = [];
  const filesToCheck = [
    "values/colors.xml",
    "values/styles.xml",
    "values-night/colors.xml",
  ];

  for (const file of filesToCheck) {
    const filePath = path.join(resDir, file);
    if (await fs.pathExists(filePath)) {
      existingFiles.push(file);
    }
  }

  return existingFiles;
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

  // Generate light theme splash background with responsive logo
  const lightDrawableDir = path.join(resDir, "drawable");
  await fs.ensureDir(lightDrawableDir);

  const lightSplashDrawable = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Full screen background -->
    <item android:drawable="@color/splash_background" />
    
    <!-- Responsive centered logo -->
    <item>
        <bitmap
            android:gravity="center"
            android:src="@drawable/splash_logo"
            android:tileMode="disabled" />
    </item>
</layer-list>`;

  await fs.writeFile(
    path.join(lightDrawableDir, "splash_background.xml"),
    lightSplashDrawable
  );

  // Generate dark theme splash background with responsive logo
  const darkDrawableDir = path.join(resDir, "drawable-night");
  await fs.ensureDir(darkDrawableDir);

  const darkSplashDrawable = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Full screen background -->
    <item android:drawable="@color/splash_background" />
    
    <!-- Responsive centered logo -->
    <item>
        <bitmap
            android:gravity="center"
            android:src="@drawable/splash_logo"
            android:tileMode="disabled" />
    </item>
</layer-list>`;

  await fs.writeFile(
    path.join(darkDrawableDir, "splash_background.xml"),
    darkSplashDrawable
  );

  console.log(
    "🌓 Generated light/dark splash backgrounds with responsive layout"
  );
}

async function generateResponsiveSplashBackgrounds(
  resDir: string,
  config: any
) {
  console.log(
    "📱 Generating responsive splash backgrounds for different densities..."
  );

  // Define responsive sizes for different screen densities
  const responsiveConfig = {
    "drawable-sw320dp": {
      maxWidth: "25%",
      description: "Small screens (320dp+)",
    },
    "drawable-sw480dp": {
      maxWidth: "20%",
      description: "Normal screens (480dp+)",
    },
    "drawable-sw600dp": {
      maxWidth: "15%",
      description: "Large screens (600dp+)",
    },
    "drawable-sw720dp": {
      maxWidth: "12%",
      description: "XLarge screens (720dp+)",
    },
  };

  for (const [qualifier, config_item] of Object.entries(responsiveConfig)) {
    const drawableDir = path.join(resDir, qualifier);
    await fs.ensureDir(drawableDir);

    const responsiveSplashXml = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Full screen background -->
    <item android:drawable="@color/splash_background" />
    
    <!-- Responsive centered logo with adaptive sizing -->
    <item android:gravity="center">
        <bitmap
            android:src="@drawable/splash_logo"
            android:gravity="center"
            android:tileMode="disabled" />
    </item>
</layer-list>`;

    await fs.writeFile(
      path.join(drawableDir, "splash_screen.xml"),
      responsiveSplashXml
    );

    await fs.writeFile(
      path.join(drawableDir, "splash_background.xml"),
      responsiveSplashXml
    );

    console.log(`📐 Generated ${qualifier}: ${config_item.description}`);
  }

  // Also generate orientation-specific variants
  const orientationVariants = ["drawable-land", "drawable-port"];

  for (const variant of orientationVariants) {
    const variantDir = path.join(resDir, variant);
    await fs.ensureDir(variantDir);

    const orientationSplashXml = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Full screen background -->
    <item android:drawable="@color/splash_background" />
    
    <!-- Responsive centered logo optimized for ${
      variant.includes("land") ? "landscape" : "portrait"
    } -->
    <item android:gravity="center">
        <bitmap
            android:src="@drawable/splash_logo"
            android:gravity="center"
            android:tileMode="disabled" />
    </item>
</layer-list>`;

    await fs.writeFile(
      path.join(variantDir, "splash_screen.xml"),
      orientationSplashXml
    );

    console.log(
      `🔄 Generated ${variant}: ${
        variant.includes("land") ? "Landscape" : "Portrait"
      } orientation`
    );
  }

  console.log(
    "📱 Generated responsive splash backgrounds for all screen configurations"
  );
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

  // Use XmlMerger to merge with existing colors.xml instead of replacing
  await XmlMerger.mergeXmlFile(
    path.join(resDir, "values/colors.xml"),
    lightColorsXml,
    { preserveExisting: true, mergeBehavior: "merge" }
  );

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

  // Use XmlMerger for dark theme colors
  await XmlMerger.mergeXmlFile(
    path.join(resDir, "values-night/colors.xml"),
    darkColorsXml,
    { preserveExisting: true, mergeBehavior: "merge" }
  );

  console.log("🎨 Generated/merged light/dark color resources");
}

async function generateSplashDrawable(resDir: string) {
  // Generate responsive splash drawable with dynamic sizing based on screen density
  const splashDrawableXml = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Full screen background -->
    <item android:drawable="@color/splash_background" />
    
    <!-- Responsive centered logo - uses adaptive sizing -->
    <item android:gravity="center">
        <bitmap 
            android:src="@drawable/splash_logo"
            android:gravity="center"
            android:tileMode="disabled" />
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

  // Generate styles for splash screen with fullscreen configuration
  // Only generate the style content without XML declaration and resources wrapper
  const splashStylesContent = `    <style name="SplashTheme" parent="Theme.AppCompat.Light.NoActionBar">
        <item name="android:windowBackground">@drawable/splash_screen</item>
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowActionBar">false</item>
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowContentOverlay">@null</item>
        <item name="android:windowDrawsSystemBarBackgrounds">false</item>
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:windowTranslucentStatus">false</item>
        <item name="android:windowTranslucentNavigation">false</item>
        <item name="android:fitsSystemWindows">false</item>
        <item name="android:windowLayoutInDisplayCutoutMode" tools:targetApi="p">shortEdges</item>
    </style>
    
    <style name="SplashTheme.EdgeToEdge" parent="SplashTheme">
        <item name="android:windowDrawsSystemBarBackgrounds">true</item>
        <item name="android:statusBarColor">@color/splash_background</item>
        <item name="android:navigationBarColor">@color/splash_background</item>
        <item name="android:windowLightStatusBar" tools:targetApi="m">false</item>
        <item name="android:windowLightNavigationBar" tools:targetApi="o_mr1">false</item>
    </style>`;

  const stylesPath = path.join(resDir, "values/styles.xml");

  // Check if styles.xml already exists
  if (await fs.pathExists(stylesPath)) {
    console.log("📄 Found existing styles.xml - merging splash styles...");

    // Read existing content
    const existingContent = await fs.readFile(stylesPath, "utf-8");

    // Check if tools namespace is already declared
    const hasToolsNamespace = existingContent.includes(
      'xmlns:tools="http://schemas.android.com/tools"'
    );

    let updatedContent = existingContent;

    // Add tools namespace if not present
    if (!hasToolsNamespace) {
      updatedContent = updatedContent.replace(
        "<resources>",
        '<resources xmlns:tools="http://schemas.android.com/tools">'
      );
    }

    // Insert splash styles before closing </resources> tag
    updatedContent = updatedContent.replace(
      "</resources>",
      `\n${splashStylesContent}\n\n</resources>`
    );

    await fs.writeFile(stylesPath, updatedContent);
    console.log("🎭 Merged splash styles into existing styles.xml");
  } else {
    // Create new styles.xml with complete structure
    const completeStylesXml = `<?xml version="1.0" encoding="utf-8"?>
<resources xmlns:tools="http://schemas.android.com/tools">
${splashStylesContent}
</resources>`;

    await fs.writeFile(stylesPath, completeStylesXml);
    console.log("🎭 Created new styles.xml with splash styles");
  }

  console.log(
    "🎭 Generated responsive fullscreen splash screen drawable and styles"
  );
}

async function generateSplashLayout(resDir: string) {
  console.log("📱 Generating LinearLayout splash screens...");

  // Generate splash layout for all drawable variants
  const layoutXml = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:gravity="center"
    android:orientation="vertical"
    android:background="@color/splash_background">

    <ImageView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:src="@drawable/splash_logo" />

</LinearLayout>`;

  // Create layout directory
  const layoutDir = path.join(resDir, "layout");
  await fs.ensureDir(layoutDir);

  // Generate main layout
  await fs.writeFile(path.join(layoutDir, "activity_splash.xml"), layoutXml);

  // Generate responsive layouts for different screen sizes
  const responsiveLayouts = {
    "layout-sw320dp": "Small screens (320dp+)",
    "layout-sw480dp": "Normal screens (480dp+)",
    "layout-sw600dp": "Large screens (600dp+)",
    "layout-sw720dp": "XLarge screens (720dp+)",
    "layout-land": "Landscape orientation",
    "layout-port": "Portrait orientation",
  };

  for (const [layoutQualifier, description] of Object.entries(
    responsiveLayouts
  )) {
    const responsiveLayoutDir = path.join(resDir, layoutQualifier);
    await fs.ensureDir(responsiveLayoutDir);

    await fs.writeFile(
      path.join(responsiveLayoutDir, "activity_splash.xml"),
      layoutXml
    );

    console.log(`📐 Generated ${layoutQualifier}: ${description}`);
  }

  // Update styles to add SplashActivity style
  const stylesPath = path.join(resDir, "values/styles.xml");

  // Check if styles.xml already exists
  if (await fs.pathExists(stylesPath)) {
    console.log(
      "📄 Found existing styles.xml - updating splash layout styles..."
    );

    // Read existing content
    const existingContent = await fs.readFile(stylesPath, "utf-8");

    // Check if SplashActivity style already exists
    if (existingContent.includes('<style name="SplashActivity"')) {
      console.log("🎭 SplashActivity style already exists, skipping...");
    } else {
      // Insert SplashActivity style before closing </resources> tag
      const splashActivityStyle = `
    <style name="SplashActivity" parent="SplashTheme">
        <!-- Style specifically for splash activity using layout -->
    </style>`;

      const updatedContent = existingContent.replace(
        "</resources>",
        `${splashActivityStyle}\n\n</resources>`
      );

      await fs.writeFile(stylesPath, updatedContent);
      console.log("🎭 Added SplashActivity style to existing styles.xml");
    }
  }

  console.log(
    "📱 Generated LinearLayout splash screens with responsive layouts"
  );
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
