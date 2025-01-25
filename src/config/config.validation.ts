import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .required()
    .valid('prod', 'dev', 'uat', 'stage')
    .default('dev'),

  API_PORT: Joi.number().default(8080),

  SYSTEM_LANGUAGE: Joi.string().required().trim(),

  DB_HOST: Joi.string().required().trim(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required().trim(),
  DB_PASSWORD: Joi.string().required().trim(),
  DB_NAME: Joi.string().required().trim(),

  WEBZ_IO_API_KEY: Joi.string().required().trim(),
  WEBZ_NEWS_URL: Joi.string().required().trim(),
});
