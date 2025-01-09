/*
 * userRouteController.js
 */
const Compress = require("./Compression");
const Decompress = require("./Decompression");

// Display all user routes
exports.list = async (req, res, supabase) => {
  try {
    const { data, error } = await supabase
      .from("USER_ROUTE")
      .select("*")
      .eq("TK_user", req.session.userId);

    if (error) {
      return res.status(500).json({ error: "Error when getting routes" });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: "Routes not found" });
    }

    res.json({ data });
  } catch (error) {
    throw error;
  }
};

// Delete a user route
exports.delete = async (req, res, supabase) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("USER_ROUTE")
      .delete()
      .eq("id_user_route", id)
      .eq("TK_user", req.session.userId);

    if (error) {
      return res.status(500).json({ error: "Error when deleting route" });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: "Route not found" });
    }

    res.json({ message: "Route deleted successfully" });
  } catch (error) {
    throw error;
  }
};

// Update a user route
exports.update = async (req, res, supabase) => {
  try {
    const { id } = req.params;
    const { date, duration, steps, TK_route } = req.body;
    const { data, error } = await supabase
      .from("USER_ROUTE")
      .update({ date, duration, steps, TK_route })
      .eq("id_user_route", id)
      .eq("TK_user", req.session.userId);

    if (error) {
      return res.status(500).json({ error: "Error when updating route" });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: "Route not found" });
    }

    res.json({ message: "Route updated successfully" });
  } catch (error) {
    throw error;
  }
};

// Create a user route
exports.create = async (req, res, supabase) => {
  try {
    const { date, duration, steps, TK_route } = req.body;
    const { data, error } = await supabase
      .from("USER_ROUTE")
      .insert([
        { date, duration, steps, TK_route, TK_user: req.session.userId },
      ]);

    if (error) {
      return res.status(500).json({ error: "Error when creating route" });
    }

    res
      .status(201)
      .json({ message: "Route created successfully", data: data[0] });
  } catch (error) {
    throw error;
  }
};

const gyroTestData = [
  0.367, 0.21, 0.139, 0.21, -0.141, 1.54, 0.087, 0.07, -0.088, -0.298, -0.158,
  -0.176, -0.035, -0.053, -0.28, -0.158, -0.228, 0.105, -0.21, 0.017, -0.088,
  -0.088, 0.297, 0.035, -0.123, 0.035, 0.0, 0.105, 11.2, -9.643, -2.03, 6.772,
  -1.418, -10.693, -7.438, -5.986, 8.155, 22.225, -10.43, -34.756, 9.957, 8.102,
  -6.091, -13.318, 14.525, 20.457, -17.535, -19.705, -26.74, 12.407, 16.695,
  -33.39, -45.098, -51.941, -0.736, -96.111, -70.123, 65.257, -12.041, -179.568,
  66.674, 15.277, -215.985, 54.285, 128.205, 19.897, -41.616, 8.679, 130.83,
  -41.965, 105.945, 137.724, -30.258, -93.031, 41.369, 251.142, 115.535,
  -128.538, 96.162, 271.985, 443.187, 150.709, 53.235, -92.103, 6.999, 80.92,
  61.267, -0.263, -21.963, -27.826, 27.719, 88.725, 61.95, -20.58, -39.428,
  15.469, 37.38, -7.368, -30.416, -18.883, -4.446, 16.572, -9.345, 17.815,
  6.317, -0.176, 72.327, -47.776, -3.431, -34.353, 6.737, -10.291, -33.758,
  -10.395, -25.271, -2.065, 13.089, -7.928, -2.836, 2.782, 19.407, 10.57,
  -14.281, -20.178, -35.753, -12.986, 16.432, 12.74, 20.754, -14.385, -27.861,
  -22.978, 6.579, 8.679, 5.932, 5.582, 0.262, -1.523, -5.723, -1.191, 0.437,
  -0.123, 0.087, -2.661, -0.438, -0.386, 0.157, 0.105, -0.351, 1.627, 2.345,
  -2.975, -2.713, -2.783, -2.713, -1.033, -0.91, 0.595, 0.157, -0.543, -0.91,
  -0.683, 0.559, -0.753, 0.28, 0.734, 1.749, 0.297, 0.332, 0.174, 0.105, -0.053,
  -0.105, -0.246, -0.771, -0.21, 6.632, -1.208, 0.157, -9.888, 6.667, -1.331,
  -1.698, -2.013, 1.05, 4.952, -1.785, 5.092, 3.71, 1.837, -1.155, 10.237,
  -5.583, 1.627, -3.343, 3.849, 2.729, 20.667, -21.718, -8.015, -14.193, -1.016,
  -5.268, 9.344, 0.734, -1.716, 3.78, 1.364, 7.262, 6.755, 1.557, -1.033,
  -1.261, 4.637, 26.565, 19.32, -13.231, -7.7, 3.99, 39.077, 36.505, -18.725,
  -18.568, 5.775, 18.025, 2.677, -6.318, 0.542, -36.855, 63.717, -20.528, 5.005,
  -0.246, 14.875, -146.265, -154.211, 24.167, 44.817, 40.652, 60.165, 1.662,
  -16.398, -28.035, -34.405, 3.499, -1.155, -9.031, -3.028, -0.105, -2.31,
  -0.28, -0.508, -0.053, -0.035, -0.21, -0.088, 0.227, 0.28, 0.07, -0.018,
  -0.42, 0.157, -0.018, -4.778, -0.298, 0.0, 0.122, -0.351, 0.035, -0.105,
  -0.035, -0.053, 0.017, 0.297, 0.419, -0.246, -0.525, 2.082, 0.157, 0.28,
];

