'use strict';

const express = require('express');
const { z } = require('zod');
const { parse } = require('../validate');

const wallQuery = z.object({
  size: z.enum(['S', 'M', 'L']).optional(),
  state: z.enum(['free', 'holding']).optional(),
});

function makeDoorRouter(service) {
  const router = express.Router();

  router.get('/towers/:tower/doors', async (req, res) => {
    res.json(
      await service.wall(
        req.params.tower,
        parse(wallQuery, req.query)
      )
    );
  });

  router.get('/towers/:tower/doors/:no', async (req, res) => {
    res.json(await service.door(req.params.tower, req.params.no));
  });

  return router;
}

module.exports = { makeDoorRouter };