import React from 'react';

interface Props {
  isOpen: boolean;
  children: React.ReactNode;
}

export default function Modal({ isOpen, children }: Props) {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ background: '#222', padding: '32px', borderRadius: '8px', minWidth: '400px' }}>
        {children}
      </div>
    </div>
  );
}
