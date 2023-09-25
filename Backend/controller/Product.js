const Product = require("../model/Product");
const Channels = require("pusher");
const stripe = require("stripe")(
  "sk_test_51MrYHJEg2I5qxKjJ4EYXuaKNXoJiPBXutcgXzRuKkGVgITnDeDBTQU3f5VtaMnMo138GBPGjfc33aGFCXfenx2Kg0065g0Sp9S"
);

const channels = new Channels({
  appId: "1663602",
  key: "1904b460da23661d8163",
  secret: "9f1b5ab983407f080226",
  cluster: "ap2",
  useTLS: true,
});

const createProduct = async (req, res) => {
  const { price, title } = req.body;
  const price_for_stripe = price * 100;
  const stripproduct = await stripe.products.create({
    name: title,
    default_price_data: {
      unit_amount: price_for_stripe,
      currency: "usd",
    },
  });

  const sellerid = req.body.sellerid;
  console.log(sellerid)


  // !mongoose.Types.ObjectId.isValid(sellerid
  if (!sellerid) {
    res.status(400).json({ error: "Invalid sellerid" });
    return;
  
  }
  

  const { id } = req.user;
  const images_arr = req.files.map((file) => {
    return `http://localhost:5000/api/v1/${file.filename}`;
  });

  try {
    const product = await Product.create({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      hashtags: req.body.hashtags,
      catagory: req.body.catagory,
      condition: req.body.condition,
      priceid: stripproduct.default_price,
      isOnline: req.body.isOnline,
      images: images_arr,
      sellerid: req.body.sellerid,
    });

    await channels.trigger("hacktech", "create-product", product);

    // Redirect the user to the newly created item's page
    res.redirect(`/item/${product._id}`); // Assuming you have a route for viewing items
    const { id } = req.user;
    await User.findByIdAndUpdate(id, { $inc: { listings: 1 } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while creating the product" });
  }
};

const editProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndUpdate({ _id: id }, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while editing the product" });
  }
};

const findAllProducts = async (req, res) => {
  try {
    const allProducts = await Product.aggregate([
      {
        $group: {
          _id: "$catagory",
          products: { $push: "$$ROOT" },
        },
      },
    ]);
    res.status(200).json({ allProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while retrieving products" });
  }
};

const findUserProducts = async (req, res) => {
  const { id } = req.params;
  try {
    const products = await Product.find({ sellerid: id });
    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while retrieving user products" });
  }
};

const findSingleProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findOne({ _id: id });
    res.status(200).json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while retrieving the product" });
  }
};

module.exports = {
  createProduct,
  findAllProducts,
  findUserProducts,
  findSingleProduct,
  editProduct,
};
