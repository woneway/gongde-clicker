// 把结构化的文章 blocks 渲染成语义化 HTML。
// blocks 是纯数据（见 lib/blog/posts/*），这里不含任何客户端逻辑，
// 可在服务端组件中直接使用。
export function ArticleBody({ blocks = [] }) {
  return (
    <>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        switch (block.type) {
          case "h2":
            return <h2 key={key}>{block.text}</h2>;
          case "h3":
            return <h3 key={key}>{block.text}</h3>;
          case "p":
            return <p key={key}>{block.text}</p>;
          case "ul":
            return (
              <ul key={key}>
                {(block.items || []).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={key}>
                {(block.items || []).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote key={key}>
                <p>{block.text}</p>
                {block.cite ? <cite>{block.cite}</cite> : null}
              </blockquote>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
