import React from 'react'
import ReactDOM from 'react-dom'
import IconContext from './iconContext'
import Icon from './icon'
export default class extends window.Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options)
    this.icons = options.icons || []
    this.iconsVisible = false
    this.iconContextObject = {
      getClassName: (temp) => {
        if (temp > 50) return 'temperatureHigh'
        if (temp > 20) return 'temperatureOk'
        else return 'temperatureYellow'
      },
    }
  }

  load() {
    this.viewer.addEventListener(
      window.Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      () => {
        if (this.viewer.model.getInstanceTree() && !this.iconsVisible)
          this.showIcons()
      },
      { once: true }
    )
    this.viewer.addEventListener(
      window.Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
      () => {
        if (this.viewer.model.isLoadDone() && !this.iconsVisible)
          this.showIcons()
      },
      { once: true }
    )
    this.viewer.addEventListener(
      window.Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      () => this.updateIcons()
    )

    return true
  }

  unload() {
    return true
  }

  showIcons() {
    // do we have access to the instance tree?
    const tree = this.viewer.model.getInstanceTree()
    if (tree === undefined) {
      console.log('Loading tree...')
      return
    }
    this.iconsVisible = true

    this._frags = {}
    this.icons.forEach((icon) => {
      // we need to collect all the fragIds for a given dbId
      this._frags['dbId' + icon.dbId] = []
      // now collect the fragIds
      tree.enumNodeFragments(icon.dbId, (fragId) => {
        this._frags['dbId' + icon.dbId].push(fragId)
      })
      this.iconContextObject[icon.extId] = {}
    })
    const container = document.createElement('div')
    this.viewer.clientContainer.append(container)

    ReactDOM.render(
      <IconContext.Provider value={this.iconContextObject}>
        {this.icons.map((icon, i) => (
          <Icon
            key={i}
            id={icon.extId}
            labelClassName="markup update"
            spanClassName="temperatureBorder"
            pattern="%1&#176;C"
          />
        ))}
      </IconContext.Provider>,
      container
    )
    setTimeout(() => this.updateIcons(), 500)
  }

  getModifiedWorldBoundingBox(dbId) {
    const fragList = this.viewer.model.getFragmentList()
    const nodebBox = new window.THREE.Box3()

    // for each fragId on the list, get the bounding box
    for (const fragId of this._frags['dbId' + dbId]) {
      const fragbBox = new window.THREE.Box3()
      fragList.getWorldBounds(fragId, fragbBox)
      nodebBox.union(fragbBox) // create a unifed bounding box
    }

    return nodebBox
  }

  updateIcons() {
    this.iconsVisible &&
      this.icons.forEach((icon) => {
        this.iconContextObject[icon.extId].position = this.viewer.worldToClient(
          this.getModifiedWorldBoundingBox(icon.dbId).center()
        )
        this.iconContextObject[icon.extId].setStyle.next()
      })
  }
}
