import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  country: { type: String, default: "Nigeria" },
  postalCode: String,
  location: {
    type: { type: String, enum: ["Point"], default:"Point" },
    coordinates: { type:[Number], required:true }
  },
  from: Date,
  to: Date
}, { _id:false });

const CitizenSchema = new mongoose.Schema({
  fullName: { type:String, required:true },
  nationalId: { type:String, unique:true, sparse:true },
  currentAddress: AddressSchema,
  pastAddresses: [AddressSchema],
  isDeleted: { type:Boolean, default:false },
  deletedAt: Date,
  createdAt: { type:Date, default:Date.now }
});

CitizenSchema.index({"currentAddress.location":"2dsphere"});

export default mongoose.model("Citizen", CitizenSchema);
