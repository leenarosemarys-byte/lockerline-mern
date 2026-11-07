'use strict';
const express = require('express');

function makeParcelRouter(service) {
  const router = express.Router();

  router.get('/parcels/:parcelId', async (req, res, next) => {
    try {
      res.json(await service.parcel(req.params.parcelId));
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { makeParcelRouter };
