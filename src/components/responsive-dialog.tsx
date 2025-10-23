/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

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

export { DialogContent };
/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
 * to the maximum extent possible under the law.
 *
 * @see https://github.com/mdtbmw
 */
