const moduleName = 'ifeeds';
const moduleVersion = 'v1';
const urlBase = `/${moduleName}/${moduleVersion}`

export default {
	urlBase : urlBase,
	version: moduleVersion,
	feeds : `${urlBase}/feeds`,
	sources : `${urlBase}/sources`,
	types : `${urlBase}/types`,
	statuses : `${urlBase}/statuses`,
}
