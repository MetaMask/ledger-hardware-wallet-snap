import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectNotificationErrorMessage,
  selectNotificationMessage,
  setErrorMessage,
  setMessage,
} from '@/store/slices/notificationSlice';
import { notification } from 'antd';
import { useEffect } from 'react';
import { message } from 'antd';
import { selectLedgerErrorMessage, setLedgerError } from '@/store/slices/accountSlice';

export function Notifcation() {
  const error = useAppSelector(selectNotificationErrorMessage);
  const normalMessage = useAppSelector(selectNotificationMessage);
  const ledgerError = useAppSelector(selectLedgerErrorMessage)
  const dispatch = useAppDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (error !== '') {
      messageApi.error(JSON.stringify(error))
      dispatch(setErrorMessage(''));
    }

    if (normalMessage !== '') {
      messageApi.info(JSON.stringify(normalMessage))
      dispatch(setMessage(''));
    }

    if (ledgerError !== '') {
      messageApi.error(ledgerError)
      dispatch(setLedgerError(''))
    }
  }, [error, normalMessage, ledgerError]);

  return <>{contextHolder}</>;
}
