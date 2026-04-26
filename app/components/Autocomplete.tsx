"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

export interface AutocompleteOption {
  label: string;
  value: string;
}

interface AutocompleteProps {
  options: AutocompleteOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  onBlur: () => void;
  onAdd?: (label: string) => void;
  error?: boolean;
  placeholder?: string;
}

export default function Autocomplete({
  options,
  value,
  onChange,
  onBlur,
  onAdd,
  error,
  placeholder,
}: AutocompleteProps) {
  const [inputText, setInputText] = useState(
    () => options.find((o) => o.value === value)?.label ?? "",
  );
  const [prevValue, setPrevValue] = useState<string | null>(value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  if (prevValue !== value) {
    setPrevValue(value);
    const label = options.find((o) => o.value === value)?.label ?? "";
    setInputText(value ? label : "");
  }

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(inputText.toLowerCase()),
  );

  const trimmed = inputText.trim();
  const exactMatch = options.some(
    (o) => o.label.toLowerCase() === trimmed.toLowerCase(),
  );
  const showAddOption = !!onAdd && trimmed !== "" && !exactMatch;

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputText(e.target.value);
    setIsOpen(true);
    setActiveIndex(0);
    if (!e.target.value) onChange(null);
  }

  function handleSelect(option: AutocompleteOption) {
    setInputText(option.label);
    onChange(option.value);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleAdd() {
    onAdd!(trimmed);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const maxIndex = filtered.length - 1 + (showAddOption ? 1 : 0);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((i) => Math.min(i + 1, maxIndex));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (isOpen && activeIndex >= 0) {
        e.preventDefault();
        if (showAddOption && activeIndex === filtered.length) {
          handleAdd();
        } else if (filtered[activeIndex]) {
          handleSelect(filtered[activeIndex]);
        } else {
          setIsOpen(false);
          setActiveIndex(-1);
        }
      }
    } else if (e.key === "Escape" || e.key === "Tab") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={inputText}
        onChange={handleInputChange}
        onFocus={() => {
          setIsOpen(true);
          setActiveIndex(0);
        }}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="autocomplete-listbox"
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 ? `autocomplete-option-${activeIndex}` : undefined
        }
        className={clsx("input w-full", error && "input-error")}
      />
      {isOpen && (filtered.length > 0 || showAddOption || trimmed.length > 0) && (
        <ul
          id="autocomplete-listbox"
          role="listbox"
          className="menu bg-base-100 rounded-box shadow-lg border border-base-200 absolute z-10 w-full mt-1 max-h-60 overflow-y-auto p-1"
        >
          {filtered.length === 0 && !showAddOption && (
            <li className="px-4 py-2 text-sm text-base-content/50 select-none">
              No results found
            </li>
          )}
          {filtered.map((option, index) => (
            <li
              key={option.value}
              id={`autocomplete-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
            >
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(option)}
                className={clsx(index === activeIndex && "bg-base-content/10")}
              >
                {option.label}
              </button>
            </li>
          ))}
          {showAddOption && (
            <li
              id={`autocomplete-option-${filtered.length}`}
              role="option"
              aria-selected={activeIndex === filtered.length}
            >
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleAdd}
                className={clsx(
                  activeIndex === filtered.length && "bg-base-content/10",
                )}
              >
                {`Add "${trimmed}"`}
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
