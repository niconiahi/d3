/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, useEffect, useRef, useState } from "react"
import { json } from "d3-fetch"
import { select } from "d3-selection"
import { scaleLinear } from "d3-scale"
import { axisBottom } from "d3-axis"
import { extent, bin, mean, max } from "d3-array"

type D = {
  humidity: number
}

const weatherData =
  "https://gist.githubusercontent.com/niconiahi/b5b18f2879c172d652fcb6ea98ad67cf/raw/9b5952cad2cfb79bed3c8bdd98734e3ffc80a75d/humidity_temperature.json"

const HumidityBarChart: FC = () => {
  const [dataset, setDataset] = useState<D[] | undefined>(undefined)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getData = async () => {
      const dataset: D[] | undefined = (await json(weatherData)) ?? undefined

      setDataset(dataset)
    }

    getData()
  }, [])

  const drawBars = (dataset: D[], element: HTMLDivElement) => {
    // 1. dimentions
    const width = 600
    const height = width * 0.6
    const margin = {
      top: 40,
      right: 30,
      bottom: 70,
      left: 30,
    }
    const boundedWidth = width - margin.left - margin.right
    const boundedHeight = height - margin.top - margin.top
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
    const xAccessor = ({ humidity }: D) => humidity
    const yAccessor = (bin: D[]) => bin.length

    // 3. canvas
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
    const [xMin = 0, xMax = 100] = extent(dataset, xAccessor)
    const xRange = [0, dimensions.bounded.width]
    const xScale = scaleLinear().domain([xMin, xMax]).range(xRange).nice()
    const xDomain = xScale.domain() as [number, number]

    // 5. draw
    const binsGenerator = bin<D, any>()
      .domain(xDomain)
      .value(xAccessor)
      .thresholds(12)

    console.log("drawBars ~ xScale.domain()", xScale.domain())
    const bins = binsGenerator(dataset)

    const yMax = max(bins, yAccessor) ?? 100
    const yScale = scaleLinear()
      .domain([0, yMax])
      .range([dimensions.bounded.height, 0])
      .nice()

    const binsGroup = bounds.append("g")
    const binGroups = binsGroup.selectAll("g").data(bins).join("g")

    const barPadding = 2
    const barLabelMargin = 4

    const barRects = binGroups
      .append("rect")
      .attr("x", ({ x0 }) => xScale(x0) + barPadding / 2)
      .attr("y", (d) => yScale(yAccessor(d)))
      .attr(
        "width",
        ({ x1, x0 }) => max([0, xScale(x1) - xScale(x0) - barPadding]) ?? 0,
      )
      .attr("height", (d) => dimensions.bounded.height - yScale(yAccessor(d)))
      .attr("fill", "lemonchiffon")
      .attr("stroke", "cornflowerblue")
      .attr("stroke-width", "1px")

    const barTexts = binGroups
      .append("text")
      .text(yAccessor)
      .attr("x", ({ x0, x1 }) => xScale(x0) + (xScale(x1) - xScale(x0)) / 2)
      .attr("y", (d) => yScale(yAccessor(d)) - barLabelMargin)
      .style("fill", "cornflowerblue")
      .style("text-anchor", "middle")
      .style("font-family", "sans-serif")
      .style("font-size", "14px")

    // 6. peripherals
    const meanValue = mean(dataset, xAccessor) ?? 0
    const meanLine = bounds
      .append("line")
      .attr("x1", xScale(meanValue))
      .attr("x2", xScale(meanValue))
      .attr("y1", 0)
      .attr("y2", dimensions.bounded.height)
      .style("stroke", "cornflowerblue")
      .style("stroke-dasharray", "4px 6px")

    const meanLabel = bounds
      .append("text")
      .text("mean")
      .attr("x", xScale(meanValue))
      .attr("y", -barLabelMargin)
      .style("font-size", "14px")
      .style("fill", "cornflowerblue")
      .style("text-anchor", "middle")

    const xAxisGenerator = axisBottom(xScale)
    const xAxis = bounds
      .append("g")
      .call(xAxisGenerator)
      .style("transform", `translateY(${dimensions.bounded.height}px)`)
      .style("font-size", "12px")
      .style("color", "cornflowerblue")
    const xAxisLabel = xAxis
      .append("text")
      .text("Humidity")
      .attr("x", dimensions.bounded.width / 2)
      .attr("y", dimensions.margin.bottom / 2)
      .style("fill", "cornflowerblue")
  }

  useEffect(() => {
    const element = wrapperRef.current

    if (dataset && element) {
      drawBars(dataset, element)
    }
  }, [dataset])

  return <div ref={wrapperRef} id="wrapper" />
}

export default HumidityBarChart
