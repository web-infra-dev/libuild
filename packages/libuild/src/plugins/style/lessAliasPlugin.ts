import fs from 'fs';
import { rebaseUrls } from './utils';

interface Options {
  config: any;
  stdinDir: string;
}

export default class LessAliasesPlugin {
  config: any;

  stdinDir: string;

  constructor(options: Options) {
    this.config = options.config;
    this.stdinDir = options.stdinDir;
  }

  install(less: any, pluginManager: any) {
    const getResolve = (filename: string, currentDirectory: string) => {
      return this.config.css_resolve(filename, currentDirectory || this.stdinDir);
    };
    class AliasPlugin extends less.FileManager {
      config: any;

      constructor(options: Options) {
        super();
        this.config = options.config;
        this.stdinDir = options.stdinDir;
      }

      async loadFile(filename: string, currentDirectory: string) {
        const resolved = getResolve(filename, currentDirectory);
        const rebasedContents = await rebaseUrls(resolved, this.stdinDir, this.config.css_resolve);
        const contents = rebasedContents.contents ? rebasedContents.contents : fs.readFileSync(resolved, 'utf8');

        return {
          filename: resolved,
          contents,
        };
      }
    }
    pluginManager.addFileManager(new AliasPlugin({ config: this.config, stdinDir: this.stdinDir }));
    class Visitor extends less.visitors.Visitor {
      constructor(options: Options) {
        super();
        this._visitor = new less.visitors.Visitor(this);
        this.isPreEvalVisitor = true;
        this.isReplacing = false;

        this.config = options.config;
        this.stdinDir = options.stdinDir;
      }

      run(root: any) {
        return this._visitor.visit(root);
      }

      visitImport(importNode: any) {
        if (importNode?.path?.value) {
          const { currentDirectory } = importNode.path._fileInfo;
          const node = importNode.path.value;
          // @import 'xxx.less'
          if (typeof node === 'string' && node.startsWith('~')) {
            this.isReplacing = true;
            importNode.path.value = getResolve(node, currentDirectory);
          }
          // @import url('xxx.less')
          if (typeof node.value === 'string' && node.value.startsWith('~')) {
            this.isReplacing = true;
            importNode.path.value.value = getResolve(node.value, currentDirectory);
          }
        }

        return importNode;
      }

      visitImportOut(node: any) {
        this.isReplacing = false;
        return node;
      }
    }

    pluginManager.addVisitor(new Visitor({ config: this.config, stdinDir: this.stdinDir }));
  }
}
