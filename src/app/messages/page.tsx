'use client';

import React from 'react';
import { PrivateMessagesPage } from '../../views/PrivateMessagesPage';
import { useModals } from '../../context/ModalContext';

export default function MessagesRoute() {
  const { openModerationModal } = useModals();

  return (
    <PrivateMessagesPage
      onOpenModerationModal={(id) =>
        openModerationModal({ type: 'user', id })
      }
    />
  );
}
