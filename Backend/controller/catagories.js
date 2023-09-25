const Catagory = require("../model/catagories");

const createCatagories = async (req, res) => {
  try{
  const catagory = await Catagory.create({
    title: req.body.title,
    images: `http://localhost:5000/api/v1/${req.file.filename}`,
  });
  res.status(200).json({ catagory });

}catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const findCatagories = async (req, res) => {
  try {
    const catagories = await Catagory.find({});
  res.status(200).json({ catagories });
  }catch (error) {
    console.error('Error finding categories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { createCatagories, findCatagories };
