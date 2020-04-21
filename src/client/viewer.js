import React, { useEffect, useRef } from 'react'
export default function ({ svfUrl, environment, options, extensions }) {
  const container = useRef(null)

  useEffect(
    () =>
      window.Autodesk.Viewing.Initializer(environment, () => {
        new window.Autodesk.Viewing.GuiViewer3D(container.current).start(
          svfUrl,
          options
        )
        window.Autodesk.Viewing.endpoint.getApiEndpoint = () =>
          new URL(svfUrl).origin
        extensions instanceof Array &&
          extensions.forEach((ext) =>
            ext.extension.then((res) => {
              window.Autodesk.Viewing.theExtensionManager.registerExtension(
                ext.name,
                res.default
              )
              window.NOP_VIEWER.loadExtension(ext.name, ext.config)
            })
          )
      }),
    []
  )
  return <div ref={container}></div>
}
