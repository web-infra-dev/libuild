import logo from '../bundleless/logo.svg';
import style from '../bundleless/style.module.less';

export const f = async () => {
  await import('./add');
};

export { add } from './add';
export { answer } from './answer';
export { logo, style };
