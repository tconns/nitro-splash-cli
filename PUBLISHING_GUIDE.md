# 📦 Publishing Guide - Nitro Splash CLI

## 🚀 Hướng dẫn publish dự án lên NPM

Hướng dẫn chi tiết để publish `nitro-splash-cli` lên npm registry để cộng đồng có thể sử dụng qua `npx nitro-splash`.

## 🔧 Chuẩn bị publish

### 1. **Kiểm tra package.json**

Đảm bảo các thông tin sau trong `package.json`:

```json
{
  "name": "@yourusername/nitro-splash",  // Hoặc "nitro-splash-cli" nếu chưa có ai sử dụng
  "version": "1.0.0",
  "description": "CLI tool to generate responsive splash screen assets for React Native",
  "main": "dist/index.js",
  "bin": {
    "nitro-splash": "dist/index.js"
  },
  "keywords": [
    "react-native",
    "splash-screen", 
    "cli",
    "assets",
    "responsive",
    "android",
    "ios"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/nitro-splash-cli.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/nitro-splash-cli/issues"
  },
  "homepage": "https://github.com/yourusername/nitro-splash-cli#readme",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "engines": {
    "node": ">=14.0.0"
  }
}
```

### 2. **Tạo file LICENSE**

```text
MIT License

Copyright (c) 2025 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 3. **Cập nhật .gitignore**

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Distribution
dist/

# Testing
coverage/

# Environment
.env
.env.local
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Examples/temp
example/splash-build/
example/android/app/src/main/res/drawable*/
example/android/app/src/main/res/layout*/
example/android/app/src/main/res/values/styles.xml.backup.*
example/ios/ReactNativeApp/Assets.xcassets/SplashLogo.imageset/
example/ios/ReactNativeApp/Assets.xcassets/SplashBackground.colorset/

# Build artifacts
*.tgz
*.tar.gz
```

### 4. **Tạo .npmignore**

```gitignore
# Source files
src/
tsconfig.json
test-merge.ts

# Examples
example/

# Documentation (specific)
LINEAR_LAYOUT_SPLASH.md
MERGE_STYLES_LOGIC.md
RESPONSIVE_SPLASH_LAYOUT.md

# Development
.git/
.gitignore
yarn.lock

# Testing
coverage/
*.test.js
*.spec.js

# IDE
.vscode/
.idea/
```

## 🏗️ Build và test

### 1. **Build project**

```bash
# Clean và build
npm run clean
npm run build

# Verify build output
ls -la dist/
```

### 2. **Test local installation**

```bash
# Link package locally
npm link

# Test global command
nitro-splash --version
nitro-splash --help

# Test generation
cd example
nitro-splash generate

# Unlink khi test xong
npm unlink -g nitro-splash
```

### 3. **Test package contents**

```bash
# Xem contents sẽ được publish
npm pack

# Extract và kiểm tra
tar -tzf nitro-splash-1.0.0.tgz
```

## 📤 Publishing Steps

### 1. **Đăng ký npm account**

```bash
# Đăng ký tại https://www.npmjs.com/signup
# Hoặc login nếu đã có account
npm login
```

### 2. **Kiểm tra package name availability**

```bash
# Kiểm tra tên có available không
npm view nitro-splash-cli
# Nếu trả về error = available
# Nếu trả về info = đã được sử dụng

# Alternative names nếu bị trùng:
# - @yourusername/nitro-splash
# - nitro-splash-generator  
# - react-native-splash-cli
# - splash-assets-cli
```

### 3. **Update version và publish**

```bash
# Cập nhật version (theo semantic versioning)
npm version patch   # 1.0.0 -> 1.0.1
npm version minor   # 1.0.0 -> 1.1.0  
npm version major   # 1.0.0 -> 2.0.0

# Hoặc manual update trong package.json

# Build và publish
npm run build
npm publish

# Nếu là scoped package
npm publish --access public
```

### 4. **Verify publication**

