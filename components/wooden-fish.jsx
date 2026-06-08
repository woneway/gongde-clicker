// 真实质感的电子木鱼视觉：木鱼本体（木纹/高光/凹槽/鱼口）+ 红色蒲团 + 木鱼槌。
// 纯 SVG，无逐帧 JS；敲击动画交给 CSS（.wooden-fish.is-hit 下的 .muyu-mallet）。
// 该组件只负责"长什么样"，交互与计数仍由 gongde-clicker.jsx 负责。
export function WoodenFish({ isHit = false }) {
  return (
    <svg
      className={`muyu-svg ${isHit ? "is-hit" : ""}`}
      viewBox="0 0 240 230"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="muyu-wood" cx="38%" cy="32%" r="78%">
          <stop offset="0%" stopColor="#b9744a" />
          <stop offset="42%" stopColor="#8a4a2a" />
          <stop offset="78%" stopColor="#5f2f19" />
          <stop offset="100%" stopColor="#3f1e10" />
        </radialGradient>
        <linearGradient id="muyu-cushion" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8483a" />
          <stop offset="100%" stopColor="#8e2018" />
        </linearGradient>
        <radialGradient id="muyu-sheen" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff3d6" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff3d6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="muyu-stick" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c98a52" />
          <stop offset="100%" stopColor="#8a5a2e" />
        </linearGradient>
        <radialGradient id="muyu-knob" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#f0d9a8" />
          <stop offset="100%" stopColor="#c79a5c" />
        </radialGradient>
      </defs>

      {/* 蒲团（坐垫）——红色，提供辨识度与色彩冲击 */}
      <g className="muyu-cushion">
        <ellipse cx="120" cy="206" rx="104" ry="22" fill="rgba(40,18,10,0.18)" />
        <ellipse cx="120" cy="198" rx="98" ry="24" fill="url(#muyu-cushion)" />
        <ellipse
          cx="120"
          cy="198"
          rx="98"
          ry="24"
          fill="none"
          stroke="#f2c75a"
          strokeWidth="2.5"
          strokeOpacity="0.7"
        />
        <ellipse cx="120" cy="194" rx="70" ry="13" fill="rgba(255,255,255,0.14)" />
        {[58, 96, 134, 172].map((x) => (
          <line
            key={x}
            x1={x}
            y1="184"
            x2={x}
            y2="212"
            stroke="rgba(90,16,12,0.45)"
            strokeWidth="2"
          />
        ))}
      </g>

      {/* 木鱼本体 */}
      <g className="muyu-body">
        {/* 落地阴影 */}
        <ellipse cx="120" cy="182" rx="78" ry="16" fill="rgba(40,18,10,0.22)" />
        {/* 主体 */}
        <path
          d="M120 36
             C171 36 207 70 207 116
             C207 156 178 182 120 182
             C62 182 33 156 33 116
             C33 70 69 36 120 36 Z"
          fill="url(#muyu-wood)"
          stroke="#371a0d"
          strokeWidth="2"
        />
        {/* 顶部木纹凹槽（盘绕鱼身的卷线） */}
        <path
          d="M70 92 C92 64 150 64 172 96"
          fill="none"
          stroke="rgba(48,22,11,0.55)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M82 104 C100 84 142 84 160 108"
          fill="none"
          stroke="rgba(255,224,168,0.28)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* 鱼口（敲击发声口）——横向裂口 + 内阴影 + 上唇高光 */}
        <ellipse cx="120" cy="150" rx="58" ry="17" fill="#2a1209" />
        <ellipse cx="120" cy="150" rx="58" ry="17" fill="none" stroke="#1a0a05" strokeWidth="2" />
        <path
          d="M64 148 C90 138 150 138 176 148"
          fill="none"
          stroke="rgba(255,221,158,0.45)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse cx="120" cy="156" rx="40" ry="7" fill="rgba(0,0,0,0.4)" />
        {/* 左上高光 sheen */}
        <ellipse
          cx="86"
          cy="78"
          rx="40"
          ry="26"
          fill="url(#muyu-sheen)"
          transform="rotate(-24 86 78)"
        />
      </g>

      {/* 木鱼槌——细长握杆 + 小圆槌头，停在右上，敲击时摆动 */}
      <g className="muyu-mallet">
        <rect
          x="170"
          y="-6"
          width="11"
          height="74"
          rx="5.5"
          fill="url(#muyu-stick)"
          stroke="#5e3a18"
          strokeWidth="1.3"
          transform="rotate(40 175 0)"
        />
        <circle cx="150" cy="58" r="13" fill="url(#muyu-knob)" stroke="#9a7038" strokeWidth="1.5" />
        <ellipse cx="146" cy="54" rx="4.5" ry="3.2" fill="rgba(255,255,255,0.6)" />
      </g>
    </svg>
  );
}
