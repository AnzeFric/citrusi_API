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
  const { deviceId, gyro } = req.body;
  console.log(req.body);
  let measurement = gyro;

  const currentTime = Date.now();
  console.log("novi podatki: ", gyro);

  //nova naprava posilja, pripravim nov buffer
  if (!deviceBuffers.has(deviceId)) {
    deviceBuffers.set(deviceId, []);
    deviceFirstMeasurementTime.set(deviceId, currentTime);
    deviceBuffers.get(deviceId).push(measurement);

    return res.status(200).json({
      message: "Prvi podatek dodan v buffer",
    });
  }

  //preverim kdaj je bila poslana prva meritev
  const firstTime = deviceFirstMeasurementTime.get(deviceId);

  //preverim ali je vec kot 3 minute od prve meritve
  if (currentTime - firstTime >= TIME_WINDOW_MS) {
    try {

      //proesiram in shranim podatke
      await processAndSaveData(deviceId, deviceBuffers.get(deviceId), firstTime, supabase);

      //izbrisem buffer
      deviceBuffers.delete(deviceId);

      return res.status(200).json({
        message: "Podatki so bili obdelani in shranjeni",
        processedCount: deviceBuffers.get(deviceId).length
      });

    } catch (error) {
      console.error(`Napaka pri procesiranju bufferja za napravo ${deviceId}:`, error);
      return res.status(500).json({
        error: "Failed to process data",
        details: error.message
      });
    }
  }

  //ce je manj kot 3 minute samo dodam v buffer
  deviceBuffers.get(deviceId).push(measurement);

  return res.status(200).json({
    message: "Podatki dodani v buffer",
    bufferedCount: deviceBuffers.get(deviceId).length
  });
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
