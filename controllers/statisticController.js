/*
 * statisticController.js
 */

// Display all statistics
exports.display = async (req, res, supabase) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('STATISTIC')
            .select('*')
            .eq('TK_user', id)
            .single();

        if (error) {
            return res.status(500).json({ error: 'Error when getting statistics' });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: 'Statistics not found' });
        }

        res.json({ data });
    } catch (error) {
        throw error;
    }
};