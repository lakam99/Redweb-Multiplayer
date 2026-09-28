function isVector(value) {
  return value && typeof value === 'object' &&
    Number.isFinite(value.x) && Number.isFinite(value.y) &&
    Math.abs(value.x) <= 100_000 && Math.abs(value.y) <= 100_000;
}

function validMotion(message) {
  return (message.position === undefined || isVector(message.position)) &&
    (message.vector === undefined || isVector(message.vector)) &&
    (message.angle === undefined || (Number.isFinite(message.angle) && Math.abs(message.angle) <= 100_000));
}

module.exports = { isVector, validMotion };
