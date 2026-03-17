import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IUser } from "@/interface";
import { Send, X } from "lucide-react";
import { useState } from "react";

type MessageChannel = "both" | "web" | "telegram";

interface SendMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientCount?: number;
  recipients?: IUser[];
  isBroadcast?: boolean;
  onSend: (data: {
    title: string;
    message: string;
    channel: MessageChannel;
  }) => void;
}

export function SendMessageModal({
  open,
  onOpenChange,
  recipientCount,
  recipients,
  isBroadcast,
  onSend,
}: SendMessageModalProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<MessageChannel>("both");

  const handleSend = () => {
    if (!title.trim() || !message.trim()) return;
    onSend({ title, message, channel });
    // Reset form
    setTitle("");
    setMessage("");
    setChannel("both");
  };

  const handleClose = () => {
    setTitle("");
    setMessage("");
    setChannel("both");
    onOpenChange(false);
  };

  const isValid = title.trim().length > 0 && message.trim().length > 0;
  const count = recipientCount ?? recipients?.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            {isBroadcast ? "Xabar yuborish (Barchaga)" : "Xabar yuborish"}
            {!isBroadcast && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({count} ta foydalanuvchi)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">
              Sarlavha
            </Label>
            <Input
              id="title"
              placeholder="Xabar sarlavhasi..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-foreground">
              Xabar matni
            </Label>
            <Textarea
              id="message"
              placeholder="Xabar matnini kiriting..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-background border-border min-h-[120px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel" className="text-foreground">
              Yuborish kanali
            </Label>
            <Select
              value={channel}
              onValueChange={(v) => setChannel(v as MessageChannel)}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Kanalni tanlang" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="both">Web + Telegram</SelectItem>
                <SelectItem value="web">Faqat Web</SelectItem>
                <SelectItem value="telegram">Faqat Telegram</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-border"
          >
            <X className="mr-2 h-4 w-4" />
            Bekor qilish
          </Button>
          <Button
            onClick={handleSend}
            disabled={!isValid}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="mr-2 h-4 w-4" />
            Yuborish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
