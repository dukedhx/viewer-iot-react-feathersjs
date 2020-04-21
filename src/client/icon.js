import React, { useContext, useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import './icon.css'
import FeathersContext from './feathersContext'
import IconContext from './iconContext'
import ChartContext from './chartContext'
import BarChart from './barChart'
export default function ({ id, labelClassName, spanClassName, pattern }) {
  const [style, setStyle] = useState({})
  const [label, setLabel] = useState('')
  const [chartPanel, setChartPanel] = useState(null)
  const [className, setClassName] = useState('')
  const feathersContext = useContext(FeathersContext)
  const iconContext = useContext(IconContext)
  const labelRef = useRef(null)
  const [chartObject] = useState({})
  useEffect(() => {
    iconContext[id].setStyle = (function* () {
      while (true) {
        const pos = iconContext[id].position
        setStyle({
          left: Math.floor(pos.x - labelRef.current.offsetWidth / 2) + 'px',
          top: Math.floor(pos.y - labelRef.current.offsetHeight / 2) + 'px',
        })
        yield true
      }
    })()
    feathersContext.subscribe(
      id,
      (function* () {
        while (true) {
          const data = feathersContext.subscriptionManager[id].data
          chartObject.data = data
          chartObject.handler && chartObject.handler.next()
          setLabel(data)
          setClassName(iconContext.getClassName(data))

          yield true
        }
      })()
    )
  }, [])

  return (
    <label
      ref={labelRef}
      className={labelClassName}
      style={style}
      onClick={() => {
        if (!chartPanel) {
          const container = document.createElement('div')
          const panel = window.NOP_VIEWER.getExtension(
            'chartExtension'
          ).addPanel({
            left: labelRef.current.style.left,
            top: labelRef.current.style.top,
            container,
            title: id,
            width: '300px',
            height: '300px',
            background: 'rgba(34,34,34,.94)',
          })
          ReactDOM.render(
            <ChartContext.Provider value={{ subscriptionManager: chartObject }}>
              <BarChart config={[{ label: id, data: [[new Date(), 0]] }]} />
            </ChartContext.Provider>,
            container
          )
          panel.addEventListener(panel.closer, 'click', () => {
            ReactDOM.unmountComponentAtNode(container)
            setChartPanel(null)
            panel.uninitialize()
          })
          setChartPanel(panel)
        }
      }}
    >
      <span className={spanClassName + ' ' + className}>
        {label && pattern.replace('%1', label)}
      </span>
    </label>
  )
}
