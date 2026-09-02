import './Rating.css';

/**
 * 评分条。方块是画出来的不是 ▮▯ 字符 —— 点阵字体不一定有那些字形，
 * 画出来才能保证到处都是方的。
 */
export default function Rating({ value, max = 10 }) {
  if (value == null) return null;
  const filled = Math.max(0, Math.min(max, Math.round(value)));

  return (
    <span className="rating" role="img" aria-label={`${value} / ${max}`}>
      <span className="rating-bars" aria-hidden="true">
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={`rating-seg ${i < filled ? 'is-on' : ''}`} />
        ))}
      </span>
      <span className="rating-num" aria-hidden="true">{value}/{max}</span>
    </span>
  );
}
