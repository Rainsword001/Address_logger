import geocoder from "../config/geocoder.js";

export const reverseGeocode = async (latitude, longitude) => {
  const result = await geocoder.reverse({
    lat: latitude,
    lon: longitude
  });

  if (!result.length) {
    throw new Error("Unable to reverse geocode");
  }

  return {
    street: result[0].streetName,
    city: result[0].city,
    state: result[0].state,
    country: result[0].country,
    postalCode: result[0].zipcode
  };
};
