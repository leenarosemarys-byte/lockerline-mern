'use strict';

/** A refusal the app gives. Services throw these; the error middleware turns them into problem+json. */
class DomainError extends Error {
  constructor(status, type, title, detail) {
    super(detail);
    this.status = status;
    this.type = type;
    this.title = title;
  }

  /** Extra fields for this refusal's answer (none by default). */
  extras() {
    return {};
  }
}

class ValidationError extends DomainError {
  /** @param errors [{ field, message }] */
  constructor(errors) {
    super(400, '/errors/validation', 'Invalid request', 'The request is not valid');
    this.errors = errors;
  }

  extras() {
    return { errors: this.errors };
  }
}

class NoSuchTower extends DomainError {
  constructor(tower) {
    super(404, '/errors/no-such-tower', 'No such tower', `There is no tower ${tower}`);
  }
}

class NoSuchDoor extends DomainError {
  constructor(tower, no) {
    super(404, '/errors/no-such-door', 'No such door', `Tower ${tower} has no door ${no}`);
  }
}

class NoSuchFlat extends DomainError {
  constructor(flat) {
    super(400, '/errors/no-such-flat', 'No such flat', `There is no flat ${flat} in this tower`);
  }
}

class NoDoorFree extends DomainError {
  constructor(sizeClass, freeSizes) {
    super(409, '/errors/no-door-free', 'No door free', `No ${sizeClass} door is free`);
    this.freeSizes = freeSizes;
  }

  extras() {
    return { freeSizes: this.freeSizes };
  }
}

class NoSuchParcel extends DomainError {
  constructor(parcelId) {
    super(404, '/errors/no-such-parcel', 'No such parcel', `There is no parcel ${parcelId}`);
  }
}

/** No-such-code and code-expired share 404, so a guesser cannot tell them apart; only the type differs. */
class NoSuchCode extends DomainError {
  constructor() {
    super(404, '/errors/no-such-code', 'No such code', 'There is no parcel waiting for this code');
  }
}

class CodeExpired extends DomainError {
  constructor() {
    super(404, '/errors/code-expired', 'Code expired', 'The free window of this code has passed');
  }
}

class CodeUsed extends DomainError {
  constructor() {
    super(
      409,
      '/errors/code-used',
      'Code used',
      'This code has already opened its door'
    );
  }
}

module.exports = {
  DomainError,
  ValidationError,
  NoSuchTower,
  NoSuchDoor,
  NoSuchFlat,
  NoDoorFree,
  NoSuchParcel,
  NoSuchCode,
  CodeExpired,
  CodeUsed,
};