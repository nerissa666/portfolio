"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 42;
const FONT_SIZE_STEP = 2;
const DEFAULT_FONT_SIZE = 16;

export function FontSizeControl() {
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  const updateFontSize = (newSize: number) => {
    if (newSize >= MIN_FONT_SIZE && newSize <= MAX_FONT_SIZE) {
      setFontSize(newSize);
      document.documentElement.style.setProperty(
        "--base-font-size",
        `${newSize}px`
      );
    }
  };

  const increaseFontSize = () => {
    updateFontSize(fontSize + FONT_SIZE_STEP);
  };

  const decreaseFontSize = () => {
    updateFontSize(fontSize - FONT_SIZE_STEP);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={decreaseFontSize}
        disabled={fontSize <= MIN_FONT_SIZE}
        className="h-8 w-8"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground w-8 text-center">
        {fontSize}px
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={increaseFontSize}
        disabled={fontSize >= MAX_FONT_SIZE}
        className="h-8 w-8"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
