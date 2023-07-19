import "./styles.css";
import { useState, useEffect } from "react";
import GoalChart from "./GoalChart";
import React from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Divider from "@mui/material/Divider";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

export default function App() {
  const insuredAge = 45;
  const [range, setRange] = useState(98);
  const [is98, setIs98] = useState(98);
  const [data, setData] = useState(null);
  const [goal, setGoal] = useState(200000);
  const [premium, setPremium] = useState(0);
  const [interval, setInterval] = useState((range - insuredAge) * 12);
  const [investmentInterval, setInvestmentInterval] = useState(
    (60 - insuredAge) * 12
  );
  const [SAReduce, setSAReduce] = useState(true);
  const goals = [
    {
      name: "Retirement",
      investmentInterval: (60 - insuredAge) * 12,
      goal: 2000000
    },
    {
      name: "Legacy",
      investmentInterval: (range - insuredAge) * 12,
      goal: 5400000
    },
    { name: "Education", investmentInterval: 10 * 12, goal: 800000 }
  ];
  const [isLoading, setIsLoading] = useState(false);

  async function getRecommend(amount, investmentInterval, premium) {
    try {
      const d = await (
        await fetch(
          `https://hrr9fn-3000.csb.app/recommend?amount=${amount}&time=${investmentInterval}&premium=${premium}`
        )
      ).json();

      return d;
    } catch {
      return null;
    }
  }

  async function getProjection(premium, interval, SAReduce) {
    try {
      const d = await (
        await fetch(
          `https://hrr9fn-3000.csb.app/projection?premium=${premium}&interval=${interval}`
        )
      ).json();

      return d;
    } catch {
      return null;
    }
  }

  async function init() {
    if (premium === 0) {
      setIsLoading(true);
      const r = await getRecommend(goal, investmentInterval, 0);
      setPremium(r.recommendedRegularCashFlowAmount);

      const d = await getProjection(
        r.recommendedRegularCashFlowAmount,
        interval
      );

      setData(d);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    //init();
  }, []);

  return (
    <div className="App">
      <Backdrop open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Box>
        <GoalChart
          data={data}
          goal={goal}
          interval={interval}
          investmentInterval={investmentInterval}
          SAReduce={SAReduce}
          premium={premium}
          insuredAge={insuredAge}
        />
        <Divider />
        <Box
          style={{ padding: "10px" }}
          noValidate
          autoComplete="off"
          sx={{ width: "100%", textAlign: "left" }}
        >
          <Box style={{ padding: "10px", display: "flex" }}>
            <TextField
              value={goal}
              label="Goal"
              disabled
              style={{ padding: "10px" }}
            />

            <TextField
              disabled
              value={investmentInterval}
              label="Investment Interval"
              style={{ padding: "10px 0 0 20px" }}
            />
            <Typography mt={2} style={{ padding: "10px" }}>
              months = {parseInt(investmentInterval / 12)} years
            </Typography>
          </Box>
          <Divider />
          <Box style={{ padding: "10px", display: "flex" }}>
            <div style={{ width: "30vw" }}>Select/change concern from FNA:</div>
            <Select
              onChange={async (x) => {
                setIsLoading(true);
                const g = goals.find((g) => g.name === x.target.value);
                setInvestmentInterval(g.investmentInterval);
                setGoal(g.goal);

                const r = await getRecommend(g.goal, g.investmentInterval, 0);
                setPremium(r.recommendedRegularCashFlowAmount);

                const d = await getProjection(
                  r.recommendedRegularCashFlowAmount,
                  interval
                );

                setData(d);
                setIsLoading(false);
              }}
            >
              {goals.map((x) => (
                <MenuItem value={x.name}>{x.name}</MenuItem>
              ))}
            </Select>
          </Box>
          <Box style={{ padding: "10px", display: "flex" }}>
            <div style={{ width: "30vw" }}>Reduce Premium</div>
            <TextField
              label="Premium"
              onKeyPress={async (e) => {
                if (e.key === "Enter") {
                  setIsLoading(true);
                  const d = await getProjection(premium, interval);

                  setData(d);
                  setIsLoading(false);
                }
              }}
              onChange={(e) => {
                //console.log(e.target.value);
                setPremium(e.target.value);
              }}
              defaultValue={premium}
              value={premium}
            />
          </Box>
          <Box style={{ padding: "10px", display: "flex" }}>
            <div style={{ width: "30vw" }}>Sum assured option</div>
            <Checkbox
              checked={SAReduce}
              onChange={async (x) => {
                setSAReduce(!SAReduce);
                setIsLoading(true);
                const d = await getProjection(premium, interval);
                setData(d);
                setIsLoading(false);
              }}
            />
            <Typography mt={2}>
              {SAReduce ? "Reduce at 60 to minimal" : "Unchange after 60"}
            </Typography>
          </Box>

          <Box style={{ padding: "10px", display: "flex" }}>
            <div style={{ width: "30vw" }}>Actions:</div>
            <Button
              onClick={async () => {
                setIsLoading(true);
                const r = await getRecommend(goal, investmentInterval, premium);

                setGoal(r.recommendedTargetAmount);
                setIsLoading(false);
              }}
            >
              Adjust goal
            </Button>
            <Button
              onClick={async () => {
                setIsLoading(true);
                const r = await getRecommend(
                  goal,
                  (range - insuredAge) * 12,
                  premium
                );

                //setGoal(r.recommendedTargetAmount);
                setInvestmentInterval(r.recommendedLength);
                setIsLoading(false);
              }}
            >
              Adjust investment interval
            </Button>
            <Button
              onClick={async (e) => {
                setIsLoading(true);
                const g = goals.find((g) => g.name === "Retirement");
                setInvestmentInterval(g.investmentInterval);
                setGoal(g.goal);

                const r = await getRecommend(g.goal, g.investmentInterval, 0);
                setPremium(r.recommendedRegularCashFlowAmount);

                const d = await getProjection(
                  r.recommendedRegularCashFlowAmount,
                  interval
                );

                setData(d);
                setIsLoading(false);
              }}
            >
              Reset to original goal
            </Button>
          </Box>
        </Box>
      </Box>
    </div>
  );
}
