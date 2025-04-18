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
    min = 0,
    max = 10,
    step = 1,
    value = 1,
    id,
  } = featureParameters;
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
        <span class="value-display" id="${valueId}">500000</span>
      </div>

      <div class="slider-container">
        <label for="${weightId}">weight</label>
        <input
          class="d-inline featureWeightSlider"
          type="range"
          id="${weightId}"
          name="${weightId}"
          min="0"
          max="10"
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

  //   document.querySelector(getFeatureIds().map(id => "#"+id).forEach(featureSlider => {
  //     featureSlider.addEventListener("oninput", updateSliderValue);
  //   })
}

export function getFeatureIds() {
  return Object.keys(smallFeatures());
}

export function getFeatureweightIds() {
  return getFeatureIds().map((key) => key + "-weight");
}

export function smallFeaturesObjects() {
  return {
    numAdults: { name: "Num Adults", category: "Other" },
    numChildren: { name: "Num Children", category: "Other" },
    riskValue: { name: "Risk Value", category: "Natural Disasters" },
  };
}

export function smallFeaturesArray() {
  return [
    { id: "numAdults", name: "Num Adults", category: "Other" },
    { id: "numChildren", name: "Num Children", category: "Other" },
    { id: "riskValue", name: "Risk Value", category: "Natural Disasters" },
  ];
}

export function featuresObjects() {
  return {
    numAdults: {
      id: "numAdults",
      name: "Num Adults",
      category: "Other",
    },
    numChildren: {
      id: "numChildren",
      name: "Num Children",
      category: "Other",
    },
    riskValue: {
      id: "riskValue",
      name: "Risk Value",
      category: "Natural Disasters",
    },
    riskScore: {
      id: "riskScore",
      name: "Risk Score",
      category: "Natural Disasters",
    },
    riskSpctl: {
      id: "riskSpctl",
      name: "Risk Spctl",
      category: "Natural Disasters",
    },
    riskRatng: {
      id: "riskRatng",
      name: "Risk Ratng",
      category: "Natural Disasters",
    },
    reslValue: {
      id: "reslValue",
      name: "Resl Value",
      category: "Natural Disasters",
    },
    reslScore: {
      id: "reslScore",
      name: "Resl Score",
      category: "Natural Disasters",
    },
    reslSpctl: {
      id: "reslSpctl",
      name: "Resl Spctl",
      category: "Natural Disasters",
    },
    reslRatng: {
      id: "reslRatng",
      name: "Resl Ratng",
      category: "Natural Disasters",
    },
    monthlyChildcare: {
      id: "monthlyChildcare",
      name: "Monthly Childcare",
      category: "Expenses",
    },
    monthlyFood: {
      id: "monthlyFood",
      name: "Monthly Food",
      category: "Expenses",
    },
    monthlyHealthcare: {
      id: "monthlyHealthcare",
      name: "Monthly Healthcare",
      category: "Expenses",
    },
    monthlyHousing: {
      id: "monthlyHousing",
      name: "Monthly Housing",
      category: "Housing",
    },
    monthlyOtherNecessities: {
      id: "monthlyOtherNecessities",
      name: "Monthly Other Necessities",
      category: "Expenses",
    },
    monthlyTaxes: {
      id: "monthlyTaxes",
      name: "Monthly Taxes",
      category: "Expenses",
    },
    monthlyTotal: {
      id: "monthlyTotal",
      name: "Monthly Total",
      category: "Expenses",
    },
    monthlyTransportation: {
      id: "monthlyTransportation",
      name: "Monthly Transportation",
      category: "Expenses",
    },
    accessToExerciseOpportunities: {
      id: "accessToExerciseOpportunities",
      name: "Access To Exercise Opportunities",
      category: "Amenities",
    },
    foodEnvironmentIndex: {
      id: "foodEnvironmentIndex",
      name: "Food Environment Index",
      category: "Amenities",
    },
    primaryCarePhysicians: {
      id: "primaryCarePhysicians",
      name: "Primary Care Physicians",
      category: "Amenities",
    },
    airPollutionParticulateMatter: {
      id: "airPollutionParticulateMatter",
      name: "Air Pollution Particulate Matter",
      category: "Weather",
    },
    broadbandAccess: {
      id: "broadbandAccess",
      name: "Broadband Access",
      category: "Amenities",
    },
    lifeExpectancy: {
      id: "lifeExpectancy",
      name: "Life Expectancy",
      category: "Other",
    },
    trafficVolume: {
      id: "trafficVolume",
      name: "Traffic Volume",
      category: "Other",
    },
    homeownership: {
      id: "homeownership",
      name: "Homeownership",
      category: "Housing",
    },
    accessToParks: {
      id: "accessToParks",
      name: "Access To Parks",
      category: "Amenities",
    },
    averageTemperatureF: {
      id: "averageTemperatureF",
      name: "Average Temperature F",
      category: "Weather",
    },
    maximumTemperatureF: {
      id: "maximumTemperatureF",
      name: "Maximum Temperature F",
      category: "Weather",
    },
    minimumTemperatureF: {
      id: "minimumTemperatureF",
      name: "Minimum Temperature F",
      category: "Weather",
    },
    precipitationInches: {
      id: "precipitationInches",
      name: "Precipitation Inches",
      category: "Weather",
    },
    medianSalePrice: {
      id: "medianSalePrice",
      name: "Median Sale Price",
      category: "Housing",
    },
    medianListPrice: {
      id: "medianListPrice",
      name: "Median List Price",
      category: "Housing",
    },
    medianPpsf: {
      id: "medianPpsf",
      name: "Median Ppsf",
      category: "Housing",
    },
    homesSold: {
      id: "homesSold",
      name: "Homes Sold",
      category: "Housing",
    },
    newListings: {
      id: "newListings",
      name: "New Listings",
      category: "Housing",
    },
    inventory: {
      id: "inventory",
      name: "Inventory",
      category: "Housing",
    },
    monthsOfSupply: {
      id: "monthsOfSupply",
      name: "Months Of Supply",
      category: "Housing",
    },
    medianDomMonths: {
      id: "medianDomMonths",
      name: "Median Dom Months",
      category: "Housing",
    },
    unemploymentRate: {
      id: "unemploymentRate",
      name: "Unemployment Rate",
      category: "Other",
    },
    crimeRatePer100000: {
      id: "crimeRatePer100000",
      name: "Crime Rate Per",
      category: "Crime",
    },
  };
}

