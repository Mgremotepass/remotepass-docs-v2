import MDEditor from "@uiw/react-md-editor";

interface EditorPaneProps {
  value: string;
  onChange: (value: string) => void;
}

export function EditorPane({ value, onChange }: EditorPaneProps) {
  return (
    <div className="editor-pane" data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val ?? "")}
        height="100%"
        preview="live"
        visibleDragbar={false}
      />
    </div>
  );
}
