/*
 * routeController.js
 */

// List all routes
exports.list = async (req, res, supabase) => {
    try {
        const { data: route, error } = await supabase
            .from('ROUTES')
            .select('*');

        if (error) {
            const err = new Error("Error when getting routes.");
            err.status = 500;
            err.message = error.message;
            throw err;
        }

        if (data.length === 0) {
            const err = new Error("Routes not found.");
            err.status = 404;
            throw err;
        }

        res.json({ route });
    } catch (error) {
        throw error;
    }
};

// Create new route
exports.create = async (req, res, supabase) => {
    const { name, abstractDescription, distance, duration, durationReverse, 
        cumulativeElevationGain, cumulativeElevationLoss, coverImage, hasSafetyGear, 
        hutClosed, dificulty, trailType, startPoint, finishPoint, owner, pois } = req.body;
    try {
        // Create a new route
        const { data, error: createError } = await supabase
            .from('ROUTES')
            .insert({
                name: name,
                id: null,
                abstractDescription: abstractDescription,
                distance: distance,
                duration: duration,
                durationReverse: durationReverse,
                cumulativeElevationGain: cumulativeElevationGain,
                cumulativeElevationLoss: cumulativeElevationLoss,
                coverImage: coverImage,
                hasSafetyGear: hasSafetyGear,
                hutClosed: hutClosed,
                dificulty: dificulty,
                trailType: trailType,
                startPoint: startPoint,
                finishPoint: finishPoint,
                owner: owner,
                pois: pois
            });

        if (createError) {
            return res.status(500).json({ error: createError.message });
        }

        res.json({ "res": true });
    } catch (error) {
        throw error;
    }
};