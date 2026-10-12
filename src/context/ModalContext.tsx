'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Report } from '../types';

export interface ModerationTarget {
  type: 'report' | 'user' | 'message';
  id: string;
  title?: string;
}

interface ModalContextType {
  isReportModalOpen: boolean;
  openReportModal: () => void;
  closeReportModal: () => void;
  
  claimTargetReport: Report | null;
  openClaimModal: (report: Report) => void;
  closeClaimModal: () => void;
  
  moderationTarget: ModerationTarget | null;
  openModerationModal: (target: ModerationTarget) => void;
  closeModerationModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [claimTargetReport, setClaimTargetReport] = useState<Report | null>(null);
  const [moderationTarget, setModerationTarget] = useState<ModerationTarget | null>(null);

  const openReportModal = () => setIsReportModalOpen(true);
  const closeReportModal = () => setIsReportModalOpen(false);

  const openClaimModal = (report: Report) => setClaimTargetReport(report);
  const closeClaimModal = () => setClaimTargetReport(null);

  const openModerationModal = (target: ModerationTarget) => setModerationTarget(target);
  const closeModerationModal = () => setModerationTarget(null);

  return (
    <ModalContext.Provider
      value={{
        isReportModalOpen,
        openReportModal,
        closeReportModal,
        claimTargetReport,
        openClaimModal,
        closeClaimModal,
        moderationTarget,
        openModerationModal,
        closeModerationModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModals = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModals must be used within a ModalProvider');
  }
  return context;
};
