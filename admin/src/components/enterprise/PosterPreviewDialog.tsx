import { EntDialog } from "./index";

interface Props {
  poster: string | null;
  caption?: string;
  onClose: () => void;
}

export function PosterPreviewDialog({ poster, caption, onClose }: Props) {
  return (
    <EntDialog
      open={!!poster}
      onClose={onClose}
      title={caption || "Kitob rasmi"}
      width={560}
    >
      {poster && (
        <div style={{ textAlign: "center" }}>
          <img
            src={poster}
            alt={caption || "Poster"}
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "70vh",
              margin: "0 auto",
              border: "1px solid var(--ent-border)",
              background: "var(--ent-bg)",
            }}
          />
        </div>
      )}
    </EntDialog>
  );
}
