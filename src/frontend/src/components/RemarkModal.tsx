import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface RemarkModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (remark: string) => void;
  title: string;
  confirmLabel?: string;
  confirmVariant?: "default" | "destructive";
  loading?: boolean;
}

export function RemarkModal({
  open,
  onClose,
  onConfirm,
  title,
  confirmLabel = "Confirm",
  confirmVariant = "default",
  loading = false,
}: RemarkModalProps) {
  const [remark, setRemark] = useState("");

  const handleConfirm = () => {
    if (!remark.trim()) return;
    onConfirm(remark.trim());
    setRemark("");
  };

  const handleClose = () => {
    setRemark("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Textarea
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="Enter your remarks / reason..."
          rows={4}
          className="resize-none"
        />
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={!remark.trim() || loading}
          >
            {loading ? "Processing..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
