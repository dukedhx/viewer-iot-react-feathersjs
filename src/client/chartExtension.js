import React from 'react'
import ReactDOM from 'react-dom'
import LineChart from './lineChart'
export default class extends window.Autodesk.Viewing.Extension {
  getPropertyPromise(id) {
    const time = new Date()
    return new Promise((res) =>
      this.viewer.getProperties(id, (props) =>
        res({ label: props.name, data: [[time, 0]] })
      )
    )
  }
  unloadPanel() {
    ReactDOM.unmountComponentAtNode(this._container)
    this._panel.uninitialize()
    this._button.setState(1)
    this._panel = null
  }
  loadPanel() {
    return Promise.all(
      this.options.data.map((e) => this.getPropertyPromise(e))
    ).then((data) => {
      this._container = document.createElement('div')
      this._panel = this.addPanel({
        title: 'Charts',
        container: this._container,
        background: 'rgba(34,34,34,.94)',
        height: '500px',
        width: '500px',
      })
      ReactDOM.render(<LineChart config={data} />, this._container)
      this._panel.addEventListener(this._panel.closer, 'click', () =>
        this.unloadPanel()
      )
      this._button.setState(0)
    })
  }

  load() {
    this.viewer.addEventListener(
      window.Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
      () => this.loadPanel(),
      { once: true }
    )
    return true
  }

  unload() {
    if (this._group) {
      this._group.removeControl(this._button)
      if (this._group.getNumberOfControls() === 0) {
        this.viewer.toolbar.removeControl(this._group)
      }
    }

    return true
  }
  onToolbarCreated() {
    // Create a new toolbar group if it doesn't exist
    this._group = this.viewer.toolbar.getControl('customExtensions')
    if (!this._group) {
      this._group = new window.Autodesk.Viewing.UI.ControlGroup(
        'customExtensions'
      )
      this.viewer.toolbar.addControl(this._group)
    }

    // Add a new button to the toolbar group
    this._button = new window.Autodesk.Viewing.UI.Button('ChartExtension')
    this._button.onClick = (ev) => {
      if (this._panel) {
        this.unloadPanel()
      } else {
        this.loadPanel()
      }
    }
    this._button.setToolTip('Show Charts')
    this._button.container.children[0].innerHTML = 'C'
    this._group.addControl(this._button)
  }
  addPanel({ title, width, height, background, container, left, top }) {
    const panel = new window.Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      title
    )
    panel.container.style.width = width
    panel.container.style.height = height
    panel.container.style.left = left || '5px'
    panel.container.style.top = top || '5px'
    panel.container.style.background = background
    panel.container.appendChild(container)
    panel.setVisible(true)
    return panel
  }
}
