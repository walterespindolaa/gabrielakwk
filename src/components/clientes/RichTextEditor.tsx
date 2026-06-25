import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Heading as HeadingIcon } from "lucide-react";

/**
 * Editor de texto rico (estilo Word) para o Panorama do diagnóstico.
 * - Negrito / Itálico com Ctrl/Cmd+B e Ctrl/Cmd+I (nativo)
 * - "- " no início da linha vira tópico; "1. " vira lista numerada (input rules)
 * - "## " vira subtítulo
 * Guarda o conteúdo como HTML.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [3] },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "rich-content min-h-[180px] w-full px-4 py-3 text-sm focus:outline-none",
        "data-placeholder": placeholder ?? "",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sincroniza quando o conteúdo chega de fora (ex.: carregamento inicial),
  // sem resetar o cursor durante a digitação.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && value !== "" ) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="min-h-[180px] w-full bg-card border border-border/60 rounded-xl" />
    );
  }

  const btn = (active: boolean) =>
    `inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm transition-colors ${
      active
        ? "bg-brand text-brand-foreground"
        : "text-foreground/70 hover:bg-muted hover:text-foreground"
    }`;

  return (
    <div className="bg-card border border-border/60 rounded-xl focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 transition-all overflow-hidden">
      <div className="flex items-center gap-1 border-b border-border/60 px-2 py-1.5 bg-surface-alt/60">
        <button
          type="button"
          title="Negrito (Ctrl/Cmd+B)"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btn(editor.isActive("bold"))}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Itálico (Ctrl/Cmd+I)"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btn(editor.isActive("italic"))}
        >
          <Italic className="w-4 h-4" />
        </button>
        <span className="w-px h-5 bg-border/60 mx-1" />
        <button
          type="button"
          title="Subtítulo"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={btn(editor.isActive("heading", { level: 3 }))}
        >
          <HeadingIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Tópicos (- )"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btn(editor.isActive("bulletList"))}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Lista numerada (1. )"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btn(editor.isActive("orderedList"))}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

export default RichTextEditor;
