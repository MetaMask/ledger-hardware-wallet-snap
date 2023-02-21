import { Modal, Form, Input } from 'antd';
import { useState } from 'react';

export function SignMessageModal({
  isOpen,
  onOk,
  onCancel,
}: {
  isOpen: boolean;
  onOk: Function;
  onCancel: Function;
}) {
  const [message, setMessage] = useState('');

  return (
    <Modal
      title="Sign Message"
      open={isOpen}
      onOk={async () => {
        await onOk(message);
      }}
      onCancel={onCancel}
    >
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        style={{ maxWidth: 600 }}
      >
        <Form.Item label="Message" initialValue={0}>
          <Input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
