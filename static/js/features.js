export function feature(featureParameters) {
  const { name, category, min, max, step, value, id } = featureParameters;
  const preferenceId = id + "-preference";
  const valueId = id + "-value";
  const preferenceValueId = preferenceId + "-value";
  return `
      <div class="slider-container">
        <div class="fw-bold fs-5 mb-2">${category}</div>
        <label class="d-inline" for="${id}"
          >${name}
          <input
            class="d-inline"
            type="range"
            id="${id}"
            name="${id}"
            min="${min}"
            max="${max}"
            step="${step}"
            value="${value}"
            oninput="updateValue('${id}')"
          />
        </label>
        <span class="value-display" id="${valueId}">500000</span>
      </div>

      <div class="slider-container">
        <label for="${preferenceId}">Preference</label>
        <input
          class="d-inline"
          type="range"
          id="${preferenceId}"
          name="${preferenceId}"
          min="0"
          max="10"
          step="1"
          value="5"
          oninput="updateValue('${preferenceId}')"
        />
        <span class="value-display" id="${preferenceValueId}">5</span>
      </div>
      <hr />
    `;
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

export function getFeaturePreferenceIds() {
  return getFeatureIds().map((key) => key + "-preference");
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
    numAdults: { name: "Num Adults", category: "Other" },
    numChildren: { name: "Num Children", category: "Other" },
    riskValue: { name: "Risk Value", category: "Natural Disasters" },
    riskScore: { name: "Risk Score", category: "Natural Disasters" },
    riskSpctl: { name: "Risk Spctl", category: "Natural Disasters" },
    riskRatng: { name: "Risk Ratng", category: "Natural Disasters" },
    reslValue: { name: "Resl Value", category: "Natural Disasters" },
    reslScore: { name: "Resl Score", category: "Natural Disasters" },
    reslSpctl: { name: "Resl Spctl", category: "Natural Disasters" },
    reslRatng: { name: "Resl Ratng", category: "Natural Disasters" },
    monthlyChildcare: { name: "Monthly Childcare", category: "Expenses" },
    monthlyFood: { name: "Monthly Food", category: "Expenses" },
    monthlyHealthcare: { name: "Monthly Healthcare", category: "Expenses" },
    monthlyHousing: { name: "Monthly Housing", category: "Housing" },
    monthlyOtherNecessities: {
      name: "Monthly Other Necessities",
      category: "Expenses",
    },
    monthlyTaxes: { name: "Monthly Taxes", category: "Expenses" },
    monthlyTotal: { name: "Monthly Total", category: "Expenses" },
    monthlyTransportation: {
      name: "Monthly Transportation",
      category: "Expenses",
    },
    accessToExerciseOpportunities: {
      name: "Access To Exercise Opportunities",
      category: "Amenities",
    },
    foodEnvironmentIndex: {
      name: "Food Environment Index",
      category: "Amenities",
    },
    primaryCarePhysicians: {
      name: "Primary Care Physicians",
      category: "Amenities",
    },
    airPollutionParticulateMatter: {
      name: "Air Pollution Particulate Matter",
      category: "Weather",
    },
    broadbandAccess: { name: "Broadband Access", category: "Amenities" },
    lifeExpectancy: { name: "Life Expectancy", category: "Other" },
    trafficVolume: { name: "Traffic Volume", category: "Other" },
    homeownership: { name: "Homeownership", category: "Housing" },
    accessToParks: { name: "Access To Parks", category: "Amenities" },
    averageTemperatureF: { name: "Average Temperature F", category: "Weather" },
    maximumTemperatureF: { name: "Maximum Temperature F", category: "Weather" },
    minimumTemperatureF: { name: "Minimum Temperature F", category: "Weather" },
    precipitationInches: { name: "Precipitation Inches", category: "Weather" },
    medianSalePrice: { name: "Median Sale Price", category: "Housing" },
    medianListPrice: { name: "Median List Price", category: "Housing" },
    medianPpsf: { name: "Median Ppsf", category: "Housing" },
    homesSold: { name: "Homes Sold", category: "Housing" },
    newListings: { name: "New Listings", category: "Housing" },
    inventory: { name: "Inventory", category: "Housing" },
    monthsOfSupply: { name: "Months Of Supply", category: "Housing" },
    medianDomMonths: { name: "Median Dom Months", category: "Housing" },
    unemploymentRate: { name: "Unemployment Rate", category: "Other" },
    crimeRatePer100000: { name: "Crime Rate Per", category: "Crime" },
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
