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

module.exports = { DomainError, ValidationError, NoSuchTower, NoSuchDoor };