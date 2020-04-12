/* eslint-disable max-len */

/* eslint-disable no-use-before-define */


function covid19ImpactEstimator(req, res) {
  const impact = impactFunction(req.body);
  const severeImpact = severeImpactFunction(req.body);
  const output = {
    data: req.body,
    impact,
    severeImpact
  };

  res.sendData(output);
}

function impactFunction(data) {
  const impact = {};
  // currentlyInfected
  const currentlyInfected = currentlyInfectedFunction(data.reportedCases, 10);
  impact.currentlyInfected = currentlyInfected;

  // infectionsByRequestedTime
  const infectionsByRequestedTime = infectionsByRequestedTimeFunction(currentlyInfected, data.timeToElapse, data.periodType);
  impact.infectionsByRequestedTime = infectionsByRequestedTime;

  // severeCasesByRequestedTime
  const severeCasesByRequestedTime = severeCasesByRequestedTimeFunction(infectionsByRequestedTime);
  impact.severeCasesByRequestedTime = severeCasesByRequestedTime;

  // avaliable cases
  const AvaliableBedSpace = avaliableBedSpaceFunction(data.totalHospitalBeds, severeCasesByRequestedTime);
  if (AvaliableBedSpace < 0) {
    impact.hospitalBedsByRequestedTime = Math.trunc(AvaliableBedSpace);
  } else {
    impact.hospitalBedsByRequestedTime = Math.trunc((35 / 100) * data.totalHospitalBeds);
  }
  const casesForICUByRequestedTime = casesForICUByRequestedTimeFunction(infectionsByRequestedTime);
  impact.casesForICUByRequestedTime = casesForICUByRequestedTime;
  const casesForVentilatorsByRequestedTime = casesForVentilatorsByRequestedTimeFunction(infectionsByRequestedTime);
  impact.casesForVentilatorsByRequestedTime = casesForVentilatorsByRequestedTime;
  const dollarsInFlight = dollarsInFlightFunction(infectionsByRequestedTime, data, data.timeToElapse, data.periodType);
  impact.dollarsInFlight = dollarsInFlight;

  return impact;
}

function severeImpactFunction(data) {
  const impact = {};
  // currentlyInfected
  const currentlyInfected = currentlyInfectedFunction(data.reportedCases, 50);
  impact.currentlyInfected = currentlyInfected;

  // infectionsByRequestedTime
  const infectionsByRequestedTime = infectionsByRequestedTimeFunction(currentlyInfected, data.timeToElapse, data.periodType);
  impact.infectionsByRequestedTime = infectionsByRequestedTime;

  // severeCasesByRequestedTime
  const severeCasesByRequestedTime = severeCasesByRequestedTimeFunction(infectionsByRequestedTime);
  impact.severeCasesByRequestedTime = severeCasesByRequestedTime;

  // hospitalBedsByRequestedTime
  const AvaliableBedSpace = avaliableBedSpaceFunction(data.totalHospitalBeds, severeCasesByRequestedTime);
  if (AvaliableBedSpace < 0) {
    impact.hospitalBedsByRequestedTime = AvaliableBedSpace;
  } else {
    impact.hospitalBedsByRequestedTime = Math.trunc((35 / 100) * data.totalHospitalBeds);
  }

  // casesForICUByRequestedTime
  const casesForICUByRequestedTime = casesForICUByRequestedTimeFunction(infectionsByRequestedTime);
  impact.casesForICUByRequestedTime = casesForICUByRequestedTime;

  // casesForVentilatorsByRequestedTime
  const casesForVentilatorsByRequestedTime = casesForVentilatorsByRequestedTimeFunction(infectionsByRequestedTime);
  impact.casesForVentilatorsByRequestedTime = casesForVentilatorsByRequestedTime;
  const dollarsInFlight = dollarsInFlightFunction(infectionsByRequestedTime, data, data.timeToElapse, data.periodType);
  impact.dollarsInFlight = dollarsInFlight;


  return impact;
}


function currentlyInfectedFunction(reportedCases, digit) {
  return reportedCases * digit;
}

function infectionsByRequestedTimeFunction(currentlyInfected, timeToElapse, periodType) {
  let time = 1;
  if (periodType === 'days') {
    time = timeToElapse;
  }
  if (periodType === 'weeks') {
    time = timeToElapse * 7;
  }
  if (periodType === 'months') {
    time = timeToElapse * 30;
  }
  const repeatedTime = Math.trunc(time / 3);

  return Math.trunc(currentlyInfected * (2 ** repeatedTime));
}

function severeCasesByRequestedTimeFunction(infectionsByRequestedTime) {
  return Math.trunc((15 / 100) * infectionsByRequestedTime);
}

function avaliableBedSpaceFunction(totalHospitalBeds, severeCasesByRequestedTime) {
  const hospitalBedsByRequestedTime = (35 / 100) * totalHospitalBeds;
  return Math.trunc(hospitalBedsByRequestedTime - severeCasesByRequestedTime);
}

function casesForICUByRequestedTimeFunction(infectionsByRequestedTime) {
  return Math.trunc((5 / 100) * infectionsByRequestedTime);
}

function casesForVentilatorsByRequestedTimeFunction(infectionsByRequestedTime) {
  return Math.trunc((2 / 100) * infectionsByRequestedTime);
}

function dollarsInFlightFunction(infectionsByRequestedTime, data, timeToElapse, periodType) {
  let time = 1;
  if (periodType === 'days') {
    time = timeToElapse;
  }
  if (periodType === 'weeks') {
    time = timeToElapse * 7;
  }
  if (periodType === 'months') {
    time = timeToElapse * 30;
  }
  return Math.trunc((infectionsByRequestedTime * data.region.avgDailyIncomePopulation * data.region.avgDailyIncomeInUSD) / time);
}


export default covid19ImpactEstimator;
