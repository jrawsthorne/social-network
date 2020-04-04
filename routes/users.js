const express = require("express");
const router = express.Router();

router.get("/me", async (req, res) => {
  const user = req.user;
  if (!user) {
    res.status(400).json(null);
  } else {
    res.status(200).json({ username: user.username })
  }
})

module.exports = router;
