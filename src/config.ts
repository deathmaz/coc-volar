import { workspace } from 'coc.nvim';

const _config = () => workspace.getConfiguration('vue');

export const config = {
  get server(): Readonly<{
    path: null | string;
    includeLanguages: string[];
    hybridMode: boolean;
    maxOldSpaceSize: number;
  }> {
    return _config().get('server')!;
  },
  get codeActions(): Readonly<{
    askNewComponentName: boolean;
  }> {
    return _config().get('codeActions')!;
  },
  get suggest(): Readonly<{
    componentNameCasing: 'preferPascalCase' | 'preferKebabCase' | 'pascalCase' | 'kebabCase';
    propNameCasing: 'preferKebabCase' | 'preferCamelCase' | 'kebabCase' | 'camelCase';
    defineAssignment: boolean;
  }> {
    return _config().get('suggest')!;
  },
};

//
// Custom configuration for coc-volar.
//

export function getConfigVolarEnable() {
  return workspace.getConfiguration('volar').get<boolean>('enable', true);
}

export function getConfigDisableProgressNotifications() {
  return workspace.getConfiguration('volar').get<boolean>('disableProgressNotifications', false);
}

export function getConfigMiddlewareProvideCompletionItemEnable() {
  return workspace.getConfiguration('volar').get<boolean>('middleware.provideCompletionItem.enable', true);
}

export function getDisabledFeatures() {
  const disabledFeatures: string[] = [];

  if (workspace.getConfiguration('volar').get<boolean>('disableCompletion')) {
    disabledFeatures.push('completion');
  }
  if (workspace.getConfiguration('volar').get<boolean>('disableDiagnostics')) {
    disabledFeatures.push('diagnostics');
  }
  if (workspace.getConfiguration('volar').get<boolean>('disableFormatting')) {
    disabledFeatures.push('formatting');
    disabledFeatures.push('documentFormatting');
    disabledFeatures.push('documentRangeFormatting');
  }
  if (getConfigDisableProgressNotifications()) {
    disabledFeatures.push('progress');
  }

  return disabledFeatures;
}
