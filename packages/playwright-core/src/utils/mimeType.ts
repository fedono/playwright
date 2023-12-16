export function isJsonMimeType(mimeType: string) {
  return !!mimeType.match(/^(application\/json|application\/.*?\+json|text\/(x-)?json)(;\s*charset=.*)?$/);
}

export function isTextualMimeType(mimeType: string) {
  return !!mimeType.match(/^(text\/.*?|application\/(json|(x-)?javascript|xml.*?|ecmascript|graphql|x-www-form-urlencoded)|image\/svg(\+xml)?|application\/.*?(\+json|\+xml))(;\s*charset=.*)?$/);
}
