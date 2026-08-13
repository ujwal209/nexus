"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { FiMoreVertical, FiEdit2, FiTrash2 } from "react-icons/fi";

interface Props {
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function WorkflowRowMenu({ onEdit, onDelete, isDeleting }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const t = setTimeout(() => {
      document.addEventListener("mousedown", close);
      document.addEventListener("scroll", close, true);
    }, 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", close);
      document.removeEventListener("scroll", close, true);
    };
  }, [open]);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <FiMoreVertical className="w-3.5 h-3.5" />
      </button>

      {open &&
        ReactDOM.createPortal(
          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 }}
            className="w-44 rounded-lg border border-border bg-card shadow-xl py-1 text-xs"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onEdit();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted text-foreground cursor-pointer text-left"
            >
              <FiEdit2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              Edit Workflow
            </button>
            <div className="my-1 border-t border-border" />
            <button
              type="button"
              disabled={isDeleting}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onDelete();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-red-500 hover:bg-red-500/8 cursor-pointer disabled:opacity-40 text-left"
            >
              <FiTrash2 className="w-3.5 h-3.5 shrink-0" />
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
