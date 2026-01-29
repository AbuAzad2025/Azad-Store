const mongoose = require('mongoose');
const { secret } = require('./secret');

mongoose.set('strictQuery', false);

const DEFAULT_DB_NAME = 'azad';
const DB_URL = `mongodb://0.0.0.0:27017/${DEFAULT_DB_NAME}`;

const ensureDbNameInMongoUri = (uri, dbName) => {
  const raw = typeof uri === 'string' ? uri.trim() : '';
  if (!raw) return uri;

  const schemeSepIndex = raw.indexOf('://');
  if (schemeSepIndex === -1) return raw;

  const afterSchemeIndex = schemeSepIndex + 3;
  const firstSlashIndex = raw.indexOf('/', afterSchemeIndex);

  if (firstSlashIndex === -1) return `${raw}/${dbName}`;

  const pathStartIndex = firstSlashIndex + 1;
  if (pathStartIndex >= raw.length) return `${raw}${dbName}`;

  const nextChar = raw[pathStartIndex];
  if (nextChar === '?') {
    return `${raw.slice(0, pathStartIndex)}${dbName}${raw.slice(pathStartIndex)}`;
  }

  return raw;
};

const resolveMongoUri = () => {
  const raw = secret.db_url || DB_URL;
  if (!secret.db_url) return raw;
  return ensureDbNameInMongoUri(raw, DEFAULT_DB_NAME);
};

const connectDB = async () => {
  try { 
    await mongoose.connect(resolveMongoUri());
    console.log('mongodb connection success!');
  } catch (err) {
    console.log('mongodb connection failed!', err.message);
    throw err;
  }
};

module.exports = connectDB;
