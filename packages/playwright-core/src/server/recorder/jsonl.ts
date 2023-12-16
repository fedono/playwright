import { asLocator } from '../../utils/isomorphic/locatorGenerators';
import type { ActionInContext } from './codeGenerator';
import type { Language, LanguageGenerator, LanguageGeneratorOptions } from './language';

export class JsonlLanguageGenerator implements LanguageGenerator {
  id = 'jsonl';
  groupName = '';
  name = 'JSONL';
  highlighter = 'javascript' as Language;

  generateAction(actionInContext: ActionInContext): string {
    const locator = (actionInContext.action as any).selector ? JSON.parse(asLocator('jsonl', (actionInContext.action as any).selector)) : undefined;
    const entry = {
      ...actionInContext.action,
      pageAlias: actionInContext.frame.pageAlias,
      locator,
    };
    return JSON.stringify(entry);
  }

  generateHeader(options: LanguageGeneratorOptions): string {
    return JSON.stringify(options);
  }

  generateFooter(saveStorage: string | undefined): string {
    return '';
  }
}
