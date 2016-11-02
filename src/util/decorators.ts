/**
 * Creates a property decorator factory which writes an unique identifier to the constructors metadata.
 */
export function createPropDecorator(name: string) {

  function PropDecoratorFactory(): PropertyDecorator {

    if (this instanceof PropDecoratorFactory) {
      return this;
    }

    let decoratorInstance = new (<any>PropDecoratorFactory)();

    return function writeMetadata(target: Object, property: string) {

      let data = getPropDecorators(target);

      data[property] = data.hasOwnProperty(property) && data[property] || [];
      data[property].unshift(decoratorInstance);

      Reflect.defineMetadata('propMetadata', data, target.constructor);
    }
  }

  PropDecoratorFactory.prototype.toString = () => `@${name}`;

  return PropDecoratorFactory;
}

/**
 * Returns all property decorators from a target object.
 */
export function getPropDecorators(target: Object): { [key: string]: any[] } {
  return Reflect.getOwnMetadata('propMetadata', target.constructor) || {};
}

/**
 * Checks whether the specified target has a property annotated with the given decorator
 */
export function hasPropDecorator(decorator: () => PropertyDecorator, property: string, target: any) {
  let propMeta = getPropDecorators(target);

  if (!propMeta.hasOwnProperty(property)) {
    return false;
  }

  let decorators = propMeta[property];

  return decorators
    .map(instance => instance.constructor)
    .filter(constructor => constructor === decorator)[0]
}