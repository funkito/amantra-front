// src/components/shared/ElegantButton.tsx
'use client';
import React from 'react';

interface Props {
    children: React.ReactNode;
    onClick?: () => void;
}

const ElegantButton = ({ children, onClick }: Props) => {
    return (
        <button
            onClick={onClick}
            style={{
                backgroundColor: '#D4AF37', // Dorado Amantra
                color: '#000',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '4px',
                fontFamily: 'serif',
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#C29B30'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D4AF37'}
        >
            {children}
        </button>
    );
};

export default ElegantButton;