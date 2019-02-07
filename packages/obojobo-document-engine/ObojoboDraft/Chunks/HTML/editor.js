import React from 'react'
import Common from 'Common'

import emptyNode from './empty-node.json'
import Icon from './icon'
import Node from './editor-component'
import Schema from './schema'
import Converter from './converter'

const HTML_NODE = 'ObojoboDraft.Chunks.HTML'

const plugins = {
	renderNode(props, editor, next) {
		switch (props.node.type) {
			case HTML_NODE:
				return <Node {...props} {...props.attributes} />
			default:
				return next()
		}
	},
	onKeyDown(event, editor, next) {
		const isHTML = editor.value.blocks.some(block => block.type === HTML_NODE)
		if (!isHTML) return next()

		// Insert a softbreak on enter
		if (event.key === 'Enter') {
			event.preventDefault()
			return editor.insertText('\n')
		}

		// Tab insert
		if (event.key === 'Tab') {
			event.preventDefault()
			editor.insertText('\t')
			return true
		}
	},
	schema: Schema
}

Common.Store.registerEditorModel('ObojoboDraft.Chunks.HTML', {
	name: 'HTML',
	icon: Icon,
	isInsertable: true,
	insertJSON: emptyNode,
	slateToObo: Converter.slateToObo,
	oboToSlate: Converter.oboToSlate,
	plugins
})

const HTML = {
	name: HTML_NODE,
	components: {
		Node,
		Icon
	},
	helpers: {
		slateToObo: Converter.slateToObo,
		oboToSlate: Converter.oboToSlate
	},
	json: {
		emptyNode
	},
	plugins
}

export default HTML
