const router = require("express").Router();
const routesController = require("./v1/routesController");

router.use("/v1", routesController);

module.exports = router;
