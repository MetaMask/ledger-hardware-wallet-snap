import SnapLayout from '@/component/layout';
import { MetaMaskProvider } from '@/hooks';

import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { persistor, store } from '@/store/store';
import { PersistGate } from 'redux-persist/integration/react';
/**
 *
 * @param options0
 * @param options0.Component
 * @param options0.pageProps
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <MetaMaskProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SnapLayout>
            <Component {...pageProps} />
          </SnapLayout>
        </PersistGate>
      </Provider>
    </MetaMaskProvider>
  );
}
