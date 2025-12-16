const buildAddressString = ({
  street,
  city,
  state,
  postalCode,
  country
}) => {
  return [street, city, state, postalCode, country]
    .filter(Boolean)
    .join(", ");
};

export default buildAddressString;
