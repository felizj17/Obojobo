import React from 'react'

import ModalUtil from '../../../common/util/modal-util'
import SimpleDialog from './simple-dialog'

import './prompt.scss'

class Prompt extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			text: this.props.value || ""
		}
	}

	onKeyUp(event) {
		if (event.keyCode === 27) {
			return ModalUtil.hide()
		}

		if (event.key === "Enter") {
			return this.props.onConfirm(this.state.text)
		}
	}

	handleTextChange(event) {
		const text = event.target.value

		return this.setState({text})
	}

	focusOnFirstElement() {
		return this.refs.input.focus()
	}

	render() {
		return (
			<SimpleDialog
				cancelOk
				title={this.props.title}
				onConfirm={() => this.props.onConfirm(this.state.text)}
				focusOnFirstElement={this.focusOnFirstElement.bind(this)}
				className="prompt">
				<label htmlFor="promptInput">{this.props.message}</label>
				<input
					type="text"
					id="promptInput"
					value={this.state.text}
					onKeyUp={this.onKeyUp.bind(this)}
					onChange={event => this.handleTextChange(event)}
					ref={'input'}
					size="50"/>
			</SimpleDialog>
		)
	}
}

export default Prompt
