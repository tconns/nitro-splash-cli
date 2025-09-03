import fs from "fs-extra";
import path from "path";

interface IOSAssetConfig {
  size: number;
  scale: string;
  filename: string;
}

export async function generateIOS(config: any, logoDir: string) {
  console.log("🍏 Generating iOS assets...");
  const appName = config.iosAppName || "YourApp";
  const iosAssets = path.resolve(`ios/${appName}/Assets.xcassets`);

  // Generate SplashLogo imageset
  await generateSplashLogoImageset(iosAssets, logoDir);

  // Generate SplashBackground color set for light/dark mode
  await generateSplashBackgroundColorset(iosAssets, config);

  // Generate LaunchScreen storyboard
  await generateLaunchScreenStoryboard(path.resolve(`ios/${appName}`), config);

  console.log("🍏 iOS assets generated successfully");
}

async function generateSplashLogoImageset(assetsDir: string, logoDir: string) {
  const splashLogoDir = path.join(assetsDir, "SplashLogo.imageset");
  await fs.ensureDir(splashLogoDir);

  // iOS asset configurations
  const assetConfigs: IOSAssetConfig[] = [
    { size: 128, scale: "1x", filename: "logo.png" },
    { size: 256, scale: "2x", filename: "logo@2x.png" },
    { size: 512, scale: "3x", filename: "logo@3x.png" },
  ];

  // Copy logo files
  for (const config of assetConfigs) {
    const sourcePath = path.join(logoDir, `logo-${config.size}.png`);
    const destPath = path.join(splashLogoDir, config.filename);
    await fs.copyFile(sourcePath, destPath);
  }

  // Generate Contents.json for imageset
  const contentsJson = {
    images: assetConfigs.map((config) => ({
      idiom: "universal",
      filename: config.filename,
      scale: config.scale,
    })),
    info: {
      version: 1,
      author: "nitro-splash",
    },
  };

  await fs.writeJSON(path.join(splashLogoDir, "Contents.json"), contentsJson, {
    spaces: 2,
  });
  console.log("📱 Generated SplashLogo.imageset");
}

async function generateSplashBackgroundColorset(
  assetsDir: string,
  config: any
) {
  const colorsetDir = path.join(assetsDir, "SplashBackground.colorset");
  await fs.ensureDir(colorsetDir);

  // Convert hex colors to RGB components
  const lightRGB = hexToRGB(config.backgroundLight);
  const darkRGB = hexToRGB(config.backgroundDark);

  const contentsJson = {
    colors: [
      {
        idiom: "universal",
        color: {
          "color-space": "srgb",
          components: {
            red: (lightRGB.r / 255).toFixed(3),
            green: (lightRGB.g / 255).toFixed(3),
            blue: (lightRGB.b / 255).toFixed(3),
            alpha: "1.000",
          },
        },
      },
      {
        idiom: "universal",
        appearances: [
          {
            appearance: "luminosity",
            value: "dark",
          },
        ],
        color: {
          "color-space": "srgb",
          components: {
            red: (darkRGB.r / 255).toFixed(3),
            green: (darkRGB.g / 255).toFixed(3),
            blue: (darkRGB.b / 255).toFixed(3),
            alpha: "1.000",
          },
        },
      },
    ],
    info: {
      version: 1,
      author: "nitro-splash",
    },
  };

  await fs.writeJSON(path.join(colorsetDir, "Contents.json"), contentsJson, {
    spaces: 2,
  });
  console.log(
    "🎨 Generated SplashBackground.colorset with light/dark variants"
  );
}

async function generateLaunchScreenStoryboard(iosDir: string, config: any) {
  const storyboardPath = path.join(iosDir, "LaunchScreen.storyboard");

  const storyboardXML = `<?xml version="1.0" encoding="UTF-8"?>
<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0" toolsVersion="21507" targetRuntime="iOS.CocoaTouch" propertyAccessControl="none" useAutolayout="YES" launchScreen="YES" useTraitCollections="YES" useSafeAreas="YES" colorMatched="YES" initialViewController="01J-lp-oVM">
    <device id="retina6_12" orientation="portrait" appearance="light"/>
    <dependencies>
        <deployment identifier="iOS"/>
        <plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="21505"/>
        <capability name="Named colors" minToolsVersion="9.0"/>
        <capability name="Safe area layout guides" minToolsVersion="9.0"/>
        <capability name="documents saved in the Xcode 8 format" minToolsVersion="8.0"/>
    </dependencies>
    <scenes>
        <!--View Controller-->
        <scene sceneID="EHf-IW-A2E">
            <objects>
                <viewController id="01J-lp-oVM" sceneMemberID="viewController">
                    <view key="view" contentMode="scaleToFill" id="Ze5-6b-2t3">
                        <rect key="frame" x="0.0" y="0.0" width="393" height="852"/>
                        <autoresizingMask key="autoresizingMask" widthSizable="YES" heightSizable="YES"/>
                        <subviews>
                            <imageView clipsSubviews="YES" userInteractionEnabled="NO" contentMode="scaleAspectFit" horizontalHuggingPriority="251" verticalHuggingPriority="251" image="SplashLogo" translatesAutoresizingMaskIntoConstraints="NO" id="tWc-Dc-tq4">
                                <rect key="frame" x="146.66666666666666" y="376" width="100" height="100"/>
                                <constraints>
                                    <constraint firstAttribute="width" constant="100" id="6Ac-72-jjh"/>
                                    <constraint firstAttribute="height" constant="100" id="sKL-P1-W6d"/>
                                </constraints>
                            </imageView>
                        </subviews>
                        <viewLayoutMarginsForRootView key="viewLayoutMarginsForRootView" insetsLayoutMarginsFromSafeArea="NO"/>
                        <color key="backgroundColor" name="SplashBackground"/>
                        <constraints>
                            <constraint firstItem="tWc-Dc-tq4" firstAttribute="centerX" secondItem="Ze5-6b-2t3" secondAttribute="centerX" id="6x1-XN-KhF"/>
                            <constraint firstItem="tWc-Dc-tq4" firstAttribute="centerY" secondItem="Ze5-6b-2t3" secondAttribute="centerY" id="exs-HZ-hh7"/>
                        </constraints>
                    </view>
                </viewController>
                <placeholder placeholderIdentifier="IBFirstResponder" id="iYj-Kq-Ea1" userLabel="First Responder" sceneMemberID="firstResponder"/>
            </objects>
            <point key="canvasLocation" x="52.671755725190835" y="374.64788732394368"/>
        </scene>
    </scenes>
    <resources>
        <image name="SplashLogo" width="100" height="100"/>
        <namedColor name="SplashBackground">
            <color red="1" green="1" blue="1" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>
        </namedColor>
    </resources>
</document>`;

  await fs.writeFile(storyboardPath, storyboardXML);
  console.log("📋 Generated LaunchScreen.storyboard with dynamic colors");
}

function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 255, b: 255 };
}
