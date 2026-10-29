import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Archive,
  CheckSquare,
  Copy,
  Download,
  Edit3,
  Eye,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Lock,
  Palette,
  Pin,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Type,
  Wand2,
  X,
} from 'lucide-react';

interface InsertedImage {
  id: string;
  src: string;
  width: number;
  height: number;
}

interface CustomStyle {
  fontFamily: string;
  fontSize: number;
  textColor: string;
  bgColor: string;
  bgMode: 'solid' | 'translucent' | 'transparent';
}

type ResizeDirection =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top_left'
  | 'top_right'
  | 'bottom_left'
  | 'bottom_right';

const LOGO_SRC = './assets/aistudio/logostarrysea2_20261029183244_61849baf.png';

const DEFAULT_STYLE: CustomStyle = {
  fontFamily: 'sans-serif',
  fontSize: 14,
  textColor: '#b0b8d4',
  bgColor: '#292c45',
  bgMode: 'solid',
};

const INITIAL_NOTE = `Chào mừng đến với Notes Stary Sea ✨
☐ Nhấn vào ô vuông bất kỳ để đánh dấu hoàn thành
☐ Chuột phải vào ghi chú để mở menu tùy chọn
☐ Nhấn Ctrl + M để thêm ô đánh dấu
☐ Nhấn Ctrl + S để lưu & khóa ghi chú`;

const SHORTCUTS = [
  { key: 'Ctrl + S', desc: 'Lưu ghi chú' },
  { key: 'Ctrl + W', desc: 'Lưu và ẩn cửa sổ' },
  { key: 'Ctrl + N', desc: 'Xóa ghi chú cũ, viết ghi chú mới' },
  { key: 'Ctrl + C', desc: 'Sao chép' },
  { key: 'Ctrl + X', desc: 'Cắt' },
  { key: 'Ctrl + V', desc: 'Dán' },
  { key: 'Ctrl + T', desc: 'Nền mờ xuyên thấu nhẹ' },
  { key: 'Ctrl + R', desc: 'Nền trong suốt hoàn toàn' },
  { key: 'Ctrl + Y', desc: 'Khôi phục giao diện mặc định' },
  { key: 'Ctrl + M', desc: 'Thêm ô đánh dấu' },
];

const STARDUST_PARTICLES = [
  { left: '7%', top: '18%', size: 4, delay: '0.1s', duration: '4.1s', opacity: 0.45 },
  { left: '15%', top: '68%', size: 5, delay: '0.35s', duration: '3.9s', opacity: 0.5 },
  { left: '22%', top: '34%', size: 3, delay: '0.6s', duration: '4.2s', opacity: 0.35 },
  { left: '28%', top: '82%', size: 6, delay: '0.2s', duration: '4.4s', opacity: 0.45 },
  { left: '34%', top: '15%', size: 4, delay: '0.75s', duration: '3.7s', opacity: 0.4 },
  { left: '39%', top: '56%', size: 3, delay: '0.45s', duration: '4.0s', opacity: 0.38 },
  { left: '44%', top: '26%', size: 5, delay: '0.15s', duration: '4.3s', opacity: 0.55 },
  { left: '48%', top: '76%', size: 4, delay: '0.55s', duration: '3.8s', opacity: 0.42 },
  { left: '53%', top: '19%', size: 6, delay: '0.3s', duration: '4.2s', opacity: 0.5 },
  { left: '58%', top: '84%', size: 3, delay: '0.8s', duration: '3.6s', opacity: 0.38 },
  { left: '63%', top: '32%', size: 4, delay: '0.25s', duration: '4.1s', opacity: 0.48 },
  { left: '69%', top: '64%', size: 5, delay: '0.65s', duration: '3.9s', opacity: 0.45 },
  { left: '75%', top: '22%', size: 3, delay: '0.4s', duration: '4.3s', opacity: 0.35 },
  { left: '81%', top: '73%', size: 5, delay: '0.1s', duration: '4.0s', opacity: 0.5 },
  { left: '87%', top: '41%', size: 4, delay: '0.5s', duration: '3.8s', opacity: 0.42 },
  { left: '92%', top: '16%', size: 5, delay: '0.7s', duration: '3.9s', opacity: 0.4 },
  { left: '12%', top: '48%', size: 4, delay: '0.85s', duration: '3.7s', opacity: 0.38 },
  { left: '90%', top: '82%', size: 4, delay: '0.3s', duration: '4.2s', opacity: 0.44 },
];

const HEX_ANGLES = [0, 60, 120, 180, 240, 300];
const OCT_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

const RESIZE_HANDLES: { edge: ResizeDirection; className: string }[] = [
  { edge: 'top', className: 'top-0 left-4 right-10 h-3 cursor-ns-resize' },
  { edge: 'bottom', className: 'bottom-0 left-4 right-4 h-3 cursor-ns-resize' },
  { edge: 'left', className: 'top-4 bottom-4 left-0 w-3 cursor-ew-resize' },
  { edge: 'right', className: 'top-10 bottom-4 right-0 w-3 cursor-ew-resize' },
  { edge: 'top_left', className: 'top-0 left-0 w-4 h-4 cursor-nwse-resize' },
  { edge: 'top_right', className: 'top-0 right-0 w-4 h-4 cursor-nesw-resize' },
  { edge: 'bottom_left', className: 'bottom-0 left-0 w-4 h-4 cursor-nesw-resize' },
  { edge: 'bottom_right', className: 'bottom-0 right-0 w-4 h-4 cursor-nwse-resize' },
];

