# LinearLayout Splash Screen Documentation

## Tổng quan

Đã thêm tính năng tạo splash screen sử dụng **LinearLayout** thay vì drawable layer-list. Điều này cho phép tạo splash screen với background color cấu hình và logo được căn giữa theo format layout XML truyền thống.

## 📱 Cấu trúc Layout

### **activity_splash.xml**
```xml
<?xml version="1.0" encoding="utf-8"?>
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

</LinearLayout>
```

## 🗂️ Files được tạo

### 1. Layout Files
```
layout/
└── activity_splash.xml           # Base splash layout

layout-sw320dp/
└── activity_splash.xml           # Small screens (320dp+)

layout-sw480dp/
└── activity_splash.xml           # Normal screens (480dp+)

layout-sw600dp/
└── activity_splash.xml           # Large screens/tablets (600dp+)

layout-sw720dp/
└── activity_splash.xml           # XLarge screens (720dp+)

layout-land/
└── activity_splash.xml           # Landscape orientation

layout-port/
└── activity_splash.xml           # Portrait orientation
```

### 2. Style Addition
```xml
<style name="SplashActivity" parent="SplashTheme">
    <!-- Style specifically for splash activity using layout -->
</style>
```

## 🎯 Đặc điểm chính

### 1. **LinearLayout Structure**
- ✅ `android:layout_width="match_parent"` - Full width
- ✅ `android:layout_height="match_parent"` - Full height  
- ✅ `android:gravity="center"` - Logo căn giữa
- ✅ `android:orientation="vertical"` - Vertical orientation
- ✅ `android:background="@color/splash_background"` - Background color cấu hình

### 2. **ImageView Properties**
- ✅ `android:layout_width="wrap_content"` - Responsive width
- ✅ `android:layout_height="wrap_content"` - Responsive height
- ✅ `android:src="@drawable/splash_logo"` - Logo source

### 3. **Responsive Design**
- ✅ Screen size variants (sw320dp, sw480dp, sw600dp, sw720dp)
- ✅ Orientation variants (land, port)
- ✅ Density-specific logo assets

## 🚀 Cách sử dụng

### **Option 1: Sử dụng Activity với Layout**

#### 1. Tạo SplashActivity
```kotlin
class SplashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)
        
        // Add splash logic here
        Handler(Looper.getMainLooper()).postDelayed({
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }, 2000)
    }
}
```

#### 2. Cập nhật AndroidManifest.xml
```xml
<activity
    android:name=".SplashActivity"
    android:theme="@style/SplashActivity"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>

<activity
    android:name=".MainActivity"
    android:theme="@style/AppTheme">
</activity>
```

### **Option 2: Sử dụng Drawable (Approach cũ)**

Tiếp tục sử dụng `SplashTheme` với `android:windowBackground="@drawable/splash_screen"`

## 🔧 Customization

### 1. **Thay đổi Layout**
Có thể customize layout trong `activity_splash.xml`:

```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:gravity="center"
    android:orientation="vertical"
    android:background="@color/splash_background">

    <!-- Thêm TextView title -->
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/app_name"
        android:textSize="24sp"
        android:textColor="@android:color/black"
        android:layout_marginBottom="16dp" />

    <!-- Logo -->
    <ImageView
        android:layout_width="120dp"
        android:layout_height="120dp"
        android:src="@drawable/splash_logo"
        android:scaleType="centerInside" />

    <!-- Thêm subtitle -->
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Welcome"
        android:textSize="16sp"
        android:textColor="@android:color/darker_gray"
        android:layout_marginTop="16dp" />

</LinearLayout>
```

### 2. **Screen-specific Customization**

#### Large screens (tablets):
```xml
<!-- layout-sw600dp/activity_splash.xml -->
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:gravity="center"
    android:orientation="vertical"
    android:background="@color/splash_background">

    <ImageView
        android:layout_width="200dp"
        android:layout_height="200dp"
        android:src="@drawable/splash_logo"
        android:scaleType="centerInside" />

</LinearLayout>
```

#### Landscape orientation:
```xml
<!-- layout-land/activity_splash.xml -->
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:gravity="center"
    android:orientation="horizontal"
    android:background="@color/splash_background">

    <ImageView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:src="@drawable/splash_logo" />

</LinearLayout>
```

## 🎨 Background Colors

Layout sử dụng `@color/splash_background` đã được cấu hình:

### Light theme:
```xml
<color name="splash_background">#FFFFFF</color>
```

### Dark theme:
```xml  
<color name="splash_background">#000000</color>
```

## 🔄 So sánh với Drawable Approach

| Aspect | LinearLayout | Drawable Layer-list |
|--------|-------------|-------------------|
| **Customization** | ✅ Flexible, easy to modify | ⚠️ Limited, XML only |
| **Animation** | ✅ Full animation support | ❌ No animation |
| **Complex UI** | ✅ Multiple views, text, etc. | ❌ Image only |
| **Performance** | ⚠️ Activity overhead | ✅ Faster, no activity |
| **Maintenance** | ✅ Standard Android layout | ⚠️ Drawable-specific |
| **Memory** | ⚠️ Activity + layout inflation | ✅ Minimal |

## 📱 Best Practices

### 1. **Performance Optimization**
```kotlin
class SplashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Disable window animations for faster startup
        overridePendingTransition(0, 0)
        
        setContentView(R.layout.activity_splash)
        
        // Navigate immediately or with minimal delay
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }
}
```

### 2. **Handle System UI**
```xml
<style name="SplashActivity" parent="SplashTheme">
    <item name="android:windowFullscreen">true</item>
    <item name="android:windowContentOverlay">@null</item>
    <item name="android:windowDrawsSystemBarBackgrounds">false</item>
</style>
```

### 3. **Memory Efficiency**
- Sử dụng vector drawables cho logo nếu có thể
- Optimize PNG sizes cho density-specific assets
- Avoid complex layouts trong splash screen

## 🎯 Ưu điểm của LinearLayout Approach

1. **🎨 Flexible Design**: Có thể thêm text, multiple images, animations
2. **📱 Responsive**: Automatic layout adjustment theo screen size
3. **🔧 Easy Customization**: Standard Android layout APIs
4. **🎭 Animation Support**: Full animation capabilities
5. **🌓 Theme Awareness**: Automatic light/dark theme support
6. **📐 Precise Control**: Exact positioning và sizing control

LinearLayout approach cung cấp maximum flexibility cho splash screen design trong khi vẫn maintain responsive behavior across all device types! 🚀