'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  RemoveFormatting,
  Heading2,
  Heading3,
} from 'lucide-react';
import { sanitizeBlogHtml, stripHtmlToText } from '@/lib/content/blog-rich-text';

interface RichTextEditorProps {
  label: string;
  value: string;
  placeholder?: string;
  minHeight?: number;
  onChange: (value: string) => void;
  onOpenMediaLibrary?: () => void;
  mediaLibraryLabel?: string;
}

const allowedTags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'blockquote', 'h2', 'h3', 'a', 'img'];
const allowedAttrs = ['href', 'target', 'rel', 'src', 'alt', 'data-align', 'data-size'];

function sanitizeEditorHtml(value: string) {
  return sanitizeBlogHtml(
    DOMPurify.sanitize(value, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttrs,
      KEEP_CONTENT: true,
    })
  );
}

export default function RichTextEditor({
  label,
  value,
  placeholder = 'Escribe aquí el contenido del artículo...',
  minHeight = 280,
  onChange,
  onOpenMediaLibrary,
  mediaLibraryLabel = 'Librería',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const normalizedValue = value || '';
    if (editorRef.current.innerHTML !== normalizedValue) {
      editorRef.current.innerHTML = normalizedValue;
    }
  }, [value]);

  const plainTextLength = useMemo(() => stripHtmlToText(value).length, [value]);

  const commit = () => {
    const nextValue = sanitizeEditorHtml(editorRef.current?.innerHTML ?? '');
    onChange(nextValue);

    if (editorRef.current && editorRef.current.innerHTML !== nextValue) {
      editorRef.current.innerHTML = nextValue;
    }
  };

  const applyCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    commit();
  };

  const applyLink = () => {
    const providedUrl = window.prompt('Pega la URL del enlace');

    if (!providedUrl) {
      return;
    }

    const normalizedUrl = providedUrl.trim();
    if (!normalizedUrl) {
      return;
    }

    applyCommand('createLink', normalizedUrl);
    commit();
  };

  const applyImage = () => {
    const providedUrl = window.prompt('Pega la URL de la imagen');

    if (!providedUrl) {
      return;
    }

    const normalizedUrl = providedUrl.trim();
    if (!normalizedUrl) {
      return;
    }

    editorRef.current?.focus();
    document.execCommand(
      'insertHTML',
      false,
      `<p data-align="center"><img src="${normalizedUrl}" alt="" /></p>`
    );
    commit();
  };

  const applyImageSize = (size: 'small' | 'medium' | 'full') => {
    if (!selectedImage || !editorRef.current?.contains(selectedImage)) {
      return;
    }

    selectedImage.setAttribute('data-size', size);
    commit();
    setSelectedImage(selectedImage);
  };

  const applyAlignment = (alignment: 'left' | 'center' | 'right') => {
    editorRef.current?.focus();
    const selection = window.getSelection();
    const anchorNode = selection?.anchorNode;

    if (!anchorNode) {
      return;
    }

    const anchorElement =
      anchorNode.nodeType === Node.ELEMENT_NODE ? (anchorNode as HTMLElement) : anchorNode.parentElement;

    const blockElement = anchorElement?.closest('p, h2, h3, blockquote, ul, ol, li, div');

    if (!blockElement || blockElement === editorRef.current) {
      return;
    }

    if (alignment === 'left') {
      blockElement.removeAttribute('data-align');
    } else {
      blockElement.setAttribute('data-align', alignment);
    }

    commit();
  };

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ color: '#D4AF37', fontSize: 13, fontWeight: 700 }}>{label}</span>
        <span style={{ color: '#8f846d', fontSize: 12 }}>{plainTextLength} caracteres visibles</span>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          padding: 10,
          borderRadius: 16,
          border: '1px solid rgba(212,175,55,0.12)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <ToolbarButton label="H2" onClick={() => applyCommand('formatBlock', '<h2>')} icon={<Heading2 size={15} />} />
        <ToolbarButton label="H3" onClick={() => applyCommand('formatBlock', '<h3>')} icon={<Heading3 size={15} />} />
        <ToolbarButton label="Negrita" onClick={() => applyCommand('bold')} icon={<Bold size={15} />} />
        <ToolbarButton label="Cursiva" onClick={() => applyCommand('italic')} icon={<Italic size={15} />} />
        <ToolbarButton label="Izquierda" onClick={() => applyAlignment('left')} icon={<AlignLeft size={15} />} />
        <ToolbarButton label="Centro" onClick={() => applyAlignment('center')} icon={<AlignCenter size={15} />} />
        <ToolbarButton label="Derecha" onClick={() => applyAlignment('right')} icon={<AlignRight size={15} />} />
        <ToolbarButton label="Lista" onClick={() => applyCommand('insertUnorderedList')} icon={<List size={15} />} />
        <ToolbarButton
          label="Numerada"
          onClick={() => applyCommand('insertOrderedList')}
          icon={<ListOrdered size={15} />}
        />
        <ToolbarButton label="Cita" onClick={() => applyCommand('formatBlock', '<blockquote>')} icon={<Quote size={15} />} />
        <ToolbarButton label="Enlace" onClick={applyLink} icon={<LinkIcon size={15} />} />
        <ToolbarButton label="Imagen" onClick={applyImage} icon={<ImageIcon size={15} />} />
        <ToolbarButton label="50%" onClick={() => applyImageSize('small')} icon={<ImageIcon size={15} />} />
        <ToolbarButton label="75%" onClick={() => applyImageSize('medium')} icon={<ImageIcon size={15} />} />
        <ToolbarButton label="100%" onClick={() => applyImageSize('full')} icon={<ImageIcon size={15} />} />
        {onOpenMediaLibrary ? (
          <ToolbarButton label={mediaLibraryLabel} onClick={onOpenMediaLibrary} icon={<ImagePlus size={15} />} />
        ) : null}
        <ToolbarButton
          label="Limpiar"
          onClick={() => applyCommand('removeFormat')}
          icon={<RemoveFormatting size={15} />}
        />
      </div>

      <div
        style={{
          position: 'relative',
          borderRadius: 18,
          border: isFocused ? '1px solid #D4AF37' : '1px solid rgba(212,175,55,0.12)',
          background: 'rgba(255,255,255,0.02)',
          overflow: 'hidden',
        }}
      >
        {!stripHtmlToText(value) ? (
          <div
            style={{
              position: 'absolute',
              inset: '16px 16px auto 16px',
              color: '#8f846d',
              pointerEvents: 'none',
              lineHeight: 1.7,
            }}
          >
            {placeholder}
          </div>
        ) : null}

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            commit();
          }}
          onInput={commit}
          onClick={(event) => {
            const target = event.target;
            setSelectedImage(target instanceof HTMLImageElement ? target : null);
          }}
          className="blog-rich-content admin-rich-editor"
          style={{
            minHeight,
            padding: 16,
            color: '#FFFFF0',
            outline: 'none',
            lineHeight: 1.85,
            whiteSpace: 'normal',
          }}
        />
      </div>
    </div>
  );
}

export function buildInlineImageMarkup(url: string, alt = '', size: 'small' | 'medium' | 'full' = 'full') {
  const safeUrl = url.trim();
  const safeAlt = alt.trim();

  if (!safeUrl) {
    return '';
  }

  return `<p data-align="center"><img src="${safeUrl}" alt="${safeAlt}" data-size="${size}" /></p>`;
}

function ToolbarButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 10px',
        borderRadius: 12,
        border: '1px solid rgba(212,175,55,0.12)',
        background: 'rgba(255,255,255,0.02)',
        color: '#FFFFF0',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {icon}
      {label}
    </button>
  );
}
