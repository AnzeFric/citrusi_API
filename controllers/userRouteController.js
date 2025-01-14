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

const deviceBuffers = new Map();
const deviceFirstMeasurementTime = new Map();
const TIME_WINDOW_MS = 3 * 60 * 1000;

// pridobi podatke iz naprave, shranjuje 3 minute nato obdela in shrani v bazo
exports.sendGyroDataToApi = async (req, res, supabase) => {
  const { deviceId, measurements } = req.body;
  console.log(req.body);

  if (!Array.isArray(measurements)) {
    return res.status(400).json({
      error: "Napacen format podatkov",
      details: "Meritve morajo bti v obliki polja",
    });
  }

  // let measurement = Number(gyro);
  const validMeasurements = measurements
    .map((m) => Number(m))
    .filter((m) => !isNaN(m));

  const currentTime = Date.now();
  console.log("novi podatki: ", validMeasurements);

  //nova naprava posilja, pripravim nov buffer
  if (!deviceBuffers.has(deviceId)) {
    deviceBuffers.set(deviceId, []);
    deviceFirstMeasurementTime.set(deviceId, currentTime);
    deviceBuffers.get(deviceId).push(...validMeasurements);

    return res.status(200).json({
      message: "Prvi podatek dodan v buffer",
    });
  }

  //preverim kdaj je bila poslana prva meritev
  const firstTime = deviceFirstMeasurementTime.get(deviceId);

  //preverim ali je vec kot 3 minute od prve meritve
  if (currentTime - firstTime >= TIME_WINDOW_MS) {
    try {
      const buffer = deviceBuffers.get(deviceId);
      //proesiram in shranim podatke

      if (!buffer || !Array.isArray(buffer)) {
        throw new Error(`Napacen buffer za napravo ${deviceId}`);
      }

      if (buffer.length > 1) {
        throw new Error(`Prazen buffer za napravo ${deviceId}`);
      }

      await processAndSaveData(deviceId, buffer, firstTime, supabase);

      //izbrisem buffer
      deviceBuffers.delete(deviceId);
      deviceFirstMeasurementTime.delete(deviceId);

      return res.status(200).json({
        message: "Podatki so bili obdelani in shranjeni",
        processedCount: deviceBuffers.get(deviceId).length,
      });
    } catch (error) {
      console.error(
        `Napaka pri procesiranju bufferja za napravo ${deviceId}:`,
        error
      );

      deviceBuffers.delete(deviceId);
      deviceFirstMeasurementTime.delete(deviceId);

      return res.status(500).json({
        error: "Failed to process data",
        details: error.message,
      });
    }
  }

  //ce je manj kot 3 minute samo dodam v buffer
  deviceBuffers.get(deviceId).push(...validMeasurements);

  return res.status(200).json({
    message: "Podatki dodani v buffer",
    bufferedCount: deviceBuffers.get(deviceId).length,
  });
};

// Help function to process and save the data
async function processAndSaveData(data, userRouteId, supabase) {
  // Helper functions
  const processNumbers = (numbers) => {
    const { positive, negative } = numbers.reduce(
      (acc, num) => {
        if (num >= 0) {
          acc.positive.push(num);
        } else {
          acc.negative.push(Math.abs(num));
        }
        return acc;
      },
      { positive: [], negative: [] }
    );

    return {
      positive: limitNumsTo255(roundNumsInArr(positive)),
      negative: limitNumsTo255(roundNumsInArr(negative)),
    };
  };

  const fetchExistingGyroData = async (userRouteId) => {
    const { data, error } = await supabase
      .from("USER_ROUTE")
      .select("gyro_data")
      .eq("id_user_route", userRouteId)
      .single();

    if (error) {
      throw new Error(`Error fetching data: ${error.message}`);
    }

    return data?.gyro_data;
  };

  const updateGyroData = async (userRouteId, gyroData) => {
    const { error } = await supabase
      .from("USER_ROUTE")
      .update({ gyro_data: gyroData })
      .eq("id_user_route", userRouteId);

    if (error) {
      throw new Error(`Error updating data: ${error.message}`);
    }
  };

  try {
    // Process new data
    const { positive, negative } = processNumbers(data);

    // Prepare final data for storage
    let finalPositive = positive;
    let finalNegative = negative;

    // If we have existing data, merge it with new data
    const existingData = await fetchExistingGyroData(userRouteId);
    if (existingData?.compressedPositive) {
      finalPositive = [
        ...Decompress.decompress(existingData.compressedPositive),
        ...positive,
      ];
      finalNegative = [
        ...Decompress.decompress(existingData.compressedNegative),
        ...negative,
      ];
    }

    // Prepare and save final compressed data
    const gyroData = {
      compressedPositive: String(Compress.compress(finalPositive)),
      compressedNegative: String(Compress.compress(finalNegative)),
    };

    await updateGyroData(userRouteId, gyroData);
  } catch (error) {
    console.error("Failed to process and save data:", error);
    throw error; // Re-throw to allow caller to handle the error
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

    if (!data.gyro_data) {
      return res.status(200).json({
        message: "Data was not yet added, empty",
        data: { positiveArr: [], negativeArr: [] },
      });
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

// Get compressed data from database, decompress, go through data and return step count
exports.getStepCount = async (req, res, supabase) => {
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

    if (!data.gyro_data) {
      return res.status(200).json({
        message: "Data was not yet added, empty",
        data: { positiveArr: [], negativeArr: [] },
      });
    }

    // Decompress data from supabase
    var decompressedPositive = Decompress.decompress(
      data.gyro_data.compressedPositive
    );
    var decompressedNegative = Decompress.decompress(
      data.gyro_data.compressedNegative
    );

    let count = 0;
    decompressedPositive.forEach((num) => {
      if (num > 20) {
        count++;
      }
    });
    decompressedNegative.forEach((num) => {
      if (num > 20) {
        count++;
      }
    });

    // Return step count with message
    return res.status(200).json({
      message: "Steps counted successfully",
      stepCount: count,
    });
  } catch (error) {
    throw error;
  }
};
