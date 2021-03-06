jest.mock('obojobo-document-engine/src/scripts/common/index', () => ({
	Registry: {
		registerModel: jest.fn()
	},
	chunk: {
		textChunk: {
			TextGroupAdapter: jest.fn()
		}
	}
}))

jest.mock('./viewer-component', () => ({}))

import Common from 'obojobo-document-engine/src/scripts/common/index'

// include the script we're testing, it registers the model
import './viewer'
import ViewerComponent from './viewer-component'

describe('ObojoboDraft.Chunks.Text registration', () => {
	test('registerModel registers expected vars', () => {
		const register = Common.Registry.registerModel.mock.calls[0]
		expect(register[0]).toBe('ObojoboDraft.Chunks.Text')
		expect(register[1]).toHaveProperty('type', 'chunk')
		expect(register[1]).toHaveProperty('adapter', expect.any(Function))
		expect(register[1]).toHaveProperty('componentClass', ViewerComponent)
	})
})
