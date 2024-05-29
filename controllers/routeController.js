/*
 * routeController.js
 */

// List all routes
exports.list = async (req, res, supabase) => {
    try {
        const { data, error } = await supabase
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

        res.json({ data });
    } catch (error) {
        throw error;
    }
};

// Create new route
exports.create = async (req, res, supabase) => {
    const { name, abstractDescription, distance, duration, durationReverse,
        cumulativeElevationGain, cumulativeElevationLoss, coverImage, hasSafetyGear,
        hutClosed, dificulty, trailType, startPoint, finishPoint, owner, pois, territory, coordinates } = req.body;
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
                pois: pois,
                coordinates: coordinates,
                territory: territory,
            });

        if (createError) {
            return res.status(500).json({ error: createError.message });
        }

        res.json({ "res": true });
    } catch (error) {
        throw error;
    }
};

//list paginated
exports.listPaged = async (req, res, supabase, limit, offset) => {
    try {
        const { data: routes, error } = await supabase
            .from('ROUTES')
            .select('*')
            .range(offset, offset + limit - 1);

        if (error) {
            const err = new Error("Error when getting routes.");
            err.status = 500;
            err.message = error.message;
            throw err;
        }

        if (routes.length === 0) {
            const err = new Error("Routes not found.");
            err.status = 404;
            throw err;
        }

        res.json({ routes });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};