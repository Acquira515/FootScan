# Windows Installer Guide

## Using the Pre-built Installer

### System Requirements
- Windows 10 or later (64-bit)
- 2GB RAM minimum
- 500MB disk space
- Internet connection for first launch (API configuration)

### Installation Steps

1. **Download** the installer:
   - Get `Football Prediction Setup.exe` from the releases page

2. **Run the installer**:
   - Double-click `Football Prediction Setup.exe`
   - Click "Install" when prompted

3. **Choose installation path**:
   - Default: `C:\Program Files\Football Prediction`
   - Can customize if desired

4. **Wait for installation**:
   - Files are extracted and configured
   - Takes 1-2 minutes

5. **Launch the app**:
   - Option A: Click "Launch now" after installation
   - Option B: Use desktop shortcut
   - Option C: Open from Start Menu

### First-Time Setup

1. **Configure API Keys**:
   - Go to Settings tab
   - Add your API keys:
     - Football API: https://www.football-data.org/
     - News API: https://newsapi.org/
     - LLM API: https://openai.com/ (optional)
   - Click "Save Settings"

2. **Test Connection**:
   - Go to Home tab
   - Click "Refresh Status"
   - Should show "API Status: OK"

3. **Start Predicting**:
   - Go to Predict tab
   - Select league and time period
   - Click "Predict All"

## Building Custom Installer

### Prerequisites
- Windows 10/11
- Node.js 16+
- Python 3.8+
- Git

### Step-by-Step Build

1. **Clone repository**:
```bash
git clone https://github.com/yourrepo/FootScan.git
cd FootScan
```

2. **Configure environment**:
```bash
# Create .env file
copy backend\app\.env.example backend\app\.env

# Edit with your API keys
notepad backend\app\.env
```

3. **Run build script**:
```bash
scripts\build_windows.bat
```

4. **Output**:
   - Installer: `electron\dist\Football Prediction Setup.exe`
   - Size: ~500MB

5. **Test installer**:
   - Run the generated .exe
   - Follow installation wizard
   - Launch and verify

## Uninstalling

### Option 1: Windows Control Panel
1. Open Settings → Apps → Apps & features
2. Find "Football Prediction"
3. Click and select "Uninstall"
4. Confirm

### Option 2: Installer Uninstaller
1. Go to `C:\Program Files\Football Prediction`
2. Run `Uninstall.exe`

### What Gets Removed
- Application files
- Start Menu shortcuts
- Desktop shortcuts
- App data (database and config stay in `%APPDATA%`)

### Keeping Data
To keep your predictions and settings:
1. Before uninstalling, back up:
   - `%APPDATA%\Football Prediction\`
2. After reinstalling, restore the folder

## Troubleshooting Installation

### "Administrator privileges required"
- Right-click setup.exe
- Select "Run as administrator"

### "File is in use" error
- Close any instances of the app
- Restart and try again

### "Corrupted installer"
- Re-download from releases
- Check file hash if provided

### App won't start after install
```bash
# Try running from command line to see error
"C:\Program Files\Football Prediction\Football Prediction.exe"
```

### Low disk space warning
- Ensure 1GB free space before installing
- Uninstall other large apps if needed

## Network Requirements

### Outbound Connections Needed
- `api.football-data.org` (Port 443)
- `newsapi.org` (Port 443)
- `api.openai.com` (Port 443)

### Firewall Configuration
If behind corporate firewall:
1. Whitelist the above domains
2. Or configure proxy settings in Settings tab

## Update Process

### Automatic Updates (if enabled)
- App checks for updates on startup
- Downloads in background
- Prompts to install on next launch

### Manual Update
1. Download new installer
2. Run it (will overwrite existing installation)
3. Data persists across updates

## Portable Version

For USB/portable use without installation:
```bash
# Download pre-built portable .zip
# Extract anywhere
# Run Football Prediction.exe
```

Portable version:
- No installation needed
- Can run from USB drive
- Data stored in app directory

## Docker Version (Linux)

If you want Linux support:
```bash
docker pull footballprediction/app:latest
docker run -p 5000:5000 -p 3000:3000 footballprediction/app:latest
```

## Notes

- First launch initializes SQLite database (~5MB)
- Cache is stored in `%APPDATA%\Football Prediction\cache`
- Logs saved to `%APPDATA%\Football Prediction\logs`
- Configuration stored in `%APPDATA%\Football Prediction\.env`

## Support

- **Issues**: https://github.com/yourrepo/FootScan/issues
- **Wiki**: https://github.com/yourrepo/FootScan/wiki
- **Email**: support@example.com
