import { NativeModule, requireNativeModule } from 'expo';

import { MyTestModuleEvents } from './MyTestModule.types';

declare class MyTestModule extends NativeModule<MyTestModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<MyTestModule>('MyTestModule');
