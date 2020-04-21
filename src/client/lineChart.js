import React, { useState, useEffect, useContext, useCallback } from 'react'
import { Chart } from 'react-charts'
import FeathersContext from './feathersContext'
export default function ({ config }) {
  const feathersContext = useContext(FeathersContext)
  const [data, setData] = useState(config)
  useEffect(() => {
    feathersContext.subscriptionManager.defaultHandler = (function* () {
      while (true) {
        const feedData = Object.values(
          feathersContext.subscriptionManager.defaultData
        )
        const time = new Date()
        const newData = data.slice()
        if (data[0].data.length > 5) {
          newData.forEach((e) => e.data.splice(0, 1))
        }
        newData.forEach((e, i) => e.data.push([time, feedData[i]]))
        setData(newData)
        yield true
      }
    })()
    return () => (feathersContext.subscriptionManager.defaultHandler = null)
  }, [])

  const axes = React.useMemo(
    () => [
      { primary: true, type: 'time', position: 'bottom' },
      { type: 'linear', position: 'left' },
    ],
    []
  )

  const getSeriesStyle = useCallback(
    () => ({
      transition: 'all .5s ease',
    }),
    []
  )
  const getDatumStyle = useCallback(
    () => ({
      transition: 'all .5s ease',
    }),
    []
  )
  return (
    // A react-chart hyper-responsively and continuously fills the available
    // space of its parent element automatically
    <div
      style={{
        width: '100%',
        height: 'calc(100% - 70px)',
      }}
    >
      <Chart
        data={data}
        axes={axes}
        getSeriesStyle={getSeriesStyle}
        getDatumStyle={getDatumStyle}
        tooltip
      />
    </div>
  )
}
