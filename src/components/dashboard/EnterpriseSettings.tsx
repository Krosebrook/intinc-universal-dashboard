/**
 * Enterprise Settings Component
 * TODO: Implement full enterprise settings functionality
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface EnterpriseSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EnterpriseSettings({ open, onOpenChange }: EnterpriseSettingsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enterprise Settings</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            Enterprise settings will be available soon.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
