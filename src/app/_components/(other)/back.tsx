"use client";
import { Button } from "@/app/_components/ui/button";
import { Icon } from "@/app/_components/ui/icon";

export function BackButton() {
  return (
    <Button
      size="icon-lg"
      variant="ghost"
      onClick={() => {
        window.history.back();
      }}
    >
      <Icon name="ChevronLeft" />
      <p className="sr-only">Back</p>
    </Button>
  )
}
