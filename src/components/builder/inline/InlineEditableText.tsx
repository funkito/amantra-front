'use client';

import { Type, CaseSensitive, Pilcrow } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';

interface InlineEditableTextProps {
  value: string;
  placeholder?: string;
  multiline?: boolean;
  selected?: boolean;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}

function sanitizeInlineText(value: string) {
  const sanitized = DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });

  return sanitized.replace(/\s+/g, ' ').trim();
}

export default function InlineEditableText({
  value,
  placeholder,
  multiline = false,
  selected = false,
  onChange,
  style,
}: InlineEditableTextProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!ref.current || ref.current.textContent === value) {
      return;
    }

    ref.current.textContent = value;
  }, [value]);

  const commit = () => {
    const nextValue = sanitizeInlineText(ref.current?.textContent ?? '');
    onChange(nextValue);
    if (ref.current && ref.current.textContent !== nextValue) {
      ref.current.textContent = nextValue;
    }
  };

  const applyTransform = (transformer: (current: string) => string) => {
    const currentValue = ref.current?.textContent ?? value;
    const nextValue = sanitizeInlineText(transformer(currentValue));

    onChange(nextValue);

    if (ref.current) {
      ref.current.textContent = nextValue;
      ref.current.focus();
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {selected && isFocused ? (
        <div
          style={{
            position: 'absolute',
            top: -44,
            left: 0,
            zIndex: 2,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: 6,
            borderRadius: 14,
            border: '1px solid rgba(212,175,55,0.18)',
            background: 'rgba(20,14,10,0.96)',
            boxShadow: '0 16px 32px rgba(0,0,0,0.22)',
          }}
        >
          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              applyTransform((current) => current.toUpperCase());
            }}
            style={toolbarButtonStyle}
            title="Convertir a mayúsculas"
          >
            <Type size={14} />
            MAY
          </button>
          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              applyTransform((current) =>
                current
                  .toLowerCase()
                  .replace(/\b\w/g, (character) => character.toUpperCase())
              );
            }}
            style={toolbarButtonStyle}
            title="Capitalizar texto"
          >
            <CaseSensitive size={14} />
            Cap
          </button>
          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              applyTransform((current) => current.replace(/\s+/g, ' '));
            }}
            style={toolbarButtonStyle}
            title="Normalizar espacios"
          >
            <Pilcrow size={14} />
            Limpio
          </button>
        </div>
      ) : null}

      <div
        ref={ref}
        contentEditable={selected}
        suppressContentEditableWarning
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          commit();
        }}
        onKeyDown={(event) => {
          if (!multiline && event.key === 'Enter') {
            event.preventDefault();
            ref.current?.blur();
          }
        }}
        style={{
          outline: selected ? '1px dashed rgba(212,175,55,0.35)' : 'none',
          borderRadius: 8,
          cursor: selected ? 'text' : 'default',
          minHeight: multiline ? 28 : undefined,
          whiteSpace: multiline ? 'pre-wrap' : 'normal',
          ...style,
        }}
        data-placeholder={selected && !value ? placeholder : undefined}
      >
        {value || placeholder || ''}
      </div>
    </div>
  );
}

const toolbarButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  borderRadius: 10,
  border: '1px solid rgba(212,175,55,0.12)',
  background: 'rgba(255,255,255,0.02)',
  color: '#FFFFF0',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 700,
};
