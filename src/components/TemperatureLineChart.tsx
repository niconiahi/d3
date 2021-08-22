import React, { FC, useEffect, useRef, useState } from "react"
import {
  extent,
  json,
  scaleLinear,
  scaleTime,
  select,
  timeParse,
  line,
  axisLeft,
  axisBottom,
} from "d3"

const weatherData =
  "https://gist.githubusercontent.com/niconiahi/af95216decf49dfa915070c8bd03f224/raw/c9cede3dfcd3a8845c598f9459ad7d8ac4aa3292/my_weather_data.json"

type D = {
  apparentTemperatureHigh: number
  apparentTemperatureHighTime: number
  apparentTemperatureLow: number
  apparentTemperatureLowTime: number
  apparentTemperatureMax: number
  apparentTemperatureMaxTime: number
  apparentTemperatureMin: number
  apparentTemperatureMinTime: number
  cloudCover: number
  date: string
  dewPoint: number
  humidity: number
  icon: string
  moonPhase: number
  precipIntensity: number
  precipIntensityMax: number
  precipProbability: number
  pressure: number
  summary: string
  sunriseTime: number
  sunsetTime: number
  temperatureHigh: number
  temperatureHighTime: number
  temperatureLow: number
  temperatureLowTime: number
  temperatureMax: number
  temperatureMaxTime: number
  temperatureMin: number
  temperatureMinTime: number
  time: number
  uvIndex: number
  uvIndexTime: number
  visibility: number
  windBearing: number
  windGust: number
  windGustTime: number
  windSpeed: number
}

const TemperatureLineChart: FC = () => {
  // states
  const [data, setData] = useState<D[] | undefined>(undefined)

  // refs
  const wrapperRef = useRef<HTMLDivElement>(null)

  // effects
  useEffect(() => {
    const getData = async () => {
      const data: D[] = (await json(weatherData)) ?? []

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
  const drawChart = (
    wrapperRef: React.RefObject<HTMLDivElement>,
    data: D[],
  ) => {
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

    const parseDate = timeParse("%Y-%m-%d")

    // accessors
    const yAccessor = (d: D) => d.temperatureMax
    const xAccessor = (d: D) => parseDate(d.date) ?? 22

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
    const [yMin = 0, yMax = 100] = extent(data, yAccessor)
    const yRange = [dimensions.boundsHeight, 0]
    const yScale = scaleLinear().domain([yMin, yMax]).range(yRange)

    // x scale
    const [xMin = 0, xMax = 100] = extent(data, xAccessor)
    const xRange = [0, dimensions.boundsWidth]
    const xScale = scaleTime().domain([xMin, xMax]).range(xRange)

    // freezing zone
    const yFreezing = yScale(32)
    const freezingTemperatures = bounds
      .append("rect")
      .attr("x", 0)
      .attr("width", dimensions.boundsWidth)
      .attr("y", yFreezing)
      .attr("height", dimensions.boundsHeight - yFreezing)
      .attr("fill", "#e0f3f3")
    console.log("freezingTemperatures", freezingTemperatures)

    // temperature line
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

export default TemperatureLineChart
