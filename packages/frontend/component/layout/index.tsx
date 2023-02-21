import { MetaMaskContext, MetamaskActions } from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentAccount } from '@/store/slices/accountSlice';
import { Breadcrumb, Card, Layout, Menu, Button } from 'antd';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import type { MenuProps } from 'antd';
import { connectSnap, getSnap } from '../../utils/snap';
import { Notifcation } from '../notification';

const { Header, Content, Footer, Sider } = Layout;

const items: MenuProps['items'] = [
  {
    label: 'Accounts',
    key: 'home',
  },
  {
    label: 'Transactions',
    key: 'transactions',
  },
  {
    label: 'Signed Messages',
    key: 'signed-messages',
  },
];

export default function SnapLayout({ children }) {
  const [state, dispatch] = useContext(MetaMaskContext);
  const router = useRouter();
  const currentAccount = useAppSelector(selectCurrentAccount);

  useEffect(() => {
    if (!currentAccount) { }
  }, [])

  const onClick: MenuProps['onClick'] = (e) => {
    router.push(e.key === 'home' ? '/' : e.key);
  };

  const renderInstallFlask = () => {
    return (
      <Card title="Metamask Flask Not Detected">
        <p>Please install metamask flask</p>
        <Button
          type="primary"
          onClick={() => {
            router.push('https://metamask.io/flask/');
          }}
        >
          Install Flask
        </Button>
      </Card>
    );
  };

  const renderInstallSnap = () => {
    return (
      <Card title="Ledger Snap Not Installed">
        <p>Please install ledger snap</p>
        <Button
          type="primary"
          onClick={async () => {
            await connectSnap();
            const installedSnap = await getSnap();
            dispatch({
              type: MetamaskActions.SetInstalled,
              payload: installedSnap,
            });
          }}
        >
          Install Snap
        </Button>
      </Card>
    );
  };

  const renderContent = () => {
    if (!state.isFlask) return renderInstallFlask();
    if (!state.installedSnap) return renderInstallSnap();

    return children;
  };

  return (
    <Layout hasSider>
      <Sider
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {' '}
        <div
          style={{
            // height: 32,
            // margin: 16,
            padding: '20px 24px 20px 28px',
            background: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          Ledger Snap
          <ul>Account Name: {currentAccount?.name}</ul>
          <ul>Address: {currentAccount?.address}</ul>
          <ul>HdPath: {currentAccount?.hdPath}</ul>
        </div>
        <Menu
          onClick={(e) => {
            onClick(e);
          }}
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['4']}
          items={items}
        />
      </Sider>
      <Layout className="site-layout" style={{ marginLeft: 200, padding: 20 }}>
        <Notifcation />
        {renderContent()}
        <Footer style={{ textAlign: 'center' }}>Demo of ledger snap</Footer>
      </Layout>
    </Layout>
  );
}
