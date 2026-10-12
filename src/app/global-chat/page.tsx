'use client';

import React from 'react';
import { GlobalChatPage } from '../../views/GlobalChatPage';
import { useModals } from '../../context/ModalContext';

export default function GlobalChatRoute() {
  const { openModerationModal } = useModals();

  return (
    <GlobalChatPage
      onOpenModerationModal={(msgId) =>
        openModerationModal({ type: 'message', id: msgId })
      }
    />
  );
}
