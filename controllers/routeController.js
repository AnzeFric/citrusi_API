/*
 * routeController.js
 */

// List all routes
exports.list = async (req, res, supabase) => {
    try {
        const { data: route, error } = await supabase
            .from('ROUTE')
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
    const { name, elevation, start_point, end_point, average_time } = req.body;
    try {
        // Create a new route
        const { data, error: createError } = await supabase
            .from('ROUTE')
            .insert({
                name: name,
                elevation: elevation,
                start_point: start_point,
                end_point: end_point,
                average_time: average_time,
            });

        if (createError) {
            return res.status(500).json({ error: createError.message });
        }

        res.json({ "res": true });
    } catch (error) {
        throw error;
    }
};