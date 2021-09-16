import React, { FC } from "react"

// styles
import styles from "styles/Home.module.css"

// components
import HumidityBarChart from "components/HumidityBarChart"
// import TemperatureLineChart from "components/TemperatureLineChart"
// import LighthousesLineChart from "components/LighthousesLineChart"
// import HumidityTemperatureScatterPlot from "components/HumidityTemperatureScatterPlot"
// import LighthouseHeightVisibilityScatterPlot from "components/LighthouseHeightVisibilityScatterPlot"

const Home: FC = () => (
  <div className={styles.container}>
    <HumidityBarChart />
    {/* <TemperatureLineChart />
    <LighthousesLineChart />
    <HumidityTemperatureScatterPlot />
    <LighthouseHeightVisibilityScatterPlot /> */}
  </div>
)

export default Home