```bash
# Kiểm tra package đã được publish
npm view nitro-splash-cli

# Test installation từ npm
npm install -g nitro-splash-cli
nitro-splash --version

# Test với npx
npx nitro-splash-cli --help
```

## 🎯 Post-publish Steps

### 1. **Tạo GitHub Release**

```bash
# Tag version
git tag v1.0.0
git push origin v1.0.0

# Create release trên GitHub với:
# - Release notes
# - Binary attachments (nếu có)
# - Documentation links
```

### 2. **Update documentation**

```markdown
## Installation

```bash
# Global installation
npm install -g nitro-splash-cli

# Or use with npx (recommended)
npx nitro-splash-cli generate
```

## Usage

```bash
# Initialize config
npx nitro-splash-cli init

# Generate assets  
npx nitro-splash-cli generate

# Advanced features
npx nitro-splash-cli advanced generate-themes -t light dark
```
```

### 3. **Marketing & Community**

1. **Social Media**:
   - Tweet about the release
   - Post trên LinkedIn
   - Share trong React Native communities

2. **Communities**:
   - React Native community Discord/Slack
   - r/reactnative subreddit
   - Dev.to blog post
   - Medium article

3. **Documentation sites**:
   - React Native directory
   - Awesome React Native lists

## 🔄 Maintenance Workflow

### 1. **Regular updates**

```bash
# Fix bugs
git checkout -b fix/issue-description
# Make changes
npm run build
npm run test
git commit -m "fix: description"
git push origin fix/issue-description

# Create PR, merge, then:
npm version patch
npm publish
```

### 2. **Feature releases**

```bash
git checkout -b feature/new-feature
# Develop feature
npm run build
npm run test
git commit -m "feat: new feature description"

# After merge:
npm version minor
npm publish
```

### 3. **Breaking changes**

```bash
# Major version for breaking changes
npm version major
npm publish

# Update README với migration guide
```

## 📊 Monitoring

### 1. **Download statistics**

```bash
# Check download stats
npm view nitro-splash-cli

# Monitor trên npmjs.com dashboard
```

### 2. **User feedback**

- Monitor GitHub issues
- Respond to npm comments
- Track social media mentions

### 3. **Dependency updates**

```bash
# Regular dependency updates
npm audit
npm update
npm run build
npm run test

# Major dependency updates
npm outdated
```

## 🚨 Troubleshooting

### Common publish issues:

1. **403 Forbidden**:
   ```bash
   npm login
   npm whoami  # Verify login
   ```

2. **Package name conflicts**:
   ```bash
   # Use scoped packages
   npm init --scope=@yourusername
   ```

3. **Version conflicts**:
   ```bash
   # Check current version
   npm view nitro-splash-cli version
   npm version patch --force
   ```

4. **File permissions**:
   ```bash
   chmod +x dist/index.js
   ```

## 🎉 Success Metrics

### Goals sau khi publish:

- [ ] Package successfully published
- [ ] `npx nitro-splash-cli` works globally
- [ ] Documentation complete
- [ ] First 100 downloads
- [ ] Community feedback
- [ ] Zero critical bugs

### Long-term goals:

- [ ] 1000+ weekly downloads
- [ ] Community contributions
- [ ] Feature requests và implementations
- [ ] Integration với popular React Native tools

## 📝 Example Commands for Users

Sau khi publish, users sẽ có thể:

```bash
# Quick start
npx nitro-splash-cli init
npx nitro-splash-cli generate

# Advanced usage
npx nitro-splash-cli advanced init -n MyApp
npx nitro-splash-cli advanced generate-themes -t light dark branded

# Global installation
npm install -g nitro-splash-cli
nitro-splash generate
```

---

**🎯 Publishing checklist:**

- [ ] Package.json updated với correct info
- [ ] README.md comprehensive
- [ ] LICENSE file created
- [ ] .npmignore configured
- [ ] Build successful
- [ ] Local testing passed
- [ ] npm login successful
- [ ] Package name available
- [ ] Version bumped
- [ ] npm publish successful
- [ ] npx command verified
- [ ] GitHub release created
- [ ] Documentation updated

Happy publishing! 🚀