import { Button } from 'antd';
import { sendGetPersistedState, connectSnap, sendResetState, sendHello } from '@/utils';

export function DebugPanel() {
  return (
    <div>
      <Button
        type="primary"
        danger
        onClick={async () => {
          await connectSnap();
        }}
      >
        Reinstall Snap
      </Button>
      <Button
        onClick={async (): Promise<void> => {
          console.log(await sendGetPersistedState());
        }}
      >
        Log State
      </Button>
      <Button
        type="primary"
        danger
        onClick={async (): Promise<void> => {
          const result = await sendResetState()
        }}
      >
        Forget Device 
      </Button>
      <Button
        type="primary"
        danger
        onClick={async (): Promise<void> => {
          const result = await sendHello()
        }}
      >
        Send Hello
      </Button>
    </div>
  );
}
