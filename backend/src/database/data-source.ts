import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { loadEnvironment } from '../config/environment';
import { createDatabaseOptions } from './database.options';

export default new DataSource(createDatabaseOptions(loadEnvironment()));
