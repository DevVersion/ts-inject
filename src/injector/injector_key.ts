import {Constructable} from './injector';

export class InjectorKey {

  constructor(public token: Constructable<any>, public id: number) {}

  get displayName(): string {
    return this.token.name;
  }

  static get(token: Constructable<any>): InjectorKey {
    return _globalKeyRegistry.get(token);
  }

}

export class KeyRegistry {

  private _keys = new Map<Object, InjectorKey>();

  get(token: Constructable<any>): InjectorKey {

    if (token instanceof InjectorKey) {
      return token;
    }

    if (this._keys.has(token)) {
      return this._keys.get(token);
    }

    let newKey = new InjectorKey(token, this.numberOfKeys);

    this._keys.set(token, newKey);

    return newKey;
  }

  get numberOfKeys(): number {
    return this._keys.size;
  }

}

const _globalKeyRegistry = new KeyRegistry();