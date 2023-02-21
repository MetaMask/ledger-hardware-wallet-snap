import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAccountAction } from '@/store/slices/accounts.actions';
import {
  selectAvailableAccounts,
  selectCurrentAccount,
  setAccount,
} from '@/store/slices/accountSlice';
import { sendUpdateCurrentAccount } from '@/utils';
import type { MenuProps } from 'antd';
import { Dropdown, message, Space } from 'antd';
import { useEffect, useState } from 'react';

export function AccountSelector() {
  const dispatch = useAppDispatch();
  const availableAccounts = useAppSelector(selectAvailableAccounts);
  const currentAccount = useAppSelector(selectCurrentAccount);
  const [items, setItems] = useState([]);

  console.log(availableAccounts);

  const renderItems = () => {
    const accountList = availableAccounts.map((account, index) => {
      return {
        key: index,
        label: account.address,
      };
    });
    setItems(accountList);
  };

  useEffect(() => {
    renderItems();
  }, [availableAccounts]);

  const onClick: MenuProps['onClick'] = async ({ key }) => {
    const selectedAccount = availableAccounts[key];
    console.log(selectedAccount)
    await sendUpdateCurrentAccount(selectedAccount.address)
    dispatch(setAccountAction(selectedAccount));
  };

  return (
    <Dropdown menu={{ items, onClick }}>
      <Space>Currently Selected Account: {currentAccount?.address}</Space>
    </Dropdown>
  );
}
