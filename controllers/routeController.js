/*
 * routeController.js
 */
const proj4 = require('proj4');


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

        if (data && data.length === 0) {
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

        if (routes && routes.length === 0) {
            const err = new Error("Routes not found.");
            err.status = 404;
            throw err;
        }

        res.json({ routes });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};
const fromProjection = 'EPSG:3857';
const toProjection = 'EPSG:4326';

exports.inProximity = async (req, res, supabase) => {
    const { latitude, longitude, radius, details } = req.query;

    if (!latitude || !longitude || !radius) {
        return res.status(400).json({ error: "Latitude, longitude, and radius are required parameters." });
    }

    try {
        const selectQuery = details === 'true' ? '*' : 'id_route, name, startPoint, finishPoint, distance, duration, dificulty, trailType';
        const { data: routes, error } = await supabase
            .from('ROUTES')
            .select(selectQuery);

        if (error) {
            throw new Error(error.message);
        }

        const filteredRoutes = routes.map(route => {
            const routeCoords = parsePointGeometry(route.startPoint.geometry);
            let convertedCoords = convertCoordinates(routeCoords, fromProjection, toProjection);

            const distance = calculateDistance(latitude, longitude, convertedCoords.lat, convertedCoords.lon);

            // Add the calculated distance to the route object if within radius
            if (distance <= parseFloat(radius)) {
                return { ...route, distanceFromCurrentLocation: distance };
            } else {
                return null;
            }
        }).filter(route => route !== null);

        if (filteredRoutes.length === 0) {
            return res.status(404).json({ message: "No routes found within the specified radius." });
        }

        res.json({ routes: filteredRoutes });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

const convertCoordinates = (coords, fromProjection, toProjection) => {
    if (!coords) {
        return null;
    }
    const converted = proj4(fromProjection, toProjection, [coords.lon, coords.lat]);
    return { lon: converted[0], lat: converted[1] };
};


const parsePointGeometry = (pointString) => {
    const coords = pointString.match(/POINT \(([^ ]+) ([^ ]+)\)/).slice(1, 3);
    return {
        lon: parseFloat(coords[0]),
        lat: parseFloat(coords[1])
    };
};


function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // zemljin radius
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 1000);
}

exports.getSingle = async (req, res, supabase) => {
    const id = req.query.id;


    try {
        const { data, error } = await supabase
            .from('ROUTES')
            .select('*')
            .eq('id_route', id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        if (!data) {
            const err = new Error("Route not found.");
            err.status = 404;
            throw err;
        }

        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};