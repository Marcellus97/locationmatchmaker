export function updateSliderValue(id) {
  const slider = document.getElementById(id);
  const display = document.getElementById(id + "-value");
  if (slider && display) {
    display.textContent = slider.value;
  } else {
    console.error(`Element with id "${id}" or "${id}-value" not found.`);
  }
}

export function feature(featureParameters) {
  const {
    name,
    category,
    min,
    max,
    step,
    // value,
    id,
    dataFrameKey
  } = featureParameters;
  // if ()
  const value = (max - min) / 2;

  const weightId = id + "-weight";
  const valueId = id + "-value";
  const weightValueId = weightId + "-value";
  let html =`
  <div class="slider-group d-none">
      <div class="slider-container">
        <div class="fw-bold fs-5 mb-2">${category}</div>
        <label class="d-inline" for="${id}"
          >${name}
          <input
            class="d-inline featureSlider"
            type="range"
            id="${id}"
            name="${id}"
            min="${min}"
            max="${max}"
            step="${step}"
            value="${value}"
            oninput="updateSliderValue('${id}')"
            dataFrameKey="${dataFrameKey}"
          />
        </label>
        <span class="value-display" id="${valueId}">${value}</span>
      </div>`;

      // these should not have slider weights. Probably can change the input type...
      if (id === "numAdults" || id === "numChildren") {
        return html;
      }

      html += `
      <div class="slider-container">
        <label for="${weightId}">weight</label>
        <input
          class="d-inline featureWeightSlider"
          type="range"
          id="${weightId}"
          name="${weightId}"
          min="1"
          max="100"
          step="1"
          value="5"
          oninput="updateSliderValue('${weightId}')"
          dataFrameKey="${dataFrameKey}_weight"
        />
        <span class="value-display" id="${weightValueId}">5</span>
      </div>
      <hr />
    </div>
    `;
    return html;
}

export function getCurrentDisplayedFeatureSliders() {
  Object.values(featuresObjects()).filter(feature => {
    document.querySelector('div:not(.d-none) input[name="numAdults"])');
  })
  

}

export function generateFeatureCheckboxes() {
  const features = featuresArray();

  let html = "";

  features.forEach((feature) => {
    html += `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="${feature.id}Checkbox" featureId=${feature.id}>
        <label class="form-check-label" for="${feature.id}Checkbox">
          ${feature.name}
        </label>
      </div>
    `;
  });

  return html;
}

export function addFeature(featureObject) {
  let existingFeature = document.getElementById(feature.id);
  if (existingFeature) {
    return;
  }

  let featureHtml = feature(featureObject);
  document.getElementById("featuresContainer").innerHTML += featureHtml;
}

export function getFeatureIds() {
  return Object.keys(smallFeatures());
}

export function getFeatureweightIds() {
  return getFeatureIds().map((key) => key + "-weight");
}