export function featuresArray() {
  return [
    { id: "numAdults", name: "Num Adults", category: "Other" },
    { id: "numChildren", name: "Num Children", category: "Other" },
    { id: "riskValue", name: "Risk Value", category: "Natural Disasters" },
    { id: "riskScore", name: "Risk Score", category: "Natural Disasters" },
    { id: "riskSpctl", name: "Risk Spctl", category: "Natural Disasters" },
    { id: "riskRatng", name: "Risk Ratng", category: "Natural Disasters" },
    { id: "reslValue", name: "Resl Value", category: "Natural Disasters" },
    { id: "reslScore", name: "Resl Score", category: "Natural Disasters" },
    { id: "reslSpctl", name: "Resl Spctl", category: "Natural Disasters" },
    { id: "reslRatng", name: "Resl Ratng", category: "Natural Disasters" },
    { id: "monthlyChildcare", name: "Monthly Childcare", category: "Expenses" },
    { id: "monthlyFood", name: "Monthly Food", category: "Expenses" },
    {
      id: "monthlyHealthcare",
      name: "Monthly Healthcare",
      category: "Expenses",
    },
    { id: "monthlyHousing", name: "Monthly Housing", category: "Housing" },
    {
      id: "monthlyOtherNecessities",
      name: "Monthly Other Necessities",
      category: "Expenses",
    },
    { id: "monthlyTaxes", name: "Monthly Taxes", category: "Expenses" },
    { id: "monthlyTotal", name: "Monthly Total", category: "Expenses" },
    {
      id: "monthlyTransportation",
      name: "Monthly Transportation",
      category: "Expenses",
    },
    {
      id: "accessToExerciseOpportunities",
      name: "Access To Exercise Opportunities",
      category: "Amenities",
    },
    {
      id: "foodEnvironmentIndex",
      name: "Food Environment Index",
      category: "Amenities",
    },
    {
      id: "primaryCarePhysicians",
      name: "Primary Care Physicians",
      category: "Amenities",
    },
    {
      id: "airPollutionParticulateMatter",
      name: "Air Pollution Particulate Matter",
      category: "Weather",
    },
    { id: "broadbandAccess", name: "Broadband Access", category: "Amenities" },
    { id: "lifeExpectancy", name: "Life Expectancy", category: "Other" },
    { id: "trafficVolume", name: "Traffic Volume", category: "Other" },
    { id: "homeownership", name: "Homeownership", category: "Housing" },
    { id: "accessToParks", name: "Access To Parks", category: "Amenities" },
    {
      id: "averageTemperatureF",
      name: "Average Temperature F",
      category: "Weather",
    },
    {
      id: "maximumTemperatureF",
      name: "Maximum Temperature F",
      category: "Weather",
    },
    {
      id: "minimumTemperatureF",
      name: "Minimum Temperature F",
      category: "Weather",
    },
    {
      id: "precipitationInches",
      name: "Precipitation Inches",
      category: "Weather",
    },
    { id: "medianSalePrice", name: "Median Sale Price", category: "Housing" },
    { id: "medianListPrice", name: "Median List Price", category: "Housing" },
    { id: "medianPpsf", name: "Median Ppsf", category: "Housing" },
    { id: "homesSold", name: "Homes Sold", category: "Housing" },
    { id: "newListings", name: "New Listings", category: "Housing" },
    { id: "inventory", name: "Inventory", category: "Housing" },
    { id: "monthsOfSupply", name: "Months Of Supply", category: "Housing" },
    { id: "medianDomMonths", name: "Median Dom Months", category: "Housing" },
    { id: "unemploymentRate", name: "Unemployment Rate", category: "Other" },
    { id: "crimeRatePer100000", name: "Crime Rate Per", category: "Crime" },
  ];
}
