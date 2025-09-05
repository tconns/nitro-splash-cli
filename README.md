# Nitro Splash - Enhanced Asset Generator

Hệ thống codegen nâng cao để tạo ra bộ assets icon và splash screen với nhiều kích thước khác nhau, hỗ trợ chế độ light/dark cho React Native.

## 🚀 Tính năng chính

### ✨ Asset Generation
- **Multi-size Support**: Tạo assets từ 16px đến 2048px
- **Multi-format**: PNG, WebP (SVG và ICO đang phát triển)
- **Multi-theme**: Light, Dark, Branded, và custom themes
- **Multi-platform**: iOS, Android, Web

### 🎨 Theme Support
- **Light Mode**: Nền trắng, chữ đen
- **Dark Mode**: Nền đen, chữ trắng  
- **Branded Themes**: Tùy chỉnh màu brand
- **Custom Themes**: Purple, Green, Blue và nhiều hơn nữa

### 📱 Platform-specific Assets

#### iOS Assets
- `SplashLogo.imageset` - Logo với 1x, 2x, 3x densities
- `SplashBackground.colorset` - Dynamic colors cho light/dark mode
- `LaunchScreen.storyboard` - Launch screen với auto-layout

#### Android Assets  
- `drawable-*` - Logo cho các density khác nhau (ldpi đến xxxhdpi)
- `values/colors.xml` - Light theme colors
- `values-night/colors.xml` - Dark theme colors
- `drawable/splash_screen.xml` - Splash screen drawable
- Adaptive icons support

#### Web Assets
- Favicons (16px, 32px, 48px)
- PWA icons (192px, 512px)
- App store assets

## 📋 Cách sử dụng

### Quick Start
```bash
# Khởi tạo cấu hình cơ bản
nitro-splash init --name MyApp --logo ./assets/logo.png

# Tạo assets
nitro-splash generate

# Xem thông tin
nitro-splash info
```

### Advanced Usage
```bash
# Khởi tạo cấu hình nâng cao
nitro-splash advanced init -n MyApp -p com.example.myapp

# Tạo assets cho nhiều theme
nitro-splash advanced generate-themes -t light dark branded purple

# Tạo assets cho platform cụ thể
nitro-splash advanced generate-platform -p ios

# Validate assets đã tạo
nitro-splash advanced validate
```

## 🛠️ Cấu hình

### Basic Configuration (`splash.config.json`)
```json
{
  "logo": "./assets/logo.png",
  "backgroundLight": "#FFFFFF",
  "backgroundDark": "#000000",
  "iosAppName": "MyApp",
  "platforms": ["ios", "android", "web"]
}
```

### Advanced Configuration
```json
{
  "logo": "./assets/logo.png",
  "backgroundLight": "#FFFFFF", 
  "backgroundDark": "#000000",
  "iosAppName": "MyApp",
  "androidPackageName": "com.example.myapp",
  
  "sizes": {
    "mobile": [64, 128, 192, 256, 512],
    "desktop": [16, 32, 48, 64, 128, 256],
    "web": [32, 48, 72, 96, 144, 192, 256, 512],
    "all": [16, 32, 48, 64, 72, 96, 128, 144, 192, 256, 512, 1024, 2048]
  },
  
  "platforms": ["ios", "android", "web"],
  "outputFormats": ["png", "webp"],
  
  "themes": {
    "light": {
      "background": "#FFFFFF",
      "foreground": "#000000", 
      "accent": "#007AFF"
    },
    "dark": {
      "background": "#000000",
      "foreground": "#FFFFFF",
      "accent": "#0A84FF" 
    },
    "branded": {
      "background": "#007AFF",
      "foreground": "#FFFFFF",
      "accent": "#FFFFFF"
    }
  },
  
  "ios": {
    "launchScreen": {
      "generateStoryboard": true,
      "logoSize": 100,
      "centerLogo": true
    },
    "assets": {
      "generateColorsets": true,
      "generateImagesets": true
    }
  },
  
  "android": {
    "densities": ["ldpi", "mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"],
    "generateAdaptiveIcons": true,
    "splashScreenApi": "androidx",
    "drawableNight": true
  },
  
  "web": {
    "generatePWAIcons": true,
    "generateFavicons": true,
    "generateManifest": true
  }
}
```

## 📁 Cấu trúc Assets được tạo

