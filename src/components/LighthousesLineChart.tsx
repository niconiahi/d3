/* eslint-disable camelcase */
import React, { RefObject, FC, useState, useEffect, useRef } from "react"
import {
  axisBottom,
  axisLeft,
  csv,
  DSVRowArray,
  extent,
  line,
  scaleLinear,
  select,
} from "d3"

type D = {
  height: number
  yearBuilt: number
}

const LighthousesLineChart: FC = () => {
  // states
  const [data, setData] = useState<D[] | undefined>(undefined)

  // ref
  const wrapperRef = useRef<HTMLDivElement>(null)

  // effects
  useEffect(() => {
    const getData = async () => {
      const dataResponse: DSVRowArray = await csv(
        "https://gist.githubusercontent.com/niconiahi/8d8b18a2af9174c1430e32ced46af4b7/raw/918f3a69740731520e078b94502ca6311be37807/HistoricalLighthouses.csv",
      )

      const byYearBuilt = (a: D, b: D) => a.yearBuilt - b.yearBuilt
      const byPositiveHeight = (d: D) => d.height > 0

      const data = dataResponse
        .reduce((acc, stats) => {
          const { Height, YearBuilt } = stats

          const height = Number(Height)
          const yearBuilt = Number(YearBuilt)

          const d: D = {
            height,
            yearBuilt,
          }

          return [...acc, { ...d }]
        }, [] as D[])
        .sort(byYearBuilt)
        .filter(byPositiveHeight)

      setData(data)
    }

    getData()
  }, [])

  useEffect(() => {
    if (data) {
      drawChart(wrapperRef, data)
    }
  }, [data])

  // methods
  const drawChart = (wrapperRef: RefObject<HTMLDivElement>, data: D[]) => {
    // dimensions
    const width = 800
    const height = 400
    const margins = {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60,
    }
    const boundsWidth = width - margins.left - margins.right
    const boundsHeight = height - margins.top - margins.bottom

    const dimensions = {
      width,
      height,
      margins,
      boundsWidth,
      boundsHeight,
    }

    // x accessor
    const xAccessor = ({ yearBuilt }: D) => yearBuilt

    // y accessor
    const yAccessor = ({ height }: D) => height

    // wrapper
    const wrapper = select(wrapperRef.current)
      .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)

    // bounds
    const bounds = wrapper
      .append("g")
      .style(
        "transform",
        `translate(${dimensions.margins.left}px, ${dimensions.margins.top}px)`,
      )

    // y scale
    const [yMin = 0, yMax = 0] = extent(data, yAccessor)
    const yRange = [dimensions.boundsHeight, 0]
    const yScale = scaleLinear().domain([yMin, yMax]).range(yRange)

    // x scale
    const [xMin = 0, xMax = 0] = extent(data, xAccessor)
    const xRange = [0, dimensions.boundsWidth]
    const xScale = scaleLinear().domain([xMin, xMax]).range(xRange)

    // line
    const lineGenerator = line<D>()
      .x((d) => xScale(xAccessor(d)))
      .y((d) => yScale(yAccessor(d)))
    bounds
      .append("path")
      .attr("d", lineGenerator(data))
      .attr("fill", "none")
      .attr("stroke", "gray")
      .attr("stroke-width", 2)

    // y axis
    const yAxisGenerator = axisLeft(yScale)
    bounds.append("g").call(yAxisGenerator)

    // x axis
    const xAxisGenerator = axisBottom(xScale)
    bounds
      .append("g")
      .call(xAxisGenerator)
      .style("transform", `translateY(${dimensions.boundsHeight}px)`)
  }

  return <div ref={wrapperRef} id="wrapper" />
}

export default LighthousesLineChart
