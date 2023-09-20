const express = require("express");
const Auth = require("../middleware/Auth");
const upload = require("../middleware/Multer");

const router = express.Router();
const {
  createUser,
  loginUser,
  updateUser,
  getUser,
  resetPassword,
} = require("../controller/user");
router.route("/createuser").post(createUser);
router.route("/loginuser").post(loginUser);
router.route("/uploadpic").patch(Auth, upload.single("images"), updateUser);
router.route("/getuser/:id").get(getUser);
router.route("/resetpassword").post(resetPassword);
module.exports = router;

