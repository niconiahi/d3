import React, { FC, useEffect, useState, useRef, RefObject } from "react"
import {
  min,
  json,
  extent,
  select,
  axisLeft,
  axisBottom,
  scaleLinear,
} from "d3"

const weatherData =
  "https://gist.githubusercontent.com/niconiahi/b5b18f2879c172d652fcb6ea98ad67cf/raw/9b5952cad2cfb79bed3c8bdd98734e3ffc80a75d/humidity_temperature.json"

type D = {
  humidity: number
  dewPoint: number
  cloudCover: number
}

const HumidityTemperatureScatterPlot: FC = () => {
  // states
  const [data, setData] = useState<D[] | undefined>(undefined)

  // refs
  const wrapperRef = useRef<HTMLDivElement>(null)

  // effects
  useEffect(() => {
    const getData = async () => {
      const data: D[] | undefined = (await json(weatherData)) ?? undefined

      setData(data)
    }

    getData()
  }, [])

  useEffect(() => {
    if (data && window !== undefined) {
      drawChart(wrapperRef, data)
    }
  }, [data])

  // methods
  const drawChart = (wrapperRef: RefObject<HTMLDivElement>, data: D[]) => {
    // 1. create chart dimenstions
    const defaultLength = 400
    const length =
      min([window.innerWidth * 0.7, window.innerHeight * 0.7]) ?? defaultLength

    const width = length
    const height = length
    const margins = {
      top: 10,
      right: 10,
      bottom: 50,
      left: 50,
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

    const dotRadius = 5

    // 2. access data
    const xAccessor = ({ dewPoint }: D) => dewPoint
    const yAccessor = ({ humidity }: D) => humidity
    const colorAccessor = ({ cloudCover }: D) => cloudCover

    // 3. draw canvas
    const wrapper = select(wrapperRef.current)
      .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)

    const bounds = wrapper
      .append("g")
      .style(
        "transform",
        `translate(${dimensions.margins.left}px, ${dimensions.margins.top}px)`,
      )

    // 4. create scales
    const [xMin = 0, xMax = 100] = extent(data, xAccessor)
    const xRange = [0, dimensions.boundsWidth]
    const xScale = scaleLinear().domain([xMin, xMax]).range(xRange).nice()

    const [yMin = 0, yMax = 100] = extent(data, yAccessor)
    const yRange = [dimensions.boundsHeight, 0]
    const yScale = scaleLinear().domain([yMin, yMax]).range(yRange).nice()

    const [colorMin = 0, colorMax = 100] = extent(data, colorAccessor)
    const colorRange = ["skyblue", "darkslategrey"]
    const colorScale = scaleLinear<string>()
      .domain([colorMin, colorMax])
      .range(colorRange)

    // 5. draw data
    const dots = bounds.selectAll("circle").data(data)

    dots
      .join("circle")
      .attr("cx", (d: D) => xScale(xAccessor(d)))
      .attr("cy", (d: D) => yScale(yAccessor(d)))
      .attr("r", dotRadius)
      .attr("fill", (d: D) => colorScale(colorAccessor(d)))

    // 6. draw peripherals
    const xAxisGenerator = axisBottom(xScale)
    const xAxis = bounds
      .append("g")
      .call(xAxisGenerator)
      .style("transform", `translateY(${dimensions.boundsHeight}px)`)
    xAxis
      .append("text")
      .html("Dew point (&deg;F)")
      .attr("x", dimensions.boundsWidth / 2)
      .attr("y", dimensions.margins.bottom - 10)
      .style("fill", "black")
      .style("font-size", "1rem")

    const yAxisGenerator = axisLeft(yScale).ticks(6)
    const yAxis = bounds.append("g").call(yAxisGenerator)
    yAxis
      .append("text")
      .text("Relative humidity")
      .attr("x", -dimensions.boundsHeight / 2)
      .attr("y", -dimensions.margins.left + 15)
      .style("fill", "black")
      .style("font-size", "1rem")
      .style("transform", "rotate(-90deg)")
      .style("text-anchor", "middle")
  }

  return <div ref={wrapperRef} id="wrapper" />
}

export default HumidityTemperatureScatterPlot
