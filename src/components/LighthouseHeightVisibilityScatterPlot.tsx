import React, { FC, useEffect, useRef, useState } from "react"
import {
  axisBottom,
  axisLeft,
  csv,
  DSVRowArray,
  extent,
  min,
  scaleLinear,
  select,
} from "d3"

type D = {
  height: number
  yearBuilt: number
}

const LighthouseHeightVisibilityScatterPlot: FC = () => {
  const [data, setData] = useState<D[] | undefined>(undefined)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getData = async () => {
      const dataResponse: DSVRowArray = await csv(
        "https://gist.githubusercontent.com/niconiahi/8d8b18a2af9174c1430e32ced46af4b7/raw/918f3a69740731520e078b94502ca6311be37807/HistoricalLighthouses.csv",
      )

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
        .filter(byPositiveHeight)

      setData(data)
    }

    getData()
  }, [])

  const drawScatterPlot = (element: HTMLDivElement, data: D[]) => {
    // 1. dimensions
    const defaultLength = 400
    const length =
      min([window.innerWidth * 0.7, window.innerHeight * 0.7]) ?? defaultLength

    const width = length
    const height = length
    const margin = {
      top: 10,
      right: 10,
      bottom: 50,
      left: 50,
    }

    const boundedHeight = height - margin.top - margin.bottom
    const boundedWidth = width - margin.left - margin.right
    const bounded = {
      width: boundedWidth,
      height: boundedHeight,
    }

    const dimensions = {
      width,
      height,
      margin,
      bounded,
    }

    // 2. accessors
    const xAccessor = ({ height }: D) => height
    const yAccessor = ({ yearBuilt }: D) => yearBuilt

    // 3. mount
    const wrapper = select(element)
      .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)

    const bounds = wrapper
      .append("g")
      .style(
        "transform",
        `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`,
      )

    // 4. scales
    const [xMin = 0, xMax = 100] = extent(data, xAccessor)
    const xRange = [0, dimensions.bounded.width]
    const xScale = scaleLinear().domain([xMin, xMax]).range(xRange).nice()

    const [yMin = 0, yMax = 100] = extent(data, yAccessor)
    const yRange = [dimensions.bounded.height, 0]
    const yScale = scaleLinear().domain([yMin, yMax]).range(yRange).nice()

    // 5. draw data
    const dots = bounds.selectAll(".circle").data(data)

    dots
      .join("circle")
      .attr("cx", (d: D) => xScale(xAccessor(d)))
      .attr("cy", (d: D) => yScale(yAccessor(d)))
      .attr("r", 5)
      .attr("fill", "cornflowerblue")

    // 6. axis
    const xAxisGenerator = axisBottom(xScale)
    const xAxis = bounds.append("g").call(xAxisGenerator)
    xAxis.style("transform", `translateY(${dimensions.bounded.height}px)`)

    const yAxisGenerator = axisLeft(yScale)
    const yAxis = bounds.append("g").call(yAxisGenerator)

    // 7.peripherals
    // xLabel
    xAxis
      .append("text")
      .html("Height")
      .attr("fill", "black")
      .attr("x", dimensions.bounded.width / 2)
      .attr("y", dimensions.margin.bottom / 1.25)
      .attr("text-anchor", "middle")

    // yLabel
    yAxis
      .append("text")
      .html("Visibility")
      .attr("fill", "black")
      .attr("x", -dimensions.bounded.height / 2)
      .attr("y", -dimensions.margin.left / 1.25)
      .style("transform", "rotate(-90deg)")
      .attr("text-anchor", "middle")
  }

  useEffect(() => {
    const element = wrapperRef.current

    if (data && element) {
      drawScatterPlot(element, data)
    }
  }, [data])

  return <div ref={wrapperRef} id="wrapper" />
}

export default LighthouseHeightVisibilityScatterPlot
