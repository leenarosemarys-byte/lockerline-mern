'use strict';
const express = require('express');
const { z } = require('zod');
const { ValidationError } = require('../errors');

const wallQuery = z.object({
  size: z.enum(['S', 'M', 'L']).optional(),
  state: z.enum(['free', 'holding']).optional(),
});

/** Checks a request part against a zod schema; a mismatch is a 400 naming each bad field. */
function parse(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ValidationError(result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })));
  }
  return result.data;
}

function makeDoorRouter(service) {
  const router = express.Router();

  router.get('/towers/:tower/doors', async (req, res) => {
    res.json(await service.wall(req.params.tower, parse(wallQuery, req.query)));
  });

  router.get('/towers/:tower/doors/:no', async (req, res) => {
    res.json(await service.door(req.params.tower, req.params.no));
  });

  return router;
}

module.exports = { makeDoorRouter };
