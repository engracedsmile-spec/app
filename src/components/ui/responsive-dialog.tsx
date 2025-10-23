
"use client"

import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import React, { useState, type ReactNode } from "react";

interface ResponsiveDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  trigger?: ReactNode; // Make trigger optional
}

export const ResponsiveDialog = ({
  open,
  onOpenChange,
  children,
  trigger,
}: ResponsiveDialogProps) => {
  const isMobile = useIsMobile();
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const DialogComponent = isMobile ? Drawer : Dialog;
  const DialogContentComponent = isMobile ? DrawerContent : DialogContent;
  
  if (trigger) {
    return (
      <DialogComponent open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContentComponent>{children}</DialogContentComponent>
      </DialogComponent>
    );
  }

  // If no trigger is provided, just render the dialog/drawer structure
  return (
    <DialogComponent open={isOpen} onOpenChange={setIsOpen}>
      <DialogContentComponent>{children}</DialogContentComponent>
    </DialogComponent>
  );
};

    