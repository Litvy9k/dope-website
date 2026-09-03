import { useRef, useState } from 'react';

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

export default function GamePage() {
  const { lang } = useUI();

  /**
   * 一局 = { id, seed, state }。id 变了就换 key，React 会整个重挂 Game，
   * 于是"新游戏"和"读档"走同一条路，不用另写一套 reset
   */
  const [session, setSession] = useState(() => ({ id: 0, seed: newSeed(), state: null }));

  // Game 把当前状态写进来，存档时从这里读。状态是原地更新的，引用一直有效
  const stateRef = useRef(null);

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
