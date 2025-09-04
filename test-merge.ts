import { XmlMerger } from "./src/utils/xml-merger";
import path from "path";

async function testXmlMerge() {
  console.log("🧪 Testing XML Merge functionality...");

  const testFile = path.join(
    __dirname,
    "example/android/app/src/main/res/values/styles_fresh_test.xml"
  );

  // New splash styles to merge
  const newStylesXml = `<?xml version="1.0" encoding="utf-8"?>
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

  try {
    console.log("📂 Original file exists, will merge...");

    // Create backup first
    const backupPath = await XmlMerger.createBackup(testFile);
    if (backupPath) {
      console.log(`💾 Backup created: ${backupPath}`);
    }

    // Merge the styles
    await XmlMerger.mergeXmlFile(testFile, newStylesXml, {
      preserveExisting: true,
      mergeBehavior: "merge",
    });

    console.log("✅ Merge completed successfully!");
    console.log("🔍 Check the file to see merged content");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testXmlMerge();
