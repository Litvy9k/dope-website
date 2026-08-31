import { createContext, useContext } from 'react';

/**
 * 页面内容和 Layout 之间的通道。
 * 任何深度的组件都能拿到 UI 控制权，不用一层层传 prop。
 */
export const UIContext = createContext(null);

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) {
    throw new Error('useUI() 必须在 <Layout> 里面用');
  }
  return ctx;
}
