import geocoder from "../config/geocoder.js";
import buildAddressString from "./buildAddressString.js";

export const geocodeAddress = async (addressFields) => {
  const addressString = buildAddressString(addressFields);

  const results = await geocoder.geocode(addressString);

  if (!results || results.length === 0) {
    const error = new Error(
      "Address could not be located. Please verify details."
    );
    error.statusCode = 422;
    throw error;
  }

  return {
    latitude: results[0].latitude,
    longitude: results[0].longitude
  };
};
