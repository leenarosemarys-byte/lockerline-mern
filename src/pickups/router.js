'use strict';

const express = require('express');
const { z } = require('zod');
const { parse } = require('../validate');

const pickupBody = z.object({
  code: z.string().min(1),
});

function makePickupRouter(service) {
  const router = express.Router();

  router.post('/pickups', async (req, res) => {
    res.json(await service.pickup(parse(pickupBody, req.body).code));
  });

  return router;
}

module.exports = { makePickupRouter };