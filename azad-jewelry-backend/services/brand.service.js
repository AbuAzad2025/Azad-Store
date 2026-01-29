const ApiError = require('../errors/api-error');
const Brand = require('../model/Brand');
const mongoose = require("mongoose");
const brandsData = require("../utils/brands.json");

const isDbReady = () => mongoose.connection.readyState === 1;

// addBrandService
module.exports.addBrandService = async (data) => {
  const brand = await Brand.create(data);
  return brand
}

// create all Brands service
exports.addAllBrandService = async (data) => {
  await Brand.deleteMany()
  const brands = await Brand.insertMany(data);
  return brands;
}


// get all Brands service
exports.getBrandsService = async () => {
  if (!isDbReady()) {
    return brandsData.filter((b) => b.status === "active");
  }
  try {
    const brands = await Brand.find({ status: "active" })
      .select("name email logo website location products status")
      .lean()
      .maxTimeMS(3000);
    return brands;
  } catch (error) {
    return brandsData.filter((b) => b.status === "active");
  }
}

// get all Brands service
exports.deleteBrandsService = async (id) => {
  if (!isDbReady()) {
    return null;
  }
  const brands = await Brand.findByIdAndDelete(id);
  return brands;
}

// update category
exports.updateBrandService = async (id,payload) => {
  if (!isDbReady()) {
    throw new ApiError(503, 'Database not connected')
  }
  const isExist = await Brand.findOne({ _id:id })

  if (!isExist) {
    throw new ApiError(404, 'Brand not found !')
  }

  const result = await Brand.findOneAndUpdate({ _id:id }, payload, {
    new: true,
  })
  return result
}

// get single category
exports.getSingleBrandService = async (id) => {
  if (!isDbReady()) {
    return brandsData.find((b) => String(b._id) === String(id)) || null;
  }
  const result = await Brand.findById(id);
  return result;
}
