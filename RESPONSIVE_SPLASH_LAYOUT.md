# Responsive Splash Screen Layout Documentation

## Tổng quan

Đã cập nhật `splash_screen.xml` và `splash_background.xml` để có layout responsive và fullscreen với các đặc điểm sau:

### 🎯 Các cải tiến chính

1. **Layout Full màn hình**: Background color phủ toàn bộ màn hình
2. **Logo responsive**: Logo sẽ tự động scale theo từng loại màn hình thay vì có kích thước cố định
3. **Hỗ trợ multi-density**: Tạo assets cho từng density khác nhau (ldpi, mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
4. **Responsive breakpoints**: Tạo layouts riêng cho các kích thước màn hình khác nhau
5. **Orientation support**: Hỗ trợ riêng cho landscape và portrait
6. **Theme-aware**: Hỗ trợ light/dark theme với background color có thể cấu hình

## 📱 Cấu trúc files được tạo

### 1. Base Drawable Files
```
drawable/
├── splash_screen.xml      # Layout chính với responsive logo
└── splash_background.xml  # Background variant

drawable-night/
├── splash_screen.xml      # Dark theme variant
└── splash_background.xml  # Dark theme background
```

### 2. Screen Size Responsive Files
```
drawable-sw320dp/          # Small screens (320dp+)
├── splash_screen.xml
└── splash_background.xml

drawable-sw480dp/          # Normal screens (480dp+)
├── splash_screen.xml  
└── splash_background.xml

drawable-sw600dp/          # Large screens (600dp+) - tablets
├── splash_screen.xml
└── splash_background.xml

drawable-sw720dp/          # XLarge screens (720dp+) - large tablets
├── splash_screen.xml
└── splash_background.xml
```

### 3. Orientation-specific Files
```
drawable-land/             # Landscape orientation
└── splash_screen.xml

drawable-port/             # Portrait orientation  
└── splash_screen.xml
```

### 4. Density-specific Logo Assets
```
drawable-ldpi/splash_logo.png    # 64px - Low density (~120dpi)
drawable-mdpi/splash_logo.png    # 128px - Medium density (~160dpi)  
drawable-hdpi/splash_logo.png    # 192px - High density (~240dpi)
drawable-xhdpi/splash_logo.png   # 256px - Extra-high density (~320dpi)
drawable-xxhdpi/splash_logo.png  # 512px - Extra-extra-high density (~480dpi)
drawable-xxxhdpi/splash_logo.png # 1024px - Extra-extra-extra-high density (~640dpi)
```

## 🎨 Layout Structure

### XML Layout Pattern
```xml
<?xml version="1.0" encoding="utf-8"?>
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
</layer-list>
```

### Key Features:
- **`android:gravity="center"`**: Logo được căn giữa màn hình
- **`android:tileMode="disabled"`**: Ngăn logo bị repeat
- **Không có kích thước cố định**: Logo sẽ sử dụng kích thước tự nhiên từ assets
- **Background color configurable**: Sử dụng `@color/splash_background` có thể cấu hình

## 🎭 Style Configuration

### SplashTheme
```xml
<style name="SplashTheme" parent="Theme.AppCompat.Light.NoActionBar">
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
```

### SplashTheme.EdgeToEdge (Modern Android)
```xml
<style name="SplashTheme.EdgeToEdge" parent="SplashTheme">
    <item name="android:windowDrawsSystemBarBackgrounds">true</item>
    <item name="android:statusBarColor">@color/splash_background</item>
    <item name="android:navigationBarColor">@color/splash_background</item>
    <item name="android:windowLightStatusBar" tools:targetApi="m">false</item>
    <item name="android:windowLightNavigationBar" tools:targetApi="o_mr1">false</item>
</style>
```

## 🔧 Cấu hình

### Colors (Light Theme)
```xml
<color name="splash_background">#FFFFFF</color>
```

### Colors (Dark Theme)
```xml  
<color name="splash_background">#000000</color>
```

## 📐 Responsive Behavior

### 1. **Logo Scaling**
- Logo sẽ tự động sử dụng kích thước phù hợp với density của màn hình
- Không có kích thước cố định, tránh bị vỡ layout trên các màn hình khác nhau

### 2. **Screen Size Adaptation**
- **Small screens (320dp+)**: Sử dụng layout tối ưu cho điện thoại nhỏ
- **Normal screens (480dp+)**: Layout tiêu chuẩn cho hầu hết điện thoại
- **Large screens (600dp+)**: Tối ưu cho tablet nhỏ và điện thoại lớn
- **XLarge screens (720dp+)**: Tối ưu cho tablet lớn

### 3. **Orientation Support**
- **Portrait**: Layout tối ưu cho chế độ dọc
- **Landscape**: Layout tối ưu cho chế độ ngang

### 4. **Density Independence**
- Mỗi density có logo riêng với kích thước phù hợp
- Đảm bảo logo luôn sắc nét trên mọi màn hình

## 🚀 Ưu điểm

1. **Responsive Design**: Tự động adapt với mọi kích thước màn hình
2. **Performance**: Sử dụng assets tối ưu cho từng density
3. **Modern Android Support**: Hỗ trợ edge-to-edge display, display cutout
4. **Theme Consistency**: Tự động chuyển đổi light/dark theme
5. **Maintainable**: Code dễ bảo trì và cấu hình
6. **Cross-device Compatibility**: Hoạt động tốt trên mọi thiết bị Android

## 📱 Testing

Để test layout responsive:

1. **Emulator Testing**: Test trên nhiều kích thước và density khác nhau
2. **Orientation Testing**: Xoay màn hình để test layout landscape/portrait  
3. **Theme Testing**: Chuyển đổi light/dark mode
4. **Device Testing**: Test trên thiết bị thật với các kích thước màn hình khác nhau

## 🔮 Future Enhancements

1. **Animated Splash**: Có thể thêm animation cho logo
2. **Brand Color Variants**: Thêm nhiều color schemes
3. **Logo Variants**: Hỗ trợ nhiều logo variants cho different contexts
4. **API Level Specific**: Tối ưu cho specific Android API levels