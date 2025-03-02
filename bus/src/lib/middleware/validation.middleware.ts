import { Injectable } from '@angular/core';
import Ajv, { ValidateFunction } from 'ajv';

@Injectable({
  providedIn: 'root',
})
export class ValidationMiddleware {
  private ajv: Ajv;
  private schemas: Map<string, ValidateFunction>;

  constructor() {
    this.ajv = new Ajv();
    this.schemas = new Map<string, ValidateFunction>();
  }

  addSchema(eventType: string, schema: object): void {
    const validate = this.ajv.compile(schema);
    this.schemas.set(eventType, validate);
  }

  validate(eventType: string, payload: any): boolean {
    const validate = this.schemas.get(eventType);
    if (!validate) {
      console.warn(`[ValidationMiddleware] No schema registered for event type: ${eventType}`);
      return true;
    }

    const isValid = validate(payload);
    if (!isValid) {
      console.error(`[ValidationMiddleware] Validation failed for event: ${eventType.toString()}`, validate.errors);
    }
    return isValid;
  }
}
