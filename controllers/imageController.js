/*
 * imageController.js
 */

// Get all images
exports.list = async (req, res, supabase) => {
  try {
    // Fetch images from Supabase
    const { data, error } = await supabase
      .from('IMAGES')
      .select('*');

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    throw error;
  }
}

// Create a new image
exports.create = async (req, res, supabase) => {
  try {
    const { data, error } = await supabase
      .from('IMAGES')
      .insert({
        name: req.body.name,
        author: req.body.author,
        src: req.body.src,
        alt: req.body.alt,
        TK_route: req.body.id_route
      });

    if (error) {
      console.error('Supabase insertion error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ data });
  } catch (error) {
    throw error;
  }
}

// Delete an image
exports.delete = async (req, res, supabase) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('IMAGE')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    throw error;
  }
};

// Update an image
exports.update = async (req, res, supabase) => {
  try {
    const { id } = req.params;
    const { name, author, src, alt, TK_route } = req.body;
    const { data, error } = await supabase
      .from('IMAGES')
      .update({ name, author, src, alt, TK_route })
      .eq('id', id);

    if (error) {
      throw error;
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({ message: 'Image updated successfully' });
  } catch (error) {
    throw error;
  }
};