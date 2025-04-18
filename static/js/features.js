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
  } = featureParameters;
  // if ()
  const value = (max - min) / 2;

  const weightId = id + "-weight";
  const valueId = id + "-value";
  const weightValueId = weightId + "-value";
  return `
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
          />
        </label>
        <span class="value-display" id="${valueId}">${value}</span>
      </div>

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
        />
        <span class="value-display" id="${weightValueId}">5</span>
      </div>
      <hr />
    </div>
    `;
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

// export function smallFeaturesObjects() {
//   return {
//     numAdults: { name: "Num Adults", category: "Other" },
//     numChildren: { name: "Num Children", category: "Other" },
//     riskValue: { name: "Risk Value", category: "Natural Disasters" },
//   };
// }

// export function smallFeaturesArray() {
//   return [
//     { id: "numAdults", name: "Num Adults", category: "Other" },
//     { id: "numChildren", name: "Num Children", category: "Other" },
//     { id: "riskValue", name: "Risk Value", category: "Natural Disasters" },
//   ];
// }

export function featuresObjects() {
  return {
    numAdults: {
      id: "numAdults",
      name: "Num Adults",
      category: "Other",
      min: 0,
      max: 4,
      step: 1
    },
    numChildren: {
      id: "numChildren",
      name: "Num Children",
      category: "Other",
      min: 0,
      max: 4,
      step: 1
    },
    riskValue: {
      id: "riskValue",
      name: "Risk Value",
      category: "Natural Disasters",
      min: 35741.265923,
      max: 5326193000,
      step: 1
    },
    riskScore: {
      id: "riskScore",
      name: "Risk Score",
      category: "Natural Disasters",
      min: 0.031817,
      max: 100,
      step: 1
    },
    riskSpctl: {
      id: "riskSpctl",
      name: "Risk Spctl",
      category: "Natural Disasters",
      min: 0.393701,
      max: 100,
      step: 1
    },
    riskRatng: {
      id: "riskRatng",
      name: "Risk Ratng",
      category: "Natural Disasters",
      min: 1.0,
      max: 5.0,
      step: 0.5
    },
    reslValue: {
      id: "reslValue",
      name: "Resl Value",
      category: "Natural Disasters",
      min: 1.810037,
      max: 3.013601,
      step: 0.5
    },
    reslScore: {
      id: "reslScore",
      name: "Resl Score",
      category: "Natural Disasters",
      min: 0.0,
      max: 100,
      step: 1
    },
    reslSpctl: {
      id: "reslSpctl",
      name: "Resl Spctl",
      category: "Natural Disasters",
      min: 0.003937,
      max: 1.0,
      step: 0.5
    },
    reslRatng: {
      id: "reslRatng",
      name: "Resl Ratng",
      category: "Natural Disasters",
      min: 1.0,
      max: 5.0,
      step: 0.5
    },
    monthlyChildcare: {
      id: "monthlyChildcare",
      name: "Monthly Childcare",
      category: "Expenses",
      min: 0.0,
      max: 0.0,
      step: 0.5
    },
    monthlyFood: {
      id: "monthlyFood",
      name: "Monthly Food",
      category: "Expenses",
      min: 470.497883,
      max: 1359.791,
      step: 1
    },
    monthlyHealthcare: {
      id: "monthlyHealthcare",
      name: "Monthly Healthcare",
      category: "Expenses",
      min: 641.685592,
      max: 1629.243,
      step: 1
    },
    monthlyHousing: {
      id: "monthlyHousing",
      name: "Monthly Housing",
      category: "Housing",
      min: 432.094033,
      max: 3135.993,
      step: 1
    },
    monthlyOtherNecessities: {
      id: "monthlyOtherNecessities",
      name: "Monthly Other Necessities",
      category: "Expenses",
      min: 326.877425,
      max: 1324.181,
      step: 1
    },
    monthlyTaxes: {
      id: "monthlyTaxes",
      name: "Monthly Taxes",
      category: "Expenses",
      min: 448.52425,
      max: 1562.971,
      step: 1
    },
    monthlyTotal: {
      id: "monthlyTotal",
      name: "Monthly Total",
      category: "Expenses",
      min: 4121.942083,
      max: 9408.988,
      step: 1
    },
    monthlyTransportation: {
      id: "monthlyTransportation",
      name: "Monthly Transportation",
      category: "Expenses",
      min: 557.01355,
      max: 1788.996,
      step: 1
    },
    accessToExerciseOpportunities: {
      id: "accessToExerciseOpportunities",
      name: "Access To Exercise Opportunities",
      category: "Amenities",
      min: 0.0,
      max: 1.0,
      step: 0.5
    },
    foodEnvironmentIndex: {
      id: "foodEnvironmentIndex",
      name: "Food Environment Index",
      category: "Amenities",
      min: 0.0,
      max: 10.0,
      step: 0.5
    },
    primaryCarePhysicians: {
      id: "primaryCarePhysicians",
      name: "Primary Care Physicians",
      category: "Amenities",
      min: 0.0,
      max: 0.005805274,
      step: 0.5
    },
    airPollutionParticulateMatter: {
      id: "airPollutionParticulateMatter",
      name: "Air Pollution Particulate Matter",
      category: "Weather",
      min: 1.3,
      max: 39.1,
      step: 0.5
    },
    broadbandAccess: {
      id: "broadbandAccess",
      name: "Broadband Access",
      category: "Amenities",
      min: 0.481383,
      max: 1.0,
      step: 0.5
    },
    lifeExpectancy: {
      id: "lifeExpectancy",
      name: "Life Expectancy",
      category: "Other",
      min: 53.980813,
      max: 94.21899,
      step: 0.5
    },
    trafficVolume: {
      id: "trafficVolume",
      name: "Traffic Volume",
      category: "Other",
      min: 0.000332,
      max: 1753.935,
      step: 1
    },
    homeownership: {
      id: "homeownership",
      name: "Homeownership",
      category: "Housing",
      min: 0.0,
      max: 0.9738527,
      step: 0.5
    },
    accessToParks: {
      id: "accessToParks",
      name: "Access To Parks",
      category: "Amenities",
      min: 0.0,
      max: 1.0,
      step: 0.5
    },
    averageTemperatureF: {
      id: "averageTemperatureF",
      name: "Average Temperature F",
      category: "Weather",
      min: 18.1,
      max: 77.7,
      step: 0.5
    },
    maximumTemperatureF: {
      id: "maximumTemperatureF",
      name: "Maximum Temperature F",
      category: "Weather",
      min: 25.0,
      max: 89.8,
      step: 0.5
    },
    minimumTemperatureF: {
      id: "minimumTemperatureF",
      name: "Minimum Temperature F",
      category: "Weather",
      min: 11.2,
      max: 70.2,
      step: 0.5
    },
    precipitationInches: {
      id: "precipitationInches",
      name: "Precipitation Inches",
      category: "Weather",
      min: 0.99,
      max: 206.04,
      step: 1
    },
    medianSalePrice: {
      id: "medianSalePrice",
      name: "Median Sale Price",
      category: "Housing",
      min: 8000.0,
      max: 3892704.0,
      step: 1
    },
    medianListPrice: {
      id: "medianListPrice",
      name: "Median List Price",
      category: "Housing",
      min: 14900.0,
      max: 4718182.0,
      step: 1
    },
    medianPpsf: {
      id: "medianPpsf",
      name: "Median Ppsf",
      category: "Housing",
      min: 9.52,
      max: 6817.84,
      step: 1
    },
    homesSold: {
      id: "homesSold",
      name: "Homes Sold",
      category: "Housing",
      min: 0.0,
      max: 56353.0,
      step: 1
    },
    newListings: {
      id: "newListings",
      name: "New Listings",
      category: "Housing",
      min: 0.0,
      max: 74105.0,
      step: 1
    },
    inventory: {
      id: "inventory",
      name: "Inventory",
      category: "Housing",
      min: 0.0,
      max: 194641.0,
      step: 1
    },
    monthsOfSupply: {
      id: "monthsOfSupply",
      name: "Months Of Supply",
      category: "Housing",
      min: 0.0,
      max: 99.0,
      step: 0.5
    },
    medianDomMonths: {
      id: "medianDomMonths",
      name: "Median Dom Months",
      category: "Housing",
      min: 0.29,
      max: 46.64,
      step: 0.5
    },
    unemploymentRate: {
      id: "unemploymentRate",
      name: "Unemployment Rate",
      category: "Other",
      min: 0.3,
      max: 17.3,
      step: 0.5
    },
    crimeRatePer100000: {
      id: "crimeRatePer100000",
      name: "Crime Rate Per",
      category: "Crime",
      min: 0.0,
      max: 1754.915,
      step: 1
    }
  };
}


export function featuresArray() {
  return Object.values(featuresObjects());
}
