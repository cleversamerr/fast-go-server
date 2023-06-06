const { User } = require("../../../models/user/user");
const { Car } = require("../../../models/user/car");
const httpStatus = require("http-status");
const errors = require("../../../config/errors");

module.exports.getUnverifiedCars = async (page, limit) => {
  try {
    page = parseInt(page);
    limit = parseInt(limit);

    // TODO: write the query to get all unverified cars with their drivers
    const unverifiedCars = await Car.aggregate([
      { $match: { verified: false } },
      { $sort: { _id: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    if (!unverifiedCars || !unverifiedCars.length) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.car.noUnverifiedCars;
      throw new ApiError(statusCode, message);
    }

    return unverifiedCars;
  } catch (err) {
    throw err;
  }
};

module.exports.verifyCar = async (carId) => {
  try {
    const car = await Car.findById(carId);
    if (!car) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.car.notFound;
      throw new ApiError(statusCode, message);
    }

    const driver = await User.findById(car.driver);
    if (!driver) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.driverNotFound;
      throw new ApiError(statusCode, message);
    }

    // Veriy car
    car.verify();
    await car.save();

    // Verify driver
    driver.verifyDriver();
    await driver.save();

    return { car, driver };
  } catch (err) {
    throw err;
  }
};
