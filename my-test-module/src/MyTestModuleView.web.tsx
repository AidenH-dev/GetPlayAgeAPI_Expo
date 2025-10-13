import * as React from 'react';

import { MyTestModuleViewProps } from './MyTestModule.types';

export default function MyTestModuleView(props: MyTestModuleViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