const MENU_ITEM_CLS =
  'w-full text-left px-3.5 py-2 hover:bg-white/10 hover:text-white flex items-center gap-2.5 cursor-pointer';
const SUBMENU_ITEM_CLS =
  'w-full text-left px-3.5 py-2 hover:bg-white/10 hover:text-white flex items-center gap-2 cursor-pointer';

export default function App() {
  const [noteText, setNoteText] = useState<string>(() => {
    const saved = localStorage.getItem('stary_sea_note_data');
    return saved !== null ? saved : INITIAL_NOTE;
  });

  const [images, setImages] = useState<InsertedImage[]>(() => {
    try {
      const saved = localStorage.getItem('stary_sea_note_images');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [archives, setArchives] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('stary_sea_note_archive');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [writingMode, setWritingMode] = useState<boolean>(false);
  const [pinned, setPinned] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [customStyle, setCustomStyle] = useState<CustomStyle>(DEFAULT_STYLE);
  const [startupEnabled, setStartupEnabled] = useState<boolean>(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const [pos, setPos] = useState<{ x: number; y: number }>(() => ({
    x:
      typeof window !== 'undefined' && window.innerWidth > 420
        ? Math.max(20, window.innerWidth - 360)
        : 20,
    y: 28,
  }));
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 340,
    height: 380,
  });

  // Keep note window within visible viewport when browser/preview pane resizes
  useEffect(() => {
    const clampToViewport = () => {
      setPos((prev) => ({
        x: Math.max(12, Math.min(prev.x, Math.max(12, window.innerWidth - size.width - 16))),
        y: Math.max(12, Math.min(prev.y, Math.max(12, window.innerHeight - size.height - 16))),
      }));
    };
    clampToViewport();
    window.addEventListener('resize', clampToViewport);
    return () => window.removeEventListener('resize', clampToViewport);
  }, [size.width, size.height]);

  const dragRef = useRef<{ active: boolean; offsetX: number; offsetY: number }>({
    active: false,
    offsetX: 0,
    offsetY: 0,
  });
  const resizeRef = useRef<{
    active: boolean;
    edge: ResizeDirection | null;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    startPosX: number;
    startPosY: number;
  }>({
    active: false,
    edge: null,
    startX: 0,
    startY: 0,
    startW: 340,
    startH: 380,
    startPosX: 0,
    startPosY: 0,
  });

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    showFormatSub?: boolean;
  } | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [magicCircleKey, setMagicCircleKey] = useState<number>(0);
  const [showArchiveModal, setShowArchiveModal] = useState<boolean>(false);
  const [showFontModal, setShowFontModal] = useState<boolean>(false);
  const [showColorModal, setShowColorModal] = useState<'text' | 'bg' | null>(null);
  const [archiveMenu, setArchiveMenu] = useState<{
    x: number;
    y: number;
    index: number;
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const magicTimerRef = useRef<number | null>(null);

  const notify = useCallback((msg: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setStatusToast(msg);
    toastTimerRef.current = window.setTimeout(() => {
      setStatusToast(null);
      toastTimerRef.current = null;
    }, 2000);
  }, []);

  const triggerMagicCircle = useCallback(() => {
    if (magicTimerRef.current) window.clearTimeout(magicTimerRef.current);
    const key = Date.now();
    setMagicCircleKey(key);
    magicTimerRef.current = window.setTimeout(() => {
      setMagicCircleKey(0);
      magicTimerRef.current = null;
    }, 4850);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (magicTimerRef.current) window.clearTimeout(magicTimerRef.current);
    };
  }, []);

  const saveNotes = useCallback(
    (textToSave = noteText, imgsToSave = images) => {
      localStorage.setItem('stary_sea_note_data', textToSave);
      localStorage.setItem('stary_sea_note_images', JSON.stringify(imgsToSave));
    },
    [noteText, images]
  );

  const saveAndExitWriting = useCallback(() => {
    saveNotes(noteText, images);
    setWritingMode(false);
    notify('Đã lưu ghi chú');
  }, [noteText, images, saveNotes, notify]);

  const restoreArchiveToNote = (text: string) => {
    setNoteText(text);
    saveNotes(text, images);
    setIsVisible(true);
    setShowArchiveModal(false);
    setArchiveMenu(null);
    notify('Đã lấy nội dung ra ghi chú');
  };

  const insertCheckbox = useCallback(() => {
    if (!writingMode) {
      setWritingMode(true);
    }
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart ?? noteText.length;
      const end = ta.selectionEnd ?? noteText.length;
      const next = noteText.slice(0, start) + '☐ ' + noteText.slice(end);
      setNoteText(next);
      setTimeout(() => {
        ta.focus();
        ta.setSelectionRange(start + 2, start + 2);
      }, 10);
    } else {
      setNoteText((prev) => (prev ? prev + '\n☐ ' : '☐ '));
    }
  }, [writingMode, noteText]);

  // Global mouse move / up for dragging & 8-way resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragRef.current.active) {
        const nextX = Math.max(
          0,
          Math.min(window.innerWidth - 100, e.clientX - dragRef.current.offsetX)
        );
        const nextY = Math.max(
          0,
          Math.min(window.innerHeight - 80, e.clientY - dragRef.current.offsetY)
        );
        setPos({ x: nextX, y: nextY });
      } else if (resizeRef.current.active && resizeRef.current.edge) {
        const { edge, startX, startY, startW, startH, startPosX, startPosY } =
          resizeRef.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const minW = 240;
        const minH = 240;

        let nextW = startW;
        let nextH = startH;
        let nextX = startPosX;
        let nextY = startPosY;

        if (edge === 'right' || edge === 'top_right' || edge === 'bottom_right') {
          nextW = Math.max(minW, startW + dx);
        } else if (edge === 'left' || edge === 'top_left' || edge === 'bottom_left') {
          const candidateW = startW - dx;
          if (candidateW >= minW) {
            nextW = candidateW;
            nextX = startPosX + dx;
          } else {
            nextW = minW;
            nextX = startPosX + (startW - minW);
          }
        }

        if (edge === 'bottom' || edge === 'bottom_left' || edge === 'bottom_right') {
          nextH = Math.max(minH, startH + dy);
        } else if (edge === 'top' || edge === 'top_left' || edge === 'top_right') {
          const candidateH = startH - dy;
          if (candidateH >= minH) {
            nextH = candidateH;
            nextY = startPosY + dy;
          } else {
            nextH = minH;
            nextY = startPosY + (startH - minH);
          }
        }

        setPos({ x: nextX, y: nextY });
        setSize({ width: nextW, height: nextH });
      }
    };

    const handleMouseUp = () => {
      dragRef.current.active = false;
      resizeRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      const key = e.key.toLowerCase();
      if (key === 's') {
        e.preventDefault();
        saveNotes(noteText, images);
        setWritingMode(false);
        notify('Đã lưu ghi chú');
      } else if (key === 'w') {
        e.preventDefault();
        saveNotes(noteText, images);
        setWritingMode(false);
        setIsVisible(false);
        notify('Đã lưu & thu nhỏ cửa sổ');
      } else if (key === 'n') {
        e.preventDefault();
        setNoteText('');
        setImages([]);
        setWritingMode(true);
        notify('Ghi chú mới');
      } else if (key === 'm') {
        e.preventDefault();
        insertCheckbox();
      } else if (key === 't') {
        e.preventDefault();
        setCustomStyle((prev) => ({
          ...prev,
          bgMode: prev.bgMode === 'translucent' ? 'solid' : 'translucent',
        }));
        notify('Đã bật chế độ nền mờ');
      } else if (key === 'r') {
        e.preventDefault();
        setCustomStyle((prev) => ({ ...prev, bgMode: 'transparent' }));
        notify('Đã bật chế độ nền trong suốt');
      } else if (key === 'y') {
        e.preventDefault();
        setCustomStyle(DEFAULT_STYLE);
        notify('Khôi phục giao diện mặc định');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [noteText, images, saveNotes, notify, insertCheckbox]);

  // Close menus on outside click
  useEffect(() => {
    const closeMenus = () => {
      setContextMenu(null);
      setArchiveMenu(null);
    };
    window.addEventListener('click', closeMenus);
    return () => window.removeEventListener('click', closeMenus);
  }, []);

  const startDrag = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    dragRef.current = {
      active: true,
      offsetX: e.clientX - pos.x,
      offsetY: e.clientY - pos.y,
    };
  };

  const startResize = (e: React.MouseEvent, edge: ResizeDirection) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    resizeRef.current = {
      active: true,
      edge,
      startX: e.clientX,
      startY: e.clientY,
      startW: size.width,
      startH: size.height,
      startPosX: pos.x,
      startPosY: pos.y,
    };
  };

  const toggleCheckboxOnLine = (lineIdx: number) => {
    const nextLines = noteText.split('\n');
    const line = nextLines[lineIdx];
    if (!line) return;
    if (line.includes('☐')) {
      nextLines[lineIdx] = line.replace('☐', '☑');
    } else if (line.includes('☑')) {
      nextLines[lineIdx] = line.replace('☑', '☐');
    }
    const updated = nextLines.join('\n');
    setNoteText(updated);
    saveNotes(updated, images);
  };

  const archiveCurrentNote = () => {
    const trimmed = noteText.trim();
    if (!trimmed) {
      notify('Ghi chú đang trống!');
      return;
    }
    const nextArchives = [...archives, trimmed];
    setArchives(nextArchives);
    localStorage.setItem('stary_sea_note_archive', JSON.stringify(nextArchives));
    setNoteText('');
    setImages([]);
    saveNotes('', []);
    notify('Đã đưa ghi chú vào lưu trữ');
  };

  const deleteArchiveItem = (indexToDelete: number) => {
    const next = archives.filter((_, idx) => idx !== indexToDelete);
    setArchives(next);
    localStorage.setItem('stary_sea_note_archive', JSON.stringify(next));
    setArchiveMenu(null);
    notify('Đã xóa mục lưu trữ');
  };

  const exportArchiveItem = (text: string, idx: number) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `note_archive_${idx + 1}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Đã tải xuống file .txt');
  };

  const handleInsertImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const maxW = size.width - 60;
        const maxH = size.height - 80;
        const scale = Math.min(1, maxW / img.width, maxH / img.height);
        const newImg: InsertedImage = {
          id: `${Date.now()}`,
          src: dataUrl,
          width: Math.round(img.width * scale),
          height: Math.round(img.height * scale),
        };
        const nextImgs = [...images, newImg];
        setImages(nextImgs);
        saveNotes(noteText, nextImgs);
        notify('Đã chèn hình ảnh');
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const lines = useMemo(() => noteText.split('\n'), [noteText]);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-transparent">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/bmp,image/gif"
        className="hidden"
        onChange={handleInsertImage}
      />

      {/* Toast Feedback */}
      {statusToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#292c45]/95 backdrop-blur-md text-[#dbe3ff] text-xs font-medium px-4 py-2 rounded-xl shadow-lg border border-white/10">
          {statusToast}
        </div>
      )}

      {/* Main Sticky Note Window (The core application window) */}
      {isVisible && (
        <div
          style={{
            left: pos.x,
            top: pos.y,
            width: size.width,
            height: size.height,
            zIndex: pinned ? 30 : 20,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              startDrag(e);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setContextMenu({
              x: Math.min(e.clientX, window.innerWidth - 220),
              y: Math.min(e.clientY, window.innerHeight - 380),
            });
          }}
          className="absolute p-[10px] transition-shadow"
        >
          <div
            style={{
              backgroundColor:
                customStyle.bgMode === 'transparent'
                  ? 'transparent'
                  : customStyle.bgMode === 'translucent'
                  ? 'rgba(41, 44, 69, 0.42)'
                  : customStyle.bgColor,
              color: customStyle.textColor,
              fontFamily: customStyle.fontFamily,
              fontSize: `${customStyle.fontSize}px`,
              borderRadius: '15px',
              cursor: 'url("./butchi.png") 8 8, text',
            }}
            className={`w-full h-full relative overflow-hidden shadow-2xl flex flex-col justify-center items-center py-[14px] pl-[15px] pr-0 ${
              customStyle.bgMode === 'transparent'
                ? 'border border-dashed border-white/25'
                : customStyle.bgMode === 'translucent'
                ? 'backdrop-blur-md border border-white/15'
                : 'border border-white/10'
            }`}
          >
            {/* Faded background watermark */}
            {customStyle.bgMode !== 'transparent' && (
              <img
                src={LOGO_SRC}
                alt=""
                draggable={false}
                className="pointer-events-none select-none absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-56 h-56 object-contain opacity-[0.06] blur-[0.5px] z-0"
              />
            )}

            {/* Mode badge indicator */}
            <div
              onMouseDown={startDrag}
              className="w-full flex items-center justify-between text-[11px] opacity-80 pb-1.5 pr-[15px] cursor-move select-none relative z-10"
            >
              <span className="flex items-center gap-1.5">
                {pinned && <Pin className="w-3.5 h-3.5" />}
                {writingMode ? (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Đang sửa ghi chú</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Chỉ đọc</span>
                  </>
                )}
              </span>
            </div>

            {/* Note Content Area */}
            <div className="w-full flex-1 overflow-y-auto pr-[12px] relative z-10">
              {writingMode ? (
                <textarea
                  ref={textareaRef}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Nhập ghi chú..."
                  style={{
                    color: customStyle.textColor,
                    fontFamily: customStyle.fontFamily,
                    fontSize: `${customStyle.fontSize}px`,
                    cursor: 'url("./butchi.png") 8 8, text',
                  }}
                  className="w-full h-full bg-transparent resize-none focus:outline-none leading-relaxed select-text"
                />
              ) : (
                <div
                  onDoubleClick={() => {
                    setWritingMode(true);
                    setTimeout(() => textareaRef.current?.focus(), 20);
                  }}
                  className="w-full min-h-full leading-relaxed whitespace-pre-wrap break-words"
                >
                  {lines.map((line, idx) => {
                    const hasCheckbox = line.includes('☐') || line.includes('☑');
                    const isChecked = line.includes('☑');
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (hasCheckbox) toggleCheckboxOnLine(idx);
                        }}
                        className={`px-1.5 py-0.5 rounded transition-colors ${
                          hasCheckbox ? 'hover:bg-white/10 cursor-pointer' : ''
                        } ${isChecked ? 'opacity-65 line-through' : ''}`}
                      >
                        {line || '\u00A0'}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Inserted Images */}
              {images.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  {images.map((img) => (
                    <div key={img.id} className="relative group inline-block">
                      <img
                        src={img.src}
                        alt="Inserted note attachment"
                        style={{ width: Math.min(img.width, size.width - 60) }}
                        className="rounded-lg border border-white/20 object-contain"
                      />
                      {writingMode && (
                        <button
                          onClick={() => {
                            const next = images.filter((i) => i.id !== img.id);
                            setImages(next);
                            saveNotes(noteText, next);
                          }}
                          className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          title="Xóa ảnh"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top-right Starry Sea Draggable Logo Icon */}
          <img
            src={LOGO_SRC}
            alt="Kéo ghi chú"
            title="Kéo để di chuyển cửa sổ"
            onMouseDown={startDrag}
            draggable={false}
            className="absolute -top-1 -right-1 w-[38px] h-[38px] object-contain cursor-pointer hover:scale-110 transition-transform z-30 drop-shadow-md"
          />

          {/* 8-Way Resize Handles (4 Edges + 4 Corners) */}
          {RESIZE_HANDLES.map(({ edge, className }) => (
            <div
              key={edge}
              onMouseDown={(e) => startResize(e, edge)}
              className={`absolute z-20 ${className}`}
            />
          ))}
        </div>
      )}

      {/* Right-Click Context Menu */}
      {contextMenu && (
        <div
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 min-w-[210px] bg-[#292c45]/95 backdrop-blur-md border border-white/10 text-[#b0b8d4] text-sm shadow-2xl rounded-xl py-1.5"
        >
          {/* 1. Viết ghi chú / Khóa ghi chú */}
          <button
            onClick={() => {
              const nextMode = !writingMode;
              setWritingMode(nextMode);
              if (nextMode) setTimeout(() => textareaRef.current?.focus(), 20);
              setContextMenu(null);
            }}
            className={MENU_ITEM_CLS}
          >
            <Edit3 className="w-4 h-4" /> {writingMode ? 'Khóa ghi chú' : 'Viết ghi chú'}
          </button>

          {/* 2. Lưu ghi chú */}
          <button
            onClick={() => {
              saveAndExitWriting();
              setContextMenu(null);
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-white/10 hover:text-white flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <Save className="w-4 h-4" /> Lưu ghi chú
            </span>
            <span className="text-xs opacity-70">Ctrl+S</span>
          </button>

          {/* 3. Chèn hình ảnh */}
          <button
            onClick={() => {
              fileInputRef.current?.click();
              setContextMenu(null);
            }}
            className={MENU_ITEM_CLS}
          >
            <ImageIcon className="w-4 h-4" /> Chèn hình ảnh
          </button>

          {/* 4. Định dạng văn bản (Submenu) */}
          {(() => {
            const openSubLeft =
              typeof window !== 'undefined' && contextMenu.x + 430 > window.innerWidth;
            const openSubUp =
              typeof window !== 'undefined' && contextMenu.y + 390 > window.innerHeight;
            return (
              <div
                onMouseEnter={() =>
                  setContextMenu((prev) => (prev ? { ...prev, showFormatSub: true } : null))
                }
                onMouseLeave={() =>
                  setContextMenu((prev) => (prev ? { ...prev, showFormatSub: false } : null))
                }
                className="relative"
              >
                <button className="w-full text-left px-3.5 py-2 hover:bg-white/10 hover:text-white flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2.5">
                    <Type className="w-4 h-4" /> Định dạng văn bản
                  </span>
                  <span>{openSubLeft ? '◂' : '▸'}</span>
                </button>

                {contextMenu.showFormatSub && (
                  <div
                    className={`absolute z-50 ${
                      openSubLeft ? 'right-full pr-1.5' : 'left-full pl-1.5'
                    } ${openSubUp ? 'bottom-0' : 'top-0'}`}
                  >
                    <div className="min-w-[205px] bg-[#292c45]/95 backdrop-blur-md border border-white/10 text-[#b0b8d4] text-sm shadow-2xl rounded-xl py-1.5">
                      <button
                        onClick={() => {
                          setShowFontModal(true);
                          setContextMenu(null);
                        }}
                        className={SUBMENU_ITEM_CLS}
                      >
                        <Type className="w-4 h-4" /> Phông chữ & Cỡ chữ
                      </button>
                      <button
                        onClick={() => {
                          setShowColorModal('text');
                          setContextMenu(null);
                        }}
                        className={SUBMENU_ITEM_CLS}
                      >
                        <Palette className="w-4 h-4" /> Màu chữ
                      </button>
                      <button
                        onClick={() => {
                          setShowColorModal('bg');
                          setContextMenu(null);
                        }}
                        className={SUBMENU_ITEM_CLS}
                      >
                        <Palette className="w-4 h-4" /> Màu nền
                      </button>
                      <div className="my-1 border-t border-white/10" />
                      <button
                        onClick={() => {
                          setCustomStyle((prev) => ({
                            ...prev,
                            bgMode: prev.bgMode === 'translucent' ? 'solid' : 'translucent',
                          }));
                          setContextMenu(null);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-white/10 hover:text-white flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> Nền mờ
                        </span>
                        <span className="text-xs opacity-70">Ctrl+T</span>
                      </button>
                      <button
                        onClick={() => {
                          setCustomStyle((prev) => ({
                            ...prev,
                            bgMode: prev.bgMode === 'transparent' ? 'solid' : 'transparent',
                          }));
                          setContextMenu(null);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-white/10 hover:text-white flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Eye className="w-4 h-4" /> Nền trong suốt
                        </span>
                        <span className="text-xs opacity-70">Ctrl+R</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 5. Bỏ ghim cửa sổ / Ghim cửa sổ */}
          <button
            onClick={() => {
              setPinned(!pinned);
              setContextMenu(null);
            }}
            className={MENU_ITEM_CLS}
          >
            <Pin className="w-4 h-4" /> {pinned ? 'Bỏ ghim cửa sổ' : 'Ghim cửa sổ'}
          </button>

          {/* 6. Khởi động cùng máy */}
          <button
            onClick={() => {
              setStartupEnabled(!startupEnabled);
              notify(
                startupEnabled
                  ? 'Đã tắt khởi động cùng hệ thống'
                  : 'Đã bật khởi động cùng hệ thống'
              );
              setContextMenu(null);
            }}
            className={MENU_ITEM_CLS}
          >
            <RotateCcw className="w-4 h-4" />
            {startupEnabled ? 'Tắt khởi động cùng máy' : 'Khởi động cùng máy'}
          </button>

          {/* 7. Phím tắt */}
          <button
            onClick={() => {
              setShowHelpModal(true);
              setContextMenu(null);
            }}
            className={MENU_ITEM_CLS}
          >
            <HelpCircle className="w-4 h-4" /> Phím tắt
          </button>

          {/* 8. Hello, Etar nè */}
          <button
            onClick={() => {
              triggerMagicCircle();
              setContextMenu(null);
            }}
            className={MENU_ITEM_CLS}
          >
            <Wand2 className="w-4 h-4 text-indigo-300" /> Hello, Etar nè
          </button>

          <div className="my-1 border-t border-white/15" />

          {/* 9 & 10. Hai mục của Lưu trữ */}
          <button
            onClick={() => {
              archiveCurrentNote();
              setContextMenu(null);
            }}
            className={MENU_ITEM_CLS}
          >
            <Archive className="w-4 h-4" /> Lưu trữ ghi chú này
          </button>
          <button
            onClick={() => {
              setShowArchiveModal(true);
              setContextMenu(null);
            }}
            className={MENU_ITEM_CLS}
          >
            <Eye className="w-4 h-4" /> Xem kho lưu trữ
          </button>

          <div className="my-1 border-t border-white/15" />

          {/* 11. Thoát */}
          <button
            onClick={() => {
              saveNotes(noteText, images);
              setIsVisible(false);
              setContextMenu(null);
              notify('Đã ẩn cửa sổ ghi chú');
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-white/10 flex items-center justify-between text-red-300 cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <X className="w-4 h-4" /> Thoát
            </span>
            <span className="text-xs opacity-70">Ctrl+W</span>
          </button>
        </div>
      )}

      {/* Shortcuts Dialog */}
      {showHelpModal && (
        <div
          onClick={() => setShowHelpModal(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#292c45',
              backgroundImage: 'url("./bgss.png")',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '220px 220px',
              backgroundPosition: 'left -110px bottom -110px',
            }}
            className="w-full max-w-md rounded-2xl p-5 text-[#b0b8d4] shadow-2xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Phím tắt</h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20 backdrop-blur-xs">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-white">
                    <th className="py-2 px-3 font-semibold">Phím tắt</th>
                    <th className="py-2 px-3 font-semibold">Chức năng</th>
                  </tr>
                </thead>
                <tbody>
                  {SHORTCUTS.map((s, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-none">
                      <td className="py-2 px-3 font-mono text-xs text-[#dbe3ff]">{s.key}</td>
                      <td className="py-2 px-3 text-[#b0b8d4]">{s.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* "Hello, Etar nè" — Animated Arcane Magic Circle & Full-Screen Sparse Stardust */}
      {magicCircleKey > 0 && (
        <div
          key={magicCircleKey}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        >
          {/* Sparse, softly glowing stardust particles across the entire screen */}
          <div className="absolute inset-0">
            {STARDUST_PARTICLES.map((p, idx) => (
              <span
                key={idx}
                style={
                  {
                    left: p.left,
                    top: p.top,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    '--star-delay': p.delay,
                    '--star-duration': p.duration,
                    '--star-opacity': p.opacity,
                    boxShadow:
                      '0 0 10px 3px rgba(185, 205, 255, 0.75), 0 0 22px 6px rgba(125, 148, 255, 0.45)',
                  } as React.CSSProperties
                }
                className="animate-stardust absolute rounded-full bg-[#eef2ff] blur-[0.6px]"
              />
            ))}
          </div>

          {/* Master Magic Circle Container */}
          <div className="animate-magic-master relative w-[480px] h-[480px] flex items-center justify-center">
            <svg width="0" height="0" className="absolute">
              <defs>
                <filter id="arcane-bloom" x="-35%" y="-35%" width="170%" height="170%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur1" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="6.5" result="blur2" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur3" />
                  <feMerge>
                    <feMergeNode in="blur3" />
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </svg>

            {/* Stage 1 (0.05s): Core Emblem + Smooth Inner Ring & Principled 6-Fold Uneven Ring */}
            <div className="animate-stage-1 absolute inset-0 flex items-center justify-center">
              <div
                className="absolute w-52 h-52 rounded-full blur-2xl"
                style={{
                  background:
                    'radial-gradient(circle, rgba(165,188,255,0.48) 0%, rgba(114,134,220,0.2) 55%, transparent 75%)',
                }}
              />
              <svg
                viewBox="0 0 400 400"
                style={{ filter: 'url(#arcane-bloom)' }}
                className="animate-magic-cw absolute inset-0 w-full h-full drop-shadow-[0_0_14px_rgba(175,198,255,0.85)]"
              >
                <circle
                  cx="200"
                  cy="200"
                  r="56"
                  fill="none"
                  stroke="#9eb5ff"
                  strokeWidth="1.2"
                  opacity="0.8"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="63"
                  fill="none"
                  stroke="#dbe5ff"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeDasharray="34 6 3 6 8 8"
                  opacity="0.92"
                />
              </svg>
              <img
                src={LOGO_SRC}
                alt=""
                className="w-26 h-26 object-contain drop-shadow-[0_0_16px_rgba(225,235,255,0.95)] drop-shadow-[0_0_34px_rgba(138,165,255,0.85)]"
              />
            </div>

            {/* Stage 2 (0.42s): Hexagram — Combining Smooth Continuous & Principled Segmented Geometry */}
            <div className="animate-stage-2 absolute inset-0 flex items-center justify-center">
              <svg
                viewBox="0 0 400 400"
                style={{ filter: 'url(#arcane-bloom)' }}
                className="animate-magic-ccw w-full h-full drop-shadow-[0_0_16px_rgba(165,190,255,0.9)]"
              >
                <circle
                  cx="200"
                  cy="200"
                  r="116"
                  fill="none"
                  stroke="#eef3ff"
                  strokeWidth="1.8"
                  opacity="0.95"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="106"
                  fill="none"
                  stroke="#a8bfff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="52 7 3 7 18 7 3 14"
                  opacity="0.88"
                />

                <polygon
                  points="200,84 300,258 100,258"
                  fill="none"
                  stroke="#e4ebff"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                  opacity="0.92"
                />

                <polygon
                  points="200,316 300,142 100,142"
                  fill="none"
                  stroke="#eef3ff"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="42 9 6 9 68 9 6 9 42.7"
                  opacity="0.95"
                />

                {HEX_ANGLES.map((angle) => (
                  <g key={angle} transform={`rotate(${angle} 200 200)`}>
                    <path
                      d="M193 87 A 7.5 7.5 0 1 1 207 87"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                    <polygon
                      points="200,77 203.5,84 200,90 196.5,84"
                      fill="#ffffff"
                      opacity="0.95"
                    />
                  </g>
                ))}
              </svg>
            </div>

            {/* Stage 3 (0.82s): Octagram — Smooth Square + Symmetric Segmented Square */}
            <div className="animate-stage-3 absolute inset-0 flex items-center justify-center">
              <svg
                viewBox="0 0 400 400"
                style={{ filter: 'url(#arcane-bloom)' }}
                className="animate-magic-cw w-full h-full drop-shadow-[0_0_18px_rgba(155,180,255,0.9)]"
              >
                <circle
                  cx="200"
                  cy="200"
                  r="152"
                  fill="none"
                  stroke="#dbe3ff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeDasharray="62 8 3 8 16.4 8 3 11"
                  opacity="0.9"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="138"
                  fill="none"
                  stroke="#9fb6ff"
                  strokeWidth="1.3"
                  opacity="0.82"
                />

                <rect
                  x="78"
                  y="78"
                  width="244"
                  height="244"
                  fill="none"
                  stroke="#c8d6ff"
                  strokeWidth="1.5"
                  opacity="0.88"
                />

                <rect
                  x="78"
                  y="78"
                  width="244"
                  height="244"
                  fill="none"
                  stroke="#eef3ff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeDasharray="46 10 5 10 102 10 5 10 46"
                  opacity="0.92"
                  transform="rotate(45 200 200)"
                />
              </svg>
            </div>

            {/* Stage 4 (1.22s): Grand Celestial Rim */}
            <div className="animate-stage-4 absolute inset-0 flex items-center justify-center">
              <div
                className="absolute inset-4 rounded-full blur-3xl"
                style={{
                  background:
                    'radial-gradient(circle, rgba(145,170,255,0.28) 0%, rgba(103,114,171,0.12) 60%, transparent 80%)',
                }}
              />
              <svg
                viewBox="0 0 400 400"
                style={{ filter: 'url(#arcane-bloom)' }}
                className="animate-magic-ccw w-full h-full drop-shadow-[0_0_22px_rgba(180,205,255,0.95)]"
              >
                <circle
                  cx="200"
                  cy="200"
                  r="188"
                  fill="none"
                  stroke="#eef3ff"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeDasharray="74 9 4 9 24.65 9 4 14"
                  opacity="0.9"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="176"
                  fill="none"
                  stroke="#aec4ff"
                  strokeWidth="2.3"
                  opacity="0.95"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="167"
                  fill="none"
                  stroke="#dbe3ff"
                  strokeWidth="1.2"
                  strokeDasharray="6 6"
                  opacity="0.78"
                />

                {OCT_ANGLES.map((angle) => (
                  <g key={angle} transform={`rotate(${angle} 200 200)`}>
                    <path
                      d="M200 7 L205.5 20 L203 22.5 L205 28 L200 39 L195 28 L197 22.5 L194.5 20 Z"
                      fill="none"
                      stroke="#eef3ff"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                      opacity="0.95"
                    />
                    <polygon
                      points="200,12 203,22 200,33 197,22"
                      fill="#dbe3ff"
                      opacity="0.85"
                    />
                    <circle cx="184" cy="25" r="1.8" fill="#eef3ff" opacity="0.85" />
                    <circle cx="216" cy="25" r="1.8" fill="#eef3ff" opacity="0.85" />
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Archived Notes Dialog */}
      {showArchiveModal && (
        <div
          onClick={() => {
            setShowArchiveModal(false);
            setArchiveMenu(null);
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              setArchiveMenu(null);
            }}
            className="w-full max-w-lg max-h-[80vh] flex flex-col bg-[#292c45] text-[#b0b8d4] rounded-2xl p-5 shadow-2xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Ghi chú đã lưu trữ</h2>
              <button
                onClick={() => setShowArchiveModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
              {archives.length === 0 ? (
                <div className="text-center py-12 text-[#b0b8d4]/60 text-sm">
                  Chưa có ghi chú nào trong kho lưu trữ.
                </div>
              ) : (
                archives.map((item, idx) => (
                  <div
                    key={idx}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setArchiveMenu({ x: e.clientX, y: e.clientY, index: idx });
                    }}
                    className="bg-[#1e2136]/90 border border-white/10 rounded-xl p-3 flex flex-col gap-2"
                  >
                    <pre className="whitespace-pre-wrap font-sans text-sm text-[#dbe3ff] select-text">
                      {item}
                    </pre>
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/10 text-xs">
                      <button
                        onClick={() => restoreArchiveToNote(item)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-500/25 hover:bg-indigo-500/40 text-indigo-200 border border-indigo-400/30 cursor-pointer"
                      >
                        <FileText className="w-3 h-3" /> Ghi note
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item);
                          notify('Đã sao chép vào bộ nhớ tạm');
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                      >
                        <Copy className="w-3 h-3" /> Sao chép tất cả
                      </button>
                      <button
                        onClick={() => exportArchiveItem(item, idx)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                      >
                        <Download className="w-3 h-3" /> Xuất file .txt
                      </button>
                      <button
                        onClick={() => deleteArchiveItem(idx)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-200 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Xóa
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Archive Right-Click Context Menu */}
          {archiveMenu && (
            <div
              style={{ left: archiveMenu.x, top: archiveMenu.y }}
              onClick={(e) => e.stopPropagation()}
              className="fixed z-50 bg-[#292c45] border border-white/15 text-[#b0b8d4] text-sm rounded-xl shadow-xl py-1.5 min-w-[200px]"
            >
              <button
                onClick={() => restoreArchiveToNote(archives[archiveMenu.index] || '')}
                className="w-full text-left px-3.5 py-2 hover:bg-white/10 hover:text-white flex items-center justify-between cursor-pointer"
              >
                <span>Ghi note</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(archives[archiveMenu.index] || '');
                  setArchiveMenu(null);
                  notify('Đã sao chép toàn bộ văn bản');
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-white/10 hover:text-white flex items-center justify-between cursor-pointer"
              >
                <span>Sao chép tất cả</span>
                <span className="text-xs opacity-70">Ctrl+Shift+C</span>
              </button>
              <button
                onClick={() => deleteArchiveItem(archiveMenu.index)}
                className="w-full text-left px-3.5 py-2 hover:bg-white/10 hover:text-white flex items-center justify-between cursor-pointer"
              >
                <span>Xóa mục lưu trữ này</span>
                <span className="text-xs opacity-70">Del</span>
              </button>
              <button
                onClick={() => {
                  exportArchiveItem(archives[archiveMenu.index] || '', archiveMenu.index);
                  setArchiveMenu(null);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-white/10 hover:text-white flex items-center justify-between cursor-pointer"
              >
                <span>Xuất ra file...</span>
                <span className="text-xs opacity-70">Ctrl+E</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Font Dialog */}
      {showFontModal && (
        <div
          onClick={() => setShowFontModal(false)}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#292c45',
              backgroundImage: 'url("./bgss.png")',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '200px 200px',
              backgroundPosition: 'left -100px bottom -100px',
            }}
            className="w-full max-w-sm rounded-2xl p-5 text-[#b0b8d4] shadow-2xl border border-white/10 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Định dạng văn bản</h2>
              <button
                onClick={() => setShowFontModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <label className="flex flex-col gap-1 text-xs">
              <span>Phông chữ</span>
              <select
                value={customStyle.fontFamily}
                onChange={(e) =>
                  setCustomStyle((prev) => ({ ...prev, fontFamily: e.target.value }))
                }
                className="bg-[#1e2136] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#dbe3ff]"
              >
                <option value="sans-serif">Không chân - Sans Serif</option>
                <option value="serif">Có chân - Serif</option>
                <option value="monospace">Đơn cách - Monospace</option>
                <option value="'Segoe UI', sans-serif">Segoe UI</option>
                <option value="cursive">Chữ viết tay - Cursive</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs">
              <span>Cỡ chữ: {customStyle.fontSize}px</span>
              <input
                type="range"
                min={11}
                max={28}
                value={customStyle.fontSize}
                onChange={(e) =>
                  setCustomStyle((prev) => ({ ...prev, fontSize: Number(e.target.value) }))
                }
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setCustomStyle(DEFAULT_STYLE);
                  setShowFontModal(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white cursor-pointer"
              >
                Khôi phục mặc định
              </button>
              <button
                onClick={() => setShowFontModal(false)}
                className="px-4 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs text-white font-semibold cursor-pointer"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Color Picker Dialog */}
      {showColorModal && (
        <div
          onClick={() => setShowColorModal(null)}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#292c45',
              backgroundImage: 'url("./bgss.png")',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '200px 200px',
              backgroundPosition: 'left -100px bottom -100px',
            }}
            className="w-full max-w-xs rounded-2xl p-5 text-[#b0b8d4] shadow-2xl border border-white/10 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                {showColorModal === 'text' ? 'Chọn màu chữ' : 'Chọn màu nền'}
              </h2>
              <button
                onClick={() => setShowColorModal(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="color"
              value={
                showColorModal === 'text' ? customStyle.textColor : customStyle.bgColor
              }
              onChange={(e) => {
                const val = e.target.value;
                if (showColorModal === 'text') {
                  setCustomStyle((prev) => ({ ...prev, textColor: val }));
                } else {
                  setCustomStyle((prev) => ({
                    ...prev,
                    bgColor: val,
                    bgMode: 'solid',
                  }));
                }
              }}
              className="w-full h-14 rounded-lg cursor-pointer bg-transparent"
            />

            <div className="flex justify-end">
              <button
                onClick={() => setShowColorModal(null)}
                className="px-4 py-1.5 rounded-lg bg-white/25 hover:bg-white/35 text-xs text-white font-semibold cursor-pointer"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
