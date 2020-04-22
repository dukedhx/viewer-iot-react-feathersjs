import React, { useState, useEffect, useContext } from 'react'
import Viewer from './viewer'
import FeathersContext from './feathersContext'

const viewerLibaryURL =
  'https://developer.api.autodesk.com/modelderivative/v2/viewers/viewer3D.min.js?v=v7.*'
const viewerStylesheetURL =
  'https://developer.api.autodesk.com/modelderivative/v2/viewers/style.min.css?v=v7.*'

const idMappings = {
  '8602': 7260,
  '4F81': 3944,
  '3BB4': 2173,
  '409E': 2636,
  '871': 429,
  '1146': 721,
} //create these mappings (associating dbIds and externalIds) for your own model after successful translation by querying and persisting the model properties from Forge's services 

export default function () {
  const [viewerScriptLoaded, setViewerScriptLoaded] = useState(false)
  const [viewerStyleLoaded, setViewerStyleLoaded] = useState(false)
  const feathersContext = useContext(FeathersContext)

  useEffect(() => {
    if (!window.Autodesk) {
      const styles = document.createElement('link')
      styles.rel = 'stylesheet'
      styles.type = 'text/css'
      styles.href = viewerStylesheetURL
      styles.onload = () => setViewerStyleLoaded(true)
      document.getElementsByTagName('head')[0].appendChild(styles)
    }
    if (!window.Autodesk) {
      const s = document.createElement('script')
      s.setAttribute('src', viewerLibaryURL)
      s.onload = () => setViewerScriptLoaded(true)
      document.getElementsByTagName('head')[0].appendChild(s)
    }
  }, [])

  return (
    <>
      {viewerScriptLoaded && viewerStyleLoaded ? (
        <Viewer
          svfUrl={
            process.env.NODE_ENV === 'production'
              ? 'https://sbhehe.github.io/sb233/plant233/output/dwg.svf'
              : 'http://127.0.0.1:8080/plant/output/dwg.svf'
          }
          environment={{ env: 'Local' }}
          options={{
            sharedPropertyDbPath:
              process.env.NODE_ENV === 'production'
                ? '/sb233/plant233/'
                : '/plant/',
          }}
          extensions={[
            {
              name: 'chartExtension',
              extension: import('./chartExtension'),
              config: {
                data: Object.keys(
                  feathersContext.subscriptionManager.defaultData
                ).map((e) => idMappings[e]),
              },
            },
            {
              name: 'iconExtension',
              extension: import('./iconExtension'),
              config: {
                icons: Object.keys(
                  feathersContext.subscriptionManager.defaultData
                ).map((e) => ({ dbId: idMappings[e], extId: e })),
              },
            },
          ]}
        />
      ) : (
        <div>Loading ...</div>
      )}
    </>
  )
}
