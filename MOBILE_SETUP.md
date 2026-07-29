# Running CitizenAware 2026 on Mobile

## For Physical Mobile Device (Recommended)

### Requirements:
- Expo Go App installed on your Android/iOS phone
- Same WiFi network as your development computer
- Project fully built and ready

### Step 1: Start the Development Server

On your computer terminal:
```bash
cd /path/to/project
npm run dev
```

### Step 2: Get the QR Code

After running `npm run dev`, you'll see output like:
```
│ Local:       http://localhost:8081
│ Tunnel:      exp://XXXXXXXXXXXXX.exp.direct
```

A QR code will be displayed. On mobile device:

**For Android:**
1. Open **Expo Go** app
2. Tap the camera icon
3. Scan the QR code

**For iOS:**
1. Open Camera app
2. Point at QR code
3. Tap the notification to open in Expo Go

### Step 3: Wait for App to Load

The app will bundle and load on your phone (first time: 30-60 seconds, subsequent: 5-15 seconds)

---

## Troubleshooting Mobile Connection

### "Something went wrong" Error

**Cause 1: Type Compatibility Issue**
- Fixed: Updated Notification type to support both `createdAt` and `created_at`
- Fixed: Added forgot-password route to app layout

**Cause 2: Missing Dependencies**
```bash
# Clear cache
npm install
npm start -- --clear
```

**Cause 3: Network Issues**
- Ensure phone and computer are on same WiFi
- Disable firewall temporarily
- Restart Expo Go app
- Restart development server

### "Module not found" Error
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Black Screen
- Wait 30-60 seconds (first load is slow)
- Tap app window to focus
- Restart Expo Go
- Check console for specific errors

---

## Best Mobile Testing Practices

### 1. Test Auth Flow
- Splash screen (2.5s)
- Onboarding (optional)
- Login/Register screens
- Forgot password screen

### 2. Test Main Features
- Home screen (featured schemes)
- Browse all schemes
- View scheme details
- Search and filter
- Save schemes
- View notifications

### 3. Hot Reload vs Full Reload

**Hot Reload (Automatic)**
- Changes to most code reload instantly
- State is preserved
- Press 'r' in terminal to manual reload

**Full Reload**
- Press 'R' in terminal
- Clears state
- Takes 5-10 seconds

### 4. Console Debugging
- Check terminal for errors
- Look for red warning boxes on app
- Use React DevTools (press 'd' in terminal on web, 'm' on device)

---

## Production Build for Mobile

### Create Development Build (Recommended for Testing)

```bash
npm install -g eas-cli
eas build:configure
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

### For Full Production

```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```

---

## Mobile Features Summary

### What Works on Mobile:
✅ All authentication flows
✅ Tab navigation
✅ Scheme browsing
✅ Real-time notifications
✅ Profile with live stats
✅ Forgot password email flow
✅ Multi-language support
✅ Settings

### Not Working on Device Preview:
❌ Native modules (if any)
❌ Deep linking (in preview)
❌ Push notifications (in preview)

---

## Network Modes

### 1. Local (Same WiFi) - Recommended
- Fastest
- Works in company/home WiFi
- Can't access from outside network

### 2. Tunnel (VPN Enabled)
- Slower but works from anywhere
- Automatically enabled if LAN unavailable
- Might be blocked by corporate firewalls

### 3. Web Only
- If device issues occur
- Browser on desktop: `npm run dev` → press `w`
- Most features work identically

---

## Testing Checklist

### Authentication
- [ ] Splash screen shows (2.5s)
- [ ] Onboarding flows correctly
- [ ] Login with email/password
- [ ] Register with name, email, phone
- [ ] Forgot password sends email
- [ ] Logout works

### Navigation
- [ ] Home tab shows featured schemes
- [ ] Schemes tab shows all schemes
- [ ] AI tab is accessible
- [ ] Alerts/Notifications tab shows notifications
- [ ] Profile tab shows user data

### Functionality
- [ ] Search schemes works
- [ ] Filter by category works
- [ ] Save scheme bookmark works
- [ ] View notification details
- [ ] Mark notifications as read

### UI/UX
- [ ] App looks good on small screen
- [ ] Buttons responsive (not too small)
- [ ] Text readable
- [ ] Colors look correct
- [ ] Scroll smooth (no lag)

---

## Device Performance Tips

### Reduce Bundle Size
- Press 'w' then check browser DevTools network tab
- Bundles usually 3.5MB JavaScript

### Reduce Memory Usage
- Close other apps
- Reload app if sluggish
- Use WiFi over hotspot

### Speed Up Development
- Avoid large image imports
- Use Hot reload (automatic)
- Develop on web first (faster)

---

## Known Limitations

1. **Camera** - Works in Expo Go
2. **Notifications** - Local only in preview
3. **Deep Linking** - Limited in preview
4. **Storage** - Async only (not SQLite)

---

## Running Multiple Developers

Each developer can:
1. Install Expo Go
2. Scan same QR code from different phones
3. All see the same development server

---

## Next Steps

1. **Test thoroughly** on actual device
2. **Gather feedback** from users
3. **Create production build** with EAS
4. **Submit to App Stores** (Google Play, App Store)

---

## Support

For issues:
1. Check Expo documentation: https://docs.expo.dev
2. Review error messages in terminal
3. Try `npm start -- --clear`
4. Reinstall Expo Go app
5. Restart development server

**Happy testing!**
