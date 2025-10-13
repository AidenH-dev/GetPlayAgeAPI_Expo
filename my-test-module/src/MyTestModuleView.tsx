import { requireNativeView } from 'expo';
import * as React from 'react';

import { MyTestModuleViewProps } from './MyTestModule.types';

const NativeView: React.ComponentType<MyTestModuleViewProps> =
  requireNativeView('MyTestModule');

export default function MyTestModuleView(props: MyTestModuleViewProps) {
  return <NativeView {...props} />;
}
