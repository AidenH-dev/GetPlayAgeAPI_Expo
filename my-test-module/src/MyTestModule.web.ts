import { registerWebModule, NativeModule } from 'expo';

import { MyTestModuleEvents } from './MyTestModule.types';

class MyTestModule extends NativeModule<MyTestModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(MyTestModule, 'MyTestModule');
