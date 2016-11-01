import {Constructable} from './injector';

export const INJECTABLE_META_KEY = 'ts-inject:injectable';

export function Injectable(): Function {
  return (target: Constructable<any>) => {
    Reflect.defineMetadata(INJECTABLE_META_KEY, true, target);
  };
}