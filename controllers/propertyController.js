import Property from '../models/Property';

export const createProperty = async (req, res) => {
  const { title, description, location, bedrooms, bathrooms, rent, seller } = req.body;
  try {
    const property = new Property({
      title,
      description,
      location,
      bedrooms,
      bathrooms,
      rent,
      seller,
    });
    await property.save();
    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate('seller');
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
