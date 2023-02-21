import { Modal, Form, Input } from 'antd';
import { useState } from 'react';

export function SignTransactionModal({
  title,
  isOpen,
  onOk,
  onCancel,
}: {
  title?: string;
  isOpen: boolean;
  onOk: Function;
  onCancel: Function;
}) {
  const [destinationAccount, setDestinationAccount] = useState('');
  const [amount, setAmount] = useState(0);

  return (
    <Modal
      title={title ?? 'Send Ether'}
      open={isOpen}
      onOk={async() => {
        await onOk(destinationAccount, amount);
      }}
      onCancel={onCancel}
    >
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        style={{ maxWidth: 600 }}
      >
        <Form.Item label="Destination" initialValue={0}>
          <Input
            value={destinationAccount}
            onChange={(e) => {
              setDestinationAccount(e.target.value);
            }}
          />
        </Form.Item>
        <Form.Item label="Amount" initialValue={0}>
          <Input
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
