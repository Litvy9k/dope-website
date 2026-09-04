import { useEffect, useRef, useState } from 'react';

import '../components/Layout.css';
import { useUI } from '../components/UIContext';
import Game from '@game/ui/Game.jsx';
import SaveControls from '@game/ui/SaveControls.jsx';
import './GamePage.css';

/**
 * temu-thea：一个六边形网格的生存小游戏。源码在 vendor/temu-thea 子模块里，
 * 由站点直接编译（不是 iframe），所以 CRT 外壳、底栏、语言都还是站点这一套。
 *
 * 游戏那边的 src/App.jsx 是它自己的开发外壳，文档里写明"搬进个人站时丢掉"。
 * 这个文件就是它在站点这边的替代品：只挂 <Game> 和 <SaveControls>。
 *
 * 语言不归游戏管，它只收一个 lang prop —— 这里直接接站点的语言状态，
 * 所以底栏那个中文开关会同时切游戏里的文案。
 */

/** 随机种子。用随机数不用时间戳：连点两下"新游戏"可能落在同一毫秒里 */
const newSeed = () => Math.floor(Math.random() * 0xffffffff);

/**
 * 跨栏目保留的那一局。
 *
 * 放在模块作用域是关键：切到别的栏目时这个组件会被卸载，组件内的 state
 * 跟着一起没；而模块只有整页刷新才会重新求值 —— 正好就是"切 tab 保留、
 * 刷新重来"。存 sessionStorage 反而不行，那个连刷新都留着。
 *
 * 存的是状态对象的引用，不是副本：游戏的状态是原地更新的（见
 * useHexGame 的注释），拿着引用读到的永远是最新的，回来时原样传回去
 * 就能接着玩 —— 那边 initialState 是直接拿来用的，不复制。
 */
let kept = null;

export default function GamePage() {
  const { lang } = useUI();

  /**
   * 一局 = { id, seed, state }。id 变了就换 key，React 会整个重挂 Game，
   * 于是"新游戏"和"读档"走同一条路，不用另写一套 reset。
   * 有上次留下的就接着那一局，没有才开新的。
   */
  const [session, setSession] = useState(() => kept ?? { id: 0, seed: newSeed(), state: null });

  // Game 把当前状态写进来，存档时从这里读。状态是原地更新的，引用一直有效
  const stateRef = useRef(kept?.state ?? null);

  // 卸载时（也就是切走时）把这一局记下来
  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(
    () => () => {
      const s = sessionRef.current;
      kept = { id: s.id, seed: s.seed, state: stateRef.current };
    },
    [],
  );

  return (
    <div className="game-page">
      <div className="game-bar">
        <SaveControls
          lang={lang}
          getState={() => stateRef.current}
          onNew={() => setSession((s) => ({ id: s.id + 1, seed: newSeed(), state: null }))}
          onLoad={(state) => setSession((s) => ({ id: s.id + 1, seed: null, state }))}
        />
      </div>

      <div className="game-stage">
        <Game
          key={session.id}
          seed={session.seed}
          initialState={session.state}
          stateRef={stateRef}
          lang={lang}
        />
      </div>
    </div>
  );
}
