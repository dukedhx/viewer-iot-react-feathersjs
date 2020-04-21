import React, { useState, useEffect, useContext, useCallback } from 'react'
import { Chart } from 'react-charts'
import ChartContext from './chartContext'
export default function ({ config }) {
  const chartContext = useContext(ChartContext)
  const [data, setData] = useState(config)
  useEffect(() => {
    chartContext.subscriptionManager.handler = (function* () {
      while (true) {
        const time = new Date()
        const newData = data.slice()
        if (data[0].data.length > 5) {
          newData.forEach((e) => e.data.splice(0, 1))
        }
        newData.forEach((e, i) =>
          e.data.push([time, chartContext.subscriptionManager.data])
        )
        setData(newData)
        yield true
      }
    })()
    return () => (chartContext.subscriptionManager.handler = null)
  }, [])

  const axes = React.useMemo(
    () => [
      { primary: true, type: 'time', position: 'bottom' },
      { type: 'linear', position: 'left', stacked: false },
    ],
    []
  )
  const series = React.useMemo(
    () => ({
      type: 'bar',
    }),
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
        series={series}
        axes={axes}
        getSeriesStyle={getSeriesStyle}
        getDatumStyle={getDatumStyle}
        tooltip
      />
    </div>
  )
}