function roundNumsInArr(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = Math.round(arr[i]);
  }
}

function limitNumsTo255(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > 255) {
      arr[i] = 255;
    }
  }
}

const dataBuffers = new Map(); // Map to store buffers for different routes
const COLLECTION_TIME = 3 * 60 * 1000; // 3 minutes in milliseconds

// Get and process input data from gyro and send it to database
exports.sendGyroDataToApi = async (req, res, supabase) => {
  const { userRouteId, data } = req.body;

  // Initialize buffer for this route if it doesn't exist
  if (!dataBuffers.has(userRouteId)) {
    dataBuffers.set(userRouteId, {
      buffer: [],
      timer: setTimeout(async () => {
        // Process data after 3 minutes
        const bufferedData = dataBuffers.get(userRouteId).buffer;
        await processAndSaveData(bufferedData, userRouteId, supabase);
        // Clear the buffer
        dataBuffers.delete(userRouteId);
      }, COLLECTION_TIME),
    });
  }

  // Add new data to buffer
  dataBuffers.get(userRouteId).buffer.push(...data);

  // Send immediate response that data was received
  return res.status(200).json({ message: "Data received and buffering" });
};

// Help function to process and save the data
async function processAndSaveData(data, userRouteId, supabase) {
  let positiveArr = [];
  let negativeArr = [];

  data.forEach((num) => {
    if (num >= 0) {
      positiveArr.push(num);
    } else {
      negativeArr.push(num);
    }
  });

  for (let i = 0; i < negativeArr.length; i++) {
    negativeArr[i] = negativeArr[i] * -1;
  }

  roundNumsInArr(positiveArr);
  roundNumsInArr(negativeArr);

  limitNumsTo255(positiveArr);
  limitNumsTo255(negativeArr);

  try {
    // Fetch existing data from supabase
    const { data: existingData, error } = await supabase
      .from("USER_ROUTE")
      .select("gyro_data")
      .eq("id_user_route", userRouteId)
      .single();

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    // Decompress existing data
    const decompressedPositive = existingData
      ? Decompress.decompress(existingData.gyro_data.compressedPositive)
      : [];
    const decompressedNegative = existingData
      ? Decompress.decompress(existingData.gyro_data.compressedNegative)
      : [];

    // Append new data
    decompressedPositive.push(...positiveArr);
    decompressedNegative.push(...negativeArr);

    // Compress
    const compressedPositive = Compress.compress(decompressedPositive);
    const compressedNegative = Compress.compress(decompressedNegative);

    // Update database
    const { error: updateError } = await supabase
      .from("USER_ROUTE")
      .update({
        gyro_data: {
          compressedPositive: String(compressedPositive),
          compressedNegative: String(compressedNegative),
        },
      })
      .eq("id_user_route", userRouteId);

    if (updateError) {
      console.error("Error updating data:", updateError);
    }
  } catch (error) {
    console.error("Processing error:", error);
  }
}

// Get compressed data from database, decompress it and send to user
exports.getGyroDataFromApi = async (req, res, supabase) => {
  const userRouteId = req.params.id;
  try {
    // Fetch data from supabase
    const { data: data, error } = await supabase
      .from("USER_ROUTE")
      .select("gyro_data")
      .eq("id_user_route", userRouteId)
      .single();

    if (error) {
      return res.status(500).json({ error: "Error fetching data" });
    }

    if (!data) {
      return res.status(404).json({ error: "Data not found" });
    }

    // Decompress data from supabase
    var decompressedPositive = Decompress.decompress(
      data.gyro_data.compressedPositive
    );
    var decompressedNegative = Decompress.decompress(
      data.gyro_data.compressedNegative
    );

    // Return arrays with data
    return res.status(200).json({
      message: "Data retrieved successfully",
      data: {
        positiveArr: decompressedPositive,
        negativeArr: decompressedNegative,
      },
    });
  } catch (error) {
    throw error;
  }
};
