import { useContext, useEffect, useState } from 'react';
import { Layout, List, Table } from 'antd';
import { Button, Card } from 'antd';
import Link from 'next/link';
import { getSnap, sendSignMessage, sendSignTransaction } from '@/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectCurrentAccount,
  selectMessages,
  selectTransactions,
  setAccount,
} from '@/store/slices/accountSlice';
import { AccountSelector } from '@/component/account';
import { SignTransactionModal } from '@/component/sign-transaction-modal';
import { FeeMarketEIP1559Transaction } from '@ethereumjs/tx';
import { Buffer } from 'buffer';
import { setErrorMessage, setMessage } from '@/store/slices/notificationSlice';
import {
  setAccountAction,
  setSignMessageAction,
  setSignTransactionAction,
} from '@/store/slices/accounts.actions';
import { SignMessageModal } from '@/component/sign-message-modal';

const { Content } = Layout;

export default function SignMessagesPage() {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(selectCurrentAccount);
  const messages = useAppSelector(selectMessages);
  const [showSignMessageModal, setShowSignMessageModal] = useState(false);

  const handleSignMessage = async (message) => {
    try {
      dispatch(setSignMessageAction(message)).then((res) => {
        if (!res.type.includes('rejected')) {
          dispatch(setMessage(`Successfully signed ${message}`));
        }
      });
    } catch (e) {
      console.log(e);
      dispatch(setErrorMessage(e.message));
    } finally {
      setShowSignMessageModal(false);
    }
  };

  if (!selectedAccount) {
    return <div>No account was found.</div>;
  }

  return (
    <Content>
      <AccountSelector />
      <br />
      <br />
      <Button
        onClick={() => {
          setShowSignMessageModal(true);
        }}
      >
        Send New Message
      </Button>
      <br />
      <br />

      {messages?.[selectedAccount?.address] && (
        <Table
          columns={[
            {
              title: 'Message',
              dataIndex: 'data',
              key: 'data',
            },
            {
              title: 'Signature',
              dataIndex: 'signature',
              key: 'signature',
              render: (signature) => {
                return (
                  <ul>
                    <li>R: {signature?.r}</li>
                    <li>S: {signature?.s}</li>
                    <li>V: {signature?.v}</li>
                  </ul>
                );
              },
            },
            {
              title: 'Signature In Hex Format',
              dataIndex: 'signatureHex',
              key: 'signatureHex',
              render: (data) => {
                return <div style={{ width: '150px' }}>{data}</div>;
              },
            },
          ]}
          dataSource={messages[selectedAccount.address].map((tx, index) => {
            return { ...tx, key: index };
          })}
        />
      )}
      <SignMessageModal
        isOpen={showSignMessageModal}
        onOk={handleSignMessage}
        onCancel={() => {
          setShowSignMessageModal(false);
        }}
      />
    </Content>
  );
}
