// airich.js
// Barrel re-export: the actual AIRich implementation lives in ./ai-rich/,
// split into focused modules (airich.js, toolkit.js, base-builder.js,
// helpers.js, loaders.js, errors.js) instead of one large file. This file
// exists so existing `require('./airich')` call sites (sendAIRich.js,
// index.js) don't need to change.

const { AIRich, VERSION } = require('./ai-rich/airich')
const { Toolkit } = require('./ai-rich/toolkit')
const { BaseBuilder } = require('./ai-rich/base-builder')
const { AIRichError, ItemNotFoundError, DuplicateIdError, InvalidTargetError, ContentValidationError } = require('./ai-rich/errors')

module.exports = {
	AIRich,
	Toolkit,
	BaseBuilder,
	VERSION,
	AIRichError,
	ItemNotFoundError,
	DuplicateIdError,
	InvalidTargetError,
	ContentValidationError,
}
