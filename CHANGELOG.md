# Changelog

## v0.38.0

### Breaking: Upgraded to `@vue/language-server` v3.2.5

This release upgrades the underlying Vue language server from v2.2.8 to v3.2.5, which includes significant architectural changes from the [vuejs/language-tools](https://github.com/vuejs/language-tools) project.

### What changed

**Vue 2 is no longer supported.** The v3 language server dropped Vue 2 and `vue-class-component` support. If you need Vue 2, stay on coc-volar v0.37.x.

**Hybrid mode is now always enabled.** The `vue.server.hybridMode` setting is deprecated and ignored. The Vue language server only handles CSS/HTML, while TypeScript support is fully delegated to `coc-tsserver` via `@vue/typescript-plugin`.

**TypeScript communication architecture changed.** The v3 server uses a `tsserver/request` / `tsserver/response` notification protocol instead of named pipes. coc-volar now brokers requests between the Vue language server and `coc-tsserver`. This relies on coc-tsserver's internal API (`clientHost.serviceClient`) which is undocumented --- if TypeScript features stop working after a coc-tsserver update, this is the likely cause.

**Settings renamed.** If you have any of these in your `coc-settings.json`, update them:

| Old setting | New setting |
|---|---|
| `vue.complete.casing.tags` | `vue.suggest.componentNameCasing` |
| `vue.complete.casing.props` | `vue.suggest.propNameCasing` |
| `vue.complete.defineAssignment` | `vue.suggest.defineAssignment` |
| `vue.codeActions.enabled` | `vue.codeActions.askNewComponentName` |
| `vue.codeLens.enabled` | *(removed)* |

Old setting values also changed:

| Old value | New value |
|---|---|
| `autoPascal` | `preferPascalCase` |
| `autoKebab` | `preferKebabCase` |
| `autoCamel` | `preferCamelCase` |
| `pascal` | `pascalCase` |
| `kebab` | `kebabCase` |
| `camel` | `camelCase` |

### New settings

- `vue.hover.rich` --- Rich hover info for components showing props, slots, and events
- `vue.autoInsert.dotValue` --- Auto-insert `.value` when accessing ref variables
- `vue.autoInsert.bracketSpacing` --- Auto-insert spaces inside template interpolation brackets
- `vue.format.template.enabled` / `vue.format.script.enabled` / `vue.format.style.enabled` --- Enable/disable formatting per block
- `vue.format.wrapAttributes` --- Attribute wrapping strategy for templates

### Known limitations

- The `tsserver/request` forwarding depends on coc-tsserver's internal API. If coc-tsserver changes its internals, TypeScript features in Vue files may break while CSS/HTML support continues to work.
- `vue.server.hybridMode` is kept in config for backwards compatibility but has no effect.

### What to watch for in future updates

- **coc-tsserver compatibility**: If coc-tsserver adds an official `typescript.tsserverRequest` command, the forwarding code should be updated to use it instead of the internal API.
- **@vue/language-server updates**: Future v3.x minor versions may add new settings or change behavior. Check the [vuejs/language-tools releases](https://github.com/vuejs/language-tools/releases) page.
