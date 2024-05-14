/*
 * userRouteController.js
 */

// Display all user routes
exports.list = async (req, res, supabase) => {
    try {
        const { data, error } = await supabase
            .from('USER_ROUTE')
            .select('*')
            .eq('TK_user', req.session.userId);

        if (error) {
            return res.status(500).json({ error: 'Error when getting routes' });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: 'Routes not found' });
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
            .from('USER_ROUTE')
            .delete()
            .eq('id_user_route', id)
            .eq('TK_user', req.session.userId);

        if (error) {
            return res.status(500).json({ error: 'Error when deleting route' });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: 'Route not found' });
        }

        res.json({ message: 'Route deleted successfully' });
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
            .from('USER_ROUTE')
            .update({ date, duration, steps, TK_route })
            .eq('id_user_route', id)
            .eq('TK_user', req.session.userId);

        if (error) {
            return res.status(500).json({ error: 'Error when updating route' });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: 'Route not found' });
        }

        res.json({ message: 'Route updated successfully' });
    } catch (error) {
        throw error;
    }
};

// Create a user route
exports.create = async (req, res, supabase) => {
    try {
        const { date, duration, steps, TK_route } = req.body;
        const { data, error } = await supabase
            .from('USER_ROUTE')
            .insert([{ date, duration, steps, TK_route, TK_user: req.session.userId }]);

        if (error) {
            return res.status(500).json({ error: 'Error when creating route' });
        }

        res.status(201).json({ message: 'Route created successfully', data: data[0] });
    } catch (error) {
        throw error;
    }
};