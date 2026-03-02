/**
 * Device capabilities configuration for Android and iOS.
 * Centralized to support multi-device matrix testing.
 */

export interface DeviceCapabilities {
  platformName: string;
  'appium:automationName': string;
  'appium:deviceName': string;
  'appium:platformVersion': string;
  'appium:app'?: string;
  'appium:appPackage'?: string;
  'appium:appActivity'?: string;
  'appium:bundleId'?: string;
  'appium:noReset'?: boolean;
  'appium:fullReset'?: boolean;
  'appium:newCommandTimeout'?: number;
  'appium:autoGrantPermissions'?: boolean;
}

const androidCapabilities: DeviceCapabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': process.env.ANDROID_DEVICE || 'emulator-5554',
  'appium:platformVersion': process.env.ANDROID_VERSION || '14',
  'appium:app': process.env.ANDROID_APP_PATH || './apps/android-app.apk',
  'appium:appPackage': process.env.ANDROID_APP_PACKAGE || 'com.hydraqa.app',
  'appium:appActivity': process.env.ANDROID_APP_ACTIVITY || '.MainActivity',
  'appium:noReset': false,
  'appium:fullReset': false,
  'appium:newCommandTimeout': 300,
  'appium:autoGrantPermissions': true,
};

const iosCapabilities: DeviceCapabilities = {
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
  'appium:deviceName': process.env.IOS_DEVICE || 'iPhone 16',
  'appium:platformVersion': process.env.IOS_VERSION || '18.0',
  'appium:app': process.env.IOS_APP_PATH || './apps/ios-app.app',
  'appium:bundleId': process.env.IOS_BUNDLE_ID || 'com.hydraqa.app',
  'appium:noReset': false,
  'appium:fullReset': false,
  'appium:newCommandTimeout': 300,
};

export function getCapabilities(platform: 'android' | 'ios'): DeviceCapabilities {
  return platform === 'android' ? { ...androidCapabilities } : { ...iosCapabilities };
}

