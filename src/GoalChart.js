import "./styles.css";
import { useState, useEffect } from "react";
import React from "react";
import annotationPlugin from "chartjs-plugin-annotation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

export default function GoalChart({
  data,
  goal,
  interval,
  investmentInterval,
  SAReduce,
  premium,
  insuredAge
}) {
  const [labels, setLabels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const SA = SAReduce ? premium * 10 * 12 : goal;
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top"
      },

      annotation: {
        annotations: {
          box1: {
            type: "box",
            xMin: 0,
            xMax: investmentInterval,
            yMin: 0,
            yMax: goal,
            borderColor: "rgba(255, 155, 155)",
            backgroundColor: "rgba(255, 155, 155, 0.0)",
            borderWidth: 2
          },
          label1: {
            type: "label",
            xValue: 100,
            yValue: goal * 1.1,
            backgroundColor: "rgba(245,245,245, 0)",
            content: [`Goal: ` + parseInt(goal)],
            font: {
              size: 18
            }
          },
          label2: {
            type: "label",
            xValue: 200,
            yValue: goal * 1.1,
            backgroundColor: "rgba(245,245,245, 0)",
            content: [`Sum Assured: ` + parseInt(SA)],
            font: {
              size: 18
            }
          }
        }
      }
    },
    scales: {
      x: {
        label: "age",
        ticks: {
          // For a category axis, the val is the index so the lookup via getLabelForValue is needed
          callback: function (val, index) {
            // Hide every 2nd tick label
            const num = this.getLabelForValue(val);
            const year = parseInt(val / 12);
            return index % 12 === 0 ? insuredAge + num / 12 + `(${year})` : "";
          },
          color: "red"
        },
        grid: {
          display: false
        }
      }
    }
  };

  useEffect(() => {
    try {
      const x = data[0].expectedValues.map((x, i) => i); // & " " & x.date.substring(0, 4));
      setLabels(x);

      const ds = data.map((r, i) => {
        return {
          id: i,
          label: r.marketScenario + "%",
          data: r.expectedValues.map((x) => x.value),
          borderColor: "rgb(" + i * 100 + ", 99, 132)",
          backgroundColor: "rgb(" + i * 100 + ", 99, 132)",
          fill: true,
          //borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
          borderWidth: 1,
          pointStyle: false
        };
      });

      const sa = {
        label: "Sum Assured",
        borderColor: "red",
        borderDash: [10, 10],
        borderWidth: 1,
        pointStyle: false,
        data: data[0].expectedValues.map((x, i) =>
          i > (60 - insuredAge) * 12 && SAReduce ? SA : goal
        )
      };
      ds.push(sa);

      setDatasets(ds);
    } catch {
      (e) => {};
    }
  }, [data, goal, interval, investmentInterval, SAReduce]);

  return (
    <Line
      options={options}
      data={{
        labels,
        datasets
      }}
      style={{ width: "80vw" }}
    />
  );
}
