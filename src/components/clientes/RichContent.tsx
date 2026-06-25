/**
 * Renderiza o conteúdo do panorama (sem dependências de editor, leve).
 * Se for HTML (texto formatado novo), mostra formatado; se for texto puro
 * (conteúdo antigo), preserva as quebras de linha.
 */
export function RichContent({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(html);
  if (isHtml) {
    return (
      <div
        className={`rich-content ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return <p className={`whitespace-pre-wrap ${className}`}>{html}</p>;
}

export default RichContent;
