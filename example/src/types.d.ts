/// <reference lib="dom" />

// CSS modules
type CSSModuleClasses = { readonly [key: string]: string };

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.module.sass' {
  const classes: CSSModuleClasses;
  export default classes;
}
