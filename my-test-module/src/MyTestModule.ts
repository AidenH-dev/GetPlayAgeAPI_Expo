import { NativeModule, requireNativeModule } from 'expo';

import { MyTestModuleEvents } from './MyTestModule.types';

declare class MyTestModule extends NativeModule<MyTestModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
  
  // Add your new functions
  getDeviceInfo(): {
    manufacturer: string;
    model: string;
    androidVersion: string;
    sdkVersion: number;
    device: string;
  };
  
  vibrate(duration: number): string;
  
  fetchDataAsync(): Promise<{
    data: string;
    timestamp: number;
  }>;
  
  getAgeSignals(): Promise<{
    userStatus: string;
    installId: string;
    ageLower?: number;
    ageUpper?: number;
    mostRecentApprovalDate?: string;
    timestamp: number;
  }>;
  
  isAgeSignalsAvailable(): boolean;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<MyTestModule>('MyTestModule');