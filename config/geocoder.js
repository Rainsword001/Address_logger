import NodeGeocoder from "node-geocoder";

const options = {
  provider: "openstreetmap",
  httpAdapter: "https",
  formatter: null
};

const geocoder = NodeGeocoder(options);

export default geocoder;
