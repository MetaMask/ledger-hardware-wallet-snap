import { useContext, useEffect, useState } from 'react';
import { Layout, List, Table } from 'antd';
import { Button, Card } from 'antd';
import Link from 'next/link';
import { getSnap, sendSignTransaction } from '@/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectCurrentAccount,
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
  setSignTransactionAction,
} from '@/store/slices/accounts.actions';
import { ethers } from 'ethers';

const { Content } = Layout;

export default function Transactions() {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(selectCurrentAccount);
  const transactions = useAppSelector(selectTransactions);
  const [showSignTransactionModal, setShowSignTransactionModal] =
    useState(false);

  const handleSignTransaction = async (destinationAccount, amount) => {
    try {
      //get chain id
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const gasPrice = ethers.parseUnits('100', 'wei') //.toHexString();
      console.log(gasPrice);
      const rawTx = FeeMarketEIP1559Transaction.fromTxData({
        from: selectedAccount?.address,
        chainId: chainId,
        type: 2,
        to: destinationAccount,
        value: '0x'.concat(
          typeof amount === 'number' ? amount.toString(16) : amount,
        ),
        maxFeePerGas: gasPrice,
        gasLimit: 25000,
      });
      const unsignedTx = Buffer.from(rawTx.getMessageToSign(false)).toString(
        'hex',
      );
      console.log(rawTx);
      console.log(rawTx.toJSON());
      console.log(unsignedTx);
      dispatch(
        setSignTransactionAction({
          rawHexTx: unsignedTx,
          data: rawTx.toJSON(),
        }),
      ).then((res) => {
        console.log(res);
        if (!res.type.includes('rejected')) {
          dispatch(setMessage(`Sucessfully signed message ${unsignedTx}`));
        }
      });
    } catch (e) {
      console.log(e);
      dispatch(setErrorMessage(e.message));
    } finally {
      setShowSignTransactionModal(false);
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
          setShowSignTransactionModal(true);
        }}
      >
        Send Ether
      </Button>
      <br />
      <br />
      {transactions?.[selectedAccount?.address] && (
        <Table
          columns={[
            {
              title: 'Signed Tx',
              dataIndex: 'signedTxHex',
              key: 'signedTxHex',
              render: (data) => {
                return <div style={{ width: '150px' }}>{data}</div>;
              },
            },
            {
              title: 'Data',
              dataIndex: 'data',
              key: 'data',
              render: (data) => {
                return (
                  <ul>
                    <li>To: {data?.to}</li>
                    <li>Chain: {data?.chainId}</li>
                    <li>Nonce: {data?.nonce}</li>
                    <li>Value: {data?.value}</li>
                    <li>Data: {data?.data}</li>
                    <li>Priority Fee: {data?.maxPriorityFeePerGas}</li>
                    <li>Max Fee: {data?.maxFeePerGas}</li>
                    <li>Gas Limit: {data?.gasLimit}</li>
                  </ul>
                );
              },
            },
            {
              title: 'Signature',
              dataIndex: 'signature',
              key: 'signature',
              render: (signature) => {
                return (
                  <ul>
                    <li>
                      <b>R:</b> {signature.r}
                    </li>
                    <li>
                      <b>S:</b> {signature.s}
                    </li>
                    <li>
                      <b>V:</b> {signature.v}
                    </li>
                  </ul>
                );
              },
            },
          ]}
          dataSource={transactions[selectedAccount.address].map((tx, index) => {
            return { ...tx, key: index };
          })}
        />
      )}
      <SignTransactionModal
        isOpen={showSignTransactionModal}
        onOk={handleSignTransaction}
        onCancel={() => {
          setShowSignTransactionModal(false);
        }}
      />
    </Content>
  );
}
