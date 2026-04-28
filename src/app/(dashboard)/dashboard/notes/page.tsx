import EditorPanel from "@/components/layout/EditorPanel";
import NoteEditor from "@/components/notes/NoteEditor";

export default function NotesPage() {
  return (
    <div className="flex h-full">
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-300">메모를 선택하세요</p>
      </div>
      <EditorPanel>
        <NoteEditor />
      </EditorPanel>
    </div>
  );
}
