import React, { FC } from "react"

// styles
import styles from "styles/Home.module.css"

// components
import TemperatureLineChart from "components/TemperatureLineChart"

const Home: FC = () => (
  <div className={styles.container}>
    <TemperatureLineChart />
  </div>
)

export default Home
