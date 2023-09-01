/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-this-alias */
export abstract class DTO {
  public constructor(object?: unknown) {
    if (object) {
      this.assign(object as Record<string, unknown>);
    }
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);
  }

  private isVal(v: unknown): boolean {
    // eslint-disable-next-line no-null/no-null
    return v !== undefined && v !== null;
  }

  private getVal(obj: Record<string, unknown>, name: string): unknown {
    let v: unknown = obj[name];
    if (this.isVal(v)) {
      return v;
    } else {
      v = obj[this.camelToSnake(name)];
      v = v !== undefined ? v : obj[this.camelToSnake(name).toUpperCase()];

      if (this.isVal(v)) {
        return v;
      }
    }

    return undefined;
  }

  public assign(obj: Record<string, unknown>): DTO {
    let current: DTO = this;
    do {
      Object.getOwnPropertyNames(Object.getPrototypeOf(current)).forEach((name: string) => {
        if (name !== 'constructor' && typeof (current as unknown as Record<string, unknown>)[name] !== 'function') {
          try {
            (this as Record<string, unknown>)[name] = current.getVal(obj, name);
          } catch (e) {
            /* istanbul ignore if */
            if (!(e as Error)?.message.endsWith('only a getter')) {
              throw e;
            }
          }
        }
      });
      current = Object.getPrototypeOf(current);
    } while ((Object.getPrototypeOf(current) as { constructor: { name: string } }).constructor.name !== 'DTO');
    return this;
  }

  public toJSON(): unknown {
    const serialized: unknown = {};

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let current: DTO = this;
    do {
      Object.getOwnPropertyNames(current).forEach((name: string) => {
        if (typeof Object.getOwnPropertyDescriptor(current, name).get === 'function') {
          /* istanbul ignore else */
          if (!name.startsWith('__') && (this as unknown as Record<string, unknown>)[name] !== undefined) {
            (serialized as Record<string, unknown>)[name] = (this as unknown as Record<string, unknown>)[name];
          }
        }
      });
      current = Object.getPrototypeOf(current);
    } while (current);

    return serialized;
  }

  public equals(obj: unknown): boolean {
    {
      let current: DTO = this;
      let result: boolean = true;
      do {
        Object.getOwnPropertyNames(Object.getPrototypeOf(current)).forEach((name: string) => {
          if (name !== 'constructor' && typeof (current as unknown as Record<string, unknown>)[name] !== 'function') {
            if (
              ([Array, Object].includes((this as Record<string, unknown>)[name]?.constructor as ObjectConstructor | ArrayConstructor) &&
                JSON.stringify((this as Record<string, unknown>)[name]) === JSON.stringify((obj as Record<string, unknown>)[name])) ||
              (this as Record<string, unknown>)[name] === (obj as Record<string, unknown>)[name]
            ) {
            } else {
              result = false;
              return;
            }
          }
        });
        current = Object.getPrototypeOf(current);
      } while (result && (Object.getPrototypeOf(current) as { constructor: { name: string } }).constructor.name !== 'DTO');
      return result;
    }
  }
}
