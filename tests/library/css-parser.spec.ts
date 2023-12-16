import { playwrightTest as it, expect } from '../config/browserTest';
import { parseCSS, serializeSelector as serialize } from '../../packages/playwright-core/lib/utils/isomorphic/cssParser';

const parse = (selector: string) => {
  return parseCSS(selector, new Set(['text', 'not', 'has', 'react', 'scope', 'right-of', 'is'])).selector;
};

it('should parse css', async () => {
  expect(serialize(parse('div'))).toBe('div');
  expect(serialize(parse('div.class'))).toBe('div.class');
  expect(serialize(parse('.class'))).toBe('.class');
  expect(serialize(parse('#id'))).toBe('#id');
  expect(serialize(parse('.class#id'))).toBe('.class#id');
  expect(serialize(parse('div#id.class'))).toBe('div#id.class');
  expect(serialize(parse('*'))).toBe('*');
  expect(serialize(parse('*div'))).toBe('*div');
  expect(serialize(parse('div[attr *= foo i]'))).toBe('div[attr *= foo i]');
  expect(serialize(parse('div[attr~="Bar baz"  ]'))).toBe('div[attr~="Bar baz" ]');
  expect(serialize(parse(`div    [ foo = 'bar'  s]`))).toBe(`div [ foo = "bar" s]`);

  expect(serialize(parse(':hover'))).toBe(':hover');
  expect(serialize(parse('div:hover'))).toBe('div:hover');
  expect(serialize(parse('#id:active:hover'))).toBe('#id:active:hover');
  expect(serialize(parse(':dir(ltr)'))).toBe(':dir(ltr)');
  expect(serialize(parse('#foo-bar.cls:nth-child(3n + 10)'))).toBe('#foo-bar.cls:nth-child(3n + 10)');
  expect(serialize(parse(':lang(en)'))).toBe(':lang(en)');
  expect(serialize(parse('*:hover'))).toBe('*:hover');

  expect(serialize(parse('div span'))).toBe('div span');
  expect(serialize(parse('div>span'))).toBe('div > span');
  expect(serialize(parse('div +span'))).toBe('div + span');
  expect(serialize(parse('div~ span'))).toBe('div ~ span');
  expect(serialize(parse('div   >.class #id+ span'))).toBe('div > .class #id + span');
  expect(serialize(parse('div>span+.class'))).toBe('div > span + .class');
  expect(serialize(parse('>span'))).toBe(':scope() > span');

  expect(serialize(parse('div:not(span)'))).toBe('div:not(span)');
  expect(serialize(parse(':not(span)#id'))).toBe('#id:not(span)');
  expect(serialize(parse('div:not(span):hover'))).toBe('div:hover:not(span)');
  expect(serialize(parse('div:has(span):hover'))).toBe('div:hover:has(span)');
  expect(serialize(parse('div:right-of(span):hover'))).toBe('div:hover:right-of(span)');
  expect(serialize(parse(':right-of(span):react(foobar)'))).toBe(':right-of(span):react(foobar)');
  expect(serialize(parse('div:is(span):hover'))).toBe('div:hover:is(span)');
  expect(serialize(parse('div:scope:hover'))).toBe('div:hover:scope()');
  expect(serialize(parse('div:sCOpe:HOVER'))).toBe('div:HOVER:scope()');
  expect(serialize(parse('div:NOT(span):hoVER'))).toBe('div:hoVER:not(span)');

  expect(serialize(parse(':text("foo")'))).toBe(':text("foo")');
  expect(serialize(parse(':text("*")'))).toBe(':text("*")');
  expect(serialize(parse(':text(*)'))).toBe(':text(*)');
  expect(serialize(parse(':text("foo", normalize-space)'))).toBe(':text("foo", normalize-space)');
  expect(serialize(parse(':index(3, div    span)'))).toBe(':index(3, div span)');
  expect(serialize(parse(':is(foo, bar>baz.cls+:not(qux))'))).toBe(':is(foo, bar > baz.cls + :not(qux))');
});

it('should throw on malformed css', async () => {
  function expectError(selector: string) {
    let error = { message: '' };
    try {
      parse(selector);
    } catch (e) {
      error = e;
    }
    expect(error.message).toContain(`while parsing selector "${selector}"`);
  }

  expectError('');
  expectError('.');
  expectError('#');
  expectError('..');
  expectError('#.');
  expectError('.#');
  expectError('[attr=');
  expectError(':not(div');
  expectError('div)');
  expectError('()');
  expectError(':not(##)');
  expectError(':not()');
  expectError(':not(.)');
  expectError('div,');
  expectError(',div');
  expectError('div,,span');
  expectError('div > > span');
  expectError('div > > > > span');
  expectError('div >');
  expectError('"foo"');
  expectError('23');
  expectError('span, div>"foo"');
});
