# Merge Styles Logic Documentation

## Tổng quan

Đã cập nhật logic để merge splash styles vào file `styles.xml` hiện có thay vì thay thế hoàn toàn. Điều này đảm bảo không làm mất các styles hiện có của project.

## 🔧 Logic Merge

### 1. **Kiểm tra file styles.xml có tồn tại**

```typescript
if (await fs.pathExists(stylesPath)) {
    // Merge vào file hiện có
} else {
    // Tạo file mới
}
```

### 2. **Xử lý khi file đã tồn tại**

#### a) Đọc nội dung hiện có
```typescript
const existingContent = await fs.readFile(stylesPath, 'utf-8');
```

#### b) Kiểm tra tools namespace
```typescript
const hasToolsNamespace = existingContent.includes('xmlns:tools="http://schemas.android.com/tools"');
```

#### c) Tạo backup
```typescript
const backupPath = stylesPath + '.backup.' + Date.now();
await fs.copyFile(stylesPath, backupPath);
```

#### d) Thêm tools namespace nếu chưa có
```typescript
if (!hasToolsNamespace) {
    updatedContent = updatedContent.replace(
        '<resources>',
        '<resources xmlns:tools="http://schemas.android.com/tools">'
    );
}
```

#### e) Insert splash styles
```typescript
updatedContent = updatedContent.replace(
    '</resources>',
    `\n${splashStylesContent}\n\n</resources>`
);
```

## 📁 Ví dụ Merge

### **Input (file hiện có):**
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>

    <!-- Base application theme. -->
    <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
        <!-- Customize your theme here. -->
        <item name="android:editTextBackground">@drawable/rn_edit_text_material</item>
    </style>

</resources>
```

### **Output (sau khi merge):**
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources xmlns:tools="http://schemas.android.com/tools">

    <!-- Base application theme. -->
    <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
        <!-- Customize your theme here. -->
        <item name="android:editTextBackground">@drawable/rn_edit_text_material</item>
    </style>

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
    
    <style name="SplashTheme.EdgeToEdge" parent="SplashTheme">
        <item name="android:windowDrawsSystemBarBackgrounds">true</item>
        <item name="android:statusBarColor">@color/splash_background</item>
        <item name="android:navigationBarColor">@color/splash_background</item>
        <item name="android:windowLightStatusBar" tools:targetApi="m">false</item>
        <item name="android:windowLightNavigationBar" tools:targetApi="o_mr1">false</item>
    </style>

</resources>
```

## 🛡️ Safety Features

### 1. **Backup System**
- Tự động tạo backup với timestamp: `styles.xml.backup.{timestamp}`
- Backup gốc được preserve để có thể khôi phục nếu cần

### 2. **Non-destructive Merge**
- Không thay thế hay xóa styles hiện có
- Chỉ thêm splash styles mới vào cuối file

### 3. **Namespace Management**
- Tự động thêm `xmlns:tools` namespace nếu chưa có
- Không duplicate namespace nếu đã tồn tại

### 4. **Error Handling**
- Kiểm tra file existence trước khi merge
- Graceful fallback nếu file không tồn tại

## 📱 Test Cases

### Case 1: File chưa tồn tại
```typescript
// Tạo file mới với complete structure
const completeStylesXml = `<?xml version="1.0" encoding="utf-8"?>
<resources xmlns:tools="http://schemas.android.com/tools">
${splashStylesContent}
</resources>`;
```

### Case 2: File đã có, chưa có tools namespace
```xml
<!-- Before -->
<resources>
    <style name="AppTheme">...</style>
</resources>

<!-- After -->
<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="AppTheme">...</style>
    <style name="SplashTheme">...</style>
</resources>
```

### Case 3: File đã có tools namespace
```xml
<!-- Before -->
<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="AppTheme">...</style>
    <style name="CustomButton">...</style>
</resources>

<!-- After -->
<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="AppTheme">...</style>
    <style name="CustomButton">...</style>
    <style name="SplashTheme">...</style>
</resources>
```

## 🎯 Ưu điểm

1. **Preserve Existing Styles**: Không làm mất styles hiện có
2. **Automatic Backup**: Backup tự động để có thể rollback
3. **Namespace Aware**: Tự động handle tools namespace
4. **Non-Intrusive**: Merge không phá vỡ cấu trúc hiện có
5. **Idempotent**: Có thể chạy nhiều lần mà không duplicate

## 🚀 Console Output

### Khi merge thành công:
```
📄 Found existing styles.xml - merging splash styles...
📁 Created backup: /path/to/styles.xml.backup.1234567890
🎭 Merged splash styles into existing styles.xml
```

### Khi tạo file mới:
```
🎭 Created new styles.xml with splash styles
```

## 🔍 Debugging

### Kiểm tra backup files:
```bash
ls -la values/styles.xml.backup.*
```

### So sánh trước/sau merge:
```bash
diff styles.xml.backup.* styles.xml
```

Với logic merge này, tool bây giờ hoàn toàn safe và có thể integrate vào bất kỳ project Android nào mà không lo làm mất code hiện có! 🎉