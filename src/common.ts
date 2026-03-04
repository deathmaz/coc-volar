import {
  DocumentFilter,
  ExtensionContext,
  LanguageClient,
  OutputChannel,
  Thenable,
  commands,
  services,
  window,
  workspace,
} from 'coc.nvim';

import * as doctor from './client/commands/doctor';
import * as scaffoldSnippets from './client/completions/scaffoldSnippets';
import * as tsVersion from './features/tsVersion';

let client: LanguageClient;

type CreateLanguageClient = (
  id: string,
  name: string,
  langs: DocumentFilter[],
  tsdk: string,
  port: number,
  outputChannel: OutputChannel,
) => LanguageClient;

let resolveCurrentTsPaths: {
  tsdk: string;
  isWorkspacePath: boolean;
};

let activated: boolean;

export async function activate(context: ExtensionContext, createLc: CreateLanguageClient) {
  //
  // For the first activation event
  //

  if (!activated) {
    const { document } = await workspace.getCurrentState();
    const currentLangId = document.languageId;
    if (currentLangId === 'vue') {
      doActivate(context, createLc);
      activated = true;
    }
  }

  //
  // If open another file after the activation event
  //

  workspace.onDidOpenTextDocument(
    async () => {
      if (activated) return;

      const { document } = await workspace.getCurrentState();
      const currentlangId = document.languageId;

      if (currentlangId === 'vue') {
        doActivate(context, createLc);
        activated = true;
      }
    },
    null,
    context.subscriptions,
  );
}

export async function doActivate(context: ExtensionContext, createLc: CreateLanguageClient) {
  initializeWorkspaceState(context);

  if (!resolveCurrentTsPaths) {
    resolveCurrentTsPaths = tsVersion.getCurrentTsPaths(context);
    context.workspaceState.update('coc-volar-tsdk-path', resolveCurrentTsPaths.tsdk);
  }

  const outputChannel = window.createOutputChannel('Vue Language Server');
  client = createLc('vue', 'Vue', getDocumentSelector(), resolveCurrentTsPaths.tsdk, 6009, outputChannel);

  setupTsServerRequestForwarding(client);

  activateRestartRequest();

  /** Custom commands for coc-volar */
  doctor.register(context);
  /** Custom snippets completion for coc-volar */
  scaffoldSnippets.register(context);

  async function activateRestartRequest() {
    context.subscriptions.push(
      commands.registerCommand('vue.action.restartServer', async () => {
        await client.stop();

        outputChannel.clear();

        await client.start();
      }),
    );
  }
}

export function deactivate(): Thenable<any> | undefined {
  return client?.stop();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getDocumentSelector(): DocumentFilter[] {
  const selectors: DocumentFilter[] = [];
  selectors.push({ language: 'vue' });

  return selectors;
}

function setupTsServerRequestForwarding(vueClient: LanguageClient) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cachedServiceClient: any = null;

  const getServiceClient = () => {
    const tsService = services.getService('tsserver');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (tsService as any)?.clientHost?.serviceClient;
  };

  vueClient.onNotification('tsserver/request', async ([seq, command, args]: [number, string, any]) => {
    try {
      if (!cachedServiceClient) {
        cachedServiceClient = getServiceClient();
      }
      if (!cachedServiceClient) {
        vueClient.sendNotification('tsserver/response', [seq, undefined]);
        return;
      }

      const results = cachedServiceClient.executeImpl(command, args, {
        isAsync: true,
        expectsResult: true,
        lowPriority: true,
      });

      const result = await results[0];
      vueClient.sendNotification('tsserver/response', [seq, result?.body]);
    } catch (e) {
      console.error('[coc-volar] tsserver request forwarding error:', e);
      cachedServiceClient = null;
      vueClient.sendNotification('tsserver/response', [seq, undefined]);
    }
  });
}

function initializeWorkspaceState(context: ExtensionContext) {
  context.workspaceState.update('coc-volar-tsdk-path', undefined);
}
