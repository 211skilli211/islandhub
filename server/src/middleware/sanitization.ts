import mongoSanitize from 'express-mongo-sanitize';
// import xss from 'xss-clean';
import { Express } from 'express';

export const configureSanitization = (app: Express) => {
  app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`[SANITIZATION] Detected and sanitized potentially malicious key: ${key}`);
    }
  }));

  // app.use(xss());
};
