'use strict';

const express = require('express');
const { z } = require('zod');
const { parse } = require('../validate');

const dropSchema = z.object({
  sizeClass: z.enum(['S', 'M', 'L']),
  flat: z.string().min(1),
});

function makeDropRouter(service) {
  const router = express.Router();

  router.post('/drops', async (req, res) => {
    const body = parse(dropSchema, req.body);
    const result = await service.drop(body);

    res.location(`/parcels/${result.parcelId}`).status(201).json(result);
  });

  return router;
}

module.exports = { makeDropRouter };