export function featuresObjects() {
  return {
    numAdults: {
      id: "numAdults",
      name: "Number of Adults / Household (COL)",
      category: "Other",
      min: 0,
      max: 4,
      step: 1,
      dataFrameKey: "num_adults"
    },
    numChildren: {
      id: "numChildren",
      name: "Num Children / Household (COL)",
      category: "Other",
      min: 0,
      max: 4,
      step: 1,
      dataFrameKey: "num_children"
    },
    // riskValue: {
    //   id: "riskValue",
    //   name: "Risk Value (RAW)",
    //   category: "Natural Disasters",
    //   min: 35741.265923,
    //   max: 5326193000,
    //   step: 1,
    //   dataFrameKey: "RISK_VALUE"
    // },
    riskScore: {
      id: "riskScore",
      name: "Risk Score (0 Lowest, 100 Highest)",
      category: "Natural Disasters",
      min: 0.0,
      // min: 0.031817,
      max: 100,
      step: 0.5,
      dataFrameKey: "RISK_SCORE"
    },
    // riskSpctl: {
    //   id: "riskSpctl",
    //   name: "Risk Spctl",
    //   category: "Natural Disasters",
    //   min: 0.393701,
    //   max: 100,
    //   step: 1,
    //   dataFrameKey: "RISK_SPCTL"
    // },
    // riskRatng: {
    //   id: "riskRatng",
    //   name: "Risk Ratng (From Lower Risk to Higher Risk)",
    //   category: "Natural Disasters",
    //   min: 1.0,
    //   max: 5.0,
    //   step: 0.5,
    //   dataFrameKey: "RISK_RATNG"
    // },
    // reslValue: {
    //   id: "reslValue",
    //   name: "Resl Value",
    //   category: "Natural Disasters",
    //   min: 1.810037,
    //   max: 3.013601,
    //   step: 0.5,
    //   dataFrameKey: "RESL_VALUE"
    // },
    // reslScore: {
    //   id: "reslScore",
    //   name: "Resl Score",
    //   category: "Natural Disasters",
    //   min: 0.0,
    //   max: 100,
    //   step: 1,
    //   dataFrameKey: "RESL_SCORE"
    // },
    // reslSpctl: {
    //   id: "reslSpctl",
    //   name: "Resl Spctl",
    //   category: "Natural Disasters",
    //   min: 0.003937,
    //   max: 1.0,
    //   step: 0.5,
    //   dataFrameKey: "RESL_SPCTL"
    // },
    // reslRatng: {
    //   id: "reslRatng",
    //   name: "Resl Ratng",
    //   category: "Natural Disasters",
    //   min: 1.0,
    //   max: 5.0,
    //   step: 0.5,
    //   dataFrameKey: "RESL_RATNG"
    // },
    monthlyChildcare: {
      id: "monthlyChildcare",
      name: "Monthly Childcare Costs",
      category: "Expenses",
      min: 0.0,
      max: 5500,
      // min: 0.0,
      // max: 5060.284167,
      step: 0.5,
      dataFrameKey: "Monthly_Childcare"
    },
    monthlyFood: {
      id: "monthlyFood",
      name: "Monthly Food Costs",
      category: "Expenses",
      min: 250, 
      max: 3500,
      // min: 470.497883,
      // max: 1359.791,
      step: 1,
      dataFrameKey: "Monthly_Food"
    },
    monthlyHealthcare: {
      id: "monthlyHealthcare",
      name: "Monthly Healthcare Costs",
      category: "Expenses",
      min: 250,
      max: 4000,
      // min: 641.685592,
      // max: 1629.243,
      step: 1,
      dataFrameKey: "Monthly_Healthcare"
    },
    monthlyHousing: {
      id: "monthlyHousing",
      name: "Monthly Housing Costs",
      category: "Housing",
      min: 250,
      max: 5000,
      // min: 432.094033,
      // max: 3135.993,
      step: 1,
      dataFrameKey: "Monthly_Housing"
    },
    monthlyOtherNecessities: {
      id: "monthlyOtherNecessities",
      name: "Monthly Other Necessities Costs",
      category: "Expenses",
      min: 100,
      max: 2500,
      // min: 326.877425,
      // max: 1324.181,
      step: 1,
      step: 1,
      dataFrameKey: "Monthly_Other Necessities"
    },
    monthlyTaxes: {
      id: "monthlyTaxes",
      name: "Monthly Taxes Paid",
      category: "Expenses",
      // min: 448.52425,
      // max: 1562.971,
      min: 250,
      max: 6000,
      step: 1,
      dataFrameKey: "Monthly_Taxes"
    },
    monthlyTotal: {
      id: "monthlyTotal",
      name: "Monthly Total Costs",
      category: "Expenses",
      min: 2500,
      max: 25000,
      // min: 4121.942083,
      // max: 9408.988,
      step: 1,
      dataFrameKey: "Monthly_Total"
    },
    monthlyTransportation: {
      id: "monthlyTransportation",
      name: "Monthly Transportation Costs",
      category: "Expenses",
      // min: 557.01355,
      // max: 1788.996,
      min: 250,
      max: 2500,
      step: 1,
      dataFrameKey: "Monthly_Transportation"
    },
    accessToExerciseOpportunities: {
      id: "accessToExerciseOpportunities",
      name: "Access To Exercise Opportunities Index",
      category: "Amenities",
      min: 0.0,
      max: 1.0,
      step: 0.01,
      dataFrameKey: "Access to Exercise Opportunities"
    },
    foodEnvironmentIndex: {
      id: "foodEnvironmentIndex",
      name: "Food Environment Index",
      category: "Amenities",
      min: 0.0,
      max: 10.0,
      step: 0.1,
      dataFrameKey: "Food Environment Index"
    },
    primaryCarePhysicians: {
      id: "primaryCarePhysicians",
      name: "Primary Care Physicians (per Resident)",
      category: "Amenities",
      min: 0.0,
      max: 0.006,
      step: 0.00001,
      dataFrameKey: "Primary Care Physicians"
    },
    airPollutionParticulateMatter: {
      id: "airPollutionParticulateMatter",
      name: "Air Pollution Particulate Matter (PPM)",
      category: "Weather",
      min: 0,
      max: 40,
      step: 0.05,
      dataFrameKey: "Air Pollution: Particulate Matter"
    },
    broadbandAccess: {
      id: "broadbandAccess",
      name: "Broadband Access Percentage",
      category: "Amenities",
      min: 0.45,
      max: 1.0,
      step: 0.01,
      dataFrameKey: "Broadband Access"
    },
    lifeExpectancy: {
      id: "lifeExpectancy",
      name: "Life Expectancy (Years)",
      category: "Other",
      min: 50,
      max: 95,
      step: 0.05,
      dataFrameKey: "Life Expectancy"
    },
    trafficVolume: {
      id: "trafficVolume",
      name: "Traffic Volume (People per minute)",
      category: "Other",
      min: 0,
      max: 1800,
      step: 1,
      dataFrameKey: "Traffic Volume"
    },
    homeownership: {
      id: "homeownership",
      name: "Homeownership Percentage",
      category: "Housing",
      min: 0.0,
      max: 1,
      step: 0.5,
      dataFrameKey: "Homeownership"
    },
    accessToParks: {
      id: "accessToParks",
      name: "Access To Parks (Index)",
      category: "Amenities",
      min: 0.0,
      max: 1.0,
      step: 0.5,
      dataFrameKey: "Access to Parks"
    },
    averageTemperatureF: {
      id: "averageTemperatureF",
      name: "Average Temperature F",
      category: "Weather",
      min: 15,
      max: 75,
      step: 0.5,
      dataFrameKey: "Average Temperature F"
    },
    maximumTemperatureF: {
      id: "maximumTemperatureF",
      name: "Maximum Temperature F",
      category: "Weather",
      min: 25.0,
      max: 90,
      step: 0.5,
      dataFrameKey: "Maximum Temperature F"
    },
    minimumTemperatureF: {
      id: "minimumTemperatureF",
      name: "Minimum Temperature F",
      category: "Weather",
      min: 10,
      max: 75,
      step: 0.5,
      dataFrameKey: "Minimum Temperature F"
    },
    precipitationInches: {
      id: "precipitationInches",
      name: "Precipitation Inches",
      category: "Weather",
      min: 0,
      max: 250,
      step: 0.1,
      dataFrameKey: "Precipitation_inches"
    },
    medianSalePrice: {
      id: "medianSalePrice",
      name: "Median Sale Price",
      category: "Housing",
      min: 8000,
      max: 400000,
      step: 1,
      dataFrameKey: "median_sale_price"
    },
    medianListPrice: {
      id: "medianListPrice",
      name: "Median List Price",
      category: "Housing",
      min: 10000,
      max: 50000,
      step: 1,
      dataFrameKey: "median_list_price"
    },
    medianPpsf: {
      id: "medianPpsf",
      name: "Median Price per SqFt",
      category: "Housing",
      min: 1,
      max: 7000,
      step: 1,
      dataFrameKey: "median_ppsf"
    },
    homesSold: {
      id: "homesSold",
      name: "Homes Sold (per Year)",
      category: "Housing",
      min: 0,
      max: 60000,
      step: 1,
      dataFrameKey: "homes_sold"
    },
    newListings: {
      id: "newListings",
      name: "New Listings (per Year)",
      category: "Housing",
      min: 0.0,
      max: 75000,
      step: 1,
      dataFrameKey: "new_listings"
    },
    inventory: {
      id: "inventory",
      name: "Inventory (per Year)",
      category: "Housing",
      min: 0.0,
      max: 200000,
      step: 1,
      dataFrameKey: "inventory"
    },
    monthsOfSupply: {
      id: "monthsOfSupply",
      name: "Months Of Supply",
      category: "Housing",
      min: 0.0,
      max: 99.0,
      step: 0.5,
      dataFrameKey: "months_of_supply"
    },
    medianDomMonths: {
      id: "medianDomMonths",
      name: "Median Dom Months",
      category: "Housing",
      min: 0,
      max: 50,
      step: 0.5,
      dataFrameKey: "median_dom_months"
    },
    unemploymentRate: {
      id: "unemploymentRate",
      name: "Unemployment Rate %",
      category: "Other",
      min: 0,
      max: 20,
      step: 0.01,
      dataFrameKey: "Unemployment_Rate"
    },
    crimeRatePer100000: {
      id: "crimeRatePer100000",
      name: "Crime Rate (Per 100k People)",
      category: "Crime",
      min: 0,
      max: 1800,
      step: 0.5,
      dataFrameKey: "crime_rate_per_100000"
    },
    natWalkInd: {
      id: "natWalkInd",
      name: "Walkability Index",
      category: "Other",
      min: 0,
      max: 20,
      step: 0.1,
      dataFrameKey: "NatWalkInd"
    }
  };
}



export function featuresArray() {
  return Object.values(featuresObjects());
}
