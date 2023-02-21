import { useContext, useEffect, useState } from 'react';
import { MetaMaskContext, MetamaskActions } from '@/hooks';
import { Layout, List } from 'antd';
import { Button, Card, Modal, Table } from 'antd';
import Link from 'next/link';
import {
  connectSnap,
  getSnap,
  sendAddAccount,
  sendGetAccounts,
  sendGetPersistedState,
  sendListAccounts,
  sendRemoveAccount,
  sendResetAccount,
  sendSetup,
} from '@/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectAvailableAccounts,
  selectCurrentAccount,
  setAccount,
  setAvailableAccounts,
} from '@/store/slices/accountSlice';
import { setAccountAction } from '@/store/slices/accounts.actions';
import { DebugPanel } from '@/component/debug';

const { Content } = Layout;

const columns = [
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'HD Path',
    dataIndex: 'hdPath',
    key: 'hdPath',
  },
];

export default function Home() {
  const [state, dispatch] = useContext(MetaMaskContext);
  const reduxDispatch = useAppDispatch();
  const selectedAccount = useAppSelector(selectCurrentAccount);
  const accounts = useAppSelector(selectAvailableAccounts);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ledgerAccounts, setLedgerAccounts] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    

  }, [accounts]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const handleSelectAccount = (account) => {
    console.debug(`Selected account`, account);
    // reduxDispatch(setAccount(account));
    reduxDispatch(setAccountAction(account));
  };

  const showAccountSelection = async () => {
    setShowAddAccountModal(true);
    setLoading(true);
    try {
      const ledgerAccounts = await sendListAccounts(0);
      console.log(ledgerAccounts);

      const data = ledgerAccounts.map((account, index) => {
        return {
          key: index,
          disabled:
            accounts.findIndex(
              (localAcc) => localAcc.address === account.address,
            ) !== -1,
          name: account.name,
          hdPath: account.hdPath,
          address: account.address,
        };
      });

      const alreadySelectedAccounts = [];
      ledgerAccounts.forEach((account, index) => {
        if (
          accounts.findIndex(
            (localAcc) => (localAcc.address === account.address) !== -1,
          )
        ) {
          alreadySelectedAccounts.push(index);
        }
      });

      console.log(data);

      setLedgerAccounts(data);
      setSelectedRowKeys(alreadySelectedAccounts);
    } catch (e) {
      console.log('Unable to connect to ledger', e);
    } finally {
      setLoading(false);
    }
  };

  const hideAccountSelection = () => {
    setShowAddAccountModal(false);
  };

  const handleAddAccount = async () => {
    if (ledgerAccounts.length === 0 || selectedRowKeys.length === 0) return;

    const selectedAccounts = ledgerAccounts.filter(
      (_, index) => selectedRowKeys.indexOf(index) !== -1,
    );

    console.log('Adding the following accounts', selectedAccounts);

    //check if initialized
    if (!(await sendGetPersistedState()).initialized) {
      try {
        console.log('Running setup');
        const result = await sendSetup({ accounts: selectedAccounts });
        console.log(result);
      } catch (e) {
        console.error(e);
        dispatch({ type: MetamaskActions.SetError, payload: e });
      }
    } else {
      try {
        console.log('Running add');
        await sendAddAccount(selectedAccounts);
      } catch (e) {
        console.error(e);
        dispatch({ type: MetamaskActions.SetError, payload: e });
      }
    }
    const updatedAccountsList = await sendGetAccounts();
    reduxDispatch(setAvailableAccounts(updatedAccountsList));
    setShowAddAccountModal(false);
  };

  const renderSetup = () => {};

  const renderContent = () => {};

  return (
    <Content>
      <div>
        <Button type="primary" onClick={showAccountSelection}>
          Add Account
        </Button>
        <Button
          type="primary"
          danger
          onClick={async () => {
            await handleRemoveAccount();
          }}
        >
          Remove Account
        </Button>
        <Button
          type="primary"
          danger
          onClick={async () => {
            await handleResetAccount();
          }}
        >
          Reset Account
        </Button>
        <DebugPanel />
      </div>
      {selectedAccount && accounts && (
        <List
          itemLayout="vertical"
          dataSource={accounts}
          renderItem={(account) => {
            return (
              <List.Item
                onClick={() => {
                  handleSelectAccount(account);
                }}
              >
                <Card
                  title={account.name}
                  style={{
                    backgroundColor:
                      selectedAccount.address === account.address
                        ? 'grey'
                        : null,
                  }}
                >
                  <ul>
                    <li>Address: {account.address}</li>
                    <li>HDPath: {account.hdPath}</li>
                    <li>Balance:</li>
                  </ul>
                </Card>
              </List.Item>
            );
          }}
        />
      )}

      <Modal
        title="Ledger Wallet Accounts"
        open={showAddAccountModal}
        onOk={handleAddAccount}
        onCancel={hideAccountSelection}
        width="700px"
      >
        <Table
          size="large"
          dataSource={ledgerAccounts}
          columns={columns}
          loading={loading}
          rowSelection={{
            ...rowSelection,
          }}
        />
      </Modal>
    </Content>
  );
}
