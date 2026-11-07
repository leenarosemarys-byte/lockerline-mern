'use strict';

const express = require('express');

function makeParcelRouter(service) {
  const router = express.Router();

  router.get('/parcels/:parcelId', async (req, res) => {
    res.json(await service.parcel(req.params.parcelId));
  });

  return router;
}

module.exports = { makeParcelRouter };