```
splash-build/
├── asset-manifest.json          # Asset metadata
├── logo-*.png                   # Logo trong nhiều kích thước
├── logo-*.webp                  # Logo format WebP
├── theme-light/                 # Light theme splash screens
│   └── splash-*.png
├── theme-dark/                  # Dark theme splash screens  
│   └── splash-*.png
├── ios/                         # iOS multi-theme assets
│   ├── light/
│   ├── dark/
│   └── branded/
├── android/                     # Android multi-theme assets
│   ├── light/
│   ├── dark/
│   └── branded/
├── web/                         # Web multi-theme assets
│   ├── light/
│   ├── dark/
│   └── branded/
├── icons/                       # Standalone icons
│   └── icon-*.png
├── adaptive/                    # Android adaptive icons
│   ├── ic_launcher_foreground.png
│   └── ic_launcher_background.png
└── appstore/                    # App store assets
    ├── ios-appstore-1024.png
    ├── ios-app-icon-180.png
    ├── google-play-512.png
    └── android-app-icon-192.png
```

## 🔧 Integration

### iOS Integration
1. Add assets vào Xcode project:
   ```
   Assets.xcassets/
   ├── SplashLogo.imageset/
   └── SplashBackground.colorset/
   ```

2. Set LaunchScreen.storyboard làm launch screen

3. Configure Info.plist:
   ```xml
   <key>UILaunchStoryboardName</key>
   <string>LaunchScreen</string>
   <key>UIUserInterfaceStyle</key>
   <string>Automatic</string>
   ```

### Android Integration
1. Copy resources vào `android/app/src/main/res/`:
   ```
   res/
   ├── drawable-*/splash_logo.png
   ├── values/colors.xml
   ├── values-night/colors.xml
   └── drawable/splash_screen.xml
   ```

2. Update MainActivity để sử dụng SplashTheme

3. Add dependencies vào build.gradle:
   ```gradle
   implementation 'androidx.core:core-splashscreen:1.0.1'
   ```

### React Native Integration
```typescript
import SplashScreen from 'react-native-splash-screen';

// Hide splash screen khi app ready
useEffect(() => {
  SplashScreen.hide();
}, []);
```

## 🎯 Advanced Features

### Multi-theme Generation
Tạo assets cho nhiều theme cùng lúc:
```bash
nitro-splash advanced generate-themes -t light dark branded purple green
```

### Platform-specific Generation  
Tạo assets cho platform cụ thể:
```bash
nitro-splash advanced generate-platform -p ios
nitro-splash advanced generate-platform -p android
```

### Asset Validation
Kiểm tra tính hợp lệ của assets:
```bash
nitro-splash advanced validate
```

### Custom Themes
Tạo themes tùy chỉnh trong config:
```json
{
  "themes": {
    "custom": {
      "background": "#FF6B6B",
      "foreground": "#FFFFFF", 
      "accent": "#4ECDC4"
    }
  }
}
```

## 📊 Asset Optimization

- **File Size**: Tối ưu bằng Sharp image processing
- **Platform Requirements**: Tuân thủ iOS HIG và Material Design
- **Performance**: Độ phân giải phù hợp cho từng density
- **Quality**: Lossless compression cho PNG, lossy cho WebP

## 🐛 Troubleshooting

### iOS Issues
- Đảm bảo LaunchScreen.storyboard được set trong project settings
- Verify SplashBackground colorset có appearance variants
- Check SplashLogo imageset có đủ 1x, 2x, 3x scales

### Android Issues  
- Kiểm tra drawable resources ở đúng density folders
- Verify SplashTheme được apply cho MainActivity
- Đảm bảo values-night folder tồn tại cho dark theme

### Build Issues
- Ensure Sharp dependencies được cài đặt: `npm install sharp`
- Check logo file path trong config
- Verify output directory permissions

## 🔄 Development Workflow

### Watch Mode
```bash
# Auto-generate khi assets thay đổi
chokidar 'assets/**/*' -c 'nitro-splash generate'
```

### NPM Scripts
```json
{
  "scripts": {
    "splash:generate": "nitro-splash generate",
    "splash:clean": "rimraf splash-build", 
    "splash:build": "npm run splash:clean && npm run splash:generate",
    "splash:watch": "chokidar 'assets/**/*' -c 'npm run splash:generate'"
  }
}
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Generate Splash Assets
  run: |
    npm install
    npm run splash:generate
    
- name: Validate Assets
  run: nitro-splash advanced validate
```

## 📈 Future Enhancements

- [ ] SVG output support
- [ ] ICO format support  
- [ ] Animated splash screens
- [ ] Video splash support
- [ ] React Native Web integration
- [ ] Expo integration
- [ ] Custom logo positioning
- [ ] Gradient backgrounds
- [ ] Logo masks và effects

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Add tests cho new features
4. Update documentation
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Made with ❤️ for React Native developers**

Hệ thống này giúp bạn tạo ra bộ assets hoàn chỉnh cho ứng dụng React Native với chỉ một lệnh duy nhất, hỗ trợ đầy đủ cho chế độ light/dark và tất cả các platform phổ biến.

          
<a href="https://www.buymeacoffee.com/tconns94" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="200"/>
</a>
